# QA_CHECKLIST.md

## Purpose
This document defines the pre-implementation QA checklist for ankion.

No implementation should begin until this checklist is reviewed.

## Status
Draft QA checklist.

Implementation has not started.

## Core Rule
ankion must not drift from its approved core:

- dark-first
- mobile-native
- voice-first
- anonymous start
- Chat-centered interaction
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- permission-based profile reveal
- private storage
- RLS-protected backend
- safe DTOs
- localhost-only Test Lab
- small Codex tasks

---

# 1. Product Core Checklist

- [ ] Real account is required.
- [ ] Profile is required before interaction.
- [ ] Voice-first interaction is preserved.
- [ ] Written chat is not the MVP's main interaction.
- [ ] No separate recipient picker exists.
- [ ] Discover profile tap opens Chat directly.
- [ ] Feed tile opens Instant Content Detail.
- [ ] Instant Content Detail opens Chat.
- [ ] Chat is the central hub.
- [ ] Feed uses 3-column photo/video/audio grid.
- [ ] No Live tab in MVP.
- [ ] App does not become dating-style swipe/match product.

---

# 2. UI/UX Checklist

- [ ] UI follows docs/design/ANKION_UI_UX_MASTER_PROMPT.md.
- [ ] UI follows docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md.
- [ ] Dark-first design is default.
- [ ] Mobile-native spacing and navigation are respected.
- [ ] Bottom tabs are Chat / Feed / Discover / Profile.
- [ ] Chat is visually central.
- [ ] Profile screen includes top-right floating chat bubble.
- [ ] Reveal states use calm language.
- [ ] No "Rejected" or "Denied" wording.
- [ ] UI does not look like Tinder/Bumble.
- [ ] UI does not look like a website.

---

# 3. Chat Checklist

- [ ] Chat opens from Discover.
- [ ] Chat opens from Instant Content Detail.
- [ ] Chat can send voice messages.
- [ ] Voice recording is inside Chat.
- [ ] Chat shows hidden profile state before reveal.
- [ ] Chat supports profile reveal request.
- [ ] Chat supports decide later / stay hidden / revealed states.
- [ ] Chat safety menu includes report/block paths.
- [ ] Chat does not expose sender_user_id.
- [ ] Chat does not expose owner_user_id.

---

# 4. Voice Limit Checklist

- [ ] Voice max duration is 21 seconds.
- [ ] Daily voice limit is 7 per user.
- [ ] Same-recipient daily limit is 3.
- [ ] Limits are enforced server-side.
- [ ] UI may show remaining limits but cannot be source of truth.
- [ ] Over-limit voice is rejected safely.
- [ ] Remaining count does not leak identity.

---

# 5. Reveal Checklist

- [ ] Real profile is hidden by default.
- [ ] Reveal request happens inside Chat.
- [ ] Request status alone does not reveal profile.
- [ ] Active visibility grant is required.
- [ ] Block overrides active grant.
- [ ] Correct rule is preserved:
      approved request + active profile visibility grant + no active block = profile visible
- [ ] Stay hidden uses calm copy.
- [ ] Decide later keeps request available.
- [ ] Revealed profile shows safe fields only.
- [ ] Profile screen returns to existing Chat through chat bubble.

---

# 6. Instant / Feed Checklist

- [ ] Feed shows photo/video/audio grid.
- [ ] Instant content does not reveal real profile.
- [ ] Instant profile is separate from real profile.
- [ ] Instant follow does not reveal real profile.
- [ ] Coin/future entitlement does not reveal real profile.
- [ ] Feed tile does not expose owner_user_id.
- [ ] Instant Content Detail does not expose raw storage path.
- [ ] Chat from instant content opens anonymously.

---

# 7. Database / Safe DTO Checklist

- [ ] DATABASE.md is filled.
- [ ] TABLES.md is filled.
- [ ] RELATIONSHIPS.md is filled.
- [ ] Frontend does not consume raw sensitive rows.
- [ ] Safe DTO strategy is used.
- [ ] Sensitive fields are protected:
      sender_user_id, owner_user_id, profile_owner_user_id, requester_user_id, raw_storage_path
- [ ] Reveal request and visibility grant are separate.
- [ ] Block is represented as stronger than grant.
- [ ] Instant profile and real profile are separate.

