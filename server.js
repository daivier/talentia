// server.js — Servidor TalentAI
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

function loadEnv() {
  try {
    var lines = fs.readFileSync('.env', 'utf8').split('\n');
    lines.forEach(line => {
      var [key, ...val] = line.split('=');
      if (key && val.length) process.env[key.trim()] = val.join('=').trim();
    });
  } catch(e) {}
}
loadEnv();

const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

// ── Configuração de e-mail SMTP ───────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true para porta 465

if (!ANTHROPIC_KEY) console.warn('\n⚠️  ANTHROPIC_API_KEY não encontrada.\n');
if (!SMTP_HOST) console.warn('⚠️  SMTP_HOST não configurado. E-mails desativados.\n');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

// ── Envio de e-mail via SMTP (sem dependências externas) ──
function sendEmail(to, subject, body) {
  return new Promise((resolve, reject) => {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return reject(new Error('SMTP não configurado'));
    }

    const net = SMTP_SECURE ? require('tls') : require('net');
    const socket = net.connect(SMTP_PORT, SMTP_HOST);
    let buffer = '';
    let step = 0;

    // Codifica base64
    const b64 = (s) => Buffer.from(s).toString('base64');

    // Corpo do e-mail em HTML
    const boundary = 'boundary_' + Date.now();
    const emailBody = [
      `From: TalentAI <${SMTP_FROM}>`,
      `To: ${to}`,
      `Subject: =?UTF-8?B?${b64(subject)}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      ``,
      `--${boundary}`,
      `Content-Type: text/plain; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(body.replace(/<[^>]+>/g, '')),
      ``,
      `--${boundary}`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: base64`,
      ``,
      b64(`<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#1a56a0;padding:20px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="color:#fff;margin:0">TalentAI</h2>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
          ${body.replace(/\n/g,'<br>')}
        </div>
        <p style="text-align:center;font-size:11px;color:#999;margin-top:16px">
          Este e-mail foi enviado automaticamente pelo sistema TalentAI.<br>
          Por favor não responda diretamente a este e-mail.
        </p>
      </body></html>`),
      ``,
      `--${boundary}--`,
    ].join('\r\n');

    const commands = [
      `EHLO talentai\r\n`,
      `AUTH LOGIN\r\n`,
      b64(SMTP_USER) + '\r\n',
      b64(SMTP_PASS) + '\r\n',
      `MAIL FROM:<${SMTP_FROM}>\r\n`,
      `RCPT TO:<${to}>\r\n`,
      `DATA\r\n`,
      emailBody + '\r\n.\r\n',
      `QUIT\r\n`,
    ];

    socket.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\r\n');
      buffer = lines.pop();

      for (const line of lines) {
        console.log('SMTP <', line);
        const code = parseInt(line.substring(0, 3));

        if (line.includes('-')) continue; // multi-line response

        if (code === 220 && step === 0) { socket.write(commands[step++]); }
        else if ((code === 250 || code === 220) && step === 1) { socket.write(commands[step++]); }
        else if (code === 334 && step === 2) { socket.write(commands[step++]); }
        else if (code === 334 && step === 3) { socket.write(commands[step++]); }
        else if (code === 235 && step === 4) { socket.write(commands[step++]); }
        else if (code === 250 && step === 5) { socket.write(commands[step++]); }
        else if (code === 250 && step === 6) { socket.write(commands[step++]); }
        else if (code === 354 && step === 7) { socket.write(commands[step++]); }
        else if (code === 250 && step === 8) { socket.write(commands[step++]); resolve({ success: true }); }
        else if (code === 221) { socket.destroy(); }
        else if (code >= 400) { socket.destroy(); reject(new Error(`SMTP erro ${code}: ${line}`)); }
      }
    });

    socket.on('error', reject);
    socket.on('timeout', () => { socket.destroy(); reject(new Error('SMTP timeout')); });
    socket.setTimeout(15000);
  });
}

// ── Substitui variáveis no template ──────────────────────
function renderTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) => vars[key] || match);
}

// ── Servidor ──────────────────────────────────────────────
const server = http.createServer((req, res) => {
  var parsed = url.parse(req.url, true);
  var pathname = parsed.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── Proxy Anthropic ────────────────────────────────────
  if (pathname === '/api/ai' && req.method === 'POST') {
    if (!ANTHROPIC_KEY) {
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'ANTHROPIC_API_KEY não configurada'}));
      return;
    }
    var body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      console.log('AI request, key:', ANTHROPIC_KEY.substring(0, 15) + '...');
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
          if (proxyRes.statusCode !== 200) console.log('Anthropic error:', data);
          res.writeHead(proxyRes.statusCode, {'Content-Type': 'application/json'});
          res.end(data);
        });
      });
      proxyReq.on('error', err => {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: err.message}));
      });
      proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  // ── Envio de e-mail ────────────────────────────────────
  if (pathname === '/api/email' && req.method === 'POST') {
    var body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        var { to, subject, content, vars } = JSON.parse(body);
        if (!to || !subject || !content) throw new Error('Campos obrigatórios: to, subject, content');

        // Substitui variáveis se fornecidas
        var finalSubject = vars ? renderTemplate(subject, vars) : subject;
        var finalContent = vars ? renderTemplate(content, vars) : content;

        await sendEmail(to, finalSubject, finalContent);
        console.log(`E-mail enviado para ${to}: ${finalSubject}`);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true, message: `E-mail enviado para ${to}`}));
      } catch(e) {
        console.error('Erro ao enviar e-mail:', e.message);
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: e.message}));
      }
    });
    return;
  }

  // ── Teste de e-mail ────────────────────────────────────
  if (pathname === '/api/email/test' && req.method === 'POST') {
    var body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        var { to } = JSON.parse(body);
        await sendEmail(
          to || SMTP_USER,
          'TalentAI — Teste de e-mail',
          'Olá!\n\nSe você recebeu este e-mail, o sistema de envio está funcionando corretamente.\n\nAtenciosamente,\nTalentAI'
        );
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({success: true}));
      } catch(e) {
        res.writeHead(500, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: e.message}));
      }
    });
    return;
  }

  // ── Arquivos estáticos ────────────────────────────────
  var filePath;
  if (pathname === '/' || pathname === '/index.html') {
      // Se vier do subdomínio vagas, serve o portal
      var host = req.headers.host || '';
      if (host.includes('vagas.')) {
          filePath = path.join(__dirname, 'portal_candidato.html');
      } else {
          filePath = path.join(__dirname, 'TalentAI_Supabase.html');
      }
  } else if (pathname === '/portal' || pathname === '/portal/') {
      filePath = path.join(__dirname, 'portal_candidato.html');
  } else {
      filePath = path.join(__dirname, pathname);
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(__dirname, 'TalentAI_Supabase.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Arquivo não encontrado'); return; }
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
  console.log(`   IA: ${ANTHROPIC_KEY ? '✓' : '✗ não configurada'}`);
  console.log(`   SMTP: ${SMTP_HOST ? '✓ ' + SMTP_HOST : '✗ não configurado'}`);
  console.log('\n   Ctrl+C para parar\n');
});
// Roda o sistema e faz proxy seguro para a API da Anthropic
// 
// Como usar:
// 1. Instale o Node.js em nodejs.org
// 2. Nesta pasta, rode: npm install
// 3. Crie o arquivo .env com sua chave (veja abaixo)
// 4. Rode: node server.js
// 5. Acesse: http://localhost:3000

