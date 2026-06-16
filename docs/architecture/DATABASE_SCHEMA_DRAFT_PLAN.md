# Database Schema Draft Plan

## Phase

Phase 18D — Documentation-only Database Schema Draft Plan

## Purpose

This document defines the first planned database schema draft for ankion before any SQL, migration, Supabase, Auth, RLS, or Storage implementation begins.

The goal is to clarify future tables, columns, relationships, indexes, enum values, and migration order while keeping the project documentation-only.

No database implementation is included in Phase 18D.

---

## Current Foundation

Completed planning:

- Phase 17A — Data Model + RLS Foundation Plan
- Phase 17B — Anonymous Identity / Real Profile Separation Plan
- Phase 17C — Reveal Request Security Model
- Phase 17D — Voice / Media Storage Boundary Plan
- Phase 17E — Data / RLS / Storage Foundation Audit + Docs Alignment
- Phase 18A — Supabase Implementation Readiness Checklist
- Phase 18B — Expanded RLS Policy Matrix Plan
- Phase 18C — Auth Foundation Plan

Current state:

- No Supabase client exists
- No Auth implementation exists
- No SQL exists
- No migrations exist
- No RLS policies exist
- No Storage buckets exist
- No backend/API exists

---

## Core Schema Rule

The schema must preserve strict separation between:

1. Auth account
2. Private real profile
3. Anonymous identity
4. Conversation/voice/media interaction
5. Reveal request
6. Visibility grant

Real profile data must not become reachable through anonymous surfaces unless an approved visibility grant exists.

---

## Planned Table Set

Initial schema draft includes:

- profiles_private
- anonymous_identities
- conversations
- voice_messages
- reveal_requests
- profile_visibility_grants
- feed_items

This is planning only.

No table is created in this phase.

---

# 1. profiles_private

## Purpose

Stores real profile data owned by an authenticated user.

This table is private by default.

## Planned Columns

| Column              | Type direction | Required | Notes                         |
| ------------------- | -------------- | -------: | ----------------------------- |
| user_id             | uuid           |      Yes | References auth user id       |
| display_name        | text           |    Later | Real profile display name     |
| bio                 | text           |    Later | Optional real profile bio     |
| avatar_path         | text           |    Later | Private avatar storage path   |
| visibility_settings | jsonb          |    Later | Future visibility preferences |
| created_at          | timestamptz    |      Yes | Created timestamp             |
| updated_at          | timestamptz    |      Yes | Updated timestamp             |
| deleted_at          | timestamptz    |       No | Optional soft delete later    |

## Primary Key

- user_id

## Foreign Keys

Future:

- user_id references auth.users.id

## Indexes

Recommended later:

- primary key on user_id
- optional index on deleted_at if soft delete is used

## RLS Sensitivity

Very high.

Default access:

- owner only

Extended access:

- approved viewer through active profile_visibility_grants

## Notes

Do not expose this table directly to Discover, Feed, Chat, or pending reveal request flows.

---

# 2. anonymous_identities

## Purpose

Stores safe anonymous interaction identity.

Used by Discover, Feed, Chat, voice messages, and media moments.

## Planned Columns

| Column        | Type direction            | Required | Notes                              |
| ------------- | ------------------------- | -------: | ---------------------------------- |
| id            | uuid                      |      Yes | Anonymous identity id              |
| owner_user_id | uuid                      |      Yes | References auth user id; sensitive |
| safe_label    | text                      |       No | Optional anonymous-safe label      |
| status        | anonymous_identity_status |      Yes | active / disabled / archived       |
| created_at    | timestamptz               |      Yes | Created timestamp                  |
| updated_at    | timestamptz               |      Yes | Updated timestamp                  |

## Primary Key

- id

## Foreign Keys

Future:

- owner_user_id references auth.users.id

## Indexes

Recommended later:

- index on owner_user_id
- index on status

## Enum Draft

anonymous_identity_status:

- active
- disabled
- archived

## RLS Sensitivity

High.

Owner can see full row.

Non-owner must not see owner_user_id.

Public-safe access should use safe view or restricted payload.

## Notes

This table is the key separation layer between anonymous interaction and real profile.

---

# 3. conversations

## Purpose

Stores conversation container between anonymous identities.

## Planned Columns

| Column                     | Type direction      | Required | Notes                              |
| -------------------------- | ------------------- | -------: | ---------------------------------- |
| id                         | uuid                |      Yes | Conversation id                    |
| participant_a_anonymous_id | uuid                |      Yes | References anonymous_identities.id |
| participant_b_anonymous_id | uuid                |      Yes | References anonymous_identities.id |
| status                     | conversation_status |      Yes | active / archived                  |
| created_at                 | timestamptz         |      Yes | Created timestamp                  |
| last_activity_at           | timestamptz         |       No | Updated when activity happens      |

## Primary Key

- id

## Foreign Keys

Future:

- participant_a_anonymous_id references anonymous_identities.id
- participant_b_anonymous_id references anonymous_identities.id

## Indexes

Recommended later:

- index on participant_a_anonymous_id
- index on participant_b_anonymous_id
- index on last_activity_at
- unique pair constraint may be considered later for duplicate prevention

## Enum Draft

conversation_status:

- active
- archived

## RLS Sensitivity

High.

Only authenticated owners of participant anonymous identities can read.

No public conversation graph.

## Notes

Conversation should never expose real profile information by default.

---

# 4. voice_messages

## Purpose

Stores metadata for anonymous voice messages.

Actual audio files are stored separately in Storage later.

## Planned Columns

| Column              | Type direction       | Required | Notes                              |
| ------------------- | -------------------- | -------: | ---------------------------------- |
| id                  | uuid                 |      Yes | Voice message id                   |
| conversation_id     | uuid                 |      Yes | References conversations.id        |
| sender_anonymous_id | uuid                 |      Yes | References anonymous_identities.id |
| audio_path          | text                 |    Later | Private storage path               |
| duration_seconds    | integer              |      Yes | Future max 21 seconds              |
| status              | voice_message_status |      Yes | pending / available / removed      |
| created_at          | timestamptz          |      Yes | Created timestamp                  |
| expires_at          | timestamptz          |       No | Optional expiration later          |

## Primary Key

- id

## Foreign Keys

Future:

- conversation_id references conversations.id
- sender_anonymous_id references anonymous_identities.id

## Indexes

Recommended later:

- index on conversation_id
- index on sender_anonymous_id
- index on created_at
- index on expires_at if expiration is used

## Enum Draft

voice_message_status:

- pending
- available
- removed
- expired

## RLS Sensitivity

High.

Only conversation participants can read.

Only sender can create within conversation context.

## Notes

audio_path must not include email, real name, auth user id, or profile identity.

---

# 5. reveal_requests

## Purpose

Stores profile visibility request events.

A reveal request does not grant profile visibility.

## Planned Columns

| Column                 | Type direction       | Required | Notes                                                   |
| ---------------------- | -------------------- | -------: | ------------------------------------------------------- |
| id                     | uuid                 |      Yes | Reveal request id                                       |
| conversation_id        | uuid                 |      Yes | References conversations.id                             |
| requester_user_id      | uuid                 |      Yes | Auth user requesting visibility                         |
| requester_anonymous_id | uuid                 |      Yes | Requester anonymous identity                            |
| profile_owner_user_id  | uuid                 |      Yes | Real profile owner                                      |
| target_anonymous_id    | uuid                 |      Yes | Owner anonymous identity in context                     |
| state                  | reveal_request_state |      Yes | pending / approved / kept_private / cancelled / expired |
| created_at             | timestamptz          |      Yes | Created timestamp                                       |
| reviewed_at            | timestamptz          |       No | Set when owner reviews                                  |

## Primary Key

- id

## Foreign Keys

Future:

- conversation_id references conversations.id
- requester_anonymous_id references anonymous_identities.id
- target_anonymous_id references anonymous_identities.id
- requester_user_id references auth.users.id
- profile_owner_user_id references auth.users.id

## Indexes

Recommended later:

- index on conversation_id
- index on requester_user_id
- index on profile_owner_user_id
- index on target_anonymous_id
- index on state
- unique active request constraint later if needed

## Enum Draft

reveal_request_state:

- pending
- approved
- kept_private
- cancelled
- expired

## RLS Sensitivity

Very high.

Requester can see limited fields.

Owner can review requests targeting their identity.

Pending request must not expose private profile.

## Notes

User-facing copy should avoid harsh wording like rejected or denied.

---

# 6. profile_visibility_grants

## Purpose

Stores approved real profile visibility access.

This table controls real profile visibility.

## Planned Columns

| Column                | Type direction | Required | Notes                    |
| --------------------- | -------------- | -------: | ------------------------ |
| id                    | uuid           |      Yes | Grant id                 |
| profile_owner_user_id | uuid           |      Yes | Owner of real profile    |
| viewer_user_id        | uuid           |      Yes | Approved viewer          |
| conversation_id       | uuid           |      Yes | Context for grant        |
| reveal_request_id     | uuid           |      Yes | Source reveal request    |
| created_at            | timestamptz    |      Yes | Grant creation timestamp |
| revoked_at            | timestamptz    |       No | Null means active        |

## Primary Key

- id

## Foreign Keys

Future:

- profile_owner_user_id references auth.users.id
- viewer_user_id references auth.users.id
- conversation_id references conversations.id
- reveal_request_id references reveal_requests.id

## Indexes

Recommended later:

- index on profile_owner_user_id
- index on viewer_user_id
- index on conversation_id
- index on reveal_request_id
- partial index for active grants where revoked_at is null

## RLS Sensitivity

Very high.

Owner and approved viewer only.

No public select.

## Notes

Profile access should depend on this grant, not reveal request state alone.

---

# 7. feed_items

## Purpose

Stores future anonymous feed media or voice moments.

## Planned Columns

