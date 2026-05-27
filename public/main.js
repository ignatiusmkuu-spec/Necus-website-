/* ============================
   NEXUS-MD — Main Script
   ============================ */

// ---- NAV SCROLL + FAB SHOW ----
const navbar = document.getElementById('navbar');
const fab = document.getElementById('fab');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');

  if (window.scrollY > 300) fab.classList.add('visible');
  else fab.classList.remove('visible');
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ---- STAT COUNTER ANIMATION ----
function animateCounter(el, target, suffix) {
  const dur = 1800;
  const start = performance.now();
  const update = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.floor(eased * target);
    if (t < 1) requestAnimationFrame(update);
    else el.textContent = target;
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target), '');
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .step-card, .cmd-card, .section-header').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ---- COPY CODE BUTTON ----
function copyCode(btn) {
  const code = btn.dataset.code;
  navigator.clipboard.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ---- CANVAS BACKGROUND (Hyperdrive / Grid Effect) ----
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, time = 0;
  const particles = [];
  const PARTICLE_COUNT = 80;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.z = Math.random() * 0.6 + 0.1;
      this.speed = Math.random() * 0.4 + 0.15;
      this.size = Math.random() * 1.5 + 0.4;
      this.color = Math.random() > 0.5 ? '#00ffff' : '#a855f7';
      this.alpha = Math.random() * 0.5 + 0.2;
      this.trail = [];
    }
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 12) this.trail.shift();
      this.y -= this.speed;
      this.x += Math.sin(time * 0.01 + this.z * 5) * 0.3;
      if (this.y < -10) this.reset(), this.y = H + 10;
    }
    draw() {
      ctx.save();
      for (let i = 0; i < this.trail.length; i++) {
        const a = (i / this.trail.length) * this.alpha * 0.5;
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  // Grid lines
  function drawGrid() {
    const gridSize = 80;
    const perspective = 0.0003;
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 0.5;
    const offset = (time * 0.5) % gridSize;
    for (let x = 0; x < W + gridSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x - offset % gridSize, 0);
      ctx.lineTo(x - offset % gridSize, H);
      ctx.stroke();
    }
    for (let y = 0; y < H + gridSize; y += gridSize) {
      ctx.globalAlpha = 0.02 + (y / H) * 0.04;
      ctx.beginPath();
      ctx.moveTo(0, y - offset % gridSize);
      ctx.lineTo(W, y - offset % gridSize);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Glow orbs
  function drawOrbs() {
    const orbs = [
      { x: W * 0.15, y: H * 0.3, r: 250, color: 'rgba(0,255,255,0.04)' },
      { x: W * 0.85, y: H * 0.6, r: 300, color: 'rgba(168,85,247,0.04)' },
      { x: W * 0.5, y: H * 0.85, r: 200, color: 'rgba(0,136,255,0.03)' },
    ];
    orbs.forEach(o => {
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grad.addColorStop(0, o.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    time++;
    requestAnimationFrame(loop);
  }

  loop();
})();

// ---- MUSIC PLAYER ----
(function () {
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('music-btn');
  const eq = document.getElementById('music-eq');
  const offIcon = document.getElementById('music-off-icon');
  let playing = false;

  function setPlaying(state) {
    playing = state;
    if (playing) {
      eq.style.display = 'flex';
      eq.classList.remove('paused');
      offIcon.style.display = 'none';
      audio.play().catch(() => {});
    } else {
      eq.classList.add('paused');
      offIcon.style.display = 'block';
      eq.style.display = 'none';
      audio.pause();
    }
  }

  btn.addEventListener('click', () => setPlaying(!playing));

  // Try autoplay on first user interaction with the page
  const tryAutoplay = () => {
    audio.volume = 0.4;
    audio.play().then(() => {
      playing = true;
      eq.style.display = 'flex';
      eq.classList.remove('paused');
      offIcon.style.display = 'none';
    }).catch(() => {});
    document.removeEventListener('click', tryAutoplay);
    document.removeEventListener('keydown', tryAutoplay);
    document.removeEventListener('scroll', tryAutoplay);
  };

  audio.volume = 0.4;
  // Attempt silent autoplay first (works if browser permits)
  audio.play().then(() => {
    playing = true;
    eq.style.display = 'flex';
    eq.classList.remove('paused');
    offIcon.style.display = 'none';
  }).catch(() => {
    // Blocked — wait for first interaction
    eq.classList.add('paused');
    document.addEventListener('click', tryAutoplay, { once: true });
    document.addEventListener('keydown', tryAutoplay, { once: true });
    document.addEventListener('scroll', tryAutoplay, { once: true });
  });
})();

// ---- QUICK INSTALL COPY ----
function copyQI(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#28c840" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
    }, 2000);
  });
}

