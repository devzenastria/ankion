-- ANKION-owned PostgreSQL foundation draft.
-- Draft only: do not apply as a runtime migration.
-- Runtime access is owned by ANKION API; mobile clients must not access tables directly.

create extension if not exists pgcrypto;

create table if not exists auth_accounts (
  id uuid primary key default gen_random_uuid(),
  account_status text not null default 'active',
  disabled_reason_code text null,
  deletion_requested_at timestamptz null,
  disabled_retained_at timestamptz null,
  anonymized_at timestamptz null,
  purged_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint auth_accounts_status_check check (
    account_status in (
      'active',
      'disabled',
      'deletion_requested',
      'disabled_retained',
      'anonymized',
      'purged'
    )
  ),
  constraint auth_accounts_lifecycle_timestamp_check check (
    (account_status in ('active', 'disabled') and deleted_at is null)
    or (
      account_status = 'deletion_requested'
      and deletion_requested_at is not null
      and deleted_at is null
    )
    or (
      account_status = 'disabled_retained'
      and disabled_retained_at is not null
    )
    or (account_status = 'anonymized' and anonymized_at is not null)
    or (account_status = 'purged' and purged_at is not null)
  )
);

create table if not exists auth_password_credentials (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  username_display text not null,
  username_normalized text not null,
  password_hash text not null,
  credential_status text not null default 'active',
  password_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz null,
  constraint auth_password_credentials_username_length_check check (
    char_length(username_normalized) between 3 and 30
  ),
  constraint auth_password_credentials_username_format_check check (
    username_normalized ~ '^[a-z0-9][a-z0-9._]*[a-z0-9]$'
  ),
  constraint auth_password_credentials_password_hash_check check (
    char_length(password_hash) between 32 and 512
  ),
  constraint auth_password_credentials_status_check check (
    credential_status in ('active', 'revoked')
  ),
  constraint auth_password_credentials_revoked_at_check check (
    (credential_status = 'revoked' and revoked_at is not null)
    or (credential_status = 'active' and revoked_at is null)
  )
);

create table if not exists auth_refresh_sessions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  refresh_token_hash text not null,
  session_status text not null default 'active',
  user_agent_hash text null,
  ip_hash text null,
  issued_at timestamptz not null default now(),
  last_used_at timestamptz null,
  expires_at timestamptz not null,
  rotated_from_session_id uuid null references auth_refresh_sessions(id) on delete set null,
  revoked_at timestamptz null,
  revoked_reason_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint auth_refresh_sessions_hash_check check (
    char_length(refresh_token_hash) between 32 and 512
  ),
  constraint auth_refresh_sessions_status_check check (
    session_status in ('active', 'rotated', 'revoked', 'expired')
  ),
  constraint auth_refresh_sessions_revoked_at_check check (
    (session_status = 'revoked' and revoked_at is not null)
    or (session_status <> 'revoked')
  ),
  constraint auth_refresh_sessions_expiry_check check (expires_at > issued_at)
);

create table if not exists recovery_contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  contact_kind text not null default 'email',
  contact_value_hash text not null,
  contact_value_normalized text not null,
  contact_status text not null default 'unverified',
  verified_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recovery_contacts_kind_check check (contact_kind in ('email')),
  constraint recovery_contacts_value_length_check check (
    char_length(contact_value_normalized) between 3 and 320
  ),
  constraint recovery_contacts_hash_check check (
    char_length(contact_value_hash) between 32 and 512
  ),
  constraint recovery_contacts_status_check check (
    contact_status in ('unverified', 'verified', 'revoked')
  ),
  constraint recovery_contacts_verified_at_check check (
    (contact_status = 'verified' and verified_at is not null)
    or (contact_status <> 'verified')
  ),
  constraint recovery_contacts_revoked_at_check check (
    (contact_status = 'revoked' and revoked_at is not null)
    or (contact_status <> 'revoked')
  )
);

create table if not exists anonymous_identities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  public_handle text not null,
  display_label text not null,
  visual_seed text not null,
  identity_status text not null default 'active',
  safety_state text not null default 'normal',
  rotation_state text not null default 'stable',
  tombstoned_at timestamptz null,
  anonymized_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint anonymous_identities_status_check check (
    identity_status in ('active', 'inactive', 'suspended', 'tombstoned', 'anonymized', 'deleted')
  ),
  constraint anonymous_identities_safety_state_check check (
    safety_state in ('normal', 'limited', 'frozen', 'blocked')
  ),
  constraint anonymous_identities_rotation_state_check check (
    rotation_state in ('stable', 'rotation_pending', 'rotated')
  ),
  constraint anonymous_identities_tombstone_check check (
    (identity_status = 'tombstoned' and tombstoned_at is not null)
    or (identity_status <> 'tombstoned')
  ),
  constraint anonymous_identities_anonymized_check check (
    (identity_status = 'anonymized' and anonymized_at is not null)
    or (identity_status <> 'anonymized')
  )
);

