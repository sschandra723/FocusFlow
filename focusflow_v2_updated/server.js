/**
 * FocusFlow — HTTPS Local Server
 * Runs on https://localhost:3000
 * Handles Spotify PKCE token exchange proxy (avoids CORS)
 * 
 * FIRST TIME ONLY: You'll see a browser warning "Not secure / Certificate error"
 * Just click "Advanced" → "Proceed to localhost" — it's safe, it's your own server.
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html':'text/html', '.css':'text/css', '.js':'application/javascript',
  '.mp3':'audio/mpeg', '.svg':'image/svg+xml', '.png':'image/png',
  '.ico':'image/x-icon', '.json':'application/json', '.md':'text/plain'
};

function handleRequest(req, res) {
  const parsed = url.parse(req.url, true);

  // CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Spotify token proxy ──
  if (parsed.pathname === '/spotify-token' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      const opts = {
        hostname: 'accounts.spotify.com', path: '/api/token', method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
      };
      const pr = https.request(opts, pres => {
        let data = '';
        pres.on('data', d => data += d);
        pres.on('end', () => { res.writeHead(pres.statusCode, {'Content-Type':'application/json'}); res.end(data); });
      });
      pr.on('error', e => { res.writeHead(500); res.end(JSON.stringify({error:e.message})); });
      pr.write(body); pr.end();
    });
    return;
  }

  // ── Static files ──
  let filePath = parsed.pathname === '/' ? path.join(ROOT,'index.html') : path.join(ROOT, parsed.pathname);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }

  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + parsed.pathname); return; }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.mp3' ? 'public,max-age=86400' : 'no-cache'
    });
    res.end(data);
  });
}

// Try HTTPS first (needed for Spotify), fall back to HTTP
let sslOpts;
try {
  sslOpts = { key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem') };
} catch(e) { sslOpts = null; }

if (sslOpts) {
  https.createServer(sslOpts, handleRequest).listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║  FocusFlow is running on HTTPS!                  ║');
    console.log('║                                                  ║');
    console.log('║  👉 Open: https://localhost:3000                 ║');
    console.log('║                                                  ║');
    console.log('║  ⚠️  First time: browser shows certificate        ║');
    console.log('║     warning — click Advanced → Proceed           ║');
    console.log('║                                                  ║');
    console.log('║  Spotify Redirect URI to use in Dashboard:       ║');
    console.log('║  👉 https://localhost:3000/                      ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
    const { exec } = require('child_process');
    const cmd = process.platform==='win32'?'start':'open';
    exec(`${cmd} https://localhost:3000`);
  });
} else {
  // No cert — fall back to plain HTTP
  http.createServer(handleRequest).listen(PORT, () => {
    console.log('\nFocusFlow running at http://localhost:' + PORT);
    const { exec } = require('child_process');
    exec((process.platform==='win32'?'start':'open')+' http://localhost:'+PORT);
  });
}
