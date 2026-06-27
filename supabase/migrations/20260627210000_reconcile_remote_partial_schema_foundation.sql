-- Targeted foundation schema reconciliation.
-- This migration idempotently aligns foundation schema objects while preserving
-- existing identity tables and data. It does not modify migration history.

create extension if not exists pgcrypto;

create schema if not exists private;

do $$
declare
  v_missing text[];
begin
  if to_regclass('public.profiles_private') is null then
    raise exception 'REQUIRED_TABLE_MISSING: public.profiles_private';
  end if;

  if to_regclass('public.anonymous_identities') is null then
    raise exception 'REQUIRED_TABLE_MISSING: public.anonymous_identities';
  end if;

  select array_agg(column_name order by column_name)
    into v_missing
    from (
      values
        ('profiles_private', 'id'),
        ('profiles_private', 'owner_user_id'),
        ('profiles_private', 'chosen_display_name'),
        ('profiles_private', 'short_bio'),
        ('profiles_private', 'age_band'),
        ('profiles_private', 'deleted_at'),
        ('anonymous_identities', 'id'),
        ('anonymous_identities', 'owner_user_id'),
        ('anonymous_identities', 'anonymous_label'),
        ('anonymous_identities', 'anonymous_visual_seed'),
        ('anonymous_identities', 'voice_presence_label'),
        ('anonymous_identities', 'status'),
        ('anonymous_identities', 'deleted_at')
    ) as required_columns(table_name, column_name)
   where not exists (
     select 1
       from information_schema.columns c
      where c.table_schema = 'public'
        and c.table_name = required_columns.table_name
        and c.column_name = required_columns.column_name
   );

  if v_missing is not null then
    raise exception 'REQUIRED_IDENTITY_COLUMN_MISSING: %', array_to_string(v_missing, ',');
  end if;

  if not exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'profiles_private'
       and c.relrowsecurity
  ) then
    raise exception 'REQUIRED_RLS_DISABLED: public.profiles_private';
  end if;

  if not exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
     where n.nspname = 'public'
       and c.relname = 'anonymous_identities'
       and c.relrowsecurity
  ) then
    raise exception 'REQUIRED_RLS_DISABLED: public.anonymous_identities';
  end if;

  if not exists (
    select 1
      from pg_indexes
     where schemaname = 'public'
       and tablename = 'profiles_private'
       and indexname = 'profiles_private_owner_user_id_key'
  ) then
    raise exception 'REQUIRED_IDENTITY_INDEX_MISSING: profiles_private_owner_user_id_key';
  end if;

  if not exists (
    select 1
      from pg_indexes
     where schemaname = 'public'
       and tablename = 'anonymous_identities'
       and indexname = 'anonymous_identities_one_active_per_owner_idx'
  ) then
    raise exception 'REQUIRED_IDENTITY_INDEX_MISSING: anonymous_identities_one_active_per_owner_idx';
  end if;
