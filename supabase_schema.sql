-- ============================================================
-- TalentAI — Schema completo para Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- TABELAS PRINCIPAIS
-- ============================================================

-- Empresas
create table public.empresas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slogan text,
  setor text,
  tamanho text,
  website text,
  logo_url text,
  sobre text,
  beneficios text[],
  valores jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Usuários de RH (vinculados ao auth.users do Supabase)
create table public.usuarios_rh (
  id uuid primary key references auth.users(id) on delete cascade,
  empresa_id uuid references public.empresas(id),
  nome text not null,
  email text not null unique,
  papel text not null default 'recrutador'
    check (papel in ('admin','gerente_rh','recrutador','analista','estagiario')),
  avatar_url text,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Candidatos
create table public.candidatos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  telefone text,
  linkedin text,
  localizacao text,
  disponibilidade text default 'imediata',
  cv_url text,
  resumo text,
  habilidades text[],
  experiencia_anos int,
  pretensao_salarial numeric,
  consentimento_lgpd boolean default false,
  consentimento_contato boolean default false,
  consentimento_parceiros boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vagas
create table public.vagas (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id) on delete cascade,
  criado_por uuid references public.usuarios_rh(id),
  titulo text not null,
  area text not null,
  modalidade text not null check (modalidade in ('remoto','hibrido','presencial')),
  tipo_contrato text not null check (tipo_contrato in ('clt','pj','estagio','freelance')),
  salario_min numeric,
  salario_max numeric,
  descricao text,
  requisitos text[],
  diferenciais text[],
  tags text[],
  status text not null default 'ativa' check (status in ('ativa','pausada','encerrada','rascunho')),
  publicada_em timestamptz default now(),
  encerrada_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Candidaturas
create table public.candidaturas (
  id uuid primary key default uuid_generate_v4(),
  candidato_id uuid references public.candidatos(id) on delete cascade,
  vaga_id uuid references public.vagas(id) on delete cascade,
  etapa text not null default 'inscrito'
    check (etapa in ('inscrito','triagem_ia','entrevista_rh','entrevista_tecnica','finalista','oferta','contratado','reprovado')),
  score_ia numeric check (score_ia between 0 and 100),
  analise_ia text,
  notas_rh text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(candidato_id, vaga_id)
);

-- Entrevistas
create table public.entrevistas (
  id uuid primary key default uuid_generate_v4(),
  candidatura_id uuid references public.candidaturas(id) on delete cascade,
  agendado_por uuid references public.usuarios_rh(id),
  data_hora timestamptz not null,
  duracao_minutos int default 60,
  tipo text not null check (tipo in ('rh','tecnica','final','painel')),
  formato text not null check (formato in ('video','presencial','telefone')),
  link_video text,
  entrevistadores text[],
  status text default 'agendada' check (status in ('agendada','realizada','cancelada','reagendada')),
  feedback text,
  nota int check (nota between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ofertas
create table public.ofertas (
  id uuid primary key default uuid_generate_v4(),
  candidatura_id uuid references public.candidaturas(id) on delete cascade,
  criado_por uuid references public.usuarios_rh(id),
  salario numeric not null,
  bonus_signing numeric default 0,
  data_inicio date,
  validade date,
  status text default 'pendente' check (status in ('pendente','aceita','recusada','negociando','expirada')),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Mensagens (RH <-> Candidato)
create table public.mensagens (
  id uuid primary key default uuid_generate_v4(),
  candidatura_id uuid references public.candidaturas(id) on delete cascade,
  remetente_tipo text not null check (remetente_tipo in ('rh','candidato')),
  remetente_id uuid not null,
  conteudo text not null,
  lida boolean default false,
  created_at timestamptz default now()
);

-- Notificações
create table public.notificacoes (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references public.usuarios_rh(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  descricao text,
  lida boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Assessments (Testes)
create table public.assessments (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id),
  titulo text not null,
  tipo text not null check (tipo in ('tecnico','cognitivo','comportamental')),
  duracao_minutos int not null,
  questoes jsonb not null default '[]',
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Resultados de assessments
create table public.assessment_resultados (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references public.assessments(id),
  candidatura_id uuid references public.candidaturas(id),
  respostas jsonb,
  score numeric,
  concluido_em timestamptz,
  created_at timestamptz default now()
);

-- Templates de e-mail
create table public.email_templates (
  id uuid primary key default uuid_generate_v4(),
  empresa_id uuid references public.empresas(id),
  gatilho text not null,
  assunto text not null,
  corpo text not null,
  ativo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Log de e-mails enviados
create table public.emails_enviados (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references public.email_templates(id),
  candidatura_id uuid references public.candidaturas(id),
  destinatario text not null,
  assunto text not null,
  enviado_em timestamptz default now(),
  status text default 'enviado' check (status in ('enviado','falhou','bounced'))
);

-- Onboarding
create table public.onboarding (
  id uuid primary key default uuid_generate_v4(),
  candidatura_id uuid references public.candidaturas(id) on delete cascade,
  data_inicio date not null,
  checklist jsonb not null default '[]',
  buddy_id uuid references public.usuarios_rh(id),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- VIEWS ÚTEIS
-- ============================================================

-- Pipeline completo por vaga
create or replace view public.v_pipeline as
select
  v.id as vaga_id,
  v.titulo as vaga_titulo,
  v.status as vaga_status,
  c.id as candidato_id,
  c.nome as candidato_nome,
  c.email as candidato_email,
  cand.id as candidatura_id,
  cand.etapa,
  cand.score_ia,
  cand.created_at as aplicado_em,
  cand.updated_at as atualizado_em
from public.vagas v
join public.candidaturas cand on cand.vaga_id = v.id
join public.candidatos c on c.id = cand.candidato_id;

-- Métricas por empresa
create or replace view public.v_metricas as
select
  v.empresa_id,
  count(distinct v.id) as total_vagas_ativas,
  count(distinct cand.id) as total_candidaturas,
  count(distinct case when cand.etapa = 'contratado' then cand.id end) as total_contratados,
  round(avg(cand.score_ia)::numeric, 1) as score_medio_ia,
  count(distinct case when cand.score_ia >= 80 then cand.id end) as cands_alta_compatibilidade
from public.vagas v
left join public.candidaturas cand on cand.vaga_id = v.id
where v.status = 'ativa'
group by v.empresa_id;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.empresas enable row level security;
alter table public.usuarios_rh enable row level security;
alter table public.vagas enable row level security;
alter table public.candidatos enable row level security;
alter table public.candidaturas enable row level security;
alter table public.entrevistas enable row level security;
alter table public.ofertas enable row level security;
alter table public.mensagens enable row level security;
alter table public.notificacoes enable row level security;
alter table public.assessments enable row level security;
alter table public.email_templates enable row level security;
alter table public.onboarding enable row level security;

-- Usuários RH só veem dados da própria empresa
create policy "rh_empresa" on public.vagas
  for all using (
    empresa_id = (select empresa_id from public.usuarios_rh where id = auth.uid())
  );

create policy "rh_candidaturas" on public.candidaturas
  for all using (
    vaga_id in (
      select id from public.vagas
      where empresa_id = (select empresa_id from public.usuarios_rh where id = auth.uid())
    )
  );

create policy "rh_notificacoes" on public.notificacoes
  for all using (usuario_id = auth.uid());

-- Vagas públicas (anon pode ler vagas ativas)
create policy "vagas_publicas" on public.vagas
  for select using (status = 'ativa');

-- Candidatos podem ver/editar próprio perfil
create policy "candidato_proprio_perfil" on public.candidatos
  for all using (email = (select email from auth.users where id = auth.uid()));

-- Candidatos veem próprias candidaturas
create policy "candidato_proprias_cands" on public.candidaturas
  for select using (
    candidato_id = (select id from public.candidatos where email = (select email from auth.users where id = auth.uid()))
  );

-- ============================================================
-- TRIGGERS — updated_at automático
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger t_empresas_updated before update on public.empresas for each row execute function public.set_updated_at();
create trigger t_vagas_updated before update on public.vagas for each row execute function public.set_updated_at();
create trigger t_candidatos_updated before update on public.candidatos for each row execute function public.set_updated_at();
create trigger t_candidaturas_updated before update on public.candidaturas for each row execute function public.set_updated_at();
create trigger t_entrevistas_updated before update on public.entrevistas for each row execute function public.set_updated_at();
create trigger t_ofertas_updated before update on public.ofertas for each row execute function public.set_updated_at();

-- ============================================================
-- DADOS DE EXEMPLO (seed)
-- ============================================================

-- Empresa
insert into public.empresas (id, nome, slogan, setor, tamanho, website, sobre, beneficios)
values (
  'a0000000-0000-0000-0000-000000000001',
  'TechCorp Brasil',
  'Construindo o futuro com tecnologia e pessoas',
  'Tecnologia',
  '51-200',
  'https://techcorp.com.br',
  'Empresa de tecnologia focada em produtos digitais.',
  array['PLR','Plano de saúde','Home office','Bolsa estudos','Stock options','Gympass']
);

-- Vagas de exemplo
insert into public.vagas (empresa_id, titulo, area, modalidade, tipo_contrato, salario_min, salario_max, descricao, tags, status)
values
  ('a0000000-0000-0000-0000-000000000001','Engenheiro Backend Sênior','Tecnologia','remoto','clt',18000,25000,'Sistemas distribuídos de alta escala.',array['Java','Kafka','k8s','AWS'],'ativa'),
  ('a0000000-0000-0000-0000-000000000001','Product Designer','Design','hibrido','pj',12000,16000,'Experiências digitais em produtos SaaS.',array['Figma','UX','Design System'],'ativa'),
  ('a0000000-0000-0000-0000-000000000001','Data Scientist','Tecnologia','remoto','clt',15000,20000,'Modelos de ML para recomendações.',array['Python','ML','SQL','Spark'],'ativa');

-- Templates de e-mail padrão
insert into public.email_templates (empresa_id, gatilho, assunto, corpo)
values
  ('a0000000-0000-0000-0000-000000000001','candidatura_recebida','Sua candidatura para {cargo} foi recebida','Olá {nome},\n\nRecebemos sua candidatura para {cargo} na {empresa}!\n\nNossa equipe irá analisar seu perfil em até 3 dias úteis.\n\nAcompanhe o status em: {link_portal}\n\nAtenciosamente,\n{recrutador}'),
  ('a0000000-0000-0000-0000-000000000001','candidato_aprovado','Ótimas notícias sobre sua candidatura para {cargo}','Olá {nome},\n\nFicamos impressionados com seu perfil e gostaríamos de avançar no processo seletivo!\n\nAgende sua entrevista em: {link_agenda}\n\nAtenciosamente,\n{recrutador}'),
  ('a0000000-0000-0000-0000-000000000001','feedback_reprovacao','Atualização sobre sua candidatura para {cargo}','Olá {nome},\n\nAgradecemos seu interesse e tempo dedicado ao processo seletivo para {cargo}.\n\nApós análise cuidadosa, seguiremos com outros candidatos desta vez.\n\nGuardaremos seu perfil para oportunidades futuras.\n\nAtenciosamente,\n{recrutador}');
  
  drop view if exists public.v_pipeline;

create or replace view public.v_pipeline as
select
  c.id as candidato_id,
  c.nome as candidato_nome,
  c.email as candidato_email,
  c.habilidades,
  c.experiencia_anos,
  cand.id as candidatura_id,
  cand.etapa,
  cand.score_ia,
  cand.created_at as aplicado_em,
  cand.updated_at as atualizado_em,
  v.id as vaga_id,
  v.titulo as vaga_titulo
from public.candidatos c
left join public.candidaturas cand on cand.candidato_id = c.id
left join public.vagas v on v.id = cand.vaga_id;