| Column                | Type direction        | Required | Notes                              |
| --------------------- | --------------------- | -------: | ---------------------------------- |
| id                    | uuid                  |      Yes | Feed item id                       |
| anonymous_identity_id | uuid                  |      Yes | Owner anonymous identity           |
| media_type            | feed_media_type       |      Yes | photo / video / audio              |
| media_path            | text                  |    Later | Storage path                       |
| caption               | text                  |       No | Optional safe caption              |
| visibility_state      | feed_visibility_state |      Yes | draft / visible / hidden / removed |
| created_at            | timestamptz           |      Yes | Created timestamp                  |
| updated_at            | timestamptz           |      Yes | Updated timestamp                  |

## Primary Key

- id

## Foreign Keys

Future:

- anonymous_identity_id references anonymous_identities.id

## Indexes

Recommended later:

- index on anonymous_identity_id
- index on media_type
- index on visibility_state
- index on created_at

## Enum Draft

feed_media_type:

- photo
- video
- audio

feed_visibility_state:

- draft
- visible
- hidden
- removed

## RLS Sensitivity

Medium-high.

Owner can manage own feed items.

Public-safe fields may be readable later only if product decision allows.

## Notes

Feed must not expose real profile or owner_user_id.

---

## Relationship Summary

```txt
auth.users.id
  -> profiles_private.owner_user_id

auth.users.id
  -> anonymous_identities.owner_user_id

anonymous_identities.id
  -> conversations.participant_a_anonymous_id
  -> conversations.participant_b_anonymous_id

conversations.id
  -> voice_messages.conversation_id

anonymous_identities.id
  -> voice_messages.sender_anonymous_id

conversations.id
  -> reveal_requests.conversation_id

reveal_requests.id
  -> profile_visibility_grants.reveal_request_id

profile_visibility_grants.profile_owner_user_id
  -> profiles_private.owner_user_id

anonymous_identities.id
  -> feed_items.anonymous_identity_id
```

## Phase 18F Alignment Note

Phase 18F confirms this document is part of the completed Phase 18 Supabase readiness planning set.

Confirmed:

- This remains documentation-only.
- No Supabase implementation, Supabase client, Auth code, RLS SQL, Storage buckets/policies, migrations, `.sql`, `.env`, package install, backend/API, route/component, package, lockfile, or apps/web source changes were added.

## Phase 20B Go/No-Go Review Note

Phase 20B confirms this document remains part of the Supabase planning foundation only.

Confirmed:

- This plan does not authorize Supabase implementation.
- Related implementation remains NO-GO until all readiness gates are explicitly passed.
- No SQL, migrations, Supabase client, Auth, RLS, Storage, `.env`, package, backend/API, route, or apps/web changes should start from this plan alone.

## Phase 20D Finalized Schema Readiness Review Note

Phase 20D reviewed the planned database schema for future Supabase implementation readiness.

Finalized schema readiness gate status:

```txt
NOT READY
```

Review result:

- The planned table list is complete enough as a foundation for the current MVP planning scope: `profiles_private`, `anonymous_identities`, `conversations`, `voice_messages`, `reveal_requests`, `profile_visibility_grants`, and `feed_items`.
- Private profile data and anonymous identity data remain separated in the planned model.
- Reveal grants remain the only planned bridge from anonymous interaction to real profile visibility.
- Public Discover, Feed, Chat, and pending reveal surfaces must not expose `owner_user_id` or private profile fields.
- Future storage/media metadata boundaries are identified but not finalized enough for implementation.

Unresolved schema decisions blocking PASS:

- Several columns are still marked `Later`, optional, or dependent on future decisions.
- Exact nullable rules are not finalized for all tables.
- Exact enum values are drafted but not final enough for SQL.
- Duplicate conversation and duplicate reveal request constraints need final decisions.
- Feed public-safe visibility behavior still needs final product/security review.
- Storage path fields and media metadata semantics need final privacy review.
- Soft delete, revoke, expiration, and timestamp policies need final consistency review.
- Indexes and constraints are recommended but not final implementation decisions.

Decision:

Do not create SQL or migrations yet. Finalized schema readiness remains NOT READY until the unresolved schema decisions are explicitly closed.

## Phase 20E RLS Verification Dependency Note

Phase 20E confirms that finalized schema readiness still blocks RLS policy verification.

The RLS gate cannot pass until schema decisions close exact ownership fields, nullable rules, enum states, participant relationships, reveal request/grant lifecycle constraints, feed visibility rules, storage/media metadata semantics, and final indexes/constraints.

No SQL, migrations, RLS policies, or Supabase implementation are authorized by this note.

## Phase 20F Storage Metadata Readiness Note

Phase 20F confirms future Storage privacy readiness is NOT READY.

Storage-related schema fields such as `audio_path`, `media_path`, avatar paths, media metadata relationships, visibility states, expiration behavior, deletion/revocation semantics, and reveal-grant-dependent profile media access need final privacy review before Storage buckets, policies, SQL, migrations, or Supabase Storage implementation can begin.

## Phase 20G Auth Ownership Readiness Note

Phase 20G confirms Auth flow boundary readiness is NOT READY.