---

# 8. RLS Checklist

- [ ] RLS_POLICIES.md is filled.
- [ ] Every sensitive table has RLS planning.
- [ ] profiles are protected.
- [ ] chat_participants are protected.
- [ ] voice_messages are protected.
- [ ] reveal_requests are protected.
- [ ] profile_visibility_grants are protected.
- [ ] blocks are protected.
- [ ] reports are protected.
- [ ] instant_profiles are protected.
- [ ] instant_posts are protected.
- [ ] file_audit_logs are protected.
- [ ] RLS leak tests are planned.

---

# 9. Storage Checklist

- [ ] STORAGE.md is filled.
- [ ] Media is private by default.
- [ ] Raw storage path never returns to frontend.
- [ ] Storage paths do not contain unsafe user ids.
- [ ] Signed URLs are short-lived.
- [ ] Signed URLs require access checks.
- [ ] Block prevents signed URL access where applicable.
- [ ] Profile media hidden before reveal.
- [ ] Instant media does not reveal real owner.
- [ ] File audit logs are not frontend-readable.

---

# 10. Security / Privacy Checklist

- [ ] SECURITY_RULES.md is filled.
- [ ] PRIVACY_MODEL.md is filled.
- [ ] RISK_CONTROL.md is filled.
- [ ] Real identity hidden by default.
- [ ] Notifications do not leak real identity.
- [ ] Reports do not expose moderation internals.
- [ ] Frontend never decides visibility alone.
- [ ] Backend/RLS/storage enforce access.
- [ ] Test Lab verifies privacy risks.

---

# 11. Test Lab Checklist

- [ ] TEST_LAB.md is filled.
- [ ] TEST_SCENARIOS.md is filled.
- [ ] RLS_LEAK_TESTS.md is filled.
- [ ] Test Lab is localhost-only.
- [ ] Test Lab disabled in production.
- [ ] Visual PASS/FAIL cards are planned.
- [ ] Console-only testing is not enough.
- [ ] Environment guard exists in plan.
- [ ] Fake data only.
- [ ] No production secrets.

---

# 12. Codex Execution Checklist

- [ ] Codex receives only small isolated tasks.
- [ ] Codex creates a short task plan before changes.
- [ ] Codex modifies only requested files.
- [ ] Codex does not build full app in one task.
- [ ] Codex updates FILE_MAP.md when files are added.
- [ ] Codex updates PROJECT_STATUS.md after meaningful tasks.
- [ ] Codex does not install packages without explicit approval.
- [ ] Codex does not initialize frameworks without explicit approval.

---

# 13. Pre-Implementation Gate

Implementation must not begin until these are approved:

- [ ] Product docs
- [ ] Design docs
- [ ] Architecture docs
- [ ] Database docs
- [ ] Security docs
- [ ] Testing docs
- [ ] Codex task docs

Specifically required before first setup task:

- [ ] MVP_CORE.md
- [ ] APP_USAGE_FLOW.md
- [ ] CHAT_FLOW.md
- [ ] REVEAL_FLOW.md
- [ ] INSTANT_FLOW.md
- [ ] ANKION_UI_UX_MASTER_PROMPT.md
- [ ] ANKION_FINAL_UI_GENERATION_PROMPT.md
- [ ] ARCHITECTURE.md
- [ ] TECH_STACK_DECISION.md
- [ ] MONOREPO_STRUCTURE.md
- [ ] DATABASE.md
- [ ] TABLES.md
- [ ] RELATIONSHIPS.md
- [ ] RLS_POLICIES.md
- [ ] STORAGE.md
- [ ] SECURITY_RULES.md
- [ ] PRIVACY_MODEL.md
- [ ] RISK_CONTROL.md
- [ ] TEST_LAB.md
- [ ] TEST_SCENARIOS.md
- [ ] RLS_LEAK_TESTS.md
- [ ] QA_CHECKLIST.md
- [ ] CODEX_TASKS.md

## Success Criteria
QA checklist is successful if it prevents:
- early implementation
- product drift
- identity leaks
- storage leaks
- weak RLS
- UI/backend mismatch
- Codex overbuilding
- console-only testing

## Notes
This checklist is a go/no-go gate.

If any critical checkbox fails, implementation must wait.
