# PRIVACY_MODEL.md

## Purpose
This document defines the privacy model of ankion.

ankion is built on one core privacy rule:

Users start hidden, connect through voice, and reveal their real profile only when they choose.

## Status
Draft privacy direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/security/SECURITY_RULES.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md

## Core Privacy Principle
Real identity is hidden by default.

The app must separate:
1. Real account
2. Real profile
3. Anonymous Discover identity
4. Anonymous Chat identity
5. Instant media identity
6. Profile visibility permission
7. Storage/media access

Visible content does not automatically mean visible real profile.

## Visibility Rule
Real profile can be visible only if:

approved request + active profile visibility grant + no active block = profile visible

Request status alone is not enough.
UI state alone is not enough.
Coin, follow, Feed interaction, or instant content cannot reveal real profile.

## Privacy States

### 1. Hidden by Default
Default state for all first interactions.

Visible:
- blurred profile image
- anonymous label
- voice bio preview if safe
- interest chips if non-identifying
- Chat CTA
- Feed content if instant-safe

Hidden:
- real name
- clear avatar
- exact age
- city/location
- full bio
- user id
- owner id
- sender id
- raw storage path

### 2. Chat Anonymous State
Chat opens without revealing real profile.

Visible:
- hidden profile label
- blurred/anonymous avatar
- voice messages
- reveal request CTA
- safe system messages

Hidden:
- sender_user_id
- owner_user_id
- real profile id if unsafe
- clear profile data
- raw storage path

### 3. Reveal Request Sent
Requester asked to see profile.

Visible:
- request status
- waiting copy
- allowed actions

Hidden:
- real profile data
- grant internals
- owner/requester raw ids

### 4. Decide Later
Owner delays decision.

Visible:
- waiting state
- calm copy
- Chat remains usable if not blocked

Hidden:
- real profile data

### 5. Stay Hidden
Owner keeps profile hidden.

Visible:
- calm status message
- Chat may continue if not blocked

Allowed copy:
- Profile stayed hidden for now
- You can keep chatting

Avoid:
- Rejected
- Denied
- Access refused

### 6. Revealed
Owner reveals profile.

Visible if active grant and no block:
- clear avatar
- name
- bio
- voice bio
- interest chips
- optional age if allowed
- optional city only if allowed
- profile screen
- top-right chat bubble

Still hidden:
- auth user id
- raw storage path
- private moderation fields
- internal grant records

### 7. Blocked
Block overrides all sensitive access.

If block exists:
- profile visibility closes
- new voice messages disabled
- reveal requests disabled
- signed media access denied where applicable
- interaction actions disabled

## Discover Privacy
Discover must show safe blurred profile cards.

Can show:
- blurred image
- anonymous label
- voice bio preview if safe
- interest chips if non-identifying
- Open Chat CTA

Must not show:
- real name
- clear avatar
- exact age
- city
- full profile
- social handles
- owner_user_id

## Feed / Instant Privacy
Feed can show instant photo/video/audio.

Can show:
- instant media
- media type
- duration
- anonymous instant profile label
- Chat CTA from detail

Must not show:
- real profile
- owner_user_id
- real name
- clear real avatar
- raw storage path

Instant profile is not real profile.

Instant follow does not reveal real profile.

## Chat Privacy
Chat is the main relationship space.

Can show:
- voice messages
- self/other direction
- listened state
- reveal state
- safe profile state

Must not show:
- raw sender id
- raw recipient id
- raw participant ids
- hidden real profile details before permission

## Storage Privacy
Media access must use private storage and signed URLs.

Frontend must not receive:
- raw storage path
- bucket internals
- owner_user_id
- sender_user_id

Frontend may receive:
- short-lived signed URL after access check
- duration
- safe media metadata

## Notification Privacy
Notifications must not leak identity before reveal.

Allowed:
- Someone left you a voice message
- Your profile request has a response
- Someone started a chat from your content

Not allowed:
- Ahmet sent you a voice message
- Real name before reveal
- Clear identity before permission

## Report Privacy
Reports are private safety records.

Users may receive:
- report submitted confirmation

Users must not receive:
- reported_user_id
- reporter_user_id
- moderation internals
- private report details

## Frontend Privacy Rules
Frontend must:
- use safe DTOs
- show only allowed fields
- handle hidden/revealed states
- avoid harsh copy
- never construct storage paths

Frontend must not:
- decide visibility alone
- hide sensitive fields after receiving them
- store raw storage paths
- expose internal ids
- infer identity from Feed/Chat metadata

## Backend Privacy Rules
Backend/RLS/storage must:
- enforce profile visibility
- enforce block override
- enforce signed URL access
- enforce voice limits
- return safe DTOs
- protect raw table fields
- protect storage paths
- prevent identity inference

## Privacy Test Lab Scenarios

Test Lab must verify:

1. Discover does not show real identity.
2. Feed does not show real owner identity.
3. Chat does not expose sender_user_id.
4. Voice media does not expose raw storage path.
5. Reveal request does not reveal profile.
6. Approved request without grant does not reveal profile.
7. Active grant + no block reveals safe profile.
8. Block after reveal hides profile.
9. Instant follow does not reveal real profile.
10. Coin/future entitlement does not reveal profile.
11. Notifications do not leak identity.
12. Reports do not expose moderation fields.
13. File audit logs are not frontend-readable.

## Explicit Privacy Non-Goals for MVP
Do not implement:
- public real profile browsing
- paid real profile reveal
- global reveal
- dating match reveal
- public report visibility
- public storage URLs
- location-heavy discovery
- public follower identity reveal tied to real profile

## Success Criteria
Privacy model is successful if:

1. Real profile is hidden by default.
2. Anonymous discovery works without identity leak.
3. Chat works without exposing raw identity.
4. Reveal requires active grant and no block.
5. Block overrides visibility.
6. Instant media does not reveal real profile.
7. Storage paths never reach frontend.
8. Notifications stay identity-safe.
9. Reports stay private.
10. Test Lab can verify privacy risks.

## Notes
Privacy is not a feature layer; it is part of ankion's core product identity.

If a future feature weakens anonymous start, permission-based reveal, block override, or storage privacy, it must be deferred.
