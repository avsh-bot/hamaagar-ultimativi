// POST /api/upload — store an exam's HTML in Vercel Blob and add it to the catalog.
const { put } = require('@vercel/blob');
const { readOverrides, writeOverrides, checkPassword } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method not allowed' });

  const bad = checkPassword(req.body);
  if (bad) return res.status(bad === 'סיסמה שגויה' ? 401 : 500).json({ ok: false, error: bad });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({ ok: false, error: 'אין Blob store מחובר לפרויקט. ב-Vercel: Storage → Create → Blob, לחבר לפרויקט, ואז Redeploy.' });
  }

  const { year, sem, subject, name, type, status, html } = req.body || {};
  if (!subject || !name || !html) return res.status(400).json({ ok: false, error: 'חסר נושא, שם או קובץ' });
  if (!['year1', 'year2', 'year3'].includes(year)) return res.status(400).json({ ok: false, error: 'שנה לא תקינה' });
  if (+sem !== 1 && +sem !== 2) return res.status(400).json({ ok: false, error: 'סמסטר לא תקין' });

  try {
    const id = 'u' + Date.now().toString(36);
    const { url } = await put(`exams/${id}.html`, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    const ov = await readOverrides();
    ov.items.push({
      id, year, sem: +sem,
      subject: String(subject).trim(),
      name: String(name).trim(),
      type: type === 'סיכום' ? 'סיכום' : 'מבחן',
      status: status === 'pending' ? 'pending' : 'ready',
      url, builtin: false,
    });
    await writeOverrides(ov);

    res.json({ ok: true, id, url });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'שגיאה בשמירה: ' + (e.message || e) });
  }
};
