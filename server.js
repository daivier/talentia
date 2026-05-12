// server.js — Servidor TalentAI
// Roda o sistema e faz proxy seguro para a API da Anthropic
// 
// Como usar:
// 1. Instale o Node.js em nodejs.org
// 2. Nesta pasta, rode: npm install
// 3. Crie o arquivo .env com sua chave (veja abaixo)
// 4. Rode: node server.js
// 5. Acesse: http://localhost:3000

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ── Configuração ──────────────────────────────────────────
// Crie um arquivo .env na mesma pasta com:
// ANTHROPIC_API_KEY=sk-ant-...
// PORT=3000 (opcional)
// ──────────────────────────────────────────────────────────

// Lê o .env manualmente (sem dependências extras)
function loadEnv() {
  try {
    var lines = fs.readFileSync('.env', 'utf8').split('\n');
    lines.forEach(line => {
      var [key, ...val] = line.split('=');
      if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
  } catch(e) {
    // .env não encontrado — usa variáveis de ambiente do sistema
  }
}
loadEnv();

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

if (!ANTHROPIC_KEY) {
  console.warn('\n⚠️  AVISO: ANTHROPIC_API_KEY não encontrada.');
  console.warn('   Crie o arquivo .env com: ANTHROPIC_API_KEY=sk-ant-...\n');
}

// ── MIME types ────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

// ── Servidor ──────────────────────────────────────────────
const server = http.createServer((req, res) => {
  var parsed = url.parse(req.url, true);
  var pathname = parsed.pathname;

  // CORS para desenvolvimento local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── Proxy para Anthropic API ──────────────────────────
  if (pathname === '/api/ai' && req.method === 'POST') {
    if (!ANTHROPIC_KEY) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'ANTHROPIC_API_KEY não configurada. Adicione ao arquivo .env'}));
      return;
    }

    var body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('AI request received, key starts with:', ANTHROPIC_KEY.substring(0, 15) + '...');
      var options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        }
      };

      var proxyReq = https.request(options, proxyRes => {
        var data = '';
        proxyRes.on('data', chunk => data += chunk);
        proxyRes.on('end', () => {
          console.log('Anthropic status:', proxyRes.statusCode);
          if (proxyRes.statusCode !== 200) {
            console.log('Anthropic error body:', data);
          }
          res.writeHead(proxyRes.statusCode, {'Content-Type': 'application/json'});
          res.end(data);
        });
      });

      proxyReq.on('error', err => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Erro ao conectar com a API: ' + err.message}));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  // ── Arquivos estáticos ────────────────────────────────
  var filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(__dirname, 'TalentAI_Supabase.html');
  } else {
    filePath = path.join(__dirname, pathname);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Se não achar o arquivo, serve o HTML principal
      fs.readFile(path.join(__dirname, 'TalentAI_Supabase.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.end('Arquivo TalentAI_Supabase.html não encontrado na mesma pasta que server.js');
          return;
        }
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(data2);
      });
      return;
    }
    var ext = path.extname(filePath);
    res.writeHead(200, {'Content-Type': MIME[ext] || 'text/plain'});
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n✅ TalentAI rodando!');
  console.log(`   Acesse: http://localhost:${PORT}`);
  console.log(`   API Key: ${ANTHROPIC_KEY ? '✓ Configurada' : '✗ Não configurada (veja .env)'}`);
  console.log('\n   Para parar o servidor: Ctrl+C\n');
});