Schema decisions must still finalize how Auth account identity maps to `profiles_private`, `anonymous_identities`, reveal request requester/owner fields, visibility grants, conversations, voice/media ownership, deletion/deactivation behavior, and blocked/suspended account behavior before Auth implementation, SQL, migrations, or Supabase client work can begin.

## Phase 20H Migration Rollback Dependency Note

Phase 20H confirms migration rollback/check strategy is PLANNED, but schema execution remains blocked.

Future migrations must not be created until schema decisions are final enough to support safe rollback notes, dependency checks, data-loss risk review, privacy-leak risk review, and post-migration validation.

---

---

## Phase 21A Package Alignment Cross-Reference Note

Phase 21A completed Expo package alignment and validation.

Confirmed:

- `expo` aligned to `~56.0.8`
- `expo-linking` aligned to `~56.0.13`
- `expo-router` aligned to `~56.2.8`
- mobile typecheck passed
- web typecheck passed
- web build passed
- mobile Android export passed
- release APK build passed
- device smoke test passed

This phase did not change schema, SQL, migrations, Supabase, Auth, RLS, Storage, backend/API, route behavior, or runtime product behavior.

Schema execution remains blocked.

Supabase implementation remains:

````txt
NO-GO

## Phase 22A Schema Draft Expansion Note

Phase 22A expands this database schema draft with the newer approved ANKION product and security decisions.

This remains documentation-only.

This note does not authorize:

* SQL
* migrations
* Supabase implementation
* Supabase client integration
* Auth implementation
* RLS policy creation
* Storage bucket creation
* Storage policy creation
* `.env` files
* backend/API logic
* route UI changes
* runtime behavior

Supabase implementation remains:

```txt
NO-GO
````

The purpose of this expansion is to make the schema draft reflect newer core decisions:

- block must override every interaction
- follow targets anonymous identity, not real profile
- voice limits must be backend-enforced
- public instant media must be capture-now
- media upload must use intent, nonce, hash, expiry, and replay protection
- frontend must not receive raw storage paths
- reports and notifications must not leak identity
- location is sensitive and deferred until a separate privacy model is ready

---

## Expanded Planned Table Set

The original Phase 18D planned table set remains a valid foundation:

- profiles_private
- anonymous_identities
- conversations
- voice_messages
- reveal_requests
- profile_visibility_grants
- feed_items

Phase 22A adds the following planned/future schema areas:

- blocks
- follows
- voice_usage_daily
- voice_usage_connection_daily
- media_capture_intents
- media_items
- reports
- notifications
- location_presence / nearby_voice_signals

These additions are planning-only.

No table is created in this phase.

---

# 8. blocks

## Purpose

Stores blocking relationships between users or connection contexts.

Block is the strongest safety boundary in ANKION.

## Planned Columns

| Column          | Type direction | Required | Notes                         |
| --------------- | -------------- | -------: | ----------------------------- |
| id              | uuid           |      Yes | Block id                      |
| blocker_user_id | uuid           |      Yes | User who blocks               |
| blocked_user_id | uuid           |      Yes | User being blocked            |
| conversation_id | uuid           |    Later | Optional context              |
| reason_category | text           |       No | Optional safe reason category |
| created_at      | timestamptz    |      Yes | Created timestamp             |
| revoked_at      | timestamptz    |       No | Null means active             |

## Primary Key

- id

## Foreign Keys

Future:

- blocker_user_id references auth.users.id
- blocked_user_id references auth.users.id
- conversation_id references conversations.id if context-scoped block is needed

## Indexes

Recommended later:

- index on blocker_user_id
- index on blocked_user_id
- index on conversation_id
- partial index for active blocks where revoked_at is null
- unique active block constraint for blocker_user_id + blocked_user_id where revoked_at is null

## RLS Sensitivity

Very high.

Block state affects:

- profile visibility
- reveal requests
- profile visibility grants
- voice messages
- follow relationships
- media access
- signed URL access
- future calls
- notifications

## Notes

Block must override reveal grants.

If a block exists, an existing profile visibility grant must not be usable.

If a block is revoked, profile visibility must not automatically reopen. Safe return state should be anonymous/profile hidden unless the owner explicitly grants visibility again.

---

# 9. follows

## Purpose

Stores follow relationships for anonymous identities or instant profiles.

Follow must not target or reveal real profiles by default.

## Planned Columns

| Column                    | Type direction | Required | Notes                                |
| ------------------------- | -------------- | -------: | ------------------------------------ |
| id                        | uuid           |      Yes | Follow id                            |
| follower_user_id          | uuid           |      Yes | Auth user who follows                |
| follower_anonymous_id     | uuid           |    Later | Optional follower anonymous identity |
| target_anonymous_id       | uuid           |      Yes | Followed anonymous identity          |
| target_instant_profile_id | uuid           |    Later | Optional future instant profile id   |
| status                    | follow_status  |      Yes | active / muted / removed             |
| created_at                | timestamptz    |      Yes | Created timestamp                    |
| updated_at                | timestamptz    |      Yes | Updated timestamp                    |
| revoked_at                | timestamptz    |       No | Null means active                    |

## Primary Key

- id

## Foreign Keys

Future:

- follower_user_id references auth.users.id
- follower_anonymous_id references anonymous_identities.id
- target_anonymous_id references anonymous_identities.id

## Enum Draft

follow_status:

- active
- muted
- removed

## Indexes

Recommended later:

- index on follower_user_id
- index on target_anonymous_id
- partial index for active follows where revoked_at is null
- unique active follow constraint for follower_user_id + target_anonymous_id where revoked_at is null

## RLS Sensitivity

High.

Follow must not expose:

- real profile owner
- owner_user_id
- auth user id of target
- private profile fields
- profile visibility grant internals

## Notes

Follow does not create reveal permission.

Follow does not create profile visibility grant.

Follow does not bypass block.

Follow may later affect Feed or Discover ranking, badges, or notifications only through safe anonymous payloads.

---

# 10. voice_usage_daily

## Purpose

Tracks server-enforced daily voice message usage.

This supports the rule:

- maximum 7 voice messages per user per day

## Planned Columns

| Column      | Type direction | Required | Notes                   |
| ----------- | -------------- | -------: | ----------------------- |
| id          | uuid           |      Yes | Usage row id            |
| user_id     | uuid           |      Yes | Sender auth user        |
| usage_date  | date           |      Yes | Server-side date bucket |
| sent_count  | integer        |      Yes | Server-maintained count |
| limit_count | integer        |      Yes | Default 7               |
| created_at  | timestamptz    |      Yes | Created timestamp       |
| updated_at  | timestamptz    |      Yes | Updated timestamp       |

## Primary Key

- id

## Foreign Keys

Future:

- user_id references auth.users.id

## Indexes

Recommended later:

- unique index on user_id + usage_date
- index on usage_date

## RLS Sensitivity

High.

Client may receive only safe remaining-count DTOs.

Client must not directly edit usage counters.

## Notes

This table must be controlled by server/RPC/Edge Function logic.

Frontend limit checks are not source of truth.

---

# 11. voice_usage_connection_daily

## Purpose

Tracks server-enforced daily voice message usage per recipient/connection.

This supports the rule:

- maximum 3 voice messages to the same recipient per day

## Planned Columns

| Column            | Type direction | Required | Notes                   |
| ----------------- | -------------- | -------: | ----------------------- |
| id                | uuid           |      Yes | Usage row id            |
| sender_user_id    | uuid           |      Yes | Sender auth user        |
| recipient_user_id | uuid           |      Yes | Recipient auth user     |
| conversation_id   | uuid           |      Yes | Conversation context    |
| usage_date        | date           |      Yes | Server-side date bucket |
| sent_count        | integer        |      Yes | Server-maintained count |
| limit_count       | integer        |      Yes | Default 3               |
| created_at        | timestamptz    |      Yes | Created timestamp       |
| updated_at        | timestamptz    |      Yes | Updated timestamp       |

## Primary Key

- id

## Foreign Keys

Future:

- sender_user_id references auth.users.id
- recipient_user_id references auth.users.id
- conversation_id references conversations.id

## Indexes

Recommended later:

- unique index on sender_user_id + recipient_user_id + usage_date
- index on conversation_id
- index on usage_date

## RLS Sensitivity

Very high.

Must not expose recipient_user_id or sender_user_id through unsafe frontend payloads.

## Notes

Frontend should only receive safe remaining limit state.

Backend must check block state before allowing voice send.

---

# 12. media_capture_intents

## Purpose

Stores capture-now upload intents for public instant media and future controlled media uploads.

This table supports anti-cheat and authenticity checks.

## Planned Columns

| Column                | Type direction        | Required | Notes                                           |
| --------------------- | --------------------- | -------: | ----------------------------------------------- |
| id                    | uuid                  |      Yes | Capture intent id                               |
| owner_user_id         | uuid                  |      Yes | Auth user creating intent                       |
| anonymous_identity_id | uuid                  |      Yes | Anonymous media owner                           |
| conversation_id       | uuid                  |       No | Optional private context                        |
| media_kind            | media_kind            |      Yes | photo / video / audio / voice                   |
| capture_surface       | capture_surface       |      Yes | feed / chat / profile / report                  |
| server_nonce          | text                  |      Yes | Short-lived server nonce                        |
| expected_hash         | text                  |    Later | Optional expected/final media hash              |
| status                | capture_intent_status |      Yes | created / used / expired / cancelled / rejected |
| expires_at            | timestamptz           |      Yes | Short lifetime                                  |
| created_at            | timestamptz           |      Yes | Created timestamp                               |
| used_at               | timestamptz           |       No | Set when upload is completed                    |

## Primary Key

- id

## Foreign Keys

Future:

- owner_user_id references auth.users.id
- anonymous_identity_id references anonymous_identities.id
- conversation_id references conversations.id

## Enum Draft

media_kind:

- photo
- video
- audio
- voice

capture_surface:

- feed
- chat
- profile
- report

capture_intent_status:

- created
- used
- expired
- cancelled
- rejected

## Indexes

Recommended later:

- index on owner_user_id
- index on anonymous_identity_id
- index on status
- index on expires_at
- unique/anti-replay constraints around server_nonce if needed

## RLS Sensitivity

Very high.

Client can request an intent but must not be trusted as source of truth.

## Notes

Public Feed/discovery media must not be gallery upload.

Capture intent is required for future public instant media.

Future validation should include:

- server nonce
- short-lived upload permission
- media hash
- replay prevention
- storage path control
- block-aware access checks

---

# 13. media_items

## Purpose

Stores safe metadata for uploaded media.

This separates media metadata from raw storage access.

## Planned Columns

| Column                | Type direction         | Required | Notes                                               |
| --------------------- | ---------------------- | -------: | --------------------------------------------------- |
| id                    | uuid                   |      Yes | Media item id                                       |
| owner_user_id         | uuid                   |      Yes | Sensitive owner reference                           |
| anonymous_identity_id | uuid                   |       No | Anonymous owner for public-safe surfaces            |
| conversation_id       | uuid                   |       No | Private chat context                                |
| feed_item_id          | uuid                   |       No | Feed item context                                   |
| capture_intent_id     | uuid                   |       No | Related capture intent                              |
| media_kind            | media_kind             |      Yes | photo / video / audio / voice                       |
| storage_bucket        | text                   |    Later | Internal only                                       |
| storage_path          | text                   |    Later | Internal only; not returned raw to frontend         |
| safe_media_ref        | text                   |    Later | Client-safe reference if needed                     |
| duration_seconds      | integer                |       No | Audio/video duration                                |
| hash                  | text                   |    Later | Media hash if used                                  |
| visibility_state      | media_visibility_state |      Yes | processing / available / hidden / removed / expired |
| created_at            | timestamptz            |      Yes | Created timestamp                                   |
| updated_at            | timestamptz            |      Yes | Updated timestamp                                   |
| expires_at            | timestamptz            |       No | Optional expiry                                     |

## Primary Key

- id

## Foreign Keys

Future:

- owner_user_id references auth.users.id
- anonymous_identity_id references anonymous_identities.id
- conversation_id references conversations.id
- feed_item_id references feed_items.id
- capture_intent_id references media_capture_intents.id

## Enum Draft

media_visibility_state:

- processing
- available
- hidden
- removed
- expired

## Indexes

Recommended later:

- index on owner_user_id
- index on anonymous_identity_id
- index on conversation_id
- index on feed_item_id
- index on capture_intent_id
- index on visibility_state
- index on created_at

## RLS Sensitivity

Very high.

Raw storage path must not be returned to frontend.

Public-safe DTOs may return a safe media reference or signed access result only after access checks.

## Notes

Media metadata must not bridge anonymous identity to real profile before reveal.

Block must disable media access where applicable.

Profile avatar access must respect profile visibility grants.

---

# 14. reports

## Purpose

Stores user safety reports.

Reports can target voice messages, media items, profiles, conversations, instant content, or users.

## Planned Columns

| Column           | Type direction | Required | Notes                                  |
| ---------------- | -------------- | -------: | -------------------------------------- |
| id               | uuid           |      Yes | Report id                              |
| reporter_user_id | uuid           |      Yes | User submitting report                 |
| reported_user_id | uuid           |       No | Sensitive target user if known         |
| conversation_id  | uuid           |       No | Optional context                       |
| voice_message_id | uuid           |       No | Optional target                        |
| media_item_id    | uuid           |       No | Optional target                        |
| feed_item_id     | uuid           |       No | Optional target                        |
| reason_category  | report_reason  |      Yes | Safe category                          |
| details          | text           |       No | Optional user text                     |
| status           | report_status  |      Yes | open / reviewed / actioned / dismissed |
| created_at       | timestamptz    |      Yes | Created timestamp                      |
| reviewed_at      | timestamptz    |       No | Moderation timestamp                   |

## Primary Key

- id

## Enum Draft

report_reason:

- inappropriate_content
- fake_profile_concern
- harassment_or_pressure
- unwanted_message
- other

report_status:

- open
- reviewed
- actioned
- dismissed

## RLS Sensitivity

Very high.

Reporter may see limited own report status.

Reported user must not see reporter identity.

Moderation/admin access must be server-controlled.

## Notes

Report data must not leak through notifications, public surfaces, or safe DTOs.

---

# 15. notifications

## Purpose

Stores safe notification events.

Notifications must not leak real identity before reveal.

## Planned Columns

| Column             | Type direction    | Required | Notes                              |
| ------------------ | ----------------- | -------: | ---------------------------------- |
| id                 | uuid              |      Yes | Notification id                    |
| recipient_user_id  | uuid              |      Yes | Receiver                           |
| actor_user_id      | uuid              |       No | Sensitive internal actor if needed |
| actor_anonymous_id | uuid              |       No | Safe actor context if allowed      |
| type               | notification_type |      Yes | Notification category              |
| safe_title         | text              |      Yes | Safe display title                 |
| safe_body          | text              |       No | Safe display body                  |
| route_target       | text              |       No | Safe route target only             |
| read_at            | timestamptz       |       No | Read timestamp                     |
| created_at         | timestamptz       |      Yes | Created timestamp                  |

## Primary Key

- id

## Enum Draft

notification_type:

- new_voice_message
- reveal_request_received
- reveal_request_response
- followed_identity_new_content
- content_report_update
- safety_notice

## RLS Sensitivity

High.

Notification payload must not reveal:

- real name before reveal
- clear avatar before reveal
- owner_user_id
- sender_user_id
- raw storage path
- private moderation fields

## Notes

Notifications should route to safe surfaces only.

If real profile visibility is needed, backend must verify active grant and no active block.

---

# 16. location_presence / nearby_voice_signals

## Purpose

Future-sensitive planning area for nearby anonymous voice discovery.

This is deferred and must not be implemented from this schema draft.

## Possible Future Direction

A future schema may include one of:

- location_presence
- nearby_voice_signals
- location_grid_cells
- ephemeral_nearby_voice_events

## Required Safety Rules

Location is sensitive data.

Future location logic must:

- avoid exact location exposure
- avoid real identity exposure
- avoid profile browsing by location
- use coarse buckets or grid logic where possible
- separate anonymous voice discovery from real profile identity
- prevent location from bypassing reveal
- prevent Plus from revealing real identity through location
- expire stale location signals
- respect block and safety settings

## RLS Sensitivity

Extremely high.

## Notes

Location remains deferred.

No location table, permission flow, backend implementation, or mobile runtime behavior is approved by this note.

---

## Phase 22A Relationship Additions

```txt
auth.users.id
  -> blocks.blocker_user_id
  -> blocks.blocked_user_id

