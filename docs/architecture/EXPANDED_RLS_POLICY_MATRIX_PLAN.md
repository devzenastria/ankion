# Expanded RLS Policy Matrix Plan

## Phase

Phase 18B â€” Documentation-only Expanded RLS Policy Matrix Plan

## Purpose

This document defines the expanded Row Level Security policy behavior for ankion before any Supabase implementation begins.

The goal is to protect the core rule:

Real profile identity must never leak through anonymous interaction surfaces.

This phase is documentation-only.

No SQL is written in Phase 18B.

No Supabase implementation is included in Phase 18B.

---

## Current Foundation

Completed planning:

- Phase 17A â€” Data Model + RLS Foundation Plan
- Phase 17B â€” Anonymous Identity / Real Profile Separation Plan
- Phase 17C â€” Reveal Request Security Model
- Phase 17D â€” Voice / Media Storage Boundary Plan
- Phase 17E â€” Data / RLS / Storage Foundation Audit + Docs Alignment
- Phase 18A â€” Supabase Implementation Readiness Checklist

Current readiness verdict:

Supabase implementation is not ready yet.

RLS behavior must be expanded before SQL, migrations, Auth, Storage, or Supabase client work begins.

---

## Core RLS Rule

Default access should be deny-by-default.

Every table must answer:

- Who can SELECT?
- Who can INSERT?
- Who can UPDATE?
- Who can DELETE?
- What is owner-only?
- What is participant-only?
- What is approved-viewer-only?
- What is public-safe?
- What must never be exposed?

---

## Planned Tables

Initial future table set:

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

Stores real profile data.

This is the most sensitive identity table.

## Data sensitivity

High.

Possible fields:

- user_id
- display_name
- bio
- avatar_path
- profile_details
- visibility_settings
- created_at
- updated_at

## SELECT policy direction

Owner can select own profile.

Approved viewer can select limited profile fields only if an active profile visibility grant exists.

No public select.

No anonymous select.

No participant select unless approved grant exists.

## INSERT policy direction

Authenticated user can create own profile only.

System may create profile during onboarding later.

No other user can insert profile for another user.

## UPDATE policy direction

Owner can update own profile.

No approved viewer update.

No participant update.

No public update.

## DELETE policy direction

Owner/account lifecycle only.

Prefer soft delete or account lifecycle handling later.

No public delete.

## Approved viewer rule

Approved viewer can access only when:

- active profile_visibility_grants row exists
- viewer_user_id matches auth user
- profile_owner_user_id matches profile owner
- revoked_at is null

## Public-safe fields

None by default.

Future safe profile view may expose limited fields only after grant.

## Must never expose

- auth email
- owner_user_id to unrelated users
- private avatar path before grant
- private profile row before grant
- profile through anonymous identity join

## Deny-by-default rule

If no owner match and no active visibility grant, deny.

---

# 2. anonymous_identities

## Purpose

Stores anonymous interaction identity.

Used by Discover, Feed, Chat, voice, and media surfaces.

## Data sensitivity

Medium-high.

The anonymous identity itself can be visible in safe form.

The owner linkage is highly sensitive.

Possible fields:

- id
- owner_user_id
- safe_label
- status
- created_at
- updated_at

## SELECT policy direction

Owner can select own full anonymous identity.

Non-owner can select only safe fields through safe view or restricted policy.

Public-safe access may be allowed later only for safe fields.

## INSERT policy direction

Authenticated owner can create own anonymous identity.

System-controlled creation may be preferred later.

No user can create anonymous identity for another owner.

## UPDATE policy direction

Owner can update own safe anonymous identity settings.

System may update moderation/status fields later.

Non-owner cannot update.

## DELETE policy direction

Owner or system only.

Prefer deactivation over hard delete.

## Public-safe fields

Possible safe fields:

- anonymous_identity_id
- safe_label
- generic status
- safe voice/media metadata placeholder

## Must never expose to non-owner

- owner_user_id
- linked real profile id
- auth user id
- email
- private profile fields
- unsafe storage paths

## Deny-by-default rule

If field can identify owner, deny for non-owner.

---

# 3. conversations

## Purpose

Stores chat container between anonymous interaction participants.

## Data sensitivity

High.

Conversation membership can reveal relationship graph.

Possible fields:

- id
- participant_a_anonymous_id
- participant_b_anonymous_id
- created_at
- last_activity_at

## SELECT policy direction

Only conversation participants can select.

Participant check should be based on authenticated user owning one of the participant anonymous identities.

No public select.

No unrelated authenticated select.

## INSERT policy direction

Authenticated user can create conversation only if:

- they own one participant anonymous identity
- target anonymous identity is valid
- product rules allow creating conversation
- duplicate conversation rules are respected later

## UPDATE policy direction

Participants may update limited conversation metadata later.

System may update last_activity_at.

No non-participant update.

## DELETE policy direction

No client hard delete initially.

Future options:

- participant archive
- soft delete
- system cleanup

## Participant access rule

User is participant if:

- auth.uid() owns participant_a_anonymous_id
- or auth.uid() owns participant_b_anonymous_id

## Public-safe fields

None by default.

## Must never expose

- participant owner_user_id
- real profile behind participant
- conversation membership publicly
- conversation messages to non-participants

## Deny-by-default rule

If user does not own one participant anonymous identity, deny.

---

# 4. voice_messages

## Purpose

Stores voice message metadata.

Actual audio files are handled by Storage later.

## Data sensitivity

High.

Voice content and metadata may reveal sensitive interaction.

Possible fields:

- id
- conversation_id
- sender_anonymous_id
- audio_path
- duration_seconds
- created_at
- expires_at

## SELECT policy direction

Conversation participants can select voice message metadata.

Sender can select own sent messages.

Non-participants cannot select.

No public select.

## INSERT policy direction

Sender can insert only if:

- authenticated
- owns sender_anonymous_id
- sender_anonymous_id is participant in conversation
- duration_seconds is within allowed limit later
- send-limit rules pass later

## UPDATE policy direction

Sender may update limited metadata only if needed.

System may update processing status later.

No participant update unless sender.

No public update.

## DELETE policy direction

Sender may request deletion later.

System cleanup may delete expired messages.

No hard delete policy until lifecycle plan is defined.

## Participant access rule

User can read if:

- user owns one conversation participant anonymous identity
- conversation_id matches voice message conversation

## Public-safe fields

None by default.

## Must never expose

- audio_path to non-participants
- storage path containing real identity
- sender owner_user_id
- real profile through sender identity
- voice files through public URLs

## Deny-by-default rule

If user is not conversation participant, deny.

---

# 5. reveal_requests

## Purpose

Stores profile visibility request events.

A request does not grant profile visibility.

## Data sensitivity

Very high.

Reveal requests can expose relationship and identity intent if mishandled.

Possible fields:

- id
- conversation_id
- requester_user_id
- requester_anonymous_id
- profile_owner_user_id
- target_anonymous_id
- state
- created_at
- reviewed_at

## SELECT policy direction

Requester can select limited request fields.

Owner can select requests targeting their anonymous identity.

No public select.

No unrelated authenticated select.

Requester must not receive real profile data through request select.

## INSERT policy direction

Requester can insert only if:

- authenticated
- participant in conversation
- target anonymous identity belongs to conversation context
- duplicate active request does not already exist
- request does not target self unless product later allows

## UPDATE policy direction

Owner can update review state only if:

- owner owns target_anonymous_id
- request targets owner
- request is pending

Requester may cancel own request later if allowed.

No public update.

## DELETE policy direction

No client hard delete initially.

Prefer state transitions:

- pending
- approved
- kept_private
- expired
- cancelled

## Requester limited fields

Requester may see:

- request id
- generic state
- created_at
- conversation reference
- calm user-facing status

## Owner scoped fields

Owner may see:

- request id
- safe requester anonymous identity
- conversation reference
- created_at
- state

## Must never expose before grant

- owner real name
- owner private avatar
- owner private bio
- owner email
- private profile row
- unsafe owner_user_id linkage
- real profile through target_anonymous_id

## Deny-by-default rule

If user is neither requester nor target owner, deny.

---

# 6. profile_visibility_grants

## Purpose

Stores approved profile visibility.

This table controls real profile access.

## Data sensitivity

Very high.

Possible fields:

- id
- profile_owner_user_id
- viewer_user_id
- conversation_id
- reveal_request_id
- created_at
- revoked_at

## SELECT policy direction

Owner can select grants they created or own.

Approved viewer can select their active grant.

No public select.

No unrelated user select.

## INSERT policy direction

Owner can insert grant only if:

- owner owns target profile
- owner owns target anonymous identity
- reveal request exists
- reveal request targets owner
- viewer is valid requester
- request is eligible for approval

## UPDATE policy direction

Owner can revoke grant.

System may update expiry/revocation later.

Viewer cannot update.

## DELETE policy direction

No hard delete initially.

Use revoked_at for revocation.

## Approved viewer access rule

Viewer can use grant only if:

- viewer_user_id = auth.uid()
- revoked_at is null
- grant links to requested profile owner
- grant context is valid

## Public-safe fields

None by default.

## Must never expose

- global graph of who revealed to whom
- grants to unrelated users
- profile owner identity to unrelated users
- viewer identity to unrelated users

## Deny-by-default rule

If user is not owner or approved viewer, deny.

---

# 7. feed_items

## Purpose

Stores anonymous feed media/voice moment records.

## Data sensitivity

Medium-high.

Feed can be more public later, but must not expose real profile identity.

Possible fields:

- id
- anonymous_identity_id
- media_type
- media_path
- caption
- created_at
- visibility_state

## SELECT policy direction

Public-safe feed select may be allowed later only for safe fields.

Owner can select own full feed item metadata.

No private owner linkage exposed.

No real profile join.

## INSERT policy direction

Owner can insert only using own anonymous identity.

Upload behavior must not exist until storage policy is ready.

## UPDATE policy direction

Owner can update own feed item.

System may moderate/update status later.

No public update.

## DELETE policy direction

Owner can delete or deactivate own feed item later.

System moderation can remove later.

## Public-safe fields

Possible safe fields:

- feed_item_id
- anonymous_identity_id
- media_type
- safe media reference
- safe caption
- created_at

## Must never expose

- owner_user_id
- real profile id
- uploader email
- private avatar
- private profile data
- storage path with owner identity
- feed item joined to profiles_private

## Deny-by-default rule

If field reveals real owner identity, deny.

---

## Cross-Table Rules

### Anonymous to profile join

Never allow direct client-readable join:

anonymous_identities â†’ profiles_private

unless access is controlled by active visibility grant.

### Conversation to profile join

Never allow conversation participants to read real profile data unless grant exists.

### Feed to profile join

Feed must not expose uploader real profile by default.

### Voice to profile join

Voice sender identity must remain anonymous unless visibility grant exists.

### Reveal request to profile join

Pending reveal request must not expose real profile.

---

## Global RLS Matrix Summary

| Table                     | Owner                  | Participant      | Approved Viewer          | Public                 | Default     |
| ------------------------- | ---------------------- | ---------------- | ------------------------ | ---------------------- | ----------- |
| profiles_private          | Full own access        | No               | Limited after grant      | No                     | Deny        |
| anonymous_identities      | Full own access        | Safe fields only | Safe fields only         | Safe fields only later | Deny unsafe |
| conversations             | If participant         | If participant   | No special access        | No                     | Deny        |
| voice_messages            | Sender/participant     | If participant   | No special access        | No                     | Deny        |
| reveal_requests           | Requester/owner scoped | Context scoped   | No direct profile access | No                     | Deny        |
| profile_visibility_grants | Owner/viewer scoped    | No               | Viewer active grant      | No                     | Deny        |
| feed_items                | Own full access        | No               | No special access        | Safe fields later      | Deny unsafe |

---

## Deny-By-Default Checklist

Every future policy should start from deny.

Then allow only:

1. Owner access
2. Conversation participant access
3. Approved viewer access
4. Safe public field access
5. System/service role access where required

If the policy cannot be explained clearly, do not implement it.

---

## Policy Test Checklist

Future RLS tests should confirm:

- Owner can read own private profile
- Non-owner cannot read private profile
- Pending requester cannot read private profile
- Approved viewer can read granted profile
- Revoked viewer cannot read profile
- Non-owner cannot read owner_user_id from anonymous identity
- Non-participant cannot read conversation
- Participant can read conversation
- Non-participant cannot read voice message
- Requester can create reveal request only in valid context
- Owner can review only own reveal requests
- Public feed does not expose real profile owner
- Storage paths do not expose identity

---

## Not Implemented In This Phase

This phase does not create:

- SQL policies
- Supabase files
- migrations
- storage buckets
- backend code
- API routes
- client Supabase integration
- auth code
- package changes
- UI changes
- mock data

---

## Acceptance Criteria For Phase 18B

Phase 18B is complete when:

