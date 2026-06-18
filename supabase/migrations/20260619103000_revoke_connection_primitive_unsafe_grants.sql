-- Phase 29D - conversation primitive unsafe grants corrective migration candidate.
-- Scope: local source migration candidate only. Do not apply in Phase 29D.
-- Corrective target: remove unsafe table privileges discovered after local Phase 29C apply.
-- No RLS policy, grant, table redesign, profiles_private path, voice message, storage, reveal, runtime, staging, or production work.

revoke all privileges on table public.connections from anon, authenticated;
revoke all privileges on table public.connection_participants from anon, authenticated;
revoke all privileges on table public.connections from public;
revoke all privileges on table public.connection_participants from public;

-- Safety notes:
-- - Removes TRUNCATE / REFERENCES / TRIGGER and any other table privileges for anon/authenticated on the connection primitives.
-- - Keeps RLS deny-by-default posture intact.
-- - Adds no CREATE POLICY.
-- - Adds no GRANT.
-- - Does not touch profiles_private.
-- - Does not introduce voice_messages, Storage, Reveal, RPC/view/function/trigger runtime integration, or app binding.
