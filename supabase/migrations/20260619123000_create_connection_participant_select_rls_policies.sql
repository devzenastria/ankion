-- Phase 29I - connection primitive participant-only SELECT RLS policies.
-- Scope: local source migration candidate only. Do not apply in Phase 29I.
-- Adds participant-only SELECT policies for public.connections and public.connection_participants.
-- No direct INSERT/UPDATE/DELETE policy, no WITH CHECK, no function/view/trigger, no reveal, no profiles_private path.

grant select on table public.connections to authenticated;
grant select on table public.connection_participants to authenticated;

create policy connections_participant_select_own
on public.connections
for select
to authenticated
using (
  deleted_at is null
  and connection_status not in ('blocked', 'deleted')
  and lifecycle_state not in ('frozen', 'deleted')
  and safety_state not in ('frozen', 'blocked')
  and exists (
    select 1
    from public.connection_participants cp
    join public.anonymous_identities ai
      on ai.id = cp.anonymous_identity_id
    where cp.connection_id = public.connections.id
      and cp.deleted_at is null
      and cp.participant_state = 'active'
      and cp.safety_state not in ('frozen', 'blocked')
      and ai.owner_user_id = auth.uid()
      and ai.status = 'active'
      and ai.deleted_at is null
  )
);

create policy connection_participants_participant_select_same_connection
on public.connection_participants
for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.connection_participants viewer_cp
    join public.anonymous_identities viewer_ai
      on viewer_ai.id = viewer_cp.anonymous_identity_id
    join public.connections c
      on c.id = viewer_cp.connection_id
    where viewer_cp.connection_id = public.connection_participants.connection_id
      and viewer_cp.deleted_at is null
      and viewer_cp.participant_state = 'active'
      and viewer_cp.safety_state not in ('frozen', 'blocked')
      and viewer_ai.owner_user_id = auth.uid()
      and viewer_ai.status = 'active'
      and viewer_ai.deleted_at is null
      and c.deleted_at is null
      and c.connection_status not in ('blocked', 'deleted')
      and c.lifecycle_state not in ('frozen', 'deleted')
      and c.safety_state not in ('frozen', 'blocked')
  )
);

-- Safety notes:
-- - Authenticated SELECT grants are required for RLS usability and are paired with participant-only USING predicates.
-- - No SELECT grant is given to anon or public.
-- - No INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, or TRIGGER grant is given to anon, authenticated, or public.
-- - No profiles_private table, raw private profile path, reveal shortcut, global conversation list, profile/user search, room/chat-room model, Storage, voice message, runtime, function, view, or trigger is introduced.
