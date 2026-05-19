# TalentAI — Plano de Testes Completo

## Pré-requisitos
- Servidor rodando: `node server.js`
- `.env` configurado com `ANTHROPIC_API_KEY`, `SMTP_*`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `EMPRESA_ID`
- Supabase conectado (badge verde no admin)
- Pelo menos 6 templates de e-mail cadastrados (um por gatilho)
- SQL executado: `ALTER TABLE entrevistas ADD COLUMN IF NOT EXISTS lembrete_enviado timestamptz;`
- E-mail real acessível para verificar disparos

---

## T01 — Autenticação e sessão (Portal)

### T01.1 — Criar conta
**Passos:**
1. Acessar `http://localhost:3000/portal`
2. Clicar em "Entrar / Criar conta"
3. Ir na aba "Primeira vez"
4. Preencher: Nome, E-mail, Telefone, Localização, Habilidades
5. Marcar checkbox LGPD
6. Clicar "Criar conta"

**Resultado esperado:**
- Modal fecha
- Toast "Conta criada com sucesso!"
- Nome aparece no canto superior direito
- Vagas permanecem visíveis (não somem)
- Campo de busca permanece vazio

**Resultado negativo (testar também):**
- Tentar criar sem marcar LGPD → erro "Você precisa aceitar a política de privacidade"
- Tentar criar com e-mail já cadastrado → erro "E-mail já cadastrado"
- Tentar criar sem nome ou e-mail → erro "Nome e e-mail são obrigatórios"

---

### T01.2 — Login com conta existente
**Passos:**
1. Recarregar a página
2. Clicar em "Entrar / Criar conta"
3. Ir na aba "Já tenho conta"
4. Digitar o e-mail cadastrado
5. Clicar "Entrar"

**Resultado esperado:**
- Modal fecha
- Toast "Bem-vindo de volta, {Nome}!"
- Sessão restaurada (nome no nav)
- Vagas permanecem visíveis

**Resultado negativo:**
- E-mail não cadastrado → erro "E-mail não encontrado"

---

## T02 — Vagas (Admin)

### T02.1 — Criar vaga
**Passos:**
1. Acessar `http://localhost:3000`
2. Ir em **Vagas** → "+ Nova vaga"
3. Preencher todos os campos: Título, Área, Modalidade, Tipo contrato, Salário mín/máx, Requisitos, Tags, Descrição
4. Clicar "Salvar"

**Resultado esperado:**
- Toast "Vaga salva!"
- Vaga aparece na lista
- Vaga aparece no portal em `http://localhost:3000/portal`

---

### T02.2 — Gerar descrição com IA
**Passos:**
1. Criar/editar uma vaga
2. Preencher Título, Área e Requisitos
3. Clicar "Gerar JD ✨"

**Resultado esperado:**
- Botão mostra "Gerando..."
- Campo Descrição é preenchido com texto profissional gerado pela IA
- Toast de confirmação

---

### T02.3 — Editar vaga
**Passos:**
1. Clicar no ícone de edição de uma vaga
2. Alterar o título
3. Salvar

**Resultado esperado:**
- Toast "Vaga atualizada!"
- Título atualizado na lista e no portal

---

### T02.4 — Excluir vaga
**Passos:**
1. Abrir detalhes de uma vaga
2. Clicar no ícone de lixeira
3. Confirmar no popup

**Resultado esperado:**
- Vaga removida da lista
- Vaga não aparece mais no portal

---

## T03 — Portal de vagas

### T03.1 — Filtros e busca
**Passos:**
1. Acessar o portal
2. Digitar "PHP" no campo de busca → clicar Buscar
3. Clicar nos chips: Remoto, Híbrido, Tecnologia, CLT, PJ
4. Usar o select "Mais recentes" / "Maior salário" / "A-Z"

**Resultado esperado:**
- Vagas filtradas corretamente em cada caso
- Contador "X vagas encontradas" atualiza
- Ao limpar busca, todas as vagas retornam

---

### T03.2 — Ver detalhes da vaga
**Passos:**
1. Clicar em uma vaga na listagem

**Resultado esperado:**
- Modal abre com título, área, modalidade, salário, requisitos, descrição
- Botão "Candidatar-se" visível

---

## T04 — Candidatura (E-mail #1: candidatura_recebida)

### T04.1 — Se candidatar a uma vaga
**Passos:**
1. Estar logado no portal
2. Abrir detalhes de uma vaga
3. Clicar "Candidatar-se"
4. Preencher/confirmar dados (currículo opcional)
5. Confirmar candidatura

