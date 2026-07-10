# 🌿 LandFlip HQ

Personal operating system for flipping vacant land ("flip dirt, not houses"). Single-file React app, deployed on Vercel, with AI features powered by the Anthropic API.

## File structure

```
flipping-dirt-/
├── index.html        ← the entire app (React via CDN, ~1,145 lines)
├── api/
│   └── claude.js     ← serverless proxy for AI calls (keeps API key secret)
└── README.md
```

That's the whole project. No build step, no node_modules, no package.json needed.

## Modules

| Tab | What it does |
|---|---|
| 🏠 Dashboard | $75K goal tracker, YTD income, pipeline stats, available capital |
| 💰 Budget | Budget Engine — cash, reserve, committed capital, max purchase today |
| 🔍 Market Scout | AI web research on any county's land market (uses /api/claude) |
| 📊 Deal Analyzer | Offer math, Profit Simulator slider, owner-finance projections |
| ✉️ Offer Writer | AI-generated blind offer letters (uses /api/claude) |
| 📋 Pipeline | Deal stages: Lead → Offer Sent → Under Contract → Closed |
| ✅ Due Diligence | 10-point checklist per deal |

Deals and budget persist in the browser via localStorage (per device).

## Deploying

1. Push these files to GitHub (upload files — don't copy/paste large files on mobile).
2. Vercel auto-deploys on every commit to main.
3. **One-time setup for AI features:** Vercel → your project → Settings → Environment Variables → add `ANTHROPIC_API_KEY` = your key from console.anthropic.com → redeploy.

Dashboard, Budget, Deal Analyzer, Pipeline, and Due Diligence work with no API key. Market Scout and Offer Writer need the key.

## Troubleshooting

- **Black screen:** the index.html got corrupted in transfer (truncated paste or smart quotes). Re-upload the file — don't paste. File should be 1,145 lines.
- **"Research failed" in Market Scout / Offer Writer errors:** API key missing or wrong in Vercel env vars, or you deployed before adding it (redeploy after adding).
- **Deals disappeared:** localStorage is per browser/device. Data doesn't sync between phone and desktop (yet).
