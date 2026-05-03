-- Returns the array of auth providers (e.g. ['google'], ['email'], or both)
-- linked to a given email address. Used by /signup, /login and the OAuth
-- callback to enforce single-method auth per email — preventing the
-- dual-identity confusion that produced the "Pro / Free flicker" bug.
--
-- SECURITY DEFINER lets the anon key call this without granting public
-- read access to the auth schema. The function only returns provider names
-- (not user ids or any PII beyond the email already supplied by the caller).

create or replace function public.get_auth_providers_for_email(check_email text)
returns text[]
language sql
security definer
set search_path = public
as $$
  select coalesce(array_agg(distinct i.provider), array[]::text[])
  from auth.identities i
  join auth.users u on u.id = i.user_id
  where lower(u.email) = lower(check_email);
$$;

grant execute on function public.get_auth_providers_for_email(text) to anon, authenticated;
