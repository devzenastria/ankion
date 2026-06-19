-- Phase 29O/29Q - connection participant RLS recursion fix draft.
-- Scope: local migration draft only. Do not apply before a later explicit GO.
-- Fixes Phase 29M blocker:
-- ERROR: infinite recursion detected in policy for relation "connection_participants"
-- Phase 29P found that a public-schema helper with authenticated EXECUTE can
-- become a Supabase/PostgREST RPC-style boolean membership probe.
--
-- The helper below returns only boolean membership state. It does not return
-- connection, participant, anonymous identity, or private profile row data.
-- Phase 29Q moves the helper out of public schema to reduce product RPC
-- exposure. Local apply and harness verification are still required later.

create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.is_connection_participant_for_current_user(
  target_connection_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and target_connection_id is not null
    and exists (
      select 1
      from public.connections c
      join public.connection_participants cp
        on cp.connection_id = c.id
      join public.anonymous_identities ai
        on ai.id = cp.anonymous_identity_id
      where c.id = target_connection_id
        and c.deleted_at is null
        and c.connection_status not in ('blocked', 'deleted')
        and c.lifecycle_state not in ('frozen', 'deleted')
        and c.safety_state not in ('frozen', 'blocked')
        and cp.deleted_at is null
        and cp.participant_state = 'active'
        and cp.safety_state not in ('frozen', 'blocked')
        and ai.owner_user_id = auth.uid()
        and ai.status = 'active'
        and ai.deleted_at is null
    );
$$;

comment on schema private is
  'Internal schema for non-product RPC helpers. Objects here must not expose raw profile or participant row data.';

comment on function private.is_connection_participant_for_current_user(uuid) is
  'Boolean-only internal helper for participant-bound connection SELECT RLS. It avoids recursive policy evaluation on connection_participants and returns no row data.';

revoke all on function private.is_connection_participant_for_current_user(uuid) from public;
revoke all on function private.is_connection_participant_for_current_user(uuid) from anon;
revoke all on function private.is_connection_participant_for_current_user(uuid) from authenticated;

-- Static limitation:
-- PostgreSQL policy evaluation may require EXECUTE on a helper function for
-- the invoking role. The helper is intentionally in private schema and schema
-- USAGE is not granted to authenticated. If local apply shows policy execution
-- requires a different posture, stop and review rather than exposing a public
-- RPC membership oracle.
grant execute on function private.is_connection_participant_for_current_user(uuid) to authenticated;

drop policy if exists connections_participant_select_own
  on public.connections;

drop policy if exists connection_participants_participant_select_same_connection
  on public.connection_participants;

create policy connections_participant_select_own
on public.connections
for select
to authenticated
using (
  public.connections.deleted_at is null
  and public.connections.connection_status not in ('blocked', 'deleted')
  and public.connections.lifecycle_state not in ('frozen', 'deleted')
  and public.connections.safety_state not in ('frozen', 'blocked')
  and private.is_connection_participant_for_current_user(public.connections.id)
);

create policy connection_participants_participant_select_same_connection
on public.connection_participants
for select
to authenticated
using (
  public.connection_participants.deleted_at is null
  and private.is_connection_participant_for_current_user(public.connection_participants.connection_id)
);

-- Safety notes:
-- - This migration draft adds no INSERT, UPDATE, DELETE, or WITH CHECK policy.
-- - It grants no table privileges and adds no service role dependency.
-- - It does not create or grant a public-schema RPC helper.
-- - The helper checks participant membership through public.anonymous_identities.owner_user_id = auth.uid().
-- - The helper uses schema-qualified table references and no dynamic SQL.
-- - The helper is intended only to support participant-bound RLS predicates; it must not become a product RPC surface.
