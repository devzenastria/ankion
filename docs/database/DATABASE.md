# DATABASE.md

## Purpose
This document defines the high-level database model direction for ankion.

The database must support ankion's approved product flows:

- real account and hidden profile
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice-first Chat
- 21-second voice messages
- daily voice limits
- permission-based profile reveal
- active visibility grants
- block override
- instant photo/video/audio Feed
- instant profile layer separate from real profile
- private storage and signed URL safety
- reporting and auditability
- Test Lab verification

This document is a planning artifact only.

## Status
Draft database direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/architecture/ARCHITECTURE.md
- docs/architecture/TECH_STACK_DECISION.md
- docs/architecture/MONOREPO_STRUCTURE.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md

## Database Foundation
ankion will use Supabase Postgres.

Approved direction:
- Supabase Auth for authentication
- Postgres for relational data
- RLS for data access control
- safe RPC/views/DTOs for sensitive frontend flows
- Supabase Storage for private media
- signed URLs for controlled media access

Important:
Frontend must not rely on raw sensitive table reads.

The database must not expose identity-sensitive fields such as:
- sender_user_id
- owner_user_id
- raw_storage_path
- auth_user_id
- private moderation fields
- hidden real profile fields before reveal

## Core Database Principle
The database must separate:

1. Real identity
2. Anonymous discovery identity
3. Chat interaction
4. Profile visibility permission
5. Instant media identity
6. Storage metadata
7. Safety and audit data

The app must never treat visible instant content as permission to see the real profile.

Core rule:

instant content visible does not mean real profile visible.

Core reveal rule:

approved request + active profile visibility grant + no active block = profile visible

## Main Data Domains

### 1. Auth Domain
Supabase Auth owns authentication identity.

Database must support app-level profile records linked to auth users.

Expected concerns:
- user account ownership
- profile ownership
- account lifecycle
- future membership/subscription linkage
- abuse prevention

Auth user IDs are sensitive and must not be exposed unnecessarily.

### 2. Real Profile Domain
Real profiles store the user's actual profile information.

Profile is real but hidden before permission.

Expected data:
- profile owner
- display name
- username
- avatar/media reference
- voice bio reference
- bio
- date of birth
- gender
- optional location/city if later approved
- interests
- profile completion status

Before reveal, frontend must not receive:
- real name
- clear avatar
- exact age
- exact city
- full bio
- owner_user_id

After valid reveal, frontend may receive safe allowed profile fields.

### 3. Anonymous Discovery Domain
Discover must show blurred profile previews without exposing real identity.

Expected data behavior:
- safe anonymous profile card
- blurred/hidden avatar reference
- voice bio preview if safe
- interest chips if non-identifying
- anonymous label
- open chat CTA target

This may be produced through safe views/RPCs rather than direct raw table reads.

### 4. Chat / Thread Domain
Chat is ankion's central interaction hub.

The database must support anonymous chat/thread records.

Chat can originate from:
- Discover profile tap
- Instant Content Detail
- existing revealed profile chat bubble

Chat must support:
- hidden profile state
- voice messages
- reveal request state
- reveal decision state
- profile revealed state
- block/report actions
- safe continuation after decide later / stay hidden

Important:
Chat should not expose raw sender/owner identities to the wrong user.

### 5. Voice Message Domain
Voice messages are sent inside Chat.

Voice message data must support:
- chat/thread context
- voice media reference
- duration
- sender relationship
- listened state
- created time
- safety/report status
- storage reference protected from frontend

MVP voice rules:
- maximum duration: 21 seconds
- daily send limit: 7
- same-recipient daily limit: 3

Limits must be enforced server-side, not only in UI.

### 6. Voice Limit Domain
Voice limits must be trackable server-side.

The database must support:
- per-user daily send count
- per-same-recipient daily send count
- reset by account/membership day or date boundary
- future membership extension if approved

The UI can show remaining limits, but the database/backend must enforce them.

### 7. Reveal Request Domain
Reveal requests belong to Chat context.

Expected states:
- pending
- decide_later
- stayed_hidden
- revealed / approved decision marker

Important:
Request status is not the same as profile visibility.

Wrong:
request approved = profile visible

Correct:
request approved + active grant + no block = profile visible

### 8. Profile Visibility Grant Domain
Visibility grant is the actual permission record.

A grant must be:
- scoped to viewer and profile owner
- scoped to relationship/context if needed
- active/inactive or revocable
- blocked by block records
- checked before returning real profile DTO

Grant must not reveal profile globally.

### 9. Block Domain
Block overrides interaction and visibility.

Database must support block checks for:
- voice message creation
- reveal request creation
- profile view
- existing grant usage
- signed media URL access where applicable
- Feed/instant interaction where applicable

Block is stronger than reveal grant.

### 10. Report / Moderation Domain
Reports are required for safety.

Reports may relate to:
- voice message
- chat
- real profile
- instant post
- instant profile

Reports must not leak reported_user_id or other sensitive identifiers to unauthorized users.

### 11. Instant Profile Domain
Instant profile is separate from real profile.

Instant profile supports anonymous media identity.

Expected behavior:
- can be followed
- can show instant content
- does not reveal real profile
- may have anonymous avatar/label
- links to real owner internally but must not expose owner_user_id

### 12. Instant Post Domain
Instant posts support:
- photo
- video
- audio

Feed uses instant posts.

Instant post must support:
- media type
- safe media reference
- caption if allowed
- duration for audio/video
- created time
- anonymous owner preview
- report/block behavior

Instant post must not expose:
- owner_user_id
- raw_storage_path
- real profile fields before reveal