create table if not exists profiles_private (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  profile_status text not null default 'incomplete',
  display_name text null,
  bio text null,
  avatar_media_id uuid null,
  reveal_state text not null default 'hidden',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint profiles_private_status_check check (
    profile_status in ('incomplete', 'active', 'suspended', 'deleted')
  ),
  constraint profiles_private_reveal_state_check check (
    reveal_state in ('hidden', 'requestable', 'limited', 'disabled')
  ),
  constraint profiles_private_bio_length_check check (
    bio is null or char_length(bio) <= 500
  )
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
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
  )
);

create table if not exists conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  account_id uuid not null references auth_accounts(id) on delete restrict,
  anonymous_identity_id uuid not null references anonymous_identities(id) on delete restrict,
  participant_role text not null,
  participant_state text not null default 'active',
  last_read_at timestamptz null,
  joined_at timestamptz not null default now(),
  left_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint conversation_participants_role_check check (
    participant_role in ('initiator', 'responder')
  ),
  constraint conversation_participants_state_check check (
    participant_state in ('active', 'left', 'blocked', 'removed', 'deleted')
  ),
  constraint conversation_participants_left_at_check check (
    left_at is null or participant_state in ('left', 'blocked', 'removed', 'deleted')
  )
);

create unique index if not exists conversation_participants_sender_fk_idx
  on conversation_participants (id, conversation_id, anonymous_identity_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_participant_id uuid not null references conversation_participants(id) on delete restrict,
  sender_anonymous_identity_id uuid not null references anonymous_identities(id) on delete restrict,
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
  ) references conversation_participants (
    id,
    conversation_id,
    anonymous_identity_id
  ) on delete restrict,
  constraint messages_kind_check check (message_kind in ('text')),
  constraint messages_body_text_check check (
    message_state = 'deleted'
    or (
      body_text is not null
      and char_length(btrim(body_text)) between 1 and 4000
    )
  ),
  constraint messages_client_message_id_length_check check (
    client_message_id is null or char_length(client_message_id) <= 80
  ),
  constraint messages_state_check check (
    message_state in ('sent', 'edited', 'deleted')
  ),
  constraint messages_moderation_state_check check (
    moderation_state in ('visible', 'under_review', 'hidden')
  )
);

create unique index if not exists messages_id_conversation_id_idx
  on messages (id, conversation_id);

create table if not exists blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_account_id uuid not null references auth_accounts(id) on delete restrict,
  blocker_anonymous_identity_id uuid not null references anonymous_identities(id) on delete restrict,
  blocked_account_id uuid null references auth_accounts(id) on delete restrict,
  blocked_anonymous_identity_id uuid not null references anonymous_identities(id) on delete restrict,
  block_scope text not null default 'identity',
  block_status text not null default 'active',
  reason_code text null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz null,
  constraint blocks_scope_check check (block_scope in ('identity', 'conversation')),
  constraint blocks_status_check check (block_status in ('active', 'revoked')),
  constraint blocks_revoked_at_check check (
    (block_status = 'revoked' and revoked_at is not null)
    or (block_status = 'active' and revoked_at is null)
  ),
  constraint blocks_no_self_identity_check check (
    blocker_anonymous_identity_id <> blocked_anonymous_identity_id
  )
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_account_id uuid not null references auth_accounts(id) on delete restrict,
  reporter_anonymous_identity_id uuid not null references anonymous_identities(id) on delete restrict,
  reported_account_id uuid null references auth_accounts(id) on delete restrict,
  reported_anonymous_identity_id uuid null references anonymous_identities(id) on delete restrict,
  conversation_id uuid null references conversations(id) on delete cascade,
  message_id uuid null,
  report_scope text not null,
  reason_code text not null,
  note_text text null,
  report_status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint reports_message_fk foreign key (
    message_id,
    conversation_id
  ) references messages (id, conversation_id) on delete cascade,
  constraint reports_scope_check check (
    report_scope in ('account', 'identity', 'conversation', 'message')
  ),
  constraint reports_reason_check check (
    reason_code in ('safety', 'spam', 'harassment', 'impersonation', 'other')
  ),
  constraint reports_status_check check (
    report_status in ('open', 'reviewing', 'resolved', 'dismissed')
  ),
  constraint reports_note_length_check check (
    note_text is null or char_length(note_text) <= 500
  )
);

