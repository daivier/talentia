const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

// Cores
const AZUL = '1a56a0';
const AZUL_ESC = '0d3d7a';
const AZUL_CL = 'e8f0fb';
const BRANCO = 'FFFFFF';
const CINZA = '6b6962';
const CINZA_CL = 'f7f6f2';
const VERDE_CL = 'e6f4dc';
const VERDE = '2d6a0f';
const AMARELO_CL = 'fdf0dc';
const VERMELHO_CL = 'fdeaea';

const W = 13.33;
const H = 7.5;

// Helper: slide de conteúdo com fundo branco
function addContentSlide(title, subtitle) {
  const slide = pptx.addSlide();
  slide.background = { color: BRANCO };
  // Barra lateral esquerda
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: H, fill: { color: AZUL }, line: { color: AZUL } });
  // Título
  slide.addText(title, {
    x: 0.3, y: 0.18, w: W - 0.4, h: 0.65,
    fontSize: 30, bold: true, color: AZUL_ESC, fontFace: 'Calibri',
    valign: 'middle'
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.3, y: 0.82, w: W - 0.4, h: 0.35,
      fontSize: 14, color: CINZA, fontFace: 'Calibri', italic: true
    });
  }
  // Linha separadora
  slide.addShape(pptx.ShapeType.line, {
    x: 0.3, y: subtitle ? 1.15 : 0.9, w: W - 0.5, h: 0,
    line: { color: AZUL_CL, width: 1.5 }
  });
  return slide;
}

// Helper: caixa de destaque
function addBox(slide, x, y, w, h, bgColor, text, titleText, fontSize = 11) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: bgColor }, line: { color: AZUL, width: 0.75 }, rectRadius: 0.08 });
  if (titleText) {
    slide.addText(titleText, { x: x + 0.1, y: y + 0.08, w: w - 0.2, h: 0.35, fontSize: 12, bold: true, color: AZUL_ESC, fontFace: 'Calibri' });
    slide.addText(text, { x: x + 0.1, y: y + 0.42, w: w - 0.2, h: h - 0.52, fontSize: fontSize, color: '333333', fontFace: 'Calibri', valign: 'top', wrap: true });
  } else {
    slide.addText(text, { x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2, fontSize: fontSize, color: '333333', fontFace: 'Calibri', valign: 'middle', wrap: true });
  }
}

// Helper: bullet list
function addBullets(slide, items, x, y, w, h, fontSize = 12) {
  const rows = items.map(t => ({ text: t, options: { bullet: { type: 'bullet', indent: 15 }, fontSize, color: '1a1917', fontFace: 'Calibri', paraSpaceAfter: 4 } }));
  slide.addText(rows, { x, y, w, h, valign: 'top' });
}

// =====================================================
// SLIDE 1 — CAPA
// =====================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: AZUL_ESC };
  // Faixa superior decorativa
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: 1.2, fill: { color: AZUL }, line: { color: AZUL } });
  // Faixa inferior
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: H - 1.1, w: W, h: 1.1, fill: { color: AZUL }, line: { color: AZUL } });
  // Título
  slide.addText('TalentAI', {
    x: 0, y: 2.2, w: W, h: 1.5,
    fontSize: 80, bold: true, color: BRANCO, fontFace: 'Calibri',
    align: 'center', valign: 'middle'
  });
  // Linha decorativa
  slide.addShape(pptx.ShapeType.line, { x: 2, y: 3.85, w: W - 4, h: 0, line: { color: BRANCO, width: 1.5 } });
  // Subtítulo
  slide.addText('Sistema Inteligente de Gestão de\nRecrutamento e Seleção', {
    x: 0, y: 4.0, w: W, h: 1.1,
    fontSize: 20, color: 'ccddf0', fontFace: 'Calibri',
    align: 'center', valign: 'middle'
  });
  // Rodapé
  slide.addText('Documento interno — RH', {
    x: 0, y: H - 0.85, w: W, h: 0.6,
    fontSize: 12, color: 'aaccee', fontFace: 'Calibri',
    align: 'center', valign: 'middle'
  });
}