// ---- GITHUB STATS TICKER ----
(async function fetchGitHubStats() {
  try {
    const res = await fetch('https://api.github.com/repos/ignatiusmkuu-spec/IgniteBot');
    if (!res.ok) return;
    const data = await res.json();
    const stars = data.stargazers_count?.toLocaleString() ?? '—';
    const forks = data.forks_count?.toLocaleString() ?? '—';
    const watchers = data.subscribers_count?.toLocaleString() ?? '—';

    document.getElementById('gh-stars').textContent = stars;
    document.getElementById('gh-forks').textContent = forks;
    document.getElementById('gh-watchers').textContent = watchers;

    document.querySelectorAll('.gh-stars-clone').forEach(el => el.textContent = stars);
    document.querySelectorAll('.gh-forks-clone').forEach(el => el.textContent = forks);
    document.querySelectorAll('.gh-watchers-clone').forEach(el => el.textContent = watchers);
  } catch (_) {}
})();

// ---- TERMINAL TYPEWRITER ----
(function () {
  const lines = document.querySelectorAll('#terminal-body .t-line');
  lines.forEach((line, i) => {
    line.style.opacity = '0';
    setTimeout(() => {
      line.style.transition = 'opacity 0.3s';
      line.style.opacity = '1';
    }, 300 + i * 300);
  });
})();

// ---- QUICK DEPLOY (Multi-step Heroku API) ----
const QDP = {
  apiKey: null,
  apps: [],
};

function qdpSetStatus(id, type, html) {
  const el = document.getElementById(id);
  el.className = `qdp-status ${type}`;
  el.innerHTML = html;
}

function qdpClearStatus(id) {
  const el = document.getElementById(id);
  el.className = 'qdp-status';
  el.innerHTML = '';
}

function qdpShow(id) { document.getElementById(id).classList.remove('qdp-step-hidden'); }
function qdpHide(id) { document.getElementById(id).classList.add('qdp-step-hidden'); }

function qdpToggleKey() {
  const input = document.getElementById('qdp-apikey');
  const icon = document.getElementById('qdp-eye-icon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}

async function qdpConnect() {
  const apiKey = document.getElementById('qdp-apikey').value.trim();
  if (!apiKey) {
    qdpSetStatus('qdp-status1', 'error', '⚠ Please enter your Heroku API key.');
    return;
  }

  const btn = document.getElementById('qdp-connect-btn');
  btn.disabled = true;
  qdpSetStatus('qdp-status1', 'loading', '<span class="qdp-spinner"></span> Connecting to Heroku…');

  try {
    const res = await fetch('/api/heroku/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const data = await res.json();

    if (!res.ok) {
      qdpSetStatus('qdp-status1', 'error', `⚠ ${data.error}`);
      btn.disabled = false;
      return;
    }

    QDP.apiKey = apiKey;
    QDP.apps = data.apps || [];

    const initials = (data.account.name || data.account.email || '?')[0].toUpperCase();
    document.getElementById('qdp-account-card').innerHTML = `
      <div class="qdp-account-avatar">${initials}</div>
      <div class="qdp-account-info">
        <div class="qdp-account-name">${data.account.name || 'Heroku User'}</div>
        <div class="qdp-account-email">${data.account.email}</div>
      </div>
      <div class="qdp-connected-dot"></div>
    `;

    const select = document.getElementById('qdp-app-select');
    select.innerHTML = '<option value="">— Create a new Heroku app —</option>';
    QDP.apps.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.name;
      opt.textContent = a.name;
      select.appendChild(opt);
    });

    qdpClearStatus('qdp-status1');
    qdpShow('qdp-step2');
    qdpShow('qdp-step3');
    btn.textContent = '✓ Connected';
    btn.disabled = true;
  } catch (err) {
    qdpSetStatus('qdp-status1', 'error', '⚠ Network error. Please try again.');
    btn.disabled = false;
  }
}

async function qdpAppSelected() {
  const appName = document.getElementById('qdp-app-select').value;
  const hint = document.getElementById('qdp-app-hint');
  const sessionBadge = document.getElementById('qdp-session-badge');
  const phoneBadge = document.getElementById('qdp-phone-badge');

  document.getElementById('qdp-session').value = '';
  document.getElementById('qdp-phone').value = '';
  sessionBadge.style.display = 'none';
  phoneBadge.style.display = 'none';

  if (!appName) {
    hint.textContent = 'A new app will be created automatically.';
    qdpClearStatus('qdp-status2');
    return;
  }

  hint.textContent = `Config vars will be updated on: ${appName}.`;
  qdpSetStatus('qdp-status2', 'loading', '<span class="qdp-spinner"></span> Fetching config vars…');

  try {
    const res = await fetch('/api/heroku/config-vars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: QDP.apiKey, appName }),
    });
    const vars = await res.json();

    if (!res.ok) {
      qdpSetStatus('qdp-status2', 'error', `⚠ ${vars.error}`);
      return;
    }

    if (vars.SESSION_ID) {
      document.getElementById('qdp-session').value = vars.SESSION_ID;
      sessionBadge.style.display = 'inline-flex';
    }
    if (vars.ADMIN_NUMBERS) {
      document.getElementById('qdp-phone').value = vars.ADMIN_NUMBERS;
      phoneBadge.style.display = 'inline-flex';
    }

    qdpSetStatus('qdp-status2', 'success', '✓ Config vars loaded from this app.');
  } catch (err) {
    qdpSetStatus('qdp-status2', 'error', '⚠ Could not load config vars.');
  }
}

