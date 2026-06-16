# TEST_SCENARIOS.md

## Purpose
This document defines ankion's planned test scenarios.

These scenarios will later be implemented in the localhost-only Test Lab and supporting QA checks.

Tests must verify product behavior, privacy behavior, RLS expectations, storage safety, voice limits, reveal logic, instant media behavior, and block override.

## Status
Draft test scenario direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md
- docs/security/SECURITY_RULES.md
- docs/security/PRIVACY_MODEL.md
- docs/security/RISK_CONTROL.md
- docs/testing/TEST_LAB.md

## Test Scenario Principle
Every critical ankion flow must be testable visually.

Tests should confirm:
- expected product result
- privacy result
- security result
- safe frontend payload result
- PASS / FAIL state

Console-only testing is not enough.

---

# Scenario Group 1: Environment / Production Guard

## Scenario 1.1: Test Lab Localhost Only
### Given
Developer opens `/dev/test-lab`.

### Expected
- Test Lab works only on localhost/dev.
- Production environment disables Test Lab.
- No test bypass appears in production.

### PASS
Route is available only in development.

### FAIL
Route is accessible in production.

### Risk Level
Critical.

---

## Scenario 1.2: Fake Data Only
### Expected
- Test Lab uses fake users, fake profiles, fake media, fake reveal requests, fake blocks.
- No real user data is used.

### PASS
All test records are fake.

### FAIL
Real user data appears in Test Lab.

### Risk Level
Critical.

---

# Scenario Group 2: Onboarding / Profile

## Scenario 2.1: Real Account Required
### Expected
User cannot interact with Discover, Feed, Chat, voice send, or reveal before account exists.

### PASS
Unauthenticated user is blocked from interaction.

### FAIL
Unauthenticated user can send voice or open Chat.

### Risk Level
High.

---

## Scenario 2.2: Profile Required
### Expected
User cannot send voice or participate in discovery without completed profile.

### PASS
Incomplete profile blocks interaction.

### FAIL
Incomplete profile can send voice.

### Risk Level
High.

---

## Scenario 2.3: Date of Birth and Gender Collected
### Expected
Date of birth and gender are collected during onboarding but not exposed before reveal.

### PASS
Fields exist in profile setup and remain hidden pre-reveal.

### FAIL
Date/gender appears in Discover or Chat before reveal.

### Risk Level
High.

---

# Scenario Group 3: Discover to Chat

## Scenario 3.1: Discover Shows Blurred Profile
### Expected
Discover card shows:
- blurred image
- anonymous label
- voice bio preview if safe
- interest chips if safe
- Open Chat CTA

Must not show:
- real name
- clear avatar
- exact age
- exact city
- owner_user_id

### PASS
Only safe anonymous preview is visible.

### FAIL
Any real identity field appears.

### Risk Level
Critical.

---

## Scenario 3.2: Discover Profile Tap Opens Chat
### Expected
Tapping a Discover card opens Chat directly.

There must be no recipient picker.

### PASS
Chat opens in hidden profile state.

### FAIL
Recipient selection screen appears.

### Risk Level
High.

---

# Scenario Group 4: Feed / Instant Media

## Scenario 4.1: Feed Is 3-Column Grid
### Expected
Feed displays photo/video/audio tiles in a 3-column grid.

### PASS
3-column grid exists.

### FAIL
Feed becomes list-only or dating-style card swipe.

### Risk Level
Medium.

---

## Scenario 4.2: No Live Tab in MVP
### Expected
Feed does not include Live tab.

### PASS
Only approved feed filters exist, such as For You and Following.

### FAIL
Live tab appears.

### Risk Level
Medium.

---

## Scenario 4.3: Feed Tile Opens Detail
### Expected
Tapping a Feed tile opens Instant Content Detail.

### PASS
Content detail opens first.

### FAIL
Feed tile opens real profile directly.

### Risk Level
Critical.

---

## Scenario 4.4: Instant Content Does Not Reveal Real Profile
### Expected
Instant content can be visible, but real profile remains hidden.

### PASS
Owner identity remains anonymous.

### FAIL
Real profile data appears from instant content.

### Risk Level
Critical.

---

# Scenario Group 5: Detail to Chat

## Scenario 5.1: Instant Detail Opens Chat
### Expected
Instant Content Detail has Chat CTA.

