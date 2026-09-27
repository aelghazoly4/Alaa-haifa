function json(res, status, body) {
  res.status(status).setHeader('Cache-Control', 'no-store');
  res.json(body);
}

// Vercel parses JSON bodies for us; fall back to manual parsing if it arrives as a string.
function bodyOf(req) {
  const b = req.body;
  if (b && typeof b === 'object') return b;
  if (typeof b === 'string') {
    try { return JSON.parse(b); } catch (e) { return {}; }
  }
  return {};
}

module.exports = { json, bodyOf };
