-- ANKION Phase 25C
-- Controlled local SQL transactional RLS harness draft.
-- DO NOT RUN IN PHASE 25C.
-- Future execution requires explicit Phase 25D GO.
-- Local Supabase only.
-- Never staging.
-- Never production.
-- Never remote.
-- No real user data.
-- No real profile data.
-- No real emails or phones.
-- No media or storage objects.
-- Must end with transaction rollback.
-- Ending this transaction with anything other than ROLLBACK is forbidden.

BEGIN;

-- Phase 25D only. Keep this line commented in Phase 25C.
-- SET LOCAL ankion.phase25d_explicit_go = 'true';

DO $$
BEGIN
  IF current_setting('ankion.phase25d_explicit_go', true) IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'ANKION Phase 25D explicit GO required. This harness must not run in Phase 25C.';
  END IF;
END $$;

-- Deterministic local-only UUID model for future execution.
-- owner_a: 00000000-0000-4000-8000-0000000000a1
-- owner_b: 00000000-0000-4000-8000-0000000000b2
-- context_x: 00000000-0000-4000-8000-0000000000c3
-- profile_private_owner_a_row: 00000000-0000-4000-8000-00000000p0a1 is intentionally not a valid UUID label; actual row id below uses a valid UUID.
-- anonymous_identity_owner_a_row: 00000000-0000-4000-8000-00000000a1d1

CREATE TEMP TABLE phase25c_results (
  test_name text not null,
  target_table text not null,
  actor text not null,
  expected_result text not null,
  observed_result text not null,
  pass boolean not null,
  notes text not null default ''
);

GRANT INSERT, SELECT ON TABLE phase25c_results TO anon, authenticated;

-- Synthetic local-only auth parent rows for future execution.
-- These rows exist only inside this transaction and must disappear through ROLLBACK.
-- No auth.users row data should be selected by this harness.
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  is_sso_user,
  is_anonymous
) VALUES
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-4000-8000-0000000000a1'::uuid,
    'authenticated',
    'authenticated',
    'owner-a@example.invalid',
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false,
    false
  ),
  (
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-4000-8000-0000000000b2'::uuid,
    'authenticated',
    'authenticated',
    'owner-b@example.invalid',
    NULL,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    false,
    false
  );

-- Fake target row setup for future execution.
INSERT INTO public.profiles_private (
  id,
  owner_user_id,
  chosen_display_name,
  approved_profile_photo_asset_id,
  short_bio,
  age_band,
  profile_visibility_default,
  profile_status,
  safety_state,
  verification_summary_state,
  created_at,
  updated_at,
  deleted_at
) VALUES (
  '00000000-0000-4000-8000-00000000f0a1'::uuid,
  '00000000-0000-4000-8000-0000000000a1'::uuid,
  'Local Only Owner A',
  NULL,
  'Local only placeholder profile text.',
  'undisclosed',
  'private',
  'active',
  'normal',
  'unverified',
  now(),
  now(),
  NULL
);

INSERT INTO public.anonymous_identities (
  id,
  owner_user_id,
  anonymous_label,
  anonymous_visual_seed,
  voice_presence_label,
  status,
  safety_state,
  rotation_state,
  rotated_at,
  created_at,
  updated_at,
  deleted_at
) VALUES (
  '00000000-0000-4000-8000-00000000a1d1'::uuid,
  '00000000-0000-4000-8000-0000000000a1'::uuid,
  'Local Only Voice A',
  'local-only-seed-owner-a',
  'local-only-voice-presence',
  'active',
  'normal',
  'stable',
  NULL,
  now(),
  now(),
  NULL
);

-- Assertion pattern:
-- permission denied = missing table privilege.
-- RLS-filtered zero rows = table privilege exists but policy hides non-owned row.
-- allowed one row = owner-bound policy exposes exactly one targeted own row.

-- A. unauthenticated_user SELECT profiles_private: DENY by missing anon SELECT privilege.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '', true);
  SET LOCAL ROLE anon;
  BEGIN
    SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private anon select denied', 'profiles_private', 'unauthenticated_user', 'permission denied', 'unexpected success count=' || v_count, false, 'anon must not read private profiles');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private anon select denied', 'profiles_private', 'unauthenticated_user', 'permission denied', 'permission denied', true, 'missing anon SELECT grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private anon select denied', 'profiles_private', 'unauthenticated_user', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;
