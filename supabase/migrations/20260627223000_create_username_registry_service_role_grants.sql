-- Sprint 85E-R7J - username registry service-role grant foundation.
-- Backend-only grants for the username/password auth boundary.
-- Do not expose private credential or recovery tables to mobile clients.

grant usage on schema public to service_role;
grant usage on schema private to service_role;

-- public.account_usernames remains owner-select only for authenticated users
-- through its existing RLS policy. Backend service_role uses these grants for
-- username availability checks, signup inserts, and cleanup/reconciliation.
grant select, insert, update, delete
  on table public.account_usernames
  to service_role;

-- Private username-auth tables are backend-only. They must not be exposed to
-- anon, authenticated, public, or mobile clients.
grant select, insert, delete
  on table private.account_auth_identifiers
  to service_role;

grant select, insert, update, delete
  on table private.account_recovery_contacts
  to service_role;

-- MVP reserved-name enforcement is static in backend source. This private
-- table remains reserved for a future server-side SQL/RPC boundary.
grant select
  on table private.reserved_usernames
  to service_role;

revoke all on table private.account_auth_identifiers
  from anon, authenticated, public;

revoke all on table private.account_recovery_contacts
  from anon, authenticated, public;

revoke all on table private.reserved_usernames
  from anon, authenticated, public;