- This document exists.
- No SQL is written.
- No migrations are created.
- No Supabase files are added.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- Table-by-table RLS behavior is documented.
- Deny-by-default rules are documented.
- Policy test checklist is documented.
- No real behavior is introduced.

---

## Current Decision

Do not implement RLS yet.

Next recommended phase:

Phase 18C â€” Auth Foundation Plan

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

## Phase 20D Schema Readiness Review Note

Phase 20D confirms the RLS matrix remains planning-only while finalized schema readiness is NOT READY.

RLS policy verification cannot be marked ready until final schema decisions close table columns, enum states, constraints, indexes, grant/revoke lifecycle, storage path semantics, and public-safe feed visibility behavior.

## Phase 20E RLS Verification Readiness Review Note

Phase 20E reviewed whether this matrix is ready for future RLS policy verification.

Gate status:

```txt
NOT READY
```

Review result:

- This matrix remains a useful planning foundation, but it is not verification-ready.
- Phase 20D finalized schema readiness is still NOT READY and blocks real RLS implementation.
- Table-by-table verification must explicitly cover select, insert, update, and delete allow/deny expectations for `profiles_private`, `anonymous_identities`, `conversations`, `voice_messages`, `reveal_requests`, `profile_visibility_grants`, `feed_items`, and future storage/media metadata boundaries.
- Private profile data must never be reachable from anonymous, public, discover, feed, or chat queries.
- `owner_user_id` and private profile fields must not leak through public-safe surfaces.
- Reveal grants must be required before real profile visibility is available.
- Broad select policies are not acceptable.

Unresolved verification blockers:

- schema not finalized
- exact ownership fields unclear
- participant access rules need final constraints
- reveal grant lifecycle checks need final rules
- feed public-safe visibility rules remain unresolved
- storage/media metadata privacy rules remain unresolved
- denied-operation cases are not complete enough
- future test/audit cases are not complete enough
- safe view/RPC boundaries are not finalized

Decision:

Do not create RLS SQL, policies, policy files, migrations, safe views, RPCs, or client queries from this plan yet.

## Phase 20F Storage RLS Dependency Note

Phase 20F confirms Storage privacy readiness is NOT READY and remains dependent on future RLS verification.

Future RLS verification must cover media metadata access for voice messages, feed media, profile media, reveal-grant-dependent avatar access, public-safe feed reads, denied unrelated-user reads, and prevention of anonymous-to-real-profile leakage through storage metadata.

No broad select policy may expose raw storage paths or owner identifiers.

## Phase 20G Auth RLS Dependency Note

Phase 20G confirms RLS verification remains dependent on final Auth flow boundaries.

Future RLS verification must know exactly how authenticated users map to private profiles, anonymous identities, conversation participation, voice/media sender ownership, reveal request requester/owner access, visibility grant access, and account deletion/deactivation states before policies can be verified.

## Phase 20H RLS Migration Safety Note

Phase 20H confirms migration rollback/check strategy is PLANNED while RLS policy implementation remains BLOCKED / NO-GO.

Future RLS migrations must include explicit allow/deny verification, rollback notes, failed migration handling, and post-migration leak checks before client access. Broad policy changes, public-safe reads, or RLS weakening require explicit separate review.

## Phase 20J RLS Client Boundary Note

Phase 20J confirms client integration boundary is REVIEWED / PLANNED while RLS implementation remains BLOCKED / NO-GO.

Future client queries must be mapped to explicit RLS policy coverage before implementation. Discover, Feed, Chat, Profile, and Reveal Requests must not directly read unsafe/private tables, and real profile visibility must remain dependent on owner-approved reveal grants.

## Phase 20K RLS Testing Audit Note

Phase 20K confirms testing / audit procedure is PLANNED while RLS implementation remains BLOCKED / NO-GO.

Future RLS tests must verify owner access, non-owner denial, anonymous identity separation, reveal grant controlled profile visibility, absent/revoked reveal denial, and prevention of Discover/Feed/Chat privacy bypass.

No RLS SQL, policies, test fixtures, package changes, or runtime behavior are authorized by this note.

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

RLS implementation remains blocked.

Supabase implementation remains:

```txt
NO-GO
```

## Phase 22B RLS Matrix Expansion Note

Phase 22B expands this RLS policy matrix with the Phase 22A schema additions.

This remains documentation-only.

This note does not authorize:

- SQL
- migrations
- RLS policy files
- Supabase implementation
- Supabase client integration
- Auth implementation
- Storage bucket creation
- Storage policy creation
- `.env` files
- backend/API logic
- route UI changes
- runtime behavior

Supabase implementation remains:

```txt
NO-GO
```

The purpose of this expansion is to define table-by-table RLS direction for:

- blocks
- follows
- voice_usage_daily
- voice_usage_connection_daily
- media_capture_intents
- media_items
- reports
- notifications
- location_presence / nearby_voice_signals

---

# 8. blocks

## Purpose

Stores active or revoked block relationships.

Block is stronger than reveal, follow, chat, media access, signed URL access, and future calls.

## SELECT policy direction

Allowed:

- blocker can see own active/revoked block rows
- blocked user may receive only safe blocked-state result through safe DTO/RPC if needed
- system/service role may read for enforcement

Denied:

- public select
- unrelated authenticated select
- relationship graph select
- raw block list exposure to non-participants

## INSERT policy direction

Allowed:

- authenticated user can block another user only through controlled action/RPC
- system may create block for safety enforcement if needed

Denied:

- anonymous/public insert
- insert on behalf of another blocker
- duplicate active block creation

## UPDATE policy direction

Allowed:

- blocker may revoke own block through controlled action/RPC
- system may update safety state

Denied:

- blocked user cannot revoke the blockerâ€™s block
- unrelated users cannot update
- public update denied

## DELETE policy direction

No client hard delete initially.

Use `revoked_at` for safe lifecycle tracking.

## Must never expose

- full block graph
- blocker_user_id / blocked_user_id to unrelated users
- moderation internals
- unsafe report/safety metadata

## Deny-by-default rule

If user is not blocker, blocked-context participant through safe RPC, or service role, deny.

---

# 9. follows

## Purpose

Stores follow relationships targeting anonymous identity or instant profile context.

Follow does not reveal real profile.

## SELECT policy direction

Allowed:

- follower can see own follow state
- target owner may receive safe aggregate/badge counts later if product-approved
- public-safe Feed/Discover may use safe followed-priority result without exposing real owner identity

Denied:

- public real follower graph
- target real profile identity lookup
- owner_user_id exposure
- unrelated user access to raw follows

## INSERT policy direction

Allowed:

- authenticated user may follow a target anonymous identity if no active block exists
- insert must target anonymous identity or approved instant profile layer, not real profile

Denied:

- follow real profile directly
- follow blocked user
- create follow that grants reveal visibility

## UPDATE policy direction

Allowed:

- follower can mute/remove own follow
- system may update status for safety/moderation

Denied:

- target cannot edit followerâ€™s follow row
- unrelated update denied

## DELETE policy direction

Prefer `revoked_at` or status transition instead of hard delete.

## Must never expose

- target owner_user_id
- real profile fields
- private profile id
- reveal grant internals
- block internals

## Deny-by-default rule

Follow access is scoped to follower, safe aggregate, or safe anonymous DTO only.

---

# 10. voice_usage_daily

## Purpose

Tracks backend-enforced daily voice message usage.

Supports maximum 7 voice messages per user per day.

## SELECT policy direction

Allowed:

- owner may receive safe remaining-count DTO
- server/RPC may read full counters for enforcement

Denied:

- public select
- unrelated user select
- raw quota table exposure to client surfaces

## INSERT policy direction

Client should not directly insert.

Allowed only through server/RPC/Edge Function during voice send.

## UPDATE policy direction

Client should not directly update.

Allowed only through server/RPC/Edge Function after limit check passes.

## DELETE policy direction

No client delete.

System cleanup may archive/delete old usage rows later.

## Must never expose

- raw quota internals to other users
- internal enforcement fields
- unrelated user_id

## Deny-by-default rule

Direct client table access should be denied or heavily restricted. Prefer safe RPC.

---

# 11. voice_usage_connection_daily

## Purpose

Tracks backend-enforced per-recipient daily voice usage.

Supports maximum 3 voice messages to the same recipient per day.

## SELECT policy direction

Allowed:

- sender may receive safe remaining-count DTO for current conversation
- server/RPC may read full counters for enforcement

Denied:

- public select
- unrelated participant select
- raw sender_user_id / recipient_user_id exposure through UI
- conversation graph inference

## INSERT policy direction

Client should not directly insert.

Allowed only through server/RPC/Edge Function during voice send.

## UPDATE policy direction

Client should not directly update.

Allowed only through server/RPC/Edge Function after block, participant, and limit checks pass.

## DELETE policy direction

No client delete.

System cleanup may archive/delete old usage rows later.

## Must never expose

- recipient_user_id to unsafe frontend payload
- sender_user_id to unsafe frontend payload
- raw daily usage graph
- internal quota rows

## Deny-by-default rule

Voice usage enforcement must be server-owned. Frontend receives only safe remaining-count result.

---

# 12. media_capture_intents

## Purpose

Stores capture-now media upload intents.

Supports public instant media authenticity with nonce, expiry, hash, and replay protection.

## SELECT policy direction

Allowed:

- owner may see own active intent in limited form
- server/RPC may read full intent for upload validation

Denied:

- public select
- unrelated authenticated select
- raw nonce discovery by other users
- historical intent browsing

## INSERT policy direction

Allowed:

- authenticated owner may request a new intent through controlled RPC
- server creates nonce and expiry

Denied:

- direct arbitrary client insert with trusted nonce/hash
- intent creation for another user
- intent creation if block/safety rules prevent media action

## UPDATE policy direction

Allowed:

- server/RPC may mark intent as used, expired, cancelled, or rejected
- owner may cancel own unused intent if supported later

Denied:

- client self-marking as used without upload verification
- unrelated update

## DELETE policy direction

No client hard delete.

Use status transitions and expiry.

## Must never expose

- server_nonce to unrelated users
- owner_user_id to public surfaces
- raw storage path
- validation internals
- replay/security fields

## Deny-by-default rule

Intent lifecycle is server-controlled. Client cannot be trusted as source of truth.

---

# 13. media_items

## Purpose

Stores media metadata separate from raw storage access.

Controls access to voice, public-safe feed media, private chat media, reports, and future profile media.

## SELECT policy direction

Allowed:

- owner may see own media metadata
- conversation participants may access private chat/voice media only in valid context
- public Feed may receive safe media reference only through safe DTO/RPC if visibility allows
- approved viewer may access profile media only if active visibility grant exists and no block exists
- system/service role may read for moderation/storage enforcement

Denied:

- raw public select on storage paths
- unrelated authenticated select
- media metadata that bridges anonymous identity to real profile
- access after active block where applicable

## INSERT policy direction

Allowed:

- server/RPC may create media row after valid capture intent or valid private upload flow
- owner may initiate upload only through approved flow

Denied:

- direct raw client insert with arbitrary storage path
- public media insert without capture intent
- insert for another owner
- insert that bypasses block or reveal rules

## UPDATE policy direction

Allowed:

- owner may update safe caption/visibility if product allows
- system may update processing, moderation, expiry, or removal state

Denied:

- unrelated update
- client update of storage path/hash/security fields
- public update

## DELETE policy direction

Prefer state transition:

- hidden
- removed
- expired

Hard delete may be system-controlled later.

## Must never expose

- storage_path
- storage_bucket internals
- owner_user_id to public surfaces
- private profile identity
- media hash/security internals
- moderation internals

## Deny-by-default rule

Media access must be mediated by safe DTO/RPC and Storage access checks.

---

# 14. reports

## Purpose

Stores user safety reports.

Reports may target user, conversation, voice, media, feed item, or profile context.

## SELECT policy direction

Allowed:

- reporter may see limited own report status
- moderation/system role may see full report
- safe user-facing status may be returned if needed

Denied:

- reported user seeing reporter identity
- public select
- unrelated authenticated select
- raw moderation internals to frontend

## INSERT policy direction

Allowed:

- authenticated user may create report for valid context
- report target must be one of allowed target types

Denied:

- anonymous/public insert
- report creation with forged reporter_user_id
- unrelated unsafe target injection

## UPDATE policy direction

Allowed:

- moderation/system role updates status
- reporter may not modify moderation decision fields

Denied:

- reported user update
- unrelated update
- public update

## DELETE policy direction

No client hard delete.

System retention policy later.

## Must never expose

- reporter_user_id to reported user
- private moderation notes
- internal safety scoring
- unrelated identity links

## Deny-by-default rule

Reports are private safety records. Only reporter-safe status and moderator/system access are allowed.

---

# 15. notifications

## Purpose

Stores safe notification events.

Notifications must not leak real identity before reveal.

## SELECT policy direction

Allowed:

- recipient can see own notifications
- system can create/read for delivery
- payload must already be safe for recipient context

Denied:

- public select
- unrelated user select
- notification graph browsing

