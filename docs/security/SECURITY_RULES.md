# SECURITY_RULES.md

## Purpose
This document defines the general security rules for ankion.

ankion is a voice-first anonymous social discovery app. Security must protect:
- real identity
- hidden profiles
- chat anonymity
- profile reveal permission
- instant content anonymity
- private media storage
- signed URL access
- block/report safety
- frontend-safe DTO behavior

## Status
Draft security direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/database/DATABASE.md
- docs/database/TABLES.md
- docs/database/RELATIONSHIPS.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md

## Core Security Principle
ankion must be secure by backend design, not by frontend hiding.

Wrong model:
- Frontend receives sensitive fields.
- UI hides them visually.
- Client decides whether profile is visible.

Correct model:
- Backend/RLS/storage policies prevent unsafe access.
- Safe RPC/views return safe DTOs.
- Frontend receives only allowed fields.
- Real profile visibility is decided server-side.

## Non-Negotiable Security Rules

### 1. Real Profile Hidden by Default
Real profile data must stay hidden until permission exists.

Before reveal, do not expose:
- real name
- clear avatar
- exact age
- city/location
- full bio
- owner_user_id
- auth_user_id
- real profile id if unsafe

### 2. Reveal Requires Grant
Profile reveal requires:

approved request + active profile visibility grant + no active block = profile visible

Rules:
- Request status alone is not enough.
- UI status alone is not enough.
- Grant is required.
- Block overrides grant.

### 3. Block Overrides Everything
If block exists, it must override:
- chat actions
- voice sending
- reveal requests
- profile visibility
- active grants
- signed media access where applicable
- instant interactions where applicable

### 4. Instant Content Is Not Real Profile
Instant photo/video/audio may be visible, but real profile stays hidden.

Rules:
- instant profile is separate from real profile
- instant follow does not reveal real profile
- instant engagement does not reveal real profile
- instant content metadata must not expose owner identity

### 5. No Raw Storage Path to Frontend
Frontend must never receive:
- raw_storage_path
- storage_path
- bucket internals
- owner_user_id in file metadata
- sender_user_id in file metadata

Frontend may receive:
- short-lived signed URL after access check

### 6. No Sensitive Raw Table Access
Frontend must not consume raw sensitive rows for:
- profiles
- chat_participants
- voice_messages
- reveal_requests
- profile_visibility_grants
- blocks
- reports
- instant_profiles
- instant_posts
- file_audit_logs

Use safe DTOs instead.

### 7. Voice Limits Enforced Server-Side
Voice rules:
- maximum duration: 21 seconds
- daily voice limit: 7 per user
- same-recipient daily limit: 3

These must not rely only on UI.

### 8. Reports Are Private
Report data must be highly restricted.

Do not expose:
- reported_user_id
- reporter_user_id
- moderation internals
- private report details

### 9. Notifications Must Not Leak Identity
Before reveal, notifications must use safe copy.

Allowed:
- Someone left you a voice message
- Your profile request has a response
- Someone started a chat from your content

Not allowed:
- Real name before reveal
- Clear identity before reveal

### 10. Test Lab Must Stay Localhost-Only
Test Lab is required for QA but must not be production-enabled.

Rules:
- localhost-only
- disabled in production
- no real user data
- no production secrets
- no security bypasses in production app

## Sensitive Field Protection

Fields requiring strict protection:

- auth_user_id
- user_id
- sender_user_id
- owner_user_id
- profile_owner_user_id
- viewer_user_id
- requester_user_id
- recipient_user_id
- blocker_user_id
- blocked_user_id
- reporter_user_id
- reported_user_id
- raw_storage_path
- storage_path
- file audit internals
- signed URL audit internals
- moderation internals
- hidden profile fields before reveal

## Safe DTO Requirement

Sensitive flows must return safe DTOs.

Required safe DTO concepts:
- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

Safe DTOs must answer:
- What can this user see?
- What actions are allowed?
- Is profile visible?
- Is block active?
- Is media URL allowed?
- What calm status copy should be shown?

Safe DTOs must not include:
- hidden identity fields
- raw storage paths
- private grant internals
- private report internals
- moderation internals

## Security Rules by Product Flow

### Discover to Chat
Security requirements:
- Discover card must not show real identity.
- Tap opens Chat directly.
- Chat opens in hidden profile state.
- No recipient picker.
- No raw profile table exposure.
- Safe discover DTO required.

### Feed to Detail to Chat
Security requirements:
- Feed tile must not expose owner identity.
- Instant Content Detail must not expose real profile.
- Chat CTA opens anonymous Chat.
- Instant profile remains separate from real profile.
- Safe feed/detail DTO required.

### Chat
Security requirements:
- Only participants can access Chat.
- Hidden participant identity must not leak.
- Voice messages must show self/other, not raw sender_user_id.
- Reveal request state must be safe.
- Block disables unsafe actions.

### Voice Message
Security requirements:
- sender_user_id hidden.
- raw storage path hidden.
- playback through safe signed URL.
- server-side limit enforcement.
- block check before send/playback where applicable.