// =====================================================
// SLIDE 2 — VISÃO GERAL
// =====================================================
{
  const slide = addContentSlide('O que é o TalentAI?');
  slide.addText(
    'O TalentAI é uma plataforma completa de recrutamento e seleção que combina inteligência artificial com gestão de candidatos, vagas e comunicação. Desenvolvido para otimizar todo o ciclo de contratação — da publicação da vaga até a contratação.',
    { x: 0.3, y: 0.95, w: W - 0.5, h: 0.75, fontSize: 13, color: '333333', fontFace: 'Calibri', wrap: true }
  );
  const caixas = [
    { t: 'Inteligência Artificial', c: 'Score automático, triagem automática, geração de descrições de vagas e assistente IA.' },
    { t: 'Comunicação Automatizada', c: '6 gatilhos de e-mail automático em momentos-chave do processo seletivo.' },
    { t: 'Gestão Completa', c: 'Pipeline visual, vagas, candidatos, entrevistas, ofertas e relatórios integrados.' },
  ];
  caixas.forEach((c, i) => {
    const x = 0.3 + i * 4.3;
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.9, w: 4.1, h: 2.5, fill: { color: AZUL_CL }, line: { color: AZUL, width: 1 }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.9, w: 4.1, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y: 2.2, w: 4.1, h: 0.2, fill: { color: AZUL }, line: { color: AZUL } });
    slide.addText(c.t, { x: x + 0.1, y: 1.92, w: 3.9, h: 0.5, fontSize: 13, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
    slide.addText(c.c, { x: x + 0.15, y: 2.5, w: 3.8, h: 1.8, fontSize: 12, color: '1a3a6a', fontFace: 'Calibri', wrap: true, valign: 'top' });
  });
}

// =====================================================
// SLIDE 3 — PORTAL DO CANDIDATO
// =====================================================
{
  const slide = addContentSlide('Portal do Candidato', 'A vitrine da empresa para o mercado de talentos');
  const items = [
    'Listagem de vagas com filtros por modalidade (Remoto, Híbrido, Presencial), área e tipo de contrato',
    'Busca por cargo, habilidade ou empresa',
    'Candidatura em segundos: o candidato cria conta e se inscreve diretamente',
    'Área pessoal "Minha Área": candidaturas, status, score IA e mensagens do RH',
    'Exportação de dados pessoais em conformidade com a LGPD',
    'Interface responsiva e moderna',
  ];
  addBullets(slide, items, 0.35, 1.3, W - 0.6, 4.2, 14);
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 5.8, w: W - 0.6, h: 0.65, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.06 });
  slide.addText('Acesso: http://localhost:3000/portal  (ou domínio configurado)', {
    x: 0.45, y: 5.82, w: W - 0.8, h: 0.55, fontSize: 13, bold: true, color: AZUL_ESC, fontFace: 'Calibri', valign: 'middle'
  });
}