## INSERT policy direction

Client should not directly insert general notifications.

Allowed:

- server/system/RPC creates notifications after safety checks

## UPDATE policy direction

Allowed:

- recipient may mark own notification as read
- system may update delivery state later

Denied:

- actor cannot edit recipient notification
- unrelated update
- public update

## DELETE policy direction

Recipient may hide/delete own notification later if product allows.

System cleanup may expire old notifications.

## Must never expose

- real name before reveal
- clear avatar before reveal
- owner_user_id
- sender_user_id
- raw storage path
- private moderation fields
- unsafe route target

## Deny-by-default rule

Recipient-only, safe payload only.

---

# 16. location_presence / nearby_voice_signals

## Purpose

Future-sensitive nearby anonymous voice discovery.

This remains deferred.

## SELECT policy direction

Not implementation-approved.

Future direction:

- user may receive coarse nearby anonymous signals only
- no exact location exposure
- no real profile exposure
- no user search by location
- block and safety settings must filter results

## INSERT policy direction

Not implementation-approved.

Future direction:

- location updates must require explicit permission
- precise location should not be stored unless separately approved
- ephemeral/coarse records preferred

## UPDATE policy direction

Not implementation-approved.

## DELETE policy direction

Not implementation-approved.

Future direction:

- stale signals expire automatically
- user can disable/remove presence

## Must never expose

- exact location
- real identity
- owner_user_id
- private profile
- location-to-profile bridge
- blocked user proximity
- persistent tracking graph

## Deny-by-default rule

Location remains NO-GO until separate privacy model, schema, RLS, storage/client boundary, and test plan exist.

---

## Phase 22B Global RLS Matrix Additions

| Table                                    | Owner                                                    | Participant                           | Approved Viewer                | Public                    | Default     |
| ---------------------------------------- | -------------------------------------------------------- | ------------------------------------- | ------------------------------ | ------------------------- | ----------- |
| blocks                                   | Blocker full own view; blocked safe state only if needed | Context-safe only                     | No special access              | No                        | Deny        |
| follows                                  | Follower own state                                       | No                                    | No special access              | Safe aggregate only later | Deny unsafe |
| voice_usage_daily                        | Safe remaining-count only                                | No                                    | No                             | No                        | Deny direct |
| voice_usage_connection_daily             | Safe remaining-count only                                | Current conversation safe DTO only    | No                             | No                        | Deny direct |
| media_capture_intents                    | Owner limited; server full                               | Context only if private flow requires | No                             | No                        | Deny        |
| media_items                              | Owner/context-safe                                       | Conversation participant if valid     | Profile media only after grant | Feed safe ref only later  | Deny unsafe |
| reports                                  | Reporter limited; system full                            | No                                    | No                             | No                        | Deny        |
| notifications                            | Recipient only                                           | No                                    | No                             | No                        | Deny        |
| location_presence / nearby_voice_signals | Deferred                                                 | Deferred                              | No                             | No                        | Deny        |

---

## Phase 22B Policy Test Additions

Future RLS tests must verify:

- active block disables profile visibility even with active grant
- active block disables new reveal request
- active block disables voice send
- active block disables follow
- active block disables media/signed URL access where applicable
- follow does not expose real profile
- follow does not create visibility grant
- follow cannot override block
- daily voice limit cannot be bypassed by client
- per-recipient voice limit cannot be bypassed by client
- media capture intent expires and cannot be reused
- public media cannot be uploaded without valid capture intent
- raw storage path is never returned to public/client DTO
- media metadata does not bridge anonymous identity to real profile
- reporter identity is not visible to reported user
- notifications do not leak real identity before reveal
- location/nearby voice features remain inaccessible until separately approved

---

## Phase 22B Readiness Decision

This RLS matrix is expanded, but it remains:

```txt
NOT READY FOR RLS SQL
```

Reason:

Future implementation still needs:

- final schema nullable rules
- final enum values
- exact ownership fields
- exact participant constraints
- exact block enforcement strategy
- exact follow uniqueness rules
- exact voice usage enforcement RPC/Edge Function strategy
- exact media capture intent lifecycle
- exact Storage path and signed URL policy
- exact safe DTO/view/RPC boundaries
- report moderation access rules
- notification payload rules
- location privacy model
- full RLS test plan

Decision:

Do not create RLS SQL, SQL migrations, Supabase client code, Auth implementation, Storage policies, `.env` files, backend/API code, route behavior, or runtime behavior from Phase 22B.

Next correct planning phase:

## Phase 22C â€” Storage / Media Capture Intent Boundary Update.

## Phase 24E RLS Gate For Private Profile And Anonymous Identity

Phase 24E clarifies the next RLS planning target for `profiles_private` and `anonymous_identities`.

Required deny tests before SQL/RLS implementation:

- unrelated authenticated user cannot select raw `profiles_private`.
- pending reveal requester cannot select real profile fields.
- approved viewer can receive only a safe reveal-context DTO for the specific connection/context.
- revoked grant, expired grant, or active block denies reveal-context profile access.
- public/anonymous preview cannot expose `owner_user_id`, `profile_private_id`, `auth_user_id`, private profile fields, real photo fields, or identity correlation fields.
- direct client-readable join from `anonymous_identities` to `profiles_private` remains NO-GO.

RLS implementation remains NOT READY until these tests and safe DTO/view/RPC boundaries are execution-ready.

## Phase 24F RLS Matrix Execution Plan For Private Profile And Anonymous Identity

Phase 24F is documentation/planning-only. It does not create executable SQL, migrations, RLS policies, Supabase runtime code, Auth/session handling, Storage policies, backend/API logic, package changes, route data binding, or runtime behavior.

Phase 24F decision:

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
NOT READY FOR EXECUTABLE SQL/RLS IMPLEMENTATION
```

### Phase 24F RLS Vocabulary

Use these exact planning values:

- `ALLOW`: allowed direct action in future RLS planning.
- `DENY`: explicitly forbidden.
- `OWNER_ONLY`: allowed only for the owning authenticated user.
- `DTO_ONLY`: raw table access is forbidden; access may only happen through a safe DTO/view/RPC boundary.
- `SERVER_ONLY`: client must never access directly; backend/service role only when explicitly approved in a later phase.
- `FUTURE_RPC_ONLY`: not allowed as raw table access; may be allowed later only through a narrow RPC after separate approval.
- `NOT_READY`: decision cannot be implemented yet because required Auth/RLS/SQL/backend boundary is not ready.

### Phase 24F Field Classification Model

`FIELD_CLASS` values remain:

- `SERVER_ONLY`
- `OWNER_ONLY`
- `REVEAL_CONTEXT_ONLY`
- `ANONYMOUS_SAFE_PREVIEW`
- `AGGREGATE_SAFE`
- `PROHIBITED`

Default: if field classification is unclear, classify it as `SERVER_ONLY`.

`profiles_private` remains owner-only by default. `anonymous_identities` may support safe anonymous previews, but only through DTO/view/RPC surfaces that remove owner/auth/private-profile linkage.

### profiles_private RLS Matrix

Key rule: no non-owner raw select is allowed. Reveal does not unlock raw table access. Reveal only permits connection/context-scoped safe DTO output.

| Role | select_raw | insert | update | delete_or_soft_delete | owner_profile_dto | reveal_profile_dto |
| --- | --- | --- | --- | --- | --- | --- |
| unauthenticated | DENY | DENY | DENY | DENY | DENY | DENY |
| owner | OWNER_ONLY | OWNER_ONLY | OWNER_ONLY | OWNER_ONLY / soft delete only | OWNER_ONLY | OWNER_ONLY or not needed |
| other_authenticated_user | DENY | DENY | DENY | DENY | DENY | DENY |
| connected_without_reveal | DENY | DENY | DENY | DENY | DENY | DENY |
| connected_with_reveal | DENY | DENY | DENY | DENY | DENY | DTO_ONLY |
| blocked_user | DENY | DENY | DENY | DENY | DENY | DENY, even if a previous grant existed |
| deleted_or_suspended_user | DENY | DENY | DENY | DENY | DENY | DENY |
| service_role_backend_only | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY |

### profiles_private Field Classification

| Field | Field class | Notes |
| --- | --- | --- |
| `id` | SERVER_ONLY by default | Not a public profile id. |
| `owner_user_id` | SERVER_ONLY | Internal Auth ownership link only. |
| `chosen_display_name` | OWNER_ONLY / REVEAL_CONTEXT_ONLY | Reveal-context visible only through safe DTO after owner approval. |
| `approved_profile_photo_asset_id` | SERVER_ONLY raw reference | Safe avatar/photo DTO may be reveal-context visible later. |
| `short_bio` | OWNER_ONLY / REVEAL_CONTEXT_ONLY | Reveal-context visible only through safe DTO after owner approval. |
| `age_band` | OWNER_ONLY / REVEAL_CONTEXT_ONLY | Reveal-context visible only if approved for DTO. |
| `profile_visibility_default` | OWNER_ONLY | Owner setting; not non-owner visible. |
| `profile_status` | OWNER_ONLY / SERVER_ONLY | Never public. |
| `safety_state` | SERVER_ONLY | Moderation/safety internal. |
| `verification_summary_state` | OWNER_ONLY | May become safe reveal badge summary only after later approval. |
| `created_at` / `updated_at` | SERVER_ONLY by default | Owner-safe DTO may include if useful later. |
| `deleted_at` | SERVER_ONLY | Soft-delete state and audit gate. |

Prohibited in `profiles_private`: `email`, `phone`, `legal_name`, `exact_date_of_birth`, `precise_location`, `public_username`, `searchable_handle`, `global_profile_slug`, client-visible anonymous bridge, raw verification document, `device_id`, `ip_address`.

### anonymous_identities RLS Matrix

Key rule: non-owner users must not read raw anonymous identity rows. Anonymous display surfaces must use safe anonymous preview DTO/view/RPC. Safe preview must not expose owner/auth/profile linkage, verification internals, moderation internals, device/IP metadata, or any anonymous-to-real correlation path.

| Role | select_raw | insert | update | delete_or_soft_delete | owner_anonymous_identity_dto | anonymous_safe_preview_dto |
| --- | --- | --- | --- | --- | --- | --- |
| unauthenticated | DENY | DENY | DENY | DENY | DENY | DENY |
| owner | OWNER_ONLY | OWNER_ONLY | OWNER_ONLY | OWNER_ONLY / soft delete only | OWNER_ONLY | OWNER_ONLY or DTO_ONLY as product-safe preview |
| other_authenticated_user | DENY | DENY | DENY | DENY | DENY | DTO_ONLY only when the product context allows anonymous preview |
| connected_without_reveal | DENY | DENY | DENY | DENY | DENY | DTO_ONLY |
| connected_with_reveal | DENY | DENY | DENY | DENY | DENY | DTO_ONLY |
| blocked_user | DENY | DENY | DENY | DENY | DENY | DENY |
| deleted_or_suspended_user | DENY | DENY | DENY | DENY | DENY | DENY |
| service_role_backend_only | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY | SERVER_ONLY |

### anonymous_identities Field Classification

| Field | Field class | Notes |
| --- | --- | --- |
| `id` | ANONYMOUS_SAFE_PREVIEW only as opaque context id | Never enough to reach real profile. |
| `owner_user_id` | SERVER_ONLY | Internal Auth ownership link only. |
| `anonymous_label` | ANONYMOUS_SAFE_PREVIEW | Safe anonymous display label. |
| `anonymous_visual_seed` | ANONYMOUS_SAFE_PREVIEW | Safe non-identifying visual seed. |
| `voice_presence_label` | ANONYMOUS_SAFE_PREVIEW | Safe voice presence label. |
| `status` | SERVER_ONLY raw status | Generic availability may be exposed later only through safe DTO. |
| `safety_state` | SERVER_ONLY | Moderation/safety internal. |
| `rotation_state` | SERVER_ONLY | Rotation internals are not preview data. |
| `rotated_at` | SERVER_ONLY by default | Owner DTO may include later if useful. |
| `created_at` / `updated_at` | SERVER_ONLY by default | Owner-safe DTO may include if useful later. |
| `deleted_at` | SERVER_ONLY | Soft-delete state and audit gate. |

Non-owner/client preview must never expose: `owner_user_id`, `auth_user_id`, `profile_private_id`, email, phone, real name, private profile photo, verification state details, moderation internals, device/IP/security metadata, raw storage paths, or anonymous-to-real correlation data.

### Phase 24F Safe DTO Definitions

`OwnerProfileDTO` may include for the owner only:

- `chosen_display_name`
- `approved_profile_photo_asset_id` or safe avatar reference
- `short_bio`
- `age_band`
- `profile_visibility_default`
- `profile_status`
- safety-state summary
- `verification_summary_state`
- `created_at` / `updated_at` if useful to owner only

`RevealProfileDTO` may include only after active owner-approved connection/context reveal:

- `chosen_display_name`
- approved profile photo/avatar DTO
- `short_bio`
- safe `age_band` if approved
- safe badge/verification summary if approved later
- connection-safe profile metadata only

`AnonymousSafePreviewDTO` may include:

- `anonymous_label`
- `anonymous_visual_seed`
- `voice_presence_label`
- `connection_state` or context-safe state
- no owner/auth/profile linkage

`OwnerAnonymousIdentityDTO` may include for the owner only:

- `anonymous_label`
- `anonymous_visual_seed`
- `voice_presence_label`
- `status`
- safety-state summary
- `rotation_state`
- `rotated_at`
- `created_at` / `updated_at` if useful to owner only

### Phase 24F Reveal Context Access Algorithm

Planning-level algorithm only; not executable code.

`can_view_reveal_profile(viewer, owner, connection)`:

1. If `viewer == owner`, return `OWNER_ONLY` owner profile access.
2. If `connection` is missing, `DENY`.
3. If viewer and owner are not both participants in the connection, `DENY`.
4. If connection is closed, deleted, suspended, or unsafe, `DENY`.
5. If either user blocked the other, `DENY`.
6. If viewer or owner is deleted/suspended, `DENY`.
7. If an active `profile_visibility_grant` exists for this exact viewer, owner, and connection, return `DTO_ONLY` `RevealProfileDTO`.
8. Otherwise, `DENY`.

Reveal is connection/context-scoped. Reveal must not create global profile visibility. Reveal must not convert anonymous identity into a public real profile. Reveal must not authorize raw `profiles_private` table reads.

### Phase 24F Mandatory Deny Tests

1. Unauthenticated user cannot select `profiles_private`.
2. Unauthenticated user cannot select `anonymous_identities`.
3. User B cannot raw-select User A `profiles_private`.
4. User B cannot raw-select User A `anonymous_identities`.
5. `connected_without_reveal` cannot receive `RevealProfileDTO`.
6. `connected_with_reveal` cannot raw-select `profiles_private`.
7. `connected_with_reveal` can only receive `RevealProfileDTO` for the exact approved connection/context.
8. Reveal grant from one connection cannot be reused in another connection.
9. Blocked user cannot receive `RevealProfileDTO` even if a previous reveal grant existed.
10. Blocked user cannot receive `AnonymousSafePreviewDTO`.
11. Deleted/suspended user cannot receive private or anonymous DTOs.
12. Raw anonymous identity rows never expose `owner_user_id` to non-owner.
13. `AnonymousSafePreviewDTO` never exposes `auth_user_id`, `owner_user_id`, `profile_private_id`, email, phone, real name, moderation internals, verification internals, device/IP metadata.
14. Owner can access own `OwnerProfileDTO`.
15. Owner can update own allowed private profile fields.
16. Owner cannot update prohibited/system-only fields through client.
17. Owner can access own `OwnerAnonymousIdentityDTO`.
18. Owner cannot mutate internal linkage/security fields through client.
19. Route/query param tampering with profile id must deny access.
20. Route/query param tampering with anonymous identity id must deny access.
21. Service role key is not assumed available to client.
22. Service role behavior remains backend-only and must be audited separately.
23. Raw table reads are not accepted as product API for non-owner flows.
24. Storage/media access remains out of scope and blocked until future Storage/RLS/privacy phase.

### Phase 24F Readiness Decisions

Decision 1: ready for next narrow SQL planning slice?

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
```

