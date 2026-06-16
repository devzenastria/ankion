# Chat Static Visual Compression Plan

## Phase

Phase 15C — Documentation-only Chat Static Visual Compression Plan

## Purpose

This document defines how the Chat screen should later be visually compressed without losing the core product meaning.

The goal is to make Chat feel less text-heavy, more mobile-native, more action-oriented, and more premium while keeping it fully static and behavior-free.

This phase is documentation-only.

No route UI changes are included in Phase 15C.

---

## Current Chat State

Chat currently includes:

- SectionHeader
- Context card
- Passive voice composer card
- Static anonymous voice card
- Voice message lifecycle card
- Reveal education card
- PrivacyNote
- SoftAction

Chat already had duplicate explanation cleanup in Phase 11B.

Current Chat is coherent, but still text-heavy.

---

## Compression Goal

The next Chat polish should:

- Keep the anonymous voice-first meaning
- Keep profile privacy clear
- Keep reveal flow understandable
- Reduce long explanatory text
- Make the composer area feel stronger
- Improve scroll rhythm
- Avoid behavior
- Avoid fake messages
- Avoid recorder/audio logic

---

## Keep / Compress / Remove Decision

### 1. SectionHeader

Decision: Keep.

Compression direction:

- Keep short title.
- Subtitle can be shorter later.

Possible future copy:

- Title: Chat
- Subtitle: Anonymous voice starts here.

---

### 2. Context Card

Decision: Keep, but compress.

Current role:

Explains anonymous voice space and hidden profile rule.

Compression direction:

- Shorten title.
- Shorten description.
- Keep pills.

Future direction:

This should become the fast product context card.

---

### 3. Passive Voice Composer Card

Decision: Keep and visually strengthen.

Current role:

Shows future voice message area.

Compression direction:

- Make it feel like the main Chat action area.
- Keep “21 seconds max”.
- Reduce explanation text.
- Keep “No recorder yet” state only while static.

Future direction:

This should be the visual center of Chat.

---

### 4. Static Anonymous Voice Card

Decision: Keep, but reduce copy.

Current role:

Represents future anonymous voice message object.

Compression direction:

- Keep waveform visual.
- Keep short status.
- Remove long explanation if composer already explains voice future.

Future direction:

This should feel like a sample object shape, not a tutorial block.

---

### 5. Voice Message Lifecycle Card

Decision: Keep, but compress heavily.

Current role:

Explains 5-step future flow.

Compression direction:

- Keep 5-step logic.
- Reduce each step to one short line.
- Remove long supporting paragraphs.
- Consider using compact rows.

Future direction:

This should become a short “How it works” block.

---

### 6. Reveal Education Card

Decision: Keep, but compress.

Current role:

Explains profile visibility is a request, not automatic exposure.

Compression direction:

- Keep Ask / Wait / Open model.
- Shorten descriptions.
- Remove footer that explains no backend behavior from user-facing UI later.
- Keep calm wording.

Future direction:

This should explain reveal without feeling like documentation.

---

### 7. PrivacyNote

Decision: Keep.

Compression direction:

- Keep short.
- Avoid repeating text already in context card.

---

### 8. SoftAction

Decision: Reconsider later.

Current role:

Passive future action hint.

Compression direction:

- Keep only if it supports flow.
- Remove if Chat still feels too long after compression.

---

## Proposed Future Chat Order

Recommended order after compression:

1. SectionHeader
2. Context Card
3. Composer Card
4. Static Anonymous Voice Card
5. Compact Lifecycle Card
6. Compact Reveal Education Card
7. PrivacyNote
8. Optional SoftAction

This order should remain stable.

---

## Copy Compression Rules

Use short copy.

Prefer:

- Anonymous voice starts here.
- Real profile stays private.
- Voice messages will be 21 seconds.
- Profile visibility opens only with approval.
- Owner keeps control.

Avoid long explanations like:

- “This static area shows where...”
- “No backend behavior is active...”
- “This phase only prepares...”
- “Future logic will be planned later...”

Development-phase warnings should stay in docs, not in final-facing UI when possible.

---

## User-Facing Copy Direction

Chat should feel like a product screen, not a planning document.

User-facing copy should be:

- Short
- Calm
- Human
- Clear
- Non-technical
- Permission-based

Avoid user-facing technical phrases:

- backend
- static
- phase
- route
- logic
- implementation
- request status

These can stay in docs, but should be removed from UI later.

---

## Visual Compression Rules

Future Chat polish should:

- Reduce paragraph count
- Use shorter card titles
- Use compact rows
- Use stronger hierarchy
- Keep enough spacing
- Keep dark-first premium surfaces
- Avoid warning-heavy UI
- Avoid fake chat bubbles
- Avoid fake messages

---

## Future Phase Recommendation

### Phase 15D — Chat Static Copy Compression Implementation

Allowed:

- Edit only `apps/mobile/app/chat.tsx`
- Static UI only
- Existing components only
- Existing Link/navigation behavior unchanged

Goal:

Compress Chat copy and improve visual rhythm without adding behavior.

Forbidden:

- Recorder
- Microphone permission
- Real audio
- Play/pause
- Fake messages
- Fake users
- Reveal logic
- Approve/reject logic
- Backend/API
- Supabase/Auth/RLS/Storage
- Package changes
- New navigation behavior

---

## Validation For Future Phase 15D

Run:

- `corepack pnpm --filter @ankion/mobile typecheck`
- `corepack pnpm --filter @ankion/web typecheck`

APK build is optional and should be delayed unless multiple visual changes accumulate.

---

## Acceptance Criteria for Phase 15C

Phase 15C is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Chat compression direction is documented.
- Future Chat implementation remains limited to static UI.
- No real behavior is introduced.

---

## Current Decision

The next Chat work should be copy and visual compression only.

The product should not move to recorder, backend, audio, reveal logic, or real data yet.

## Phase 15D-15F Completion Record

Phase 15D completed:

- `apps/mobile/app/chat.tsx` was manually updated.
- Chat copy was compressed.
- Composer language became more action-oriented while staying passive.
- Lifecycle/reveal education copy is shorter.
- Technical/product-planning UI wording was reduced.
- Chat remains static and behavior-free.

Phase 15E completed:

- Local validation passed after Chat static copy compression.

Phase 15F completed:

- Docs/status alignment was completed.
- Route UI files were audited but not modified.
- No recorder, microphone permission, real audio, play/pause behavior, fake messages/users/profiles, reveal logic, backend/API, Supabase/Auth/RLS/Storage, upload behavior, package changes, lockfile changes, tabs, redirects, `router.push`, or new navigation behavior was added.

Next recommended phase:

- Home static copy compression / planning, or Discover/Feed static copy compression planning.
