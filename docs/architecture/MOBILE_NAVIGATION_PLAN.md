# Mobile Navigation Plan

## Phase

Phase 9X - Android Preview Smoke Test Passed

## Purpose

This document defines the mobile navigation direction for ankion and now records the completed Phase 8G navigation audit plus the Phase 9X real-device smoke test.

The goal is to protect the current stable mobile skeleton, avoid oversized navigation changes, and keep the anonymous voice-first product flow clear.

Phase 8A was documentation-only. Phase 8D through Phase 8F later added minimal static Links, and Phase 8G audited the result. Phase 9X confirmed the fixed Android preview APK opens on a real device and the current static route flow works.

## Current Mobile Route State

Current routes:

- `apps/mobile/app/index.tsx`
- `apps/mobile/app/discover.tsx`
- `apps/mobile/app/feed.tsx`
- `apps/mobile/app/chat.tsx`
- `apps/mobile/app/profile.tsx`
- `apps/mobile/app/reveal-requests.tsx`
- `apps/mobile/app/_layout.tsx`

Current route behavior:

- `index.tsx` is a static route shell with `Link` entries to Discover, Feed, Chat, Profile, and Reveal Requests.
- `discover.tsx` is static and uses the UI foundation.
- `discover.tsx` includes only a static `Link` to `/chat`.
- `feed.tsx` is static and uses the UI foundation.
- `feed.tsx` includes only a static `Link` to `/chat`.
- `chat.tsx` is static and uses the UI foundation.
- `profile.tsx` is static and uses the UI foundation.
- `reveal-requests.tsx` is static and uses the UI foundation.
- `_layout.tsx` still uses Expo Router `Stack` with `headerShown: false`.

Phase 9X real-device smoke test passed for:

- index route
- Discover
- Feed
- Chat
- Profile
- Reveal Requests
- Discover to Chat
- Feed to Chat

No bottom tabs, redirects, `router.push`, auth gates, backend calls, or product behavior were added.

Current UI foundation pieces:

- `ScreenContainer`
- `SectionHeader`
- `EmptyState`
- `PrivacyNote`
- `SoftAction`
- `uiSpacing`

## Product Navigation Rules

ankion navigation must support these product rules:

1. The app is anonymous voice-first.
2. Real profile visibility is hidden by default.
3. Profile reveal happens only after owner approval.
4. Discover items will eventually open Chat directly.
5. Feed items will eventually open Chat directly.
6. There will be no separate recipient picker screen.
7. Chat is the central interaction hub.
8. Reveal Requests supports profile visibility decisions, but does not expose real profiles by default.
9. Feed will later support a 3-column photo/video/audio grid.
10. Instant media must not reveal the uploader's real profile.
11. Navigation must not make the app feel like a dating app.
12. Copy and screen transitions should feel calm, human, and privacy-aware.

## Entry Route Decision

For now, `index.tsx` should remain a neutral entry route.

Reason:

- It avoids premature routing decisions.
- It keeps the current skeleton stable.
- It gives us room to decide later whether the app should open into Discover, Feed, Chat, or an onboarding/auth flow.
- It avoids introducing auth assumptions before backend/Auth work begins.

Current decision:

- Keep `index.tsx` as a static route shell for now.
- Do not redirect automatically yet.
- Do not add onboarding yet.
- Do not add auth-gated routing yet.

## Bottom Tabs Decision

Bottom tabs should not be implemented through Phase 8G.

Reason:

- Product route hierarchy must be planned first.
- Chat is central, but Discover and Feed also matter.
- Reveal Requests may be a direct tab or a secondary Profile/Chat-linked screen later.
- Adding tabs too early may force incorrect product assumptions.

Current decision:

- Bottom tabs are allowed later.
- Bottom tabs are not implemented through Phase 8G.
- A future phase may introduce a navigation shell only.

Likely future tab candidates:

- Discover
- Feed
- Chat
- Profile

Reveal Requests should likely not be a primary bottom tab in the first implementation unless product testing shows it must be surfaced more strongly.

## Planned Route Roles

### Index

Role:

- Temporary static route shell.
- No product behavior yet.
- No auth routing yet.
- No automatic redirect yet.
- Static `Link` access to current product routes.

Future possible role:

- Redirect to Discover after navigation is stable.
- Redirect to an auth/onboarding flow after Auth exists.
- Become a minimal app landing route during development.

