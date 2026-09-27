const { checkPassword, createToken, sessionCookie } = require('../../lib/auth');
const { json, bodyOf } = require('../../lib/http');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false });
  }
  try {
    const { password } = bodyOf(req);
    if (!checkPassword(password)) {
      await new Promise((r) => setTimeout(r, 700)); // slow down guessing
      return json(res, 401, { ok: false, error: 'wrong_password' });
    }
    res.setHeader('Set-Cookie', sessionCookie(createToken()));
    return json(res, 200, { ok: true });
  } catch (err) {
    console.error('login failed:', err);
    return json(res, 500, { ok: false, error: 'server_error' });
  }
};
