-- Conta, preferências e watchlist. Catálogo e disponibilidade continuam na TMDB.

create table public.accounts (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  acquisition_source text not null,
  created_at timestamptz not null default now(),
  constraint accounts_acquisition_source_check check (
    acquisition_source in (
      'amigo',
      'redes',
      'google',
      'youtube',
      'blog',
      'loja',
      'outro'
    )
  )
);

create table public.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  country text not null,
  provider_ids integer[] not null,
  updated_at timestamptz not null default now(),
  constraint preferences_country_check check (country in ('BR', 'US', 'PT')),
  constraint preferences_provider_ids_check check (cardinality(provider_ids) >= 1)
);

create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null,
  title text not null,
  poster_path text,
  year integer,
  watched boolean not null default false,
  created_at timestamptz not null default now(),
  constraint watchlist_items_tmdb_id_check check (tmdb_id > 0),
  constraint watchlist_items_media_type_check check (media_type in ('movie', 'tv')),
  constraint watchlist_items_user_media_tmdb_key unique (user_id, media_type, tmdb_id)
);

create index watchlist_items_user_created_at_idx
  on public.watchlist_items (user_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.accounts (id, email, acquisition_source)
  values (
    new.id,
    pg_catalog.lower(new.email),
    new.raw_user_meta_data ->> 'acquisition_source'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.set_preferences_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create trigger preferences_set_updated_at
  before update on public.preferences
  for each row
  execute function public.set_preferences_updated_at();

create or replace function public.email_registered(p_email text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.accounts
    where email = lower(trim(p_email))
  );
$$;

revoke all on function public.email_registered(text) from public;
grant execute on function public.email_registered(text) to anon, authenticated;

alter table public.accounts enable row level security;
alter table public.preferences enable row level security;
alter table public.watchlist_items enable row level security;

create policy accounts_select_own
  on public.accounts
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy preferences_select_own
  on public.preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy preferences_insert_own
  on public.preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy preferences_update_own
  on public.preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy watchlist_select_own
  on public.watchlist_items
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy watchlist_insert_own
  on public.watchlist_items
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy watchlist_update_own
  on public.watchlist_items
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy watchlist_delete_own
  on public.watchlist_items
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
