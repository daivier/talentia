from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, cm
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                 TableStyle, PageBreak, HRFlowable)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate

# Cores
AZUL = colors.HexColor('#1a56a0')
AZUL_ESCURO = colors.HexColor('#0d3d7a')
AZUL_CLARO = colors.HexColor('#e8f0fb')
CINZA = colors.HexColor('#6b6962')
CINZA_CLARO = colors.HexColor('#f7f6f2')
VERDE = colors.HexColor('#2d6a0f')
AMARELO = colors.HexColor('#a05c0a')
VERMELHO = colors.HexColor('#991f1f')
BRANCO = colors.white
PRETO = colors.HexColor('#1a1917')

W, H = A4

def header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    if doc.page > 1:
        # Header
        canvas_obj.setFillColor(AZUL)
        canvas_obj.rect(0, H - 18*mm, W, 18*mm, fill=1, stroke=0)
        canvas_obj.setFillColor(BRANCO)
        canvas_obj.setFont('Helvetica-Bold', 9)
        canvas_obj.drawString(20*mm, H - 11*mm, 'TalentAI')
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.drawRightString(W - 20*mm, H - 11*mm, 'Sistema Inteligente de Recrutamento')
        # Footer
        canvas_obj.setFillColor(AZUL_CLARO)
        canvas_obj.rect(0, 0, W, 12*mm, fill=1, stroke=0)
        canvas_obj.setFillColor(CINZA)
        canvas_obj.setFont('Helvetica', 7)
        canvas_obj.drawString(20*mm, 4*mm, 'Documento interno — RH | TalentAI')
        canvas_obj.drawRightString(W - 20*mm, 4*mm, f'Pagina {doc.page}')
    canvas_obj.restoreState()

