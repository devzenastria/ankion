# Chat UI Simplification Plan

## Phase

Phase 11A — Documentation-only Chat UI simplification / duplicate explanation cleanup planning

## Purpose

This document defines how the Chat screen should be simplified after Phase 9 and Phase 10 added multiple static explanatory surfaces.

The goal is not to remove product meaning.

The goal is to reduce duplicate explanation, improve screen clarity, and prepare one controlled static UI cleanup phase.

This phase is documentation-only.

No route UI changes are included in Phase 11A.

---

## Current Situation

The Chat screen currently explains the product direction clearly, but it has multiple overlapping static education surfaces.

Current Chat surfaces include:

- SectionHeader
- Context card
- Passive voice composer card
- Interaction preview card
- Static anonymous voice card
- Voice message lifecycle card
- Reveal education card
- Profile visibility request placeholder card
- Old 3-step flow card
- EmptyState
- PrivacyNote
- SoftAction

This creates a useful but heavy screen.

Before adding real behavior, the Chat screen should be simplified.

---

## Simplification Rule

Do not add behavior.

Do not add backend.

Do not add recorder.

Do not add audio.

Do not add reveal logic.

Do not add mock data.

Only simplify static UI structure after the plan is approved.

---

## Surface Decision Matrix

### 1. SectionHeader

Decision: Keep.

Reason:

The screen needs a clear top-level title and subtitle.

Future action:

Keep as-is unless copy refinement is needed.

---

### 2. Context Card

Decision: Keep.

Reason:

This card explains the core Chat identity:

- Anonymous voice space
- Real profile private
- Permission-based visibility

Future action:

Keep near the top of Chat.

---

### 3. Passive Voice Composer Card

Decision: Keep.

Reason:

This is the best placeholder for the future voice action area.

Future action:

Keep, but later it may become the main voice composer area.

---

### 4. Interaction Preview Card

Decision: Merge or remove later.

Reason:

It repeats the idea already explained by the Context Card and Passive Composer Card.

Future action:

Candidate for removal in Phase 11B.

---

### 5. Static Anonymous Voice Card

Decision: Keep for now.

Reason:

It visually represents the future anonymous voice message object.

Future action:

Keep, but avoid duplicating 21-second explanation if already present in composer.

---

### 6. Voice Message Lifecycle Card

Decision: Keep.

Reason:

It explains the full future flow clearly:

1. Anonymous voice sent
2. Recipient listens in Chat
3. Profile visibility can be requested later
4. Owner decides
5. Real profile stays private unless approved

Future action:

Keep as the main education block for flow understanding.

---

### 7. Reveal Education Card

Decision: Keep.

Reason:

It explains that profile visibility is a request, not automatic exposure.

Future action:

Keep, but later it can absorb the separate reveal placeholder card.

---

### 8. Profile Visibility Request Placeholder Card

Decision: Merge or remove later.

Reason:

It overlaps with Reveal Education Card.

Future action:

Candidate for removal or merge in Phase 11B.

---

### 9. Old 3-Step Flow Card

Decision: Remove later.

Reason:

Its content is now mostly covered by the 5-step Voice Message Lifecycle Card.

Future action:

Primary removal candidate for Phase 11B.

---

### 10. EmptyState

Decision: Reconsider later.

Reason:

Chat is no longer visually empty because it already has multiple static surfaces.

Future action:

Candidate for removal in Phase 11B or later.

---

### 11. PrivacyNote

Decision: Keep.

Reason:

Privacy must stay visible and reassuring.

Future action:

Keep short and calm.

---

### 12. SoftAction

Decision: Reconsider later.

Reason:

It is passive and safe, but may be redundant while behavior is not active.

Future action:

Candidate for keeping only if it improves product clarity.

---

## Recommended Phase 11B Scope

Phase 11B should be a single-file static cleanup.

Allowed file:

- apps/mobile/app/chat.tsx

Recommended cleanup:

- Remove Interaction Preview Card
- Remove Old 3-Step Flow Card
- Consider removing EmptyState if screen still communicates enough without it
- Keep Context Card
- Keep Passive Voice Composer Card
- Keep Static Anonymous Voice Card
- Keep Voice Message Lifecycle Card
- Keep Reveal Education Card
- Keep PrivacyNote
- Keep SoftAction only if it still adds clarity

---

## Phase 11B Forbidden Areas

Do not add:

- Supabase
- Auth
- RLS
- Storage
- Migrations
- Backend/API
- Mock user/media/message/reveal data
- Voice recorder
- Real audio
- Play/pause behavior
- Reveal logic
- Approve/reject logic
- Package installs
- Package file changes
- Lockfile changes
- apps/web source changes
- Shared packages
- Tabs
- router.push
- New navigation behavior

---

## Phase 11A Acceptance Criteria

Phase 11A is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Chat simplification decisions are documented.
- Phase 11B is clearly scoped as one static cleanup patch.

---

## Current Decision

Next phase should be:

Phase 11B — Chat static duplicate explanation cleanup

This phase should simplify the Chat screen without adding behavior.

---

## Phase 11B And Phase 11C Result

Phase 11B completed the static cleanup by removing:

- `interactionCard`
- `revealCard`
- `flowCard`
- Chat `EmptyState`

Phase 11B kept:

- `SectionHeader`
- `contextCard`
- `composerCard`
- `voiceCard`
- `lifecycleCard`
- `revealEducationCard`
- `PrivacyNote`
- `SoftAction`

Phase 11C local validation passed:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
```

APK rebuild was intentionally skipped because Phase 11B changed only static Chat JSX and did not change native dependencies, package files, lockfile, or navigation.

Next recommended phase should be either:

- Phase 12A documentation-only planning for the next narrow static product slice
- Phase 11E optional device APK visual check later

No backend, recorder, real audio, reveal behavior, package change, or navigation expansion should start next.
