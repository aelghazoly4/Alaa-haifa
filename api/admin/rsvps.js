const { ObjectId } = require('mongodb');
const { rsvps } = require('../../lib/db');
const { isAuthed } = require('../../lib/auth');
const { json } = require('../../lib/http');

// Protected: list responses (GET) and delete one (DELETE ?id=...).
module.exports = async (req, res) => {
  try {
    if (!isAuthed(req)) return json(res, 401, { ok: false, error: 'unauthorized' });
    const col = await rsvps();

    if (req.method === 'GET') {
      const docs = await col.find({}).sort({ createdAt: -1 }).limit(2000).toArray();
      const items = docs.map((d) => ({
        id: String(d._id),
        name: d.name,
        attending: d.attending,
        message: d.message || '',
        createdAt: d.createdAt,
      }));
      const stats = {
        total: items.length,
        yes: items.filter((i) => i.attending === 'yes').length,
        no: items.filter((i) => i.attending === 'no').length,
        withMessage: items.filter((i) => i.message).length,
      };
      return json(res, 200, { ok: true, stats, items });
    }

    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '');
      if (!ObjectId.isValid(id)) return json(res, 400, { ok: false, error: 'invalid_id' });
      await col.deleteOne({ _id: new ObjectId(id) });
      return json(res, 200, { ok: true });
    }

    res.setHeader('Allow', 'GET, DELETE');
    return json(res, 405, { ok: false });
  } catch (err) {
    console.error('admin rsvps failed:', err);
    return json(res, 500, { ok: false, error: 'server_error' });
  }
};
