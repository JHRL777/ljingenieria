-- Ejecuta este archivo UNA sola vez en Supabase: SQL Editor > New query > Run.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  description text not null check (char_length(description) between 1 and 800),
  category text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  position integer not null default 0
);

alter table public.projects enable row level security;
alter table public.project_images enable row level security;

create policy "Publica ve proyectos publicados" on public.projects for select using (published = true);
create policy "Publico ve imagenes de proyectos publicados" on public.project_images for select using (exists (select 1 from public.projects where projects.id = project_images.project_id and projects.published = true));
create policy "Usuarios autenticados administran proyectos" on public.projects for all to authenticated using (true) with check (true);
create policy "Usuarios autenticados administran imagenes" on public.project_images for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('project-images', 'project-images', true) on conflict (id) do nothing;
create policy "Publico ve fotos" on storage.objects for select using (bucket_id = 'project-images');
create policy "Usuarios autenticados suben fotos" on storage.objects for insert to authenticated with check (bucket_id = 'project-images');
create policy "Usuarios autenticados eliminan fotos" on storage.objects for delete to authenticated using (bucket_id = 'project-images');