### PASS
Chat opens in anonymous context.

### FAIL
Chat exposes real owner identity.

### Risk Level
Critical.

---

## Scenario 5.2: No Recipient Picker From Detail
### Expected
Chat starts from content context.

### PASS
No recipient picker appears.

### FAIL
User must manually select recipient.

### Risk Level
High.

---

# Scenario Group 6: Chat

## Scenario 6.1: Chat Hidden Profile State
### Expected
Before reveal, Chat shows:
- blurred avatar
- hidden profile label
- voice-first input
- profile request CTA

Must not show:
- real name
- clear avatar
- sender_user_id
- owner_user_id

### PASS
Chat is anonymous and safe.

### FAIL
Identity leaks.

### Risk Level
Critical.

---

## Scenario 6.2: Voice Message Sent From Chat
### Expected
Voice message is created only inside Chat context.

### PASS
Voice send works from Chat.

### FAIL
Voice send works through standalone recipient picker.

### Risk Level
High.

---

## Scenario 6.3: Chat Remains Voice-First
### Expected
Microphone / voice recording remains primary.

### PASS
Voice interaction is dominant.

### FAIL
Written text chat becomes main MVP interaction.

### Risk Level
Medium.

---

# Scenario Group 7: Voice Limits

## Scenario 7.1: 21-Second Voice Accepted
### Expected
A voice message up to 21 seconds can be sent.

### PASS
21-second voice accepted.

### FAIL
Valid duration rejected.

### Risk Level
Medium.

---

## Scenario 7.2: Over 21 Seconds Denied
### Expected
Voice message over 21 seconds is denied server-side.

### PASS
Over-limit voice rejected.

### FAIL
Over-limit voice accepted.

### Risk Level
High.

---

## Scenario 7.3: Daily 7 Voice Limit
### Expected
User can send maximum 7 voice messages per day.

### PASS
8th message denied server-side.

### FAIL
8th message accepted.

### Risk Level
High.

---

## Scenario 7.4: Same Recipient Daily 3 Limit
### Expected
User can send maximum 3 voice messages to same recipient per day.

### PASS
4th same-recipient message denied.

### FAIL
4th message accepted.

### Risk Level
High.

---

# Scenario Group 8: Reveal Request

## Scenario 8.1: Request Sent Inside Chat
### Expected
Reveal request is created inside Chat.

### PASS
Request card appears in Chat.

### FAIL
Request occurs outside Chat without context.

### Risk Level
High.

---

## Scenario 8.2: Request Does Not Reveal Profile
### Expected
Profile remains hidden after request is sent.

### PASS
Real profile hidden.

### FAIL
Profile appears immediately.

### Risk Level
Critical.

---

## Scenario 8.3: Decide Later
### Expected
Owner can decide later.

### PASS
Request remains waiting, profile hidden, Chat continues.

### FAIL
Profile opens or request disappears incorrectly.

### Risk Level
High.

---

## Scenario 8.4: Stay Hidden
### Expected
Owner can keep profile hidden.

Allowed copy:
- Profile stayed hidden for now
- You can keep chatting

### PASS
No harsh copy, profile hidden.

### FAIL
"Rejected" or "Denied" appears.

### Risk Level
Medium.

---

# Scenario Group 9: Grant / Profile Visibility

## Scenario 9.1: Approved Without Grant
### Expected
Approved request without active grant must not show profile.

### PASS
Profile remains hidden.

### FAIL
Profile becomes visible.

### Risk Level
Critical.

---

## Scenario 9.2: Active Grant Reveals Profile
### Expected
Profile becomes visible only with active grant and no block.

### PASS
Safe profile DTO appears.

### FAIL
Profile visible without grant.

### Risk Level
Critical.

---

## Scenario 9.3: Profile Screen Has Chat Bubble
### Expected
After reveal, profile screen includes top-right floating chat bubble.

### PASS
Chat bubble returns to existing Chat.

### FAIL
No chat bubble or duplicate chat created.

### Risk Level
Medium.

---

# Scenario Group 10: Block Override

## Scenario 10.1: Block Prevents Voice Send
### Expected
Blocked user cannot send new voice messages.

### PASS
Voice send disabled.

### FAIL
Blocked user sends voice.

### Risk Level
Critical.

---

