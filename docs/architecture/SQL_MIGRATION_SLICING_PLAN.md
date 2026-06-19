# SQL Migration Slicing Plan

## Phase

Phase 19B — Documentation-only SQL Migration Slicing Plan

## Purpose

This document defines how future Supabase SQL migrations should be sliced before any actual `.sql` migration file is created.

The goal is to prevent unsafe, oversized, or incorrectly ordered database implementation.

This phase is documentation-only.

No SQL is written in Phase 19B.

No migration file is created in Phase 19B.

No Supabase implementation is included in Phase 19B.

---

## Current Decision

Phase 19A concluded:

Direct Supabase implementation is **No-Go**.

Implementation slicing is approved.

Therefore, Phase 19B only plans migration order and boundaries.

---

## Core Migration Rule

Migrations must be small, ordered, reviewable, and security-first.

No single migration should try to implement:

- all tables
- all RLS policies
- all storage rules
- all views/RPCs
- all app behavior

Each migration should have one clear purpose.

---

## Future Migration Slice Order

Recommended future order:

1. Enum types
2. Core private profile table
3. Anonymous identity table
4. Conversation table
5. Voice message table
6. Reveal request table
7. Profile visibility grant table
8. Feed item table
9. Indexes
10. RLS enablement
11. RLS policies
12. Safe views/RPCs
13. Storage bucket policies
14. Test SQL / policy verification

---

## Proposed Future Migration Files

This is a naming plan only.

Do not create these files yet.

### 001_create_enum_types.sql

Purpose:

Create stable enum types before dependent tables.

Planned enums:

- anonymous_identity_status
- conversation_status
- voice_message_status
- reveal_request_state
- feed_media_type
- feed_visibility_state

Risk:

Changing enums later can be more difficult than changing text columns.

Decision:

Enum values must be reviewed once more before implementation.

---

### 002_create_profiles_private.sql

Purpose:

Create private real profile table.

Planned table:

- profiles_private

Security role:

Stores real profile data.

Risk:

Most sensitive identity table.

Decision:

Create early, but keep access deny-by-default later.

---

### 003_create_anonymous_identities.sql

Purpose:

Create anonymous identity table.

Planned table:

- anonymous_identities

Security role:

Separates anonymous interaction from real profile.

Risk:

owner_user_id leakage can break anonymity.

Decision:

Do not expose owner linkage to non-owner client access.

---

### 004_create_conversations.sql

Purpose:

Create conversation container between anonymous identities.

Planned table:

- conversations

Security role:

Conversation membership must stay private.

Risk:

Public conversation graph leakage.

Decision:

Participant-only access later.

---

### 005_create_voice_messages.sql

Purpose:

Create voice message metadata table.

Planned table:

- voice_messages

Security role:

Stores metadata only; audio files stay in Storage later.

Risk:

audio_path or sender linkage can leak identity.

Decision:

Keep storage path non-identifying.

---

### 006_create_reveal_requests.sql

Purpose:

Create reveal request event table.

Planned table:

- reveal_requests

Security role:

Records request intent only.

Risk:

Request must not expose private profile.

Decision:

Reveal request state does not grant profile access by itself.

---

### 007_create_profile_visibility_grants.sql

Purpose:

Create approved visibility grant table.

Planned table:

- profile_visibility_grants

Security role:

Controls real profile visibility.

Risk:

Wrong grant policy can expose private profiles.

Decision:

Profile access must depend on active grant.

---

### 008_create_feed_items.sql

Purpose:

Create anonymous feed item table.

Planned table:

- feed_items

Security role:

Stores anonymous media/voice moment metadata.

Risk:

Feed must not expose real profile owner.

Decision:

Public-safe feed access must exclude owner identity.

---

### 009_create_indexes.sql

Purpose:

Add indexes after core tables exist.

Index areas:

- owner lookups
- participant checks
- conversation reads
- reveal request review
- active visibility grants
- feed ordering

Decision:

Do not over-index before query patterns are confirmed.

---

### 010_enable_rls.sql

Purpose:

Enable RLS on all security-relevant tables.

Tables:

- profiles_private
- anonymous_identities
- conversations
- voice_messages
- reveal_requests
- profile_visibility_grants
- feed_items

Decision:

Enable RLS before policies are relied upon.

---

### 011_create_profiles_private_policies.sql

Purpose:

Create owner and approved-viewer profile policies.

Risk:

This is the highest-risk policy area.

Decision:

Review manually before applying.

---

### 012_create_anonymous_identity_policies.sql

Purpose:

Create owner and safe anonymous access policies.

Risk:

Non-owner must not see owner_user_id.

Decision:

Safe views may be preferred for non-owner reads.

---

### 013_create_conversation_and_voice_policies.sql

Purpose:

Create participant-scoped conversation and voice message policies.

Risk:

Non-participants must not read conversation or voice metadata.

Decision:

Participant checks must be based on anonymous identity ownership.

---

### 014_create_reveal_request_policies.sql

Purpose:

Create requester/owner-scoped reveal request policies.

Risk:

Pending request must not expose real profile.

Decision:

Requester sees limited fields only.

---

### 015_create_visibility_grant_policies.sql

Purpose:

Create profile visibility grant policies.

Risk:

Grant table controls real profile access.

Decision:

Only owner and approved viewer can use active grants.

---

### 016_create_feed_item_policies.sql

Purpose:

Create safe feed access policies.

Risk:

Feed must not expose real owner identity.

Decision:

Public-safe access should be limited and reviewed.

---

### 017_create_safe_views_or_rpcs.sql

Purpose:

Create safe access views/RPCs if needed.

Candidate areas:

- safe Discover payload
- safe Feed payload
- approved profile payload
- conversation participant messages
- reveal request safe state

Decision:

Do not create views/RPCs until RLS strategy is finalized.

---

### 018_storage_policy_plan.sql

Purpose:

Future storage policy implementation.

Important:

This may be split into separate storage-specific migrations later.

Storage areas:

- voice-messages
- feed-media
- profile-avatars

Decision:

Do not implement storage until table RLS is tested.

---

## Dependency Order

### profiles_private

Depends on:

- auth.users

Used by:

- profile_visibility_grants
- approved profile access

---

### anonymous_identities

Depends on:

- auth.users

Used by:

- conversations
- voice_messages
- reveal_requests
- feed_items

---

### conversations

Depends on:

- anonymous_identities

Used by:

- voice_messages
- reveal_requests
- profile_visibility_grants

---

### voice_messages

Depends on:

- conversations
- anonymous_identities

---

### reveal_requests

Depends on:

- conversations
- anonymous_identities
- auth.users

Used by:

- profile_visibility_grants

---

### profile_visibility_grants

Depends on:

- auth.users
- conversations
- reveal_requests

Used by:

- approved profile access

---

### feed_items

Depends on:

- anonymous_identities

---

## RLS Implementation Order

Recommended order:

1. Enable RLS on all tables
2. Add owner-only policies first
3. Add participant policies
4. Add reveal request policies
5. Add visibility grant policies
6. Add public-safe policies only after review
7. Add safe views/RPCs after base policies
8. Run policy tests before UI integration

---

## Rollback Notes

Every future migration should answer:

- Can this be safely rolled back?
- Does rollback break dependent tables?
- Does rollback remove policies before tables?
- Does rollback expose data temporarily?
- Does rollback preserve privacy?

Guideline:

Security migrations should be reviewed carefully before rollback commands are trusted.

---

## Test Strategy Before Real Implementation

Before connecting UI, future SQL/RLS tests should verify:

- owner can read own profile
- non-owner cannot read profile
- pending requester cannot read profile
- approved viewer can read profile
- revoked viewer cannot read profile
- non-owner cannot see anonymous owner_user_id
- participant can read conversation
- non-participant cannot read conversation
- participant can read voice metadata
- non-participant cannot read voice metadata
- requester can create reveal request only in valid context
- owner can review only own reveal requests
- feed public-safe payload does not expose real identity

---

## Hard No-Go Items

Do not create actual migrations until:

- enum values are final enough
- exact columns are reviewed
- foreign key behavior is reviewed
- RLS predicates are drafted
- policy tests are planned
- Supabase folder strategy is confirmed

---

## Not Implemented In This Phase

This phase does not create:

- SQL files
- migration files
- Supabase implementation
- Supabase client
- Auth code
- RLS policies
- Storage buckets
- Storage policies
- `.env`
- package installs
- backend/API
- route UI changes
- mock data
- recorder/audio behavior
- reveal behavior
- upload behavior

---

## Acceptance Criteria For Phase 19B

Phase 19B is complete when:

- This document exists.
- No SQL is written.
- No migration file is created.
- No Supabase files are changed.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- Migration slicing order is documented.
- RLS policy slicing order is documented.
- Rollback and test strategy notes are documented.
- No real behavior is introduced.

---

## Current Decision

Do not create SQL migrations yet.

Next recommended phase:

Phase 19C — Supabase Folder / Migration Structure Plan

## Phase 20A Review Note

Phase 20A reviewed this SQL migration slicing plan against `docs/architecture/SUPABASE_FOLDER_MIGRATION_STRUCTURE_PLAN.md`.

Review result:

- The migration slicing order is still safe from a planning perspective.
- The order remains small, dependency-aware, and security-first.
- SQL implementation should not start yet.
- Supabase implementation remains NO-GO unless all readiness gates are explicitly passed.
- The Phase 19C future folder and migration structure aligns with this slicing plan.
- Future implementation still needs a separate explicit approval before any SQL, migration, Supabase client, Auth, RLS, Storage, package, `.env`, backend/API, route, or apps/web changes.

## Phase 20B Go/No-Go Review Note

Phase 20B confirms this migration slicing plan remains planning-ready but not implementation-approved.

Confirmed:

- SQL and migration implementation should not start yet.
- The migration slicing order can support a future implementation only after the Supabase readiness checklist changes from NO-GO to explicit GO.
- Missing readiness gates still block implementation: finalized schema, verified RLS policy procedure, Auth flow boundary, Storage privacy boundary, rollback/check strategy, environment variable strategy, client integration approval, and testing/audit procedure.

## Phase 20D Schema Readiness Review Note

Phase 20D confirms SQL migration slicing remains blocked by finalized schema readiness.

Confirmed:

- Migration order remains useful as a planning sequence.
- No SQL or migration files should be created yet.
- The schema gate is NOT READY because nullable rules, enum finalization, duplicate prevention constraints, feed visibility behavior, storage path semantics, lifecycle policies, indexes, and constraints are not fully finalized.

## Phase 20E RLS SQL Blocker Note

Phase 20E confirms RLS policy verification readiness is NOT READY.

RLS-related migration slices must remain blocked until finalized schema readiness passes, RLS allow/deny verification cases are complete, safe view/RPC boundaries are finalized, and storage/media metadata privacy rules are reviewed.

No RLS SQL, policy files, `.sql` files, or migrations should be created from the current planning state.

## Phase 20F Storage Migration Blocker Note

Phase 20F confirms Storage privacy boundary readiness is NOT READY.

Storage-related migration slices, metadata columns, bucket references, RLS policy slices, Storage policy slices, and signed URL support must remain blocked until bucket strategy, path privacy rules, media metadata relationships, access rules, deletion/revocation behavior, and audit/test expectations are finalized.

## Phase 20G Auth Migration Blocker Note

Phase 20G confirms Auth flow boundary readiness is NOT READY.

Auth-related schema slices, ownership columns, triggers/RPC assumptions, profile initialization behavior, anonymous identity initialization behavior, reveal ownership rules, visibility grant ownership rules, and media ownership rules must remain blocked from SQL or migration implementation until the Auth gate passes.

## Phase 20H Migration Rollback / Check Strategy Note

Phase 20H created `docs/architecture/MIGRATION_ROLLBACK_CHECK_STRATEGY_PLAN.md`.

Migration rollback/check strategy status:

```txt
PLANNED
```

Real SQL/migration execution status:

```txt
BLOCKED / NO-GO
```

Confirmed:

- Future migrations must remain small, ordered, reviewable, and security-first.
- Future migration work must include pre-migration checks, post-migration checks, rollback notes, failed migration handling, dry-run expectations, destructive-change review, and backup/checkpoint expectations.
- Schema readiness remains NOT READY.
- RLS verification readiness remains NOT READY.
- Storage privacy readiness remains NOT READY.
- Auth flow boundary readiness remains NOT READY.

No SQL files, migration files, rollback scripts, Supabase implementation, or `supabase/` folder changes are authorized by this note.

## Phase 20I Environment Migration Boundary Note

Phase 20I confirms environment variable strategy is PLANNED while SQL/migration implementation remains NO-GO.

Future migrations must not depend on committed secrets, mobile service role keys, or unreviewed environment values. Production migration workflows must not begin until environment separation, backup/checkpoint expectations, and secret handling rules are reviewed with implementation approval.

## Phase 20J Client Migration Boundary Note

Phase 20J confirms client integration boundary is REVIEWED / PLANNED while SQL/migration implementation remains NO-GO.

Future migrations must not be connected to mobile client behavior until schema, RLS, Auth, Storage, environment, rollback/check strategy, package alignment, and testing/audit gates are approved. Client integration must wait for post-migration validation and leak checks.

## Phase 20K Migration Testing Boundary Note

