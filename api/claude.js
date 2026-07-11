// /api/claude — Vercel serverless proxy to the Anthropic API.
// Keeps your API key on the server (never in the browser).
// Requires env var ANTHROPIC_API_KEY set in Vercel → Project → Settings → Environment Variables.
//
// This is a static, no-build app, so there's no way to hide a client-side
// "secret" (view-source reveals anything shipped in index.html). Instead we
// lock the proxy down to same-origin requests, cap request size/cost, and
// rate-limit by IP. This stops casual abuse (bots/scrapers that find the URL)
// but a determined attacker can still spoof headers — for stronger protection
// put the whole app behind Vercel's Deployment Protection or a login.

const ALLOWED_MODEL = "claude-sonnet-5";
const MAX_TOKENS_CAP = 3000;
const RATE_LIMIT = 30;                  // requests
const RATE_WINDOW_MS = 60 * 60 * 1000;  // per hour, per IP

// In-memory — best-effort only, resets on cold start / differs per instance.
const hits = new Map();

function isSameOrigin(req) {
  const host = req.headers.host;
  const origin = req.headers.origin || req.headers.referer;
  if (!host || !origin) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed — use POST" } });
  }

  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: { message: "Forbidden — this endpoint only serves the LandFlip HQ app." } });
  }

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: { message: "Rate limit exceeded — try again in a bit." } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: "ANTHROPIC_API_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy." },
    });
  }

  const { model, system, messages, tools, max_tokens } = req.body || {};
  if (model !== ALLOWED_MODEL || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: { message: "Invalid request." } });
  }

  const body = {
    model,
    system,
    messages,
    tools,
    max_tokens: Math.min(Number(max_tokens) || MAX_TOKENS_CAP, MAX_TOKENS_CAP),
  };

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy error: " + (err.message || "unknown") } });
  }
}
