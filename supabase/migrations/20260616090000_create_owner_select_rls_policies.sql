-- Phase 24V - owner-bound SELECT RLS policies.
-- Created as an executable migration file only.
-- DO NOT APPLY in Phase 24V.
-- Scope is limited to authenticated owner SELECT access for the two first-migration tables.
-- Authenticated SELECT table privileges are included because Phase 24U documented they are not currently present for these tables.

GRANT SELECT ON TABLE public.profiles_private TO authenticated;
GRANT SELECT ON TABLE public.anonymous_identities TO authenticated;

CREATE POLICY profiles_private_owner_select_own
ON public.profiles_private
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_user_id
);

CREATE POLICY anonymous_identities_owner_select_own
ON public.anonymous_identities
FOR SELECT
TO authenticated
USING (
  auth.uid() = owner_user_id
);