Reason: RLS matrix, DTO-only expectations, deny tests, field classification, and reveal-context access rules are documented for `profiles_private` and `anonymous_identities`.

Decision 2: ready for actual executable SQL/RLS implementation?

```txt
NOT READY FOR EXECUTABLE SQL/RLS IMPLEMENTATION
```

Remaining blockers:

- Auth/session boundary implementation plan is not approved.
- Migration execution/rollback plan is not implementation-approved.
- Actual SQL order is not approved.
- Test harness or manual SQL verification procedure is not execution-approved.
- Safe DTO/view/RPC contracts are planned but not finalized as executable surfaces.
- Service role usage plan is not implementation-final.
- Storage/media boundaries remain excluded and blocked.

## Phase 24G Auth Boundary Prerequisite For Executable RLS

Phase 24G confirms Auth/session boundary is required before executable RLS implementation.

RLS planning assumptions:

- ownership must be derived from authenticated session.
- policies must not trust client-provided `owner_user_id`.
- insert/update policies must prevent owner spoofing.
- unauthenticated and `session_loading` states must not access owner private/profile/anonymous DTOs.
- `session_expired`, `suspended_or_deleted`, blocked, and revoked states must deny private/reveal/anonymous access.
- reveal checks remain connection/context-scoped and `DTO_ONLY`.

Phase 24G does not authorize RLS policy implementation.

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

Scope guard:
- This section is documentation-only.
- This section is not executable SQL.
- This section must not be copied into a migration without a later explicit GO, static audit, and test plan.
- No `.sql` file was created or edited for Phase 24S.
- Source of truth is `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`.

### Source-of-Truth Column Classification

#### public.profiles_private

| Column | Classification | Phase 24S mutability/readiness decision |
| --- | --- | --- |
| `id` | primary key / system default | Not client-editable. Generated by database default. |
| `owner_user_id` | owner identity FK / identity-linking field | Not safely client-editable after insert. Must match authenticated owner and must never be exposed in public/anonymous surfaces. |
| `chosen_display_name` | owner-editable display/profile field | Candidate owner-editable field, but non-owner visibility only through future approved reveal DTO boundary. |
| `approved_profile_photo_asset_id` | owner-editable profile/media reference / requires storage boundary | Conditional. Requires future storage/media access design and safe asset reference rules before client mutation. |
| `short_bio` | owner-editable display/profile field | Candidate owner-editable field, but non-owner visibility only through future approved reveal DTO boundary. |
| `age_band` | owner-editable profile field / consent-sensitive profile attribute | Conditional. Uses existing allowed values only; expose only through future approved reveal DTO boundary. |
| `profile_visibility_default` | visibility/consent field / system constrained | Not broadly client-editable. Current allowed value is only `private`; future visibility changes require explicit consent design. |
| `profile_status` | system/default field / lifecycle state | Not safely client-editable. Affects lifecycle and access decisions. |
| `safety_state` | safety/moderation field | Not client-editable. Requires moderation/server authority. |
| `verification_summary_state` | moderation/trust/verification field | Not client-editable. Requires server/moderation authority and safe projection. |
| `created_at` | timestamp/audit field | Not client-editable. Database default. |
| `updated_at` | timestamp/audit field | Not safely client-editable. Automatic update trigger is deferred to later approved migration phase. |
| `deleted_at` | soft-delete field | Not broadly client-editable. Requires explicit deletion/retention plan. |

Conclusion: owner SELECT can be a future candidate. Owner INSERT and UPDATE are CONDITIONAL because row-level RLS alone cannot protect the status, safety, visibility, verification, soft-delete, ownership, and audit fields from unsafe client writes.

#### public.anonymous_identities

| Column | Classification | Phase 24S mutability/readiness decision |
| --- | --- | --- |
| `id` | primary key / system default | Not client-editable. Generated by database default. |
| `owner_user_id` | owner identity FK / identity-linking field | Not safely client-editable after insert. Must match authenticated owner and must never be exposed in public/peer anonymous previews. |
| `anonymous_label` | anonymous identity field | Candidate for safe anonymous presentation, but direct mutation remains conditional until rotation/status rules are designed. |
| `anonymous_visual_seed` | anonymous identity field | Candidate for safe anonymous presentation, but must not encode real identity; mutation remains conditional. |
| `voice_presence_label` | anonymous identity field | Candidate for safe anonymous presentation, but must not reveal real profile data; mutation remains conditional. |
| `status` | system/default field / lifecycle state | Not safely client-editable. Affects active identity uniqueness and access behavior. |
| `safety_state` | safety/moderation field | Not client-editable. Requires moderation/server authority. |
| `rotation_state` | rotation/state field | Not broadly client-editable. Requires explicit identity rotation design. |
| `rotated_at` | rotation/audit field | Not broadly client-editable. Requires explicit rotation design. |
| `created_at` | timestamp/audit field | Not client-editable. Database default. |
| `updated_at` | timestamp/audit field | Not safely client-editable. Automatic update trigger is deferred to later approved migration phase. |
| `deleted_at` | soft-delete field | Not broadly client-editable. Requires explicit deletion/retention plan. |

Conclusion: owner SELECT can be a future candidate. Owner INSERT and UPDATE are CONDITIONAL because row-level RLS alone cannot protect status, safety, rotation, soft-delete, ownership, and audit fields from unsafe client writes.

### profiles_private Future Policy Intent Matrix

| Access scenario | Phase 24S direction | Notes |
| --- | --- | --- |
| Owner SELECT own row | FUTURE CANDIDATE | Candidate raw owner read using authenticated owner match. Must not expose this row to other users. |
| Owner INSERT own row | CONDITIONAL | Must require owner_user_id to match authenticated owner and protect system/safety/visibility/default fields through later design. |
| Owner UPDATE own row | CONDITIONAL / NOT BROADLY SAFE | Broad owner UPDATE is not safe until field mutability, safe RPC/DTO, column grants, triggers/checks, or server-side update flow are designed. |
| Owner DELETE own row | NO-GO | Hard delete remains blocked unless a future explicit deletion/retention design is approved. Prefer soft-delete lifecycle planning. |
| Unauthenticated SELECT | FORBIDDEN | No unauthenticated raw profile table read. |
| Authenticated non-owner SELECT | FORBIDDEN | No peer raw profile table read. |
| Authenticated-wide SELECT | FORBIDDEN | No blanket authenticated profile table read. |
| Public SELECT | FORBIDDEN | No public profile table read. |
| Reveal recipient raw SELECT | FORBIDDEN | Reveal must use a safe context-scoped projection, not raw profiles_private access. |
| Connection/context raw SELECT | FORBIDDEN | Connection context does not authorize raw table read. |
| Search/browse/global profile SELECT | FORBIDDEN | No profile search, user search, profile browsing, or global profile opening. |

### anonymous_identities Future Policy Intent Matrix

| Access scenario | Phase 24S direction | Notes |
| --- | --- | --- |
| Owner SELECT own anonymous identity rows | FUTURE CANDIDATE | Candidate raw owner read using authenticated owner match. |
| Owner INSERT own anonymous identity rows | CONDITIONAL | Must require owner_user_id to match authenticated owner and protect status/safety/rotation/default fields through later design. |
| Owner UPDATE own anonymous identity rows | CONDITIONAL / NOT BROADLY SAFE | Broad owner UPDATE is not safe until field mutability, safe RPC/DTO, column grants, triggers/checks, or server-side update flow are designed. |
| Owner DELETE own anonymous identity rows | NO-GO | Hard delete remains blocked unless a future explicit deletion/retention design is approved. |
| Unauthenticated SELECT | FORBIDDEN | No unauthenticated raw anonymous identity table read. |
| Authenticated non-owner SELECT | FORBIDDEN | No peer raw table read that exposes owner_user_id or identity linkage. |
| Authenticated-wide SELECT | FORBIDDEN | No blanket authenticated anonymous identity table read. |
| Public SELECT | FORBIDDEN | No public raw table read. |
| Feed/global anonymous directory SELECT | FORBIDDEN AS RAW TABLE ACCESS | Feed/global surfaces require future safe projected anonymous metadata, snapshots, DTOs, or controlled query boundaries. |
| Connection/member-directory SELECT | FORBIDDEN AS RAW TABLE ACCESS | No room/member-directory model and no broad connection directory table read. |
| Search/browse/discoverability SELECT | FORBIDDEN | No user search, anonymous identity browsing, or global discoverability. |

### Non-Executable Policy Draft

