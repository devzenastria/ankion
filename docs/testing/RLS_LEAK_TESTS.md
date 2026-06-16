# RLS_LEAK_TESTS.md

## Purpose
This document defines ankion's RLS and sensitive data leak test plan.

ankion depends on anonymous start, hidden real profiles, permission-based reveal, private storage, and safe DTOs.

RLS leak tests must verify that frontend responses never expose sensitive identity, relationship, storage, moderation, or grant internals.

## Status
Draft RLS leak test direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/security/RLS_POLICIES.md
- docs/security/SECURITY_RULES.md
- docs/security/PRIVACY_MODEL.md
- docs/security/STORAGE.md
- docs/security/RISK_CONTROL.md
- docs/database/TABLES.md
- docs/database/RELATIONSHIPS.md
- docs/testing/TEST_LAB.md
- docs/testing/TEST_SCENARIOS.md

## Core Leak Test Principle
Frontend must receive safe DTOs, not raw sensitive rows.

Wrong:
Frontend receives sensitive fields and hides them visually.

Correct:
Backend/RLS/RPC/view layer prevents sensitive fields from being returned at all.

## Critical Never-Leak Fields

These fields must never appear in unsafe frontend payloads:

- auth_user_id
- user_id where it reveals real identity
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
- bucket_name where unsafe
- file audit internals
- signed URL audit internals
- moderation internals
- hidden real profile fields before reveal
- raw profile_visibility_grants internals
- raw reveal_requests internals where unsafe

## Safe DTOs To Test

Leak tests must inspect payloads from these future safe DTOs:

- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

## Test Group 1: Discover Leaks

### Test 1.1: Discover Profile Does Not Leak Real Identity
Expected safe payload must not include:
- real name
- clear avatar
- exact age
- exact city
- owner_user_id
- auth_user_id
- raw profile id if unsafe

Allowed:
- blurred avatar token
- anonymous label
- safe voice bio preview
- safe interest chips
- Open Chat target

Result:
PASS only if all sensitive identity fields are absent.

### Test 1.2: Discover Open Chat Target Is Safe
Expected:
- Chat can open from Discover.
- Target reference must not reveal raw owner identity.

Must not include:
- owner_user_id
- real profile owner id
- unsafe raw profile id

## Test Group 2: Feed / Instant Leaks

### Test 2.1: Feed Tile Does Not Leak Owner Identity
Expected safe payload must not include:
- owner_user_id
- real profile id
- real name
- clear real avatar
- raw_storage_path
- storage_path

Allowed:
- instant_post_id
- media_type
- duration
- anonymous owner label
- safe media display reference

### Test 2.2: Instant Content Detail Does Not Leak Real Profile
Expected:
- media can be shown if safe
- real owner remains hidden

Must not include:
- owner_user_id
- real profile fields
- raw storage path
- file audit internals

### Test 2.3: Instant Follow Does Not Create Profile Visibility
Expected:
- following instant profile does not create active visibility grant
- real profile remains hidden

Must not expose:
- owner_user_id
- profile_visibility_grants raw row

## Test Group 3: Chat Leaks

### Test 3.1: Chat Summary Does Not Leak Participants
Expected safe chat summary must not include:
- raw participant user ids
- owner_user_id
- sender_user_id
- hidden real profile fields

Allowed:
- safe chat id
- anonymous label
- hidden/revealed state
- last safe activity
- unread count

### Test 3.2: Chat Room Does Not Leak Hidden Identity
Before reveal, chat room payload must not include:
- real name
- clear avatar
- sender_user_id
- owner_user_id
- profile_owner_user_id
- raw participant ids
- raw storage paths

Allowed:
- blurred avatar
- hidden profile label
- self/other message direction
- safe reveal state
- safe voice metadata

### Test 3.3: Voice Message Does Not Leak Sender
Voice message payload must not include:
- sender_user_id
- owner_user_id
- raw_storage_path
- storage_path

Allowed:
- message id
- self/other direction
- duration
- listened state
- signed URL only if allowed

## Test Group 4: Reveal Leaks

### Test 4.1: Reveal Request Does Not Reveal Profile
After request is sent, profile remains hidden.

Payload must not include:
- real profile data
- owner_user_id
- requester_user_id if unsafe
- profile_owner_user_id
- raw reveal request internals

Allowed:
- safe request state
- waiting status
- allowed actions
- calm copy

### Test 4.2: Approved Request Without Grant Does Not Reveal Profile
Expected:
- reveal request may appear approved/decided
- no active visibility grant exists
- profile remains hidden

PASS only if safe_profile_view returns visible: false.

