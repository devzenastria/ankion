-- Phase 28F - controlled creation crypto schema resolution fix.
-- Scope: replace public.create_owner_identity_foundation only.
-- Do not apply in Phase 28F. Static review and separate explicit GO are required before local apply.
-- Corrective change: schema-qualify gen_random_bytes as extensions.gen_random_bytes.
-- No direct broad INSERT/UPDATE/DELETE grants or policies are introduced.
-- No reveal, storage, runtime Auth integration, Supabase client integration, app binding, staging, or production work.

create or replace function public.create_owner_identity_foundation(
  p_chosen_display_name text default null,
  p_short_bio text default null,
  p_age_band text default null
)
returns table (
  profile_private_id uuid,
  anonymous_identity_id uuid
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_owner_user_id uuid;
  v_profile_id uuid;
  v_anonymous_id uuid;
  v_existing_deleted_profile_id uuid;
  v_display_name text;
  v_short_bio text;
  v_age_band text;
begin
  v_owner_user_id := auth.uid();

  if v_owner_user_id is null then
    raise exception 'AUTHENTICATED_OWNER_REQUIRED'
      using errcode = '28000';
  end if;

  v_display_name := nullif(btrim(p_chosen_display_name), '');
  v_short_bio := nullif(btrim(p_short_bio), '');
  v_age_band := nullif(btrim(p_age_band), '');

  if v_display_name is not null and char_length(v_display_name) > 80 then
    raise exception 'PROFILE_DISPLAY_NAME_TOO_LONG'
      using errcode = '22001';
  end if;

  if v_short_bio is not null and char_length(v_short_bio) > 280 then
    raise exception 'PROFILE_SHORT_BIO_TOO_LONG'
      using errcode = '22001';
  end if;

  if v_age_band is not null and v_age_band not in ('18_24', '25_34', '35_44', '45_plus', 'undisclosed') then
    raise exception 'PROFILE_AGE_BAND_INVALID'
      using errcode = '22000';
  end if;

  select id
    into v_existing_deleted_profile_id
    from public.profiles_private
   where owner_user_id = v_owner_user_id
     and deleted_at is not null
   limit 1;

  if v_existing_deleted_profile_id is not null then
    raise exception 'PROFILE_REACTIVATION_REQUIRES_SEPARATE_APPROVAL'
      using errcode = 'P0001';
  end if;

  insert into public.profiles_private (
    owner_user_id,
    chosen_display_name,
    short_bio,
    age_band
  )
  values (
    v_owner_user_id,
    v_display_name,
    v_short_bio,
    v_age_band
  )
  on conflict (owner_user_id) do nothing
  returning id into v_profile_id;

  if v_profile_id is null then
    select id
      into v_profile_id
      from public.profiles_private
     where owner_user_id = v_owner_user_id
       and deleted_at is null
     limit 1;
  end if;

  if v_profile_id is null then
    raise exception 'PROFILE_CREATION_FAILED'
      using errcode = 'P0001';
  end if;

  insert into public.anonymous_identities (
    owner_user_id,
    anonymous_label,
    anonymous_visual_seed,
    voice_presence_label
  )
  values (
    v_owner_user_id,
    'Anonymous voice',
    'voice-' || encode(extensions.gen_random_bytes(8), 'hex'),
    'Voice ready'
  )
  on conflict (owner_user_id)
    where status = 'active' and deleted_at is null
  do nothing
  returning id into v_anonymous_id;

  if v_anonymous_id is null then
    select id
      into v_anonymous_id
      from public.anonymous_identities
     where owner_user_id = v_owner_user_id
       and status = 'active'
       and deleted_at is null
     limit 1;
  end if;

  if v_anonymous_id is null then
    raise exception 'ANONYMOUS_IDENTITY_CREATION_FAILED'
      using errcode = 'P0001';
  end if;

  profile_private_id := v_profile_id;
  anonymous_identity_id := v_anonymous_id;
  return next;
end;
$$;

comment on function public.create_owner_identity_foundation(text, text, text) is
  'Controlled owner-bound provisioning boundary for the first private profile and active anonymous identity. Ownership is derived from auth.uid(); crypto generation is schema-qualified; direct broad INSERT remains blocked.';

revoke all on function public.create_owner_identity_foundation(text, text, text) from public;
revoke all on function public.create_owner_identity_foundation(text, text, text) from anon;
grant execute on function public.create_owner_identity_foundation(text, text, text) to authenticated;

-- Safety notes:
-- - The caller cannot supply owner_user_id.
-- - The caller cannot set status, safety, verification, rotation, audit, soft-delete, reveal, or system fields.
-- - Existing table defaults initialize server-owned fields.
-- - Duplicate profiles are blocked by profiles_private_owner_user_id_key.
-- - Duplicate active anonymous identities are blocked by anonymous_identities_one_active_per_owner_idx.
-- - Soft-deleted profile reactivation is not handled here and requires a separate approved design.
-- - Reveal must never grant raw profiles_private table reads.
-- - Monetization must never bypass identity, reveal, or consent.
