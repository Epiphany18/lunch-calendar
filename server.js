const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'approve.json');
const HTML = path.join(__dirname, 'index.html');

function load() {
  try { return JSON.parse(fs.readFileSync(DATA, 'utf8')); }
  catch (e) { return { approved: {}, status: {} }; }
}
function save(o) { fs.writeFileSync(DATA, JSON.stringify(o, null, 2)); }

const server = http.createServer((req, res) => {
  // 读取全部状态（跨设备共享）
  if (req.url === '/api/state' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(load()));
    return;
  }
  // 写入审批/状态，type: approve|status
  if (req.url === '/api/approve' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const d = JSON.parse(body || '{}');
        const o = load();
        if (typeof d.key === 'string') {
          if (d.type === 'approve') o.approved[d.key] = !!d.value;
          else if (d.type === 'status') o.status[d.key] = d.value || 'normal';
        }
        save(o);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(o));
      } catch (e) { res.statusCode = 400; res.end('bad request'); }
    });
    return;
  }
  // 其余 GET 统一返回网页
  if (req.method === 'GET') {
    fs.readFile(HTML, (err, data) => {
      if (err) { res.statusCode = 404; res.end('not found'); return; }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(data);
    });
    return;
  }
  res.statusCode = 404; res.end('not found');
});

server.listen(PORT, () => console.log('lunch-calendar server listening on ' + PORT));
