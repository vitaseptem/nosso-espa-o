-- =============================================================================
-- NOSSO UNIVERSO ❤️  —  Esquema completo do banco de dados (PostgreSQL / Supabase)
-- =============================================================================
-- Plataforma privada e exclusiva para um casal e sua filha (Valentina).
--
-- COMO USAR:
--   1. Abra o painel do Supabase  ->  SQL Editor  ->  New query
--   2. Cole TODO o conteúdo deste arquivo
--   3. Execute (RUN)
--   4. Vá em Authentication -> Providers -> Email e DESATIVE "Allow new users
--      to sign up" (Enable sign-ups = OFF). Isso, somado às regras abaixo,
--      garante que NÃO existirá cadastro de terceiros.
--   5. Crie manualmente os 2 usuários em Authentication -> Users -> Add user
--      usando EXATAMENTE os e-mails configurados na tabela `app_allowed_users`
--      (edite os e-mails na seção SEEDS antes de rodar, ou rode o UPDATE depois).
--
-- Este script é IDEMPOTENTE: pode ser executado várias vezes sem quebrar.
--
-- REGRA DE OURO: existem APENAS 2 usuários (marido e esposa). Qualquer tentativa
-- de criar um terceiro usuário é bloqueada no nível do banco de dados.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSÕES
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";      -- e-mails case-insensitive


-- =============================================================================
-- 1. TIPOS (ENUMS)
-- =============================================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('marido', 'esposa');
  end if;

  if not exists (select 1 from pg_type where typname = 'media_type') then
    create type public.media_type as enum ('foto', 'video', 'audio');
  end if;

  if not exists (select 1 from pg_type where typname = 'memory_category') then
    create type public.memory_category as enum
      ('foto', 'video', 'data', 'viagem', 'evento', 'outro');
  end if;

  if not exists (select 1 from pg_type where typname = 'event_type') then
    create type public.event_type as enum
      ('aniversario', 'casamento', 'namoro', 'viagem',
       'compromisso', 'consulta', 'evento_familiar', 'outro');
  end if;

  if not exists (select 1 from pg_type where typname = 'mood_kind') then
    create type public.mood_kind as enum
      ('feliz', 'apaixonado', 'cansado', 'triste',
       'irritado', 'animado', 'saudade');
  end if;

  if not exists (select 1 from pg_type where typname = 'thought_result') then
    create type public.thought_result as enum ('pendente', 'acertou', 'errou');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type public.message_type as enum ('texto', 'imagem', 'audio', 'emoji');
  end if;

  if not exists (select 1 from pg_type where typname = 'call_status') then
    create type public.call_status as enum
      ('chamando', 'aceita', 'recusada', 'encerrada', 'perdida');
  end if;

  if not exists (select 1 from pg_type where typname = 'signal_type') then
    create type public.signal_type as enum ('offer', 'answer', 'ice');
  end if;

  if not exists (select 1 from pg_type where typname = 'valentina_category') then
    create type public.valentina_category as enum
      ('primeiros_passos', 'primeiras_palavras', 'aniversarios', 'passeios',
       'escola', 'momentos_especiais', 'conquistas', 'familia');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum
      ('mensagem', 'chamada', 'evento', 'lembrete', 'memoria',
       'humor', 'pensamento', 'carta', 'sistema');
  end if;
end$$;


-- =============================================================================
-- 2. FUNÇÕES UTILITÁRIAS
-- =============================================================================

-- Atualiza automaticamente a coluna updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Retorna true se o usuário autenticado é um dos 2 usuários autorizados.
-- Usada por TODAS as políticas RLS — o dado é compartilhado entre o casal.
create or replace function public.is_authorized_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid()
  );
$$;


-- =============================================================================
-- 3. TABELAS DE CONFIGURAÇÃO / CONTROLE DE ACESSO
-- =============================================================================

-- Lista branca de e-mails permitidos. SOMENTE estes e-mails podem ter conta.
-- (Edite os e-mails na seção SEEDS, no final do arquivo.)
create table if not exists public.app_allowed_users (
  email         citext primary key,
  role          public.user_role not null unique,
  display_name  text not null,
  created_at    timestamptz not null default now()
);