end;
$$;

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

  insert into
    public.profiles_private (
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

  insert into
    public.anonymous_identities (
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

grant select on table public.profiles_private to authenticated;
grant select on table public.anonymous_identities to authenticated;

drop policy if exists profiles_private_owner_select_own
  on public.profiles_private;

drop policy if exists anonymous_identities_owner_select_own
  on public.anonymous_identities;

create policy profiles_private_owner_select_own
on public.profiles_private
for select
to authenticated
using (
  auth.uid() = owner_user_id
);

create policy anonymous_identities_owner_select_own
on public.anonymous_identities
for select
to authenticated
using (
  auth.uid() = owner_user_id
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  initiator_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  responder_anonymous_identity_id uuid null references public.anonymous_identities(id) on delete restrict,
  connection_kind text not null default 'voice_reply',
  connection_status text not null default 'pending',
  reply_eligibility_state text not null default 'awaiting_reply',
  lifecycle_state text not null default 'open',
  safety_state text not null default 'normal',
  moderation_state text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint connections_distinct_anonymous_identities_check check (
    responder_anonymous_identity_id is null
    or initiator_anonymous_identity_id <> responder_anonymous_identity_id
  ),
  constraint connections_kind_check check (
    connection_kind in ('voice_reply')
  ),
  constraint connections_status_check check (
    connection_status in ('pending', 'active', 'paused', 'closed', 'blocked', 'deleted')
  ),
  constraint connections_reply_eligibility_state_check check (
    reply_eligibility_state in ('awaiting_reply', 'replyable', 'paused', 'closed', 'blocked')
  ),
  constraint connections_lifecycle_state_check check (
    lifecycle_state in ('open', 'frozen', 'closed', 'deleted')
  ),
  constraint connections_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  ),
  constraint connections_moderation_state_check check (
    moderation_state in ('none', 'queued', 'reviewed', 'actioned')
  )
);

create table if not exists public.connection_participants (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  participant_role text not null,
  participant_state text not null default 'active',
  reply_state text not null default 'waiting',
  safety_state text not null default 'normal',
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint connection_participants_role_check check (
    participant_role in ('initiator', 'responder')
  ),
  constraint connection_participants_state_check check (
    participant_state in ('active', 'left', 'blocked', 'removed')
  ),
  constraint connection_participants_reply_state_check check (
    reply_state in ('waiting', 'replyable', 'paused', 'closed', 'blocked')
  ),
  constraint connection_participants_safety_state_check check (
    safety_state in ('normal', 'review_limited', 'frozen', 'blocked')
  )
);

create index if not exists connections_initiator_anonymous_identity_id_idx
  on public.connections (initiator_anonymous_identity_id);

create index if not exists connections_responder_anonymous_identity_id_idx
  on public.connections (responder_anonymous_identity_id)
  where responder_anonymous_identity_id is not null;

create index if not exists connections_status_reply_idx
  on public.connections (connection_status, reply_eligibility_state)
  where deleted_at is null;

create unique index if not exists connections_active_directed_pair_idx
  on public.connections (initiator_anonymous_identity_id, responder_anonymous_identity_id)
  where responder_anonymous_identity_id is not null
    and connection_status in ('pending', 'active')
    and deleted_at is null;

create index if not exists connection_participants_connection_id_idx
  on public.connection_participants (connection_id);

create index if not exists connection_participants_anonymous_identity_id_idx
  on public.connection_participants (anonymous_identity_id);

create unique index if not exists connection_participants_one_active_identity_per_connection_idx
  on public.connection_participants (connection_id, anonymous_identity_id)
  where deleted_at is null;

create unique index if not exists connection_participants_one_active_role_per_connection_idx
  on public.connection_participants (connection_id, participant_role)
  where deleted_at is null;

comment on table public.connections is
  'Connection primitive for anonymous voice reply continuity. It links anonymous identities only and does not expose or imply real profile visibility.';
comment on column public.connections.initiator_anonymous_identity_id is
  'Anonymous identity that initiated the connection. This is not a real profile reference and must not enable public lookup.';
comment on column public.connections.responder_anonymous_identity_id is
  'Anonymous identity that may respond in the connection. Null means no responder has been bound yet.';
comment on column public.connections.reply_eligibility_state is
  'Server-owned future state for whether a voice reply can continue the connection. It does not imply reveal or profile visibility.';
comment on column public.connections.safety_state is
  'Server-owned safety state for future review and limiting behavior.';

comment on table public.connection_participants is
  'Participant boundary for connection-scoped anonymous identities. Future RLS must be participant-only and must not create a global conversation list.';
comment on column public.connection_participants.anonymous_identity_id is
  'Participant anonymous identity reference. It must not expose owner_user_id or private profile data.';
comment on column public.connection_participants.reply_state is
  'Participant-scoped reply state for future voice continuity. It does not grant reveal or profile browsing.';

alter table public.connections enable row level security;
alter table public.connection_participants enable row level security;

revoke all privileges on table public.connections from anon, authenticated;
revoke all privileges on table public.connection_participants from anon, authenticated;
revoke all privileges on table public.connections from public;
revoke all privileges on table public.connection_participants from public;

grant select on table public.connections to authenticated;
grant select on table public.connection_participants to authenticated;

revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.is_connection_participant_for_current_user(
  target_connection_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public, auth, pg_temp
as $$
  select
    auth.uid() is not null
    and target_connection_id is not null
    and exists (
      select 1
      from public.connections c
      join public.connection_participants cp
        on cp.connection_id = c.id
      join public.anonymous_identities ai
        on ai.id = cp.anonymous_identity_id
      where c.id = target_connection_id
        and c.deleted_at is null
        and c.connection_status not in ('blocked', 'deleted')
        and c.lifecycle_state not in ('frozen', 'deleted')
        and c.safety_state not in ('frozen', 'blocked')
        and cp.deleted_at is null
        and cp.participant_state = 'active'
        and cp.safety_state not in ('frozen', 'blocked')
        and ai.owner_user_id = auth.uid()
        and ai.status = 'active'
        and ai.deleted_at is null
    );
$$;

comment on schema private is
  'Internal schema for non-product helpers. Objects here must not expose profile or participant row data.';

comment on function private.is_connection_participant_for_current_user(uuid) is
  'Boolean-only internal helper for participant-bound connection SELECT RLS. It avoids recursive policy evaluation on connection_participants and returns no row data.';

revoke all on function private.is_connection_participant_for_current_user(uuid) from public;
revoke all on function private.is_connection_participant_for_current_user(uuid) from anon;
revoke all on function private.is_connection_participant_for_current_user(uuid) from authenticated;

grant execute on function private.is_connection_participant_for_current_user(uuid) to authenticated;

drop policy if exists connections_participant_select_own
  on public.connections;

drop policy if exists connection_participants_participant_select_same_connection
  on public.connection_participants;

create policy connections_participant_select_own
on public.connections
for select
to authenticated
using (
  public.connections.deleted_at is null
  and public.connections.connection_status not in ('blocked', 'deleted')
  and public.connections.lifecycle_state not in ('frozen', 'deleted')
  and public.connections.safety_state not in ('frozen', 'blocked')
  and private.is_connection_participant_for_current_user(public.connections.id)
);

create policy connection_participants_participant_select_same_connection
on public.connection_participants
for select
to authenticated
using (
  public.connection_participants.deleted_at is null
  and private.is_connection_participant_for_current_user(public.connection_participants.connection_id)
);

create unique index if not exists anonymous_identities_id_owner_user_id_idx
  on public.anonymous_identities (id, owner_user_id);

create table if not exists public.content_entries (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  author_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  kind text not null,
  caption_text text null,
  media_asset_ref text null,
  visibility text not null default 'feed',
  lifecycle_status text not null default 'active',
  moderation_status text not null default 'visible',
  feed_published_at timestamptz not null default now(),
  reactions_count integer not null default 0,
  reports_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint content_entries_author_owner_fk foreign key (
    author_anonymous_identity_id,
    owner_user_id
  ) references public.anonymous_identities (id, owner_user_id) on delete restrict,
  constraint content_entries_kind_check check (
    kind in ('voice', 'photo', 'video', 'audio', 'text')
  ),
  constraint content_entries_caption_text_length check (
    caption_text is null or char_length(caption_text) <= 280
  ),
  constraint content_entries_media_asset_ref_length check (
    media_asset_ref is null or char_length(media_asset_ref) <= 160
  ),
  constraint content_entries_visibility_check check (
    visibility in ('feed', 'discoverable', 'private_draft')
  ),
  constraint content_entries_lifecycle_status_check check (
    lifecycle_status in ('active', 'deleted')
  ),
  constraint content_entries_moderation_status_check check (
    moderation_status in ('visible', 'under_review', 'hidden')
  ),
  constraint content_entries_reactions_count_check check (
    reactions_count >= 0
  ),
  constraint content_entries_reports_count_check check (
    reports_count >= 0
  ),
  constraint content_entries_deleted_at_status_check check (
    (lifecycle_status = 'deleted' and deleted_at is not null)
    or (lifecycle_status = 'active' and deleted_at is null)
  )
);

create table if not exists public.content_entry_reactions (
  id uuid primary key default gen_random_uuid(),
  content_entry_id uuid not null references public.content_entries(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  reacting_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  reaction_kind text not null default 'like',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_entry_reactions_reactor_owner_fk foreign key (
    reacting_anonymous_identity_id,
    owner_user_id
  ) references public.anonymous_identities (id, owner_user_id) on delete restrict,
  constraint content_entry_reactions_kind_check check (
    reaction_kind in ('like')
  ),
  constraint content_entry_reactions_entry_reactor_key unique (
    content_entry_id,
    reacting_anonymous_identity_id
  )
);

create table if not exists public.content_entry_reports (
  id uuid primary key default gen_random_uuid(),
  content_entry_id uuid not null references public.content_entries(id) on delete cascade,
  reporter_owner_user_id uuid not null references auth.users(id) on delete cascade,
  reporter_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  reason text not null,
  note_text text null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint content_entry_reports_reporter_owner_fk foreign key (
    reporter_anonymous_identity_id,
    reporter_owner_user_id
  ) references public.anonymous_identities (id, owner_user_id) on delete restrict,
  constraint content_entry_reports_reason_check check (
    reason in ('safety', 'spam', 'harassment', 'other')
  ),
  constraint content_entry_reports_note_text_length check (
    note_text is null or char_length(note_text) <= 500
  ),
  constraint content_entry_reports_status_check check (
    status in ('open', 'reviewed', 'dismissed')
  ),
  constraint content_entry_reports_entry_reporter_key unique (
    content_entry_id,
    reporter_anonymous_identity_id
  )
);

create table if not exists public.anonymous_identity_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_owner_user_id uuid not null references auth.users(id) on delete cascade,
  blocker_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  blocked_anonymous_identity_id uuid not null references public.anonymous_identities(id) on delete restrict,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  constraint anonymous_identity_blocks_blocker_owner_fk foreign key (
    blocker_anonymous_identity_id,
    blocker_owner_user_id
  ) references public.anonymous_identities (id, owner_user_id) on delete restrict,
  constraint anonymous_identity_blocks_status_check check (
    status in ('active', 'deleted')
  ),
  constraint anonymous_identity_blocks_distinct_identities_check check (
    blocker_anonymous_identity_id <> blocked_anonymous_identity_id
  ),
  constraint anonymous_identity_blocks_deleted_at_status_check check (
    (status = 'deleted' and deleted_at is not null)
    or (status = 'active' and deleted_at is null)
  )
);

create index if not exists content_entries_feed_eligibility_idx
  on public.content_entries (
    visibility,
    lifecycle_status,
    moderation_status,
    feed_published_at desc
  )
  where deleted_at is null;

create index if not exists content_entries_owner_user_id_idx
  on public.content_entries (owner_user_id);

create index if not exists content_entries_author_anonymous_identity_id_idx
  on public.content_entries (author_anonymous_identity_id);

create index if not exists content_entries_feed_published_at_idx
  on public.content_entries (feed_published_at desc);

create index if not exists content_entry_reactions_content_entry_id_idx
  on public.content_entry_reactions (content_entry_id);

create index if not exists content_entry_reactions_reacting_anonymous_identity_id_idx
  on public.content_entry_reactions (reacting_anonymous_identity_id);

create index if not exists content_entry_reactions_owner_user_id_idx
  on public.content_entry_reactions (owner_user_id);

create index if not exists content_entry_reports_content_entry_id_idx
  on public.content_entry_reports (content_entry_id);

create index if not exists content_entry_reports_reporter_owner_user_id_idx
  on public.content_entry_reports (reporter_owner_user_id);

create index if not exists content_entry_reports_reporter_anonymous_identity_id_idx
  on public.content_entry_reports (reporter_anonymous_identity_id);

create index if not exists content_entry_reports_status_created_at_idx
  on public.content_entry_reports (status, created_at desc);

create index if not exists anonymous_identity_blocks_blocker_anonymous_identity_id_idx
  on public.anonymous_identity_blocks (blocker_anonymous_identity_id);

create index if not exists anonymous_identity_blocks_blocked_anonymous_identity_id_idx
  on public.anonymous_identity_blocks (blocked_anonymous_identity_id);

create index if not exists anonymous_identity_blocks_active_pair_filter_idx
  on public.anonymous_identity_blocks (
    blocker_anonymous_identity_id,
    blocked_anonymous_identity_id
  )
  where status = 'active' and deleted_at is null;

create unique index if not exists anonymous_identity_blocks_one_active_pair_idx
  on public.anonymous_identity_blocks (
    blocker_anonymous_identity_id,
    blocked_anonymous_identity_id
  )
  where status = 'active' and deleted_at is null;

comment on table public.content_entries is
  'Anonymous content entry foundation for MVP feed and discovery surfaces.';
comment on column public.content_entries.owner_user_id is
  'Internal ownership linkage. API write boundaries must derive this value from authenticated server context.';
comment on column public.content_entries.author_anonymous_identity_id is
  'Anonymous author reference for app-facing content presentation.';
comment on column public.content_entries.media_asset_ref is
  'Future media asset reference. Storage access and signed delivery remain out of scope for this migration.';
comment on column public.content_entries.updated_at is
  'Automatic update trigger is deferred to a later approved migration phase.';

comment on table public.content_entry_reactions is
  'One-reaction-per-entry foundation for anonymous content interactions.';
comment on column public.content_entry_reactions.owner_user_id is
  'Internal ownership linkage. API write boundaries must derive this value from authenticated server context.';
comment on column public.content_entry_reactions.reacting_anonymous_identity_id is
  'Anonymous identity that created the reaction.';

comment on table public.content_entry_reports is
  'Content report foundation for future moderation review.';
comment on column public.content_entry_reports.reporter_owner_user_id is
  'Internal reporter ownership linkage. API write boundaries must derive this value from authenticated server context.';
comment on column public.content_entry_reports.reporter_anonymous_identity_id is
  'Anonymous identity used for duplicate-report control.';

comment on table public.anonymous_identity_blocks is
  'Anonymous identity block foundation for suppressing future content and interaction surfaces.';
comment on column public.anonymous_identity_blocks.blocker_owner_user_id is
  'Internal blocker ownership linkage. API write boundaries must derive this value from authenticated server context.';
comment on column public.anonymous_identity_blocks.blocked_anonymous_identity_id is
  'Anonymous identity target to suppress from future surfaces.';

alter table public.content_entries enable row level security;
alter table public.content_entry_reactions enable row level security;
alter table public.content_entry_reports enable row level security;
alter table public.anonymous_identity_blocks enable row level security;

-- This reconciliation intentionally does not create content table policies or grants.
-- Future API boundaries must derive ownership from authenticated server context.
