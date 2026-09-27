// Shared helper: the admin page's state lives in one small JSON file in Vercel Blob.
// { items: [...uploaded exams...], hidden: [...ids of built-in rows to hide...] }
const { list, put } = require('@vercel/blob');

const OVERRIDES = 'catalog-overrides.json';
const EMPTY = { items: [], hidden: [] };

async function readOverrides() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { ...EMPTY };
  const { blobs } = await list({ prefix: OVERRIDES });
  const hit = blobs.find(b => b.pathname === OVERRIDES);
  if (!hit) return { ...EMPTY };
  const r = await fetch(hit.url + '?t=' + Date.now()); // skip the CDN copy
  if (!r.ok) return { ...EMPTY };
  const j = await r.json();
  return { items: Array.isArray(j.items) ? j.items : [], hidden: Array.isArray(j.hidden) ? j.hidden : [] };
}

async function writeOverrides(ov) {
  await put(OVERRIDES, JSON.stringify(ov), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

// Shared password check. Returns an error string, or null when the request may proceed.
function checkPassword(body) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return 'לא הוגדרה סיסמת ניהול בשרת. הוסיפו ADMIN_PASSWORD ב-Vercel תחת Settings → Environment Variables, ואז Redeploy.';
  if (!body || body.password !== expected) return 'סיסמה שגויה';
  return null;
}

module.exports = { readOverrides, writeOverrides, checkPassword, OVERRIDES };