```text
-- NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY
-- Phase 24S documentation draft.
-- This block is Markdown documentation only.
-- This block must not be copied into a migration without a later explicit GO, static audit, and test plan.
-- This block does not implement policies, views, functions, triggers, grants, or database changes.
--
-- Candidate intent: profiles_private owner can read own row.
-- CREATE POLICY profiles_private_owner_select_own
-- ON public.profiles_private
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.uid() = owner_user_id
-- );
--
-- Candidate intent: profiles_private owner insert is CONDITIONAL, not ready for execution.
-- Required later design before executable form:
-- - owner_user_id must equal auth.uid().
-- - system/default fields must remain server/default controlled.
-- - safety_state, profile_status, verification_summary_state, deleted_at, and visibility/consent fields need explicit mutability controls.
-- CREATE POLICY profiles_private_owner_insert_own_CONDITIONAL
-- ON public.profiles_private
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   auth.uid() = owner_user_id
-- );
--
-- Candidate intent: profiles_private owner update is CONDITIONAL / NOT BROADLY SAFE.
-- RLS alone cannot prevent unsafe column changes.
-- Do not execute broad owner update until field mutability and server-side safety boundaries are approved.
-- CREATE POLICY profiles_private_owner_update_own_CONDITIONAL
-- ON public.profiles_private
-- FOR UPDATE
-- TO authenticated
-- USING (
--   auth.uid() = owner_user_id
-- )
-- WITH CHECK (
--   auth.uid() = owner_user_id
-- );
--
-- Explicit NO-GO intent: no raw non-owner profile reads.
-- Do not create policies for public, authenticated-wide, reveal-recipient, connection/context, search, browse, or global profile SELECT.
--
-- Candidate intent: anonymous_identities owner can read own rows.
-- CREATE POLICY anonymous_identities_owner_select_own
-- ON public.anonymous_identities
-- FOR SELECT
-- TO authenticated
-- USING (
--   auth.uid() = owner_user_id
-- );
--
-- Candidate intent: anonymous_identities owner insert is CONDITIONAL, not ready for execution.
-- Required later design before executable form:
-- - owner_user_id must equal auth.uid().
-- - status, safety_state, rotation_state, rotated_at, deleted_at, and audit fields need explicit mutability controls.
-- CREATE POLICY anonymous_identities_owner_insert_own_CONDITIONAL
-- ON public.anonymous_identities
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   auth.uid() = owner_user_id
-- );
--
-- Candidate intent: anonymous_identities owner update is CONDITIONAL / NOT BROADLY SAFE.
-- RLS alone cannot prevent unsafe column changes.
-- Do not execute broad owner update until field mutability and server-side safety boundaries are approved.
-- CREATE POLICY anonymous_identities_owner_update_own_CONDITIONAL
-- ON public.anonymous_identities
-- FOR UPDATE
-- TO authenticated
-- USING (
--   auth.uid() = owner_user_id
-- )
-- WITH CHECK (
--   auth.uid() = owner_user_id
-- );
--
-- Explicit NO-GO intent: no raw non-owner anonymous identity reads.
-- Do not create policies for public, authenticated-wide, feed/global directory, connection/member-directory, search, browse, or global discoverability SELECT.
```

### Required Future Review Before Executable RLS

Before any executable policy phase, ANKION needs:
- A field mutability matrix for both tables.
- A decision on safe owner profile update path: RPC/DTO boundary, column-level grants, trigger/check strategy, or server-side profile update flow.
- A decision on safe anonymous identity creation/update/rotation path.
- A deny-test matrix proving unauthenticated and non-owner raw reads fail.
- A reveal test proving approved reveal does not grant raw profiles_private SELECT.
- A migration-safety review confirming no reset/reapply and no remote/staging/production apply.

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

Result: PASS - local-only RLS policy migration creation preflight complete. No migration created. No policies implemented. No SQL mutation.

Canonical preflight record: `docs/architecture/SQL_MIGRATION_SLICING_PLAN.md`.

Summary:
- Phase 24U used read-only metadata/catalog SELECT queries only.
- Both first-migration tables remain present with RLS enabled and force RLS false.
- `pg_policies` returned zero rows for `profiles_private` and `anonymous_identities`.
- Migration version `20260615062809` appears exactly once.
- Current table privilege metadata does not show `anon` or `authenticated` table-level SELECT/INSERT/UPDATE/DELETE on either table.
- Current column privilege metadata does not show `anon` or `authenticated` column-level SELECT/INSERT/UPDATE on either table.
- Future owner-bound SELECT policies may require least-privilege authenticated SELECT privilege handling in the future migration, paired with strict RLS and deny/allow tests.
- Future first executable migration candidate scope is limited to `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own` only.
- INSERT/UPDATE/DELETE, raw reveal SELECT, public/anon/global/search/browse SELECT, room/member-directory behavior, RPC/view/function/trigger creation, and runtime implementation remain out of scope.
- Future UPDATE/INSERT remains blocked until field mutability and safe owner-write boundaries are complete.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_PREFLIGHT_PHASE.

## Phase 24V - Executable RLS Policy Migration File Creation / No Apply (2026-06-16)

Result: PASS - one executable migration file was created for owner-bound SELECT policies only. No apply. No policies implemented in DB.

New migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- File creation only; the migration was not run.
- Scope is limited to owner SELECT own row/rows for `public.profiles_private` and `public.anonymous_identities`.
- Least-privilege SELECT grants to `authenticated` are included because Phase 24U documented authenticated lacked table-level SELECT on the target tables.
- No grant was made to `anon`.
- No INSERT/UPDATE/DELETE policies were created.
- No reveal-recipient raw `profiles_private` SELECT policy was created.
- No connection/context raw private-profile SELECT policy was created.
- No public/global/search/browse policy was created.
- No RPC/view/function/trigger/Auth/runtime/Storage/backend/app implementation was created.
- Next required phase is static audit of the created migration file before any local apply decision.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_FILE_CREATION_PHASE.

## Phase 24W - Static Audit of Created RLS Policy Migration / No Apply (2026-06-16)

Result: PASS - static audit of the created owner-bound SELECT RLS migration completed. No apply. No DB commands run. No policies implemented in DB.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- The migration file identity is correct and timestamped after the first migration.
- No new migration file was created in Phase 24W.
- No migration file was edited in Phase 24W.
- Existing first migration remains present.
- The created migration contains only table-specific authenticated SELECT grants and the two owner-bound SELECT policies approved by Phase 24V.
- The policies use `FOR SELECT`, `TO authenticated`, and `auth.uid() = owner_user_id`.
- No anon/public grants, write grants, INSERT/UPDATE/DELETE policies, reveal raw SELECT, connection/context raw SELECT, search/browse/global access, member-directory behavior, RPC/view/function/trigger, or runtime implementation is present.
- Static audit result supports a future local apply decision/preflight phase only; it does not approve apply.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_STATIC_AUDIT_PHASE.

## Phase 24X - Local Apply Decision / Preflight for Created RLS Migration / No Apply (2026-06-16)

Result: PASS - local apply decision/preflight complete. No apply. No SQL mutation. Created RLS migration is eligible for a future local apply phase only with a new explicit GO. Staging/production remain NO-GO.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- Phase 24X ran only read-only metadata/catalog SELECT queries.
- Local DB container `supabase_db_ankion` was reachable.
- Both target tables exist and RLS remains enabled.
- Current policy count is zero.
- First migration version `20260615062809` appears exactly once.
- Phase 24V migration version `20260616090000` appears zero times, so it has not been applied locally.
- Table and column privilege posture matches Phase 24U/24W: no anon/authenticated SELECT/INSERT/UPDATE/DELETE table or column privileges observed before apply.
- Forbidden public/search/token/identity-leak columns returned zero rows.
- Future local apply may be considered only in a later phase with explicit GO and command confirmation.
- Future post-apply audit and later deny/allow tests remain separate phases.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PREFLIGHT_PHASE.

## Phase 24Y - Controlled Local Apply of Created RLS Policy Migration / Local Only (2026-06-16)

Result: FAIL - approved local apply command failed before Supabase CLI executed. Stopped without retry, repair, reset, alternate command, or post-apply audit.

Approved command attempted exactly once:
- `npx -y supabase@latest migration up --local`

Sanitized failure summary:
- PowerShell blocked `C:\Program Files\nodejs\npx.ps1` because script execution is disabled by local execution policy.
- Supabase CLI did not run.
- No migration apply completed through this command.

Pre-apply checks had passed before the failed command:
- `supabase_db_ankion` was visible and healthy.
- Both target tables existed with RLS enabled.
- `pg_policies` returned zero rows before apply.
- First migration version `20260615062809` count was 1.
- Owner-select migration version `20260616090000` count was 0 before apply.
- Migration files were not edited.

No retry or alternate apply command was run. No post-apply metadata audit was run because the phase stopped after command failure.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PHASE.

## Phase 24Y-FIX - Safe Local Apply Command Path Retry / Local Only (2026-06-16)

Result: FAIL - the safe `npx.cmd` command path worked, but the local apply retry failed while applying the migration. Stopped without retry, repair, reset, alternate command, or migration edit.

Approved command attempted exactly once:
- `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`

Sanitized failure summary:
- Supabase CLI invoked successfully through `npx.cmd` and connected to the local database.
- It attempted `20260616090000_create_owner_select_rls_policies.sql`.
- The migration failed at statement 0 with a syntax error near an unexpected leading character before the first comment, consistent with a leading BOM/encoding character.
- No post-apply audit was run because the apply command failed.

Pre-retry checks had passed before the failed command:
- `supabase_db_ankion` was visible and healthy.
- Both target tables existed with RLS enabled.
- `pg_policies` returned zero rows before retry.
- First migration version `20260615062809` count was 1.
- Owner-select migration version `20260616090000` count was 0 before retry.

No PowerShell execution-policy change, `Set-ExecutionPolicy`, or `-ExecutionPolicy Bypass` was used.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FIX_PHASE.

## Phase 24Y-FIX2 - Local Apply Failure Classification + Read-Only DB State Verification / No Apply (2026-06-16)

Result: PASS - local apply failure classified. No apply retry performed. DB remains pre-apply.

Classification: `MIGRATION_COMMAND_FAILED_BEFORE_DB_MUTATION`.

Summary:
- `npx.cmd`, `npm.cmd`, Node, and Supabase CLI via `npx.cmd` are available.
- Phase 24Y-FIX reached Supabase CLI and local DB, then failed while applying `20260616090000_create_owner_select_rls_policies.sql` at statement 0 due an unexpected leading character before the initial comment.
- The failure is consistent with a leading BOM/encoding character at the start of the migration file.
- Read-only DB verification shows first migration version `20260615062809` count = 1, owner-select migration version `20260616090000` count = 0, `pg_policies` zero rows, RLS enabled on both target tables, and forbidden fields zero rows.
- No apply retry, migration edit, repair, reset, direct SQL mutation, tests, app/runtime changes, package/env changes, or APK workspace changes occurred.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FAILURE_CLASSIFICATION.

## Phase 24Y-FIX3 - Migration File Encoding / Leading Character Remediation + Static Re-Audit / No Apply (2026-06-16)

Result: PASS - owner-select RLS migration file encoding remediated and statically re-audited. No apply. No DB commands run.

Target migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- Pre-fix prefix classification: `UTF8_BOM_EF_BB_BF`.
- Pre-fix SHA256: `31A9DFB5C5F62BAF010F379C08805D7103643C0C7DB5F07EEEEECF713C31B397`.
- Remediation performed: removed exactly leading bytes `EF BB BF` from the target migration file.
- Post-fix SHA256: `FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455`.
- Post-fix first bytes now begin with ASCII `2D 2D` / `-- Phase 24V`.
- Static re-audit passed: owner-bound SELECT policy scope and authenticated SELECT grants are preserved; no forbidden SQL or broad access was added.
- Original first migration was not edited and no new migration file was created.
- No apply retry or DB command was run.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_ENCODING_FIX_PHASE.

## Phase 24Y-FIX4 - Controlled Local Apply Retry After Encoding Fix / Local Only (2026-06-16)

Result: PASS - created RLS policy migration applied to local DB only after encoding fix. Post-apply metadata audit PASS. Owner-bound SELECT policies now exist locally. Staging/production remain NO-GO. Auth/runtime/app implementation remain NO-GO.

Summary:
- Used approved command exactly once: `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`.
- Applied `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql` locally only.
- Migration history now records `20260616090000` exactly once; first migration remains recorded exactly once.
- `pg_policies` now shows exactly `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own`.
- Both policies are SELECT, target `{authenticated}`, and use `(auth.uid() = owner_user_id)`.
- RLS remains enabled on both target tables.
- Authenticated has expected table-specific SELECT on both target tables; no anon SELECT and no authenticated write grants appeared.
- Forbidden field scan returned zero rows.
- No staging/production apply, app/runtime implementation, tests, test data, migration edits, new migrations, db reset, db push, migration repair, link, or remote command occurred.

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

## Phase 25A - Future Controlled Local RLS Deny/Allow Matrix (2026-06-16)

Status: PASS - expected outcomes documented for a future explicit local test phase. No tests were run and no test data was created.

### profiles_private Expected Outcomes

| Scenario | Expected outcome | Expected mechanism |
|---|---|---|
| unauthenticated_user SELECT profiles_private | DENY | anon has no SELECT grant; permission denied is acceptable/preferred. |
| authenticated_non_owner_b SELECT owner_a profiles_private row | DENY | authenticated has SELECT grant, but RLS filters non-owned row; expected visible row count: 0. |
| authenticated_owner_a SELECT own profiles_private row | ALLOW | authenticated has SELECT grant and auth.uid() = owner_user_id; expected visible row count: 1 for targeted own row. |
| reveal_recipient_b_for_context_x SELECT raw owner_a profiles_private row | DENY | reveal must not grant raw profiles_private table read; expected visible row count: 0. |
| connection_participant_b_without_reveal SELECT raw owner_a profiles_private row | DENY | connection participation does not grant raw profile visibility; expected visible row count: 0. |
| authenticated_owner_a INSERT profiles_private | DENY / outside current policy scope | authenticated has no INSERT grant. |
| authenticated_owner_a UPDATE profiles_private | DENY / outside current policy scope | authenticated has no UPDATE grant. |
| authenticated_owner_a DELETE profiles_private | DENY / outside current policy scope | authenticated has no DELETE grant. |
| malicious_owner_attempting_owner_user_id_reassignment | DENY | no UPDATE grant now; future policies must preserve owner_user_id immutability. |
| malicious_owner_attempting_system_field_mutation | DENY | no UPDATE grant now; future policies must protect system/safety fields. |
| public/global/search/browse profile access | DENY / forbidden | no public profile browsing/search/global profile policy exists or may be introduced. |
| monetization-based identity/reveal bypass | DENY / forbidden | monetization must never bypass consent or identity boundaries. |

