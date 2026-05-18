// server.js — Servidor TalentAI
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
// ── Envio de e-mail via Nodemailer ──────────────────────
const nodemailer = require('nodemailer');

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
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
const EMPRESA_ID = process.env.EMPRESA_ID || 'a0000000-0000-0000-0000-000000000001';

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

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendEmail(to, subject, body) {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP não configurado');
  }
  var info = await transporter.sendMail({
    from: `TalentAI RH <${SMTP_FROM}>`,
    to: to,
    subject: subject,
    text: body.replace(/<[^>]+>/g, ''),
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#1a56a0;padding:20px;border-radius:8px 8px 0 0;text-align:center">
        <h2 style="color:#fff;margin:0">TalentAI</h2>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e0e0e0;border-top:none;border-radius:0 0 8px 8px">
        ${body.replace(/\n/g,'<br>')}
      </div>
      <p style="text-align:center;font-size:11px;color:#999;margin-top:16px">
        E-mail automático do sistema TalentAI — não responda este e-mail.
      </p>
    </body></html>`
  });
  return { success: true, messageId: info.messageId };
}

// ── Substitui variáveis no template ──────────────────────
function renderTemplate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in vars) ? (vars[key] ?? '') : match);
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

        // Converte \n literal (do banco) e newlines reais em quebras de linha
        finalContent = finalContent.replace(/\\n/g, '\n');
        finalSubject = finalSubject.replace(/\\n/g, ' ');

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
  if (SUPABASE_URL && SUPABASE_KEY) iniciarLembretes();
});

// ── Lembrete de entrevista (cron a cada hora) ─────────────
function supabaseGet(path) {
  return new Promise((resolve, reject) => {
    var options = {
      hostname: SUPABASE_URL.replace('https://','').replace('http://',''),
      path,
      method: 'GET',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    };
    var req = https.request(options, res => {
      var data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function verificarLembretes() {
  if (!SMTP_HOST) return;
  try {
    var agora = new Date();
    var em24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    var agoraISO = agora.toISOString();
    var em24hISO = em24h.toISOString();

    // Busca entrevistas nas próximas 24h ainda não lembradas
    var entrevistas = await supabaseGet(
      `/rest/v1/entrevistas?select=id,data_hora,link_video,candidaturas(candidatos(nome,email),vagas(titulo))&data_hora=gte.${agoraISO}&data_hora=lte.${em24hISO}&lembrete_enviado=is.null&status=eq.agendada`
    );

    for (var ent of (entrevistas || [])) {
      var cand = ent.candidaturas?.candidatos;
      var vaga = ent.candidaturas?.vagas;
      if (!cand?.email) continue;

      // Busca template de lembrete
      var tpls = await supabaseGet(
        `/rest/v1/email_templates?select=assunto,corpo&empresa_id=eq.${EMPRESA_ID}&gatilho=eq.lembrete_entrevista&ativo=is.true`
      );
      if (!tpls?.length) continue;
      var tpl = tpls[0];

      var dataHora = new Date(ent.data_hora);
      var vars = {
        nome: cand.nome,
        cargo: vaga?.titulo || '',
        data: dataHora.toLocaleDateString('pt-BR'),
        hora: dataHora.toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'}),
        link_agenda: ent.link_video || ''
      };

      var subject = renderTemplate(tpl.assunto, vars).replace(/\\n/g,' ');
      var body = renderTemplate(tpl.corpo, vars).replace(/\\n/g,'\n');
      await sendEmail(cand.email, subject, body);

      // Marca como lembrete enviado
      await new Promise((resolve, reject) => {
        var patch = JSON.stringify({lembrete_enviado: new Date().toISOString()});
        var opts = {
          hostname: SUPABASE_URL.replace('https://','').replace('http://',''),
          path: `/rest/v1/entrevistas?id=eq.${ent.id}`,
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(patch) }
        };
        var r = https.request(opts, res => { res.on('data',()=>{}); res.on('end', resolve); });
        r.on('error', reject);
        r.write(patch);
        r.end();
      });

      console.log(`Lembrete enviado para ${cand.email} — ${vaga?.titulo}`);
    }
  } catch(e) { console.warn('Erro ao verificar lembretes:', e.message); }
}

function iniciarLembretes() {
  verificarLembretes();
  setInterval(verificarLembretes, 60 * 60 * 1000); // a cada hora
  console.log('   Lembretes: ✓ verificando a cada hora\n');
}
// Roda o sistema e faz proxy seguro para a API da Anthropic
// 
// Como usar:
// 1. Instale o Node.js em nodejs.org
// 2. Nesta pasta, rode: npm install
// 3. Crie o arquivo .env com sua chave (veja abaixo)
// 4. Rode: node server.js
// 5. Acesse: http://localhost:3000

