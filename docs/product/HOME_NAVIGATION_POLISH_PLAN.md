# Home / Navigation Polish Plan

## Phase

Phase 14A - Documentation-only Home / Navigation polish planning

## Purpose

This document defines how the temporary mobile index route should later become a real premium app entry experience without adding route UI, behavior, backend logic, package changes, or navigation implementation in this phase.

Phase 14A is documentation-only.

No route files are changed in this phase.

---

## Current State

The current `apps/mobile/app/index.tsx` route is still a temporary mobile route shell.

It exists so the app can open and provide static route access to the approved product routes:

- Discover
- Feed
- Chat
- Profile
- Reveal Requests

This is safe for the current static phase, but it should not remain a developer-style route shell long term.

Future Home should feel like a real premium mobile app entry, not a development menu.

---

## Product Direction

Home should guide users into ankion's core static route areas while preserving the current privacy and behavior boundaries.

Future Home should:

- feel dark-first, premium, calm, and mobile-native
- introduce the app as anonymous, voice-first, and privacy-first
- guide users to Discover, Feed, Chat, Profile, and Reveal Requests
- keep Chat as the central interaction hub
- avoid dating-app language, match language, and swipe language
- avoid suggesting real profile visibility is public by default

---

## Current Navigation Boundary

The existing static `Link` approach remains for now.

Phase 14A does not add:

- behavior
- tabs
- `router.push`
- redirects
- auth gates
- route params
- selected recipient state
- navigation state
- backend/API logic

Future polish can make the index route feel more intentional, but navigation behavior must remain a separately approved slice.

---

## Future Home Content Direction

The later Home polish phase can include static presentation for:

- a calm app entry title
- a short privacy-first product orientation
- static route cards or sections for Discover, Feed, Chat, Profile, and Reveal Requests
- clear copy that Discover and Feed lead naturally into Chat
- a reminder that real profile visibility is permission-based
- passive future-state language for unavailable behavior

It must not include:

- real users
- mock users
- fake profiles
- fake messages
- fake media
- request data
- recorder controls
- upload controls
- reveal actions
- backend/API state

---

## Implementation Slicing

### Phase 14B - Index Static Home Polish Only

Allowed future scope:

- edit only `apps/mobile/app/index.tsx`
- keep the screen static
- keep existing static `Link` navigation approach
- use existing React Native and approved UI foundation patterns only
- make the index route feel like a real Home entry rather than a developer route shell

Forbidden future scope:

- tabs
- `router.push`
- redirects
- new navigation behavior
- backend/API
- Supabase/Auth/RLS/Storage
- mock data
- recorder/audio/reveal/upload behavior
- package changes
- apps/web changes
- shared packages

### Phase 14C - Local Validation

Run:

- `corepack pnpm --filter @ankion/mobile typecheck`
- `corepack pnpm --filter @ankion/web typecheck`

Optional quick checks can be added only if needed and approved.

Do not run EAS build unless a later visual-device checkpoint is explicitly requested.

### Phase 14D - Docs / Status Alignment

After Phase 14B and Phase 14C complete, align:

- `PROJECT_STATUS.md`
- `FILE_MAP.md`
- `CHANGELOG.md`
- relevant product/navigation docs

Confirm the app remains static and behavior-free.

---

## Forbidden Areas

Do not add:

- Supabase
- Auth
- RLS
- Storage
- migrations
- backend/API logic
- mock user/media/message/reveal data
- voice recorder
- real audio
- play/pause behavior
- reveal logic
- approve/reject logic
- upload behavior
- package installs
- package file changes
- lockfile changes
- apps/web source changes
- shared packages
- tabs
- `router.push`
- new navigation behavior

---

## Acceptance Criteria For Phase 14A

Phase 14A is complete when:

- this document exists
- no route files changed
- no component files changed
- no package files changed
- no lockfile changed
- no backend/security/data files were added
- Home / navigation polish direction is documented
- Phase 14B, Phase 14C, and Phase 14D are scoped as small future phases
- the current static `Link` approach remains the navigation boundary

---

## Current Decision

Phase 14A through Phase 14D are complete.

Phase 14B completed:

- `apps/mobile/app/index.tsx` was updated from a temporary route shell to a static premium Home entry.
- Existing Link-based navigation was preserved.
- No tabs, `router.push`, redirects, auth gates, or new navigation behavior were added.
- No backend/API/Supabase/Auth/RLS/Storage, mock data, recorder/audio/reveal/upload behavior, package changes, apps/web changes, or shared packages were added.

Phase 14C completed:

- local validation passed after the `index.tsx` update.

Phase 14D completed:

- docs/status alignment recorded the static Home polish result.

Next recommended phase:

- Phase 15A documentation-only planning for the next narrow static product slice.

## Phase 16D Home Copy Alignment Note

Phase 16A through Phase 16D are complete.

Confirmed:

- Home static copy compression planning was documented in `docs/product/HOME_STATIC_COPY_COMPRESSION_PLAN.md`.
- Home static copy was manually compressed in `apps/mobile/app/index.tsx` during Phase 16B.
- Existing Link-based navigation was preserved.
- Phase 16C local validation passed.
- Phase 16D aligned docs/status only.
- No tabs, `router.push`, redirects, backend/API, Supabase/Auth/RLS/Storage, mock data, recorder/audio/reveal/upload behavior, package changes, lockfile changes, apps/web source changes, or new navigation behavior was added.