create table if not exists moderation_actions (
  id uuid primary key default gen_random_uuid(),
  target_account_id uuid null references auth_accounts(id) on delete restrict,
  target_anonymous_identity_id uuid null references anonymous_identities(id) on delete restrict,
  target_conversation_id uuid null references conversations(id) on delete cascade,
  target_message_id uuid null references messages(id) on delete cascade,
  report_id uuid null references reports(id) on delete set null,
  action_kind text not null,
  action_state text not null default 'applied',
  reason_code text not null,
  actor_kind text not null default 'admin',
  admin_user_id uuid null,
  created_at timestamptz not null default now(),
  reverted_at timestamptz null,
  constraint moderation_actions_kind_check check (
    action_kind in (
      'warn_account',
      'disable_account',
      'freeze_identity',
      'hide_message',
      'freeze_conversation',
      'close_conversation',
      'restore'
    )
  ),
  constraint moderation_actions_state_check check (
    action_state in ('applied', 'reverted')
  ),
  constraint moderation_actions_actor_kind_check check (
    actor_kind in ('admin', 'system')
  ),
  constraint moderation_actions_reverted_at_check check (
    (action_state = 'reverted' and reverted_at is not null)
    or (action_state = 'applied' and reverted_at is null)
  )
);

create table if not exists deletion_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  request_kind text not null default 'account_delete',
  request_state text not null default 'requested',
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz null,
  processed_at timestamptz null,
  rejected_reason_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deletion_requests_kind_check check (
    request_kind in ('account_delete', 'identity_tombstone', 'conversation_tombstone')
  ),
  constraint deletion_requests_state_check check (
    request_state in ('requested', 'scheduled', 'processed', 'rejected', 'cancelled')
  ),
  constraint deletion_requests_processed_at_check check (
    (request_state in ('processed', 'rejected', 'cancelled') and processed_at is not null)
    or (request_state in ('requested', 'scheduled') and processed_at is null)
  )
);

create table if not exists retention_jobs (
  id uuid primary key default gen_random_uuid(),
  deletion_request_id uuid null references deletion_requests(id) on delete set null,
  account_id uuid null references auth_accounts(id) on delete restrict,
  job_kind text not null,
  job_state text not null default 'queued',
  run_after timestamptz not null default now(),
  locked_at timestamptz null,
  completed_at timestamptz null,
  failed_at timestamptz null,
  failure_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint retention_jobs_kind_check check (
    job_kind in ('tombstone_account', 'anonymize_account', 'purge_expired_data')
  ),
  constraint retention_jobs_state_check check (
    job_state in ('queued', 'running', 'completed', 'failed', 'cancelled')
  )
);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references auth_accounts(id) on delete restrict,
  entitlement_kind text not null,
  entitlement_state text not null default 'inactive',
  source_kind text not null default 'backend',
  starts_at timestamptz null,
  expires_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint entitlements_kind_check check (
    entitlement_kind in ('plus')
  ),
  constraint entitlements_state_check check (
    entitlement_state in ('active', 'inactive', 'expired', 'revoked')
  ),
  constraint entitlements_source_kind_check check (
    source_kind in ('backend', 'admin', 'billing_adapter')
  ),
  constraint entitlements_revoked_at_check check (
    (entitlement_state = 'revoked' and revoked_at is not null)
    or (entitlement_state <> 'revoked')
  )
);

create table if not exists admin_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null,
  role_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_roles_key_length_check check (
    char_length(role_key) between 3 and 80
  ),
  constraint admin_roles_status_check check (
    role_status in ('active', 'disabled')
  )
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  account_id uuid null references auth_accounts(id) on delete restrict,
  role_id uuid not null references admin_roles(id) on delete restrict,
  admin_status text not null default 'active',
  display_label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  disabled_at timestamptz null,
  constraint admin_users_status_check check (
    admin_status in ('active', 'disabled')
  ),
  constraint admin_users_disabled_at_check check (
    (admin_status = 'disabled' and disabled_at is not null)
    or (admin_status = 'active' and disabled_at is null)
  )
);

alter table moderation_actions
  add constraint moderation_actions_admin_user_fk
  foreign key (admin_user_id) references admin_users(id) on delete set null;

create table if not exists admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid null references admin_users(id) on delete set null,
  event_kind text not null,
  target_kind text not null,
  target_id uuid null,
  audit_status text not null default 'recorded',
  safe_summary text not null,
  created_at timestamptz not null default now(),
  constraint admin_audit_events_kind_length_check check (
    char_length(event_kind) between 3 and 120
  ),
  constraint admin_audit_events_target_kind_check check (
    target_kind in (
      'account',
      'anonymous_identity',
      'conversation',
      'message',
      'report',
      'entitlement',
      'system'
    )
  ),
  constraint admin_audit_events_status_check check (
    audit_status in ('recorded')
  ),
  constraint admin_audit_events_safe_summary_length_check check (
    char_length(safe_summary) between 1 and 500
  )
);

