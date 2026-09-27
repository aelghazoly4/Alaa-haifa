const { rsvps } = require('../lib/db');
const { json, bodyOf } = require('../lib/http');

// Public endpoint: the invitation form posts here.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'method_not_allowed' });
  }

  const b = bodyOf(req);

  // Honeypot: real visitors never fill this hidden field.
  if (b.website) return json(res, 200, { ok: true });

  const name = String(b.name || '').trim().replace(/\s+/g, ' ');
  const attending = b.attending === 'yes' ? 'yes' : b.attending === 'no' ? 'no' : '';
  const message = String(b.message || '').trim();

  if (name.length < 2 || name.length > 80) return json(res, 400, { ok: false, error: 'invalid_name' });
  if (!attending) return json(res, 400, { ok: false, error: 'invalid_attending' });
  if (message.length > 1000) return json(res, 400, { ok: false, error: 'message_too_long' });

  try {
    const col = await rsvps();
    await col.insertOne({
      name,
      attending,
      message,
      createdAt: new Date(),
      ua: String(req.headers['user-agent'] || '').slice(0, 200),
    });
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('rsvp insert failed:', err);
    return json(res, 500, { ok: false, error: 'server_error' });
  }
};
