// POST /api/remove — delete an uploaded exam, or hide a built-in row.
const { del } = require('@vercel/blob');
const { readOverrides, writeOverrides, checkPassword } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method not allowed' });

  const bad = checkPassword(req.body);
  if (bad) return res.status(bad === 'סיסמה שגויה' ? 401 : 500).json({ ok: false, error: bad });

  const id = req.body && req.body.id;
  // the admin page probes this endpoint with a dummy id to verify the password
  if (!id || id === '__login_check__') return res.json({ ok: true, check: true });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ ok: false, error: 'אין Blob store מחובר לפרויקט.' });
  }

  try {
    const ov = await readOverrides();
    const i = ov.items.findIndex(x => x.id === id);

    if (i >= 0) {
      const item = ov.items[i];
      if (item.url) { try { await del(item.url); } catch (e) { /* file already gone — carry on */ } }
      ov.items.splice(i, 1);
    } else if (!ov.hidden.includes(id)) {
      ov.hidden.push(id);
    }

    await writeOverrides(ov);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'שגיאה במחיקה: ' + (e.message || e) });
  }
};