-- Configurações globais da plataforma (linha única id = 1).
create table if not exists public.app_settings (
  id                       smallint primary key default 1,
  couple_name              text default 'Nosso Universo',
  relationship_start_date  date,          -- usado para o contador "dias juntos"
  couple_photo_path        text,          -- foto do casal no dashboard (bucket avatars)
  valentina_name           text default 'Valentina',
  valentina_birth_date     date,          -- usado para calcular a idade atual
  valentina_photo_path     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);


-- =============================================================================
-- 4. PERFIS DE USUÁRIO  (apenas 2)
-- =============================================================================
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         citext not null unique,
  role          public.user_role not null unique,
  display_name  text not null,
  avatar_url    text,
  is_online     boolean not null default false,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- =============================================================================
-- 5. MÓDULO 1 & 2 — LINHA DO TEMPO / ÁLBUM DE MEMÓRIAS
-- =============================================================================
create table if not exists public.memories (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.users(id) on delete cascade,
  title         text not null,
  description   text,
  memory_date   date not null,
  location      text,
  category      public.memory_category not null default 'outro',
  is_favorite   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.memory_media (
  id            uuid primary key default gen_random_uuid(),
  memory_id     uuid not null references public.memories(id) on delete cascade,
  storage_path  text not null,                 -- caminho no bucket "memories" (privado)
  media_type    public.media_type not null,
  caption       text,
  width         integer,
  height        integer,
  duration_sec  integer,                       -- para vídeo/áudio
  size_bytes    bigint,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);


-- =============================================================================
-- 6. MÓDULO 3 — CALENDÁRIO / DATAS ESPECIAIS
-- =============================================================================
create table if not exists public.events (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid not null references public.users(id) on delete cascade,
  title            text not null,
  description      text,
  event_type       public.event_type not null default 'outro',
  event_date       date not null,
  event_time       time,
  is_recurring     boolean not null default false,   -- repete todo ano (aniversários etc.)
  reminder_minutes integer,                           -- minutos antes p/ notificação PWA
  location         text,
  color            text,                              -- cor opcional na agenda
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);


-- =============================================================================
-- 7. MÓDULO 4 — ADIVINHE MEU PENSAMENTO
-- =============================================================================
create table if not exists public.thoughts_game (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.users(id) on delete cascade, -- quem pensou
  guesser_id     uuid references public.users(id) on delete set null,         -- quem adivinha
  hint           text,                                  -- dica/pergunta pública
  secret_answer  text not null,                         -- o pensamento real
  guess          text,                                  -- tentativa do parceiro
  result         public.thought_result not null default 'pendente',
  points         integer not null default 0,
  answered_at    timestamptz,
  created_at     timestamptz not null default now()
);


-- =============================================================================
-- 8. MÓDULO 5 — HUMOR DO DIA
-- =============================================================================
create table if not exists public.mood_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  mood        public.mood_kind not null,
  note        text,
  log_date    date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (user_id, log_date)   -- um registro de humor por pessoa por dia
);


-- =============================================================================
-- 9. MÓDULO 6 — CHAT PRIVADO (Realtime)
-- =============================================================================
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  sender_id     uuid not null references public.users(id) on delete cascade,
  content       text,
  message_type  public.message_type not null default 'texto',
  media_path    text,                                  -- bucket "chat" (privado)
  reply_to_id   uuid references public.messages(id) on delete set null,
  is_read       boolean not null default false,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);


-- =============================================================================
-- 10. MÓDULO 7 — CHAMADA DE ÁUDIO (WebRTC)
-- =============================================================================
create table if not exists public.audio_calls (
  id               uuid primary key default gen_random_uuid(),
  caller_id        uuid not null references public.users(id) on delete cascade,
  callee_id        uuid not null references public.users(id) on delete cascade,
  status           public.call_status not null default 'chamando',
  started_at       timestamptz not null default now(),
  accepted_at      timestamptz,
  ended_at         timestamptz,
  duration_seconds integer,
  created_at       timestamptz not null default now()
);

