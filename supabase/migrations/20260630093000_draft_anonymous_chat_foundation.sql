-- Sprint 85E-R54 - anonymous chat foundation draft.
-- Scope: production data model candidate only. Do not apply in R54.
-- Mobile clients must use backend API boundaries for chat access.
-- This draft creates no direct authenticated client table access.

create extension if not exists pgcrypto;

create unique index if not exists anonymous_identities_id_owner_user_id_idx
  on public.anonymous_identities (id, owner_user_id);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid null references public.connections(id) on delete restrict,
  conversation_kind text not null default 'direct_anonymous',
  conversation_status text not null default 'active',
  lifecycle_state text not null default 'open',
  safety_state text not null default 'normal',
  moderation_state text not null default 'none',
  last_message_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint conversations_kind_check check (
    conversation_kind in ('direct_anonymous')
  ),
  constraint conversations_status_check check (
    conversation_status in ('active', 'paused', 'closed', 'blocked', 'deleted')
  ),
  constraint conversations_lifecycle_state_check check (
    lifecycle_state in ('open', 'frozen', 'closed', 'deleted')
  ),
  constraint conversations_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  ),
  constraint conversations_moderation_state_check check (
    moderation_state in ('none', 'queued', 'reviewed', 'actioned')
  ),
  constraint conversations_deleted_at_status_check check (
    (conversation_status = 'deleted' and deleted_at is not null)
    or (conversation_status <> 'deleted' and deleted_at is null)
  )
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  participant_role text not null,
  participant_state text not null default 'active',
  safety_state text not null default 'normal',
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  last_read_at timestamptz null,
  left_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint conversation_participants_identity_owner_fk foreign key (
    anonymous_identity_id,
    owner_user_id
  ) references public.anonymous_identities (id, owner_user_id) on delete restrict,
  constraint conversation_participants_role_check check (
    participant_role in ('initiator', 'responder')
  ),
  constraint conversation_participants_state_check check (
    participant_state in ('active', 'left', 'blocked', 'removed', 'deleted')
  ),
  constraint conversation_participants_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  ),
  constraint conversation_participants_deleted_at_state_check check (
    (participant_state = 'deleted' and deleted_at is not null)
    or (participant_state <> 'deleted' and deleted_at is null)
  ),
  constraint conversation_participants_left_at_state_check check (
    left_at is null or participant_state in ('left', 'blocked', 'removed', 'deleted')
  )
);

create unique index if not exists conversation_participants_sender_fk_idx
  on public.conversation_participants (
    id,
    conversation_id,
    anonymous_identity_id
  );

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_participant_id uuid not null references public.conversation_participants(id) on delete restrict,
  sender_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  message_kind text not null default 'text',
  body_text text null,
  client_message_id text null,
  message_state text not null default 'sent',
  moderation_state text not null default 'visible',
  sent_at timestamptz not null default now(),
  edited_at timestamptz null,
  deleted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_sender_participant_fk foreign key (
    sender_participant_id,
    conversation_id,
    sender_anonymous_identity_id
  ) references public.conversation_participants (
    id,
    conversation_id,
    anonymous_identity_id
  ) on delete restrict,
  constraint messages_kind_check check (
    message_kind in ('text')
  ),
  constraint messages_body_text_check check (
    message_state = 'deleted'
    or (
      body_text is not null
      and char_length(btrim(body_text)) between 1 and 4000
    )
  ),
  constraint messages_client_message_id_length check (
    client_message_id is null or char_length(client_message_id) <= 80
  ),
  constraint messages_state_check check (
    message_state in ('sent', 'edited', 'deleted')
  ),
  constraint messages_moderation_state_check check (
    moderation_state in ('visible', 'under_review', 'hidden')
  ),
  constraint messages_deleted_at_state_check check (
    (message_state = 'deleted' and deleted_at is not null)
    or (message_state <> 'deleted' and deleted_at is null)
  )
);

create unique index if not exists messages_id_conversation_id_idx
  on public.messages (id, conversation_id);

