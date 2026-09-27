const { clearCookie } = require('../../lib/auth');
const { json } = require('../../lib/http');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', clearCookie());
  return json(res, 200, { ok: true });
};