**Resultado esperado:**
- Toast de confirmação
- ✉️ E-mail **candidatura_recebida** chega com `{nome}` e `{cargo}` preenchidos
- No admin → Pipeline → candidato aparece em **Inscritos** com score calculado
- Se score ≥ 70 → avança automaticamente para **Triagem IA**
- Se score < 70 → permanece em **Inscritos** para revisão manual

**Resultado negativo:**
- Tentar se candidatar duas vezes → erro "Você já se candidatou a esta vaga"

---

### T04.2 — Score IA automático
**Passos:**
1. Após candidatura (T04.1), aguardar alguns segundos
2. No admin → Pipeline → verificar coluna do candidato

**Resultado esperado:**
- Badge de score colorido aparece no card (verde ≥85, amarelo ≥70, vermelho <70)
- Candidato com score ≥ 70 está em "Triagem IA"
- Candidato com score < 70 permanece em "Inscritos"

---

## T05 — Pipeline

### T05.1 — Filtro por vaga
**Passos:**
1. Ir em **Pipeline**
2. Usar o select no canto superior direito para escolher uma vaga específica

**Resultado esperado:**
- Pipeline mostra apenas candidatos daquela vaga
- Selecionar "Todas as vagas" retorna todos

---

### T05.2 — Avançar etapa manualmente
**Passos:**
1. Clicar na seta → no card de um candidato em Inscritos

**Resultado esperado:**
- Card move para a próxima coluna imediatamente (sem F5)
- Toast "Avançado para: Triagem IA"

---

### T05.3 — Triagem IA em massa
**Passos:**
1. Ter ao menos 2 candidatos em Inscritos sem score
2. Clicar em "Triagem IA"
3. Confirmar no popup

**Resultado esperado:**
- IA calcula score de cada candidato
- Candidatos ≥ 70 → movidos para Triagem IA
- Candidatos < 70 → permanecem em Inscritos
- Pipeline atualiza automaticamente

---

### T05.4 — Reprovar candidato
**Passos:**
1. Clicar no card de um candidato para abrir o perfil
2. Clicar em "Reprovar"
3. Confirmar no popup

**Resultado esperado:**
- Candidato some do pipeline (vai para Reprovado, coluna não exibida)
- ✉️ E-mail **feedback_reprovacao** chega com `{nome}` e `{cargo}`
- Botão "Reprovar" não aparece para candidatos já contratados/reprovados

---

### T05.5 — Perfil do candidato no pipeline
**Passos:**
1. Clicar no card de um candidato

**Resultado esperado:**
- Modal abre com: nome, e-mail, telefone, localização, habilidades, score, análise IA
- Botões: Fechar, Excluir, CV (ícone), Mensagem (ícone), Agendar (ícone), Reprovar, Avançar etapa
- Clicar em Agendar → navega para tela de Entrevistas
- Clicar em Mensagem → navega para tela de Mensagens

---

## T06 — Entrevistas (E-mail #2: candidato_aprovado)

### T06.1 — Agendar entrevista
**Passos:**
1. Ir em **Entrevistas** → Nova entrevista
2. Selecionar candidato, data, hora, tipo, formato
3. Preencher link/endereço (obrigatório)
4. Clicar "Agendar"

**Resultado esperado:**
- Toast "Entrevista agendada!"
- Entrevista aparece na lista
- ✉️ E-mail **candidato_aprovado** chega com:
  - `{nome}` preenchido
  - `{cargo}` preenchido
  - `{data}` no formato DD/MM/AAAA
  - `{hora}` no formato HH:MM
  - `{formato}` como "Videoconferência" ou "Presencial" (não "video")
  - `{label_local}` como "Link de acesso" ou "Local da entrevista"
  - `{link_agenda}` com o valor informado

**Resultado negativo:**
- Tentar salvar sem link/endereço → erro "Informe o link de videoconferência ou endereço"
- Tentar salvar sem data ou hora → erro "Preencha todos os campos"

---

### T06.2 — Lembrete automático (E-mail #6: lembrete_entrevista)
**Passos:**
1. Agendar uma entrevista para daqui a menos de 24h
2. Aguardar até 1h (servidor verifica a cada hora)
3. OU reduzir o intervalo em `server.js` para 10s temporariamente

**Resultado esperado:**
- ✉️ E-mail **lembrete_entrevista** chega com:
  - `{data}` formatada em pt-BR
  - `{hora}` formatada em pt-BR
  - `{label_local}` correto conforme formato
  - `{recrutador}` = "RH" (não literal `{recrutador}`)
- Campo `lembrete_enviado` preenchido na tabela → e-mail não é reenviado

---

## T07 — Ofertas (E-mail #3: oferta_enviada)

