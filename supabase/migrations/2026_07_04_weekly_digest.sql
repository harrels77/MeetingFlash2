-- Weekly open-actions digest opt-out flag (default: opted in).
-- Applied manually in the Supabase SQL editor, like the other migrations.
alter table public.profiles
  add column if not exists weekly_digest boolean not null default true;
