-- Security hardening (audit 2026-07). APPLIED via MCP on 2026-07-10 — kept
-- here for documentation and for rebuilding the schema from scratch.
--
-- 1. reset_monthly_uses / increment_uses / handle_new_user / increment were
--    executable by anon + authenticated via PostgREST: anyone holding the
--    public anon key could reset all free counters or burn a victim's quota.
--    Server-side callers (cron, /api/flash) use the service role, which
--    bypasses these grants.
revoke execute on function public.reset_monthly_uses() from public, anon, authenticated;
revoke execute on function public.increment_uses(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.increment(integer) from public, anon, authenticated;

-- 2. Pin search_path on all exposed functions (mutable search_path lint).
alter function public.reset_monthly_uses() set search_path = public;
alter function public.increment_uses(uuid) set search_path = public;
alter function public.handle_new_user() set search_path = public;
alter function public.increment(integer) set search_path = public;
alter function public.get_auth_providers_for_email(text) set search_path = public;

-- get_auth_providers_for_email stays anon-executable on purpose: the login/
-- signup pre-flight (single-method auth enforcement) needs it before sign-in.