// =====================================================
// SLIDE 4 — CANDIDATURA E SCORE IA
// =====================================================
{
  const slide = addContentSlide('Candidatura com Análise Automática por IA');
  // Fluxo esquerda
  const passos = [
    '1. Candidato preenche perfil',
    '2. Seleciona a vaga',
    '3. Confirma candidatura',
    '4. IA analisa compatibilidade',
    '5. Score gerado de 0 a 100%',
    '6. Score ≥ 70%: avança para Triagem IA',
    '7. Score < 70%: aguarda revisão do RH',
    '8. E-mail de confirmação enviado',
  ];
  passos.forEach((p, i) => {
    const y = 1.3 + i * 0.65;
    slide.addShape(pptx.ShapeType.rect, { x: 0.3, y, w: 5.8, h: 0.55, fill: { color: i === 5 ? VERDE_CL : i === 6 ? AMARELO_CL : AZUL_CL }, line: { color: AZUL, width: 0.5 }, rectRadius: 0.05 });
    slide.addText(p, { x: 0.45, y: y + 0.04, w: 5.5, h: 0.47, fontSize: 12, color: '1a1917', fontFace: 'Calibri', valign: 'middle' });
  });
  // Tabela direita
  const tableY = 1.3;
  const headers = ['Score', 'Classificação', 'Ação'];
  const rows = [
    { score: '≥ 85%', label: 'Excelente', acao: 'Avança automaticamente', bg: VERDE_CL },
    { score: '70–84%', label: 'Boa compatibilidade', acao: 'Avança automaticamente', bg: AMARELO_CL },
    { score: '< 70%', label: 'Baixa', acao: 'Aguarda revisão do RH', bg: VERMELHO_CL },
  ];
  const colW = [1.1, 2.0, 2.5];
  const startX = 6.5;
  // Header
  let cx = startX;
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, { x: cx, y: tableY, w: colW[i], h: 0.45, fill: { color: AZUL }, line: { color: AZUL } });
    slide.addText(h, { x: cx + 0.05, y: tableY, w: colW[i] - 0.1, h: 0.45, fontSize: 12, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle', align: 'center' });
    cx += colW[i];
  });
  rows.forEach((r, ri) => {
    let cx2 = startX;
    [r.score, r.label, r.acao].forEach((val, ci) => {
      slide.addShape(pptx.ShapeType.rect, { x: cx2, y: tableY + 0.45 + ri * 0.6, w: colW[ci], h: 0.6, fill: { color: ri === 0 ? VERDE_CL : ri === 1 ? AMARELO_CL : VERMELHO_CL }, line: { color: AZUL, width: 0.5 } });
      slide.addText(val, { x: cx2 + 0.05, y: tableY + 0.45 + ri * 0.6, w: colW[ci] - 0.1, h: 0.6, fontSize: 11, color: '1a1917', fontFace: 'Calibri', valign: 'middle', align: 'center', wrap: true });
      cx2 += colW[ci];
    });
  });
}

// =====================================================
// SLIDE 5 — PIPELINE
// =====================================================
{
  const slide = addContentSlide('Pipeline Visual de Recrutamento', 'Acompanhe cada candidato em tempo real');
  const etapas = ['INSCRITOS', 'TRIAGEM IA', 'ENT. RH', 'TÉCNICA', 'FINALISTAS', 'OFERTA', 'CONTRATADOS'];
  const bw = 1.6;
  const gap = 0.15;
  etapas.forEach((e, i) => {
    const x = 0.3 + i * (bw + gap);
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.35, w: bw, h: 0.7, fill: { color: i === 6 ? VERDE : AZUL }, line: { color: AZUL_ESC }, rectRadius: 0.06 });
    slide.addText(e, { x, y: 1.35, w: bw, h: 0.7, fontSize: 11, bold: true, color: BRANCO, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    if (i < etapas.length - 1) {
      slide.addShape(pptx.ShapeType.line, { x: x + bw, y: 1.7, w: gap, h: 0, line: { color: AZUL_ESC, width: 1.5 } });
    }
  });
  const items = [
    'Cards por candidato com score colorido (verde, amarelo ou vermelho)',
    'Filtro por vaga: exibe apenas candidatos de uma vaga específica',
    'Avançar etapa com um clique — atualiza em tempo real, sem recarregar a página',
    'Reprovar candidato com envio automático de e-mail de feedback',
    'Perfil completo do candidato acessível diretamente do card',
  ];
  addBullets(slide, items, 0.35, 2.3, W - 0.6, 3.8, 13);
}