async function qdpDeploy() {
  const sessionId = document.getElementById('qdp-session').value.trim();
  const adminNumbers = document.getElementById('qdp-phone').value.trim();
  const appName = document.getElementById('qdp-app-select').value || null;

  if (!sessionId) {
    qdpSetStatus('qdp-status3', 'error', '⚠ Session ID is required.');
    document.getElementById('qdp-session').focus();
    return;
  }

  const btn = document.getElementById('qdp-deploy-btn');
  btn.disabled = true;
  qdpSetStatus('qdp-status3', 'loading', '<span class="qdp-spinner"></span> Deploying to Heroku — this may take a moment…');

  try {
    const res = await fetch('/api/heroku/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: QDP.apiKey, appName, sessionId, adminNumbers }),
    });
    const data = await res.json();

    if (!res.ok) {
      qdpSetStatus('qdp-status3', 'error', `⚠ ${data.error}`);
      btn.disabled = false;
      return;
    }

    qdpClearStatus('qdp-status3');
    document.getElementById('qdp-result-card').innerHTML = `
      <div class="qdp-result-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Bot deployed to <strong>${data.appName}</strong>!
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted)">Build is in progress on Heroku. It usually takes 2–3 minutes to go live.</p>
      <div class="qdp-result-links">
        <a href="${data.appUrl}" target="_blank" class="btn-qdp-result primary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open App
        </a>
        <a href="${data.dashboardUrl}" target="_blank" class="btn-qdp-result ghost">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Heroku Dashboard
        </a>
      </div>
      <p class="qdp-result-note">Build ID: ${data.buildId} · Status: ${data.buildStatus}</p>
    `;

    qdpShow('qdp-step4');
  } catch (err) {
    qdpSetStatus('qdp-status3', 'error', '⚠ Network error during deployment. Please try again.');
    btn.disabled = false;
  }
}

function qdpReset() {
  QDP.apiKey = null;
  QDP.apps = [];
  document.getElementById('qdp-apikey').value = '';
  document.getElementById('qdp-apikey').type = 'password';
  document.getElementById('qdp-eye-icon').innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  document.getElementById('qdp-session').value = '';
  document.getElementById('qdp-phone').value = '';
  document.getElementById('qdp-session-badge').style.display = 'none';
  document.getElementById('qdp-phone-badge').style.display = 'none';
  document.getElementById('qdp-account-card').innerHTML = '';
  document.getElementById('qdp-result-card').innerHTML = '';
  const connectBtn = document.getElementById('qdp-connect-btn');
  connectBtn.disabled = false;
  connectBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> Connect to Heroku`;
  document.getElementById('qdp-deploy-btn').disabled = false;
  ['qdp-status1','qdp-status2','qdp-status3'].forEach(qdpClearStatus);
  qdpHide('qdp-step2');
  qdpHide('qdp-step3');
  qdpHide('qdp-step4');
}

// ---- TOOLTIP COPY URL ----
function copyTooltipUrl(btn, url) {
  navigator.clipboard.writeText(url).then(() => {
    const svg = btn.querySelector('svg');
    btn.classList.add('copied');
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = svg.outerHTML;
    }, 1800);
  });
}
