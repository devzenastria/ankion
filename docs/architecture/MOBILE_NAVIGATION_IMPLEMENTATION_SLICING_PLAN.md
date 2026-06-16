# Mobile Navigation Implementation Slicing Plan

## Phase

Phase 9X - Android Preview Smoke Test Passed

## Purpose

This document defines how mobile navigation will be implemented in small, isolated, low-risk phases and records the completed Phase 8G audit plus the Phase 9X real-device smoke test.

The goal is to avoid oversized routing changes, protect the current stable mobile app, and keep ankion's anonymous voice-first flow clear.

Phase 8B was documentation-only. Phase 8D through Phase 8F later added minimal static Links, and Phase 8G audited the current navigation state. Phase 9X confirmed the fixed Android preview APK opens on a real device and the current static navigation flow works.

## Current Baseline

Current stable baseline:

- `index.tsx` is a static route shell with `Link` entries to Discover, Feed, Chat, Profile, and Reveal Requests.
- `discover.tsx` is static and uses the UI foundation.
- `discover.tsx` includes only a static `Link` to `/chat`.
- `feed.tsx` is static and uses the UI foundation.
- `feed.tsx` includes only a static `Link` to `/chat`.
- `chat.tsx` is static and uses the UI foundation.
- `profile.tsx` is static and uses the UI foundation.
- `reveal-requests.tsx` is static and uses the UI foundation.
- `_layout.tsx` remains a hidden-header Stack.
- Minimal static Links have been added only where approved.
- No bottom tabs have been added yet.
- No redirect has been added yet.
- No `router.push` has been added yet.
- No mock user/media/message/reveal data exists.
- No backend/Auth/Supabase/RLS/Storage logic exists.

## Completed Phase 8 Slices

- Phase 8A: created `docs/architecture/MOBILE_NAVIGATION_PLAN.md`.
- Phase 8B: created this slicing plan.
- Phase 8C: audited `apps/mobile/app/_layout.tsx`; it remains `Stack` with `headerShown: false`.
- Phase 8D: updated `apps/mobile/app/index.tsx` with static `Link` entries to the approved product routes.
- Phase 8E: updated `apps/mobile/app/discover.tsx` with a minimal static `Link` to `/chat`.
- Phase 8F: updated `apps/mobile/app/feed.tsx` with a minimal static `Link` to `/chat`.
- Phase 8G: audited the navigation state and aligned source-of-truth docs.
- Phase 9X: confirmed Android preview APK real-device smoke test passed for index, all current routes, Discover to Chat, and Feed to Chat.
- Phase 13D: recorded latest APK visual check; Index, Discover, Feed, Chat, Profile, and Reveal Requests opened successfully, and Index remains a temporary route shell.
- Phase 14A: created `docs/product/HOME_NAVIGATION_POLISH_PLAN.md` as documentation-only planning for future Index static Home polish.
- Phase 14B: updated `apps/mobile/app/index.tsx` from temporary route shell to static premium Home entry.
- Phase 14C: local validation passed.
- Phase 14D: aligned docs/status for static Home polish.

## Phase 8G Audit Result

Phase 8G confirms:

- root layout still uses Stack with hidden headers
- index remains a static route shell
- Discover and Feed only link statically to Chat
- Chat, Profile, and Reveal Requests remain static
- bottom tabs, redirects, `router.push`, product behavior, mock data, API/backend logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, and shared package work remain deferred

## Phase 13D Navigation Status

Phase 13D confirms:

- latest APK opened successfully on a real Android device
- Index / mobile route shell, Discover, Feed, Chat, Profile, and Reveal Requests were visually checked
- no bottom tabs, redirects, `router.push`, auth gates, new navigation behavior, backend/API logic, Supabase/Auth/RLS/Storage, package changes, or shared packages were introduced
- Index route shell is still temporary
- next recommended phase is Phase 14A documentation-only Home / Navigation polish planning

## Phase 14A Home / Navigation Polish Planning Status

Phase 14A confirms:

- Index/mobile route shell is temporary
- future Home should feel like a real premium app entry
- Home should guide users to Discover, Feed, Chat, Profile, and Reveal Requests
- existing static `Link` approach remains for now
- no tabs, redirects, `router.push`, auth gates, backend/API logic, mock data, package changes, apps/web source changes, or new navigation behavior were added

Future slicing:

- Phase 14B: Index static Home polish only
- Phase 14C: local validation
- Phase 14D: docs/status alignment

## Phase 14D Home Polish Status

Phase 14D confirms:

- Index is now a static premium Home entry.
- existing Link-based navigation remains the navigation boundary.
- `_layout.tsx` remains a hidden-header Stack.
- no bottom tabs, redirects, `router.push`, auth gates, backend/API logic, mock data, package changes, apps/web source changes, shared packages, or new navigation behavior were added.

Next recommended phase:

- Phase 15A documentation-only planning for the next narrow static product slice.

## Navigation Implementation Principles

Navigation must be added under these rules:

1. One small route/navigation concern per phase.
2. No product behavior mixed with navigation shell work.
3. No mock users, profiles, media, messages, or reveal requests.
4. No recipient picker.
5. No backend/API/Auth/Supabase/RLS/Storage work.
6. No package installation.
7. No `package.json` or `pnpm-lock.yaml` changes.
8. No apps/web source changes.
9. Validation must pass after every phase.
10. Documentation/status alignment can be batched after several manual phases.

## Locked Product Navigation Direction

ankion must keep this direction:

```text
Discover item -> Chat
Feed item -> Chat
Chat -> Reveal request intent
Reveal Requests -> Review visibility requests later
Profile -> Manage real profile/privacy later
```
