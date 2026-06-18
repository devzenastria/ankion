-- Phase 29A - conversation / connection primitive migration candidate.
-- Scope: local source migration candidate only. Do not apply in Phase 29A.
-- Supports future anonymous voice reply / connection continuity without voice message, reveal, storage, or runtime integration.
-- No direct broad INSERT/UPDATE/DELETE grants or policies are introduced.
-- No raw profiles_private read path, public profile search, user search, profile browsing, room/chat-room model, staging, or production work.

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  initiator_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  responder_anonymous_identity_id uuid null references public.anonymous_identities(id) on delete restrict,
  connection_kind text not null default 'voice_reply',
  connection_status text not null default 'pending',
  reply_eligibility_state text not null default 'awaiting_reply',
  lifecycle_state text not null default 'open',
  safety_state text not null default 'normal',
  moderation_state text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint connections_distinct_anonymous_identities_check check (
    responder_anonymous_identity_id is null
    or initiator_anonymous_identity_id <> responder_anonymous_identity_id
  ),
  constraint connections_kind_check check (
    connection_kind in ('voice_reply')
  ),
  constraint connections_status_check check (
    connection_status in ('pending', 'active', 'paused', 'closed', 'blocked', 'deleted')
  ),
  constraint connections_reply_eligibility_state_check check (
    reply_eligibility_state in ('awaiting_reply', 'replyable', 'paused', 'closed', 'blocked')
  ),
  constraint connections_lifecycle_state_check check (
    lifecycle_state in ('open', 'frozen', 'closed', 'deleted')
  ),
  constraint connections_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  ),
  constraint connections_moderation_state_check check (
    moderation_state in ('none', 'queued', 'reviewed', 'actioned')
  )
);

create table public.connection_participants (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  participant_role text not null,
  participant_state text not null default 'active',
  reply_state text not null default 'waiting',
  safety_state text not null default 'normal',
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint connection_participants_role_check check (
    participant_role in ('initiator', 'responder')
  ),
  constraint connection_participants_state_check check (
    participant_state in ('active', 'left', 'blocked', 'removed')
  ),
  constraint connection_participants_reply_state_check check (
    reply_state in ('waiting', 'replyable', 'paused', 'closed', 'blocked')
  ),
  constraint connection_participants_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  )
);

create index connections_initiator_anonymous_identity_id_idx
  on public.connections (initiator_anonymous_identity_id);

create index connections_responder_anonymous_identity_id_idx
  on public.connections (responder_anonymous_identity_id)
  where responder_anonymous_identity_id is not null;

create index connections_status_reply_idx
  on public.connections (connection_status, reply_eligibility_state)
  where deleted_at is null;

create unique index connections_active_directed_pair_idx
  on public.connections (initiator_anonymous_identity_id, responder_anonymous_identity_id)
  where responder_anonymous_identity_id is not null
    and connection_status in ('pending', 'active')
    and deleted_at is null;

create index connection_participants_connection_id_idx
  on public.connection_participants (connection_id);

create index connection_participants_anonymous_identity_id_idx
  on public.connection_participants (anonymous_identity_id);

create unique index connection_participants_one_active_identity_per_connection_idx
  on public.connection_participants (connection_id, anonymous_identity_id)
  where deleted_at is null;

create unique index connection_participants_one_active_role_per_connection_idx
  on public.connection_participants (connection_id, participant_role)
  where deleted_at is null;

comment on table public.connections is
  'Connection primitive for anonymous voice reply continuity. It links anonymous identities only and does not expose or imply real profile visibility.';
comment on column public.connections.initiator_anonymous_identity_id is
  'Anonymous identity that initiated the connection. This is not a real profile reference and must not enable public lookup.';
comment on column public.connections.responder_anonymous_identity_id is
  'Anonymous identity that may respond in the connection. Null means no responder has been bound yet.';
comment on column public.connections.reply_eligibility_state is
  'Server-owned future state for whether a voice reply can continue the connection. It does not imply reveal or profile visibility.';
comment on column public.connections.safety_state is
  'Server-owned safety state. Client-side Android/device signals are untrusted and may only become weak risk signals in future phases.';

comment on table public.connection_participants is
  'Participant boundary for connection-scoped anonymous identities. Future RLS must be participant-only and must not create a global conversation list.';
comment on column public.connection_participants.anonymous_identity_id is
  'Participant anonymous identity reference. It must not expose owner_user_id or raw private profile data.';
comment on column public.connection_participants.reply_state is
  'Participant-scoped reply state for future voice continuity. It does not grant reveal, profile browsing, or raw profiles_private access.';

alter table public.connections enable row level security;
alter table public.connection_participants enable row level security;

-- Phase 29A intentionally creates no RLS policies and no table grants.
-- Future RLS must be participant-only, deny global conversation graph access, and avoid raw profiles_private reads.
-- Future controlled write boundaries must derive ownership from auth.uid() through anonymous_identities and must not trust client owner_user_id.
-- Voice messages, media storage, reveal grants, RPC/view/function/trigger runtime integration, and app binding remain out of scope.