// =====================================================
// SLIDE 6 — TRIAGEM IA
// =====================================================
{
  const slide = addContentSlide('Triagem Automática por IA');
  // Caixa esquerda
  const leftItems = [
    'Processa todos os candidatos inscritos sem score',
    'IA avalia: habilidades, localização, experiência e alinhamento com a vaga',
    'Score ≥ 70%: avança para Triagem IA automaticamente',
    'Score < 70%: permanece em Inscritos para análise humana',
    'Score calculado também ao se inscrever pelo portal',
  ];
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 5.9, h: 4.8, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 5.9, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.6, w: 5.9, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
  slide.addText('Como funciona', { x: 0.4, y: 1.26, w: 5.7, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, leftItems, 0.45, 1.85, 5.6, 4.0, 13);
  // Caixa direita
  const rightItems = [
    'Redução drástica no tempo de triagem manual',
    'Critérios objetivos e consistentes para todos',
    'RH foca apenas nos candidatos mais qualificados',
    'Nenhum candidato reprovado sem revisão humana',
    'Análise detalhada com pontos fortes e o que falta',
  ];
  slide.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.25, w: 6.0, h: 4.8, fill: { color: VERDE_CL }, line: { color: '2d6a0f', width: 1 }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.25, w: 6.0, h: 0.5, fill: { color: '2d6a0f' }, line: { color: '2d6a0f' }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.7, y: 1.6, w: 6.0, h: 0.15, fill: { color: '2d6a0f' }, line: { color: '2d6a0f' } });
  slide.addText('Vantagens', { x: 6.8, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, rightItems, 6.85, 1.85, 5.7, 4.0, 13);
}

// =====================================================
// SLIDE 7 — GESTÃO DE VAGAS
// =====================================================
{
  const slide = addContentSlide('Gestão Completa de Vagas');
  const tableData = [
    ['Campo', 'Descrição'],
    ['Título do cargo', 'Nome da posição aberta'],
    ['Área / Departamento', 'Setor da empresa'],
    ['Modalidade', 'Remoto, Híbrido ou Presencial'],
    ['Tipo de contrato', 'CLT, PJ, Estágio ou Freelance'],
    ['Faixa salarial', 'Salário mínimo e máximo'],
    ['Requisitos', 'Habilidades e competências necessárias'],
    ['Tags', 'Palavras-chave para busca no portal'],
    ['Descrição', 'Texto completo da vaga (pode ser gerado por IA)'],
  ];
  tableData.forEach((row, ri) => {
    const y = 1.3 + ri * 0.52;
    const isHeader = ri === 0;
    row.forEach((cell, ci) => {
      const x = 0.3 + ci * 6.5;
      slide.addShape(pptx.ShapeType.rect, { x, y, w: 6.4, h: 0.5, fill: { color: isHeader ? AZUL : ri % 2 === 0 ? CINZA_CL : BRANCO }, line: { color: AZUL, width: 0.5 } });
      slide.addText(cell, { x: x + 0.1, y, w: 6.2, h: 0.5, fontSize: isHeader ? 13 : 12, bold: isHeader, color: isHeader ? BRANCO : '1a1917', fontFace: 'Calibri', valign: 'middle' });
    });
  });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 6.05, w: W - 0.6, h: 0.6, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.06 });
  slide.addText('Gerador de JD com IA: a IA cria automaticamente uma descrição profissional a partir do título, área e requisitos.', {
    x: 0.45, y: 6.07, w: W - 0.8, h: 0.55, fontSize: 12, bold: true, color: AZUL_ESC, fontFace: 'Calibri', valign: 'middle'
  });
}

// =====================================================
// SLIDE 8 — GESTÃO DE CANDIDATOS
// =====================================================
{
  const slide = addContentSlide('Gestão de Candidatos');
  const left = ['Nome, e-mail, telefone, localização', 'Habilidades (tags)', 'Score IA e análise detalhada', 'Currículo (CV) para download', 'Consentimento LGPD com data/hora', 'Histórico de candidaturas e etapas'];
  const right = ['Ver análise completa da IA', 'Calcular / recalcular score', 'Enviar mensagem direta', 'Agendar entrevista', 'Vincular a uma vaga', 'Avançar etapa ou reprovar', 'Download do currículo', 'Excluir candidato'];
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 5.4, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
  slide.addText('Dados armazenados', { x: 0.4, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, left, 0.45, 1.85, 5.7, 4.6, 13);
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 5.4, fill: { color: CINZA_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC } });
  slide.addText('Ações no perfil', { x: 6.9, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, right, 6.95, 1.85, 5.7, 4.6, 13);
}