def build_pdf():
    path = r'C:\Users\TI\Documents\talentia\TalentAI_Apresentacao.pdf'
    doc = BaseDocTemplate(path, pagesize=A4,
                          leftMargin=20*mm, rightMargin=20*mm,
                          topMargin=25*mm, bottomMargin=20*mm)

    frame = Frame(doc.leftMargin, doc.bottomMargin,
                  doc.width, doc.height, id='normal')
    template = PageTemplate(id='main', frames=frame, onPage=header_footer)
    doc.addPageTemplates([template])

    styles = getSampleStyleSheet()

    # Estilos customizados
    titulo_capa = ParagraphStyle('TituloCapa', fontSize=52, textColor=BRANCO,
                                  fontName='Helvetica-Bold', alignment=TA_CENTER,
                                  spaceAfter=6)
    sub_capa = ParagraphStyle('SubCapa', fontSize=16, textColor=BRANCO,
                               fontName='Helvetica', alignment=TA_CENTER,
                               spaceAfter=4)
    titulo_secao = ParagraphStyle('TituloSecao', fontSize=22, textColor=AZUL,
                                   fontName='Helvetica-Bold', spaceBefore=4,
                                   spaceAfter=4)
    subtitulo_secao = ParagraphStyle('SubtituloSecao', fontSize=13, textColor=CINZA,
                                      fontName='Helvetica-Oblique', spaceAfter=10)
    corpo = ParagraphStyle('Corpo', fontSize=10, textColor=PRETO,
                            fontName='Helvetica', spaceAfter=5,
                            leading=15, alignment=TA_JUSTIFY)
    item = ParagraphStyle('Item', fontSize=10, textColor=PRETO,
                           fontName='Helvetica', spaceAfter=3,
                           leftIndent=10, leading=14)
    destaque = ParagraphStyle('Destaque', fontSize=10, textColor=AZUL_ESCURO,
                               fontName='Helvetica-Bold', spaceAfter=3,
                               leftIndent=10)
    titulo_bloco = ParagraphStyle('TituloBloco', fontSize=11, textColor=AZUL,
                                   fontName='Helvetica-Bold', spaceAfter=4)
    numerado = ParagraphStyle('Numerado', fontSize=10, textColor=PRETO,
                               fontName='Helvetica', spaceAfter=4,
                               leftIndent=14, leading=14)

    story = []

    # =========================================================
    # PAGINA 1 — CAPA
    # =========================================================
    def capa(c, doc):
        c.saveState()
        # Fundo azul escuro
        c.setFillColor(AZUL_ESCURO)
        c.rect(0, 0, W, H, fill=1, stroke=0)
        # Faixa decorativa superior
        c.setFillColor(AZUL)
        c.rect(0, H - 60*mm, W, 60*mm, fill=1, stroke=0)
        # Faixa inferior
        c.setFillColor(AZUL)
        c.rect(0, 0, W, 40*mm, fill=1, stroke=0)
        # Linha decorativa
        c.setStrokeColor(BRANCO)
        c.setLineWidth(2)
        c.line(30*mm, H/2 + 10*mm, W - 30*mm, H/2 + 10*mm)
        c.line(30*mm, H/2 - 30*mm, W - 30*mm, H/2 - 30*mm)
        # Titulo
        c.setFillColor(BRANCO)
        c.setFont('Helvetica-Bold', 68)
        c.drawCentredString(W/2, H/2 + 20*mm, 'TalentAI')
        # Subtitulo linha 1
        c.setFont('Helvetica', 16)
        c.drawCentredString(W/2, H/2 - 5*mm, 'Sistema Inteligente de Gestao de')
        # Subtitulo linha 2
        c.drawCentredString(W/2, H/2 - 16*mm, 'Recrutamento e Selecao')
        # Rodape
        c.setFont('Helvetica', 10)
        c.setFillColor(colors.HexColor('#ccddee'))
        c.drawCentredString(W/2, 20*mm, 'Documento interno — RH')
        c.restoreState()

    doc.addPageTemplates([
        PageTemplate(id='capa', frames=Frame(0, 0, W, H, id='capa_frame'),
                     onPage=capa),
        PageTemplate(id='main', frames=Frame(doc.leftMargin, doc.bottomMargin,
                     doc.width, doc.height, id='normal'),
                     onPage=header_footer)
    ])

    story.append(PageBreak())

    # Funcao auxiliar para cabecalho de secao
    def sec(titulo, subtitulo=None):
        story.append(Paragraph(titulo, titulo_secao))
        story.append(HRFlowable(width='100%', thickness=2, color=AZUL, spaceAfter=6))
        if subtitulo:
            story.append(Paragraph(subtitulo, subtitulo_secao))

    def bloco(titulo, itens):
        data = [[Paragraph(titulo, titulo_bloco)]]
        for i in itens:
            data.append([Paragraph(f'- {i}', item)])
        t = Table(data, colWidths=[doc.width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), AZUL_CLARO),
            ('BACKGROUND', (0,1), (-1,-1), CINZA_CLARO),
            ('BOX', (0,0), (-1,-1), 1, AZUL),
            ('LINEBELOW', (0,0), (-1,0), 1, AZUL),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 8))

    # =========================================================
    # PAGINA 2 — VISAO GERAL
    # =========================================================
    sec('O que e o TalentAI?')
    story.append(Paragraph(
        'O TalentAI e uma plataforma completa de recrutamento e selecao que combina inteligencia artificial '
        'com gestao de candidatos, vagas e comunicacao. Desenvolvido para otimizar todo o ciclo de contratacao '
        '- da publicacao da vaga ate a contratacao - com automacoes que economizam tempo e reduzem erros humanos.',
        corpo))
    story.append(Spacer(1, 10))

    pilares = [
        ['Inteligencia Artificial', 'Comunicacao Automatizada', 'Gestao Completa'],
        [
            Paragraph('Score automatico de candidatos, triagem automatica, geracao de descricoes de vagas e assistente IA.', item),
            Paragraph('6 gatilhos de e-mail automatico em momentos-chave do processo seletivo.', item),
            Paragraph('Pipeline visual, vagas, candidatos, entrevistas, ofertas e relatorios integrados.', item),
        ]
    ]
    t = Table(pilares, colWidths=[doc.width/3]*3)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL),
        ('TEXTCOLOR', (0,0), (-1,0), BRANCO),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 11),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,1), (-1,-1), AZUL_CLARO),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, AZUL),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 3 — PORTAL DO CANDIDATO
    # =========================================================
    sec('Portal do Candidato', 'A vitrine da empresa para o mercado de talentos')
    bloco('Funcionalidades', [
        'Listagem de vagas com filtros por modalidade (Remoto, Hibrido, Presencial), area e tipo de contrato',
        'Busca por cargo, habilidade ou empresa',
        'Candidatura em segundos: o candidato cria conta e se inscreve diretamente',
        'Area pessoal "Minha Area": candidaturas, status, score IA e mensagens do RH',
        'Exportacao de dados pessoais em conformidade com a LGPD',
        'Interface responsiva e moderna',
    ])
    story.append(Paragraph('Acesso: <b>http://localhost:3000/portal</b> (ou dominio configurado)', destaque))
    story.append(PageBreak())

    # =========================================================
    # PAGINA 4 — CANDIDATURA E SCORE IA
    # =========================================================
    sec('Candidatura com Analise Automatica por IA')
    story.append(Paragraph('Fluxo ao se candidatar:', titulo_bloco))
    passos = [
        '1. Candidato preenche perfil (habilidades, localizacao, experiencia)',
        '2. Seleciona a vaga desejada',
        '3. Confirma candidatura',
        '4. IA analisa automaticamente compatibilidade candidato x vaga',
        '5. Score gerado de 0 a 100%',
        '6. Score >= 70%: candidato avanca automaticamente para Triagem IA',
        '7. Score < 70%: fica em Inscritos para revisao manual do RH',
        '8. E-mail de confirmacao enviado automaticamente',
    ]
    for p in passos:
        story.append(Paragraph(p, numerado))
    story.append(Spacer(1, 8))

    score_data = [
        ['Score', 'Classificacao', 'Acao'],
        ['>= 85%', 'Excelente compatibilidade', 'Avanca automaticamente para Triagem IA'],
        ['70 - 84%', 'Boa compatibilidade', 'Avanca automaticamente para Triagem IA'],
        ['< 70%', 'Compatibilidade baixa', 'Aguarda revisao manual do RH em Inscritos'],
    ]
    t = Table(score_data, colWidths=[40*mm, 70*mm, doc.width - 110*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL),
        ('TEXTCOLOR', (0,0), (-1,0), BRANCO),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BACKGROUND', (0,1), (0,1), colors.HexColor('#e6f4dc')),
        ('BACKGROUND', (0,2), (0,2), colors.HexColor('#fdf0dc')),
        ('BACKGROUND', (0,3), (0,3), colors.HexColor('#fdeaea')),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 5 — PIPELINE
    # =========================================================
    sec('Pipeline Visual de Recrutamento', 'Acompanhe cada candidato em tempo real')

    etapas = ['INSCRITOS', 'TRIAGEM IA', 'ENT. RH', 'TECNICA', 'FINALISTAS', 'OFERTA', 'CONTRATADOS']
    largura = doc.width / len(etapas)
    pipeline_data = [etapas]
    t = Table(pipeline_data, colWidths=[largura]*len(etapas))
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), AZUL),
        ('TEXTCOLOR', (0,0), (-1,-1), BRANCO),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 1, AZUL_ESCURO),
        ('INNERGRID', (0,0), (-1,-1), 1, AZUL_ESCURO),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    bloco('Funcionalidades do Pipeline', [
        'Visualizacao kanban com cards por candidato',
        'Score IA colorido em cada card (verde, amarelo ou vermelho)',
        'Filtro por vaga: exibe apenas candidatos de uma vaga especifica',
        'Avançar etapa com um clique — atualiza em tempo real sem recarregar a pagina',
        'Reprovar candidato com envio automatico de e-mail de feedback',
        'Acesso ao perfil completo do candidato diretamente do card',
    ])
    story.append(PageBreak())

    # =========================================================
    # PAGINA 6 — TRIAGEM IA
    # =========================================================
    sec('Triagem Automatica por Inteligencia Artificial')
    bloco('Como funciona', [
        'Ao clicar em "Triagem IA", o sistema processa todos os candidatos inscritos sem score',
        'A IA avalia: habilidades tecnicas, localizacao, experiencia e alinhamento com os requisitos da vaga',
        'Candidatos com score >= 70%: avancam automaticamente para a etapa "Triagem IA"',
        'Candidatos com score < 70%: permanecem em "Inscritos" para analise humana',
        'O score tambem e calculado automaticamente quando o candidato se inscreve pelo portal',
    ])
    bloco('Vantagens', [
        'Reducao drastica no tempo de triagem manual',
        'Criterios objetivos e consistentes para todos os candidatos',
        'O RH foca apenas nos candidatos mais qualificados',
        'Nenhum candidato e reprovado automaticamente sem revisao humana (score < 70 aguarda RH)',
        'Analise detalhada gerada pela IA explicando pontos fortes e o que falta no perfil',
    ])
    story.append(PageBreak())

    # =========================================================
    # PAGINA 7 — GESTAO DE VAGAS
    # =========================================================
    sec('Gestao Completa de Vagas')
    campos_vaga = [
        ['Campo', 'Descricao'],
        ['Titulo do cargo', 'Nome da posicao aberta'],
        ['Area / Departamento', 'Setor da empresa'],
        ['Modalidade', 'Remoto, Hibrido ou Presencial'],
        ['Tipo de contrato', 'CLT, PJ, Estagio ou Freelance'],
        ['Faixa salarial', 'Salario minimo e maximo'],
        ['Requisitos', 'Habilidades e competencias necessarias'],
        ['Tags', 'Palavras-chave para busca no portal'],
        ['Descricao', 'Texto completo da vaga (pode ser gerado por IA)'],
    ]
    t = Table(campos_vaga, colWidths=[55*mm, doc.width - 55*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL),
        ('TEXTCOLOR', (0,0), (-1,0), BRANCO),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('BACKGROUND', (0,1), (-1,-1), CINZA_CLARO),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [BRANCO, CINZA_CLARO]),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))
    story.append(Paragraph('Gerador de JD com IA: ao informar titulo, area e requisitos, a IA gera automaticamente uma descricao profissional e atrativa para a vaga.', destaque))
    story.append(PageBreak())

    # =========================================================
    # PAGINA 8 — GESTAO DE CANDIDATOS
    # =========================================================
    sec('Gestao de Candidatos')
    col1 = [
        Paragraph('Dados armazenados por candidato:', titulo_bloco),
        Paragraph('- Nome completo, e-mail, telefone, localizacao', item),
        Paragraph('- Habilidades (tags)', item),
        Paragraph('- Score IA e analise detalhada', item),
        Paragraph('- Disponibilidade para inicio', item),
        Paragraph('- Curriculo (CV) para download', item),
        Paragraph('- Consentimento LGPD com data', item),
        Paragraph('- Historico de candidaturas e etapas', item),
    ]
    col2 = [
        Paragraph('Acoes disponiveis no perfil:', titulo_bloco),
        Paragraph('- Ver analise completa da IA', item),
        Paragraph('- Calcular / recalcular score', item),
        Paragraph('- Enviar mensagem direta', item),
        Paragraph('- Agendar entrevista', item),
        Paragraph('- Vincular a uma vaga', item),
        Paragraph('- Avancar etapa ou reprovar', item),
        Paragraph('- Download do curriculo', item),
        Paragraph('- Excluir candidato', item),
    ]
    t = Table([[col1, col2]], colWidths=[doc.width/2]*2)
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), AZUL_CLARO),
        ('BACKGROUND', (1,0), (1,0), CINZA_CLARO),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 1, AZUL),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 9 — ENTREVISTAS
    # =========================================================
    sec('Agendamento de Entrevistas')
    bloco('Campos ao agendar', [
        'Candidato (selecao via dropdown com todos os candidatos ativos)',
        'Data e horario da entrevista',
        'Tipo: RH, Tecnica ou Final',
        'Formato: Videoconferencia ou Presencial',
        'Link de acesso ou endereco local (campo obrigatorio)',
    ])
    bloco('Automacoes', [
        'E-mail automatico enviado ao candidato com todos os detalhes da entrevista',
        'Label inteligente: "Link de acesso" para video, "Local da entrevista" para presencial',
        'Data formatada em DD/MM/AAAA (nao no formato tecnico)',
        'Formato exibido como "Videoconferencia" ou "Presencial" (nao abreviado)',
        'Lembrete automatico enviado pelo servidor 24h antes da entrevista',
    ])
    story.append(PageBreak())

    # =========================================================
    # PAGINA 10 — OFERTAS
    # =========================================================
    sec('Gestao de Propostas e Ofertas')
    bloco('Campos da oferta', [
        'Candidato vinculado (selecao)',
        'Salario proposto',
        'Bonus de contratacao (signing bonus)',
        'Data de inicio prevista',
        'Prazo de validade da oferta',
        'Status: pendente, aceita ou recusada',
    ])
    story.append(Paragraph(
        'Ao salvar a oferta, um e-mail automatico e enviado ao candidato com o salario formatado '
        '(ex: R$ 10.000) e a data de inicio em formato legivel (DD/MM/AAAA).', corpo))
    story.append(PageBreak())

    # =========================================================
    # PAGINA 11 — E-MAILS AUTOMATICOS
    # =========================================================
    sec('6 E-mails Automaticos em Momentos-Chave', 'Comunicacao profissional sem esforco manual')

    emails_data = [
        ['#', 'Gatilho', 'Quando e disparado', 'Conteudo do e-mail'],
        ['1', 'Candidatura\nrecebida', 'Candidato se inscreve\nno portal', 'Confirmacao com\nlink do portal'],
        ['2', 'Entrevista\nagendada', 'RH agenda\numa entrevista', 'Data, hora, formato\ne link/endereco'],
        ['3', 'Oferta\nenviada', 'Proposta e\nregistrada', 'Salario e\ndata de inicio'],
        ['4', 'Contratado', 'Candidato avanca para\netapa "Contratado"', 'Parabens e\nproximo passos'],
        ['5', 'Feedback de\nreprovacao', 'Candidato e\nreprovado', 'Agradecimento e\nfeedback respeitoso'],
        ['6', 'Lembrete de\nentrevista', '24h antes da entrevista\n(automatico pelo servidor)', 'Lembrete com todos\nos dados'],
    ]
    t = Table(emails_data, colWidths=[10*mm, 35*mm, 60*mm, doc.width - 105*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL),
        ('TEXTCOLOR', (0,0), (-1,0), BRANCO),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [BRANCO, AZUL_CLARO]),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        '<b>Variaveis disponiveis nos templates:</b> {nome}, {cargo}, {empresa}, {data}, {hora}, '
        '{formato}, {label_local}, {link_agenda}, {salario}, {data_inicio}, {recrutador}, {link_portal}',
        corpo))
    story.append(Paragraph('Todos os templates sao editaveis pelo admin com sugestao automatica de conteudo ao selecionar o gatilho.', corpo))
    story.append(PageBreak())

    # =========================================================
    # PAGINA 12 — MENSAGENS
    # =========================================================
    sec('Mensagens Diretas com Candidatos')
    bloco('Funcionalidades', [
        'Chat interno entre RH e candidatos',
        'Lista de conversas com indicador de mensagens nao lidas',
        'RH pode iniciar conversa ou responder',
        'Candidato visualiza e responde pelo portal (Minha Area)',
        'Historico completo de cada conversa preservado',
        'Ideal para: tirar duvidas, solicitar documentos, dar feedbacks informais',
    ])
    story.append(PageBreak())

    # =========================================================
    # PAGINA 13 — DASHBOARD
    # =========================================================
    sec('Dashboard - Visao Geral em Tempo Real')
    metricas = [
        ['Metrica', 'Descricao'],
        ['Vagas abertas', 'Total de vagas com candidaturas ativas'],
        ['Total de candidatos', 'Todos os candidatos cadastrados no sistema'],
        ['Entrevistas na semana', 'Entrevistas agendadas para os proximos 7 dias'],
        ['Taxa de aprovacao', 'Percentual de candidatos em Triagem IA ou alem'],
        ['Candidatos por etapa', 'Distribuicao visual no pipeline'],
        ['Score medio por vaga', 'Media dos scores IA por posicao'],
        ['Candidatos recentes', 'Ultimos inscritos com score e vaga'],
    ]
    t = Table(metricas, colWidths=[65*mm, doc.width - 65*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), AZUL),
        ('TEXTCOLOR', (0,0), (-1,0), BRANCO),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [BRANCO, AZUL_CLARO]),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 14 — RELATORIOS E ASSISTENTE IA
    # =========================================================
    sec('Analise de Dados e Assistente Inteligente')
    col1 = [
        Paragraph('Relatorios:', titulo_bloco),
        Paragraph('- Distribuicao de candidatos por etapa', item),
        Paragraph('- Candidatos por vaga', item),
        Paragraph('- Score medio e taxa de aprovacao', item),
        Paragraph('- Historico de contratacoes', item),
    ]
    col2 = [
        Paragraph('Assistente IA (chat):', titulo_bloco),
        Paragraph('- Perguntas em linguagem natural sobre os dados', item),
        Paragraph('- "Quais candidatos tem maior score?"', item),
        Paragraph('- "Quantas vagas temos abertas?"', item),
        Paragraph('- "Qual a taxa de aprovacao este mes?"', item),
        Paragraph('- Respostas baseadas nos dados reais do banco', item),
    ]
    t = Table([[col1, col2]], colWidths=[doc.width/2]*2)
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), AZUL_CLARO),
        ('BACKGROUND', (1,0), (1,0), CINZA_CLARO),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 1, AZUL),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 15 — LGPD
    # =========================================================
    sec('Conformidade com a LGPD')
    bloco('Recursos de privacidade implementados', [
        'Consentimento explicito do candidato no momento do cadastro',
        'Aceite da politica de privacidade obrigatorio (checkbox)',
        'Exportacao de dados pessoais: candidato baixa todos os seus dados em JSON',
        'Exclusao de dados: RH pode excluir candidato e todas as suas informacoes',
        'Registro de consentimento com data e hora',
        'Dados armazenados com seguranca no Supabase (PostgreSQL)',
        'Candidato nao e reprovado automaticamente — sempre ha revisao humana disponivel',
    ])
    story.append(PageBreak())

    # =========================================================
    # PAGINA 16 — CONFIGURACOES E INFRAESTRUTURA
    # =========================================================
    sec('Configuracoes e Infraestrutura')
    col1 = [
        Paragraph('Configuracoes disponiveis:', titulo_bloco),
        Paragraph('- Nome e dados da empresa', item),
        Paragraph('- Configuracao de SMTP (qualquer provedor)', item),
        Paragraph('- Teste de conexao de e-mail', item),
        Paragraph('- Chave da API da IA (Anthropic)', item),
        Paragraph('- Conexao com Supabase', item),
    ]
    col2 = [
        Paragraph('Tecnologias utilizadas:', titulo_bloco),
        Paragraph('- Frontend: HTML5, CSS3, JavaScript puro', item),
        Paragraph('- Backend: Node.js', item),
        Paragraph('- Banco de dados: Supabase (PostgreSQL)', item),
        Paragraph('- IA: Claude Sonnet (Anthropic)', item),
        Paragraph('- E-mail: Nodemailer (SMTP)', item),
    ]
    t = Table([[col1, col2]], colWidths=[doc.width/2]*2)
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BACKGROUND', (0,0), (0,0), AZUL_CLARO),
        ('BACKGROUND', (1,0), (1,0), CINZA_CLARO),
        ('BOX', (0,0), (-1,-1), 1, AZUL),
        ('INNERGRID', (0,0), (-1,-1), 1, AZUL),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t)
    story.append(PageBreak())

    # =========================================================
    # PAGINA 17 — FLUXO COMPLETO
    # =========================================================
    sec('Fluxo Completo de Recrutamento', 'Do candidato ao contratado em 12 passos')

    fluxo = [
        ('1', 'RH publica vaga no sistema', AZUL),
        ('2', 'Vaga aparece no portal publico para candidatos', AZUL),
        ('3', 'Candidato se cadastra e se inscreve na vaga', AZUL),
        ('4', 'IA calcula score automaticamente em background', AZUL_ESCURO),
        ('5', 'E-mail de confirmacao enviado ao candidato', AZUL_ESCURO),
        ('6', 'Score >= 70%: candidato avanca para Triagem IA automaticamente', AZUL_ESCURO),
        ('7', 'RH analisa candidatos no pipeline e decide proximos passos', AZUL),
        ('8', 'RH agenda entrevista → e-mail automatico enviado com todos os detalhes', AZUL),
        ('9', 'Servidor envia lembrete automatico 24h antes da entrevista', AZUL),
        ('10', 'RH avanca candidato pelas etapas conforme avaliacao', AZUL),
        ('11', 'Oferta registrada → e-mail automatico enviado com salario e data de inicio', AZUL),
        ('12', 'Candidato contratado → e-mail de parabens enviado automaticamente', VERDE),
    ]
    for num, texto, cor in fluxo:
        row = Table([[
            Paragraph(f'<b>{num}</b>', ParagraphStyle('N', fontSize=11, textColor=BRANCO,
                      fontName='Helvetica-Bold', alignment=TA_CENTER)),
            Paragraph(texto, ParagraphStyle('F', fontSize=10, textColor=PRETO,
                      fontName='Helvetica', leading=14))
        ]], colWidths=[14*mm, doc.width - 14*mm])
        row.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (0,0), cor),
            ('BACKGROUND', (1,0), (1,0), AZUL_CLARO if num not in ['12'] else colors.HexColor('#e6f4dc')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('BOX', (0,0), (-1,-1), 0.5, colors.lightgrey),
        ]))
        story.append(row)
        story.append(Spacer(1, 2))
    story.append(PageBreak())

    # =========================================================
    # PAGINA 18 — COMO COMECAR
    # =========================================================
    sec('Como Comecar', 'Passos para implantacao do TalentAI')

    passos_impl = [
        ('1', 'Configurar o servidor Node.js', 'Instalar Node.js e rodar: npm install && node server.js'),
        ('2', 'Criar conta no Supabase', 'Acessar supabase.com, criar projeto e executar o schema SQL fornecido'),
        ('3', 'Configurar o arquivo .env', 'Preencher as credenciais: Anthropic API Key, SMTP, Supabase URL e Service Key'),
        ('4', 'Cadastrar os 6 templates de e-mail', 'No admin, acessar "E-mails auto" e criar um template para cada gatilho'),
        ('5', 'Publicar as vagas abertas', 'No admin, acessar "Vagas" e cadastrar as posicoes disponiveis'),
        ('6', 'Divulgar o link do portal', 'Compartilhar http://seudominio.com/portal nas redes sociais e vagas'),
    ]

    for num, titulo_passo, desc in passos_impl:
        bloco_data = [[
            Paragraph(f'<b>Passo {num}: {titulo_passo}</b>',
                      ParagraphStyle('PT', fontSize=11, textColor=AZUL_ESCURO,
                                     fontName='Helvetica-Bold')),
        ], [
            Paragraph(desc, corpo),
        ]]
        t = Table(bloco_data, colWidths=[doc.width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), AZUL_CLARO),
            ('BACKGROUND', (0,1), (-1,-1), BRANCO),
            ('BOX', (0,0), (-1,-1), 1, AZUL),
            ('LINEBELOW', (0,0), (-1,0), 1, AZUL),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 5))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width='100%', thickness=2, color=AZUL))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        'TalentAI — Sistema desenvolvido para otimizar o recrutamento com inteligencia artificial',
        ParagraphStyle('Rodape', fontSize=10, textColor=CINZA, fontName='Helvetica-Oblique',
                       alignment=TA_CENTER)))

    doc.build(story)
    print(f'PDF gerado com sucesso: {path}')

build_pdf()