### 13. Instant Follow Domain
Instant profiles can be followed.

Follow must not:
- reveal real profile
- create visibility grant
- bypass reveal flow
- bypass block

Follow may support:
- followed feed
- future follower-view feature
- safe notifications

### 14. Coin / Entitlement Domain
Coin and follower-view systems are future-sensitive.

MVP should not implement payment system.

Database planning may reserve conceptual room for:
- coin ledger
- follower-view entitlement

But:
- coin must not reveal real profile
- coin must not create visibility grant
- coin must not bypass block
- coin must not expose owner identity

### 15. Notification Domain
Notifications must be identity-safe.

Allowed examples:
- Someone left you a voice message
- Your profile request has a response
- Profile is now visible
- Someone started a chat from your content
- A followed instant profile shared new content

Notifications must not expose real identity before reveal.

### 16. Storage Metadata / Audit Domain
Media storage must be private and auditable.

Expected media categories:
- voice messages
- voice bio
- instant audio
- instant images
- instant videos
- profile/avatar media

Database must support:
- safe media reference
- storage bucket/path internally
- file type
- owner relation internally
- access audit if needed
- signed URL issue tracking if needed

Frontend must not receive raw storage path.

## Expected Future Table Areas
Detailed tables will be defined later in TABLES.md.

Expected future table areas may include:

- profiles
- profile_interests
- voice_bios
- chat_threads
- chat_participants or anonymous_thread_members
- voice_messages
- voice_listens
- voice_daily_limits
- reveal_requests
- profile_visibility_grants
- blocks
- reports
- instant_profiles
- instant_posts
- instant_follows
- notifications
- file_audit_logs
- future coin_ledger
- future follower_view_entitlements

This list is directional, not final schema.

## Safe DTO / View Direction
Frontend should consume safe DTOs or safe views/RPC results.

Expected safe responses:
- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

Safe responses must hide:
- sender_user_id
- owner_user_id
- raw_storage_path
- auth_user_id
- private moderation fields
- hidden profile fields before grant

## Backend / Database Behavior Expectations

### Discover to Chat
Database/backend must support:
- safe discover profile listing
- create/find chat from profile card
- keep real profile hidden
- avoid recipient picker

### Feed to Detail to Chat
Database/backend must support:
- safe feed tile listing
- safe instant content detail
- create/find chat from instant content detail
- keep instant owner identity hidden

### Voice Message Creation
Database/backend must support:
- chat context validation
- voice duration limit
- daily user limit
- same-recipient limit
- block check
- private media reference
- safe DTO response

### Reveal Request
Database/backend must support:
- reveal request creation inside chat
- duplicate request prevention
- owner decision
- decide later
- stay hidden
- reveal action
- active grant creation only when owner reveals

### Profile View
Database/backend must support:
- active grant check
- block check
- safe profile DTO
- hidden response when no permission

### Block / Report
Database/backend must support:
- blocking relationship
- disabling interactions
- disabling profile visibility
- disabling signed URL where applicable
- reporting content and users safely

## RLS Impact
RLS must be designed around database domains.

RLS must answer:
- Who can select this row?
- Who can insert this row?
- Who can update this row?
- Who can delete this row?
- Which fields must never be exposed?
- Is a safe view/RPC required instead?
- Does block override access?
- Does reveal grant affect access?
- Does storage path need special protection?

Important:
RLS policy matrix must be written before migrations are implemented.

## Storage Impact
Database and storage must work together.

Storage rules:
- private buckets
- short-lived signed URLs
- safe paths
- no sender_user_id in unsafe paths
- no owner_user_id in unsafe paths
- no raw path returned to frontend

Correct path examples:
- voice-messages/{chat_or_safe_context_id}/{message_id}.m4a
- instant-voice/{instant_profile_id}/{post_id}.m4a
- instant-images/{instant_profile_id}/{post_id}.jpg
- instant-videos/{instant_profile_id}/{post_id}.mp4

Wrong path examples:
- voice-messages/{sender_user_id}/{message_id}.m4a
- instant-images/{owner_user_id}/{post_id}.jpg
- public/{real_profile_id}/{file}.jpg

## Test Lab Impact
Database planning must support Test Lab scenarios.

Test Lab must verify:
- hidden profile before reveal
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice duration limit
- daily voice limit
- same-recipient voice limit
- reveal request state
- active grant requirement
- block override
- coin cannot reveal profile
- instant follow cannot reveal profile
- raw storage path not returned
- owner_user_id/sender_user_id not returned

## Explicit Database Non-Goals for MVP
Do not design MVP database around:

- dating swipe/match system
- public comments
- public likes as a main feature
- live streaming rooms
- paid real-profile unlock
- advanced coin economy
- AI personality analysis
- full recommendation engine
- public real profile browsing
- full text-first chat platform
- group chat

These may be future ideas only if explicitly approved.

## Database Success Criteria
The database direction is successful if:

1. Real account and hidden profile are supported.
2. Discover can show safe blurred profile previews.
3. Feed can show safe instant media grid.
4. Chat can be created from Discover or Instant Detail.
5. Voice messages are stored in Chat context.
6. Voice limits can be enforced server-side.
7. Reveal request is separate from visibility.
8. Visibility grant controls real profile access.
9. Block overrides visibility and interaction.
10. Instant profile is separate from real profile.
11. Storage paths do not leak identity.
12. Frontend can consume safe DTOs only.
13. RLS can be planned table-by-table.
14. Test Lab can verify critical database/security flows.

## Notes
Database design must serve the approved product.

If a schema shortcut exposes identity, weakens reveal permission, bypasses block, or returns raw storage paths, it must not be used.