anonymous_identities.id
  -> follows.target_anonymous_id

auth.users.id
  -> follows.follower_user_id

auth.users.id
  -> voice_usage_daily.user_id

auth.users.id
  -> voice_usage_connection_daily.sender_user_id
  -> voice_usage_connection_daily.recipient_user_id

conversations.id
  -> voice_usage_connection_daily.conversation_id

auth.users.id
  -> media_capture_intents.owner_user_id

anonymous_identities.id
  -> media_capture_intents.anonymous_identity_id

media_capture_intents.id
  -> media_items.capture_intent_id

anonymous_identities.id
  -> media_items.anonymous_identity_id

conversations.id
  -> media_items.conversation_id

feed_items.id
  -> media_items.feed_item_id

auth.users.id
  -> reports.reporter_user_id
  -> reports.reported_user_id

auth.users.id
  -> notifications.recipient_user_id
  -> notifications.actor_user_id

anonymous_identities.id
  -> notifications.actor_anonymous_id
```

---

## Phase 22A Readiness Decision

This schema draft is expanded, but it remains:

```txt
NOT READY FOR SQL
```

Reason:

The schema still needs final decisions on:

- exact nullable rules
- exact enum values
- duplicate conversation constraints
- duplicate active reveal request constraints
- active block constraints
- follow uniqueness constraints
- voice usage enforcement strategy
- media capture intent lifecycle
- media metadata and Storage path policy
- report visibility rules
- notification safe payload rules
- location privacy model
- safe DTO/view/RPC boundaries
- RLS table-by-table verification

Decision:

Do not create SQL, migrations, Supabase client, Auth implementation, RLS policies, Storage buckets, Storage policies, `.env` files, backend/API code, route behavior, or runtime behavior from Phase 22A.

Next correct planning phase:

Phase 22B — Expanded RLS Policy Matrix Update for Phase 22A schema additions.

## Phase 24E Schema Finalization Decision

Phase 24E finalizes documentation-level decisions for `profiles_private` and `anonymous_identities`. This is not SQL implementation and does not create migration files.

Final decision:

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
```

