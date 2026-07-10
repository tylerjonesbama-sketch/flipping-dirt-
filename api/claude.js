// /api/claude — Vercel serverless proxy to the Anthropic API.
// Keeps your API key on the server (never in the browser).
// Requires env var ANTHROPIC_API_KEY set in Vercel → Project → Settings → Environment Variables.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: { message: "Method not allowed — use POST" } });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: { message: "ANTHROPIC_API_KEY is not set. Add it in Vercel → Settings → Environment Variables, then redeploy." },
    });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: { message: "Proxy error: " + (err.message || "unknown") } });
  }
}
