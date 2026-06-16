# Static MVP Readiness Plan

## Phase

Phase 15A — Documentation-only Static MVP Readiness Planning

## Purpose

This document defines the static MVP readiness checkpoint for ankion before moving toward real behavior.

The goal is to verify that the current static app screens feel coherent, premium, calm, privacy-first, and ready for future controlled implementation slices.

This phase is documentation-only.

No route UI changes are included in Phase 15A.

---

## Current App State

ankion currently has a working static mobile app foundation.

The app includes:

- Static premium Home entry
- Static Discover flow
- Static Feed flow
- Static Chat interaction explanation
- Static Profile visibility control surface
- Static Reveal Requests review surface
- Dark-first mobile UI direction
- Existing Link-based navigation
- Successful Android APK visual check
- No backend/API
- No Supabase/Auth/RLS/Storage
- No recorder/audio behavior
- No reveal logic
- No mock data

The current product is still behavior-free by design.

---

## Static MVP Readiness Goal

Before adding real product behavior, the static MVP should answer:

1. Does the app feel like a real product, not a documentation prototype?
2. Does the user understand the core anonymous voice-first flow?
3. Does Discover naturally lead to Chat?
4. Does Feed naturally lead to Chat?
5. Does Chat explain the voice and reveal model clearly?
6. Does Profile feel owner-controlled?
7. Does Reveal Requests feel calm and permission-based?
8. Does the app avoid dating-app patterns?
9. Does the UI feel premium enough for the current static phase?
10. Are we ready to plan the next technical layer later?

---

## Current Screen Readiness

### Home

Current status:

Home was upgraded from temporary route shell to static premium app entry.

Readiness:

Good for current static phase.

Remaining polish:

- Reduce explanatory density later
- Make primary app entry path more visual
- Prepare future navigation system only after more planning

Do not add yet:

- Tabs
- router.push
- Auth entry
- onboarding behavior
- real session logic

---

### Discover

Current status:

Discover acts as a static anonymous voice-first discovery entry point.

Readiness:

Good for current static phase.

Remaining polish:

- Make it less explanation-heavy later
- Improve app-like discovery feeling
- Avoid fake profiles and dating cards

Do not add yet:

- fake users
- fake avatars
- swipe/match behavior
- recipient picker
- backend data

---

### Feed

Current status:

Feed communicates future anonymous photo/video/audio grid direction with static preview.

Readiness:

Good for current static phase.

Remaining polish:

- Avoid looking like a fake real feed
- Improve visual rhythm of future grid preview
- Keep media privacy clear

Do not add yet:

- real media
- fake posts
- upload behavior
- storage
- follower/coin logic

---

### Chat

Current status:

Chat explains anonymous voice interaction, future composer, voice lifecycle, reveal education, and privacy model.

Readiness:

Strong for current static phase.

Remaining polish:

- Reduce text density later
- Make the top half more action-oriented
- Preserve behavior-free state until recorder/backend planning is approved

Do not add yet:

- recorder
- microphone permission
- real audio
- play/pause
- fake messages
- reveal request logic

---

### Profile

Current status:

Profile acts as a static owner-controlled visibility center.

Readiness:

Good for current static phase.

Remaining polish:

- Later add real profile structure only after Auth/profile model planning
- Keep real identity private by default
- Avoid public dating profile feel

Do not add yet:

- fake name
- fake avatar
- fake bio
- profile edit behavior
- follower/coin/package behavior

---

### Reveal Requests

Current status:

Reveal Requests acts as a static calm permission review surface.

Readiness:

Good for current static phase.

Remaining polish:

- Later design request list behavior only after reveal data model planning
- Avoid harsh decision wording
- Preserve calm review language

Do not add yet:

- approve button
- reject button
- fake requester
- request status logic
- backend reveal logic

---

## Static MVP Quality Rules

The static MVP should feel:

- Premium
- Calm
- Dark-first
- Mobile-native
- Voice-first
- Privacy-first
- Human
- Non-dating-app
- Permission-based
- Owner-controlled

The static MVP should not feel:

- Like a developer route list
- Like a dating swipe app
- Like a fake social feed
- Like a backend demo
- Like a warning-heavy privacy app
- Like a documentation page

---

## Product Flow Readiness

The intended static flow is:

1. Home introduces ankion.
2. Discover and Feed act as entry surfaces.
3. Chat becomes the central anonymous interaction space.
4. Profile explains owner-controlled identity.
5. Reveal Requests explains future permission review.

This flow is now coherent enough for the current static phase.

---

## UI Debt To Address Before Real Behavior

Before recorder/backend/reveal implementation, address these static UI debts:

1. Text density reduction
2. Repeated privacy copy cleanup
3. More app-like Home hierarchy
4. Better scroll rhythm across long screens
5. More reusable visual patterns
6. Token consistency review
7. Static component extraction planning
8. Navigation system planning
9. Future onboarding planning
10. Future data model planning

---

## Recommended Next Phases

### Phase 15B — Static MVP Visual Polish Audit

Documentation-only.

Goal:

Audit all static screens for text density, scroll rhythm, repeated copy, and app-like feel.

No code.

---

### Phase 15C — Home / Screen Copy Compression Plan

Documentation-only or single-screen planning.

Goal:

Plan how to reduce explanation-heavy copy without losing product meaning.

No behavior.

---

### Phase 15D — Static Component Extraction Plan

Documentation-only.

Goal:

Plan whether repeated card patterns should later become reusable components.

No component creation yet.

---

### Phase 15E — Static MVP Readiness Audit + Docs Alignment

Codex audit after Phase 15B–15D.

Goal:

Update docs/status and confirm no forbidden behavior was added.

---

## Forbidden Areas

Do not add:

- Supabase
- Auth
- RLS
- Storage
- Migrations
- Backend/API
- Mock users
- Mock profiles
- Mock media
- Mock messages
- Mock reveal data
- Voice recorder
- Real audio
- Play/pause behavior
- Reveal logic
- Approve/reject logic
- Upload behavior
- Package installs
- package.json changes
- pnpm-lock.yaml changes
- apps/web source changes
- Shared packages
- Tabs
- router.push
- New navigation behavior

---

## Acceptance Criteria for Phase 15A

Phase 15A is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Static MVP readiness direction is documented.
- Next planning phases are clearly scoped.
- No real behavior is introduced.

---

## Current Decision

The app is not ready for backend, recorder, audio, reveal logic, upload behavior, or real data yet.

The next correct direction is static MVP quality review and polish planning.

## Phase 15F Completion Note

Phase 15A through Phase 15F are now recorded as complete.

Confirmed:

- Chat copy is compressed and less technical after Phase 15D.
- Phase 15E local validation passed after Chat compression.
- Phase 15F aligned docs/status only.
- Current app remains static and behavior-free.
- No backend/recorder/audio/reveal/upload/data/navigation behavior has started.

Next recommended phase:

- Home static copy compression / planning, or Discover/Feed static copy compression planning.
