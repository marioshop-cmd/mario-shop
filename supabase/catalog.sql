create table if not exists public.site_catalog (
  id integer primary key check (id = 1),
  brands jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_catalog enable row level security;

-- The Next.js API route is the only catalog access point and uses the
-- Supabase service role key on the server.
revoke all on table public.site_catalog from anon, authenticated;

grant select on table public.site_catalog to anon, authenticated;

drop policy if exists "Public can read catalog" on public.site_catalog;
create policy "Public can read catalog"
  on public.site_catalog for select
  to anon, authenticated
  using (true);

do $$
begin
  alter publication supabase_realtime add table public.site_catalog;
exception
  when duplicate_object then null;
end
$$;