Phase 20K confirms testing / audit procedure is PLANNED while SQL/migration implementation remains NO-GO.

Future migrations must have dry-run expectations, pre-migration backup/checkpoint expectations, post-migration table/index/constraint verification, rollback documentation, destructive-change review, failed migration handling, and privacy posture checks before implementation.

## Phase 20L Final Migration Go/No-Go Note

Phase 20L confirms SQL/migration implementation remains NO-GO.

Final Supabase implementation decision:

```txt
NO-GO
```

SQL/migrations must not begin until package alignment is resolved or explicitly accepted, schema is implementation-final, RLS tests are execution-ready, Auth/Storage/environment/client gates are approved, and testing/audit procedure is actionable.

## Phase 24E SQL Planning Readiness Note

Phase 24E result:

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
```

Scope of that readiness:

- planning only for `profiles_private` and `anonymous_identities`.
- no executable SQL.
- no migration files.
- no RLS policies.
- no Supabase client/Auth/Storage/backend implementation.

The next narrow SQL planning slice may draft the planned migration boundaries for:

1. enum/value decisions needed by `profiles_private` and `anonymous_identities`.
2. `profiles_private` table planning with `id`, unique `owner_user_id`, owner-only fields, and private defaults.
3. `anonymous_identities` table planning with one active identity per auth user as V1 default.
4. rollback/check notes and deny-test prerequisites.

Actual SQL implementation remains blocked until the next planning slice is explicitly approved and RLS/test gates are ready.

## Phase 24F RLS Matrix Impact On SQL Planning

Phase 24F allows only the next narrow SQL planning slice for `profiles_private` and `anonymous_identities`.

Planning may next define:

- exact enum/value names needed by the two tables.
- migration ordering for the two table plans.
- RLS policy names and allow/deny cases as non-executable planning.
- safe DTO/view/RPC contract names as planning placeholders.
- rollback and manual verification steps as planning notes.

Phase 24F does not authorize:

- executable SQL.
- migration files.
- RLS policy implementation.
- Supabase client/runtime binding.
- Auth/session implementation.
- Storage/media implementation.
- backend/API work.
- package/lockfile edits.
- route data binding.

Readiness:

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
NOT READY FOR EXECUTABLE SQL/RLS IMPLEMENTATION
```

## Phase 24G Auth Boundary Impact On SQL Planning

Phase 24G allows only the next narrow SQL/Auth planning slice.

Planning may next define:

- exact SQL order for `profiles_private` and `anonymous_identities` provisioning support.
- uniqueness/idempotency constraints as planning notes.
- owner derivation strategy using authenticated session.
- future trigger/RPC/server-safe provisioning options as planning only.
- rollback and manual verification steps as planning notes.

Phase 24G does not authorize executable SQL, migration files, RLS policies, Auth/session runtime, Supabase client runtime, Storage/media implementation, backend/API work, package/lockfile edits, or route data binding.

Readiness:

```txt
READY FOR NEXT NARROW SQL/AUTH PLANNING SLICE
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
```

## Phase 24H First Narrow SQL Migration Planning

Phase 24H is documentation/planning-only. It does not create executable SQL, migration files, RLS policies, Supabase runtime code, Auth/session handling, Storage policies, backend/API logic, package changes, Docker files, payment code, route data binding, or runtime product behavior.

### Phase 24H Track A Decision

```txt
READY FOR NEXT SQL SCRIPT DRAFTING SLICE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
```

The next SQL script drafting slice may draft SQL for review only. It must not apply migrations unless a later phase explicitly authorizes executable migration work.

### First Future SQL Migration Order

The first executable migration slice, when later approved, must start with:

1. `profiles_private`
2. `anonymous_identities`

Deferred from the first executable slice:

- conversations / connection primitives
- `voice_messages`
- `reveal_requests`
- `profile_visibility_grants`
- Storage/media tables or buckets
- reports
- notifications
- payments
- subscriptions

### profiles_private First-Slice Planning

Preserve Phase 24E V1 planning fields:

- `id`
- `owner_user_id`
- `chosen_display_name`
- `approved_profile_photo_asset_id`
- `short_bio`
- `age_band`
- `profile_visibility_default`
- `profile_status`
- `safety_state`
- `verification_summary_state`
- `created_at`
- `updated_at`
- `deleted_at`

Forbidden V1 fields:

- `email`
- `phone`
- `legal_name`
- `exact_date_of_birth`
- `precise_location`
- `public_username`
- `searchable_handle`
- `global_profile_slug`
- client-visible anonymous bridge
- `raw_verification_document`
- `device_id`
- `ip_address`

Future constraints to consider:

- one `profiles_private` per Auth user.
- unique internal `owner_user_id`.
- soft-delete via `deleted_at`.
- no public searchable handle or slug.
- owner-derived insert/update only; client-provided owner ids must not be trusted.

Future indexes to consider:

- unique active lookup on `owner_user_id`.
- `deleted_at` check support if needed.
- `profile_status` / `deleted_at` checks only if needed by future owner-safe operations.

### anonymous_identities First-Slice Planning

Preserve Phase 24E V1 planning fields:

- `id`
- `owner_user_id`
- `anonymous_label`
- `anonymous_visual_seed`
- `voice_presence_label`
- `status`
- `safety_state`
- `rotation_state`
- `rotated_at`
- `created_at`
- `updated_at`
- `deleted_at`

Forbidden client-visible fields:

- `owner_user_id`
- `auth_user_id`
- `profile_private_id`
- email
- phone
- real name
- private profile photo
- verification internals
- moderation internals
- device/IP/security metadata

Future constraints to consider:

- one active anonymous identity per Auth user for V1.
- rotation/history remains internal and future/deferred.
- soft-delete via `deleted_at`.
- anonymous identity must not become a real-profile lookup key.
- client preview must not expose owner/auth/private-profile linkage.

Future indexes to consider:

- active anonymous identity lookup by `owner_user_id`.
- status/deleted checks if needed.
- uniqueness for active identity semantics, with exact partial-index strategy to be decided in SQL script drafting.

### Phase 24H Future Rollback Requirements

Before executable SQL is allowed, the script draft must document:

- rollback order for `anonymous_identities` and `profiles_private`.
- whether rollback is destructive or only safe before data exists.
- how unique constraints/indexes are removed if rollback is approved.
- how partially failed migration state is detected.
- whether any rollback could weaken privacy or reveal stale linkage.
- explicit note that no production migration is allowed without backup/checkpoint approval.

### Phase 24H Future Dry-Run Requirements

Before executable SQL is allowed, the team must define:

- local or staging Supabase target decision.
- dry-run command/process.
- pre-migration schema snapshot/check.
- post-migration table/constraint/index verification.
- rollback dry-run expectation if the environment supports it.
- privacy posture check after dry-run.
- confirmation that no client runtime is bound to the new tables during dry-run.

### Phase 24H Future Verification Checklist

Before SQL execution, verify:

1. exact SQL reviewed.
2. rollback approved.
3. RLS policy order approved.
4. DTO/view/RPC contracts reviewed.
5. service role plan reviewed.
6. local or staging Supabase environment decision made.
7. no client runtime binding until approved.
8. no public profile/search/global reveal path is introduced.
9. no Storage/media/payment/subscription scope is included.
10. deny tests from Phase 24F and Auth boundary tests from Phase 24G are mapped to the script plan.

### Phase 24H SQL Readiness

```txt
READY FOR NEXT SQL SCRIPT DRAFTING SLICE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
```

## Phase 24I Draft SQL Script Specification For profiles_private And anonymous_identities

Phase 24I is documentation/planning-only. It prepares a reviewable SQL script specification inside Markdown only.

This section is not executable SQL and must not be copied into a migration without a later GO/NO-GO review.

```txt
NON-EXECUTABLE DRAFT - DO NOT RUN
```

### Phase 24I Purpose

- Prepare the first SQL script specification.
- Keep the draft reviewable before any database artifact exists.
- Create no executable SQL file.
- Create no migration file.
- Create no file under `supabase/migrations`.
- Implement no RLS policy, Auth/session behavior, Storage, backend/API, Supabase runtime binding, or app behavior.

### Phase 24I First Slice Scope

The first future SQL script specification covers only:

1. `profiles_private`
2. `anonymous_identities`

Explicitly deferred:

- conversations / connection primitives
- `voice_messages`
- `reveal_requests`
- `profile_visibility_grants`
- blocks
- reports
- notifications
- Storage/media
- payments/subscriptions
- Docker implementation
- app runtime binding

### Phase 24I Planned Future Script Order

Future script order, still non-executable:

1. prerequisite extension/type assumptions if needed.
2. `profiles_private` table specification.
3. `profiles_private` constraints/indexes specification.
4. `anonymous_identities` table specification.
5. `anonymous_identities` constraints/indexes specification.
6. no RLS policies in this first draft; RLS remains future/deferred.
7. verification queries/checks.
8. rollback plan.

### Phase 24I Non-Executable Draft Shape

```sql
-- NON-EXECUTABLE DRAFT - DO NOT RUN
-- Purpose: review shape only; not a migration.
-- Scope: profiles_private, then anonymous_identities.
-- Deferred: RLS policies, DTO/view/RPC creation, Auth runtime, Storage, app binding.

-- 1. Review prerequisite assumptions.
-- 2. Specify profiles_private table fields.
-- 3. Specify profiles_private ownership constraints and indexes.
-- 4. Specify anonymous_identities table fields.
-- 5. Specify anonymous_identities ownership constraints and indexes.
-- 6. Specify verification checks.
-- 7. Specify rollback notes.
```

### profiles_private Table Specification

Planned fields from Phase 24E:

| Field | Recommended type direction | Notes |
| --- | --- | --- |
| `id` | uuid primary key candidate | Internal private profile row id; not a public profile id. |
| `owner_user_id` | uuid reference to `auth.users(id)` candidate | Internal ownership link. Future app flow must not let client choose this value. |
| `chosen_display_name` | text | Nullable or required based on final onboarding decision. Not public unless reveal context allows safe DTO. |
| `approved_profile_photo_asset_id` | uuid/text nullable placeholder | No Storage implementation yet; raw asset reference is not non-owner visible. |
| `short_bio` | text nullable | Length limit to be finalized later. Reveal-context DTO only after owner approval. |
| `age_band` | text or constrained value | Not exact date of birth. |
| `profile_visibility_default` | constrained value | Owner-only control. Does not create global visibility. |
| `profile_status` | constrained value | Candidate values: active/incomplete/suspended/deleted; final enum/check deferred. |
| `safety_state` | constrained value or server-only state | Server-only safety/moderation posture. |
| `verification_summary_state` | constrained value | No raw documents. Safe summary only if later approved. |
| `created_at` | timestamptz | Creation timestamp. |
| `updated_at` | timestamptz | Update timestamp. |
| `deleted_at` | timestamptz nullable | Soft delete marker. |

Planned constraints:

- one `profiles_private` per Auth user.
- unique `owner_user_id` for non-deleted active profile; final exact partial-index strategy to be reviewed.
- no public username, searchable handle, or global slug.
- soft delete preferred over hard delete.
- `owner_user_id` cannot be client-chosen in future app flow.
- future insert ownership must be derived from Auth session.

Prohibited `profiles_private` fields:

- `email`
- `phone`
- `legal_name`
- `exact_date_of_birth`
- `precise_location`
- `public_username`
- `searchable_handle`
- `global_profile_slug`
- client-visible anonymous bridge
- `anonymous_identity_id` as public/client-visible linkage
- `raw_verification_document`
- `device_id`
- `ip_address`
- service role or backend-only secrets
- any field that enables anonymous identity to real profile correlation outside approved context

### anonymous_identities Table Specification

Planned fields from Phase 24E:

| Field | Recommended type direction | Notes |
| --- | --- | --- |
| `id` | uuid primary key candidate | Opaque anonymous identity row id; must not enable real-profile lookup. |
| `owner_user_id` | uuid reference to `auth.users(id)` candidate | Internal ownership link only. Non-owner previews must never expose it. |
| `anonymous_label` | text | Safe anonymous display label. |
| `anonymous_visual_seed` | text | Safe non-identifying visual seed. |
| `voice_presence_label` | text | Safe anonymous voice presence label. |
| `status` | constrained value | Candidate values: active/inactive/suspended/deleted. |
| `safety_state` | constrained value or server-only state | Server-only safety/moderation posture. |
| `rotation_state` | constrained value | V1 uses one active anonymous identity per Auth user unless rotation is separately approved. |
| `rotated_at` | timestamptz nullable | Rotation timestamp if future rotation is approved. |
| `created_at` | timestamptz | Creation timestamp. |
| `updated_at` | timestamptz | Update timestamp. |
| `deleted_at` | timestamptz nullable | Soft delete marker. |

Planned constraints:

- V1 default: one active anonymous identity per Auth user.
- `owner_user_id` linkage is internal only.
- non-owner preview must never expose `owner_user_id`.
- no `profile_private_id` client-visible linkage.
- no real profile fields.
- no searchable real identity fields.
- no device/IP/security metadata in client-preview surfaces.

Safe preview fields for `AnonymousSafePreviewDTO`:

- `anonymous_label`
- `anonymous_visual_seed`
- `voice_presence_label`
- `connection_state` or context-safe state