create table if not exists public.conversation_reports (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  reported_message_id uuid null,
  reporter_participant_id uuid not null references public.conversation_participants(id) on delete restrict,
  reporter_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  report_scope text not null,
  reason text not null,
  note_text text null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint conversation_reports_message_fk foreign key (
    reported_message_id,
    conversation_id
  ) references public.messages (id, conversation_id) on delete cascade,
  constraint conversation_reports_reporter_participant_fk foreign key (
    reporter_participant_id,
    conversation_id,
    reporter_anonymous_identity_id
  ) references public.conversation_participants (
    id,
    conversation_id,
    anonymous_identity_id
  ) on delete restrict,
  constraint conversation_reports_scope_check check (
    report_scope in ('conversation', 'message')
  ),
  constraint conversation_reports_scope_target_check check (
    (report_scope = 'conversation' and reported_message_id is null)
    or (report_scope = 'message' and reported_message_id is not null)
  ),
  constraint conversation_reports_reason_check check (
    reason in ('safety', 'spam', 'harassment', 'other')
  ),
  constraint conversation_reports_note_text_length check (
    note_text is null or char_length(note_text) <= 500
  ),
  constraint conversation_reports_status_check check (
    status in ('open', 'reviewed', 'dismissed')
  )
);

create table if not exists public.conversation_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  message_id uuid null,
  action_kind text not null,
  action_state text not null default 'applied',
  reason_code text not null,
  actor_kind text not null default 'backend',
  created_at timestamptz not null default now(),
  reverted_at timestamptz null,
  constraint conversation_moderation_actions_message_fk foreign key (
    message_id,
    conversation_id
  ) references public.messages (id, conversation_id) on delete cascade,
  constraint conversation_moderation_actions_kind_check check (
    action_kind in (
      'hide_message',
      'freeze_conversation',
      'close_conversation',
      'reopen_conversation'
    )
  ),
  constraint conversation_moderation_actions_state_check check (
    action_state in ('applied', 'reverted')
  ),
  constraint conversation_moderation_actions_reason_code_length check (
    char_length(reason_code) between 1 and 80
  ),
  constraint conversation_moderation_actions_actor_kind_check check (
    actor_kind in ('backend', 'moderator', 'system')
  ),
  constraint conversation_moderation_actions_reverted_state_check check (
    (action_state = 'reverted' and reverted_at is not null)
    or (action_state = 'applied' and reverted_at is null)
  )
);

create table if not exists public.conversation_deletion_requests (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  requester_participant_id uuid not null references public.conversation_participants(id) on delete restrict,
  requester_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  request_kind text not null,
  request_state text not null default 'requested',
  requested_at timestamptz not null default now(),
  processed_at timestamptz null,
  constraint conversation_deletion_requests_requester_participant_fk foreign key (
    requester_participant_id,
    conversation_id,
    requester_anonymous_identity_id
  ) references public.conversation_participants (
    id,
    conversation_id,
    anonymous_identity_id
  ) on delete restrict,
  constraint conversation_deletion_requests_kind_check check (
    request_kind in ('participant_leave', 'conversation_tombstone')
  ),
  constraint conversation_deletion_requests_state_check check (
    request_state in ('requested', 'processed', 'rejected')
  ),
  constraint conversation_deletion_requests_processed_state_check check (
    (request_state in ('processed', 'rejected') and processed_at is not null)
    or (request_state = 'requested' and processed_at is null)
  )
);

create unique index if not exists conversations_one_active_connection_idx
  on public.conversations (connection_id)
  where connection_id is not null
    and conversation_status in ('active', 'paused')
    and deleted_at is null;

create index if not exists conversations_status_updated_idx
  on public.conversations (
    conversation_status,
    updated_at desc
  )
  where deleted_at is null;

create index if not exists conversation_participants_conversation_id_idx
  on public.conversation_participants (conversation_id);

create index if not exists conversation_participants_owner_user_id_idx
  on public.conversation_participants (owner_user_id);

create index if not exists conversation_participants_anonymous_identity_id_idx
  on public.conversation_participants (anonymous_identity_id);

create unique index if not exists conversation_participants_one_active_identity_idx
  on public.conversation_participants (
    conversation_id,
    anonymous_identity_id
  )
  where deleted_at is null;

create unique index if not exists conversation_participants_one_active_role_idx
  on public.conversation_participants (
    conversation_id,
    participant_role
  )
  where deleted_at is null;

