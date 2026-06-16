# PRODUCT_UI_IMPLEMENTATION_SLICING_PLAN.md

## Purpose

Define the Phase 4B product UI implementation slicing plan before any product UI files are created.

This document explains how future mobile product UI screens should be introduced in small, isolated, reviewable phases.

## Status

Phase 7F route UI consistency audit completed.

Phase 9F product flow audit completed after static product-flow surfaces were added to Chat, Profile, and Reveal Requests. Phase 9X Android preview APK build/debug fixes also completed. All Phase 9 UI work remains static and product behavior, mock users, fake request/media/message data, Supabase files, Auth logic, Storage logic, RLS SQL, migrations, backend logic, API integration, real user/request data, navigation tabs, and shared packages remain deferred.

## Source Documents

This plan follows:

- `docs/product/PRODUCT_UI_FLOW_BLUEPRINT.md`
- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`

## Exact Future Implementation Order

Future product UI work must be introduced in this order:

1. Phase 5A: mobile route shell only
2. Phase 5B: static Discover placeholder
3. Phase 5C: static Chat placeholder
4. Phase 5D: static Profile placeholder
5. Phase 5E: static Feed placeholder
6. Phase 5F: static Reveal Requests placeholder

Do not combine these phases.

Do not skip directly to complete product UI.

## Phase 6 Sequencing Note

Phase 6 begins only after the Phase 5 placeholder audit.

Phase 6A is documentation-only and creates `docs/design/MOBILE_UI_FOUNDATION_PLAN.md`.

Phase 6B creates only `apps/mobile/src/constants/ui.ts` with static token constants.

Phase 6C creates only `apps/mobile/src/components/ScreenContainer.tsx` and does not apply it to routes.

Phase 6D creates only `apps/mobile/src/components/SectionHeader.tsx` and does not apply it to routes.

Phase 6E creates only `apps/mobile/src/components/EmptyState.tsx` and does not apply it to routes.

Phase 6F creates only `apps/mobile/src/components/SoftAction.tsx` and does not apply it to routes or add press behavior.

Phase 6G verifies the manually created `apps/mobile/src/components/PrivacyNote.tsx` and does not apply it to routes.

Phase 6H audits the completed mobile UI foundation and confirms route UI application has not started.

Phase 7A applies the approved foundation pieces to Discover only while keeping it static.

Phase 7B applies the approved foundation pieces to Chat only while keeping it static.

Phase 7C applies the approved foundation pieces to Profile only while keeping it static.

Phase 7D applies the approved foundation pieces to Feed only while keeping it static.

Phase 7E applies the approved foundation pieces to Reveal Requests only while keeping it static.

Phase 7F audits route UI consistency across approved product routes.

Phase 8A through Phase 8G completed minimal static navigation planning, static links, and navigation audit.

Phase 9A adds a static Chat product interaction layout only.

Phase 9B adds a static anonymous voice card placeholder in Chat only.

Phase 9C adds a static profile reveal request placeholder in Chat only.

Phase 9D adds a static Profile privacy/reveal control surface only.

Phase 9E adds a static Reveal Requests request card surface only.

Phase 9F audits Phase 9A through Phase 9E and confirms no product behavior has started.

Phase 9X fixes Android preview APK build/runtime issues by aligning Expo Router direct dependencies and React/Expo SDK 56 compatible package versions. It does not add product behavior.

Phase 10A creates `docs/product/CHAT_INTERACTION_SYSTEM_PLAN.md` as a documentation-only Chat interaction plan.

Phase 10B refines Chat context hierarchy as static UI only.

Phase 10C adds a passive voice composer placeholder as static UI only.

Phase 10D adds a static five-step voice message lifecycle explanation.

Phase 10E adds a static reveal education surface.

Phase 10F audits Phase 10A through Phase 10E and confirms no recorder, audio, reveal, backend, mock data, or package behavior has started.

Future Phase 6 implementation must remain sliced:

1. Add one foundation file or one component at a time.
2. Avoid route redesign during foundation implementation.
3. Implement additional shared components only after explicit approval.
4. Audit the completed foundation before route application.
5. Apply approved foundation pieces to one route at a time in later phases.
6. Keep each route static until behavior is separately approved.

Phase 6 must not add navigation tabs, mock data, Supabase/Auth/Storage/RLS/API logic, package changes, apps/web source changes, or shared packages unless a later explicit task allows it.

## Rules For Every Future UI Phase

Each future phase must follow these rules:

- one small change at a time
- no Supabase
- no Auth
- no Storage
- no RLS
- no backend logic
- no real user data
- no API integration
- no package installation unless separately approved
- no shared package architecture
- no production secrets
- no migrations
- no product behavior beyond that phase's static placeholder scope

Each future phase must update:

- `PROJECT_STATUS.md`
- `FILE_MAP.md`
- `CHANGELOG.md`

Each future phase must run:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

## Initial Route Direction

Later route implementation must preserve:

- Discover opens Chat directly.
- Feed item opens Chat directly for early static placeholder phases.
- No recipient picker is allowed.
- Chat remains the central interaction hub.
- Profile reveal remains permission-based.
- Real profile remains hidden unless owner approval and a valid visibility rule allow it.

Later Feed behavior may introduce Instant Content Detail only when that phase is explicitly approved. Until then, static Feed placeholders must not invent extra routes.

## Product Safety Rules

Future UI phases must preserve:

- real profile hidden unless approved
- instant media does not reveal real identity
- calm human copy
- no harsh copy such as `Rejected`, `Denied`, or `Access refused`
- no dating-app behavior
- no swipe/match mechanics
- no public real-profile browsing
- no text-first Chat drift
- no instant-media shortcut to real profile visibility

## Phase 5A Acceptance Criteria: Mobile Route Shell Only

Goal:

- Create only the minimal mobile route grouping needed for future product placeholders.

Acceptance criteria:

- Route shell exists only in approved files.
- Existing skeleton still renders a neutral entry state.
- No Discover, Feed, Chat, Profile, or Reveal Requests screen content is implemented.
- No navigation tabs unless explicitly approved in the Phase 5A task.
- No recipient picker exists.
- No Supabase/Auth/Storage/RLS/API logic exists.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5A status:

- Completed with neutral route shell files only.
- No navigation tabs were added.
- No product UI behavior was implemented.

## Phase 5B Acceptance Criteria: Static Discover Placeholder

Goal:

- Add a static Discover placeholder only.

Acceptance criteria:

- Discover route/screen exists only as a static placeholder.
- Placeholder copy preserves anonymous hidden-profile direction.
- Discover indicates future Chat entry without implementing real interaction.
- No real profile data appears.
- No recipient picker exists.
- No backend/API/Supabase/Auth/Storage/RLS logic exists.
- No Feed, Chat, Profile, or Reveal Requests implementation is added beyond previously approved files.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5B status:

- Completed with static Discover placeholder copy only.
- No mock users, profiles, messages, navigation behavior, API calls, or backend/security logic were added.

## Phase 5C Acceptance Criteria: Static Chat Placeholder

Goal:

- Add a static Chat placeholder only.

Acceptance criteria:

- Chat route/screen exists only as a static placeholder.
- Placeholder reinforces Chat as the central interaction hub.
- Placeholder remains voice-first.
- No real voice recording, media upload, API integration, or backend logic exists.
- No real user data appears.
- No reveal decision logic is implemented.
- No recipient picker exists.
- No Supabase/Auth/Storage/RLS logic exists.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5C status:

- Completed with static Chat placeholder copy only.
- No mock users, fake messages, message bubbles, voice recorder, reveal request logic, navigation behavior, API calls, or backend/security logic were added.

## Phase 5D Acceptance Criteria: Static Profile Placeholder

Goal:

- Add a static Profile placeholder only.

Acceptance criteria:

- Profile route/screen exists only as a static placeholder.
- Placeholder states that real profile visibility is permission-based.
- Future top-right floating chat bubble direction may be noted visually only if explicitly approved.
- No real profile data appears.
- No reveal grants, Auth, Supabase, API, Storage, or RLS logic exists.
- No dating-app profile behavior is introduced.
- No new routes beyond the approved Profile placeholder are added.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5D status:

- Completed with static Profile placeholder copy only.
- No mock users, fake profiles, fake avatars, follower counts, coin/package logic, reveal approval logic, profile edit logic, navigation behavior, API calls, or backend/security logic were added.

## Phase 5E Acceptance Criteria: Static Feed Placeholder

Goal:

- Add a static Feed placeholder only.

Acceptance criteria:

- Feed route/screen exists only as a static placeholder.
- Placeholder references future 3-column photo/video/audio grid direction.
- Static content does not imply real identity reveal.
- Feed item may indicate future Chat direction without implementing data or navigation behavior unless explicitly approved.
- No Instant Content Detail route is created unless separately approved.
- No backend/API/Supabase/Auth/Storage/RLS logic exists.
- No real user data or storage paths appear.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5E status:

- Completed with static Feed placeholder copy only.
- No mock media, fake users, fake profiles, fake avatars, photo/video/audio cards, grid implementation, navigation behavior, API calls, or backend/security logic were added.

## Phase 5F Acceptance Criteria: Static Reveal Requests Placeholder

Goal:

- Add a static Reveal Requests placeholder only.

Acceptance criteria:

- Reveal Requests route/screen exists only as a static placeholder.
- Placeholder uses calm human copy.
- Copy avoids `Rejected`, `Denied`, and harsh refusal language.
- Placeholder states that owner approval is required.
- Placeholder does not implement real request state, grants, Auth, Supabase, API, Storage, or RLS logic.
- Real profile remains hidden in all static content.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5F status:

- Completed with static Reveal Requests placeholder copy only.
- No mock users, fake profiles, fake avatars, request cards, approve/reject buttons, notification logic, profile visibility logic, navigation behavior, API calls, or backend/security logic were added.

## Phase 5G Audit Criteria: Mobile Placeholder Consistency

Goal:

- Audit completed Phase 5 mobile placeholders before any future UI foundation or product behavior work.

Acceptance criteria:

- Discover, Chat, Profile, Feed, and Reveal Requests route files exist.
- Each audited route is static only.
- Each audited route uses only React Native `View`, `Text`, and `StyleSheet`.
- No mock data, fake users, fake profiles, fake avatars, fake media, fake messages, or fake reveal requests exist.
- No voice recorder logic exists.
- No navigation behavior or tabs were added.
- No Supabase/Auth/Storage/RLS/API logic exists.
- No package files or `pnpm-lock.yaml` changed.
- No apps/web source files changed.
- No shared packages were created.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 5G status:

- Completed as a documentation/status audit only.
- All Phase 5 placeholders were confirmed static and consistent.
- No route UI, package files, apps/web source files, Supabase/Auth/RLS/Storage files, or shared package structure were changed.

## Phase 7A Acceptance Criteria: Apply UI Foundation To Discover Only

Goal:

- Apply approved mobile UI foundation components to the static Discover route only.

Acceptance criteria:

- `apps/mobile/app/discover.tsx` uses approved foundation pieces only.
- Discover remains static and contains no real navigation behavior.
- No mock data, fake users, fake profiles, fake messages, fake media, or fake reveal requests exist.
- No backend/API/Supabase/Auth/Storage/RLS logic exists.
- Chat, Profile, Feed, Reveal Requests, and index route files remain unchanged.
- No package files or `pnpm-lock.yaml` changed.
- No apps/web source files changed.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7A status:

- Completed with Discover-only foundation usage.
- Discover uses `ScreenContainer`, `SectionHeader`, `EmptyState`, `PrivacyNote`, `SoftAction`, and `uiSpacing`.
- No product behavior, navigation, data, backend/security logic, package changes, apps/web source changes, or shared packages were added.

Next planned phase:

- Phase 7B Apply UI foundation to Chat only.

## Phase 7B Acceptance Criteria: Apply UI Foundation To Chat Only

Goal:

- Apply approved mobile UI foundation components to the static Chat route only.

Acceptance criteria:

- `apps/mobile/app/chat.tsx` uses approved foundation pieces only.
- Chat remains static and contains no real navigation behavior.
- No message bubbles, voice recorder logic, reveal request behavior, mock data, or backend/API/Supabase/Auth/Storage/RLS logic exists.
- No package files or `pnpm-lock.yaml` changed.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7B status:

- Completed with Chat-only foundation usage.

## Phase 7C Acceptance Criteria: Apply UI Foundation To Profile Only

Goal:

- Apply approved mobile UI foundation components to the static Profile route only.

Acceptance criteria:

- `apps/mobile/app/profile.tsx` uses approved foundation pieces only.
- Profile remains static and contains no real navigation behavior.
- No fake profile data, avatars, follower counts, coin/package logic, reveal approval logic, mock data, or backend/API/Supabase/Auth/Storage/RLS logic exists.
- No package files or `pnpm-lock.yaml` changed.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7C status:

- Completed with Profile-only foundation usage.

## Phase 7D Acceptance Criteria: Apply UI Foundation To Feed Only

Goal:

- Apply approved mobile UI foundation components to the static Feed route only.

Acceptance criteria:

- `apps/mobile/app/feed.tsx` uses approved foundation pieces only.
- Feed remains static and contains no real navigation behavior.
- No 3-column grid implementation, mock media, photo/video/audio cards, storage logic, or backend/API/Supabase/Auth/Storage/RLS logic exists.
- No package files or `pnpm-lock.yaml` changed.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7D status:

- Completed with Feed-only foundation usage.

## Phase 7E Acceptance Criteria: Apply UI Foundation To Reveal Requests Only

Goal:

- Apply approved mobile UI foundation components to the static Reveal Requests route only.

Acceptance criteria:

- `apps/mobile/app/reveal-requests.tsx` uses approved foundation pieces only.
- Reveal Requests remains static and contains no real navigation behavior.
- No reveal request cards, approve/reject buttons, notification logic, profile visibility logic, mock request data, or backend/API/Supabase/Auth/Storage/RLS logic exists.
- No package files or `pnpm-lock.yaml` changed.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7E status:

- Completed with Reveal Requests-only foundation usage.

## Phase 7F Audit Criteria: Route UI Consistency

Goal:

- Audit Phase 7 route foundation usage before navigation planning or behavior work begins.

Acceptance criteria:

- Discover, Chat, Profile, Feed, and Reveal Requests route files exist.
- Each product route uses `ScreenContainer`, `SectionHeader`, `EmptyState`, `PrivacyNote`, `SoftAction`, and `uiSpacing`.
- Each product route remains static only.
- Index remains a neutral route shell.
- No navigation tabs, route navigation behavior, mock data, API calls, backend logic, Supabase/Auth/Storage/RLS logic, migrations, package changes, apps/web source changes, or shared packages exist.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 7F status:

- Completed as a documentation/status audit after manual Phase 7B through 7E route application.
- All approved product routes are static, consistent, and behavior-free.
- Followed by Phase 8A navigation planning only.

## Phase 9F Audit Criteria: Static Product Flow Surfaces

Goal:

- Audit manually completed Phase 9A through Phase 9E before any behavior, data, recorder, reveal, or backend work begins.

Acceptance criteria:

- `apps/mobile/app/chat.tsx` remains static.
- Chat has no real messages, recorder, play/pause behavior, reveal logic, backend calls, or mock messages.
- `apps/mobile/app/profile.tsx` remains static.
- Profile has no real profile edit logic, follower/coin/package logic, backend calls, or mock user/profile data.
- `apps/mobile/app/reveal-requests.tsx` remains static.
- Reveal Requests has no approve/reject behavior, actual reveal logic, backend calls, or mock user/profile data.
- No Supabase/Auth/Storage/RLS/API logic exists.
- No migrations exist.
- No package files or `pnpm-lock.yaml` changed.
- No apps/web source files changed.
- No shared packages were created.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 9F status:

- Completed as a documentation/status audit.
- Chat, Profile, and Reveal Requests contain static product-flow surfaces only.
- Product behavior, data integration, backend/security work, and package changes remain deferred.

## Phase 9X Android Preview APK Build Fix Status

Goal:

- Make the Android preview APK build and open reliably on a real Android device without adding product behavior.

Completed state:

- `expo-linking` and `expo-constants` are declared directly in `apps/mobile/package.json`.
- React is pinned/aligned to `19.2.3` after the real-device crash showed a React / `react-native-renderer` mismatch.
- Expo SDK 56 compatible package versions are reflected in `apps/mobile/package.json` and `pnpm-lock.yaml`.
- EAS preview APK build succeeded.
- Fixed APK opened successfully on a real Android device.
- Real-device smoke test passed for index, Discover, Feed, Chat, Profile, Reveal Requests, Discover to Chat, and Feed to Chat.
- No development build has been introduced yet.

Phase 9X does not allow:

- product behavior
- mock data
- backend/API logic
- Supabase/Auth/RLS/Storage logic
- migrations
- voice recorder or real audio
- reveal/approve/reject logic
- apps/web source changes
- shared package creation

## Phase 10F Chat Interaction Audit Criteria

Goal:

- Audit manually completed Phase 10A through Phase 10E before any Chat behavior, recorder, audio, reveal, or backend work begins.

Acceptance criteria:

- `apps/mobile/app/chat.tsx` remains static and behavior-free.
- No `Pressable`, `TouchableOpacity`, `onPress`, recorder behavior, microphone permission logic, real audio logic, or play/pause behavior exists.
- No fake users, fake profiles, fake messages, fake reveal requests, fake avatars, or fake media records exist.
- No backend/API/Supabase/Auth/RLS/Storage/migration logic exists.
- No package files or `pnpm-lock.yaml` changed.
- No apps/web source files changed.
- Existing route/navigation behavior was not expanded.
- Mobile typecheck passes.
- Web typecheck and build still pass.

Phase 10F status:

- Completed as an audit and documentation/status alignment phase.
- Chat contains static context hierarchy, passive composer, lifecycle explanation, and reveal education surfaces.
- Chat currently has duplicate explanatory surfaces from Phase 9 and Phase 10; plan simplification before adding behavior.

Next recommended phase:

- Phase 11A documentation-only Chat UI simplification / duplicate explanation cleanup planning.

## Phase 11A-11C Chat Simplification Status

Phase 11A status:

- Completed as documentation-only Chat UI simplification / duplicate explanation cleanup planning.
- Created `docs/product/CHAT_UI_SIMPLIFICATION_PLAN.md`.

Phase 11B status:

- Completed as a static Chat duplicate explanation cleanup.
- Removed duplicated Chat surfaces: `interactionCard`, `revealCard`, `flowCard`, and Chat `EmptyState`.
- Kept `SectionHeader`, `contextCard`, `composerCard`, `voiceCard`, `lifecycleCard`, `revealEducationCard`, `PrivacyNote`, and `SoftAction`.

Phase 11C status:

- Completed local validation with mobile and web typecheck passing.
- APK rebuild was intentionally skipped because there were no native dependency, package, lockfile, or navigation changes.

Current boundary:

- Chat remains static and behavior-free.
- Recorder, real audio, play/pause behavior, reveal behavior, backend/API logic, Supabase/Auth/RLS/Storage, mock data, package changes, and navigation expansion remain deferred.

Next recommended phase:

- Phase 12A documentation-only planning for the next narrow static product slice.
- Optional later checkpoint: Phase 11E device APK visual check.

## Phase 12A-12E Discover / Feed To Chat Flow Status

Phase 12A status:

- Completed as documentation-only Discover / Feed to Chat static flow planning.
- Created `docs/product/DISCOVER_FEED_TO_CHAT_FLOW_PLAN.md`.

Phase 12B status:

- Completed as Discover static flow refinement.
- Discover remains static and keeps the existing static `/chat` Link behavior.
- No mock users/profiles/avatars, swipe/match behavior, backend/API logic, router.push, tabs, package changes, or new navigation behavior was added.

Phase 12C status:

- Completed as Feed static flow refinement.
- Feed remains static and keeps the existing static `/chat` Link behavior.
- Future 3-column photo/video/audio grid direction is static only.
- No real media, mock posts/users/profiles/avatars, upload/storage/backend/API logic, reveal logic, router.push, tabs, package changes, or new navigation behavior was added.

Phase 12D status:

- Completed local validation for Discover and Feed static flow changes.
- APK rebuild was intentionally skipped because there were no native dependency, package, lockfile, navigation behavior, or backend/API changes.

Phase 12E status:

- Completed audit and documentation/status alignment.

Current boundary:

- Discover and Feed now lead more naturally into Chat while remaining static and behavior-free.
- Backend/API logic, Supabase/Auth/RLS/Storage, recorder/audio behavior, reveal behavior, mock data, package changes, uploads, and navigation expansion remain deferred.

Next recommended phase:

- Phase 13A documentation-only planning for the next narrow static product slice.
- Optional later checkpoint: device APK visual check.

## Phase 13A-13D Profile / Reveal Flow Status

Phase 13A status:

- Completed as documentation-only Profile / Reveal Requests flow coherence planning.
- Created `docs/product/PROFILE_REVEAL_FLOW_COHERENCE_PLAN.md`.

Phase 13B status:

- Completed as Profile static visibility control refinement.
- Profile remains static and behavior-free.
- No fake name/avatar/bio, profile edit logic, follower/coin/package logic, backend/API/Auth/Supabase/RLS/Storage logic, package changes, or reveal approval logic was added.

Phase 13C status:

- Completed as Reveal Requests static review surface refinement.
- Reveal Requests remains static and behavior-free.
- No approve/reject buttons, fake requester/profile/avatar, request status logic, backend/API/Auth/Supabase/RLS/Storage logic, package changes, or reveal logic was added.

Phase 13D status:

- Completed audit, documentation/status alignment, and latest APK visual check recording.
- Latest APK opened successfully on a real Android device with no white screen or crash.
- Index, Discover, Feed, Chat, Profile, and Reveal Requests were visually checked.
- Index route shell remains temporary.

Current boundary:

- Profile and Reveal Requests now align with the Chat reveal model while remaining static and behavior-free.
- Backend/API logic, Supabase/Auth/RLS/Storage, recorder/audio behavior, reveal behavior, approve/reject behavior, mock data, package changes, uploads, and navigation expansion remain deferred.

Next recommended phase:

- Phase 14A documentation-only Home / Navigation polish planning.

## Phase 14A Home / Navigation Polish Planning Status

Phase 14A status:

- Completed as documentation-only Home / Navigation polish planning.
- Created `docs/product/HOME_NAVIGATION_POLISH_PLAN.md`.
- Confirmed Index/mobile route shell is temporary.
- Documented that future Home should feel like a real premium app entry and guide users to Discover, Feed, Chat, Profile, and Reveal Requests.

Future slicing:

- Phase 14B: Index static Home polish only.
- Phase 14C: local validation.
- Phase 14D: docs/status alignment.

Current boundary:

- Existing static `Link` approach remains for now.
- No behavior, tabs, `router.push`, backend/API logic, Supabase/Auth/RLS/Storage, mock data, recorder/audio/reveal/upload behavior, package changes, apps/web source changes, or shared packages were added.

Next recommended phase:

- Phase 14B Index static Home polish only.

## Phase 14B-14D Index Home Polish Status

Phase 14B status:

- Completed as Index static Home polish only.
- `apps/mobile/app/index.tsx` was updated from temporary route shell to static premium Home entry.
- Existing Link-based navigation was preserved.
- No tabs, `router.push`, redirects, auth gates, or new navigation behavior were added.

Phase 14C status:

- Completed local validation after the `index.tsx` update.

Phase 14D status:

- Completed documentation/status alignment.

Current boundary:

- Home remains static and behavior-free.
- Backend/API logic, Supabase/Auth/RLS/Storage, recorder/audio behavior, reveal behavior, mock data, upload behavior, package changes, apps/web source changes, shared packages, and navigation expansion remain deferred.

Next recommended phase:

- Phase 15A documentation-only planning for the next narrow static product slice.

## Forbidden Work List

Do not do any of the following during Phase 4B or any future placeholder phase unless a later explicit task allows it:

- create product UI outside the approved phase
- create multiple product screens in one task
- create a recipient-selection screen
- create dating-style swipe or match behavior
- expose real profile data
- reveal identity through instant media
- add Supabase
- add Auth
- add Storage
- add RLS
- create migrations
- add backend logic
- add API integration
- use real user data
- install packages
- modify package files without explicit approval
- modify `apps/web` source files
- create shared packages
- create Test Lab
- add production secrets

## Review Checklist For Future UI Slices

Before accepting any future UI slice, verify:

1. Scope matches exactly one phase.
2. No forbidden product route was added early.
3. No recipient picker exists.
4. Chat remains the central hub.
5. Discover and Feed direction leads to Chat.
6. Real profile stays hidden before permission.
7. Instant media does not reveal real identity.
8. Copy is calm and human.
9. No dating-app behavior appears.
10. No Supabase/Auth/Storage/RLS/API/migration logic exists.
11. No package changes occurred unless explicitly approved.
12. Validation commands pass.

## Success Criteria

Phase 4B is successful if:

1. The future UI implementation order is explicit.
2. Each future phase is small and reviewable.
3. Acceptance criteria are clear.
4. Product privacy and anti-drift rules are preserved.
5. No product UI implementation begins during this documentation phase.

## Phase 15A-15F Static MVP Polish Status

Phase 15A status:

- Completed as documentation-only Static MVP Readiness Plan.
- No code changes.

Phase 15B status:

- Completed as documentation-only Static MVP Visual Polish Audit.
- Chat and Home were identified as high-priority static polish areas.
- No code changes.

Phase 15C status:

- Completed as documentation-only Chat Static Visual Compression Plan.
- No route UI changes.

Phase 15D status:

- Completed as Chat static copy compression in `apps/mobile/app/chat.tsx`.
- Chat copy is shorter, less technical, and more mobile-native.
- Chat remains static and behavior-free.

Phase 15E status:

- Completed local validation after Chat compression.

Phase 15F status:

- Completed docs/status alignment.
- Route UI files were audited but not modified.
- Package files and lockfile were not modified.

Current boundary:

- The app remains static and behavior-free.
- Backend/API logic, Supabase/Auth/RLS/Storage, recorder/audio behavior, reveal behavior, fake data, upload behavior, package changes, apps/web source changes, shared packages, tabs, redirects, `router.push`, and navigation expansion remain deferred.

Next recommended phase:

- Phase 16A Home static copy compression / planning, or Discover/Feed static copy compression planning.

## Phase 16A-16D Home Static Copy Status

Phase 16A status:

- Completed as documentation-only Home Static Copy Compression Plan.
- No code changes.

Phase 16B status:

- Completed as Home static copy compression in `apps/mobile/app/index.tsx`.
- Home copy is shorter and first-screen product feel is clearer.
- Discover/Feed are clearer primary actions.
- Existing Link-based navigation was preserved.

Phase 16C status:

- Completed local validation after Home compression.

Phase 16D status:

- Completed docs/status alignment.
- Route UI files were audited but not modified.
- Package files and lockfile were not modified.

Current boundary:

- The app remains static and behavior-free.
- Backend/API logic, Supabase/Auth/RLS/Storage, recorder/audio behavior, reveal behavior, fake data, upload behavior, package changes, apps/web source changes, shared packages, tabs, redirects, `router.push`, and navigation expansion remain deferred.

Next recommended phase:

- Phase 17A Discover/Feed static copy compression planning, or a final static visual rhythm audit across Chat and Home.

## Phase 17A-17E Security Foundation Status

Phase 17A status:

- Completed as documentation-only Data Model + RLS Foundation Plan.
- No Supabase/Auth/RLS/Storage implementation files were added.

Phase 17B status:

- Completed as documentation-only Anonymous Identity / Real Profile Separation Plan.
- No backend/API or route/component changes were added.

Phase 17C status:

- Completed as documentation-only Reveal Request Security Model.
- No migrations, SQL, or RLS policies were added.

Phase 17D status:

- Completed as documentation-only Voice / Media Storage Boundary Plan.
- No Storage buckets, policies, or implementation files were added.

Phase 17E status:

- Completed docs/status alignment.
- Route files, component files, package files, lockfile, and apps/web source files were not modified.

Current boundary:

- Security docs now cover data model, anonymous identity separation, reveal request safety, and voice/media storage boundaries.
- Supabase/Auth/RLS/Storage implementation, migrations, executable SQL, backend/API logic, route/component changes, package changes, lockfile changes, apps/web source changes, and shared packages remain deferred.

Next recommended phase:

- Phase 18A Supabase implementation readiness checklist, or RLS policy matrix expansion planning only.

## Phase 18A-18F Supabase Readiness Status

Phase 18A status:

- Completed as documentation-only Supabase Implementation Readiness Checklist.
- No Supabase files were created.

Phase 18B status:

- Completed as documentation-only Expanded RLS Policy Matrix Plan.
- No SQL or RLS policies were written.

Phase 18C status:

- Completed as documentation-only Auth Foundation Plan.
- No Auth code or Supabase client was added.

Phase 18D status:

- Completed as documentation-only Database Schema Draft Plan.
- No migrations or `.sql` files were created.

Phase 18E status:

- Completed as documentation-only Supabase Client Integration Boundary Plan.
- No client implementation, `.env`, or package install was added.

Phase 18F status:

- Completed Supabase readiness audit and docs/status alignment.
- Route files, component files, backend/API files, package files, lockfile, and apps/web source files were not modified.

Current boundary:

- No Supabase implementation exists.
- No Supabase client exists.
- No Auth code exists.
- No RLS SQL exists.
- No Storage buckets or policies exist.
- No migrations or `.sql` files exist.
- No `.env` file was added.

Next recommended phase:

- Phase 19A Supabase implementation go/no-go review, or SQL migration slicing plan only.

## Phase 23O-FIX / 23P Chat State Clarity Status

Phase 23O-FIX status:

- Completed as a narrow Chat waiting-state composer mapping fix in `apps/mobile/app/chat.tsx`.
- `�ehrin ���klar�` waiting state no longer shows active `Sese cevap ver`.
- Waiting composer remains passive: `Cevap bekleniyor` / `Yeni ses gelince devam et.`
- Replyable/open threads keep `Sese cevap ver`.
- Duplicate local bubble prevention and the `getVoiceComposerMode(selectedConnection) === "replyable"` guard remain intact.

Phase 23P status:

- Completed as Chat/Connections copy and state clarity polish in `apps/mobile/app/chat.tsx`.
- Thread header copy now uses the same state decision as composer mode.
- Waiting, closed, kimlik kapal�, profil izni, and profil a��k states have explicit short copy.
- Reveal row and bottom info copy now reinforce connection-scoped profile visibility.
- Connection list side labels now show `A�`, `Bekle`, or `Kapal�` according to state.

Validation:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

Result: PASS.

Release APK/device test: PASS.

Boundary:

- No recorder, microphone permission, upload, backend/API, Supabase/Auth/RLS/Storage, package/lockfile, apps/web source, or navigation behavior was added.

## Phase 23Q-23S Home / Feed / Local Media And Workflow Status

Phase 23Q status:

- Completed Home / Feed purpose separation.
- Home is the compact start/control screen with next action, status, privacy/reveal reminder, and recent connection shortcut.
- Feed remains the anonymous content consumption and reply surface.
- Feed keeps `Tümü` / `Ses` / `Kamera` / `İzinli` filters, local draft behavior, and `Yanıtla` navigation.

Phase 23R status:

- Completed Home Turkish encoding fix in `apps/mobile/app/index.tsx`.
- Confirmed active local state helper path: `apps/mobile/src/data/localProductState.ts`.
- `apps/mobile/src/localProductState.ts` does not exist.
- Feed camera draft copy/state is driven through `createLocalFeedDraftPreview("camera")`.
- Replyable Chat threads gained local-only camera/media draft affordance.
- Waiting/closed Chat threads do not allow media reply.

Device status:

- Home Turkish encoding: PASS.
- Chat media draft: PASS.
- Voice reply behavior: PASS.
- Feed camera device confirmation: PENDING unless separately confirmed.

Phase 23S status:

- Completed documentation/team workflow alignment.
- Team workflow is owner/user + brother/developer + assistant, with one narrow phase at a time.
- Future APK builds should use low-CPU local build guidance when an APK phase explicitly allows building.

Boundary:

- No real camera/gallery/upload/permission, recorder, backend/API, Supabase/Auth/RLS/Storage, package/lockfile, apps/web source, or `C:\ankion-apk` source change was introduced by Phase 23S.

## Phase 24H Revenue / Monetization Foundation Planning

Phase 24H adds revenue planning only. It does not implement payments, subscriptions, entitlement tables, payment SDKs, subscription SDKs, package changes, backend/API, route behavior, UI, Storage/media, Auth/session, RLS, SQL, or Supabase runtime behavior.

Core monetization principle:

ANKION must make money without selling identity, bypassing consent, weakening anonymity, or pressuring reveal. The product remains anonymous voice first; real profile visibility remains owner-approved and connection/context-scoped.

### Prohibited Monetization

Do not monetize:

- pay to reveal someone.
- pay to bypass owner approval.
- pay to search profiles.
- pay to search users.
- pay to unlock global profile.
- pay to force reply.
- pay to access private identity.
- pay to bypass block/safety limits.
- public profile boosting.
- identity-based targeting.

### Safe Monetization Candidates

Potentially safe candidates, subject to later privacy/security review:

- premium voice limits.
- more anonymous voice slots.
- higher daily interaction limits.
- advanced privacy controls.
- ad-free mode.
- enhanced safety controls.
- profile verification badge summary if later approved.
- connection quality controls.
- media duration/storage limits only after Storage/RLS/media privacy is approved.
- optional premium customization that does not reveal identity.
- creator/supporter model only if it does not create public profile browsing or identity pressure.

### V1 Monetization Direction

- Do not implement payments yet.
- Do not add payment SDK.
- Do not add subscription tables yet.
- Start with entitlement planning only.
- Payment provider choice is deferred.
- App store / mobile subscription rules are deferred.
- Legal/tax/payment compliance review is deferred.

Future entitlement model may need:

- plan type.
- entitlement key.
- usage quota.
- reset period.
- internal `owner_user_id` linkage.
- audit-safe payment provider reference.
- no raw card/payment data stored by ANKION.

### Monetization Privacy Gates

Before any monetization implementation, answer:

1. Does this feature reveal real identity?
2. Does it pressure another user to reveal?
3. Does it bypass connection/context consent?
4. Does it expose profile search or user search?
5. Does it weaken block/report/safety?
6. Does it introduce payment identifiers into client-visible user data?
7. Does it require Storage/media/Auth/RLS readiness?
8. Is there a refund/support/audit plan?
9. Is there a clear entitlement deny/allow test?

Phase 24H revenue decision:

```txt
READY FOR REVENUE MODEL PLANNING
NOT READY FOR PAYMENT/SUBSCRIPTION IMPLEMENTATION
```