`AnonymousSafePreviewDTO` must not include:

- `owner_user_id`
- `auth_user_id`
- `profile_private_id`
- email
- phone
- real name
- private profile photo
- verification internals
- moderation internals
- device/IP/security metadata
- any anonymous-to-real correlation key

### Phase 24I Future Constraint / Index Specification

`profiles_private` planned constraints/indexes for review:

- primary key on `id`.
- unique ownership constraint for `owner_user_id`.
- optional partial unique index for active/non-deleted profile if soft-delete semantics require it.
- index on `owner_user_id` for owner lookups.
- optional status/deleted_at index only if needed later.
- no index for public search, public username, profile browsing, or global slug because those fields do not exist.

`anonymous_identities` planned constraints/indexes for review:

- primary key on `id`.
- index on `owner_user_id` for owner lookup.
- unique active anonymous identity per owner for V1; exact partial-index approach to be reviewed.
- optional status/deleted_at index if needed later.
- no index enabling public real-profile lookup.
- no index exposing anonymous-to-real correlation.

### Phase 24I Future RLS / DTO Boundary Notes

Phase 24I does not implement RLS. Future SQL/RLS work must preserve Phase 24F.

`profiles_private`:

- non-owner raw select: `DENY`.
- owner: `OWNER_ONLY`.
- `connected_with_reveal`: raw `DENY`, `RevealProfileDTO` `DTO_ONLY`.
- blocked/deleted/suspended: `DENY`.
- service role: `SERVER_ONLY`.

`anonymous_identities`:

- non-owner raw select: `DENY`.
- owner: `OWNER_ONLY`.
- anonymous preview: `DTO_ONLY`.
- blocked/deleted/suspended: `DENY`.
- service role: `SERVER_ONLY`.

Required DTOs before runtime binding:

- `OwnerProfileDTO`
- `RevealProfileDTO`
- `OwnerAnonymousIdentityDTO`
- `AnonymousSafePreviewDTO`

Raw table reads must not become product API for non-owner flows.

### Phase 24I Future Auth / Provisioning Notes

Phase 24I does not implement Auth. Future migration and provisioning work must align with Phase 24G:

- Auth session derives owner internally.
- Client must not choose `owner_user_id`.
- provisioning must be idempotent.
- repeated startup must not create duplicate `profiles_private` rows.
- repeated startup must not create duplicate active `anonymous_identities` rows.
- Auth does not make profile public.
- Auth does not allow profile search, user search, public browsing, or global reveal.
- logout/account switch/cache rules remain a future implementation blocker.

### Phase 24I Verification / Dry-Run / Rollback Specification

Future verification checklist:

1. Confirm no migration files created before GO.
2. Confirm no forbidden fields included.
3. Confirm `profiles_private` owner uniqueness strategy reviewed.
4. Confirm `anonymous_identities` one-active-per-owner strategy reviewed.
5. Confirm soft-delete behavior reviewed.
6. Confirm no public profile/search/slug fields exist.
7. Confirm no client-visible anonymous-to-real linkage exists.
8. Confirm RLS policies are not assumed by table creation alone.
9. Confirm DTO/view/RPC contracts are reviewed before runtime binding.
10. Confirm rollback steps are written before migration execution.
11. Confirm dry-run/staging execution path is chosen before production.
12. Confirm service role key remains backend-only and out of client docs/env examples.
13. Confirm Storage/media remains out of scope.
14. Confirm payment/subscription tables remain out of scope.
15. Confirm executable SQL/migration is still blocked until separate GO.

Rollback planning:

- rollback must be explicit before execution.
- rollback should cover table creation, constraints, indexes, and any future enum/type objects.
- rollback must not destroy production user data without separate approval.
- early local/staging rollback can be destructive only if explicitly marked non-production.

### Phase 24I Readiness Decisions

```txt
READY FOR SQL SCRIPT GO/NO-GO REVIEW
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24J SQL Migration Preflight / Rollback Checklist

Phase 24J is documentation/planning-only. It does not create executable SQL, migration files, Supabase migration files, RLS policies, Supabase runtime code, Auth/session handling, Storage policies, backend/API logic, package changes, Docker files, payment code, route data binding, or runtime product behavior.

### Phase 24J Decisions

```txt
READY FOR PHASE 24K GO/NO-GO REVIEW
NOT READY TO CREATE ACTUAL MIGRATION FILE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

### Phase 24J Pre-Migration Source Checks

Before creating any actual migration file, verify:

1. Target slice is only `profiles_private` and `anonymous_identities`.
2. No conversations, `voice_messages`, `reveal_requests`, `profile_visibility_grants`, Storage/media, reports, notifications, payments, or subscriptions are included.
3. No app code will be changed.
4. No runtime Supabase binding will be added.
5. No RLS policy implementation is included unless separately approved.
6. No Auth/session implementation is included.
7. No Storage/media implementation is included.
8. No backend/API implementation is included.
9. No package/lockfile changes are included.

### Phase 24J File-System Checks Before Migration Creation

Before Phase 24K can approve migration creation, verify:

- no migration file exists yet for this slice.
- `supabase/migrations` must not be created or changed before GO.
- current `supabase/` placeholder state is understood before any change.
- no `.env` or `.env.local` changes exist.
- no service role key is added anywhere.
- no package or lockfile changes exist.
- no Dockerfile, docker-compose file, payment SDK, or subscription SDK exists for this phase.

### Phase 24J SQL Script Review Checks

Before any migration file can be created, verify:

- all fields match the Phase 24I specification.
- all prohibited fields are absent.
- no public username/search handle/global slug exists.
- no client-visible anonymous-to-real profile bridge exists.
- `owner_user_id` is internal ownership linkage only.
- soft-delete model is explicit.
- timestamps are explicit.
- status/safety fields are constrained or marked for final review.
- no raw verification documents exist.
- no device/IP metadata exists.
- no email, phone, legal name, exact date of birth, or precise location exists.

### Phase 24J Constraint / Index Review Checks

Before any migration file can be created, verify:

- `profiles_private` primary key is reviewed.
- `profiles_private.owner_user_id` uniqueness strategy is reviewed.
- `anonymous_identities` primary key is reviewed.
- one active anonymous identity per owner is reviewed.
- soft-delete partial-index strategy is reviewed if used.
- no public search/profile browsing indexes exist.
- no index enables anonymous-to-real public correlation.

### Phase 24J Dependency Checks

Before any migration file can be created, verify:

- Auth/session boundary is documented.
- RLS matrix is documented.
- DTO contracts are documented.
- service-role plan remains backend-only and not implemented.
- Storage/media remains out of scope.
- payment/subscription remains out of scope.
- app runtime binding remains out of scope.

### Phase 24J Dry-Run / Staging Plan

Before any production execution:

1. First executable migration must be tested outside production first.
2. If local Supabase is used later, its setup must be separately approved.
3. If staging Supabase is used later, project separation and secret handling must be documented.
4. Dry-run must verify tables are created correctly.
5. Dry-run must verify constraints exist.
6. Dry-run must verify indexes exist.
7. Dry-run must verify prohibited fields are absent.
8. Dry-run must verify duplicate owner profile insertion is blocked.
9. Dry-run must verify duplicate active anonymous identity insertion is blocked.
10. Dry-run must verify soft-delete behavior is understood.
11. Dry-run must verify rollback works in non-production.
12. Dry-run must not rely on app runtime.
13. Dry-run must not require real user data.
14. Dry-run must not include Storage/media/payment tables.
15. Dry-run must not introduce service role key into client files.

### Phase 24J Rollback Plan Requirements

Rollback must be written, reviewed, and tested before production execution.

Rollback plan must cover:

1. Tables: `profiles_private`, `anonymous_identities`.
2. Constraints: primary keys, owner uniqueness, active anonymous identity uniqueness.
3. Indexes: owner lookup indexes and partial indexes if used.
4. Types/enums/check constraints if used later.
5. Non-production rollback may be destructive only if explicitly marked non-production.
6. Production rollback must not destroy user data without separate approval.
7. Production rollback should prefer safe disable/stop-forward approach if user data exists.
8. Rollback must be written before execution.
9. Rollback must be reviewed before execution.
10. Rollback must be tested before production.

### Phase 24J Forbidden Field Audit

`profiles_private` must not include:

- `email`
- `phone`
- `legal_name`
- `exact_date_of_birth`
- `precise_location`
- `public_username`
- `searchable_handle`
- `global_profile_slug`
- `anonymous_identity_id` as public/client-visible linkage
- `raw_verification_document`
- `device_id`
- `ip_address`
- service role key
- backend secrets
- any field that enables anonymous identity to real profile correlation outside approved context

`anonymous_identities` must not expose:

- `auth_user_id` to non-owner
- `owner_user_id` to non-owner preview
- `profile_private_id`
- email
- phone
- real name
- private profile photo
- verification internals
- moderation internals
- device/IP/security metadata
- anonymous-to-real correlation key

### Phase 24J GO / NO-GO Gate For Phase 24K

GO to Phase 24K only if:

- first slice scope is locked to `profiles_private` and `anonymous_identities`.
- prohibited-fields checklist is complete.
- constraint/index review checklist is complete.
- rollback checklist is complete.
- dry-run/staging checklist is complete.
- Auth/RLS/DTO prerequisites are documented.
- executable SQL remains blocked until Phase 24K explicitly approves migration creation.
- no app code, package, lockfile, Supabase runtime, Auth, RLS, Storage, backend/API, Docker, payment, or APK workspace changes were made.

NO-GO if:

- any forbidden field remains unclear.
- rollback is not explicit.
- dry-run path is unclear.
- service-role handling is unclear.
- migration scope includes deferred tables.
- there is pressure to combine Storage/media/payment/backend/Auth with the first migration.

## Phase 24K First Migration GO / NO-GO Review

Phase 24K is documentation/review-only. It does not create executable SQL, migration files, Supabase migration files, RLS policies, Supabase runtime code, Auth/session handling, Storage policies, backend/API logic, package changes, Docker files, payment code, route data binding, APK build, or runtime product behavior.

### Phase 24K Review Answers

1. First migration scope remains limited to `profiles_private` and `anonymous_identities`.
2. Forbidden fields are excluded by the Phase 24I specification and Phase 24J forbidden-field audit.
3. Rollback and dry-run/staging requirements are documented and remain mandatory before execution.
4. RLS/Auth/DTO dependencies are documented as blockers for runtime use.
5. It is safe to allow the next explicitly scoped phase to create the first narrow migration file.
6. It is not safe to apply executable SQL now.
7. It is not safe to implement Auth/Supabase runtime now.
8. It is not safe to implement executable RLS policies now.

### Phase 24K Decisions

```txt
READY TO CREATE FIRST NARROW MIGRATION FILE IN NEXT PHASE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

### Phase 24K Scope Lock

The next migration-file phase must remain limited to:

1. `profiles_private`
2. `anonymous_identities`

Still deferred:

- conversations / connections
- `voice_messages`
- `reveal_requests`
- `profile_visibility_grants`
- blocks, reports, notifications
- Storage/media
- payments/subscriptions
- Docker implementation
- backend/API runtime
- app route binding

### Phase 24K Execution Boundary

Creating the first migration file in the next phase is not the same as applying it.

Before executable SQL can run later, the project still needs:

- concrete migration file review.
- forbidden-field scan against the real file.
- rollback section review.
- non-production dry-run plan approval.
- Auth/session ownership validation.
- RLS policy implementation plan and tests.
- safe DTO/view/RPC contracts.
- no-secret and no-service-role-client audit.

No app runtime may read from or bind to the new tables until later Auth/RLS/DTO gates pass.

## Phase 24L First Narrow Migration File Created

Created migration file:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Scope:

- creates `public.profiles_private`.
- creates `public.anonymous_identities`.
- adds only direct constraints, direct indexes, table/column comments, rollback notes, and deny-by-default RLS enablement without policies.

Execution boundary:

```txt
Migration file creation: CREATED
Executable SQL/migration application: NOT READY / NOT APPLIED
Auth/Supabase runtime: NOT READY
RLS policy implementation: NOT READY
Storage/media: NOT READY
Payment/subscription: NOT READY
```

The file must be reviewed before any later application. No app runtime may bind to these tables until later Auth/RLS/DTO gates pass.

## Phase 24M First Migration Static Audit Result

Audited migration file:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Static audit result:

```txt
Migration static audit: PASS
Ready for later local/staging migration apply phase: READY FOR LOCAL/STAGING APPLY PLANNING OR REVIEW
Ready for production migration apply: NOT READY FOR PRODUCTION MIGRATION APPLY
Ready for app runtime/Auth/Supabase implementation: NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
Ready for RLS policy implementation: NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
Ready for Storage/media implementation: NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

Audit summary:

- file exists at the expected path.
- SQL creates only `public.profiles_private` and `public.anonymous_identities`.
- no deferred table creation exists.
- forbidden private profile and anonymous identity fields are absent.
- constraints and indexes match Phase 24E-24L direction.
- `pgcrypto` / `gen_random_uuid()` is Supabase/Postgres-compatible.
- RLS policies are not created.
- RLS enablement is deny-by-default only; runtime access remains blocked.
- rollback notes are present as comments.