### Discover

Role:

- Voice-first discovery surface.
- Eventually shows anonymous voice/profile discovery entries.
- Item tap should open Chat directly.

Rules:

- No recipient picker.
- No real profile exposure before permission.
- No dating-style profile browsing.
- No mock user data yet.

Future flow:

`Discover item -> Chat conversation context`

Current Phase 8 state:

`Discover screen -> static Link -> Chat shell`

### Feed

Role:

- Anonymous media and voice moment surface.
- Eventually supports 3-column photo/video/audio grid.
- Item tap should open Chat directly.

Rules:

- No real profile exposure before permission.
- No uploader identity leak.
- No mock media data yet.
- No recipient picker.

Future flow:

`Feed item -> Chat conversation context`

Current Phase 8 state:

`Feed screen -> static Link -> Chat shell`

### Chat

Role:

- Central interaction hub.
- Anonymous voice messages live here.
- Reveal request action starts from here.
- Profile visibility state is represented here later.

Rules:

- No voice recorder yet.
- No message bubbles yet.
- No reveal logic yet.
- No approve/reject logic yet.
- No backend/API calls yet.

Future flow examples:

- User enters Chat from Discover.
- User enters Chat from Feed.
- User sends anonymous voice later.
- Recipient requests profile visibility later.
- Sender approves or keeps profile private later.

### Profile

Role:

- Real profile management surface.
- Real profile stays private until approved.
- Later includes reveal/privacy controls.

Rules:

- No real profile edit logic yet.
- No follower/coin/package logic yet.
- No public identity exposure yet.

Future role:

- Manage real profile.
- Manage privacy/reveal preferences.
- Access profile-related settings.

### Reveal Requests

Role:

- Surface profile visibility requests.
- Support owner-controlled reveal decisions later.

Rules:

- No approve/reject buttons yet.
- Avoid harsh wording such as "Rejected".
- No real profile exposure.
- No backend logic.

Future role:

- Review incoming reveal requests.
- Approve visibility.
- Keep profile private.
- Return to related Chat context.

## No Recipient Picker Rule

ankion must not introduce a separate recipient picker screen.

Reason:

- The product is discovery/chat driven.
- Discover and Feed interactions should create direct Chat context.
- A recipient picker would make the app feel like a generic messaging app.
- The core product loop is anonymous discovery leading into voice interaction.

Locked direction:

- Discover item opens Chat directly.
- Feed item opens Chat directly.
- Chat remains the place where voice and reveal actions happen.

## Future Navigation Flow Direction

Target high-level flow:

```text
Index
  -> Discover
  -> Feed
  -> Chat
  -> Profile
  -> Reveal Requests
```

## Phase 13D Navigation Note

Phase 13D recorded the latest real-device APK visual check:

- Index / mobile route shell opened successfully.
- Discover, Feed, Chat, Profile, and Reveal Requests opened successfully.
- No white screen or crash was reported.
- No bottom tabs, `router.push`, redirects, auth gates, backend/API logic, or new navigation behavior were introduced.

The Index route shell remains temporary and should later become a real Home/navigation entry experience. The next recommended phase is Phase 14A documentation-only Home / Navigation polish planning.

## Phase 14A Home / Navigation Polish Planning

Phase 14A creates `docs/product/HOME_NAVIGATION_POLISH_PLAN.md` and keeps navigation implementation deferred.

Planning result:

- Index/mobile route shell is temporary.
- Future Home should feel like a real premium app entry, not a developer route shell.
- Home should guide users to Discover, Feed, Chat, Profile, and Reveal Requests.
- Existing static `Link` approach remains for now.
- No tabs, `router.push`, redirects, auth gates, backend/API logic, mock data, package changes, or new navigation behavior are added in Phase 14A.

Next recommended navigation step:

- Phase 14B Index static Home polish only.

## Phase 14D Home Polish Status

Phase 14D confirms:

- `apps/mobile/app/index.tsx` was updated from a temporary route shell to a static premium Home entry.
- existing Link-based navigation was preserved.
- `_layout.tsx` remains a hidden-header Stack.
- no tabs, `router.push`, redirects, auth gates, backend/API logic, mock data, package changes, apps/web source changes, or new navigation behavior were added.

Next recommended phase:

- Phase 15A documentation-only planning for the next narrow static product slice.