-- Sinalização WebRTC (offer / answer / ICE candidates) trocada via Realtime.
create table if not exists public.call_signals (
  id           uuid primary key default gen_random_uuid(),
  call_id      uuid not null references public.audio_calls(id) on delete cascade,
  sender_id    uuid not null references public.users(id) on delete cascade,
  kind         public.signal_type not null,
  payload      jsonb not null,
  created_at   timestamptz not null default now()
);


-- =============================================================================
-- 11. MÓDULO 8 — CARTAS PARA O FUTURO
-- =============================================================================
create table if not exists public.future_letters (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.users(id) on delete cascade,
  recipient_id  uuid references public.users(id) on delete set null,
  title         text not null,
  content       text not null,
  open_date     date not null,                 -- liberada somente a partir desta data
  is_opened     boolean not null default false,
  opened_at     timestamptz,
  created_at    timestamptz not null default now()
);


-- =============================================================================
-- 12. MÓDULO 10 — CANTINHO DA VALENTINA 👧
-- =============================================================================
create table if not exists public.valentina_memories (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.users(id) on delete cascade,
  title         text not null,
  description   text,
  category      public.valentina_category not null default 'momentos_especiais',
  memory_date   date not null,
  age_years     integer,                       -- idade na época (anos)
  age_months    integer,                       -- idade na época (meses)
  is_favorite   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.valentina_media (
  id            uuid primary key default gen_random_uuid(),
  memory_id     uuid not null references public.valentina_memories(id) on delete cascade,
  storage_path  text not null,                 -- bucket "valentina" (privado)
  media_type    public.media_type not null,
  caption       text,
  width         integer,
  height        integer,
  duration_sec  integer,
  size_bytes    bigint,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now()
);


-- =============================================================================
-- 13. NOTIFICAÇÕES (PWA)
-- =============================================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  type        public.notification_type not null default 'sistema',
  title       text not null,
  body        text,
  data        jsonb not null default '{}'::jsonb,
  is_read     boolean not null default false,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);


-- =============================================================================
-- 14. ÍNDICES
-- =============================================================================
create index if not exists idx_memories_date          on public.memories (memory_date desc);
create index if not exists idx_memories_author         on public.memories (author_id);
create index if not exists idx_memories_category       on public.memories (category);
create index if not exists idx_memories_favorite       on public.memories (is_favorite) where is_favorite;

create index if not exists idx_memory_media_memory     on public.memory_media (memory_id);
create index if not exists idx_memory_media_type       on public.memory_media (media_type);

create index if not exists idx_events_date             on public.events (event_date);
create index if not exists idx_events_type             on public.events (event_type);

create index if not exists idx_thoughts_author         on public.thoughts_game (author_id);
create index if not exists idx_thoughts_result         on public.thoughts_game (result);
create index if not exists idx_thoughts_created        on public.thoughts_game (created_at desc);

create index if not exists idx_mood_user_date          on public.mood_logs (user_id, log_date desc);

create index if not exists idx_messages_created        on public.messages (created_at desc);
create index if not exists idx_messages_sender         on public.messages (sender_id);
create index if not exists idx_messages_unread         on public.messages (is_read) where not is_read;

create index if not exists idx_calls_caller            on public.audio_calls (caller_id);
create index if not exists idx_calls_callee            on public.audio_calls (callee_id);
create index if not exists idx_calls_status            on public.audio_calls (status);

create index if not exists idx_signals_call            on public.call_signals (call_id, created_at);

create index if not exists idx_letters_open_date       on public.future_letters (open_date);
create index if not exists idx_letters_author          on public.future_letters (author_id);

create index if not exists idx_val_memories_date       on public.valentina_memories (memory_date desc);
create index if not exists idx_val_memories_category   on public.valentina_memories (category);
create index if not exists idx_val_memories_favorite   on public.valentina_memories (is_favorite) where is_favorite;

create index if not exists idx_val_media_memory        on public.valentina_media (memory_id);

create index if not exists idx_notifications_user      on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_unread    on public.notifications (user_id) where not is_read;


-- =============================================================================
-- 15. TRIGGERS DE updated_at
-- =============================================================================
do $$
declare
  t text;
  tables text[] := array[
    'app_settings','users','memories','events',
    'valentina_memories'
  ];
begin
  foreach t in array tables loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I;', t);
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t);
  end loop;