Execution remains blocked until a later phase explicitly approves local/staging target, command, rollback, dry-run, post-apply checks, and no-secret audit. Production apply remains blocked.

## Phase 24N Local/Staging Migration Apply Planning + Environment GO / NO-GO

Planning target migration:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Phase 24N is documentation/planning-only. It does not apply SQL, run Supabase commands, connect to production Supabase, modify the migration file, implement runtime Auth/Supabase, create RLS policies, create Storage policies, add backend/API logic, change app code, edit package/lockfile files, create Docker/payment files, build APK, or touch `C:\ankion-apk`.

### Environment Choice Plan

Safest environment order:

1. Local Supabase apply planning/review.
2. Local apply in a later phase only if Supabase CLI/local stack is confirmed and separately approved.
3. Staging apply only after local path is understood, or after local is explicitly skipped with a documented reason.
4. Production apply remains blocked.

Rules:

- local is preferred for first apply if tooling is available.
- staging must be a separate non-production Supabase project.
- production must not be used for first apply.
- no real user data should be used.
- no app runtime should point at the test database yet.

### Supabase CLI / Tooling Checklist For Later Apply

Before any later apply phase, verify:

1. Supabase CLI is installed and version is recorded.
2. current working directory is `C:\ankion`.
3. target project/environment is local or staging, not production.
4. migration file path exists: `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`.
5. no additional migration files are accidentally included.
6. app runtime env does not point to the test database.
7. no service role key is placed in client files or docs.
8. required local Supabase setup is separately approved before use.
9. `pgcrypto` / `gen_random_uuid()` availability is confirmed in target environment.
10. `auth.users` exists in target environment before applying FK to `auth.users(id)`.

### FUTURE COMMANDS - DO NOT RUN IN PHASE 24N

Possible local-only future commands:

```txt
supabase --version
supabase status
supabase start
supabase migration list
supabase db reset
```

Possible staging future commands:

```txt
supabase link
supabase migration up
supabase db push
```

Command rules:

- do not document production project refs, tokens, passwords, or secrets.
- do not run any Supabase command in Phase 24N.
- do not use production for first apply.
- exact target and command must be approved in the later apply phase.

### Secret / Env Safety Plan

- service role key remains backend-only.
- service role key must never appear in app code, web code, Expo public env, `.env.example`, screenshots, logs, or client-facing docs.
- `.env` and `.env.local` must not be created or modified in Phase 24N.
- production database URL must not be used.
- raw Supabase access tokens must not be committed.
- staging/local credentials must be stored only through approved local secret handling and never committed.

### Local/Staging Apply Precheck

Before any future apply, confirm:

1. migration static audit is PASS.
2. migration file is unchanged since Phase 24M, or re-audited if changed.
3. environment is non-production.
4. `auth.users` exists in target environment.
5. `pgcrypto` / `gen_random_uuid()` works.
6. forbidden fields are absent.
7. deferred tables are absent.
8. RLS policy absence is intentional.
9. RLS enablement means deny-by-default.
10. app runtime remains disconnected.
11. rollback plan is available.
12. no real user data is present for local apply.
13. staging backup/snapshot exists if staging is used.

### Rollback Verification Plan

- rollback must be tested in non-production.
- non-production rollback may drop `anonymous_identities` first, then `profiles_private`, only if no real user data exists.
- production rollback must not drop user data without separate approval.
- FK constraints require rollback order to respect dependencies.
- rollback must verify both tables are removed or safely disabled in non-production.
- rollback must verify no app runtime depends on the tables yet.

### Production Safety Rules

Production apply is NO-GO.

Production apply requires a separate future GO/NO-GO and all of the following:

- local/staging apply PASS.
- rollback PASS.
- no real runtime binding.
- reviewed SQL.
- backup/snapshot strategy.
- secret handling confirmed.
- RLS/runtime plan separated.

Auth/Supabase runtime must not be enabled just because tables exist.

### Phase 24N Decisions