create unique index if not exists auth_password_credentials_username_idx
  on auth_password_credentials (username_normalized)
  where credential_status = 'active';

create unique index if not exists auth_password_credentials_account_active_idx
  on auth_password_credentials (account_id)
  where credential_status = 'active';

create unique index if not exists auth_refresh_sessions_token_hash_idx
  on auth_refresh_sessions (refresh_token_hash);

create index if not exists auth_refresh_sessions_account_status_idx
  on auth_refresh_sessions (account_id, session_status, expires_at desc);

create unique index if not exists recovery_contacts_account_kind_active_idx
  on recovery_contacts (account_id, contact_kind)
  where contact_status <> 'revoked';

create unique index if not exists recovery_contacts_value_active_idx
  on recovery_contacts (contact_kind, contact_value_normalized)
  where contact_status in ('unverified', 'verified');

create unique index if not exists anonymous_identities_public_handle_idx
  on anonymous_identities (public_handle)
  where identity_status in ('active', 'inactive', 'suspended');

create index if not exists anonymous_identities_account_status_idx
  on anonymous_identities (account_id, identity_status);

create unique index if not exists profiles_private_account_active_idx
  on profiles_private (account_id)
  where profile_status <> 'deleted';

create index if not exists conversations_status_updated_idx
  on conversations (conversation_status, updated_at desc)
  where deleted_at is null;

create index if not exists conversation_participants_account_idx
  on conversation_participants (account_id, participant_state);

create index if not exists conversation_participants_conversation_idx
  on conversation_participants (conversation_id);

create unique index if not exists conversation_participants_active_identity_idx
  on conversation_participants (conversation_id, anonymous_identity_id)
  where deleted_at is null;

create index if not exists messages_conversation_pagination_idx
  on messages (conversation_id, sent_at desc, id desc);

create unique index if not exists messages_client_idempotency_idx
  on messages (conversation_id, sender_participant_id, client_message_id)
  where client_message_id is not null;

create index if not exists blocks_blocker_idx
  on blocks (blocker_anonymous_identity_id, block_status);

create index if not exists blocks_blocked_idx
  on blocks (blocked_anonymous_identity_id, block_status);

create unique index if not exists blocks_active_identity_pair_idx
  on blocks (blocker_anonymous_identity_id, blocked_anonymous_identity_id)
  where block_status = 'active';

create index if not exists reports_queue_idx
  on reports (report_status, created_at asc);

create index if not exists reports_conversation_idx
  on reports (conversation_id, report_status)
  where conversation_id is not null;

create index if not exists reports_message_idx
  on reports (message_id, report_status)
  where message_id is not null;

create index if not exists moderation_actions_target_account_idx
  on moderation_actions (target_account_id, created_at desc)
  where target_account_id is not null;

create index if not exists moderation_actions_report_idx
  on moderation_actions (report_id)
  where report_id is not null;

create index if not exists deletion_requests_queue_idx
  on deletion_requests (request_state, scheduled_for asc, requested_at asc);

create index if not exists retention_jobs_queue_idx
  on retention_jobs (job_state, run_after asc);

create index if not exists entitlements_account_state_idx
  on entitlements (account_id, entitlement_kind, entitlement_state);

create unique index if not exists entitlements_one_active_plus_idx
  on entitlements (account_id, entitlement_kind)
  where entitlement_kind = 'plus'
    and entitlement_state = 'active';

create unique index if not exists admin_roles_role_key_idx
  on admin_roles (role_key);

create index if not exists admin_users_role_status_idx
  on admin_users (role_id, admin_status);

create index if not exists admin_audit_events_admin_created_idx
  on admin_audit_events (admin_user_id, created_at desc);

create index if not exists admin_audit_events_target_idx
  on admin_audit_events (target_kind, target_id, created_at desc);

comment on table auth_accounts is
  'ANKION-owned account authority. The account id is technical app-account ownership.';
comment on table auth_password_credentials is
  'Username credential boundary. Stores password hashes only.';
comment on table auth_refresh_sessions is
  'Refresh session boundary. Stores refresh token hashes only.';
comment on table recovery_contacts is
  'Recovery contact boundary. Email is for recovery only.';
comment on table anonymous_identities is
  'Public anonymous in-app persona boundary with tombstone support.';
comment on table profiles_private is
  'Private profile boundary. Real profile data is revealed only through API-controlled DTOs.';
comment on table messages is
  'Text-only message MVP foundation.';
comment on table entitlements is
  'Backend-controlled entitlement foundation independent of recovery email.';
comment on table admin_audit_events is
  'Admin action audit trail with public-safe summaries.';
