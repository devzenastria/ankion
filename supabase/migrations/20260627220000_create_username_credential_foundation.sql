-- Sprint 85E-R3 - username credential foundation draft.
-- Scope: registry and private mapping foundations only.
-- This migration must be reviewed and applied only through a later explicit DB GO.

create schema if not exists private;
create extension if not exists pgcrypto;

create table public.account_usernames (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  username_display text not null,
  username_normalized text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint account_usernames_display_length_check check (
    char_length(username_display) between 3 and 30
  ),
  constraint account_usernames_normalized_length_check check (
    char_length(username_normalized) between 3 and 30
  ),
  constraint account_usernames_normalized_lowercase_check check (
    username_normalized = lower(username_normalized)
  ),
  constraint account_usernames_normalized_charset_check check (
    username_normalized ~ '^[a-z0-9][a-z0-9._]*[a-z0-9]$'
  ),
  constraint account_usernames_normalized_separator_check check (
    username_normalized !~ '[._]{2,}'
  ),
  constraint account_usernames_status_check check (
    status in ('active', 'retired')
  ),
  constraint account_usernames_deleted_status_check check (
    (deleted_at is null and status = 'active')
    or (deleted_at is not null and status = 'retired')
  )
);

create unique index account_usernames_one_active_username_idx
  on public.account_usernames (username_normalized)
  where status = 'active' and deleted_at is null;

create unique index account_usernames_one_active_owner_idx
  on public.account_usernames (owner_user_id)
  where status = 'active' and deleted_at is null;

create index account_usernames_owner_user_id_idx
  on public.account_usernames (owner_user_id);

comment on table public.account_usernames is
  'Credential-grade username registry. It is separate from profile display data and supports future backend username/password auth boundaries.';
comment on column public.account_usernames.owner_user_id is
  'Technical app-account ownership. It is not a real-world identity assertion and must not be supplied by mobile clients.';
comment on column public.account_usernames.username_display is
  'User-facing username presentation. It is not the private profile chosen_display_name.';
comment on column public.account_usernames.username_normalized is
  'Normalized credential lookup key. Backend boundaries must avoid username enumeration when checking or logging this value.';

alter table public.account_usernames enable row level security;

revoke all privileges on table public.account_usernames from public, anon, authenticated;
grant select on table public.account_usernames to authenticated;

create policy account_usernames_owner_select_own
on public.account_usernames
for select
to authenticated
using (
  auth.uid() = owner_user_id
);

create table private.account_auth_identifiers (
  owner_user_id uuid primary key references auth.users(id) on delete cascade,
  auth_identifier text not null unique,
  created_at timestamptz not null default now()
);

comment on table private.account_auth_identifiers is
  'Backend-only mapping from app account ownership to the internal Supabase Auth login identifier. It must never be exposed to mobile.';
comment on column private.account_auth_identifiers.auth_identifier is
  'Internal credential identifier for future backend username/password auth. It is not a username, email, or public persona field.';

create table private.account_recovery_contacts (
  owner_user_id uuid primary key references auth.users(id) on delete cascade,
  recovery_email text null,
  recovery_email_normalized text null,
  recovery_warning_acknowledged boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_recovery_contacts_normalized_lowercase_check check (
    recovery_email_normalized is null
    or recovery_email_normalized = lower(btrim(recovery_email_normalized))
  )
);

comment on table private.account_recovery_contacts is
  'Recovery contact foundation. Recovery email is separate from username login identity and may be inaccessible, which can make account recovery impossible.';
comment on column private.account_recovery_contacts.recovery_email is
  'Recovery contact supplied by the user. It is not the login identifier and is not an activation gate.';
comment on column private.account_recovery_contacts.recovery_warning_acknowledged is
  'Acknowledges that account recovery can fail if the recovery email cannot be accessed later.';

create table private.reserved_usernames (
  username_normalized text primary key,
  reason text null,
  created_at timestamptz not null default now(),
  constraint reserved_usernames_normalized_lowercase_check check (
    username_normalized = lower(username_normalized)
  ),
  constraint reserved_usernames_normalized_charset_check check (
    username_normalized ~ '^[a-z0-9][a-z0-9._]*[a-z0-9]$'
  )
);

comment on table private.reserved_usernames is
  'Backend-only reserved username foundation for future signup validation.';

insert into private.reserved_usernames (username_normalized, reason)
values
  ('admin', 'system'),
  ('root', 'system'),
  ('support', 'system'),
  ('system', 'system'),
  ('ankion', 'system'),
  ('api', 'system'),
  ('auth', 'system'),
  ('login', 'system'),
  ('logout', 'system'),
  ('settings', 'system'),
  ('profile', 'system'),
  ('null', 'system'),
  ('undefined', 'system')
on conflict (username_normalized) do nothing;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;
revoke all privileges on table private.account_auth_identifiers from public, anon, authenticated;
revoke all privileges on table private.account_recovery_contacts from public, anon, authenticated;
revoke all privileges on table private.reserved_usernames from public, anon, authenticated;

-- Safety notes:
-- - Username is credential identity, not a profile reveal surface.
-- - public.profiles_private.chosen_display_name remains private profile/persona display data.
-- - public.anonymous_identities.anonymous_label remains app-facing anonymous persona data.
-- - Recovery email is not the login identity and is not an activation requirement.
-- - Future username/password auth must use a backend boundary with generic failure messages.