```txt
Ready for local/staging migration apply in next phase: READY FOR LOCAL/STAGING MIGRATION APPLY IN NEXT PHASE
Ready to apply migration in Phase 24N: NOT READY TO APPLY MIGRATION IN THIS PHASE
Ready for production migration apply: NOT READY FOR PRODUCTION MIGRATION APPLY
Ready for Auth/Supabase runtime implementation: NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
Ready for RLS policy implementation: NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
Ready for Storage/media implementation: NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24P Local Migration Apply GO / NO-GO Review

Reviewed migration file:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Phase 24P performed read-only local checks only. It did not apply SQL, reset the database, push the database, link a remote Supabase project, run production/staging commands, edit migration files, or modify app/package/lockfile files.

Read-only local DB findings:

- `public.profiles_private`: exists.
- `public.anonymous_identities`: exists.
- `supabase_migrations.schema_migrations`: exists.
- recorded migration version: `20260615062809`.

Decision:

```txt
LOCAL MIGRATION ALREADY APPLIED OR PRESENT - DO NOT REAPPLY
MOVE TO LOCAL MIGRATION AUDIT
PRODUCTION MIGRATION APPLY: NOT READY
AUTH/SUPABASE RUNTIME: NOT READY
RLS POLICY IMPLEMENTATION: NOT READY
STORAGE/MEDIA IMPLEMENTATION: NOT READY
```

Interpretation:

The local schema and local migration history are aligned for migration `20260615062809`. The next local phase should audit the applied schema rather than rerun the migration.

## Phase 24Q Local Migration Audit / DB Verification

Phase 24Q audited the already-present local migration state for:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Read-only DB metadata result:

```txt
Tables exist and RLS enabled: PASS
Columns match migration file: PASS
Constraints match migration file: PASS
Indexes match migration file: PASS
RLS policies absent: PASS
Migration history records 20260615062809 exactly once: PASS
Forbidden fields absent: PASS
```

The local database schema matches the first identity foundation migration for `profiles_private` and `anonymous_identities`. The migration must not be reapplied. The next SQL-related gate may prepare RLS policy implementation readiness, but policy creation remains blocked until a separate explicit GO.

## Phase 24R - RLS Policy Implementation Readiness / No-Apply Policy Plan (2026-06-16)

Result: PASS - RLS policy implementation readiness documented. No policies implemented.

This phase records the future RLS policy families for the existing private-profile and anonymous-identity foundation without creating executable SQL, without editing migrations, and without applying anything to a database.

Readiness boundaries:
- profiles_private direct table access remains owner-only by default. Future policies may allow an authenticated owner to select, insert, and update only the owner's own row. owner_user_id must not be reassigned. Hard delete remains NO-GO unless a separate deletion plan is approved.
- anonymous_identities direct table access remains owner-bound by default. Future policies may allow an authenticated owner to select, insert, and update only the owner's own rows. owner_user_id must not be reassigned. Broad public or authenticated reads are forbidden.
- Reveal recipients must not receive raw profiles_private select access. Any future reveal output must pass through a safe, context-scoped DTO/RPC/view boundary that exposes only approved fields after owner approval.
- Anonymous surfaces must not expose owner_user_id, raw profile rows, storage paths, sensitive verification state, or any field that links anonymous identity to real profile outside the approved context.

Forbidden future policy patterns:
- public select on profiles_private or anonymous_identities.
- authenticated-wide select on profiles_private or anonymous_identities.
- connection-wide or reveal-based raw select on profiles_private.
- searchable, browsable, globally visible, slug/handle/profile-directory policy logic.
- room/member-directory identity exposure.
- monetization, instant profile, follow, or coin flows bypassing owner consent.
- owner_user_id reassignment, raw ID leakage, raw storage path exposure, or sensitive verification/safety field exposure.

Required future deny tests before any executable policy phase:
- unauthenticated direct reads are denied for both tables.
- authenticated non-owner direct reads are denied for both tables.
- owners can access only their own intended rows after policies exist.
- owners cannot insert or update rows for another owner_user_id.
- reveal recipients still cannot raw-select profiles_private.
- no public/search/browse/global profile read path exists.
- no broad anonymous/authenticated select policy exists.
- RLS remains enabled and migration history is not reset or reapplied casually.

GO/NO-GO:
- Non-executable RLS policy SQL draft: GO in a future explicit phase.
- Executable migration creation/apply: NO-GO.
- Remote/staging/production apply: NO-GO.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24S - Non-Executable RLS Policy SQL Draft / No Migration Creation (2026-06-16)

Result: PASS - non-executable RLS policy SQL draft documented. No migration created. No RLS policy implemented. No database command run.

Canonical draft: `docs/architecture/EXPANDED_RLS_POLICY_MATRIX_PLAN.md`.

Summary:
- The migration file remains the source of truth for `public.profiles_private` and `public.anonymous_identities`.
- Phase 24S classifies actual columns conservatively and records that RLS controls row access, not safe column-level mutability by itself.
- `profiles_private` contains owner identity, visibility/consent, lifecycle/status, safety, verification, soft-delete, and audit fields. Owner INSERT/UPDATE are therefore CONDITIONAL until a field mutability matrix plus safe RPC/DTO, column-grant, trigger/check, or server-side update design is approved.
- `anonymous_identities` contains owner identity, status, safety, rotation, soft-delete, and audit fields. Owner INSERT/UPDATE are therefore CONDITIONAL until a field mutability matrix plus safe identity creation/update/rotation design is approved.
- Owner SELECT own rows may be a future candidate for both tables.
- Direct DELETE remains NO-GO for both tables until a deletion/retention design is approved.
- Public, unauthenticated, authenticated-wide, non-owner, reveal-recipient raw, connection/context raw, search/browse/global, feed directory, and member-directory raw SELECT paths are forbidden.
- Reveal must never grant raw `profiles_private` table read access. Future reveal output must use a safe context-scoped projection/DTO boundary.

No executable SQL was produced. Any SQL-like text is documented only as commented `text` and labelled `NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY` in the canonical draft.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24T - Non-Executable Deny/Allow RLS Test Draft + Static Policy Audit / No Apply (2026-06-16)

Result: PASS - Phase 24S static policy audit and non-executable future deny/allow RLS test draft documented. No executable tests created. No tests run. No database command run.

Canonical test/audit draft: `docs/architecture/TESTING_AUDIT_PROCEDURE_PLAN.md`.

Summary:
- Phase 24S draft is Markdown-only, fenced as text, labelled `NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY`, and policy-like lines are commented out.
- No executable SQL file, migration file, policy, view, function, trigger, test fixture, or executable test was created.
- No public, authenticated-wide, non-owner, reveal-recipient raw, connection/context raw, search/browse/global profile, feed directory, or member-directory raw table SELECT path is allowed by the draft.
- Broad owner UPDATE remains conditional/not ready because RLS controls rows, not safe mutation of safety/moderation/system/visibility/rotation/soft-delete fields.
- Future test actors are documentation-only personas; no users or rows were created.
- Future positive tests are limited to owner-bound SELECT and conditional owner INSERT/UPDATE after policy and field-mutability review.
- Future negative tests preserve anonymous-start behavior, no public profile, no profile/user search, no profile browsing, no room/member directory, no raw reveal SELECT, and no monetization-based consent bypass.

Current baseline expectation: Phase 24Q documented RLS enabled and zero policies, so direct client access remains deny-by-default until explicit policies are implemented. Phase 24T did not re-check DB state.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24U - RLS Policy Migration Creation Preflight / No Migration Creation / No Apply (2026-06-16)

Result: PASS - RLS policy migration creation preflight complete. No migration created. No policies implemented. No SQL mutation.

Scope guard:
- Local-only preflight.
- Read-only metadata/catalog SELECT queries only.
- No application table rows were read.
- No `auth.users` rows were read.
- No SQL mutation was executed.
- No migration file was created or edited.
- No executable test file was created.
- No app/Auth/Supabase runtime/Storage/backend/RPC implementation was performed.

Phase dependency: Phase 24T PASS - non-executable deny/allow RLS test draft and static policy audit documented.

### Read-Only Metadata Results

| Check | Result | Phase 24U interpretation |
| --- | --- | --- |
| `public.profiles_private` table existence | PRESENT | Matches first migration foundation. |
| `public.profiles_private` RLS enabled | TRUE | Expected deny-by-default posture remains. |
| `public.profiles_private` force RLS | FALSE | Acceptable; first migration did not require force RLS. |
| `public.anonymous_identities` table existence | PRESENT | Matches first migration foundation. |
| `public.anonymous_identities` RLS enabled | TRUE | Expected deny-by-default posture remains. |
| `public.anonymous_identities` force RLS | FALSE | Acceptable; first migration did not require force RLS. |
| Existing policies on both tables | ZERO ROWS | No actual RLS policies have been implemented. |
| Migration version `20260615062809` | COUNT = 1 | First migration appears exactly once. |

### Current Table Privilege / Grant Posture

Read-only metadata from `information_schema.role_table_grants` shows:

| Role / grantee | Observed privileges on first-migration tables | Phase 24U interpretation |
| --- | --- | --- |
| `anon` | REFERENCES, TRIGGER, TRUNCATE only; no table-level SELECT/INSERT/UPDATE/DELETE observed | No current anon DML/read table privilege observed. Future anon grants remain NO-GO unless a later explicit design proves otherwise. |
| `authenticated` | REFERENCES, TRIGGER, TRUNCATE only; no table-level SELECT/INSERT/UPDATE/DELETE observed | Owner SELECT policies would likely require explicit least-privilege authenticated SELECT privilege in the future migration if client/API access is intended. INSERT/UPDATE/DELETE remain NO-GO. |
| `service_role` | REFERENCES, TRIGGER, TRUNCATE only in this information_schema view; no table-level SELECT/INSERT/UPDATE/DELETE observed | Service/admin behavior is excluded from client RLS tests. Do not infer client-safe access from service/admin behavior. |
| `postgres` | SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER, TRUNCATE with grant option | Expected local owner/admin posture. Not a client role. |

Privilege risk decision: no broad client SELECT/INSERT/UPDATE/DELETE grant was observed for `anon` or `authenticated`, so there is no current privilege posture blocker for a future SELECT-only owner-bound policy migration. However, future migration creation is CONDITIONAL on explicit least-privilege grant handling for authenticated SELECT and strict deny/allow tests.

### Current Column Privilege Posture

Read-only metadata from `information_schema.column_privileges` shows:

| Role / grantee | Observed column privileges | Phase 24U interpretation |
| --- | --- | --- |
| `anon` | REFERENCES only on columns; no column-level SELECT/INSERT/UPDATE observed | No current anon column read/write posture observed. |
| `authenticated` | REFERENCES only on columns; no column-level SELECT/INSERT/UPDATE observed | No current authenticated column read/write posture observed. Future owner SELECT may need table/column privilege design. |
| `service_role` | REFERENCES only in this information_schema view | Excluded from client RLS tests. |
| `postgres` | SELECT, INSERT, UPDATE, REFERENCES on columns | Local owner/admin posture only. |

Column privilege decision: future UPDATE/INSERT safety still requires a field mutability matrix and possibly a column-level privilege strategy. Broad table-level UPDATE would be unsafe because RLS is row-level, not column-level.

### Static Consistency Review

| Review item | Result | Notes |
| --- | --- | --- |
| Phase 24S policy draft remains non-executable | PASS | It is Markdown documentation only. |
| Phase 24T test draft remains non-executable | PASS | It defines future test intent only. |
| No docs suggest raw `profiles_private` access for reveal recipients | PASS | Reveal remains safe projection/DTO/RPC/view/query-boundary only. |
| No docs suggest public/global/search/browse profile access | PASS | No profile search, user search, public profile, profile browsing, or global profile opening remains protected. |
| No docs suggest room/member-directory behavior | PASS | Member-directory and room models remain forbidden. |
| No docs mark broad owner UPDATE as ready | PASS | Owner UPDATE remains conditional/not ready until field mutability controls exist. |
| INSERT/UPDATE/DELETE remain conditional or NO-GO | PASS | First executable candidate remains SELECT-only. |
| Reveal remains safe projection only, not raw table SELECT | PASS | Raw reveal SELECT remains forbidden. |

### Future First Executable Migration Candidate Scope

Safest first executable policy migration candidate, if later explicitly approved:

| Candidate name | Table | Role target | Command scope | Predicate intent | Phase 24U decision |
| --- | --- | --- | --- | --- | --- |
| `profiles_private_owner_select_own` | `public.profiles_private` | authenticated only | SELECT only | owner row where `owner_user_id` equals authenticated user id | FUTURE CANDIDATE ONLY |
| `anonymous_identities_owner_select_own` | `public.anonymous_identities` | authenticated only | SELECT only | owner rows where `owner_user_id` equals authenticated user id | FUTURE CANDIDATE ONLY |

Out of scope for the first executable policy migration:
- `profiles_private` INSERT policy.
- `profiles_private` UPDATE policy.
- `profiles_private` DELETE policy.
- `anonymous_identities` INSERT policy.
- `anonymous_identities` UPDATE policy.
- `anonymous_identities` DELETE policy.
- Reveal recipient raw SELECT.
- Connection/context raw `profiles_private` SELECT.
- Anon/public SELECT.
- Authenticated-wide SELECT.
- Profile search, user search, profile browsing, anonymous identity browsing, or global profile visibility.
- Room/member-directory behavior.
- RPC/view/function/trigger creation.
- Storage/backend/Auth runtime implementation.

### GRANT / Privilege Planning

Future policy migration planning must account for both RLS and table privileges:
- RLS policies control row access.
- Table privileges control whether a role can attempt an operation at all.
- Current metadata does not show authenticated table-level SELECT on the two first-migration tables.
- A future SELECT-only owner-bound migration may need least-privilege authenticated SELECT privilege for the two tables, paired with strict owner-only RLS policies and deny/allow tests.
- Future anon role grants remain NO-GO unless a later explicit design proves otherwise.
- INSERT/UPDATE/DELETE privileges remain NO-GO until field mutability and safe boundary design are complete.
- Column-level privilege strategy may be required before future UPDATE/INSERT design.
- Phase 24U executed no privilege changes.

### First Executable Migration Preflight Checklist

Before Phase 24V can create an executable migration file:
- Current local DB schema matches the migration file.
- RLS is enabled on both tables.
- Existing policy count is confirmed.
- Current privilege/grant posture is documented.
- Future migration scope is limited to SELECT-only owner-bound policies unless explicitly expanded later.
- No INSERT/UPDATE/DELETE policies are included in the first policy migration.
- No raw reveal SELECT is included.
- No public/anon/global/search/browse SELECT is included.
- No anonymous feed directory/member-directory raw SELECT is included.
- No RPC/view/function/trigger is included in the first policy migration.
- Future migration file is created only with explicit GO.
- Future migration file is not applied in the same phase it is created.
- Future migration file receives static audit before local apply.
- Local apply happens before staging.
- Staging happens before production.
- Production remains NO-GO.
- Rollback/remediation plan avoids db reset, migration repair, or remote mutation unless separately approved.

### Rollback / Remediation Principles

- Do not use db reset as rollback.
- Do not use migration repair as rollback.
- Do not use production first.
- If a future policy migration is wrong after local apply, stop and create a separately reviewed corrective migration.
- If broad access is detected, block staging and production.
- If privilege grants are too broad, do not silently patch; document the issue and prepare a dedicated remediation phase.
- Always run deny/allow tests after local apply in a later phase.

### Phase 24U GO / NO-GO Decisions

| Decision point | Phase 24U decision |
| --- | --- |
| Actual RLS policy implementation now | NO-GO |
| Executable RLS policy migration file creation now | NO-GO in Phase 24U |
| Future Phase 24V executable migration file creation | GO only if limited to owner-bound SELECT candidates with documented least-privilege grant handling and no apply in the same phase |
| Local DB apply now | NO-GO |
| Staging/production apply | NO-GO |
| Auth/Supabase runtime implementation | NO-GO |
| Future INSERT/UPDATE/DELETE policy work | NO-GO until field mutability and safe boundary design are complete |
| Future reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_PREFLIGHT_PHASE.

## Phase 24V - Executable RLS Policy Migration File Creation / No Apply (2026-06-16)

Result: PASS - executable RLS policy migration file created for owner-bound SELECT policies only. No apply. No policies implemented in DB.

Created migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Phase 24V is file creation only. The migration was not applied locally, pushed, repaired, linked, or executed against any database.

### Pre-Creation Safety Check

| Requirement | Result | Notes |
| --- | --- | --- |
| Phase 24U PASS exists | PASS | Phase 24U preflight documented SELECT-only future candidate scope. |
| Future migration scope limited to owner-bound SELECT policy candidates | PASS | Only `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own` were created. |
| INSERT/UPDATE/DELETE are out of scope | PASS | No write policies were created. |
| Reveal raw `profiles_private` SELECT is out of scope | PASS | No reveal recipient policy was created. |
| Public/anon/global/search/browse access is out of scope | PASS | No public, anon, global, search, or browse access pattern was created. |
| RPC/view/function/trigger are out of scope | PASS | None were created. |
| Auth/runtime/storage/app implementation is out of scope | PASS | No runtime or app files were changed. |
| Privilege/grant posture is documented | PASS | Phase 24U documented no authenticated table-level SELECT and recommended least-privilege handling. |

### Migration Content Summary

The new file contains only:
- comments,
- `GRANT SELECT ON TABLE public.profiles_private TO authenticated;`,
- `GRANT SELECT ON TABLE public.anonymous_identities TO authenticated;`,
- `CREATE POLICY profiles_private_owner_select_own ... FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);`,
- `CREATE POLICY anonymous_identities_owner_select_own ... FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);`.

The new file does not contain INSERT, UPDATE, DELETE, anon grants, broad grants, search/browse/global profile access, reveal-recipient raw profile access, connection/context raw profile access, RPC/view/function/trigger creation, or runtime implementation.

### Grant / Privilege Decision

Phase 24U documented that `authenticated` did not currently have table-level SELECT on `public.profiles_private` or `public.anonymous_identities`. Phase 24V therefore included least-privilege table SELECT grants to `authenticated` for those two tables only, paired with owner-bound RLS policies.

No grant was made to `anon`. No write privilege was granted. No schema-wide, all-table, default-privilege, or broad grant was created.

### Static File Validation

| Validation item | Result |
| --- | --- |
| Exactly one new migration file created | PASS |
| Existing migration not edited | PASS |
| Contains `profiles_private_owner_select_own` | PASS |
| Contains `anonymous_identities_owner_select_own` | PASS |
| Contains FOR SELECT only | PASS |
| Contains TO authenticated only | PASS |
| Contains `auth.uid() = owner_user_id` predicate | PASS |
| No FOR INSERT / FOR UPDATE / FOR DELETE | PASS |
| No TO anon or GRANT to anon | PASS |
| No GRANT ALL or write grants | PASS |
| No CREATE VIEW / CREATE FUNCTION / CREATE TRIGGER | PASS |
| No DROP / TRUNCATE / ALTER DEFAULT PRIVILEGES / ALTER TABLE | PASS |

### Phase 24V GO / NO-GO Decisions

| Decision point | Phase 24V decision |
| --- | --- |
| Migration file creation | DONE |
| Local apply now | NO-GO |
| Staging/production apply | NO-GO |
| Actual policies implemented in DB | NO |
| Next phase | Phase 24W - Static Audit of Created RLS Policy Migration / No Apply |
| Auth/Supabase runtime | NO-GO |
| INSERT/UPDATE/DELETE policy work | NO-GO |
| Reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_FILE_CREATION_PHASE.

## Phase 24X - Local Apply Decision / Preflight for Created RLS Migration / No Apply (2026-06-16)

Result: PASS - local apply decision/preflight complete. No apply. No SQL mutation. Created RLS migration is eligible for a future local apply phase only with a new explicit GO. Staging/production remain NO-GO.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Scope guard:
- Local apply decision/preflight only.
- Read-only metadata/catalog SELECT queries only.
- No migration apply, migration up, db push, db reset, migration repair, link, remote command, SQL mutation, policy implementation, test execution, or test data creation.
- No migration file was created or edited.
- No app/runtime/Auth/Supabase/Storage/backend/RPC/view/function/trigger work was performed.

### Local Preflight Results

| Check | Result | Notes |
| --- | --- | --- |
| Local DB container `supabase_db_ankion` reachable | PASS | Docker listed the local DB container as healthy. |
| Original migration exists | PASS | `20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`. |
| Phase 24V migration file exists | PASS | `20260616090000_create_owner_select_rls_policies.sql`. |
| Phase 24W static audit PASS documented | PASS | Phase 24W static audit passed. |
| `public.profiles_private` exists | PASS | Metadata query found the table. |
| `public.anonymous_identities` exists | PASS | Metadata query found the table. |
| RLS enabled on both tables | PASS | `relrowsecurity = true` for both. |
| Force RLS state | PASS | `relforcerowsecurity = false` for both; acceptable under current plan. |
| Current policy count | PASS | `pg_policies` returned zero rows before apply. |
| First migration history | PASS | Version `20260615062809` count = 1. |
| Phase 24V migration history | PASS | Version `20260616090000` count = 0, so not applied locally. |
| Forbidden field scan | PASS | Zero forbidden public/search/token/identity-leak columns returned. |

### Migration History Status

| Migration | Version | Phase 24X metadata result | Interpretation |
| --- | --- | --- | --- |
| First private-profile/anonymous-identity foundation | `20260615062809` | count = 1 | Applied exactly once. |
| Owner-select RLS migration | `20260616090000` | count = 0 | Not applied locally yet. |

### RLS / Policy Baseline

Before any future local apply:
- Both target tables exist.
- RLS remains enabled on both target tables.
- `pg_policies` returns zero rows for `public.profiles_private` and `public.anonymous_identities`.
- No RLS policies are implemented in DB yet.

### Privilege / Grant Posture

Read-only table grant metadata before apply:
- `anon`: REFERENCES/TRIGGER/TRUNCATE only; no table-level SELECT/INSERT/UPDATE/DELETE observed.
- `authenticated`: REFERENCES/TRIGGER/TRUNCATE only; no table-level SELECT/INSERT/UPDATE/DELETE observed.
- `postgres`: local owner/admin SELECT/INSERT/UPDATE/DELETE and related privileges observed.
- `service_role`: REFERENCES/TRIGGER/TRUNCATE shown in this information_schema view; excluded from client RLS conclusions.

Read-only column privilege metadata before apply:
- `anon`: REFERENCES only; no column-level SELECT/INSERT/UPDATE observed.
- `authenticated`: REFERENCES only; no column-level SELECT/INSERT/UPDATE observed.
- `postgres`: local owner/admin column-level SELECT/INSERT/UPDATE observed.

Privilege decision: current posture matches Phase 24U/24W. The Phase 24V migration's table-specific `GRANT SELECT ... TO authenticated` remains acceptable for a future apply decision because authenticated currently lacks table-level SELECT and the migration pairs that grant with owner-bound RLS policies. No write grants are acceptable.

### Apply Readiness Checklist for Next Phase

| Requirement before future local apply | Phase 24X status |
| --- | --- |
| Local DB container reachable | PASS |
| Original migration exists | PASS |
| Phase 24V migration file exists | PASS |
| Phase 24W static audit PASS documented | PASS |
| First migration version exists exactly once | PASS |
| Phase 24V migration version is not yet applied | PASS |
| RLS enabled on both tables | PASS |
| Current policy count is zero | PASS |
| Current grant posture documented | PASS |
| Phase 24V migration scope remains owner-bound SELECT only | PASS |
| No INSERT/UPDATE/DELETE policy in migration | PASS |
| No anon/public/global/search/browse access | PASS |
| No reveal recipient raw `profiles_private` SELECT | PASS |
| No connection/context raw `profiles_private` SELECT | PASS |
| No RPC/view/function/trigger | PASS |
| No Auth/runtime/storage/app changes | PASS |
| Post-apply audit plan documented | PASS |
| Deny/allow test plan exists from Phase 24T | PASS |
| Rollback/remediation principles documented | PASS |
| Production/staging remain NO-GO | PASS |

### Future Local Apply Command / Method

DO NOT RUN IN PHASE 24X.

Existing docs reference Supabase migration apply commands generically, including `supabase migration up` and `supabase db push`, but Phase 24X does not confirm a final command for this owner-select migration apply. Phase 24Y must explicitly confirm the exact local-only apply command and receive a new explicit GO before execution.

Phase 24X does not approve `migration up`, `db push`, `db reset`, `migration repair`, `link`, or any remote command.

### Future Post-Apply Audit Plan

After a future local apply, the next phase must verify read-only:
- Phase 24V migration version `20260616090000` appears exactly once in `supabase_migrations.schema_migrations`.
- `pg_policies` shows exactly `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own`.
- Both policies are FOR SELECT.
- Both policies target authenticated.
- Both policies use the `owner_user_id` / `auth.uid()` owner predicate.
- No unexpected policies exist.
- No anon/public grants exist.
- No INSERT/UPDATE/DELETE grants were added.
- No forbidden fields appeared.
- RLS remains enabled.
- First migration remains recorded exactly once.
- Existing tables still exist.
- No app/runtime/env/package/APK workspace changes occurred.

### Future Deny/Allow Test Execution Plan

After future local apply and post-apply metadata audit, a later separate phase may run controlled local deny/allow RLS tests based on the Phase 24T matrix.

Phase 24X did not run tests, did not create test data, and did not create executable test files.

### Rollback / Remediation Principles

- Do not use db reset as normal rollback.
- Do not use migration repair as normal rollback.
- Do not apply to staging or production before local post-apply audit and tests.
- If the future migration applies incorrectly, stop.
- If broad access appears, block all next phases.
- Use a separately reviewed corrective migration if remediation is needed.
- Do not silently patch privileges.
- Do not use production-first fixes.

### Phase 24X GO / NO-GO Decisions

| Decision point | Phase 24X decision |
| --- | --- |
| Local apply in Phase 24X | NO-GO |
| Future Phase 24Y local apply | GO only if the exact command is confirmed and the user gives a new explicit GO |
| Staging/production apply | NO-GO |
| Auth/Supabase runtime | NO-GO |
| INSERT/UPDATE/DELETE policy work | NO-GO |
| Reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |
| Test execution now | NO-GO |

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PREFLIGHT_PHASE.

## Phase 24Y - Controlled Local Apply of Created RLS Policy Migration / Local Only (2026-06-16)

Result: FAIL - local apply command failed before Supabase CLI executed. Stopped without retry, repair, reset, or alternate command.

Approved migration file intended for local apply:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Approved command attempted exactly once:
- `npx -y supabase@latest migration up --local`

Sanitized failure summary:
- PowerShell blocked `C:\Program Files\nodejs\npx.ps1` because script execution is disabled by the local execution policy.
- Supabase CLI did not run.
- No migration apply completed.
- No post-apply metadata audit was run because Phase 24Y requires stopping after apply command failure.

### Pre-Apply Check Results Before Failure

| Check | Result | Notes |
| --- | --- | --- |
| Git availability | UNAVAILABLE | `git` was not available on PATH. |
| Migration file identity | PASS | `20260616090000_create_owner_select_rls_policies.sql` was present. |
| Original migration file identity | PASS | `20260615062809_create_private_profile_and_anonymous_identity_foundation.sql` was present. |
| Local DB container | PASS | `supabase_db_ankion` was present and healthy. |
| Target tables and RLS | PASS | Both target tables existed with RLS enabled. |
| Pre-apply policy baseline | PASS | `pg_policies` returned zero rows. |
| First migration history | PASS | Version `20260615062809` count was 1. |
| Owner-select migration history | PASS | Version `20260616090000` count was 0 before apply. |
| Expected pending migration scope | PASS | Only the owner-select migration was expected after the first migration. |

### Local Apply Result

| Item | Result |
| --- | --- |
| Local apply command run exactly once | YES |
| Command succeeded | NO |
| Failure class | Local shell execution policy blocked `npx.ps1` |
| Retry attempted | NO |
| Alternate command attempted | NO |
| DB repair/reset/migration repair attempted | NO |
| Direct psql mutation attempted | NO |
| Post-apply audit run | NO, stopped after failed apply command |

### GO / NO-GO Decisions

| Decision point | Phase 24Y decision |
| --- | --- |
| Local apply | FAIL - command failed before Supabase CLI execution |
| Post-apply metadata audit | NOT RUN due command failure |
| Staging/production apply | NO-GO |
| Auth/Supabase runtime | NO-GO |
| INSERT/UPDATE/DELETE policy work | NO-GO |
| Reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |
| Test execution now | NO-GO |

Required next action: a separate fix/decision phase must decide whether to run the same approved local apply command through a shell path that does not trigger the PowerShell `npx.ps1` execution-policy block, or adjust local tooling. No DB repair/reset should be used.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PHASE.

## Phase 24Y-FIX - Safe Local Apply Command Path Retry / Local Only (2026-06-16)

Result: FAIL - local apply retry command failed after Supabase CLI invocation. Stopped without retry, repair, reset, debug rerun, alternate command, or migration edit.

Approved migration file intended for local apply:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

### Safe Command Path Check

| Check | Result | Notes |
| --- | --- | --- |
| `npx.cmd` availability | PASS | `C:\Program Files\nodejs\npx.cmd` was found. |
| Supabase CLI through `npx.cmd` | PASS | Version `2.106.0` returned. |
| PowerShell execution policy changed | NO | No policy change was made. |
| `Set-ExecutionPolicy` used | NO | Forbidden action avoided. |
| `-ExecutionPolicy Bypass` used | NO | Forbidden action avoided. |

### Pre-Retry Check Results

| Check | Result | Notes |
| --- | --- | --- |
| Local DB container | PASS | `supabase_db_ankion` was present and healthy. |
| Target tables and RLS | PASS | Both target tables existed with RLS enabled. |
| Pre-retry policy baseline | PASS | `pg_policies` returned zero rows. |
| First migration history | PASS | Version `20260615062809` count was 1. |
| Owner-select migration history | PASS | Version `20260616090000` count was 0 before retry. |
| Expected pending migration scope | PASS | Only the owner-select migration was expected after the first migration. |

### Local Apply Retry Result

Approved retry command attempted exactly once:
- `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`

Sanitized result:
- Supabase CLI executed and connected to the local database.
- It attempted to apply `20260616090000_create_owner_select_rls_policies.sql`.
- The command failed at statement 0 with a SQL syntax error near an unexpected leading character before the initial comment.
- The failure is consistent with a leading BOM/encoding character at the start of the migration file.
- No retry, alternate command, debug rerun, migration repair, db reset, db push, link, direct psql mutation, manual policy creation, or migration edit was performed.

### Post-Apply Metadata Audit

Not run. Phase 24Y-FIX required stopping immediately after local apply retry command failure.

### GO / NO-GO Decisions

| Decision point | Phase 24Y-FIX decision |
| --- | --- |
| Local apply retry | FAIL - migration apply failed at statement 0 |
| Post-apply metadata audit | NOT RUN due command failure |
| Staging/production apply | NO-GO |
| Auth/Supabase runtime | NO-GO |
| INSERT/UPDATE/DELETE policy work | NO-GO |
| Reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |
| Test execution now | NO-GO |

Required next action: a separate fix/decision phase must address the migration file encoding/leading character issue without applying, resetting, repairing migration history, manually creating policies, or touching staging/production.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FIX_PHASE.

## Phase 24Y-FIX2 - Local Apply Failure Classification + Read-Only DB State Verification / No Apply (2026-06-16)

Result: PASS - local apply failure classified. No apply retry performed. DB remains pre-apply. Next phase may prepare a safe Supabase CLI invocation resolution or alternative local-only apply path, but must not apply without new explicit GO.

Scope guard:
- No apply retry.
- No SQL mutation.
- No reset, db push, migration repair, link, remote command, staging apply, or production apply.
- No PowerShell execution-policy change.
- No migration file creation or edit.
- No tests, test data, app code, package/lockfile, env, APK workspace, Auth/runtime/Storage/backend/RPC/view/function/trigger changes.

### Command Path Diagnostics

| Check | Result | Notes |
| --- | --- | --- |
| Git availability | UNAVAILABLE | Git remains unavailable on PATH. |
| `npx.cmd` availability | PASS | `C:\Program Files\nodejs\npx.cmd`. |
| Supabase CLI via `npx.cmd` | PASS | Version `2.106.0`. |
| `npm.cmd` availability | PASS | `C:\Program Files\nodejs\npm.cmd`. |
| Node version | PASS | `v24.12.0`. |
| npm version | PASS | `11.6.2`. |

### Exact Sanitized Phase 24Y-FIX Error

The Phase 24Y-FIX retry reached Supabase CLI and the local database, then failed while attempting the migration file.

Sanitized error classification text:
- Supabase CLI invoked through `npx.cmd` and connected to the local database.
- It attempted `20260616090000_create_owner_select_rls_policies.sql`.
- It failed at statement 0 with `ERROR: syntax error at or near` an unexpected leading character before the first comment.
- This is consistent with a leading BOM/encoding character at the start of the migration file.

### Read-Only DB State Verification

| Check | Result | Interpretation |
| --- | --- | --- |
| First migration version `20260615062809` | count = 1 | First migration remains applied exactly once. |
| Owner-select migration version `20260616090000` | count = 0 | Owner-select migration was not recorded/applied. |
| `pg_policies` for target tables | zero rows | Owner-select policies do not exist locally. |
| RLS state | enabled on both target tables | Baseline RLS posture remains. |
| Force RLS state | false on both target tables | Matches previous accepted state. |
| Forbidden field scan | zero rows | No forbidden public/search/token/identity-leak columns appeared. |

### Failure Classification

Classification: `MIGRATION_COMMAND_FAILED_BEFORE_DB_MUTATION`.

Reasoning:
- `npx.cmd` exists and Supabase CLI version check works.
- The failed retry reached Supabase CLI and local DB.
- The owner-select migration version remains absent from migration history.
- `pg_policies` still returns zero rows.
- Therefore the DB remains in the pre-apply state and no successful migration mutation occurred.

### Next Safe Recommendation

A later separately approved phase may address the migration file encoding/leading-character issue or define another safe local-only apply path. That phase must not use db reset, db push, migration repair, link, remote commands, direct manual SQL mutation, staging/production apply, or app/runtime changes.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FAILURE_CLASSIFICATION.

## Phase 24Y-FIX3 - Migration File Encoding / Leading Character Remediation + Static Re-Audit / No Apply (2026-06-16)

Result: PASS - owner-select RLS migration file encoding remediated and statically re-audited. No apply. No DB commands run. Next phase may retry controlled local apply only with a new explicit GO.

Scope guard:
- No migration apply, migration up, db push, db reset, migration repair, link, remote command, staging apply, or production apply.
- No DB command, psql, docker exec psql, or SQL mutation.
- No new migration file.
- Original first migration file was not edited.
- Only `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql` was edited, and only to remove the leading UTF-8 BOM bytes.

### File Prefix / Encoding Diagnostic

| Item | Result |
| --- | --- |
| Target migration file | `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql` |
| Original migration file present | PASS |
| Unexpected extra migration files | NONE |
| Pre-fix prefix classification | `UTF8_BOM_EF_BB_BF` |
| Pre-fix first bytes | `EF BB BF 2D 2D 20 50 68 61 73 65 20 32 34 56 20 ...` |
| Expected clean prefix | `2D 2D` / `--` |
| Pre-fix SHA256 | `31A9DFB5C5F62BAF010F379C08805D7103643C0C7DB5F07EEEEECF713C31B397` |

### Remediation Result

Remediation performed: removed exactly the leading UTF-8 BOM bytes `EF BB BF` from `20260616090000_create_owner_select_rls_policies.sql`.

No other content was changed intentionally. Policy names, table names, `GRANT SELECT` statements, `FOR SELECT`, `TO authenticated`, `auth.uid() = owner_user_id`, and comments after the BOM were preserved.

| Item | Result |
| --- | --- |
| Post-fix first bytes | `2D 2D 20 50 68 61 73 65 20 32 34 56 20 ...` |
| Post-fix first line | `-- Phase 24V - owner-bound SELECT RLS policies.` |
| Post-fix SHA256 | `FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455` |
| Original migration edited | NO |
| New migration created | NO |
| Apply/retry performed | NO |

### Static Re-Audit Result

| Audit item | Result |
| --- | --- |
| File starts cleanly with expected SQL/comment text | PASS |
| Contains `profiles_private_owner_select_own` | PASS |
| Contains `anonymous_identities_owner_select_own` | PASS |
| Policies use `FOR SELECT` only | PASS |
| Policies use `TO authenticated` only | PASS |
| Policies use `auth.uid() = owner_user_id` | PASS |
| No `USING (true)` | PASS |
| No broad OR predicates | PASS |
| No `WITH CHECK` | PASS |
| No `FOR INSERT` / `FOR UPDATE` / `FOR DELETE` | PASS |
| No `CREATE VIEW` / `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE TABLE` | PASS |
| No `DROP` / `TRUNCATE` / `ALTER TABLE` / `ALTER DEFAULT PRIVILEGES` | PASS |
| No `GRANT ALL`, anon grant, public grant, or write grants | PASS |
| Approved `GRANT SELECT ... TO authenticated` statements preserved | PASS |
| No `REVOKE` | PASS |
| No reveal-recipient raw SELECT, connection/context raw SELECT, search/browse/global/discoverability, or room/member-directory policy | PASS |
| No app/Auth/runtime/storage/backend/RPC/view/function/trigger implementation | PASS |

### GO / NO-GO Decisions

| Decision point | Phase 24Y-FIX3 decision |
| --- | --- |
| Encoding remediation | DONE |
| Static re-audit | PASS |
| Local apply/retry now | NO-GO |
| DB command / SQL mutation | NO-GO |
| Staging/production apply | NO-GO |
| Auth/runtime/app implementation | NO-GO |
| Next phase | Controlled local apply retry may be prepared only with a new explicit GO |

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_ENCODING_FIX_PHASE.

## Phase 24Y-FIX4 - Controlled Local Apply Retry After Encoding Fix / Local Only (2026-06-16)

Result: PASS - created RLS policy migration applied to local DB only after encoding fix. Post-apply metadata audit PASS. Owner-bound SELECT policies now exist locally. Staging/production remain NO-GO. Auth/runtime/app implementation remain NO-GO.

Migration file applied locally:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Migration version:
- `20260616090000`

Exact local apply retry command used exactly once:
- `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`

No PowerShell execution-policy change, `Set-ExecutionPolicy`, `-ExecutionPolicy Bypass`, db push, db reset, migration repair, link, remote command, staging apply, production apply, direct psql mutation, test execution, or app/runtime change was performed.

### Command Path Check

| Check | Result | Notes |
| --- | --- | --- |
| `npx.cmd` availability | PASS | `C:\Program Files\nodejs\npx.cmd`. |
| Supabase CLI through `npx.cmd` | PASS | Version `2.106.0`. |
| Uses `npx.cmd`, not `npx.ps1` | PASS | Approved command path used. |
| Local-only command | PASS | `migration up --local`. |
| No `--include-all`, remote flags, db push, reset, repair, or link | PASS | Not present in command. |

### Encoding Fix Confirmation

| Check | Result |
| --- | --- |
| Phase 24Y-FIX3 dependency | PASS |
| File starts with clean ASCII comment | PASS - `-- Phase 24V` |
| No leading `EF BB BF` | PASS |
| File SHA256 before apply | `FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455` |
| Static owner-select scope preserved | PASS |

### Pre-Retry Check Results

| Check | Before retry result |
| --- | --- |
| Local DB container | present and healthy |
| Target tables | present |
| RLS state | enabled on both tables; force RLS false |
| `pg_policies` | zero rows |
| First migration history | `20260615062809` count = 1 |
| Owner-select migration history | `20260616090000` count = 0 |
| Privilege baseline | no authenticated SELECT and no authenticated write grants before retry |
| Forbidden fields | zero rows |
| Pending migration scope | only expected owner-select migration file present after first migration |

### Local Apply Retry Result

The approved local-only command succeeded.

Sanitized output summary:
- Supabase CLI connected to the local database.
- It skipped `.gitkeep` because the filename is not a migration file.
- It applied `20260616090000_create_owner_select_rls_policies.sql`.

### Post-Apply Metadata Audit

| Audit item | Post-apply result |
| --- | --- |
| First migration history | `20260615062809` count = 1 |
| Owner-select migration history | `20260616090000` count = 1 |
| RLS state | enabled on both target tables; force RLS false |
| Policy count/set | exactly two expected policies |
| `profiles_private_owner_select_own` | present on `public.profiles_private`, SELECT, `{authenticated}`, `(auth.uid() = owner_user_id)`, no with_check |
| `anonymous_identities_owner_select_own` | present on `public.anonymous_identities`, SELECT, `{authenticated}`, `(auth.uid() = owner_user_id)`, no with_check |
| Authenticated table privileges | expected table-specific SELECT on both target tables |
| Anon table privileges | no SELECT grant introduced by Phase 24V |
| Authenticated write privileges | no INSERT/UPDATE/DELETE grants introduced by Phase 24V |
| Column privileges | authenticated SELECT appears per target table columns as expected after table SELECT grant; no write column grants to authenticated |
| Forbidden fields | zero rows |

### Phase 24Y-FIX4 GO / NO-GO Decisions

| Decision point | Phase 24Y-FIX4 decision |
| --- | --- |
| Local apply retry | DONE LOCAL ONLY |
| Post-apply metadata audit | PASS |
| Staging/production apply | NO-GO |
| Auth/Supabase runtime | NO-GO |
| INSERT/UPDATE/DELETE policy work | NO-GO |
| Reveal implementation | PLANNING ONLY / NOT IMPLEMENTED |
| Test execution now | NO-GO |
| Next phase | Phase 24Z - Local Post-Apply RLS Metadata Audit + Controlled Deny/Allow Test Planning/Preflight |

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_AFTER_ENCODING_FIX.

## Phase 24Z - Local Post-Apply RLS Metadata Audit + Controlled Deny/Allow Test Planning/Preflight (2026-06-16)

Status: PHASE 24Z PASS - LOCAL POST-APPLY RLS METADATA AUDIT COMPLETE. OWNER-BOUND SELECT RLS FOUNDATION IS ACTIVE LOCALLY. CONTROLLED DENY/ALLOW TEST PLANNING/PREFLIGHT DOCUMENTED. NO TESTS RUN. PHASE 24 BACKEND/RLS LOCAL FOUNDATION CHECKPOINT COMPLETE. PHASE 25 MAY START IN A NEW CHAT WITH HANDOFF.

Scope:
- Local post-apply metadata audit only.
- Controlled deny/allow test planning and preflight only.
- No migration apply, db push, db reset, migration repair, remote command, staging apply, or production apply.
- No SQL mutation, direct CREATE POLICY, GRANT, REVOKE, CREATE/ALTER/DROP, INSERT, UPDATE, DELETE, or TRUNCATE.
- No tests run, no executable test files created, no test data created, and no test users created.
- No migration files edited and no new migration files created.
- No app code, package, lockfile, env, APK workspace, Auth runtime, Supabase runtime, Storage/backend, RPC, view, function, trigger, Edge function, reveal, or write-policy implementation.

Local metadata audit results:
- Docker visibility: supabase_db_ankion present and healthy. supabase_vector_ankion remains restarting and is not a blocker for read-only DB metadata audit.
- Migration history: 20260615062809 count = 1; 20260616090000 count = 1; both expected versions present exactly once.
- Target tables: public.profiles_private and public.anonymous_identities exist; RLS enabled on both; force RLS remains false on both.
- Policies: exactly two policies exist on the two target tables: profiles_private_owner_select_own and anonymous_identities_owner_select_own.
- Policy details: both are PERMISSIVE SELECT policies for authenticated with USING predicate (auth.uid() = owner_user_id) and no WITH CHECK.
- Forbidden policy semantics: no USING true, no broad OR predicate, no anon/public policy target, no INSERT/UPDATE/DELETE policy, no public/search/global/browse/discoverability policy, no reveal-recipient raw profiles_private SELECT, and no room/member-directory policy.
- Table grants: authenticated has SELECT on both target tables; anon does not have SELECT; authenticated does not have INSERT, UPDATE, or DELETE. postgres retains local owner/admin privileges; service_role/anon/internal-style baseline REFERENCES/TRIGGER/TRUNCATE entries may appear from local grants.
- Column privileges: authenticated SELECT appears at column level as a consequence of the table SELECT grant; no authenticated INSERT or UPDATE column privilege was found. Future field mutability remains blocked until a separate safe boundary design exists.
- Forbidden fields: zero forbidden identity/search/global/secret fields found across profiles_private and anonymous_identities.
- Migration file hashes unchanged: 20260615062809 hash F9D291FDB0578C54DF2B8A64F6D321438341CBED3DB3BF93ACF362F483721AAC; 20260616090000 hash FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455.
- Phase 24V migration starts with "-- Phase 24V" and has no UTF-8 BOM.
- Git note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_POST_APPLY_AUDIT_PHASE.

Future Phase 25A controlled deny/allow test actors, not created in Phase 24Z:
1. unauthenticated_user
2. authenticated_owner_a
3. authenticated_non_owner_b
4. reveal_recipient_b_for_context_x
5. connection_participant_b_without_reveal
6. malicious_owner_attempting_owner_user_id_reassignment
7. malicious_owner_attempting_system_field_mutation
8. service_role_or_admin_context_excluded_from_client_rls_tests

Future profiles_private deny/allow matrix, not executed in Phase 24Z:
1. unauthenticated_user SELECT profiles_private: DENY.
2. authenticated_non_owner_b SELECT owner_a profiles_private row: DENY.
3. authenticated_owner_a SELECT own profiles_private row: ALLOW through owner SELECT policy.
4. reveal_recipient_b_for_context_x SELECT raw profiles_private: DENY.
5. connection_participant_b_without_reveal SELECT raw profiles_private: DENY.
6. authenticated_owner_a INSERT profiles_private: DENY / outside current policy scope.
7. authenticated_owner_a UPDATE profiles_private: DENY / outside current policy scope.
8. authenticated_owner_a DELETE profiles_private: DENY / outside current policy scope.
9. public/global/search/browse profile access: DENY / forbidden.
10. monetization-based identity/reveal bypass: DENY / forbidden.

Future anonymous_identities deny/allow matrix, not executed in Phase 24Z:
1. unauthenticated_user SELECT anonymous_identities: DENY.
2. authenticated_non_owner_b SELECT owner_a anonymous identity rows directly: DENY.
3. authenticated_owner_a SELECT own anonymous identity rows: ALLOW through owner SELECT policy.
4. feed/global anonymous directory SELECT directly from anonymous_identities: DENY / forbidden.
5. connection/member-directory SELECT directly from anonymous_identities: DENY / forbidden.
6. user search / anonymous identity search / browse / discoverability SELECT: DENY / forbidden.
7. authenticated_owner_a INSERT anonymous_identities: DENY / outside current policy scope.
8. authenticated_owner_a UPDATE anonymous_identities: DENY / outside current policy scope.
9. authenticated_owner_a DELETE anonymous_identities: DENY / outside current policy scope.
10. monetization-based identity lookup/discoverability/reveal bypass: DENY / forbidden.

Future Phase 25A local test data constraints:
- Local-only test data only; no staging or production.
- No real user data, personal data, email, phone, or real identity fields.
- No auth.users direct SELECT.
- No raw secret keys in docs.
- Use controlled local test users/claims only if a safe test harness is explicitly approved.
- Test data cleanup must be separately approved and local-only.
- Do not use db reset or migration repair as normal cleanup.

Future Phase 25A method decision required before tests run:
- Candidate methods: Supabase SQL test harness with local role/claim simulation; psql session-level JWT claims simulation if safe and documented; Supabase client local test harness only after runtime boundary approval; or a dedicated local SQL test script only in a separate explicit phase.
- Phase 24Z does not choose or implement the test method.

Phase 24 closure decision:
- Phase 24 backend/RLS local foundation checkpoint is complete.
- First schema migration exists and is applied locally.
- First owner-bound SELECT RLS migration exists and is applied locally.
- Local DB has owner-bound SELECT RLS active.
- Write policies remain NO-GO.
- Reveal remains planning-only and not implemented.
- Auth/runtime/app integration remains NO-GO.
- Staging and production remain NO-GO.
- Phase 25 may begin in a new chat with a handoff prompt.

## Phase 27C - Phase 28A Migration Slice Preflight (2026-06-18)

Status: PASS - docs-only slicing preflight. No migration file was created or edited. No SQL was implemented. No DB command was run.

Phase 28A candidate slice:
- Controlled creation boundary for `profiles_private` and `anonymous_identities` only.
- No conversations, voice messages, reveal requests, profile visibility grants, Storage/media, reports, notifications, payments, subscriptions, Auth runtime, Supabase runtime, app binding, APK/native, staging, or production.

Migration/risk boundary:
- Direct broad INSERT remains blocked.
- Controlled service/RPC boundary is preferred later.
- Direct INSERT is a conditional fallback only after explicit approval, strict `WITH CHECK`, field mutability matrix, deny tests, duplicate prevention, and abuse controls.
- Any executable migration creation requires a separate explicit GO and static review before local apply.
- Local apply requires another explicit GO after migration static audit.

## Phase 28A - Controlled Creation Boundary Migration Candidate (2026-06-18)

Status: PREPARED FOR STATIC REVIEW. One new local migration candidate was created for the narrow owner-controlled creation boundary. It was not applied.

Migration candidate:
- `supabase/migrations/20260618143000_create_owner_controlled_creation_boundary.sql`

Boundary:
- Scope is limited to initial provisioning of `profiles_private` and `anonymous_identities`.
- Ownership is derived from `auth.uid()` inside the controlled boundary.
- The caller cannot supply `owner_user_id`.
- Direct broad INSERT remains blocked; no direct broad INSERT/UPDATE/DELETE grants or direct write policies are introduced.
- The caller cannot set status, safety, verification, rotation, audit, soft-delete, reveal, or system fields.
- Duplicate prevention relies on the existing `profiles_private_owner_user_id_key` constraint and `anonymous_identities_one_active_per_owner_idx` index.

Still blocked:
- Local migration apply.
- DB command.
- RLS harness execution.
- Test data/user creation.
- Auth/runtime, Supabase client runtime, Storage, Reveal, app binding, APK/native, staging, and production.

## Phase 28I - Phase 29A Conversation / Connection Primitive Migration Preflight (2026-06-18)

Status: PASS - docs-only migration slicing preflight. No SQL implementation, migration creation/editing, DB command, RLS harness, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

Phase 29A recommended candidate slice:
- Name: Phase 29A - Conversation / Connection Primitive Migration Candidate.
- Scope: local source/migration candidate only.
- Candidate tables: `conversations` or `connections`, plus participant representation only if required by the chosen minimal schema.
- Candidate fields: anonymous identity participants, connection status, reply eligibility state, `created_at`, `updated_at`, `deleted_at`, and safety/moderation flags.

Migration boundary:
- Must depend on the existing `anonymous_identities` foundation.
- Must not touch `profiles_private` except through explicit no-raw-read documentation.
- Must not implement voice messages, Storage, Reveal, profile visibility grants, runtime app binding, Auth/Supabase client integration, APK/native, staging, or production.
- Must not add broad direct write policy.
- Must not create global conversation lists, public profile search, user search, profile browsing, room/chat-room/member-directory behavior, or real-profile reveal behavior.

Future apply/test gates:
- Any Phase 29A migration candidate requires static SQL review before local apply.
- Local apply requires a separate explicit DB-mutation GO.
- RLS/function harness execution requires a separate explicit harness GO.

Exact next GO:
`GO: Start Phase 29A conversation connection primitive migration candidate.`

## Phase 29A - Conversation / Connection Primitive Migration Candidate Created (2026-06-18)

Result: PASS - exactly one new migration candidate was created:

`supabase/migrations/20260618190000_create_conversation_connection_primitives.sql`

Candidate contents:
- creates `public.connections`.
- creates `public.connection_participants`.
- adds check constraints for connection, reply, lifecycle, participant, safety, and moderation states.
- adds indexes for anonymous identity and connection lookup.
- enables RLS on both new tables.

Explicitly not included:
- no DB apply.
- no RLS policy creation.
- no table grants.
- no voice message table.
- no Storage/media table.
- no Reveal table or reveal permission logic.
- no raw `profiles_private` read path.
- no public/global search or room/chat-room model.
- no runtime/Auth/Supabase client integration.

Next required gate: static SQL review before any checkpoint or local apply decision.

## Phase 30B - Owner-Controlled Creation Migration Planning Only (2026-06-19)

Result: PASS - docs-only migration planning completed. No migration file was created or edited. No DB command, SQL execution, migration apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Future migration slice objective:
- Plan a narrow owner-controlled creation migration for `public.profiles_private` and `public.anonymous_identities`.
- Prefer controlled authenticated RPC/function boundaries over direct table INSERT RLS.
- Preserve the existing schema constraints: `profiles_private_owner_user_id_key` and `anonymous_identities_one_active_per_owner_idx`.

Preferred future SQL shape, not created in Phase 30B:
- `public.create_my_private_profile(...)`
- `public.create_my_anonymous_identity(...)`
- Optional reviewed wrapper: `public.create_owner_identity_foundation(text, text, text)` only if it remains narrow and owner-derived.

Required function properties:
- `SECURITY DEFINER` only with fixed `search_path`.
- schema-qualified references to `public.profiles_private`, `public.anonymous_identities`, `auth.uid()`, and `extensions.gen_random_bytes` if randomness is used.
- no dynamic SQL.
- no service-role dependency.
- no `owner_user_id` or target-user input.
- narrow return: own id plus created/existing status only.
- explicit EXECUTE revoke/grant posture: revoke from `public` and `anon`; grant to `authenticated` only after RPC/probing review.

Planned grant/RLS posture:
- No broad table grants.
- No anon/PUBLIC creation.
- No direct INSERT/UPDATE/DELETE policy unless a later fallback phase separately approves it.
- Existing owner SELECT policies remain the read path for owner rows.
- Creation functions must not expose raw `profiles_private` rows, owner IDs, anonymous-to-real correlation, or cross-user existence.

Future face verification note:
- Managed IDV provider integration, such as a future `@veriff/react-native-sdk` runtime/device path, is outside this migration slice.
- Store only verification result fields in future schema work; do not store raw face images, selfie video, ID media, or biometric embeddings.

Future verification gates:
1. Phase 30B checkpoint verification only.
2. Separate explicit GO before any migration draft or SQL edit.
3. Separate explicit GO before local apply.
4. Separate explicit GO before RLS harness/auth simulation/test data.

Exact next GO:
`GO: Create Phase 30B docs checkpoint commit only.`

## Phase 30A - Owner-Controlled Creation Future Migration Slice Plan (2026-06-19)

Result: PASS - docs-only planning note. No SQL execution, DB command, migration creation/editing/apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Future migration/RLS/RPC direction:
- Preferred future implementation path is the controlled authenticated creation function/RPC boundary, not direct INSERT RLS.
- The existing local controlled creation boundary shape (`public.create_owner_identity_foundation(text, text, text)`) already avoids a client `owner_user_id` argument and derives ownership from `auth.uid()`.
- Any future revision or apply/checkpoint phase must preserve no service-role dependency, no anon/public creation, no broad table write grants, no direct unrestricted INSERT/UPDATE/DELETE policy, and no client-controlled system/safety/status/rotation/deleted fields.
- Direct INSERT RLS may be considered only as a separately approved fallback with strict `WITH CHECK (auth.uid() = owner_user_id)`, explicit column/mutability limits, duplicate prevention, and negative harness coverage.

Future local-only execution gates:
1. Static checkpoint verification of this Phase 30A plan.
2. Separate explicit GO before any migration draft or migration edit.
3. Separate explicit GO before any local DB apply.
4. Separate explicit GO before any RLS harness, auth simulation, or test user/data creation.

Future verification must cover owner creation, spoof denial, duplicate profile denial, duplicate active identity denial, unauthenticated denial, cross-user isolation, direct table write denial, rollback/cleanup, and no persistent test data.

Exact next GO:
`GO: Create Phase 30A docs checkpoint commit only.`

## Phase 29J - Connection Primitive RLS Policy Local Apply Readiness Preflight (2026-06-19)

Result: PASS - local apply readiness/preflight completed for the Phase 29I participant-only SELECT RLS policy candidate. No DB command, SQL execution, local migration apply, Supabase db push/reset/link, RLS harness, test execution, test data/user, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Target migration:
`supabase/migrations/20260619123000_create_connection_participant_select_rls_policies.sql`

Readiness checks:
- File exists.
- Migration order follows `20260618190000_create_conversation_connection_primitives.sql` and `20260619103000_revoke_connection_primitive_unsafe_grants.sql`.
- Scope is limited to participant-only SELECT RLS policies.
- Targets only `public.connections` and `public.connection_participants`.
- Authenticated SELECT grant is SELECT-only and paired with RLS.
- No anon or PUBLIC grant exists in the candidate.
- No INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER grant, direct write policy, or `WITH CHECK` exists.
- No `profiles_private` policy/FK/read path, voice message table, Storage, Reveal, runtime object, global conversation list, public browsing, profile/user search, or room/chat-room model exists.

Future local-only apply command notes, not run in Phase 29J:
- Preferred later path: Supabase CLI local migration apply only if the local target is confirmed and no remote link/push is involved.
- Fallback later path if CLI is unavailable: use local Docker container `supabase_db_ankion` with `docker cp` and `docker exec ... psql -f ...`, then record local migration history only after successful apply.

Rollback/checkpoint expectation:
- A clean checkpoint must exist before Phase 29K.
- If local apply fails, stop and report the exact error; do not edit the migration without separate GO.

Exact next GO:
`GO: Start Phase 29K local connection participant select RLS policy apply.`

## Phase 29B - Conversation / Connection Primitive Local Apply Readiness Preflight (2026-06-19)

Result: PASS - local apply readiness/preflight completed. No DB command, SQL execution, local migration apply, Supabase db push/reset/link, RLS harness, test execution, test data/user, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Target migration:
`supabase/migrations/20260618190000_create_conversation_connection_primitives.sql`

Preflight checks:
- File exists.
- Migration order follows the controlled creation boundary migrations.
- Scope is limited to conversation / connection primitives.
- `public.connections` and `public.connection_participants` are present.
- Foreign keys target `public.anonymous_identities` only.
- No `profiles_private` FK/read path exists.
- No `voice_messages`, Storage, Reveal, runtime integration, profile/user search, global browsing, or room/chat-room model exists.
- RLS is enabled on both new tables.
- No `CREATE POLICY`, broad direct INSERT/UPDATE/DELETE policy, broad grant, or global conversation list policy exists.

Future local-only apply command notes, not run in Phase 29B:
- Preferred later path: use Supabase CLI local migration apply only if the local target is confirmed and no remote link/push is involved.
- Fallback later path if CLI is unavailable: use local Docker container `supabase_db_ankion` with `docker cp` and `docker exec ... psql -f ...`, then record local migration history only after successful local apply.

Rollback/checkpoint expectation:
- A clean checkpoint must exist before Phase 29C.
- If local apply fails, stop and report the exact error; do not edit the migration without separate GO.

Exact next GO:
`GO: Start Phase 29C local conversation connection primitive migration apply.`

## Phase 29D - Conversation Primitive Unsafe Grants Corrective Migration Candidate (2026-06-19)

Result: PASS - exactly one corrective migration candidate was created. No DB command, SQL execution, local migration apply, Supabase db push/reset/link, RLS harness, test execution, test data/user, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Corrective migration:
`supabase/migrations/20260619103000_revoke_connection_primitive_unsafe_grants.sql`

Corrective scope:
- Targets `public.connections`.
- Targets `public.connection_participants`.
- Revokes all table privileges from `anon` and `authenticated`.
- Explicitly revokes all table privileges from `public`.
- Adds no `CREATE POLICY`.
- Adds no `GRANT`.
- Does not edit `supabase/migrations/20260618190000_create_conversation_connection_primitives.sql`.
- Does not touch `profiles_private`.
- Does not introduce voice messages, Storage, Reveal, runtime objects, or schema redesign.

Next required gate: static SQL review before any checkpoint or local corrective apply decision.

## Phase 29I - Connection Primitive RLS Policy Migration Candidate (2026-06-19)

Result: PASS - exactly one new local source migration candidate was created for participant-only SELECT RLS policies. No DB command, SQL execution, local migration apply, Supabase db push/reset/link, RLS harness, test execution, test data/user, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Migration candidate:
`supabase/migrations/20260619123000_create_connection_participant_select_rls_policies.sql`

Candidate contents:
- grants `SELECT` on `public.connections` to `authenticated` only.
- grants `SELECT` on `public.connection_participants` to `authenticated` only.
- creates participant-only SELECT policy for `public.connections`.
- creates participant-only SELECT policy for `public.connection_participants`.
- uses `auth.uid()` ownership through `public.anonymous_identities.owner_user_id`.
- requires matching active participant rows in `public.connection_participants`.

Explicitly not included:
- no anon or PUBLIC grant.
- no direct INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, or TRIGGER grant.
- no direct write policy and no `WITH CHECK`.
- no global conversation list policy.
- no `profiles_private` FK/read path.
- no voice messages, Storage, Reveal, runtime function/view/trigger, APK/native, staging, or production.

Next required gate: static SQL review before any checkpoint or local apply decision.
