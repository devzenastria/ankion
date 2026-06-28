-- Sprint 85E-R7Q - username auth private RPC boundary.
-- Backend-only service_role RPCs for username/password credential operations.
-- These functions must not be exposed to mobile clients.

-- Safety notes:
-- - Do not expose the private schema through PostgREST.
-- - private.account_auth_identifiers and private.account_recovery_contacts
--   must never be exposed to mobile clients.
-- - chosen_display_name remains profile/persona data, not credential identity.
-- - Recovery email is recovery contact data, not login identity.

create or replace function public.username_auth_create_account_credentials(
  p_owner_user_id uuid,
  p_username_display text,
  p_username_normalized text,
  p_auth_identifier text,
  p_recovery_email text,
  p_recovery_email_normalized text,
  p_recovery_warning_acknowledged boolean
)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  insert into public.account_usernames (
    owner_user_id,
    username_display,
    username_normalized,
    status
  )
  values (
    p_owner_user_id,
    p_username_display,
    p_username_normalized,
    'active'
  );

  insert into private.account_auth_identifiers (
    owner_user_id,
    auth_identifier
  )
  values (
    p_owner_user_id,
    p_auth_identifier
  );

  insert into private.account_recovery_contacts (
    owner_user_id,
    recovery_email,
    recovery_email_normalized,
    recovery_warning_acknowledged
  )
  values (
    p_owner_user_id,
    p_recovery_email,
    p_recovery_email_normalized,
    p_recovery_warning_acknowledged
  );
end;
$$;

comment on function public.username_auth_create_account_credentials(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) is
  'Backend-only service_role RPC. Creates username credential rows and private auth/recovery rows without exposing private schema values to mobile clients.';

revoke all on function public.username_auth_create_account_credentials(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) from public;
revoke all on function public.username_auth_create_account_credentials(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) from anon;
revoke all on function public.username_auth_create_account_credentials(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) from authenticated;
grant execute on function public.username_auth_create_account_credentials(
  uuid,
  text,
  text,
  text,
  text,
  text,
  boolean
) to service_role;

create or replace function public.username_auth_lookup_identifier(
  p_username_normalized text
)
returns table (
  owner_user_id uuid,
  auth_identifier text
)
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select
    usernames.owner_user_id,
    identifiers.auth_identifier
  from public.account_usernames as usernames
  join private.account_auth_identifiers as identifiers
    on identifiers.owner_user_id = usernames.owner_user_id
  where usernames.username_normalized = p_username_normalized
    and usernames.status = 'active'
    and usernames.deleted_at is null
  limit 1;
$$;

comment on function public.username_auth_lookup_identifier(text) is
  'Backend-only service_role RPC. Maps an active username to the internal auth identifier without exposing private schema tables to mobile clients.';

revoke all on function public.username_auth_lookup_identifier(text) from public;
revoke all on function public.username_auth_lookup_identifier(text) from anon;
revoke all on function public.username_auth_lookup_identifier(text) from authenticated;
grant execute on function public.username_auth_lookup_identifier(text) to service_role;

create or replace function public.username_auth_cleanup_account_credentials(
  p_owner_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  delete from private.account_recovery_contacts
  where owner_user_id = p_owner_user_id;

  delete from private.account_auth_identifiers
  where owner_user_id = p_owner_user_id;

  delete from public.account_usernames
  where owner_user_id = p_owner_user_id;
end;
$$;

comment on function public.username_auth_cleanup_account_credentials(uuid) is
  'Backend-only service_role RPC. Cleans up credential rows after a later signup-stage failure. Auth user cleanup remains a backend admin responsibility.';

revoke all on function public.username_auth_cleanup_account_credentials(uuid) from public;
revoke all on function public.username_auth_cleanup_account_credentials(uuid) from anon;
revoke all on function public.username_auth_cleanup_account_credentials(uuid) from authenticated;
grant execute on function public.username_auth_cleanup_account_credentials(uuid) to service_role;

create or replace function public.username_auth_username_exists(
  p_username_normalized text
)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1
    from public.account_usernames as usernames
    where usernames.username_normalized = p_username_normalized
      and usernames.status = 'active'
      and usernames.deleted_at is null
  );
$$;

comment on function public.username_auth_username_exists(text) is
  'Backend-only service_role RPC. Checks active username existence without creating a public username availability API.';

revoke all on function public.username_auth_username_exists(text) from public;
revoke all on function public.username_auth_username_exists(text) from anon;
revoke all on function public.username_auth_username_exists(text) from authenticated;
grant execute on function public.username_auth_username_exists(text) to service_role;