### Test 4.3: Active Grant With No Block Reveals Safe Profile
Expected:
- active grant exists
- no block exists
- safe profile DTO returns allowed fields only

Allowed after reveal:
- clear avatar
- name
- bio
- voice bio
- interest chips
- optional age/city only if allowed

Still not allowed:
- auth_user_id
- owner_user_id
- raw grant internals
- raw storage path
- moderation internals

### Test 4.4: Block After Grant Hides Profile
Expected:
- active grant exists
- block exists
- profile becomes hidden again

PASS only if visible: false and profile media access is denied where applicable.

## Test Group 5: Grant / Block Leaks

### Test 5.1: Raw Grant Internals Are Not Returned
Frontend must not receive:
- profile_visibility_grants raw rows
- viewer_user_id
- profile_owner_user_id
- reveal_request_id internals
- grant status internals where unsafe

Allowed:
- visible: true/false
- safe profile fields if visible

### Test 5.2: Block Internals Are Not Broadly Exposed
Frontend may receive:
- current relationship blocked: true/false
- allowed actions disabled

Must not receive:
- blocker_user_id
- blocked_user_id
- raw block row internals

## Test Group 6: Storage Leaks

### Test 6.1: Raw Storage Path Never Returned
No payload may include:
- raw_storage_path
- storage_path
- bucket internals
- file audit internals

PASS only if raw path is absent from all frontend responses.

### Test 6.2: Signed URL Only After Access Check
Expected:
- authorized user receives short-lived signed URL
- unauthorized user does not
- blocked user does not receive new signed URL where applicable

### Test 6.3: File Audit Logs Are Not Frontend-Readable
Frontend must not receive:
- file_audit_logs raw rows
- bucket_name
- storage_path
- owner_user_id
- access audit internals

## Test Group 7: Reports / Notifications

### Test 7.1: Reports Do Not Leak Moderation Internals
After report submission, frontend may receive:
- safe confirmation

Must not receive:
- reporter_user_id
- reported_user_id
- moderation status internals
- private report details

### Test 7.2: Notifications Do Not Leak Identity Before Reveal
Allowed copy:
- Someone left you a voice message
- Your profile request has a response
- Someone started a chat from your content

Not allowed:
- real name before reveal
- owner identity before reveal
- unsafe target ids

## Test Group 8: Future Entitlement / Coin Leaks

### Test 8.1: Coin Cannot Reveal Profile
Expected:
- fake coin/entitlement exists
- no active visibility grant exists
- profile remains hidden

PASS only if visible: false.

### Test 8.2: Follower-View Cannot Reveal Real Profile
Expected:
- follower-view/future entitlement may affect instant profile features
- real profile remains hidden unless active grant and no block

## Test Group 9: Production Guard Leaks

### Test 9.1: Test Lab Disabled In Production
Expected:
- `/dev/test-lab` unavailable in production
- no debug payloads visible
- no fake bypass visible
- no test actions available

PASS only if production fails closed.

## Debug Payload Redaction Rules

Test Lab debug payload previews must redact:

- any key ending with `_user_id`
- auth_user_id
- user_id when unsafe
- storage_path
- raw_storage_path
- bucket_name when unsafe
- file audit internals
- moderation internals
- grant internals
- report internals

Redaction display:
- `[REDACTED]`

## PASS / FAIL Rules

A leak test is PASS only if:
- sensitive fields are absent or redacted
- safe DTO matches expected visibility
- no hidden identity appears
- no raw storage path appears
- block/reveal/permission logic is respected

A leak test is FAIL if:
- any sensitive field appears
- profile is visible without grant
- profile remains visible after block
- storage path appears
- notification exposes identity
- report exposes moderation data
- Test Lab runs in production

## Minimum First Implementation Leak Tests

When implementation starts later, first RLS leak tests should cover:

1. Discover owner_user_id leak
2. Feed owner_user_id leak
3. Chat sender_user_id leak
4. Voice raw_storage_path leak
5. Reveal approved-without-grant leak
6. Grant visible profile safe DTO
7. Block after grant
8. File audit logs not readable
9. Report internals not returned
10. Test Lab production disabled

## Success Criteria
RLS leak testing is successful if:

1. Frontend never receives raw sensitive ids.
2. Frontend never receives raw storage paths.
3. Hidden profile data remains hidden before grant.
4. Approved request without grant does not reveal profile.
5. Active grant reveals only safe profile fields.
6. Block overrides grant.
7. Instant content does not reveal real profile.
8. Reports and notifications stay safe.
9. Test Lab debug previews redact sensitive fields.
10. Production Test Lab is disabled.

## Notes
Leak tests are not optional.

If a field leaks in Test Lab, the related flow must be fixed before implementation continues or beta testing begins.