end$$;


-- =============================================================================
-- 16. CONTROLE DE USUÁRIOS — APENAS 2, SEM CADASTRO
-- =============================================================================

-- 16.1 Ao criar um usuário em auth.users:
--   - bloqueia se já existem 2 usuários
--   - bloqueia se o e-mail não estiver na lista branca
--   - cria automaticamente o perfil em public.users com o papel correto
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  allowed   public.app_allowed_users%rowtype;
  user_count integer;
begin
  -- no máximo 2 usuários no total
  select count(*) into user_count from auth.users;
  if user_count > 2 then
    raise exception 'NOSSO UNIVERSO: limite de 2 usuários atingido. Cadastro bloqueado.';
  end if;

  -- e-mail precisa estar na lista branca
  select * into allowed from public.app_allowed_users where email = new.email;
  if not found then
    raise exception 'NOSSO UNIVERSO: e-mail % não autorizado. Cadastro bloqueado.', new.email;
  end if;

  -- cria/atualiza o perfil correspondente
  insert into public.users (id, email, role, display_name)
  values (new.id, new.email, allowed.role, allowed.display_name)
  on conflict (id) do update
    set email = excluded.email,
        role  = excluded.role,
        display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_auth_user on auth.users;
create trigger trg_handle_new_auth_user
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- 16.2 Bloqueia alteração de e-mail (regra: e-mail é fixo)
create or replace function public.prevent_email_change()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  if new.email is distinct from old.email then
    raise exception 'NOSSO UNIVERSO: alteração de e-mail não permitida.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_email_change on auth.users;
create trigger trg_prevent_email_change
  before update on auth.users
  for each row execute function public.prevent_email_change();

-- 16.3 Garante no máximo 2 perfis em public.users
create or replace function public.enforce_two_profiles()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.users) >= 2 then
    raise exception 'NOSSO UNIVERSO: já existem 2 perfis. Criação bloqueada.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_two_profiles on public.users;
create trigger trg_enforce_two_profiles
  before insert on public.users
  for each row execute function public.enforce_two_profiles();


-- =============================================================================
-- 17. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Habilita RLS em todas as tabelas. O dado é COMPARTILHADO entre os 2 usuários
-- autorizados; logo, a maioria das políticas usa public.is_authorized_user().

alter table public.app_settings        enable row level security;
alter table public.app_allowed_users    enable row level security;
alter table public.users                 enable row level security;
alter table public.memories              enable row level security;
alter table public.memory_media          enable row level security;
alter table public.events                enable row level security;
alter table public.thoughts_game         enable row level security;
alter table public.mood_logs             enable row level security;
alter table public.messages              enable row level security;
alter table public.audio_calls           enable row level security;
alter table public.call_signals          enable row level security;
alter table public.future_letters        enable row level security;
alter table public.valentina_memories    enable row level security;
alter table public.valentina_media       enable row level security;
alter table public.notifications         enable row level security;

-- ---- app_allowed_users: ninguém acessa via API (somente service_role/SQL) ----
drop policy if exists allowed_users_no_access on public.app_allowed_users;
create policy allowed_users_no_access on public.app_allowed_users
  for all using (false) with check (false);

-- ---- app_settings: ambos leem; ambos atualizam ----
drop policy if exists settings_select on public.app_settings;
create policy settings_select on public.app_settings
  for select using (public.is_authorized_user());
drop policy if exists settings_update on public.app_settings;
create policy settings_update on public.app_settings
  for update using (public.is_authorized_user()) with check (public.is_authorized_user());

-- ---- users: ambos veem os 2 perfis; cada um edita apenas o próprio ----
drop policy if exists users_select on public.users;
create policy users_select on public.users
  for select using (public.is_authorized_user());
drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
-- INSERT/DELETE de perfis: bloqueado via API (feito por trigger/SQL apenas)

-- ---- Helper para políticas "tudo compartilhado" ----
-- memories
drop policy if exists memories_all on public.memories;
create policy memories_all on public.memories
  for all using (public.is_authorized_user())
  with check (public.is_authorized_user() and author_id = auth.uid());

