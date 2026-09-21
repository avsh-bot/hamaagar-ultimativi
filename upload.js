// POST /api/upload — upload a new exam
const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6769';

module.exports = async (req, res) => {
  const { password, year, sem, subject, name, type, status, html, restyle } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'סיסמה שגויה' });
  }
  
  if (!subject || !name || !html) {
    return res.status(400).json({ ok: false, error: 'חסרים פרטים' });
  }
  
  try {
    // Generate ID and filename
    const timestamp = Date.now();
    const id = 'u' + timestamp;
    const filename = `exam-${timestamp}.html`;
    
    let content = html;
    if (restyle && process.env.TRANSFORM_FN) {
      // Would apply transform here if available
    }
    
    // Upload to Blob
    const url = await put(filename, content, { access: 'public' });
    
    // Update catalog
    const catalogPath = path.join(__dirname, '..', 'data', 'catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    
    const item = {
      id, year, sem: +sem, subject, name, type, status,
      url: url.url,
      builtin: false
    };
    
    catalog.items.push(item);
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
    
    res.json({ ok: true, id, url: url.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
