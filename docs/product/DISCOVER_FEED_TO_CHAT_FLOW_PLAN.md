# Discover / Feed to Chat Flow Plan

## Phase

Phase 12A — Documentation-only Discover / Feed to Chat static flow planning

## Purpose

This document defines how Discover and Feed should naturally lead into Chat without adding real behavior, backend logic, mock data, recorder logic, reveal logic, or new navigation behavior.

The goal is to make the app flow feel natural, premium, privacy-first, and voice-first before any real data or interaction logic is added.

This phase is documentation-only.

No route UI changes are included in Phase 12A.

---

## Product Context

ankion is an anonymous voice-first social app.

Users have real profiles, but the first interaction starts anonymously.

The main product flow is:

1. User discovers someone or some anonymous content.
2. User enters Chat directly from Discover or Feed.
3. The first interaction is voice-first.
4. Real profile visibility stays hidden.
5. Profile visibility can be requested later.
6. Owner approval is required before real profile visibility opens.

There is no separate recipient picker.

Chat is the central interaction hub.

---

## Current App State

The mobile app is still static and behavior-free.

Current completed flow foundation:

- Index route has static navigation links.
- Discover has static UI foundation and a static direction to Chat.
- Feed has static UI foundation and a static direction to Chat.
- Chat has a simplified static product flow:
  - SectionHeader
  - Context card
  - Passive voice composer card
  - Static anonymous voice card
  - Voice lifecycle card
  - Reveal education card
  - PrivacyNote
  - SoftAction
- Profile has static privacy/reveal control surfaces.
- Reveal Requests has static reveal request card surface.
- APK builds and opens on a real Android device.
- Latest Chat cleanup was validated with mobile and web typecheck.

---

## Phase 12A Scope

Allowed:

- Documentation
- Product flow planning
- Static Discover direction planning
- Static Feed direction planning
- Chat entry context planning
- Future implementation slicing

Not allowed:

- Route file edits
- Component edits
- Package edits
- Lockfile edits
- Backend/API
- Supabase
- Auth
- RLS
- Storage
- Migrations
- Mock user data
- Mock profile data
- Mock media data
- Mock message data
- Mock reveal data
- Voice recorder
- Real audio
- Play/pause behavior
- Reveal logic
- Approve/reject logic
- New navigation behavior
- router.push
- Tabs

---

## Flow Principle

Discover and Feed should not feel like separate products.

They should feel like two calm entry points into the same anonymous voice-first interaction system.

Discover should answer:

“What kind of anonymous voice interaction can I start?”

Feed should answer:

“What anonymous moment or media can lead me into a voice-first chat?”

Chat should answer:

“What happens after I enter the anonymous interaction?”

---

## Discover Direction

### Purpose

Discover should become the clean voice-first discovery surface.

It should not look like a dating swipe app.

It should not expose real profiles before permission.

It should not require choosing a recipient from a separate picker.

### Future Static UI Direction

Discover can later include:

- A calm discovery intro
- Anonymous voice-first explanation
- Static profile-hidden preview surface
- Static “continue to chat” direction
- Privacy reassurance copy

### Must Avoid

Do not add:

- Fake users
- Fake names
- Fake avatars
- Fake profiles
- Dating-style cards
- Like/dislike mechanics
- Swipe mechanics
- Real recipient selection
- Real matching behavior
- Backend data
- Reveal logic

### Recommended Future Slice

Phase 12B — Discover static flow refinement

Allowed file:

- apps/mobile/app/discover.tsx

Goal:

Make Discover feel like a premium anonymous voice discovery entry point while staying static.

---

## Feed Direction

### Purpose

Feed should prepare the future media/voice content flow.

Feed will later support a 3-column photo/video/audio grid, but not yet.

For now, Feed should only communicate that anonymous media and voice moments can lead into Chat.

### Future Static UI Direction

Feed can later include:

- Static feed intro
- Future 3-column grid explanation
- Anonymous media privacy note
- Static Chat direction
- Voice/media moment placeholder

### Must Avoid

Do not add:

- Fake media items
- Fake photos
- Fake videos
- Fake audio posts
- Fake usernames
- Fake follower counts
- Coin/package logic
- Real media grid
- Upload behavior
- Backend/storage
- Reveal logic

### Recommended Future Slice

Phase 12C — Feed static flow refinement

Allowed file:

- apps/mobile/app/feed.tsx

Goal:

Make Feed feel like a future anonymous media/voice entry point into Chat while staying static.

---

## Chat Entry Rules

When Discover or Feed leads to Chat, the product meaning should be clear:

- Chat is where anonymous interaction starts.
- Voice is the primary action.
- Real profile remains hidden.
- Reveal request may happen later.
- Owner approval controls visibility.

Current static Link behavior is enough for now.

Do not add new navigation behavior.

Do not add route params.

Do not add selected recipient state.

Do not add mock context payloads.

---

## Recommended Implementation Order After Phase 12A

### Phase 12B — Discover Static Flow Refinement

Goal:

Improve Discover static UI so it naturally leads into Chat.

Allowed:

- Edit only `apps/mobile/app/discover.tsx`
- Static UI only
- Existing UI foundation only

Forbidden:

- Mock users
- Mock profiles
- Real discovery data
- Swipe/match behavior
- Backend/API
- Navigation behavior changes

---

### Phase 12C — Feed Static Flow Refinement

Goal:

Improve Feed static UI so it prepares future 3-column media/voice grid direction without implementing real media.

Allowed:

- Edit only `apps/mobile/app/feed.tsx`
- Static UI only
- Existing UI foundation only

Forbidden:

- Mock media
- Real grid data
- Upload behavior
- Storage
- Backend/API
- Navigation behavior changes

---

### Phase 12D — Discover + Feed Flow Audit

Goal:

Audit that Discover and Feed still remain static and behavior-free.

Codex can be used after Phase 12B and Phase 12C are manually completed.

Expected Codex scope:

- Audit route files
- Update docs/status files only
- Do not modify route UI unless compile-breaking

---

## Acceptance Criteria for Phase 12A

Phase 12A is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Discover and Feed future static directions are clearly planned.
- Phase 12B and Phase 12C are scoped as small manual UI phases.
- No behavior is introduced.

---

## Current Decision

Next phase should be:

Phase 12B — Discover Static Flow Refinement

This should remain static, premium, calm, voice-first, and behavior-free.

---

## Phase 12B Through Phase 12E Result

Phase 12B completed Discover static flow refinement:

- `apps/mobile/app/discover.tsx` is a static, premium, calm, anonymous voice-first entry surface.
- Discover keeps the existing static `/chat` Link behavior.
- No mock users, profiles, avatars, swipe/match behavior, backend/API logic, router.push, tabs, package changes, or new navigation behavior was added.

Phase 12C completed Feed static flow refinement:

- `apps/mobile/app/feed.tsx` is a static anonymous media/voice moment entry surface.
- Feed keeps the existing static `/chat` Link behavior.
- Future 3-column photo/video/audio grid direction is represented statically only.
- No real media, mock posts/users/profiles/avatars, upload/storage/backend/API logic, reveal logic, router.push, tabs, package changes, or new navigation behavior was added.

Phase 12D completed local validation.

APK rebuild was intentionally skipped because Phase 12B and Phase 12C changed only static route UI and did not change native dependencies, package files, lockfile, navigation behavior, or backend/API logic.

Phase 12E completed audit and documentation/status alignment.

Next recommended phase should be either:

- Phase 13A documentation-only planning for the next narrow static product slice
- Optional device APK visual check later

No backend, recorder, real audio, reveal behavior, package change, mock data, upload behavior, or navigation expansion should start next.