-- memory_media (acesso vinculado à existência da memória)
drop policy if exists memory_media_all on public.memory_media;
create policy memory_media_all on public.memory_media
  for all using (public.is_authorized_user())
  with check (public.is_authorized_user());

-- events
drop policy if exists events_all on public.events;
create policy events_all on public.events
  for all using (public.is_authorized_user())
  with check (public.is_authorized_user() and created_by = auth.uid());

-- thoughts_game (ambos leem o histórico; insere o próprio author_id)
drop policy if exists thoughts_select on public.thoughts_game;
create policy thoughts_select on public.thoughts_game
  for select using (public.is_authorized_user());
drop policy if exists thoughts_insert on public.thoughts_game;
create policy thoughts_insert on public.thoughts_game
  for insert with check (public.is_authorized_user() and author_id = auth.uid());
drop policy if exists thoughts_update on public.thoughts_game;
create policy thoughts_update on public.thoughts_game
  for update using (public.is_authorized_user()) with check (public.is_authorized_user());
drop policy if exists thoughts_delete on public.thoughts_game;
create policy thoughts_delete on public.thoughts_game
  for delete using (author_id = auth.uid());

-- mood_logs (ambos veem; cada um registra/edita o próprio humor)
drop policy if exists mood_select on public.mood_logs;
create policy mood_select on public.mood_logs
  for select using (public.is_authorized_user());
drop policy if exists mood_modify on public.mood_logs;
create policy mood_modify on public.mood_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- messages (ambos veem o chat; remetente = quem envia; marca como lido)
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (public.is_authorized_user());
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (public.is_authorized_user() and sender_id = auth.uid());
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update using (public.is_authorized_user()) with check (public.is_authorized_user());
drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
  for delete using (sender_id = auth.uid());

-- audio_calls (participantes da chamada)
drop policy if exists calls_select on public.audio_calls;
create policy calls_select on public.audio_calls
  for select using (caller_id = auth.uid() or callee_id = auth.uid());
drop policy if exists calls_insert on public.audio_calls;
create policy calls_insert on public.audio_calls
  for insert with check (caller_id = auth.uid());
drop policy if exists calls_update on public.audio_calls;
create policy calls_update on public.audio_calls
  for update using (caller_id = auth.uid() or callee_id = auth.uid())
  with check (caller_id = auth.uid() or callee_id = auth.uid());

-- call_signals (sinalização entre participantes da chamada)
drop policy if exists signals_select on public.call_signals;
create policy signals_select on public.call_signals
  for select using (
    exists (select 1 from public.audio_calls c
            where c.id = call_id
              and (c.caller_id = auth.uid() or c.callee_id = auth.uid()))
  );
drop policy if exists signals_insert on public.call_signals;
create policy signals_insert on public.call_signals
  for insert with check (
    sender_id = auth.uid()
    and exists (select 1 from public.audio_calls c
                where c.id = call_id
                  and (c.caller_id = auth.uid() or c.callee_id = auth.uid()))
  );

-- future_letters (CONTEÚDO BLOQUEADO até a data de abertura)
-- O autor sempre vê suas próprias cartas. O destinatário/parceiro só consegue
-- LER a linha (conteúdo) quando open_date <= hoje. Antes disso, a carta fica
-- invisível para o parceiro — bloqueio garantido pelo servidor.
drop policy if exists letters_select on public.future_letters;
create policy letters_select on public.future_letters
  for select using (
    public.is_authorized_user()
    and (author_id = auth.uid() or open_date <= current_date)
  );
drop policy if exists letters_insert on public.future_letters;
create policy letters_insert on public.future_letters
  for insert with check (public.is_authorized_user() and author_id = auth.uid());
drop policy if exists letters_update on public.future_letters;
create policy letters_update on public.future_letters
  for update using (
    author_id = auth.uid() or open_date <= current_date
  ) with check (public.is_authorized_user());
drop policy if exists letters_delete on public.future_letters;
create policy letters_delete on public.future_letters
  for delete using (author_id = auth.uid());

-- valentina_memories
drop policy if exists val_memories_all on public.valentina_memories;
create policy val_memories_all on public.valentina_memories
  for all using (public.is_authorized_user())
  with check (public.is_authorized_user() and author_id = auth.uid());

