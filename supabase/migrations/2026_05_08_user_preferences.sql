-- Per-user defaults for the flash form (output language + style).
-- Used by /dashboard/settings (Preferences card, edit) and /app (mount-time
-- prefill so the user doesn't reselect "FR + Concise" every flash).
alter table public.profiles add column if not exists default_lang text default 'EN';
alter table public.profiles add column if not exists default_style text default 'Concise';