### Reveal Request
Security requirements:
- request inside Chat.
- owner controls decision.
- stay hidden / decide later use calm copy.
- request approval does not equal profile visibility.
- active grant required.
- block overrides grant.

### Profile View
Security requirements:
- check active grant.
- check no block.
- return safe profile DTO only.
- hide profile if permission missing.
- do not expose auth/user ids.

### Instant Profile
Security requirements:
- owner_user_id hidden.
- real profile not exposed.
- follow does not create grant.
- coin/future entitlement does not reveal profile.

### Storage
Security requirements:
- private storage.
- safe paths.
- short-lived signed URLs.
- no raw path to frontend.
- block prevents access where applicable.

### Reports
Security requirements:
- report data private.
- reporter/reported ids hidden.
- only safe confirmation returned.

## Backend Enforcement Requirements

Backend or safe RPC/action layer must enforce:

- profile visibility
- reveal grant check
- block override
- voice duration
- daily voice limit
- same-recipient voice limit
- chat participant access
- signed URL access
- instant profile separation
- report privacy
- notification safety

Frontend must not be trusted to enforce these alone.

## Frontend Security Rules

Frontend must:
- use safe DTOs
- show calm copy
- handle hidden/revealed states
- handle expired signed URLs gracefully
- never construct storage paths
- never infer visibility from UI state alone

Frontend must not:
- decide reveal visibility alone
- hide sensitive raw fields after receiving them
- store raw storage paths
- expose user ids
- expose owner ids
- expose report ids/internals
- treat instant follow as profile access

## Storage Security Rules

Storage rules:
- private by default
- short-lived signed URLs
- safe path identifiers
- no user id in unsafe path
- no owner_user_id in unsafe path
- no sender_user_id in unsafe path
- no raw path returned
- file audit logs private

Good path examples:
- voice-messages/{chat_thread_id}/{voice_message_id}.m4a
- instant-images/{instant_profile_id}/{post_id}.jpg
- instant-videos/{instant_profile_id}/{post_id}.mp4

Bad path examples:
- voice-messages/{sender_user_id}/{message_id}.m4a
- instant-images/{owner_user_id}/{post_id}.jpg
- public/{real_profile_id}/{file}.jpg

## RLS Security Rules

Every sensitive table must answer:
1. Who can SELECT?
2. Who can INSERT?
3. Who can UPDATE?
4. Who can DELETE?
5. Does block override access?
6. Does reveal grant affect access?
7. Is a safe DTO/RPC/view required?
8. Could this row leak identity?
9. Could this row leak storage path?
10. Should frontend ever see raw rows?

RLS must not be skipped.

## Abuse Prevention Rules

MVP safety basics:
- real account required
- profile required before interaction
- block/report available
- voice limits enforced
- private media storage
- report content/user targets
- no public real profile browsing
- no anonymous unlimited sending

Future abuse controls may include:
- rate limits
- device/session checks
- moderation queues
- media scanning
- spam detection

Do not overbuild these before MVP unless required.

## Copy / UX Security Rules

Use calm security language.

Allowed:
- Profile stayed hidden for now
- You can keep chatting
- This media is unavailable right now
- Waiting for response
- The choice is yours

Avoid:
- Rejected
- Denied
- Access refused
- Permission failed
- You were blocked
- User rejected you
- Security violation

## Test Lab Security Scenarios

Test Lab must verify:

1. Real profile hidden by default.
2. Discover card safe.
3. Feed tile safe.
4. Chat opens without identity leak.
5. Voice sender_user_id not exposed.
6. Raw storage path not returned.
7. Reveal request does not reveal profile.
8. Approved request without grant does not reveal profile.
9. Active grant + no block reveals profile.
10. Block after reveal hides profile.
11. Instant content does not reveal real profile.
12. Instant follow does not reveal real profile.
13. Coin/future entitlement does not reveal profile.
14. Reports do not expose reported_user_id.
15. Notifications do not leak real identity.
16. File audit logs not readable.
17. Test Lab disabled in production.

## Explicit Security Non-Goals for MVP

Do not build in MVP:
- paid real-profile unlock
- public profile browsing
- dating-style match reveal
- global profile reveal
- public report browsing
- public moderation dashboard
- public media buckets
- live streaming moderation
- complex AI risk scoring
- full admin system

## Security Success Criteria

Security model is successful if:

1. Real profile is hidden by default.
2. Profile visibility requires active grant and no block.
3. Block overrides all sensitive access.
4. Instant profile never exposes real profile.
5. Voice messages do not expose sender identity.
6. Storage paths are never returned.
7. Signed URLs are short-lived and access-checked.
8. Reports remain private.
9. Notifications do not leak identity.
10. Frontend consumes safe DTOs.
11. RLS protects sensitive tables.
12. Test Lab verifies critical leak scenarios.

## Notes
Security is part of ankion's product identity.

If a shortcut weakens anonymity, reveal permission, block override, RLS, storage privacy, or safe DTO behavior, it must not be used.