-- valentina_media
drop policy if exists val_media_all on public.valentina_media;
create policy val_media_all on public.valentina_media
  for all using (public.is_authorized_user())
  with check (public.is_authorized_user());

-- notifications (cada um vê apenas as próprias)
drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select using (user_id = auth.uid());
drop policy if exists notifications_insert on public.notifications;
create policy notifications_insert on public.notifications
  for insert with check (public.is_authorized_user());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists notifications_delete on public.notifications;
create policy notifications_delete on public.notifications
  for delete using (user_id = auth.uid());


-- =============================================================================
-- 18. STORAGE — BUCKETS PRIVADOS
-- =============================================================================
-- Nenhum arquivo é público. Apenas os 2 usuários autorizados acessam.

insert into storage.buckets (id, name, public)
values
  ('memories',  'memories',  false),
  ('valentina', 'valentina', false),
  ('chat',      'chat',      false),
  ('avatars',   'avatars',   false)
on conflict (id) do update set public = false;

-- Política única por operação: somente usuários autorizados, somente nos buckets do app.
drop policy if exists storage_select on storage.objects;
create policy storage_select on storage.objects
  for select using (
    bucket_id in ('memories','valentina','chat','avatars')
    and public.is_authorized_user()
  );

drop policy if exists storage_insert on storage.objects;
create policy storage_insert on storage.objects
  for insert with check (
    bucket_id in ('memories','valentina','chat','avatars')
    and public.is_authorized_user()
  );

drop policy if exists storage_update on storage.objects;
create policy storage_update on storage.objects
  for update using (
    bucket_id in ('memories','valentina','chat','avatars')
    and public.is_authorized_user()
  ) with check (
    bucket_id in ('memories','valentina','chat','avatars')
    and public.is_authorized_user()
  );

drop policy if exists storage_delete on storage.objects;
create policy storage_delete on storage.objects
  for delete using (
    bucket_id in ('memories','valentina','chat','avatars')
    and public.is_authorized_user()
  );


-- =============================================================================
-- 19. REALTIME — publicação das tabelas que precisam de tempo real
-- =============================================================================
do $$
declare
  t text;
  rt_tables text[] := array[
    'messages','audio_calls','call_signals','notifications',
    'thoughts_game','mood_logs','users'
  ];
begin
  foreach t in array rt_tables loop
    begin
      execute format('alter publication supabase_realtime add table public.%I;', t);
    exception
      when duplicate_object then null;   -- já está na publicação
      when undefined_object then null;   -- publicação não existe (ambiente local)
    end;
  end loop;
end$$;


-- =============================================================================
-- 20. SEEDS  ⚠️  EDITE OS E-MAILS ABAIXO ANTES (ou depois) DE RODAR ⚠️
-- =============================================================================
-- Estes são os ÚNICOS e-mails que poderão ter conta. Troque pelos e-mails reais
-- do marido e da esposa. Eles devem ser idênticos aos usados ao criar os
-- usuários em Authentication -> Users.

insert into public.app_allowed_users (email, role, display_name) values
  ('marido@nossouniverso.app', 'marido', 'Marido'),
  ('esposa@nossouniverso.app', 'esposa', 'Esposa')
on conflict (email) do update
  set role = excluded.role,
      display_name = excluded.display_name;

-- Configurações iniciais (linha única). Ajuste as datas no app depois.
insert into public.app_settings (id, couple_name, relationship_start_date, valentina_name)
values (1, 'Nosso Universo', null, 'Valentina')
on conflict (id) do nothing;


-- =============================================================================
-- FIM ❤️  —  Banco de dados do NOSSO UNIVERSO pronto.
-- =============================================================================
-- PRÓXIMOS PASSOS:
--   1. Authentication -> Providers -> Email: desative "Allow new users to sign up".
--   2. Atualize os e-mails na seção SEEDS (UPDATE em app_allowed_users) se necessário.
--   3. Authentication -> Users -> Add user: crie os 2 usuários com esses e-mails.
--      (O perfil em public.users é criado automaticamente pelo trigger.)
--   4. No app, configure relationship_start_date e valentina_birth_date.
-- =============================================================================
