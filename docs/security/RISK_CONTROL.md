# RISK_CONTROL.md

## Purpose
This document defines the main risks in ankion and how to control them.

ankion must stay aligned with its approved core:
- dark-first
- mobile-native
- voice-first
- anonymous start
- Chat-centered interaction
- permission-based profile reveal
- private media storage
- RLS-protected backend
- safe DTOs
- localhost-only Test Lab
- small Codex tasks

## Status
Draft risk control direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/architecture/ARCHITECTURE.md
- docs/database/DATABASE.md
- docs/database/TABLES.md
- docs/database/RELATIONSHIPS.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md
- docs/security/SECURITY_RULES.md
- docs/security/PRIVACY_MODEL.md

---

# Core Product Risks

## Risk 1: App becomes a generic chat app

### Problem
If written chat becomes dominant, ankion loses its voice-first identity.

### Control
- Voice messages remain the primary interaction.
- Chat is voice-first, not text-first.
- Text may exist only as system/support copy in MVP.
- Voice bio and voice message flows stay central.

### Test
Test Lab must verify that core interaction starts from voice.

---

## Risk 2: App becomes a dating app

### Problem
Swipe, match, flirt-heavy copy, public profiles, and dating-like reveal mechanics weaken the product direction.

### Control
- No swipe/match system.
- No dating-style wording.
- No public real profile browsing.
- No "match" confirmation.
- Discover uses blurred profile cards and voice cues.

### Test
UI quality checklist must verify the app does not look like Tinder/Bumble.

---

## Risk 3: Separate recipient picker returns

### Problem
A standalone recipient picker would break the approved flow.

### Approved flow
Discover profile tap -> Chat  
Feed tile -> Instant Content Detail -> Chat

### Control
- No separate recipient selection screen.
- Chat is opened from Discover or Instant Detail.
- Voice is sent inside Chat.

### Test
Test Lab must verify Discover-to-Chat and Feed-to-Detail-to-Chat.

---

# Privacy and Identity Risks

## Risk 4: Real profile leaks before permission

### Problem
Real name, clear avatar, exact age, city, bio, or owner id may leak too early.

### Control
- Real profile hidden by default.
- Safe DTOs only.
- No raw profile table reads.
- Profile visible only with active grant and no block.

### Required rule
approved request + active profile visibility grant + no active block = profile visible

### Test
RLS leak tests must verify profile is hidden before grant.

---

## Risk 5: Reveal request treated as visibility

### Problem
If request approval alone opens profile, privacy model breaks.

### Control
- reveal_requests tracks request state.
- profile_visibility_grants controls actual visibility.
- Block overrides grant.

### Test
Test Lab scenario:
approved request without active grant must not show profile.

---

## Risk 6: Block does not override grant

### Problem
A user could remain visible after being blocked.

### Control
Block must override:
- profile visibility
- chat actions
- voice send
- reveal requests
- signed media access where applicable
- instant interactions where applicable

### Test
Test Lab must verify block after reveal hides profile.

---

## Risk 7: Instant profile becomes real profile

### Problem
Instant Feed may accidentally expose real user identity.

### Control
- instant_profile is separate from real profile.
- instant follow does not reveal real profile.
- instant content does not create visibility grant.
- coin/follow/engagement cannot reveal profile.

### Test
Instant follow and instant content must not reveal real profile.

---

# Storage and Media Risks

## Risk 8: Raw storage path leaks

### Problem
Storage paths may reveal sender, owner, profile, or user id.

### Control
Frontend must never receive:
- raw_storage_path
- storage_path
- owner_user_id
- sender_user_id

Use:
- private storage
- safe path identifiers
- short-lived signed URLs

### Test
Test Lab must verify raw path is never returned.

---

## Risk 9: Public buckets expose sensitive media

### Problem
Public buckets can expose voice, profile media, and instant content.

### Control
- Private storage by default.
- Signed URLs only after access checks.
- Profile media requires grant + no block.

### Test
Unauthorized media access must fail.

---

## Risk 10: Signed URLs bypass current permission

### Problem
Old signed URLs may still work after block or permission change.

### Control
- Signed URLs must be short-lived.
- New signed URL requests must check block and permission.
- Expired URLs must be handled safely by UI.

### Test
Block after reveal should prevent new signed media access.

---

# Database and RLS Risks

## Risk 11: Frontend reads raw sensitive tables

### Problem
Frontend may accidentally receive sensitive fields and hide them visually.

### Control
- Use safe RPC/views/DTOs.
- Base tables protected by RLS.
- No raw sensitive rows for frontend.

### Test
Leak tests must check sender_user_id, owner_user_id, raw_storage_path.

---

## Risk 12: RLS added too late

### Problem
If RLS is added after app code, insecure patterns may become hard to fix.

### Control
- RLS planning before migrations.
- Table-by-table policy matrix required.
- Test Lab must verify RLS leaks.

### Test
Every sensitive table must have SELECT/INSERT/UPDATE/DELETE policy plan.

---

## Risk 13: Relationships leak identity

### Problem
Participant, owner, viewer, requester, or file relationships may reveal hidden identity.

