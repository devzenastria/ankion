-- Harden default table privileges for the content foundation tables.
-- RLS remains enabled; explicit access policies should be added separately
-- when product access rules are finalized.

revoke all privileges on table public.content_entries from public, anon, authenticated;
revoke all privileges on table public.content_entry_reactions from public, anon, authenticated;
revoke all privileges on table public.content_entry_reports from public, anon, authenticated;
revoke all privileges on table public.anonymous_identity_blocks from public, anon, authenticated;
