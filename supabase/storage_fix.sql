-- ============================================================
-- CORREÇÃO DE STORAGE — Nosso Universo ❤️
-- Rode este script no Supabase → SQL Editor → New query → Run
-- Resolve: foto de perfil não envia / não aparece (buckets sem policies)
-- É idempotente (pode rodar quantas vezes quiser).
-- ============================================================

-- 1. AVATARS = público (foto de perfil nunca expira e carrega rápido).
--    Os demais buckets continuam privados (protegidos).
insert into storage.buckets (id, name, public) values
  ('memories',  'memories',  false),
  ('valentina', 'valentina', false),
  ('chat',      'chat',      false),
  ('avatars',   'avatars',   true)
on conflict (id) do update set public = excluded.public;

-- 2. POLICIES DE STORAGE
--    Leitura pública dos avatars + leitura autorizada dos buckets privados.
--    Upload/edição/remoção apenas para os 2 usuários autorizados.

-- Leitura: avatars liberado p/ todos; demais só autorizados
drop policy if exists storage_select on storage.objects;
create policy storage_select on storage.objects for select using (
  bucket_id = 'avatars'
  or (bucket_id in ('memories','valentina','chat') and public.is_authorized_user())
);

-- Upload (insert) nos 4 buckets, só usuários autorizados
drop policy if exists storage_insert on storage.objects;
create policy storage_insert on storage.objects for insert with check (
  bucket_id in ('memories','valentina','chat','avatars') and public.is_authorized_user()
);

-- Substituir arquivo (update) — necessário p/ trocar a foto de perfil
drop policy if exists storage_update on storage.objects;
create policy storage_update on storage.objects for update using (
  bucket_id in ('memories','valentina','chat','avatars') and public.is_authorized_user()
) with check (
  bucket_id in ('memories','valentina','chat','avatars') and public.is_authorized_user()
);

-- Remover arquivo (delete)
drop policy if exists storage_delete on storage.objects;
create policy storage_delete on storage.objects for delete using (
  bucket_id in ('memories','valentina','chat','avatars') and public.is_authorized_user()
);

-- Pronto! Agora: enviar foto de perfil funciona e a imagem nunca expira.