// =====================================================
// SLIDE 9 — ENTREVISTAS
// =====================================================
{
  const slide = addContentSlide('Agendamento de Entrevistas');
  const leftItems = ['Candidato (seleção via dropdown)', 'Data e horário', 'Tipo: RH, Técnica ou Final', 'Formato: Videoconferência ou Presencial', 'Link de acesso / Endereço (obrigatório)'];
  const rightItems = ['E-mail automático com todos os detalhes da entrevista', '"Link de acesso" para vídeo / "Local da entrevista" para presencial', 'Data formatada em DD/MM/AAAA', 'Formato exibido como texto completo (não abreviado)', 'Lembrete automático enviado 24h antes pelo servidor'];
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 5.4, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
  slide.addText('Campos ao agendar', { x: 0.4, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, leftItems, 0.45, 1.85, 5.7, 4.6, 13);
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 5.4, fill: { color: VERDE_CL }, line: { color: '2d6a0f', width: 1 }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 0.5, fill: { color: '2d6a0f' }, line: { color: '2d6a0f' }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 6.0, h: 0.15, fill: { color: '2d6a0f' }, line: { color: '2d6a0f' } });
  slide.addText('Automações', { x: 6.9, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, rightItems, 6.95, 1.85, 5.7, 4.6, 13);
}

// =====================================================
// SLIDE 10 — OFERTAS
// =====================================================
{
  const slide = addContentSlide('Gestão de Propostas e Ofertas');
  const items = ['Candidato vinculado (seleção)', 'Salário proposto', 'Bônus de contratação (signing bonus)', 'Data de início prevista', 'Prazo de validade da oferta', 'Status: pendente, aceita ou recusada'];
  addBullets(slide, items, 0.35, 1.3, W - 0.6, 3.8, 15);
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 5.4, w: W - 0.6, h: 0.8, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.08 });
  slide.addText('Ao salvar: e-mail automático enviado com salário formatado (R$ 10.000) e data de início em DD/MM/AAAA.', {
    x: 0.45, y: 5.42, w: W - 0.8, h: 0.75, fontSize: 13, bold: true, color: AZUL_ESC, fontFace: 'Calibri', valign: 'middle', wrap: true
  });
}

// =====================================================
// SLIDE 11 — E-MAILS AUTOMÁTICOS
// =====================================================
{
  const slide = addContentSlide('6 E-mails Automáticos em Momentos-Chave', 'Comunicação profissional sem esforço manual');
  const headers = ['#', 'Gatilho', 'Quando é disparado', 'Conteúdo do e-mail'];
  const colW = [0.5, 2.5, 4.5, 5.0];
  const rows = [
    ['1', 'Candidatura recebida', 'Candidato se inscreve no portal', 'Confirmação + link do portal'],
    ['2', 'Entrevista agendada', 'RH agenda entrevista', 'Data, hora, formato e link/endereço'],
    ['3', 'Oferta enviada', 'Proposta é registrada', 'Salário + data de início'],
    ['4', 'Contratado', 'Avança para etapa "Contratado"', 'Parabéns e próximos passos'],
    ['5', 'Feedback reprovação', 'Candidato é reprovado', 'Agradecimento e feedback respeitoso'],
    ['6', 'Lembrete entrevista', '24h antes (automático pelo servidor)', 'Lembrete completo com todos os dados'],
  ];
  let startX = 0.3;
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, { x: startX, y: 1.3, w: colW[i], h: 0.45, fill: { color: AZUL }, line: { color: AZUL } });
    slide.addText(h, { x: startX + 0.05, y: 1.3, w: colW[i] - 0.1, h: 0.45, fontSize: 12, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle', align: 'center' });
    startX += colW[i];
  });
  rows.forEach((row, ri) => {
    let cx = 0.3;
    row.forEach((cell, ci) => {
      slide.addShape(pptx.ShapeType.rect, { x: cx, y: 1.75 + ri * 0.68, w: colW[ci], h: 0.66, fill: { color: ri % 2 === 0 ? BRANCO : AZUL_CL }, line: { color: AZUL, width: 0.5 } });
      slide.addText(cell, { x: cx + 0.05, y: 1.75 + ri * 0.68, w: colW[ci] - 0.1, h: 0.66, fontSize: 11, color: '1a1917', fontFace: 'Calibri', valign: 'middle', align: ci === 0 ? 'center' : 'left', wrap: true });
      cx += colW[ci];
    });
  });
  slide.addText('Variáveis disponíveis: {nome} {cargo} {empresa} {data} {hora} {link_agenda} {salario} {data_inicio} {recrutador} {link_portal}', {
    x: 0.3, y: 6.9, w: W - 0.5, h: 0.4, fontSize: 10, color: CINZA, fontFace: 'Calibri', italic: true
  });
}

