-- Phase 24L - First Narrow Migration File Creation
-- Scope: private profile foundation + anonymous identity foundation only.
-- This migration is not applied by Phase 24L.
-- Runtime Auth/Supabase binding, RLS policies, Storage, backend/API, and app code remain out of scope.

create extension if not exists pgcrypto;

create table public.profiles_private (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chosen_display_name text null,
  approved_profile_photo_asset_id uuid null,
  short_bio text null,
  age_band text null,
  profile_visibility_default text not null default 'private',
  profile_status text not null default 'incomplete',
  safety_state text not null default 'normal',
  verification_summary_state text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint profiles_private_owner_user_id_key unique (owner_user_id),
  constraint profiles_private_chosen_display_name_length check (
    chosen_display_name is null or char_length(chosen_display_name) <= 80
  ),
  constraint profiles_private_short_bio_length check (
    short_bio is null or char_length(short_bio) <= 280
  ),
  constraint profiles_private_age_band_check check (
    age_band is null or age_band in ('18_24', '25_34', '35_44', '45_plus', 'undisclosed')
  ),
  constraint profiles_private_visibility_default_check check (
    profile_visibility_default in ('private')
  ),
  constraint profiles_private_status_check check (
    profile_status in ('incomplete', 'active', 'suspended', 'deleted')
  ),
  constraint profiles_private_safety_state_check check (
    safety_state in ('normal', 'limited', 'suspended')
  ),
  constraint profiles_private_verification_summary_state_check check (
    verification_summary_state in ('unverified', 'pending', 'verified', 'rejected')
  )
);

comment on table public.profiles_private is
  'Private real profile foundation. Owner-only by default; non-owner visibility must use future connection/context-scoped DTO after owner approval.';
comment on column public.profiles_private.owner_user_id is
  'Internal ownership linkage to the authenticated account. This must not be exposed through public or anonymous preview surfaces.';
comment on column public.profiles_private.chosen_display_name is
  'Private display name candidate. Non-owner visibility requires future owner-approved connection/context DTO.';
comment on column public.profiles_private.approved_profile_photo_asset_id is
  'Future approved profile photo asset reference. Media access remains out of scope for this migration.';
comment on column public.profiles_private.updated_at is
  'Automatic update trigger is deferred to a later approved migration phase.';

create table public.anonymous_identities (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  anonymous_label text not null,
  anonymous_visual_seed text not null,
  voice_presence_label text not null,
  status text not null default 'active',
  safety_state text not null default 'normal',
  rotation_state text not null default 'stable',
  rotated_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint anonymous_identities_label_length check (char_length(anonymous_label) <= 80),
  constraint anonymous_identities_visual_seed_length check (char_length(anonymous_visual_seed) <= 120),
  constraint anonymous_identities_voice_presence_label_length check (char_length(voice_presence_label) <= 120),
  constraint anonymous_identities_status_check check (
    status in ('active', 'inactive', 'suspended', 'deleted')
  ),
  constraint anonymous_identities_safety_state_check check (
    safety_state in ('normal', 'limited', 'suspended')
  ),
  constraint anonymous_identities_rotation_state_check check (
    rotation_state in ('stable', 'rotated', 'archived')
  )
);

create unique index anonymous_identities_one_active_per_owner_idx
  on public.anonymous_identities (owner_user_id)
  where status = 'active' and deleted_at is null;

create index anonymous_identities_owner_user_id_idx
  on public.anonymous_identities (owner_user_id);

comment on table public.anonymous_identities is
  'Anonymous app-facing identity foundation. It stays separate from real profile data and must be exposed only through safe anonymous previews.';
comment on column public.anonymous_identities.owner_user_id is
  'Internal ownership linkage to the authenticated account. Anonymous previews must not expose this value.';
comment on column public.anonymous_identities.anonymous_label is
  'Anonymous-facing label for voice-first discovery. It is not a public real-profile handle.';
comment on column public.anonymous_identities.anonymous_visual_seed is
  'Anonymous visual seed for app-facing presentation. It must not encode real identity.';
comment on column public.anonymous_identities.voice_presence_label is
  'Voice-first anonymous presence label. It must not reveal real profile data.';
comment on column public.anonymous_identities.updated_at is
  'Automatic update trigger is deferred to a later approved migration phase.';

-- RLS is enabled as a deny-by-default safety posture.
-- RLS policies are intentionally not created in Phase 24L. Runtime access remains blocked until a later RLS implementation phase.
alter table public.profiles_private enable row level security;
alter table public.anonymous_identities enable row level security;

-- Rollback notes:
-- Non-production rollback may drop anonymous_identities then profiles_private if no real user data exists.
-- Production rollback must not drop user data without separate approval.
-- RLS policies are not part of this migration.
-- Storage/media/payment/backend are out of scope.