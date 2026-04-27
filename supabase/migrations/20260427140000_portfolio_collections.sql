-- Collections: each groups multiple portfolio_items; optional soundtrack in storage.

create table if not exists public.portfolio_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default 'Untitled collection',
  description text not null default '',
  audio_storage_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists portfolio_collections_user_sort
  on public.portfolio_collections (user_id, sort_order);

alter table public.portfolio_items
  add column if not exists collection_id uuid references public.portfolio_collections (id) on delete cascade;

-- One legacy collection per user who already has pieces, then attach rows.
insert into public.portfolio_collections (user_id, title, sort_order)
select distinct pi.user_id, 'Portfolio', 0
from public.portfolio_items pi
where not exists (
  select 1
  from public.portfolio_collections c
  where c.user_id = pi.user_id
);

update public.portfolio_items pi
set collection_id = c.id
from public.portfolio_collections c
where c.user_id = pi.user_id
  and pi.collection_id is null;

alter table public.portfolio_items
  alter column collection_id set not null;

alter table public.portfolio_collections enable row level security;

create policy "portfolio_collections_select_public"
  on public.portfolio_collections for select using (true);

create policy "portfolio_collections_insert_own"
  on public.portfolio_collections for insert with check (auth.uid() = user_id);

create policy "portfolio_collections_update_own"
  on public.portfolio_collections for update using (auth.uid() = user_id);

create policy "portfolio_collections_delete_own"
  on public.portfolio_collections for delete using (auth.uid() = user_id);
