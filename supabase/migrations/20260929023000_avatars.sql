-- Foto de perfil: caminho na conta, bytes no bucket. accounts continua sem update.

create table public.avatars (
  user_id uuid primary key references auth.users (id) on delete cascade,
  object_path text not null,
  updated_at timestamptz not null default now(),
  constraint avatars_object_path_check check (object_path = user_id::text || '/avatar')
);

create or replace function public.set_avatars_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger avatars_set_updated_at
  before update on public.avatars
  for each row
  execute function public.set_avatars_updated_at();

alter table public.avatars enable row level security;

create policy avatars_select_own
  on public.avatars
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy avatars_insert_own
  on public.avatars
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy avatars_update_own
  on public.avatars
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy avatars_delete_own
  on public.avatars
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
);

create policy avatars_storage_select_public
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

create policy avatars_storage_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar'
  );

create policy avatars_storage_update_own
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar'
  )
  with check (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar'
  );

create policy avatars_storage_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and name = (select auth.uid())::text || '/avatar'
  );