END $$;

-- B. authenticated_non_owner_b SELECT owner_a profiles_private row: DENY by RLS-filtered zero rows.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private non-owner zero rows', 'profiles_private', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'non-owner must not see owner_a private row');
END $$;

-- C. authenticated_owner_a SELECT own profiles_private row: ALLOW by one visible targeted own row.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private owner sees own row', 'profiles_private', 'authenticated_owner_a', 'allowed one row', 'count=' || v_count, v_count = 1, 'owner-bound SELECT policy');
END $$;

-- D. reveal_recipient_b_for_context_x SELECT raw owner_a profiles_private row: DENY by RLS zero rows.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated","context_x":"00000000-0000-4000-8000-0000000000c3"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private reveal recipient raw deny', 'profiles_private', 'reveal_recipient_b_for_context_x', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'reveal must not grant raw profiles_private read');
END $$;

-- E. connection_participant_b_without_reveal SELECT raw owner_a profiles_private row: DENY by RLS zero rows.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private connection participant raw deny', 'profiles_private', 'connection_participant_b_without_reveal', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'connection participation does not expose raw profile rows');
END $$;

-- F/G/H/I/J. profiles_private write and mutation attempts: DENY by missing authenticated write grants.
DO $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO public.profiles_private (id, owner_user_id, profile_visibility_default, profile_status, safety_state, verification_summary_state)
    VALUES ('00000000-0000-4000-8000-00000000f0a2'::uuid, '00000000-0000-4000-8000-0000000000a1'::uuid, 'private', 'active', 'normal', 'unverified');
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private insert denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no INSERT grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private insert denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no INSERT grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private insert denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.profiles_private SET short_bio = 'local-only changed text' WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private update denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no UPDATE grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private update denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no UPDATE grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private update denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    DELETE FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private delete denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no DELETE grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private delete denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no DELETE grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private delete denied', 'profiles_private', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.profiles_private SET owner_user_id = '00000000-0000-4000-8000-0000000000b2'::uuid WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private owner_user_id reassignment denied', 'profiles_private', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', 'unexpected success', false, 'owner_user_id must remain immutable');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private owner_user_id reassignment denied', 'profiles_private', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', 'permission denied', true, 'no UPDATE grant now; future policies must preserve immutability');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private owner_user_id reassignment denied', 'profiles_private', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.profiles_private SET safety_state = 'limited' WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private safety field mutation denied', 'profiles_private', 'malicious_owner_attempting_system_field_mutation', 'permission denied', 'unexpected success', false, 'system/safety fields must be protected');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private safety field mutation denied', 'profiles_private', 'malicious_owner_attempting_system_field_mutation', 'permission denied', 'permission denied', true, 'no UPDATE grant now; future policies must protect safety fields');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('profiles_private safety field mutation denied', 'profiles_private', 'malicious_owner_attempting_system_field_mutation', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;
END $$;

-- K/L. public/global/search/browse and monetization identity/reveal bypass checks are represented as direct-table non-owner raw access labels.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private public global search browse forbidden', 'profiles_private', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'no public/global/search/browse profile access');

  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.profiles_private WHERE id = '00000000-0000-4000-8000-00000000f0a1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('profiles_private monetization bypass forbidden', 'profiles_private', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'monetization must not bypass identity consent');
END $$;

-- A. unauthenticated_user SELECT anonymous_identities: DENY by missing anon SELECT privilege.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '', true);
  SET LOCAL ROLE anon;
  BEGIN
    SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities anon select denied', 'anonymous_identities', 'unauthenticated_user', 'permission denied', 'unexpected success count=' || v_count, false, 'anon must not read anonymous identity table directly');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities anon select denied', 'anonymous_identities', 'unauthenticated_user', 'permission denied', 'permission denied', true, 'missing anon SELECT grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities anon select denied', 'anonymous_identities', 'unauthenticated_user', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;
END $$;

-- B. authenticated_non_owner_b SELECT owner_a anonymous identity row directly: DENY by RLS zero rows.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities non-owner zero rows', 'anonymous_identities', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'non-owner must not see owner_a anonymous identity row directly');
END $$;

