# Deploy NEXUS-MD Website to Vercel

## One-click via Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. Leave all settings as default — Vercel auto-detects `vercel.json`
5. Click **Deploy**

Done! Your site will be live at `https://your-project.vercel.app`

## Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts — no extra config needed.

## Project Structure

```
nexus-website/
├── server.js        # Express server (Vercel entry point)
├── vercel.json      # Vercel config — routes all traffic to server.js
├── package.json
└── public/
    ├── index.html   # Main site
    ├── style.css
    ├── main.js
    ├── bg.jpg       # Background image
    └── bg-music.mp3 # Background music
```
