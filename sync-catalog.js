// Single source of truth: data/catalog.json → the BUILTIN line inside index.html.
// Run after every manual edit to the catalog:  node scripts/sync-catalog.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'data', 'catalog.json');
const indexPath = path.join(root, 'index.html');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// --- validation: catch mistakes before they reach the site -------------------
const seen = new Set();
const problems = [];
catalog.items.forEach((i, n) => {
  const where = `פריט ${n + 1} (${i.name || 'ללא שם'})`;
  if (!i.id) problems.push(`${where}: חסר id`);
  else if (seen.has(i.id)) problems.push(`${where}: id כפול — ${i.id}`);
  else seen.add(i.id);
  if (!i.subject) problems.push(`${where}: חסר נושא`);
  if (!i.name) problems.push(`${where}: חסר שם`);
  if (!catalog.years[i.year]) problems.push(`${where}: שנה לא מוכרת — ${i.year}`);
  if (i.sem !== 1 && i.sem !== 2) problems.push(`${where}: סמסטר חייב להיות 1 או 2`);
  if (!['ready', 'pending', 'empty'].includes(i.status)) problems.push(`${where}: מצב לא מוכר — ${i.status}`);
  if (i.status !== 'empty' && !i.url) problems.push(`${where}: מסומן כזמין אבל אין לו קובץ`);
  if (i.url && !fs.existsSync(path.join(root, i.url))) problems.push(`${where}: הקובץ ${i.url} לא קיים`);
});
if (problems.length) {
  console.error('הקטלוג לא תקין:\n- ' + problems.join('\n- '));
  process.exit(1);
}

// --- inject -----------------------------------------------------------------
const html = fs.readFileSync(indexPath, 'utf8');
const line = 'const BUILTIN = ' + JSON.stringify(catalog) + ';';
const next = html.replace(/^const BUILTIN = .*$/m, () => line);
if (next === html) { console.error('לא נמצאה שורת BUILTIN ב-index.html'); process.exit(1); }
fs.writeFileSync(indexPath, next);

const open = catalog.items.filter(i => i.status !== 'empty').length;
console.log(`סונכרן: ${catalog.items.length} פריטים בקטלוג, מתוכם ${open} עם מבחן בפועל.`);