This means the next phase may plan the first narrow SQL migration slice for these two entities. It does not authorize executable SQL, migrations, RLS policies, Auth/session implementation, Supabase client implementation, Storage, backend/API, route data binding, or runtime product behavior.

### Field Classification Model

`FIELD_CLASS` values:

- `SERVER_ONLY`
- `OWNER_ONLY`
- `REVEAL_CONTEXT_ONLY`
- `ANONYMOUS_SAFE_PREVIEW`
- `AGGREGATE_SAFE`
- `PROHIBITED`

Default rule: if field classification is unclear, classify as `SERVER_ONLY`.

### profiles_private Final Documentation-Level Fields

V1 planned fields:

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

V1 prohibited fields:

- `email`
- `phone`
- `legal_name`
- `exact_date_of_birth`
- `precise_location`
- `public_username`
- `searchable_handle`
- `global_profile_slug`
- client-visible `anonymous_identity_id`
- `raw_verification_document`
- `device_id`
- `ip_address`

Classification:

- `id`: `SERVER_ONLY` by default; not a public profile id.
- `owner_user_id`: `SERVER_ONLY`.
- `chosen_display_name`: `OWNER_ONLY`; `REVEAL_CONTEXT_ONLY` after owner-approved reveal.
- `approved_profile_photo_asset_id`: `SERVER_ONLY` raw reference; only safe avatar/photo DTO may become `REVEAL_CONTEXT_ONLY`.
- `short_bio`: `OWNER_ONLY`; `REVEAL_CONTEXT_ONLY` after owner-approved reveal.
- `age_band`: `OWNER_ONLY`; `REVEAL_CONTEXT_ONLY` only if approved for the reveal DTO.
- `profile_visibility_default`: `OWNER_ONLY`.
- `profile_status`: `OWNER_ONLY` or `SERVER_ONLY` depending on final RLS; never public.
- `safety_state`: `SERVER_ONLY`.
- `verification_summary_state`: `OWNER_ONLY`; may become `REVEAL_CONTEXT_ONLY` only as a safe badge summary later.
- timestamps and soft delete fields: `SERVER_ONLY` by default unless owner-safe DTO explicitly includes them later.

