# TEST_LAB.md

## Purpose
This document defines ankion's localhost-only visual Test Lab.

Test Lab will be a browser-based development QA area used to verify product, privacy, security, RLS, storage, chat, reveal, instant media, and voice-limit flows.

It must not be enabled in production.

## Status
Draft Test Lab direction.

Implementation has not started.

## Core Rule
Test Lab is development-only.

Expected future route:

/dev/test-lab

Expected future host:

apps/web

Rules:
- localhost-only
- disabled in production
- no production secrets
- no real user data
- no security bypass in production
- visual PASS / FAIL cards
- scenario-based testing
- safe fake users and fake media only

## Why Test Lab Exists
ankion has high-risk flows:

- real profile hidden before reveal
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice-first Chat
- 21-second voice limit
- daily 7 voice limit
- same-recipient 3 voice limit
- reveal request
- active grant requirement
- block override
- instant content anonymity
- storage signed URL safety
- RLS leak prevention

These must be visually verified during development.

## Test Lab Main Sections

### 1. Environment Guard
Checks:
- running on localhost
- not production
- test mode enabled
- fake seed data only

Expected:
- PASS if localhost
- FAIL CLOSED if production

### 2. Auth & Profile
Checks:
- fake User A exists
- fake User B exists
- both have profiles
- profiles are hidden by default
- profile completion exists

### 3. Discover to Chat
Scenario:
User A sees User B as blurred Discover card.

Checks:
- real name hidden
- clear avatar hidden
- owner_user_id hidden
- card opens Chat directly
- no recipient picker appears

### 4. Feed to Detail to Chat
Scenario:
User A taps a Feed tile.

Checks:
- Feed is 3-column photo/video/audio grid
- no Live tab
- tile opens Instant Content Detail
- owner identity hidden
- Chat CTA opens anonymous Chat
- no recipient picker appears

### 5. Chat Room
Checks:
- Chat opens in hidden profile state
- blurred avatar shown
- voice send available
- profile reveal CTA available
- sender_user_id not exposed
- owner_user_id not exposed

### 6. Voice Limits
Checks:
- 21-second voice accepted
- over 21 seconds denied
- daily 7 voice limit enforced
- same-recipient 3 voice limit enforced
- UI shows remaining safe count
- backend is source of truth

### 7. Reveal Request
Checks:
- request created inside Chat
- real profile remains hidden
- status shown safely
- requester_user_id hidden where unsafe
- profile_owner_user_id hidden where unsafe

### 8. Decide Later
Checks:
- request remains available
- profile hidden
- Chat can continue
- calm copy used

Allowed copy:
- Waiting for response
- You can keep chatting

### 9. Stay Hidden
Checks:
- profile remains hidden
- no harsh copy
- no "Rejected"
- no "Denied"
- Chat can continue unless blocked

Allowed copy:
- Profile stayed hidden for now
- You can keep chatting

### 10. Approved Without Grant
Critical test.

Checks:
- reveal request may appear approved
- no active visibility grant exists
- profile must remain hidden

Expected:
PASS only if profile stays hidden.

### 11. Revealed With Grant
Checks:
- active visibility grant exists
- no block exists
- profile becomes visible
- safe profile DTO returned
- full profile opens
- top-right chat bubble returns to same Chat

### 12. Block Override
Checks:
- grant exists
- block exists
- profile hidden again
- voice send disabled
- reveal request disabled
- signed URL access denied where applicable

### 13. Instant Follow
Checks:
- User A follows instant profile
- real profile remains hidden
- no visibility grant created
- owner_user_id not exposed

### 14. Coin / Future Entitlement
Checks:
- fake coin/entitlement exists
- no active grant exists
- real profile remains hidden

Rule:
Coin cannot reveal real profile.

### 15. Storage Signed URL
Checks:
- raw_storage_path never returned
- storage_path never returned
- signed URL returned only if access allowed
- signed URL denied after block where applicable
- file_audit_logs not readable from frontend

### 16. RLS Leak Tests
Checks frontend responses never include:
- sender_user_id
- owner_user_id
- profile_owner_user_id
- viewer_user_id
- requester_user_id
- blocker_user_id
- blocked_user_id
- reporter_user_id
- reported_user_id
- raw_storage_path
- storage_path
- private moderation fields

### 17. Notifications
Checks:
- identity-safe notification copy
- no real name before reveal
- notification target does not leak unsafe ids

Allowed:
- Someone left you a voice message
- Your profile request has a response
- Someone started a chat from your content

### 18. Reports
Checks:
- report can be submitted
- only safe confirmation shown
- reported_user_id not exposed
- moderation internals not exposed

## Visual Test Card Format
Each Test Lab card should eventually show:

- Test name
- Scenario summary
- Current state
- Expected result
- Actual result
- PASS / FAIL
- Risk level
- Related docs
- Debug payload preview with sensitive fields redacted

Example card fields:

Test:
Discover card identity leak check

Expected:
No real name, owner_user_id, or clear avatar before reveal.

Actual:
Safe anonymous DTO returned.

Result:
PASS

## Required PASS / FAIL Categories

Use these categories:

- Product Flow
- Privacy
- RLS
- Storage
- Voice Limit
- Reveal
- Block
- Instant Media
- Notification
- Report
- Production Guard

## Production Guard
Test Lab must fail closed in production.

Expected behavior:
- route unavailable
- no test actions visible
- no fake bypass exposed
- no sensitive debug data available

If production environment is detected:
Result must be:
FAIL CLOSED / DISABLED

## Seed Data Direction
Future Test Lab may use fake data:

- Fake User A
- Fake User B
- Fake User C blocked user
- Fake hidden profile
- Fake revealed profile
- Fake instant profile
- Fake instant posts
- Fake voice messages
- Fake reveal request
- Fake visibility grant
- Fake block
- Fake report
- Fake file audit records

Rules:
- no real user data
- no production media
- no real personal data
- all demo data clearly fake

## Test Lab Must Not
Test Lab must not:

- run in production
- use real user data
- expose service role secrets
- bypass RLS in production
- return raw storage paths
- expose internal user ids
- become an admin dashboard
- become a production feature
- hide failed tests silently

## Relationship With Other Docs
Test Lab must verify decisions from:

- MVP_CORE.md
- CHAT_FLOW.md
- REVEAL_FLOW.md
- INSTANT_FLOW.md
- RLS_POLICIES.md
- STORAGE.md
- SECURITY_RULES.md
- PRIVACY_MODEL.md
- RISK_CONTROL.md

## Minimum Test Lab MVP
The first Test Lab implementation later should include these cards:

1. Environment Guard
2. Discover to Chat
3. Feed to Detail to Chat
4. Chat Hidden Profile
5. Voice Limit
6. Reveal Request
7. Approved Without Grant
8. Grant Reveals Profile
9. Block Overrides Grant
10. Instant Follow Cannot Reveal
11. Storage Raw Path Leak
12. RLS Sensitive Field Leak
13. Production Disabled

## Success Criteria
Test Lab is successful if:

1. Critical flows are visible in browser.
2. Tests are not console-only.
3. PASS / FAIL states are obvious.
4. Hidden profile behavior is verified.
5. Reveal grant logic is verified.
6. Block override is verified.
7. Voice limits are verified.
8. Storage path leaks are detected.
9. RLS leaks are detected.
10. Test Lab is disabled in production.
11. Codex can implement each test card later as small isolated tasks.

## Notes
Test Lab is not a nice-to-have.

For ankion, Test Lab is a risk-control layer.

If a critical privacy/security flow cannot be visually verified, it is not ready for implementation or beta.
