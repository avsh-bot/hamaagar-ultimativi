// GET /api/exam?id=... — serves an uploaded exam from Blob storage on our own domain,
// as a normal HTML page, so it opens in the same tab like every other exam.
const { readOverrides } = require('./_store');

module.exports = async (req, res) => {
  try {
    const id = String((req.query && req.query.id) || '');
    const ov = await readOverrides();
    const item = (ov.items || []).find(x => x.id === id && x.url); // only exams that exist in the catalog
    if (!item) return res.status(404).send('המבחן לא נמצא');
    const r = await fetch(item.url);
    if (!r.ok) return res.status(502).send('שגיאה בטעינת המבחן');
    const html = await r.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).send(html);
  } catch (e) {
    res.status(500).send('שגיאה: ' + (e.message || e));
  }
};
