const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const HEROKU_API = 'https://api.heroku.com';
const HEROKU_HEADERS = (key) => ({
  'Authorization': `Bearer ${key}`,
  'Accept': 'application/vnd.heroku+json; version=3',
  'Content-Type': 'application/json',
});

async function herokuGet(path, apiKey) {
  const res = await fetch(`${HEROKU_API}${path}`, {
    headers: HEROKU_HEADERS(apiKey),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function herokuPost(path, apiKey, body) {
  const res = await fetch(`${HEROKU_API}${path}`, {
    method: 'POST',
    headers: HEROKU_HEADERS(apiKey),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function herokuPatch(path, apiKey, body) {
  const res = await fetch(`${HEROKU_API}${path}`, {
    method: 'PATCH',
    headers: HEROKU_HEADERS(apiKey),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

app.post('/api/heroku/connect', async (req, res) => {
  const { apiKey } = req.body || {};
  if (!apiKey) return res.status(400).json({ error: 'API key is required.' });

  try {
    const [accountRes, appsRes] = await Promise.all([
      herokuGet('/account', apiKey),
      herokuGet('/apps', apiKey),
    ]);

    if (!accountRes.ok) {
      return res.status(401).json({ error: 'Invalid Heroku API key. Please check and try again.' });
    }

    const account = accountRes.data;
    const apps = appsRes.ok ? appsRes.data : [];

    res.json({
      account: {
        name: account.name || account.email,
        email: account.email,
      },
      apps: apps.map(a => ({ name: a.name, id: a.id, webUrl: a.web_url })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to connect to Heroku. Check your network and try again.' });
  }
});

app.post('/api/heroku/config-vars', async (req, res) => {
  const { apiKey, appName } = req.body || {};
  if (!apiKey || !appName) return res.status(400).json({ error: 'API key and app name are required.' });

  try {
    const r = await herokuGet(`/apps/${appName}/config-vars`, apiKey);
    if (!r.ok) return res.status(r.status).json({ error: 'Could not fetch config vars for this app.' });
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch config vars.' });
  }
});

app.post('/api/heroku/deploy', async (req, res) => {
  const { apiKey, appName, sessionId, adminNumbers } = req.body || {};
  if (!apiKey || !sessionId) return res.status(400).json({ error: 'API key and Session ID are required.' });

  const REPO_TARBALL = 'https://github.com/ignatiusmkuu-spec/IgniteBot/archive/refs/heads/main.tar.gz';

  try {
    let targetApp = appName;

    if (!targetApp) {
      const createRes = await herokuPost('/apps', apiKey, {});
      if (!createRes.ok) {
        return res.status(createRes.status).json({ error: createRes.data.message || 'Failed to create Heroku app.' });
      }
      targetApp = createRes.data.name;
    }

    const configVars = { SESSION_ID: sessionId };
    if (adminNumbers) configVars.ADMIN_NUMBERS = adminNumbers;

    const configRes = await herokuPatch(`/apps/${targetApp}/config-vars`, apiKey, configVars);
    if (!configRes.ok) {
      return res.status(configRes.status).json({ error: 'Failed to set config vars.' });
    }

    const buildRes = await herokuPost(`/apps/${targetApp}/builds`, apiKey, {
      source_blob: { url: REPO_TARBALL, version: 'main' },
    });

    if (!buildRes.ok) {
      return res.status(buildRes.status).json({
        error: buildRes.data.message || 'Failed to trigger build.',
        appName: targetApp,
      });
    }

    res.json({
      appName: targetApp,
      buildId: buildRes.data.id,
      buildStatus: buildRes.data.status,
      outputStreamUrl: buildRes.data.output_stream_url,
      appUrl: `https://${targetApp}.herokuapp.com`,
      dashboardUrl: `https://dashboard.heroku.com/apps/${targetApp}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Deployment failed. Please try again.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NEXUS-MD website running on http://0.0.0.0:${PORT}`);
});