### anonymous_identities Expected Outcomes

| Scenario | Expected outcome | Expected mechanism |
|---|---|---|
| unauthenticated_user SELECT anonymous_identities | DENY | anon has no SELECT grant; permission denied is acceptable/preferred. |
| authenticated_non_owner_b SELECT owner_a anonymous identity rows directly | DENY | authenticated has SELECT grant, but RLS filters non-owned rows; expected visible row count: 0. |
| authenticated_owner_a SELECT own anonymous identity rows | ALLOW | authenticated has SELECT grant and auth.uid() = owner_user_id; expected visible row count: 1 for targeted own row. |
| feed/global anonymous directory SELECT directly from anonymous_identities | DENY / forbidden | no global anonymous directory is allowed. |
| connection/member-directory SELECT directly from anonymous_identities | DENY / forbidden | no room/member-directory behavior is allowed. |
| user search / anonymous identity search / browse / discoverability SELECT | DENY / forbidden | no user/profile/anonymous identity search or browse is allowed. |
| authenticated_owner_a INSERT anonymous_identities | DENY / outside current policy scope | authenticated has no INSERT grant. |
| authenticated_owner_a UPDATE anonymous_identities | DENY / outside current policy scope | authenticated has no UPDATE grant. |
| authenticated_owner_a DELETE anonymous_identities | DENY / outside current policy scope | authenticated has no DELETE grant. |
| malicious_owner_attempting_owner_user_id_reassignment | DENY | no UPDATE grant now; future policies must preserve owner_user_id immutability. |
| malicious_owner_attempting_system_field_mutation | DENY | no UPDATE grant now; future policies must protect system/safety fields. |
| monetization-based identity lookup/discoverability/reveal bypass | DENY / forbidden | monetization must never bypass consent or identity boundaries. |

## Phase 25B - Future Harness Matrix Alignment (2026-06-16)

Status: PASS - matrix remains planned only. No tests were executed and no test data was created.

Phase 25B keeps the Phase 25A expected outcomes and locks the interpretation model for future harness assertions.

### profiles_private Future Assertions

| Scenario | Expected result | Interpretation |
|---|---|---|
| unauthenticated_user SELECT profiles_private | DENY | Missing anon SELECT privilege; permission denied acceptable/preferred. |
| authenticated_non_owner_b SELECT owner_a row | DENY | authenticated has SELECT, but RLS filters non-owned row; expected visible row count 0. |
| authenticated_owner_a SELECT own row | ALLOW | authenticated has SELECT and auth.uid() = owner_user_id; expected visible row count 1 for targeted own row. |
| reveal_recipient_b_for_context_x SELECT raw owner_a row | DENY | reveal must not grant raw profiles_private read; expected visible row count 0. |
| connection_participant_b_without_reveal SELECT raw owner_a row | DENY | connection participation does not expose raw profile rows; expected visible row count 0. |
| authenticated_owner_a INSERT | DENY | authenticated has no INSERT grant. |
| authenticated_owner_a UPDATE | DENY | authenticated has no UPDATE grant. |
| authenticated_owner_a DELETE | DENY | authenticated has no DELETE grant. |
| malicious owner_user_id reassignment | DENY | no UPDATE grant now; future policies must preserve owner_user_id immutability. |
| malicious system/safety field mutation | DENY | no UPDATE grant now; future policies must protect system/safety fields. |
| public/global/search/browse profile access | DENY / forbidden | no public profile browsing/search/global profile policy exists or may be introduced. |
| monetization identity/reveal bypass | DENY / forbidden | monetization must never bypass consent or identity boundaries. |

### anonymous_identities Future Assertions

| Scenario | Expected result | Interpretation |
|---|---|---|
| unauthenticated_user SELECT anonymous_identities | DENY | Missing anon SELECT privilege; permission denied acceptable/preferred. |
| authenticated_non_owner_b SELECT owner_a anonymous identity row | DENY | authenticated has SELECT, but RLS filters non-owned row; expected visible row count 0. |
| authenticated_owner_a SELECT own anonymous identity row | ALLOW | authenticated has SELECT and auth.uid() = owner_user_id; expected visible row count 1 for targeted own row. |
| feed/global anonymous directory SELECT directly | DENY / forbidden | no global anonymous directory is allowed. |
| connection/member-directory SELECT directly | DENY / forbidden | no room/member-directory behavior is allowed. |
| user search / anonymous identity search / browse / discoverability SELECT | DENY / forbidden | no user/profile/anonymous identity search or browse is allowed. |
| authenticated_owner_a INSERT | DENY | authenticated has no INSERT grant. |
| authenticated_owner_a UPDATE | DENY | authenticated has no UPDATE grant. |
| authenticated_owner_a DELETE | DENY | authenticated has no DELETE grant. |
| malicious owner_user_id reassignment | DENY | no UPDATE grant now; future policies must preserve owner_user_id immutability. |
| malicious system/safety field mutation | DENY | no UPDATE grant now; future policies must protect system/safety fields. |
| monetization identity lookup/discoverability/reveal bypass | DENY / forbidden | monetization must never bypass consent or identity boundaries. |

## Phase 25C - Harness Assertion Coverage Alignment (2026-06-16)

Status: PASS - future harness assertions represented in the draft file; no tests executed.

profiles_private coverage in the harness:
- unauthenticated_user SELECT: permission denied expected.
- authenticated_non_owner_b SELECT owner_a row: RLS-filtered zero rows expected.
- authenticated_owner_a SELECT own row: one visible targeted own row expected.
- reveal_recipient_b_for_context_x raw owner_a SELECT: RLS-filtered zero rows expected.
- connection_participant_b_without_reveal raw owner_a SELECT: RLS-filtered zero rows expected.
- authenticated_owner_a INSERT/UPDATE/DELETE: permission denied expected because authenticated has no write grants.
- malicious owner_user_id reassignment and safety field mutation: permission denied expected now; future policies must preserve immutability and system/safety field protection.
- public/global/search/browse and monetization bypass labels: represented as non-owner direct-table access to owner_a row expecting zero rows.

anonymous_identities coverage in the harness:
- unauthenticated_user SELECT: permission denied expected.
- authenticated_non_owner_b SELECT owner_a anonymous identity row: RLS-filtered zero rows expected.
- authenticated_owner_a SELECT own row: one visible targeted own row expected.
- feed/global directory, connection/member-directory, user search/browse/discoverability, and monetization bypass labels: represented as non-owner direct-table access to owner_a row expecting zero rows.
- authenticated_owner_a INSERT/UPDATE/DELETE: permission denied expected because authenticated has no write grants.
- malicious owner_user_id reassignment and safety field mutation: permission denied expected now; future policies must preserve immutability and system/safety field protection.

## Phase 25E - Local Owner-Select RLS Deny/Allow Harness Results (2026-06-16)

Status: PASS - local controlled harness executed and all current two-table owner-select RLS expectations passed.

profiles_private executed results:
- unauthenticated_user SELECT: PASS, permission denied.
- authenticated_non_owner_b SELECT owner_a row: PASS, RLS-filtered zero rows.
- authenticated_owner_a SELECT own row: PASS, one visible targeted own row.
- reveal_recipient_b_for_context_x raw owner_a SELECT: PASS, RLS-filtered zero rows.
- connection_participant_b_without_reveal raw owner_a SELECT: PASS, RLS-filtered zero rows.
- authenticated_owner_a INSERT/UPDATE/DELETE: PASS, permission denied by missing write grants.
- malicious owner_user_id reassignment and safety field mutation: PASS, permission denied by missing UPDATE grant.
- public/global/search/browse and monetization-bypass labels: PASS, RLS-filtered zero rows for non-owner direct-table access.

anonymous_identities executed results:
- unauthenticated_user SELECT: PASS, permission denied.
- authenticated_non_owner_b SELECT owner_a row: PASS, RLS-filtered zero rows.
- authenticated_owner_a SELECT own row: PASS, one visible targeted own row.
- feed/global directory, connection/member-directory, search/browse/discoverability, and monetization-bypass labels: PASS, RLS-filtered zero rows for non-owner direct-table access.
- authenticated_owner_a INSERT/UPDATE/DELETE: PASS, permission denied by missing write grants.
- malicious owner_user_id reassignment and safety field mutation: PASS, permission denied by missing UPDATE grant.

Rollback verification found zero persistent fake rows. Coverage remains limited to the current local owner-bound SELECT RLS scope.

## Phase 27B - Creation Path RLS Matrix Update (2026-06-18)

Status: PASS - docs-only matrix update. No executable SQL, migration edit, DB command, RLS harness run, test data/user creation, runtime integration, package/env/APK/native, staging, or production work was performed.

### profiles_private Future Creation Matrix

| Scenario | Phase 27B decision | Required future mechanism |
|---|---|---|
| Authenticated owner creates own private profile | CONDITIONAL / controlled boundary preferred | Server/session-derived owner binding, one-row uniqueness, field allowlist, server-owned defaults, rate limit, abuse score. |
| Authenticated owner direct broad INSERT | BLOCKED | Too much risk for owner spoofing, unsafe defaults, duplicate rows, and system/safety field mutation. |
| Owner creates row for another `owner_user_id` | DENY | Trusted owner binding; client-supplied owner linkage ignored or rejected. |
| Repeated profile provisioning | DENY / idempotent safe handling later | Unique owner constraint plus controlled provisioning semantics. |
| Reveal recipient raw `profiles_private` read after creation | DENY | Safe context-scoped DTO only; no raw table read. |
| Public/search/browse/global profile creation side effect | FORBIDDEN | No public profile, search, browse, global profile, or room/member-directory model. |

### anonymous_identities Future Creation Matrix

| Scenario | Phase 27B decision | Required future mechanism |
|---|---|---|
| Authenticated owner receives active anonymous identity | CONDITIONAL / controlled boundary preferred | Server/session-derived owner binding, one-active-per-owner for V1, safe defaults, rate limit, abuse score. |
| Authenticated owner direct broad INSERT | BLOCKED | Too much risk for duplicate active identities, owner spoofing, unsafe safety/status fields, and anonymous-to-real correlation. |
| Owner creates identity for another `owner_user_id` | DENY | Trusted owner binding; no client-supplied owner linkage. |
| Rotation/history creation | DEFERRED | Separate explicit rotation phase required. |
| Global anonymous directory/search/browse | FORBIDDEN | No user search, profile search, anonymous identity search, room/member-directory, or browse model. |
| Monetization-based identity lookup | FORBIDDEN | Monetization cannot bypass identity/reveal/consent boundaries. |

### Required Anti-Abuse Preconditions

Before write policy or controlled boundary implementation, future tests/plans must cover creation spam, duplicate provisioning, Android manipulation, fake microphone input, replay/pre-recorded voice, repeated upload/replay, live-session manipulation, local storage tampering, speed/volume/device metadata abuse, server-side verification, rate limits, abuse scoring, voice freshness/liveness, replay detection, upload nonce/session binding, moderation manipulation, consent manipulation, and reveal manipulation.

## Phase 27C - Creation Path Preflight Matrix (2026-06-18)

Status: PASS - docs-only matrix preflight. No SQL, migration, DB command, RLS harness, test data/user, runtime, package/env/APK/native, staging, or production work was performed.

### Future RLS / WITH CHECK Preconditions

| Table | Future operation | Minimum precondition | Phase 27C status |
|---|---|---|---|
| profiles_private | INSERT via controlled boundary | owner from trusted context, unique owner row, server defaults, field allowlist, abuse checks | PLANNED / NOT IMPLEMENTED |
| profiles_private | Direct INSERT fallback | strict `WITH CHECK (auth.uid() = owner_user_id)`, field mutability protection, deny tests | CONDITIONAL / NOT PREFERRED |
| profiles_private | UPDATE | owner-only fields allowlist; owner_user_id and system/safety/audit fields immutable | BLOCKED |
| anonymous_identities | INSERT via controlled boundary | owner from trusted context, one active identity, safe defaults, no real-profile linkage | PLANNED / NOT IMPLEMENTED |
| anonymous_identities | Direct INSERT fallback | strict `WITH CHECK (auth.uid() = owner_user_id)`, one-active rule, field mutability protection, deny tests | CONDITIONAL / NOT PREFERRED |
| anonymous_identities | UPDATE/rotation | separate rotation/safety design | BLOCKED |

