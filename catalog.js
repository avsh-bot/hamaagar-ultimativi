// GET /api/catalog
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  const catalogPath = path.join(__dirname, '..', 'data', 'catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  
  res.json({ items: catalog.items, hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN });
};
