-- Execute no SQL Editor do seu projeto Supabase. Pode ser executado novamente.
create table if not exists public.dishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null check (char_length(trim(description)) between 1 and 600),
  region text not null check (region in ('Norte','Nordeste','Centro-Oeste','Sudeste','Sul')),
  photo_path text,
  legacy_id text unique,
  created_at timestamptz not null default now()
);
alter table public.dishes enable row level security;
grant select on public.dishes to anon, authenticated;
grant insert, update, delete on public.dishes to authenticated;
drop policy if exists "Public menu" on public.dishes;
create policy "Public menu" on public.dishes for select to anon, authenticated using (true);
drop policy if exists "Admins manage dishes" on public.dishes;
create policy "Admins manage dishes" on public.dishes for all to authenticated
using ((select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dish-photos', 'dish-photos', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "Public dish photos" on storage.objects;
create policy "Public dish photos" on storage.objects for select to anon, authenticated using (bucket_id = 'dish-photos');
drop policy if exists "Admins manage dish photos" on storage.objects;
create policy "Admins manage dish photos" on storage.objects for all to authenticated
using (bucket_id = 'dish-photos' and (select auth.jwt()->'app_metadata'->>'role') = 'admin')
with check (bucket_id = 'dish-photos' and (select auth.jwt()->'app_metadata'->>'role') = 'admin');