### Required Future Assertions

- Owner can create only own `profiles_private` row.
- Owner cannot spoof `owner_user_id` for `profiles_private`.
- Owner cannot create duplicate `profiles_private` row.
- Owner can create only own `anonymous_identities` row.
- Owner cannot spoof `owner_user_id` for `anonymous_identities`.
- Owner cannot create duplicate active anonymous identity.
- Anonymous identity cannot expose or join to `profiles_private` for non-owner clients.
- Non-owner cannot select/update/insert either raw table.
- Unauthenticated user cannot create/read private rows.
- Denied fields cannot be client-mutated.
- Reveal does not grant raw private profile read.
- Public/search/browse/global profile and room/member-directory paths remain denied.
- Monetization does not bypass identity/reveal/consent.

## Phase 28D - Controlled Creation Function RLS/Test Matrix (2026-06-18)

Status: PASS - planning-only matrix update for the local controlled creation function. No tests were run. No DB command, SQL execution, RLS harness run, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

### Controlled Creation Function Assertions

| Scenario | Expected result | Required mechanism |
|---|---|---|
| Unauthenticated caller invokes `create_owner_identity_foundation` | DENY | `auth.uid()` is null and function raises authenticated-owner-required error. |
| Authenticated owner A invokes function with allowed display fields | ALLOW | Function derives owner from owner A JWT context and inserts or returns owner A foundation rows. |
| Caller attempts `owner_user_id` spoofing | DENY / impossible | Function signature has no `owner_user_id` parameter and uses `auth.uid()`. |
| Duplicate private profile provisioning | DENY / safely idempotent | Existing `profiles_private_owner_user_id_key` and function conflict handling prevent duplicate private profile rows. |
| Duplicate active anonymous identity provisioning | DENY / safely idempotent | Existing `anonymous_identities_one_active_per_owner_idx` and function conflict handling prevent duplicate active identities. |
| Authenticated owner B tries to create for owner A | DENY / impossible | Function does not accept target owner input. |
| Direct table INSERT by authenticated role | DENY | No authenticated INSERT grant and no direct INSERT policy. |
| Direct table UPDATE/DELETE by authenticated role | DENY | No authenticated UPDATE/DELETE grant and no UPDATE/DELETE policy. |
| Raw `profiles_private` read after creation by non-owner/reveal context | DENY | Creation does not add raw profile read paths; owner SELECT policy remains unchanged. |
| Anonymous identity output leaks real profile data | DENY | Function returns IDs only and anonymous defaults contain no real profile fields. |
| Client controls system/safety/audit/reveal fields | DENY | Function accepts only optional display fields and relies on table defaults for server-owned fields. |
| Anon executes function | DENY | Function execute is revoked from anon. |
| Authenticated executes function | ALLOW / narrow | Execute grant is limited to authenticated and must remain reviewed. |
| Function search path drift | DENY | `search_path` must remain fixed to `public, auth`. |
| Dynamic SQL appears | DENY | Function must remain free of dynamic SQL. |

### Boundary

- This matrix plans future local tests only.
- No staging or production execution is allowed.
- No reveal, Storage, Auth runtime, Supabase client runtime, app binding, APK/native, package change, or Dev Console work is authorized.
- Any harness implementation, test data/user creation, or execution requires separate explicit GO.
- Exact future GO for any harness execution: `GO: Run Phase 28E local controlled creation function harness only.`

## Phase 28I - Conversation / Connection Primitive RLS Preflight (2026-06-18)

Status: PASS - planning-only RLS preflight for the next backend slice. No SQL, migration, DB command, RLS harness, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

### Future Conversation / Connection RLS Direction

| Area | Phase 28I direction | Required future mechanism |
|---|---|---|
| Participant SELECT | Participant-only | Authenticated user must own one participant anonymous identity. |
| Global conversation list | FORBIDDEN | No public or authenticated-wide conversation graph. |
| Cross-owner access | DENY | Non-participants must see zero rows or receive permission denial. |
| Raw private profile read | DENY | Conversation membership never grants raw `profiles_private` access. |
| Reveal implication | DENY | Conversation status does not equal profile visibility. |
| Direct broad write policy | BLOCKED | Creation/update paths require a separate controlled boundary and tests. |
| Room/chat-room/member-directory model | FORBIDDEN | No member directory, room participant browsing, or global profile discovery. |

### Future Assertion Candidates

- Owner/participant can select only their own conversation/connection rows.
- Non-participant cannot select conversation/connection rows.
- Public/anon cannot select conversation/connection rows.
- Conversation participants cannot raw-select `profiles_private` unless a separate reveal-safe DTO boundary is approved later.
- Reply eligibility cannot be manipulated through broad client writes.
- Connection status cannot be used as a real-profile reveal signal.
- Search/browse/global conversation and room/member-directory paths remain denied.
- Monetization cannot bypass connection, reveal, consent, or identity boundaries.

### Anti-Abuse Carryover

- Android/client signals remain untrusted.
- Fake microphone, replay/pre-recorded voice, repeated upload/replay, local storage tampering, live-session manipulation, and connection/reply manipulation remain future server-side concerns.
- Rate limits and abuse scoring are required later before runtime acceptance.
- Reveal/consent manipulation remains blocked.

## Phase 29A - Conversation / Connection Primitive RLS Candidate Notes (2026-06-18)

Result: PASS - candidate migration enables RLS on `connections` and `connection_participants` but creates no policies and no table grants.

Future policy matrix additions, not executed in Phase 29A:

| Surface | Future posture |
| --- | --- |
| unauthenticated SELECT connections | DENY |
| authenticated non-participant SELECT connection | DENY |
| authenticated participant SELECT connection | ALLOW only through participant ownership boundary |
| authenticated non-participant SELECT connection_participants | DENY |
| public/global conversation list | DENY / forbidden |
| profile/user search through connection tables | DENY / forbidden |
| raw profiles_private read through connection context | DENY / forbidden |
| reveal implication from reply eligibility | DENY / forbidden |
| direct broad INSERT/UPDATE/DELETE on connection tables | DENY until a controlled boundary is separately approved |

Future harness requirements:
- verify no broad policies or grants exist by default.
- verify participant-only SELECT before any runtime binding.
- verify closed, blocked, frozen, deleted, and non-participant states deny unsafe continuation.
- verify no test output exposes raw private profile data.

## Phase 29F - Connection Primitive Verification Matrix (2026-06-19)

Result: PASS - planning-only metadata verification matrix for the local connection primitive tables. No DB command, SQL execution, RLS harness, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

Current intended state after Phase 29E local corrective apply:

| Surface | Expected metadata result |
| --- | --- |
| `public.connections` | table exists, RLS enabled, no policies |
| `public.connection_participants` | table exists, RLS enabled, no policies |
| anon/authenticated/PUBLIC table privileges | no SELECT/INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER |
| FK targets | anonymous identities and connection primitive only |
| `profiles_private` path | DENY / forbidden; no FK or raw read path |
| global conversation list | DENY / forbidden; no policy or grant |
| participant-only SELECT | FUTURE EXPLICIT PHASE; not implemented in Phase 29F |
| direct broad write | DENY / forbidden; no broad write policy |
| voice/reveal/storage/runtime | OUT OF SCOPE / not implemented |

Future Phase 29G metadata verification must confirm deny-by-default remains intact before any participant-only SELECT policy is considered.

Product boundaries remain unchanged:
- No profile search.
- No user search.
- No public profile.
- No room/chat-room/member-directory model.
- Anonymous identity and real profile remain separated.
- Reveal remains untouched and does not grant raw `profiles_private` access.
- Monetization cannot bypass identity, reveal, or consent.

## Phase 29H - Connection Primitive Participant-Only SELECT Preflight (2026-06-19)

Result: PASS - planning-only RLS preflight for future participant-only SELECT policies. No DB command, SQL execution, migration creation/editing, local migration apply, RLS policy implementation, RLS harness, test execution, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

### Future Participant-Only SELECT Matrix

| Actor / case | Future expected result | Boundary |
| --- | --- | --- |
| unauthenticated caller | DENY | No anonymous or public connection read. |
| authenticated participant A | ALLOW own connection only | Caller owns a linked participant anonymous identity. |
| authenticated participant B | ALLOW same connection only | Caller owns the other linked participant anonymous identity. |
| authenticated non-participant | DENY | No cross-owner or relationship graph access. |
| anonymous identity owner not attached to the connection | DENY | Ownership of any anonymous identity is not enough. |
| blocked/frozen future actor state | DENY or limited by future safety state | Unsafe continuation must be blocked before runtime. |
| global conversation list query | DENY / forbidden | No global listing or browsing policy. |
| raw `profiles_private` read through connection context | DENY / forbidden | Connection membership never grants raw profile read. |
| direct INSERT/UPDATE/DELETE policy | BLOCKED | Write boundary requires separate controlled design. |

### Future Test Assertion Candidates

- Unauthenticated caller cannot read `public.connections` or `public.connection_participants`.
- Participant A can read only the connection where their owned anonymous identity participates.
- Participant B can read only the same eligible connection context.
- Non-participant cannot read the connection or participant rows.
- A participant cannot read an unrelated connection.
- Global list queries produce denial or zero rows.
- No policy exposes `profiles_private` or implies Reveal.
- No direct write policy is introduced in the SELECT policy phase.
- Blocked/frozen future states deny unsafe continuation.

### Anti-Abuse Carryover

- Android client signals remain untrusted.
- Connection/reply manipulation risk remains a future server-side control.
- Rate limits and abuse scoring are required later.
- Reveal and consent manipulation remain blocked.

Exact next GO:
`GO: Start Phase 29I connection primitive RLS policy migration candidate.`

## Phase 29I - Connection Primitive Participant SELECT Candidate Matrix (2026-06-19)

Result: PASS - one local source migration candidate was prepared for participant-only SELECT RLS policies. No DB command, SQL execution, local migration apply, RLS harness, test execution, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

Candidate migration:
- `supabase/migrations/20260619123000_create_connection_participant_select_rls_policies.sql`

### Candidate Policy Matrix

| Surface | Candidate posture |
| --- | --- |
| `public.connections` SELECT | `authenticated` only, participant-owned anonymous identity required by RLS. |
| `public.connection_participants` SELECT | `authenticated` only, caller must be a participant in the same connection. |
| unauthenticated / anon | DENY; no anon SELECT grant. |
| PUBLIC | DENY; no PUBLIC grant. |
| authenticated non-participant | DENY by participant-only predicate. |
| participant unrelated connection | DENY by matching connection predicate. |
| blocked/frozen/deleted state | DENY by candidate state filters. |
| global conversation list | DENY / forbidden; no broad policy. |
| direct write policies | BLOCKED; no INSERT/UPDATE/DELETE policy or `WITH CHECK`. |
| raw `profiles_private` access | DENY / forbidden; no reference or read path. |

The candidate keeps anonymous identity and real profile separation intact. Reveal, Storage, voice messages, profile/user search, public profile browsing, room/chat-room behavior, and runtime integration remain out of scope.

## Phase 29N - Connection Participant RLS Recursion Fix Matrix (2026-06-19)

Result: PASS - docs-only planning for the Phase 29M recursion blocker. No DB command, SQL execution, migration creation/editing/apply, RLS harness rerun, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

Phase 29M blocker:

| Item | Finding |
| --- | --- |
| error | `ERROR: infinite recursion detected in policy for relation "connection_participants"` |
| blocked relation | `public.connection_participants` |
| current cause | `connections` policy reads `connection_participants`; `connection_participants` policy also reads `connection_participants`. |
| blocked checks | participant SELECT, non-participant denial, cross-connection isolation, participant-row visibility. |

Future corrected posture:

| Surface | Planned correction |
| --- | --- |
| helper | `public.is_connection_participant_for_current_user(target_connection_id uuid) returns boolean` |
| helper security | narrow `SECURITY DEFINER`, fixed `search_path`, schema-qualified references, no dynamic SQL |
| helper output | boolean only; no row data |
| membership linkage | `public.anonymous_identities.owner_user_id = auth.uid()` |
| participant filters | active/non-deleted identity and participant rows using current schema columns |
| `connections` SELECT | call helper with current row `id` |
| `connection_participants` SELECT | call helper with current row `connection_id` |
| self-reference | no direct self-referencing SELECT inside `connection_participants` policy |
| grants | explicit revoke/grant plan for EXECUTE; no broad public posture |
| product boundary | no raw `profiles_private`, Reveal, global list, profile/user search, room/chat-room model |

The future fix must preserve participant-only access, same-connection visibility, cross-connection isolation, and non-participant denial while removing recursive RLS evaluation. If local function ownership/RLS behavior does not break recursion safely, the future execution phase must stop instead of broadening policies.

Exact future GO:
`GO: Create Phase 29O local migration draft for connection participant RLS recursion fix only.`