### T07.1 — Criar oferta
**Passos:**
1. Ir em **Ofertas** → Nova oferta
2. Selecionar candidato, preencher salário e data de início
3. Clicar "Salvar"

**Resultado esperado:**
- Toast "Oferta salva no banco!"
- Oferta aparece na lista
- ✉️ E-mail **oferta_enviada** chega com:
  - `{salario}` formatado como "R$ 10.000"
  - `{data_inicio}` no formato DD/MM/AAAA (não AAAA-MM-DD)

---

## T08 — Contratação (E-mail #4: contratado)

### T08.1 — Contratar candidato
**Passos:**
1. No Pipeline, candidato em etapa "Oferta"
2. Clicar na seta → para avançar para "Contratado"

**Resultado esperado:**
- Card move para coluna Contratados
- ✉️ E-mail **contratado** chega

---

## T09 — E-mails automáticos (Admin)

### T09.1 — Editor de templates
**Passos:**
1. Ir em **E-mails auto**
2. Selecionar um gatilho no dropdown do editor

**Resultado esperado:**
- Assunto e corpo são preenchidos automaticamente com sugestão
- Ao editar um template existente (clicar nele), o auto-fill NÃO sobrescreve

---

### T09.2 — Disparar e-mail manualmente
**Passos:**
1. Em **E-mails auto**, preencher: destinatário, nome, cargo, template
2. Clicar "Disparar"

**Resultado esperado:**
- Mensagem "✓ E-mail enviado para {destinatário}"
- E-mail chega sem variáveis literais (`{nome}`, `{cargo}` etc.)

---

### T09.3 — Variáveis nos templates
**Passos:**
1. Editar o template `candidato_aprovado` com o corpo correto
2. Agendar uma entrevista

**Resultado esperado:**
- Nenhuma variável aparece literal no e-mail recebido
- `{data}` → DD/MM/AAAA
- `{hora}` → HH:MM
- `{formato}` → "Videoconferência" ou "Presencial"
- `{label_local}` → "Link de acesso" ou "Local da entrevista"
- `{link_agenda}` → URL ou endereço informado
- `{recrutador}` → "RH"
- `{empresa}` → "TalentAI"

---

## T10 — Portal: Minha área

### T10.1 — Ver candidaturas
**Passos:**
1. Logar no portal
2. Ir em "Minha área" → aba "Minhas candidaturas"

**Resultado esperado:**
- Lista de candidaturas com: cargo, empresa, etapa atual, score IA colorido
- Score verde (≥85), amarelo (≥70), vermelho (<70)
- Análise da IA visível ao expandir

---

### T10.2 — Exportar dados (LGPD)
**Passos:**
1. Na "Minha área", clicar em "Exportar meus dados"

**Resultado esperado:**
- Download de arquivo JSON com todos os dados do candidato
- Arquivo contém: nome, e-mail, telefone, habilidades, candidaturas

---

## T11 — Mensagens

### T11.1 — Enviar mensagem do admin para candidato
**Passos:**
1. Ir em **Mensagens** → Nova mensagem
2. Selecionar candidato e digitar mensagem
3. Enviar

**Resultado esperado:**
- Mensagem aparece no chat
- Candidato vê a mensagem na "Minha área" no portal

---

## T12 — Regressão: bugs anteriores corrigidos

| # | Bug | Como testar | Esperado |
|---|---|---|---|
| R01 | Vagas somem ao criar conta | Criar conta no portal | Vagas permanecem visíveis |
| R02 | `{link_agenda}` literal no e-mail | Agendar entrevista com link | Link aparece corretamente |
| R03 | Data no formato AAAA-MM-DD | Ver e-mail de entrevista/oferta | Data em DD/MM/AAAA |
| R04 | Formato "video" no e-mail | Agendar entrevista por vídeo | Aparece "Videoconferência" |
| R05 | `{recrutador}` literal no lembrete | Receber lembrete de entrevista | Aparece "RH" |
| R06 | Pipeline não atualiza ao avançar | Clicar → no card | Card move sem F5 |
| R07 | Agendar no modal vai para tela errada | Clicar ícone calendário no perfil | Navega para Entrevistas |
| R08 | "Link de acesso" para endereço presencial | Agendar presencial e ver e-mail | Aparece "Local da entrevista" |
| R09 | Score ≥70 não avança no pipeline | Calcular score individualmente | Pipeline atualiza automaticamente |
| R10 | Candidato com score ≥70 fica em Inscritos | Candidato se inscreve via portal | Avança para Triagem IA |

---

## T13 — Candidatos (Admin)

