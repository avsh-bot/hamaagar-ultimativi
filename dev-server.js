// Local preview without the Vercel CLI: node scripts/dev-server.js → http://localhost:3000
// Static files from the project root, /api/* through the same functions Vercel runs, uploads under .data/.
process.env.LOCAL_STORE = '1';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };

function vercelRes(res) {
  const r = { _status: 200 };
  r.status = c => { r._status = c; return r; };
  r.setHeader = (k, v) => res.setHeader(k, v);
  r.json = o => { res.writeHead(r._status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(o)); };
  r.send = s => { if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'text/plain; charset=utf-8'); res.writeHead(r._status); res.end(s); };
  return r;
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  if (u.pathname.startsWith('/api/')) {
    const fn = path.join(ROOT, 'api', u.pathname.slice(5) + '.js');
    if (!fs.existsSync(fn)) { res.writeHead(404); return res.end('no such api'); }
    let body = ''; for await (const c of req) body += c;
    const vreq = { method: req.method, headers: req.headers, query: Object.fromEntries(u.searchParams), body: body ? JSON.parse(body) : {} };
    try { await require(fn)(vreq, vercelRes(res)); } catch (e) { console.error(e); res.writeHead(500); res.end(String(e)); }
    return;
  }
  if (u.pathname.startsWith('/__blob/')) {
    const f = path.join(ROOT, '.data', u.pathname.slice(8));
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); return fs.createReadStream(f).pipe(res);
  }
  let f = path.join(ROOT, decodeURIComponent(u.pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