-- C. authenticated_owner_a SELECT own anonymous identity row: ALLOW by one visible targeted own row.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities owner sees own row', 'anonymous_identities', 'authenticated_owner_a', 'allowed one row', 'count=' || v_count, v_count = 1, 'owner-bound SELECT policy');
END $$;

-- D/E/F/L. global directory, member-directory, search/browse/discoverability, and monetization bypass labels use non-owner direct-table access to owner_a row.
DO $$
DECLARE v_count integer;
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000b2', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000b2","role":"authenticated"}', true);

  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities feed global directory forbidden', 'anonymous_identities', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'no global anonymous directory');

  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities connection member directory forbidden', 'anonymous_identities', 'connection_participant_b_without_reveal', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'no room or member-directory model');

  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities search browse discoverability forbidden', 'anonymous_identities', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'no user or anonymous identity search/browse/discoverability');

  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
  RESET ROLE;
  INSERT INTO phase25c_results VALUES ('anonymous_identities monetization bypass forbidden', 'anonymous_identities', 'authenticated_non_owner_b', 'RLS zero rows', 'count=' || v_count, v_count = 0, 'monetization must not bypass identity boundaries');
END $$;

-- G/H/I/J/K. anonymous_identities write and mutation attempts: DENY by missing authenticated write grants.
DO $$
BEGIN
  PERFORM set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-0000000000a1', true);
  PERFORM set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-0000000000a1","role":"authenticated"}', true);

  SET LOCAL ROLE authenticated;
  BEGIN
    INSERT INTO public.anonymous_identities (id, owner_user_id, anonymous_label, anonymous_visual_seed, voice_presence_label, status, safety_state, rotation_state)
    VALUES ('00000000-0000-4000-8000-00000000a1d2'::uuid, '00000000-0000-4000-8000-0000000000a1'::uuid, 'Local Only Voice A2', 'local-only-seed-owner-a2', 'local-only-voice-presence-2', 'active', 'normal', 'stable');
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities insert denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no INSERT grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities insert denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no INSERT grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities insert denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.anonymous_identities SET anonymous_label = 'Local Only Changed Label' WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities update denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no UPDATE grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities update denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no UPDATE grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities update denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    DELETE FROM public.anonymous_identities WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities delete denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'unexpected success', false, 'authenticated has no DELETE grant');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities delete denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', 'permission denied', true, 'authenticated has no DELETE grant');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities delete denied', 'anonymous_identities', 'authenticated_owner_a', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.anonymous_identities SET owner_user_id = '00000000-0000-4000-8000-0000000000b2'::uuid WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities owner_user_id reassignment denied', 'anonymous_identities', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', 'unexpected success', false, 'owner_user_id must remain immutable');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities owner_user_id reassignment denied', 'anonymous_identities', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', 'permission denied', true, 'no UPDATE grant now; future policies must preserve immutability');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities owner_user_id reassignment denied', 'anonymous_identities', 'malicious_owner_attempting_owner_user_id_reassignment', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;

  SET LOCAL ROLE authenticated;
  BEGIN
    UPDATE public.anonymous_identities SET safety_state = 'limited' WHERE id = '00000000-0000-4000-8000-00000000a1d1'::uuid;
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities safety field mutation denied', 'anonymous_identities', 'malicious_owner_attempting_system_field_mutation', 'permission denied', 'unexpected success', false, 'system/safety fields must be protected');
  EXCEPTION WHEN insufficient_privilege THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities safety field mutation denied', 'anonymous_identities', 'malicious_owner_attempting_system_field_mutation', 'permission denied', 'permission denied', true, 'no UPDATE grant now; future policies must protect safety fields');
  WHEN OTHERS THEN
    RESET ROLE;
    INSERT INTO phase25c_results VALUES ('anonymous_identities safety field mutation denied', 'anonymous_identities', 'malicious_owner_attempting_system_field_mutation', 'permission denied', SQLSTATE || ':' || SQLERRM, false, 'unexpected error');
  END;
END $$;

RESET ROLE;

-- Future execution summary. This SELECT reads only temp harness results, not application/user rows.
SELECT
  test_name,
  target_table,
  actor,
  expected_result,
  observed_result,
  pass,
  notes
FROM phase25c_results
ORDER BY target_table, test_name;

ROLLBACK;