### anonymous_identities Final Documentation-Level Fields

V1 planned fields:

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

Client-never-visible fields for non-owner previews:

- `owner_user_id`
- `profile_private_id`
- `auth_user_id`
- `email`
- `phone`
- real name fields
- private profile photo fields
- verification state details
- moderation internals
- device/IP/security metadata

Classification:

- `id`: `ANONYMOUS_SAFE_PREVIEW` only as opaque anonymous context id; never enough to reach real profile.
- `owner_user_id`: `SERVER_ONLY`.
- `anonymous_label`: `ANONYMOUS_SAFE_PREVIEW`.
- `anonymous_visual_seed`: `ANONYMOUS_SAFE_PREVIEW`.
- `voice_presence_label`: `ANONYMOUS_SAFE_PREVIEW`.
- `status`: raw status is `SERVER_ONLY`; safe generic availability may be `ANONYMOUS_SAFE_PREVIEW` later.
- `safety_state`: `SERVER_ONLY`.
- `rotation_state` and `rotated_at`: `SERVER_ONLY` by default.
- timestamps and soft delete fields: `SERVER_ONLY` by default.

### Relationship Decisions

`auth.users -> profiles_private`:

- One auth user should have exactly one private profile.
- Future SQL should enforce one-user-one-private-profile through `profiles_private.owner_user_id` uniqueness.
- `profiles_private.owner_user_id` is internal ownership linkage and must not be exposed to non-owner clients.

`auth.users -> anonymous_identities`:

- V1 safest default: one active anonymous identity per auth user.
- Future rotation may preserve historical anonymous identity rows, but only one active identity should be used for normal app-facing surfaces unless a later rotation phase explicitly changes this.
- Ownership linkage is internal only.

`anonymous_identities -> profiles_private`:

- No public direct relation.
- No client-visible join.
- No public profile lookup.
- No anonymous identity to real profile correlation outside approved connection/context.
- V1 should not add `profile_private_id` to `anonymous_identities` as a client-visible bridge.
- If internal resolution is required later, it must happen only through RLS/server-safe boundaries, safe DTO/view/RPC, and approved reveal context.

### Reveal Context Visibility

There is no global public profile view.

After owner-approved reveal, only the specific connection/context may receive a safe profile DTO containing approved fields such as:

- chosen display name
- approved profile photo/avatar DTO
- short bio
- safe age band, if approved
- safe trust/student/verification badge summary, if approved later
- connection-safe profile metadata

Reveal must not transform anonymous identity into a public real profile.

### Safe DTO / View / RPC Requirement

Safe DTO/view/RPC boundaries are required before any non-owner client access.

Raw `profiles_private` table reads by other users are NO-GO.

Raw `anonymous_identities` reads must be filtered through safe anonymous preview boundaries before client use.

Client access is DTO-first, not raw-row-first.

### Phase 24E Risk Gates

1. Global profile risk: global public profile remains NO-GO.
2. Anonymous-to-real correlation risk: any client-visible join path is NO-GO.
3. Reveal scope risk: reveal must be connection/context-scoped.
4. Field leak risk: every field must be classified before SQL.
5. RLS readiness risk: SQL is not ready for implementation unless deny tests are defined.
6. DTO/RPC risk: non-owner profile access must go through safe DTO/view/RPC.
7. Service role key risk: service role key remains backend-only and never client-facing.
8. Future media risk: voice/photo/video Storage remains blocked until Storage/RLS/privacy boundary planning is implementation-ready.

### Remaining Blockers Before SQL Implementation

- Enum values need final SQL names and rollback notes.
- RLS allow/deny tests are not execution-ready.
- Safe DTO/view/RPC shapes are not implemented or tested.
- Auth/session behavior is still NOT READY.
- Storage/media privacy remains blocked.
- No Supabase SDK/client runtime should bind to these tables yet.

## Phase 24I SQL Specification Cross-Reference

Phase 24I adds a non-executable SQL script specification for the first future migration slice in `docs/architecture/SQL_MIGRATION_SLICING_PLAN.md`.

The specification preserves the Phase 24E schema decisions for:

- `profiles_private`
- `anonymous_identities`

Phase 24I does not change the planned fields, does not add executable SQL, does not create migrations, and does not authorize RLS/Auth/Storage/Supabase runtime implementation.