### T13.1 — Visualizar lista de candidatos
**Passos:**
1. Ir em **Candidatos**

**Resultado esperado:**
- Tabela com nome, e-mail, habilidades, score, etapa atual
- Contador total de candidatos no subtítulo

---

### T13.2 — Ver perfil completo
**Passos:**
1. Clicar no ícone de olho (detalhes) de um candidato

**Resultado esperado:**
- Modal abre com: avatar, nome, e-mail, telefone, localização, habilidades, score IA, análise IA, LGPD, data de cadastro
- Se candidato tem CV → botão de download visível
- Botões de ação corretos conforme situação (com ou sem vaga vinculada)

---

### T13.3 — Calcular score individualmente
**Passos:**
1. Abrir perfil de candidato vinculado a uma vaga sem score
2. Clicar "Calcular score IA"

**Resultado esperado:**
- Botão muda para "Calculando..."
- Score aparece no modal com cor correta
- Análise IA exibida
- Pipeline atualiza automaticamente (candidato move de coluna se ≥ 70)

---

### T13.4 — Excluir candidato
**Passos:**
1. Abrir perfil de um candidato
2. Clicar "Excluir"
3. Confirmar no popup

**Resultado esperado:**
- Candidato removido da lista
- Candidaturas associadas também removidas

---

### T13.5 — Vincular candidato à vaga
**Passos:**
1. Abrir perfil de candidato sem vaga vinculada
2. Clicar "Vincular à vaga"
3. Selecionar uma vaga
4. Confirmar

**Resultado esperado:**
- Candidatura criada
- Candidato aparece no Pipeline

---

### T13.6 — Upload de currículo
**Passos:**
1. Durante candidatura no portal, anexar um arquivo PDF
2. No admin, abrir perfil do candidato

**Resultado esperado:**
- Botão "CV" visível no modal
- Clicar no botão faz download do arquivo

---

## T14 — Dashboard

### T14.1 — Números do dashboard
**Passos:**
1. Ir em **Dashboard**
2. Comparar os números com os dados reais

**Resultado esperado:**
- Vagas abertas = quantidade de vagas com status ativo
- Total candidatos = total na tabela candidatos
- Entrevistas esta semana = entrevistas agendadas nos próximos 7 dias
- Taxa de aprovação = % de candidatos em triagem_ia ou além

---

### T14.2 — Candidatos recentes
**Passos:**
1. No dashboard, verificar seção "Candidatos recentes"

**Resultado esperado:**
- Últimos 4-5 candidatos com score e vaga
- Clicar em um candidato abre o perfil

---

### T14.3 — Atualização após ações
**Passos:**
1. Estar no dashboard
2. Em outra aba, criar uma vaga nova
3. Voltar ao dashboard e clicar em refresh

**Resultado esperado:**
- Contador de vagas atualizado

---

## T15 — Relatórios

### T15.1 — Gerar relatório
**Passos:**
1. Ir em **Relatórios**
2. Verificar os dados exibidos

**Resultado esperado:**
- Gráfico ou tabela com distribuição por etapa do pipeline
- Candidatos por vaga
- Score médio por vaga

---

## T16 — Assistente IA

### T16.1 — Fazer pergunta ao assistente
**Passos:**
1. Ir em **Assistente IA**
2. Digitar: "Quais candidatos têm maior score?"
3. Enviar

**Resultado esperado:**
- Resposta coerente baseada nos dados do Supabase
- Sem mensagem de erro

---

### T16.2 — Contexto de dados
**Passos:**
1. Perguntar: "Quantas vagas temos abertas?"

**Resultado esperado:**
- Número correto informado na resposta

---

## T17 — Configurações

### T17.1 — Salvar dados da empresa
**Passos:**
1. Ir em **Configurações**
2. Alterar nome da empresa
3. Salvar

**Resultado esperado:**
- Toast de confirmação
- Nome atualizado

---

### T17.2 — Testar conexão SMTP
**Passos:**
1. Em **Configurações**, clicar em "Testar e-mail"
2. Informar um e-mail de destino

**Resultado esperado:**
- Toast "E-mail enviado!"
- ✉️ E-mail de teste chega na caixa informada

---

## T18 — Mensagens completas

### T18.1 — Admin envia mensagem para candidato
**Passos:**
1. Ir em **Mensagens** → Nova mensagem
2. Selecionar candidatura e digitar texto
3. Enviar

**Resultado esperado:**
- Mensagem aparece no chat lado direito
- Candidato vê a mensagem no portal (Minha área → Mensagens)

---