## Scenario 10.2: Block Prevents Reveal Request
### Expected
Blocked user cannot create reveal request.

### PASS
Request disabled.

### FAIL
Request created.

### Risk Level
Critical.

---

## Scenario 10.3: Block Hides Profile After Grant
### Expected
If block exists after reveal, profile access closes.

### PASS
Profile hidden again.

### FAIL
Profile remains visible.

### Risk Level
Critical.

---

## Scenario 10.4: Block Prevents Signed URL Access
### Expected
New signed media access is denied where applicable.

### PASS
Signed URL not issued.

### FAIL
Blocked user gets media URL.

### Risk Level
Critical.

---

# Scenario Group 11: Storage

## Scenario 11.1: Raw Path Not Returned
### Expected
Frontend never receives raw_storage_path or storage_path.

### PASS
No raw path in payload.

### FAIL
Raw path visible.

### Risk Level
Critical.

---

## Scenario 11.2: Signed URL Only If Allowed
### Expected
Signed URL is returned only after access check.

### PASS
Authorized user receives short-lived URL.

### FAIL
Unauthorized user receives URL.

### Risk Level
Critical.

---

## Scenario 11.3: File Audit Logs Not Readable
### Expected
Frontend cannot read file_audit_logs raw rows.

### PASS
Access denied / safe DTO only.

### FAIL
Raw audit row visible.

### Risk Level
Critical.

---

# Scenario Group 12: RLS / Sensitive Field Leaks

## Scenario 12.1: Voice Message Sender Leak
### Expected
voice message payload does not expose sender_user_id.

### PASS
Only self/other direction appears.

### FAIL
sender_user_id appears.

### Risk Level
Critical.

---

## Scenario 12.2: Instant Owner Leak
### Expected
instant profile/post payload does not expose owner_user_id.

### PASS
owner_user_id hidden.

### FAIL
owner_user_id appears.

### Risk Level
Critical.

---

## Scenario 12.3: Reveal Grant Internals Hidden
### Expected
Frontend gets visible true/false, not raw grant internals.

### PASS
Grant internals hidden.

### FAIL
profile_visibility_grants raw data appears.

### Risk Level
High.

---

# Scenario Group 13: Reports / Notifications

## Scenario 13.1: Report Submission
### Expected
User can report voice, chat, profile, or instant content.

### PASS
Safe confirmation appears.

### FAIL
reported_user_id or moderation internals shown.

### Risk Level
High.

---

## Scenario 13.2: Notification Does Not Leak Identity
### Expected
Before reveal, notification copy stays anonymous.

Allowed:
- Someone left you a voice message
- Your profile request has a response

### PASS
No real identity in notification.

### FAIL
Real name appears before reveal.

### Risk Level
High.

---

# Scenario Group 14: Coin / Future Entitlement

## Scenario 14.1: Coin Cannot Reveal Profile
### Expected
Coin or future entitlement cannot reveal real profile.

### PASS
No active grant means profile hidden.

### FAIL
Coin unlocks real profile.

### Risk Level
Critical.

---

## Scenario 14.2: Instant Follow Cannot Reveal Profile
### Expected
Following instant profile does not create grant.

### PASS
Profile hidden.

### FAIL
Follow reveals real profile.

### Risk Level
Critical.

---

# Minimum Test Scenario Set for First Test Lab

First implementation later should cover:

1. Environment Guard
2. Discover to Chat
3. Feed to Detail to Chat
4. Chat Hidden Profile
5. Voice Duration Limit
6. Daily Voice Limit
7. Same-Recipient Voice Limit
8. Reveal Request
9. Approved Without Grant
10. Active Grant Reveals Profile
11. Block Overrides Grant
12. Raw Storage Path Leak
13. Sensitive Field Leak
14. Test Lab Production Disabled

## Success Criteria
Test scenarios are successful if:

1. Product flow is testable.
2. Privacy rules are testable.
3. RLS leak risks are testable.
4. Storage leak risks are testable.
5. Voice limits are testable.
6. Reveal/grant/block logic is testable.
7. Instant media anonymity is testable.
8. Tests can become visual PASS/FAIL cards later.
9. No implementation is started from this document.

## Notes
This document defines what to test, not how to implement the tests.

If a risk cannot be tested visually or through safe payload inspection, the related flow is not ready for beta.