### Control
- Protect relationship tables.
- Return self/other direction instead of raw ids.
- Use safe DTOs.

### Test
Chat and reveal DTOs must not expose raw relationship ids.

---

# Product Limit and Abuse Risks

## Risk 14: Voice limits are enforced only in UI

### Problem
Users could bypass frontend limits.

### Control
Backend must enforce:
- 21-second max duration
- daily 7 voice limit
- same-recipient daily 3 limit

### Test
Test Lab must verify limit enforcement.

---

## Risk 15: Unlimited anonymous interaction causes abuse

### Problem
Anonymous voice can be misused without limits and safety.

### Control
- real account required
- profile required
- daily limits
- block/report
- private media
- future moderation hooks

### Test
Block/report flows must exist before beta.

---

# Architecture and Codex Risks

## Risk 16: Codex overbuilds the app

### Problem
Large Codex tasks can create tangled code, wrong architecture, and hidden bugs.

### Control
- One small task at a time.
- Codex must create a short task plan first.
- Codex modifies only requested files.
- FILE_MAP.md updated when files are added.
- PROJECT_STATUS.md updated after meaningful tasks.

### Test
Review every Codex output for unrelated file changes.

---

## Risk 17: Implementation starts before docs are ready

### Problem
Early package/framework setup may force wrong architecture.

### Control
Implementation must wait until these are approved:
- product docs
- design docs
- architecture docs
- database docs
- RLS docs
- storage docs
- Test Lab docs
- Codex task docs

### Test
No package.json, pnpm-workspace.yaml, turbo.json, Next.js, Expo, Supabase init before approval.

---

## Risk 18: UI and backend drift apart

### Problem
UI may show actions that backend cannot enforce safely.

### Control
UI decisions must map to backend behavior:
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice send in Chat
- reveal request in Chat
- grant-based profile view
- block override
- signed URL access

### Test
Each major UI flow must have backend behavior notes.

---

# Test Lab Risks

## Risk 19: Test Lab accidentally enabled in production

### Problem
Debug/test screens could expose unsafe flows.

### Control
- localhost-only
- production disabled
- no real secrets
- no production user data
- no bypasses in production app

### Test
Test Lab production check must fail closed.

---

## Risk 20: Tests stay in console only

### Problem
Risky flows may not be visually verified.

### Control
Test Lab must provide visual PASS/FAIL cards for:
- hidden profile
- reveal grant
- block override
- RLS leak tests
- storage signed URL
- voice limits
- Discover/Feed/Chat flows

### Test
Developer can verify in localhost browser.

---

# Risk Priority Matrix

## Critical
- real profile leak
- owner_user_id leak
- sender_user_id leak
- raw storage path leak
- request approval treated as visibility
- block not overriding grant
- public media bucket
- RLS missing from sensitive tables
- Test Lab enabled in production

## High
- app becomes generic chat app
- instant profile reveals real profile
- voice limits frontend-only
- Codex overbuilds
- storage path contains user id
- frontend reads raw sensitive rows

## Medium
- UI/backend drift
- unclear folder ownership
- notification copy leaks identity
- report data exposed
- text chat becomes too dominant

## Lower
- visual polish issues
- optional light theme delay
- advanced recommendation deferred
- payment/coin deferred

---

# Minimum Pre-Implementation Gate

Do not begin app implementation until these docs are approved:

- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md
- docs/architecture/ARCHITECTURE.md
- docs/architecture/TECH_STACK_DECISION.md
- docs/architecture/MONOREPO_STRUCTURE.md
- docs/database/DATABASE.md
- docs/database/TABLES.md
- docs/database/RELATIONSHIPS.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md
- docs/security/SECURITY_RULES.md
- docs/security/PRIVACY_MODEL.md
- docs/security/RISK_CONTROL.md
- docs/testing/TEST_LAB.md
- docs/handoff/CODEX_TASKS.md

---

# Test Lab Required Risk Checks

Test Lab must verify:

1. Discover card does not expose real identity.
2. Feed tile does not expose owner identity.
3. Chat opens without recipient picker.
4. Voice message hides sender_user_id.
5. Voice duration limit works.
6. Daily voice limit works.
7. Same-recipient limit works.
8. Reveal request does not reveal profile.
9. Approved request without grant does not reveal profile.
10. Active grant + no block reveals profile.
11. Block after reveal hides profile.
12. Instant follow does not reveal real profile.
13. Coin/future entitlement does not reveal real profile.
14. Raw storage path is never returned.
15. Reports do not expose reported_user_id.
16. Notifications do not leak real identity.
17. Test Lab disabled in production.

---

# Success Criteria

Risk control is successful if:

1. Product stays voice-first.
2. Chat remains central.
3. Real profile is hidden by default.
4. Reveal requires active grant.
5. Block overrides grant.
6. Instant content does not reveal real profile.
7. Storage paths stay private.
8. Frontend receives safe DTOs only.
9. RLS planning guides implementation.
10. Test Lab verifies all critical risks.
11. Codex tasks remain small and isolated.
12. Implementation does not begin before required docs are approved.

## Notes
Risk control must be treated as a living document.

If a future decision increases privacy, security, architecture, or product drift risk, update this file before implementation.