### T18.2 — Candidato responde pelo portal
**Passos:**
1. No portal, ir em "Minha área"
2. Abrir mensagem do RH
3. Digitar resposta e enviar

**Resultado esperado:**
- Mensagem salva no banco
- No admin → Mensagens → badge de não lida aparece na conversa
- Ao abrir a conversa, mensagem é marcada como lida

---

### T18.3 — Indicador de mensagens não lidas
**Passos:**
1. Candidato envia mensagem pelo portal
2. Verificar admin sem abrir a conversa

**Resultado esperado:**
- Badge numérico vermelho aparece na conversa do candidato

---

## T19 — Fluxos de erro e validação

### T19.1 — Formulários sem campos obrigatórios

| Formulário | Campo vazio | Erro esperado |
|---|---|---|
| Nova vaga | Título | "Preencha o título" |
| Agendar entrevista | Link/endereço | "Informe o link de videoconferência ou endereço" |
| Agendar entrevista | Data ou hora | "Preencha todos os campos" |
| Nova oferta | Salário | "Preencha os campos" |
| Template e-mail | Assunto ou corpo | "Preencha assunto e corpo" |
| Criar conta portal | Nome ou e-mail | "Nome e e-mail são obrigatórios" |
| Criar conta portal | LGPD | "Você precisa aceitar a política de privacidade" |

---

### T19.2 — Candidatura duplicada
**Passos:**
1. Estar logado no portal
2. Se candidatar a uma vaga
3. Tentar se candidatar à mesma vaga novamente

**Resultado esperado:**
- Erro "Você já se candidatou a esta vaga" (ou similar)
- Nenhuma candidatura duplicada no banco

---

### T19.3 — Servidor sem SMTP configurado
**Passos:**
1. Remover `SMTP_HOST` do `.env`
2. Reiniciar o servidor
3. Tentar disparar um e-mail automático

**Resultado esperado:**
- Aviso no terminal: "SMTP_HOST não configurado. E-mails desativados."
- Sistema continua funcionando normalmente (sem crash)
- E-mail não é enviado mas sem erro visível para o usuário

---

### T19.4 — Supabase indisponível
**Passos:**
1. Alterar `SUPABASE_URL` para uma URL inválida
2. Acessar o admin

**Resultado esperado:**
- Badge "Supabase conectado" não aparece ou aparece em erro
- Mensagens de erro amigáveis nas seções que tentam carregar dados
- Sistema não trava completamente

---

### T19.5 — IA sem chave configurada
**Passos:**
1. Remover `ANTHROPIC_API_KEY` do `.env`
2. Reiniciar servidor
3. Tentar calcular score ou usar Assistente IA

**Resultado esperado:**
- Aviso no terminal: "ANTHROPIC_API_KEY não encontrada"
- Toast de erro ao tentar usar funcionalidades de IA
- Restante do sistema funciona normalmente

---

## T20 — Demo mode

### T20.1 — Acesso sem Supabase
**Passos:**
1. Abrir `TalentAI_Supabase.html` diretamente no browser (via `file://`)

**Resultado esperado:**
- Banner "Modo demonstração" visível
- Dados fictícios carregados (candidatos, vagas, pipeline)
- Ações funcionam localmente (sem persistir no banco)
- E-mails automáticos não são disparados

---

## T21 — Portal: sessão e persistência

### T21.1 — Sessão persiste após recarregar
**Passos:**
1. Fazer login no portal
2. Recarregar a página (F5)

**Resultado esperado:**
- Usuário continua logado (nome no nav)
- Não precisa fazer login novamente

---

### T21.2 — Logout
**Passos:**
1. Estar logado no portal
2. Clicar no nome/avatar no canto superior direito
3. Clicar "Sair"

**Resultado esperado:**
- Sessão encerrada
- Botão "Entrar" volta a aparecer
- Aba "Minha área" não mostra dados pessoais

---

## Resumo dos e-mails automáticos

| Gatilho | Disparado quando | Variáveis obrigatórias |
|---|---|---|
| candidatura_recebida | Candidato se inscreve no portal | nome, cargo, empresa, link_portal |
| candidato_aprovado | Entrevista agendada no admin | nome, cargo, data, hora, formato, label_local, link_agenda, recrutador |
| oferta_enviada | Oferta salva no admin | nome, cargo, salario, data_inicio, recrutador |
| contratado | Candidato avança para Contratado | nome, cargo, empresa, recrutador |
| feedback_reprovacao | Candidato reprovado (manual ou IA) | nome, cargo, empresa, recrutador |
| lembrete_entrevista | 24h antes da entrevista (servidor) | nome, cargo, data, hora, label_local, link_agenda, recrutador |