## Phase 29O - Connection Participant RLS Recursion Fix Draft Matrix (2026-06-19)

Result: PASS - one local migration draft was created for static review only. No DB command, SQL execution, migration apply, RLS harness rerun, test data/user, runtime integration, package/env/APK/native, staging, or production work was performed.

Migration draft:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

| Check | Draft posture |
| --- | --- |
| helper function | `public.is_connection_participant_for_current_user(target_connection_id uuid) returns boolean` |
| security | `SECURITY DEFINER`, fixed `search_path = public, auth, pg_temp` |
| row data | none returned; boolean only |
| membership linkage | `public.anonymous_identities.owner_user_id = auth.uid()` |
| participant check | `public.connection_participants` joined to `public.anonymous_identities` and `public.connections` inside helper |
| policy replacement | both existing SELECT policies are dropped and recreated |
| recursion fix | `connection_participants` policy calls helper with row `connection_id`; no direct self-referencing SELECT predicate |
| write boundary | no INSERT/UPDATE/DELETE/WITH CHECK policy |
| grants | helper EXECUTE revoked then granted only to authenticated; no table grants added |
| product boundary | no raw `profiles_private`, Reveal, Storage, global list, profile/user search, or room/chat-room behavior |

Static review must confirm function ownership, RLS bypass behavior, and RPC exposure risk before any local apply is approved.

## Phase 29P - SECURITY DEFINER / RPC Probing Exposure Review Matrix (2026-06-19)

Result: NEEDS_REVISION - static review completed without DB command, SQL execution, migration apply, RLS harness rerun, test data/user, SQL migration edit, runtime integration, package/env/APK/native, staging, or production work.

Reviewed draft:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

| Review item | Decision |
| --- | --- |
| boolean-only helper | PASS - no row data returned |
| `SECURITY DEFINER` | REVIEW - necessary to break recursive RLS, but ownership and bypass posture need revised apply plan |
| fixed search_path | PASS - `public, auth, pg_temp` |
| schema-qualified references | PASS - `public.*` and `auth.uid()` |
| dynamic SQL | PASS - absent |
| participant-bound SELECT | PASS - helper preserves `auth.uid()` to `public.anonymous_identities.owner_user_id` membership check |
| direct RPC exposure | NEEDS_REVISION - `public` schema plus EXECUTE to `authenticated` can expose boolean membership probing |
| UUID probing | REVIEW - random guessing is impractical, but known/obtained UUID probing remains a privacy concern |
| apply readiness | NO-GO - revise before local apply |

Required next GO:
`GO: Create Phase 29Q migration revision for connection participant RLS recursion RPC exposure only.`

## Phase 29Q - Revised Connection Participant RLS Recursion Fix Matrix (2026-06-19)

Result: PASS - existing migration draft revised only. No DB command, SQL execution, migration apply, RLS harness rerun, test data/user, new migration file, runtime integration, package/env/APK/native, staging, or production work was performed.

Revised draft:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

| Check | Revised posture |
| --- | --- |
| helper schema | `private`, not `public` |
| helper function | `private.is_connection_participant_for_current_user(target_connection_id uuid) returns boolean` |
| security | `SECURITY DEFINER`, fixed `search_path = public, auth, pg_temp` |
| RPC exposure | public-schema helper removed; no public helper grant remains |
| grants | private schema access revoked from `public`, `anon`, `authenticated`; EXECUTE granted only on private helper to `authenticated` for policy-use review |
| row data | none returned; boolean only |
| membership linkage | `public.anonymous_identities.owner_user_id = auth.uid()` |
| policy replacement | both SELECT policies call the private helper |
| write boundary | no INSERT/UPDATE/DELETE/WITH CHECK policy |
| apply readiness | ready for static checkpoint verification; local apply still requires later explicit GO |

Exact next GO:
`GO: Commit Phase 29Q revised migration checkpoint only.`

## Phase 29R - Applied Connection Participant RLS Recursion Fix Metadata Matrix (2026-06-19)

Result: PASS - revised migration applied to local `supabase_db_ankion` only. No staging, production, remote Supabase command, RLS harness, test data/user, runtime integration, package/env/APK/native, migration edit, new migration file, or commit work was performed.

| Check | Local metadata result |
| --- | --- |
| local target | `supabase_db_ankion` / `postgres` / `postgres` |
| pre-apply checkpoint | schema-only dump outside repo |
| migration history | `20260619153000|fix_connection_participant_rls_recursion` |
| private schema | exists |
| private helper | `private.is_connection_participant_for_current_user(uuid)` exists |
| helper shape | boolean, `SECURITY DEFINER`, fixed `search_path=public, auth, pg_temp` |
| public helper | absent |
| policy replacement | both SELECT policies call private helper |
| RLS | enabled on `public.connections` and `public.connection_participants` |
| write boundary | no INSERT/UPDATE/DELETE policies and no unsafe table grants |
| remaining validation | Phase 29S must validate private helper EXECUTE posture behaviorally |

Exact next GO:
`GO: Run Phase 29S local RLS harness rerun for connection participant recursion fix only.`

## Phase 29S - Connection Participant RLS Recursion Fix Harness Matrix (2026-06-19)

Result: PASS - local transaction-wrapped RLS harness rerun completed against `supabase_db_ankion` / `postgres`. No staging, production, remote Supabase command, migration apply, migration edit, schema change, source/runtime change, package/env/APK/native change, test data persistence, or commit work was performed.

| Check | Result |
| --- | --- |
| `auth.uid()` simulation | PASS for Users A, B, C, and D |
| recursion blocker | PASS; no `infinite recursion detected in policy for relation "connection_participants"` |
| participant connection SELECT | PASS; User A and User B saw connection 1, User D saw connection 2 |
| non-participant connection denial | PASS; User C saw zero rows |
| cross-connection isolation | PASS; User D could not see connection 1 and User A could not see connection 2 |
| participant row visibility | PASS; same-connection participants saw only same-connection rows |
| non-participant participant-row denial | PASS; User C saw zero rows |
| private helper policy execution | PASS through SELECT policies |
| rollback / cleanup | PASS; deterministic Phase 29S rows remaining: 0 |

Next required GO:
`GO: Create Phase 29S docs checkpoint commit only.`

## Phase 29T - Connection Participant RLS Local Closure Matrix (2026-06-19)

Result: PASS - docs-only closure review completed. Connection participant RLS local closure is YES for `public.connections` and `public.connection_participants` participant-bound SELECT. This is local-only closure and does not claim staging, production, runtime/Auth, APK/native, Storage, voice upload, Reveal, monetization, or full backend readiness.

| Area | Closure result |
| --- | --- |
| Phase 29M blocker | recursion detected in `connection_participants` and documented |
| Phase 29Q revision | helper moved to `private.is_connection_participant_for_current_user(target_connection_id uuid)` |
| Phase 29R local apply | PASS on local `supabase_db_ankion` / `postgres` |
| Phase 29S harness | PASS with rollback/cleanup and deterministic rows remaining 0 |
| participant SELECT | PASS locally |
| non-participant denial | PASS locally |
| cross-connection isolation | PASS locally |
| participant row visibility | PASS locally, same-connection only |
| private helper policy execution | PASS locally |
| public helper exposure | removed; public helper absent |
| write boundary | no INSERT/UPDATE/DELETE policies added |
| service role dependency | none introduced |

Abuse carryover: instant-reply and voice-reply manipulation must remain backend/RLS-enforced, not UI-state-enforced. Android runtime/device phases must not assume local UI permission equals backend permission.

Next recommended slice: Phase 30A - Owner-controlled creation path planning for `profiles_private` and `anonymous_identities`.

Next required GO:
`GO: Create Phase 29T docs checkpoint commit only.`

## Phase 30A - Owner-Controlled Creation RLS Planning Matrix (2026-06-19)

Result: PASS - docs-only planning completed. No DB command, SQL execution, migration creation/editing/apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Preferred future implementation direction: controlled authenticated RPC/function boundary. Direct INSERT RLS remains a conditional fallback only after a later explicit review proves spoof denial, field mutability, duplicate prevention, rate limits, and abuse controls.

| Scenario | Planned result | Required future mechanism |
| --- | --- | --- |
| Authenticated owner creates own `profiles_private` | ALLOW candidate | Controlled boundary derives `owner_user_id = auth.uid()` and allows only approved profile input fields. |
| Authenticated owner creates profile for another user | DENY | No `owner_user_id` parameter; spoofed owner input impossible or rejected. |
| Duplicate private profile creation | DENY / idempotent | `profiles_private_owner_user_id_key` plus controlled conflict handling. |
| Unauthenticated profile creation | DENY | `auth.uid()` null guard and no anon execute/table write. |
| Authenticated owner creates own `anonymous_identities` row | ALLOW candidate | Controlled boundary derives owner, uses safe non-identifying defaults, and preserves active identity uniqueness. |
| Duplicate active anonymous identity | DENY / idempotent | `anonymous_identities_one_active_per_owner_idx` plus controlled conflict handling. |
| Anonymous identity owner spoof or hijack | DENY | No client owner field; no cross-user UPDATE/INSERT path. |
| Direct table INSERT/UPDATE/DELETE by client | DENY | No broad write grants or write policies unless a separate explicit phase approves a narrower alternative. |
| Cross-user SELECT/inference | DENY | Existing owner SELECT remains owner-bound; creation output must not expose other users' profile or identity state. |
| Public/global/profile/user search | DENY | No public profile, user search, anonymous identity search, global browsing, room/member-directory, or raw profile read path. |

Verification required later:
- `auth.uid()` simulation.
- owner creation positive case.
- spoofed `owner_user_id` denial.
- duplicate private profile denial.
- duplicate active anonymous identity denial.
- unauthenticated denial.
- cross-user isolation.
- direct table write denial.
- rollback/cleanup and persistent test data remaining 0.

Abuse carryover: instant-reply and voice-reply manipulation, Android local-state manipulation, identity farming, and hidden profile/identity inference remain future backend/RLS abuse-control concerns.

Exact next GO:
`GO: Create Phase 30A docs checkpoint commit only.`

## Phase 30B - Owner-Controlled Creation Migration Planning Matrix (2026-06-19)

Result: PASS - docs-only migration planning completed. No DB command, SQL execution, migration creation/editing/apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Preferred future boundary: controlled authenticated functions `public.create_my_private_profile(...)` and `public.create_my_anonymous_identity(...)`. The existing `public.create_owner_identity_foundation(text, text, text)` may be retained only as a reviewed compatibility wrapper.

| Scenario | Planned result | Required future mechanism |
| --- | --- | --- |
| Authenticated owner creates own private profile | ALLOW | Function derives `owner_user_id = auth.uid()` and validates only approved profile fields. |
| Authenticated owner spoofs `owner_user_id` | DENY / impossible | Function signature has no owner argument and ignores any client owner field. |
| Authenticated owner creates profile for another user | DENY | No target-user parameter; conflict and lookup are scoped to `auth.uid()`. |
| Duplicate private profile creation | DENY / safely idempotent | `profiles_private_owner_user_id_key` plus controlled conflict handling. |
| Authenticated owner creates own anonymous identity | ALLOW | Function derives owner from `auth.uid()` and uses safe non-identifying defaults or allowlisted fields. |
| Duplicate active anonymous identity | DENY / safely idempotent | `anonymous_identities_one_active_per_owner_idx` plus controlled conflict handling. |
| Anonymous identity hijack or cross-user linkage | DENY | No target identity or owner parameter; no cross-user lookup output. |
| Unauthenticated creation | DENY | `auth.uid()` null guard and no anon/PUBLIC EXECUTE or table write. |
| Direct table INSERT/UPDATE/DELETE | DENY | No broad write grants and no direct write policies in this planned migration. |
| RPC probing for another user's existence | DENY | Return shape must avoid target IDs and must not expose cross-user profile/identity existence. |
| Public profile/user search or global browsing | DENY | No profile search, user search, public profile, global anonymous directory, or raw `profiles_private` read path. |

SECURITY DEFINER and grant requirements:
- Fixed `search_path`, schema-qualified references, no dynamic SQL, no service-role dependency, and boolean/status/id-only narrow returns.
- Revoke EXECUTE from `public` and `anon`; grant EXECUTE to `authenticated` only for reviewed creation functions.
- Do not grant table INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER to `anon`, `authenticated`, or PUBLIC.

Future verification assertions:
- `auth.uid()` simulation.
- owner positive creation.
- spoofed owner denial.
- duplicate private profile prevention.
- duplicate active anonymous identity prevention.
- unauthenticated denial.
- direct table write denial.
- cross-user inference denial.
- rollback/cleanup and persistent test data remaining 0.

Abuse carryover: instant-reply manipulation, voice-reply manipulation, Android local state, device signals, identity farming, and monetization state must not bypass owner creation, identity separation, reveal consent, or abuse controls.

Next required GO:
`GO: Create Phase 30B docs checkpoint commit only.`
