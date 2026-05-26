const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.PORT ? 'localhost' : '0.0.0.0';

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`NEXUS-MD website running on http://${HOST}:${PORT}`);
});