create index if not exists messages_conversation_order_idx
  on public.messages (
    conversation_id,
    sent_at desc,
    id desc
  );

create index if not exists messages_sender_participant_id_idx
  on public.messages (sender_participant_id);

create index if not exists messages_sender_anonymous_identity_id_idx
  on public.messages (sender_anonymous_identity_id);

create unique index if not exists messages_client_idempotency_idx
  on public.messages (
    conversation_id,
    sender_participant_id,
    client_message_id
  )
  where client_message_id is not null;

create index if not exists conversation_reports_conversation_status_idx
  on public.conversation_reports (
    conversation_id,
    status,
    created_at desc
  );

create index if not exists conversation_reports_reporter_idx
  on public.conversation_reports (reporter_anonymous_identity_id);

create index if not exists conversation_reports_message_idx
  on public.conversation_reports (reported_message_id)
  where reported_message_id is not null;

create unique index if not exists conversation_reports_one_open_conversation_report_idx
  on public.conversation_reports (
    conversation_id,
    reporter_anonymous_identity_id
  )
  where report_scope = 'conversation'
    and status = 'open';

create unique index if not exists conversation_reports_one_open_message_report_idx
  on public.conversation_reports (
    reported_message_id,
    reporter_anonymous_identity_id
  )
  where reported_message_id is not null
    and report_scope = 'message'
    and status = 'open';

create index if not exists conversation_moderation_actions_conversation_idx
  on public.conversation_moderation_actions (
    conversation_id,
    created_at desc
  );

create index if not exists conversation_moderation_actions_message_idx
  on public.conversation_moderation_actions (message_id)
  where message_id is not null;

create index if not exists conversation_deletion_requests_conversation_state_idx
  on public.conversation_deletion_requests (
    conversation_id,
    request_state,
    requested_at desc
  );

create index if not exists conversation_deletion_requests_requester_idx
  on public.conversation_deletion_requests (requester_anonymous_identity_id);

comment on table public.conversations is
  'Anonymous direct chat conversation foundation. It links anonymous participants only and must be exposed through safe backend DTOs.';
comment on column public.conversations.connection_id is
  'Optional bridge from existing connection primitives into chat continuity. It does not grant real profile visibility.';
comment on table public.conversation_participants is
  'Participant boundary for anonymous chat. owner_user_id is internal app-account ownership and must not be exposed to client DTOs.';
comment on column public.conversation_participants.owner_user_id is
  'Technical app-account ownership used for backend authorization. It is not real-world identity.';
comment on column public.conversation_participants.last_read_at is
  'Read cursor placeholder for future unread calculations without exposing extra identity data.';
comment on table public.messages is
  'Text-only anonymous chat message foundation. Media, voice, attachments, and public feed integration are out of scope for this draft.';
comment on table public.conversation_reports is
  'Chat report foundation for backend-owned review workflows.';
comment on table public.conversation_moderation_actions is
  'Backend-owned moderation action ledger for chat safety states.';
comment on table public.conversation_deletion_requests is
  'Conversation deletion request placeholder for future tombstone and retention workflows.';

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_reports enable row level security;
alter table public.conversation_moderation_actions enable row level security;
alter table public.conversation_deletion_requests enable row level security;

revoke all privileges on table public.conversations from public, anon, authenticated;
revoke all privileges on table public.conversation_participants from public, anon, authenticated;
revoke all privileges on table public.messages from public, anon, authenticated;
revoke all privileges on table public.conversation_reports from public, anon, authenticated;
revoke all privileges on table public.conversation_moderation_actions from public, anon, authenticated;
revoke all privileges on table public.conversation_deletion_requests from public, anon, authenticated;

-- RLS intent:
-- - Backend/service-role API owns all chat writes and safe DTO reads for MVP.
-- - Direct authenticated client access remains deny-by-default in this draft.
-- - Future direct SELECT policies, if approved, must be participant-bound and
--   must not expose owner_user_id, recovery contact data, auth metadata, or
--   private profile rows.
-- - Existing public.anonymous_identity_blocks is the identity-block foundation
--   used by chat APIs before creating or returning conversation data.
