// POST /api/remove — delete or hide an exam
const fs = require('fs');
const path = require('path');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '6769';

module.exports = async (req, res) => {
  const { password, id } = req.body;
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'סיסמה שגויה' });
  }
  
  if (!id) {
    return res.status(400).json({ ok: false, error: 'חסר ID' });
  }
  
  try {
    const catalogPath = path.join(__dirname, '..', 'data', 'catalog.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    
    const idx = catalog.items.findIndex(i => i.id === id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'פריט לא נמצא' });
    }
    
    const item = catalog.items[idx];
    
    // Built-in: hide. Uploaded: delete.
    if (item.builtin) {
      item.status = 'empty';
      delete item.url;
    } else {
      catalog.items.splice(idx, 1);
    }
    
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
