// Rebuilds /exams/*.html from /source/exams/*.html through lib/transform.js.
// Run: node scripts/build-exams.js
const fs = require('fs');
const path = require('path');
const { transform } = require('../lib/transform');

const src = path.join(__dirname, '..', 'source', 'exams');
const out = path.join(__dirname, '..', 'exams');
fs.mkdirSync(out, { recursive: true });
let n = 0;
for (const f of fs.readdirSync(src)) {
  if (!f.endsWith('.html')) continue;
  const html = fs.readFileSync(path.join(src, f), 'utf8');
  const ov = path.join(__dirname, '..', 'source', 'overrides', f.replace(/\.html$/, '.css'));
  const extraCss = fs.existsSync(ov) ? fs.readFileSync(ov, 'utf8') : '';
  fs.writeFileSync(path.join(out, f), transform(html, { base: '../', extraCss }));
  n++;
}
console.log(`built ${n} pages → exams/`);