// =====================================================
// SLIDE 12 — MENSAGENS
// =====================================================
{
  const slide = addContentSlide('Mensagens Diretas com Candidatos');
  const items = [
    'Chat interno entre RH e candidatos, acessível no admin e no portal',
    'Lista de conversas com indicador de mensagens não lidas',
    'RH pode iniciar conversa ou responder candidatos',
    'Candidato visualiza e responde pelo portal (Minha Área)',
    'Histórico completo de cada conversa preservado',
    'Ideal para: tirar dúvidas, solicitar documentos, dar feedbacks informais',
  ];
  addBullets(slide, items, 0.35, 1.3, W - 0.6, 5.5, 15);
}

// =====================================================
// SLIDE 13 — DASHBOARD
// =====================================================
{
  const slide = addContentSlide('Dashboard — Visão Geral em Tempo Real');
  const cards = [
    { t: 'Vagas abertas', d: 'Total de posições ativas no sistema' },
    { t: 'Total candidatos', d: 'Todos os candidatos cadastrados' },
    { t: 'Entrevistas na semana', d: 'Agendadas para os próximos 7 dias' },
    { t: 'Taxa de aprovação', d: '% em Triagem IA ou além' },
    { t: 'Score médio', d: 'Média dos scores IA por vaga' },
    { t: 'Candidatos recentes', d: 'Últimos inscritos com score e vaga' },
  ];
  cards.forEach((c, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 4.3;
    const y = 1.35 + row * 2.7;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 4.1, h: 2.4, fill: { color: i % 2 === 0 ? AZUL_CL : CINZA_CL }, line: { color: AZUL, width: 1 }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 4.1, h: 0.55, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y: y + 0.4, w: 4.1, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
    slide.addText(c.t, { x: x + 0.1, y, w: 3.9, h: 0.55, fontSize: 13, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
    slide.addText(c.d, { x: x + 0.15, y: y + 0.65, w: 3.8, h: 1.6, fontSize: 12, color: '333333', fontFace: 'Calibri', valign: 'top', wrap: true });
  });
}

// =====================================================
// SLIDE 14 — RELATÓRIOS E ASSISTENTE IA
// =====================================================
{
  const slide = addContentSlide('Análise de Dados e Assistente Inteligente');
  const left = ['Distribuição de candidatos por etapa do pipeline', 'Candidatos por vaga', 'Score médio e taxa de aprovação', 'Histórico de contratações'];
  const right = ['"Quais candidatos têm maior score?"', '"Quantas vagas temos abertas?"', '"Qual a taxa de aprovação este mês?"', 'Respostas baseadas nos dados reais do banco'];
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 5.4, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
  slide.addText('Relatórios', { x: 0.4, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, left, 0.45, 1.85, 5.7, 4.0, 13);
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 5.4, fill: { color: CINZA_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC } });
  slide.addText('Assistente IA — exemplos de perguntas', { x: 6.9, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  slide.addText('Chat em linguagem natural sobre os dados do sistema:', { x: 6.95, y: 1.85, w: 5.7, h: 0.45, fontSize: 12, color: '333333', fontFace: 'Calibri', italic: true });
  addBullets(slide, right, 6.95, 2.35, 5.7, 4.0, 13);
}

// =====================================================
// SLIDE 15 — LGPD
// =====================================================
{
  const slide = addContentSlide('Conformidade com a LGPD');
  const items = [
    'Consentimento explícito do candidato no cadastro (checkbox obrigatório)',
    'Exportação de dados pessoais em JSON — direito do titular garantido',
    'Exclusão completa de dados: RH pode remover candidato e todo o histórico',
    'Registro de consentimento com data e hora no banco de dados',
    'Dados armazenados com segurança no Supabase (PostgreSQL)',
    'Candidatos nunca reprovados automaticamente — revisão humana sempre disponível',
  ];
  addBullets(slide, items, 0.35, 1.3, W - 0.6, 5.5, 15);
}

// =====================================================
// SLIDE 16 — CONFIGURAÇÕES E INFRAESTRUTURA
// =====================================================
{
  const slide = addContentSlide('Configurações e Infraestrutura');
  const left = ['Nome e dados da empresa', 'SMTP (qualquer provedor de e-mail)', 'Teste de conexão de e-mail', 'Chave da API Anthropic (IA)', 'Conexão com Supabase'];
  const right = ['Frontend: HTML5 + CSS3 + JavaScript puro', 'Backend: Node.js (servidor leve)', 'Banco de dados: Supabase (PostgreSQL)', 'Inteligência Artificial: Claude Sonnet (Anthropic)', 'E-mail: Nodemailer (SMTP universal)'];
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 5.4, fill: { color: AZUL_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 0.3, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
  slide.addText('Configurações disponíveis', { x: 0.4, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, left, 0.45, 1.85, 5.7, 4.6, 13);
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 5.4, fill: { color: CINZA_CL }, line: { color: AZUL }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.25, w: 6.0, h: 0.5, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC }, rectRadius: 0.1 });
  slide.addShape(pptx.ShapeType.rect, { x: 6.8, y: 1.6, w: 6.0, h: 0.15, fill: { color: AZUL_ESC }, line: { color: AZUL_ESC } });
  slide.addText('Tecnologias utilizadas', { x: 6.9, y: 1.26, w: 5.8, h: 0.5, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
  addBullets(slide, right, 6.95, 1.85, 5.7, 4.6, 13);
}

// =====================================================
// SLIDE 17 — FLUXO COMPLETO
// =====================================================
{
  const slide = addContentSlide('Fluxo Completo: Do Candidato ao Contratado');
  const passos = [
    { n: '1', t: 'RH publica vaga no sistema', cor: AZUL },
    { n: '2', t: 'Vaga aparece no portal público para candidatos', cor: AZUL },
    { n: '3', t: 'Candidato se cadastra e se inscreve na vaga', cor: AZUL },
    { n: '4', t: 'IA calcula score automaticamente em background', cor: AZUL },
    { n: '5', t: 'E-mail de confirmação enviado ao candidato', cor: AZUL },
    { n: '6', t: 'Score ≥ 70%: candidato avança para Triagem IA', cor: AZUL },
    { n: '7', t: 'RH analisa candidatos no pipeline', cor: AZUL_ESC },
    { n: '8', t: 'RH agenda entrevista → e-mail automático enviado', cor: AZUL_ESC },
    { n: '9', t: 'Servidor envia lembrete automático 24h antes', cor: AZUL_ESC },
    { n: '10', t: 'RH avança candidato pelas etapas conforme avaliação', cor: AZUL_ESC },
    { n: '11', t: 'Oferta registrada → e-mail automático com salário e data', cor: AZUL_ESC },
    { n: '12', t: '✓ Candidato contratado → e-mail de parabéns', cor: '1a7a1a' },
  ];
  const colCount = 2;
  const rowCount = 6;
  passos.forEach((p, i) => {
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const x = 0.3 + col * 6.5;
    const y = 1.3 + row * 1.0;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 0.55, h: 0.75, fill: { color: p.cor }, line: { color: p.cor }, rectRadius: 0.05 });
    slide.addText(p.n, { x, y, w: 0.55, h: 0.75, fontSize: 14, bold: true, color: BRANCO, fontFace: 'Calibri', align: 'center', valign: 'middle' });
    slide.addShape(pptx.ShapeType.rect, { x: x + 0.55, y, w: 5.7, h: 0.75, fill: { color: p.cor === '1a7a1a' ? VERDE_CL : AZUL_CL }, line: { color: AZUL, width: 0.5 }, rectRadius: 0.05 });
    slide.addText(p.t, { x: x + 0.65, y, w: 5.5, h: 0.75, fontSize: 12, color: '1a1917', fontFace: 'Calibri', valign: 'middle', wrap: true });
  });
}

// =====================================================
// SLIDE 18 — COMO COMEÇAR
// =====================================================
{
  const slide = addContentSlide('Como Começar', 'Passos para implantação do TalentAI');
  const passos = [
    { n: '1', t: 'Configurar Node.js', d: 'Instalar Node.js e rodar: npm install && node server.js' },
    { n: '2', t: 'Criar conta Supabase', d: 'Acessar supabase.com, criar projeto e executar o schema SQL' },
    { n: '3', t: 'Configurar .env', d: 'Preencher credenciais: Anthropic API Key, SMTP, Supabase URL e Service Key' },
    { n: '4', t: 'Criar templates de e-mail', d: 'No admin, acessar "E-mails auto" e criar um template para cada gatilho' },
    { n: '5', t: 'Publicar vagas', d: 'No admin, acessar "Vagas" e cadastrar as posições disponíveis' },
    { n: '6', t: 'Divulgar o portal', d: 'Compartilhar o link do portal nas redes sociais e plataformas de emprego' },
  ];
  passos.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.3 + col * 6.5;
    const y = 1.3 + row * 1.85;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 6.2, h: 1.65, fill: { color: i % 2 === 0 ? AZUL_CL : CINZA_CL }, line: { color: AZUL, width: 1 }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: 6.2, h: 0.5, fill: { color: AZUL }, line: { color: AZUL }, rectRadius: 0.1 });
    slide.addShape(pptx.ShapeType.rect, { x, y: y + 0.35, w: 6.2, h: 0.15, fill: { color: AZUL }, line: { color: AZUL } });
    slide.addText(`Passo ${p.n}: ${p.t}`, { x: x + 0.1, y, w: 6.0, h: 0.5, fontSize: 13, bold: true, color: BRANCO, fontFace: 'Calibri', valign: 'middle' });
    slide.addText(p.d, { x: x + 0.1, y: y + 0.58, w: 6.0, h: 1.0, fontSize: 12, color: '333333', fontFace: 'Calibri', valign: 'top', wrap: true });
  });
  slide.addShape(pptx.ShapeType.line, { x: 0.3, y: 7.1, w: W - 0.5, h: 0, line: { color: AZUL_CL, width: 1 } });
  slide.addText('TalentAI — Sistema desenvolvido para otimizar o recrutamento com inteligência artificial', {
    x: 0.3, y: 7.15, w: W - 0.5, h: 0.3, fontSize: 10, color: CINZA, fontFace: 'Calibri', italic: true, align: 'center'
  });
}

// Salvar
pptx.writeFile({ fileName: 'C:\\Users\\TI\\Documents\\talentia\\TalentAI_Apresentacao.pptx' })
  .then(() => console.log('PPTX gerado com sucesso!'))
  .catch(e => console.error('Erro:', e));
