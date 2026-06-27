-- Sprint 83C - content entry foundation migration draft.
-- Scope: core anonymous content, reaction, report, and block tables only.
-- This draft is not applied by Sprint 83C.
-- API routes, app integration, storage wiring, moderation tooling, and runtime rollout remain out of scope.

create unique index anonymous_identities_id_owner_user_id_idx
  on public.anonymous_identities (id, owner_user_id);

create table public.content_entries (
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

create table public.content_entry_reactions (
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

create table public.content_entry_reports (
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

create table public.anonymous_identity_blocks (
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

create index content_entries_feed_eligibility_idx
  on public.content_entries (
    visibility,
    lifecycle_status,
    moderation_status,
    feed_published_at desc
  )
  where deleted_at is null;

create index content_entries_owner_user_id_idx
  on public.content_entries (owner_user_id);

create index content_entries_author_anonymous_identity_id_idx
  on public.content_entries (author_anonymous_identity_id);

create index content_entries_feed_published_at_idx
  on public.content_entries (feed_published_at desc);

create index content_entry_reactions_content_entry_id_idx
  on public.content_entry_reactions (content_entry_id);

create index content_entry_reactions_reacting_anonymous_identity_id_idx
  on public.content_entry_reactions (reacting_anonymous_identity_id);

create index content_entry_reactions_owner_user_id_idx
  on public.content_entry_reactions (owner_user_id);

create index content_entry_reports_content_entry_id_idx
  on public.content_entry_reports (content_entry_id);

create index content_entry_reports_reporter_owner_user_id_idx
  on public.content_entry_reports (reporter_owner_user_id);

create index content_entry_reports_reporter_anonymous_identity_id_idx
  on public.content_entry_reports (reporter_anonymous_identity_id);

create index content_entry_reports_status_created_at_idx
  on public.content_entry_reports (status, created_at desc);

create index anonymous_identity_blocks_blocker_anonymous_identity_id_idx
  on public.anonymous_identity_blocks (blocker_anonymous_identity_id);

create index anonymous_identity_blocks_blocked_anonymous_identity_id_idx
  on public.anonymous_identity_blocks (blocked_anonymous_identity_id);

create index anonymous_identity_blocks_active_pair_filter_idx
  on public.anonymous_identity_blocks (
    blocker_anonymous_identity_id,
    blocked_anonymous_identity_id
  )
  where status = 'active' and deleted_at is null;

create unique index anonymous_identity_blocks_one_active_pair_idx
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

-- Sprint 83C intentionally creates no RLS policies and no table grants.
-- Future API boundaries must derive ownership from authenticated server context.
-- Future read DTOs must expose anonymous presentation only and must filter deleted, hidden, reported, or blocked entries.
