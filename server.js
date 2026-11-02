import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const publicFiles = new Set(['index.html', 'app.js', 'geometry.js', 'styles.css']);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = pathname === '/' ? 'index.html' : pathname.slice(1);
  if (!publicFiles.has(file)) { response.writeHead(404); response.end('Not found'); return; }
  try {
    const body = await readFile(path.join(root, file));
    response.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-cache' });
    response.end(body);
  } catch { response.writeHead(500); response.end('Unable to read file'); }
});
server.listen(Number(process.env.PORT || 5173), '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${server.address().port}`));
