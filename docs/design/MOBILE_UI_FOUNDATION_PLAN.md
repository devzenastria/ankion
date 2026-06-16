# MOBILE_UI_FOUNDATION_PLAN.md

## Purpose

Define the future mobile UI foundation direction before shared UI code, route improvements, navigation tabs, design tokens, or reusable components are implemented.

This document started as the documentation-only Phase 6A plan and now tracks the approved Phase 6B token-only, Phase 6C `ScreenContainer`, Phase 6D `SectionHeader`, Phase 6E `EmptyState`, Phase 6F `SoftAction`, Phase 6G `PrivacyNote`, Phase 6H audit, Phase 7A through 7E route usage, and Phase 7F route UI consistency audit boundaries.

## Status

Phase 7F completed with mobile UI foundation applied to all approved product routes and audited for consistency.

Phase 6B created only `apps/mobile/src/constants/ui.ts`.

Phase 6C created only `apps/mobile/src/components/ScreenContainer.tsx`.

Phase 6D created only `apps/mobile/src/components/SectionHeader.tsx`.

Phase 6E created only `apps/mobile/src/components/EmptyState.tsx`.

Phase 6F created only `apps/mobile/src/components/SoftAction.tsx`.

Phase 6G manually created `apps/mobile/src/components/PrivacyNote.tsx` and it was validated after the nested token fix.

No mobile route files, additional component files beyond `PrivacyNote`, additional style files, package files, Supabase files, Auth logic, Storage logic, RLS SQL, migrations, mock data, press behavior, data fetching, or navigation tabs were created.

Phase 6H audited the completed foundation.

Phase 7A manually applied `ScreenContainer`, `SectionHeader`, `EmptyState`, `PrivacyNote`, `SoftAction`, and `uiSpacing` to `apps/mobile/app/discover.tsx` only.

Phases 7B through 7E manually applied the same approved foundation set to `apps/mobile/app/chat.tsx`, `apps/mobile/app/profile.tsx`, `apps/mobile/app/feed.tsx`, and `apps/mobile/app/reveal-requests.tsx`.

Phase 7F audited route consistency and confirmed all approved product routes remain static and contain no navigation behavior, mock data, API calls, backend logic, Supabase/Auth/RLS/Storage logic, or migrations. Phase 9F later audited static product-flow surfaces in Chat, Profile, and Reveal Requests and confirmed they remain behavior-free. Phase 9X fixed Android preview APK dependency/runtime alignment without changing UI behavior. Phase 10F audited static Chat interaction education surfaces and confirmed they remain behavior-free. Phase 11C confirmed Chat duplicate explanation cleanup while keeping the screen static and behavior-free. Phase 12E confirmed Discover and Feed static flow refinements while keeping existing static Link behavior and no product behavior. Phase 13D confirmed Profile and Reveal Requests static owner-control refinements and recorded a successful real-device APK visual check.

## Source Documents

This plan follows:

- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`
- `docs/design/DESIGN_TOKENS.md`
- `docs/design/COMPONENT_SYSTEM.md`
- `docs/design/SCREEN_MAP.md`
- `docs/design/UI_QUALITY_CHECKLIST.md`
- `docs/product/PRODUCT_UI_FLOW_BLUEPRINT.md`
- `docs/product/PRODUCT_UI_IMPLEMENTATION_SLICING_PLAN.md`

## Visual Direction

The future mobile UI foundation must be dark-first, premium, mobile-native, and quiet.

It should feel intimate and cinematic without becoming decorative, loud, or heavy. The interface should support anonymous voice discovery, not compete with it.

The UI should prioritize:

- deep dark surfaces
- soft contrast
- readable text
- calm spacing
- restrained accent use
- clear hierarchy
- touch-friendly controls
- privacy-preserving states

## Mobile-Native Principles

Future mobile UI work must feel native to a phone, not like a web page squeezed into a phone frame.

Principles:

- use compact, focused screens
- keep primary actions reachable by thumb
- avoid dense desktop-style panels
- avoid marketing-page layout patterns
- use simple vertical flow before complex compositions
- make empty states useful but restrained
- keep screen-level hierarchy easy to scan
- avoid nested cards and ornamental containers

## Voice-First Social Product Tone

ankion is voice-first. Visual UI should support listening, sending, and deciding without making the product feel like generic text chat.

Tone:

- personal
- calm
- curious
- respectful
- privacy-aware
- low-pressure

Future UI should make voice feel like the center of the experience. Text should explain state and next steps, not dominate the product.

## Non-Dating-App Visual Rules

Future UI must avoid dating-app signals.

Do not introduce:

- swipe or match mechanics
- hot-or-not ranking
- public real-profile browsing
- large flirt-focused profile cards
- visual scoring
- urgency-heavy reveal prompts
- copy that pressures users to expose identity

Discovery should feel like anonymous social presence through voice, not a profile marketplace.

## Privacy-First Copy Rules

Copy must reinforce that real identity stays protected unless the owner approves visibility.

Use copy that makes boundaries clear:

- real profile stays private
- visibility is permission-based
- reveal controls come later
- requests are reviewed calmly
- instant media does not reveal real identity

Do not imply that following, viewing media, chatting, or sending voice automatically reveals real profile identity.

## Calm Human Copy Rules

Future UI copy should be simple and human.

Prefer:

- "Not visible yet"
- "Stay hidden"
- "Decide later"
- "Profile is still private"
- "Review when ready"

Avoid:

- "Rejected"
- "Denied"
- "Access refused"
- "Failed permission"
- "Blocked from profile"

## Future Color Token Categories

Phase 6B implements the first minimal token constants in `apps/mobile/src/constants/ui.ts`.

Planned categories:

- `color.background.primary`
- `color.background.secondary`
- `color.surface.base`
- `color.surface.raised`
- `color.surface.soft`
- `color.text.primary`
- `color.text.secondary`
- `color.text.muted`
- `color.border.subtle`
- `color.accent.voice`
- `color.accent.privacy`
- `color.state.success`
- `color.state.warning`
- `color.state.danger`

No routes consume these tokens yet.

## Future Typography Direction

Future typography should be readable, mobile-native, and restrained.

Planned roles:

- screen title
- section title
- body
- supporting copy
- empty state
- action label
- privacy note
- metadata

Typography should avoid oversized hero text inside app screens. It should support repeated use and clear scanning.

Phase 6A does not implement typography files.

## Future Spacing, Radius, And Shadow Direction

Future spacing should create calm rhythm without making screens feel sparse.

Planned spacing direction:

- small spacing for grouped labels and supporting copy
- medium spacing for sections
- larger spacing for screen-level separation
- touch targets large enough for mobile use

Planned radius direction:

- restrained radius for surfaces and controls
- avoid overly bubbly app-wide shapes
- use consistent radius levels only after tokens exist

Planned shadow direction:

- prefer subtle elevation and contrast
- avoid heavy glow effects
- avoid decorative blur blobs or ornamental background shapes

Phase 6A does not implement style files.

## Future Reusable Component Candidates

Future reusable components may be introduced one at a time only after explicit approval.

Candidates:

- `ScreenContainer`: shared mobile screen wrapper for background, safe spacing, and vertical layout. Implemented in Phase 6C and applied to approved product routes in Phase 7.
- `SectionHeader`: compact title and optional supporting copy for screen sections. Implemented in Phase 6D and applied to approved product routes in Phase 7.
- `EmptyState`: reusable empty-state text block for static or later data-backed screens. Implemented in Phase 6E and applied to approved product routes in Phase 7.
- `SoftAction`: restrained passive action-label surface for future low-pressure actions. Implemented in Phase 6F, applied to approved product routes in Phase 7, and not pressable yet.
- `PrivacyNote`: small privacy boundary note for reveal, profile, chat, and media contexts. Implemented manually in Phase 6G and applied to approved product routes in Phase 7.

Remaining candidates must not be implemented without explicit approval.

## Future Component Implementation Order

Future UI foundation implementation should continue in small slices:

1. Phase 6B: implement minimal token constants only.
2. Phase 6C: implement `ScreenContainer` only.
3. Phase 6D: implement `SectionHeader` only.
4. Phase 6E: implement `EmptyState` only.
5. Phase 6F: implement passive `SoftAction` only.
6. Phase 6G: manually implement and validate passive `PrivacyNote` only.
7. Phase 6H: mobile UI foundation audit.
8. Phase 7A: apply approved foundation pieces to Discover only.
9. Phase 7B: apply approved foundation pieces to Chat only.
10. Phase 7C: apply approved foundation pieces to Profile only.
11. Phase 7D: apply approved foundation pieces to Feed only.
12. Phase 7E: apply approved foundation pieces to Reveal Requests only.
13. Phase 7F: audit route UI consistency.
14. Phase 8A: navigation planning only.

Do not combine component implementation with route redesign.

## Small And Isolated UI Work Rules

Each future UI foundation task must:

- affect one component or one route only
- avoid package changes unless separately approved
- avoid shared packages unless separately approved
- avoid backend, Auth, Storage, Supabase, RLS, migrations, and API logic
- avoid mock data
- preserve static placeholder boundaries until behavior is approved
- run mobile typecheck
- run web typecheck and build
- update `PROJECT_STATUS.md`, `FILE_MAP.md`, and `CHANGELOG.md`

## Phase 6B Token Implementation Boundary

Phase 6B allows only:

- `apps/mobile/src/constants/ui.ts`
- plain TypeScript object exports
- color, spacing, radius, typography, shadow, and screen constants

Phase 6B does not allow:

- React components
- React Native imports
- package dependencies
- runtime logic
- platform-specific logic
- route imports
- mock data

## Phase 6C ScreenContainer Implementation Boundary

Phase 6C allows only:

- `apps/mobile/src/components/ScreenContainer.tsx`
- named `ScreenContainer` export
- `children` and optional `style` props
- React Native safe layout primitives
- imports from `apps/mobile/src/constants/ui.ts`
- dark-first background and mobile-safe layout

Phase 6C does not allow:

- route UI changes
- applying `ScreenContainer` to routes
- `SectionHeader`
- `EmptyState`
- `SoftAction`
- `PrivacyNote`
- navigation tabs
- product copy
- mock data
- API calls
- Supabase/Auth/RLS/Storage logic

## Phase 6D SectionHeader Implementation Boundary

Phase 6D allows only:

- `apps/mobile/src/components/SectionHeader.tsx`
- named `SectionHeader` export
- `title`, optional `subtitle`, and optional `style` props
- React Native `View`, `Text`, and `StyleSheet`
- imports from `apps/mobile/src/constants/ui.ts`
- dark-first text styling and mobile-native spacing

Phase 6D does not allow:

- route UI changes
- applying `SectionHeader` to routes
- modifying `ScreenContainer` unless required for type compatibility
- `EmptyState`
- `SoftAction`
- `PrivacyNote`
- navigation tabs
- product behavior
- mock data
- API calls
- Supabase/Auth/RLS/Storage logic

## Phase 6E EmptyState Implementation Boundary

Phase 6E allows only:

- `apps/mobile/src/components/EmptyState.tsx`
- named `EmptyState` export
- `title`, optional `description`, optional `actionLabel`, and optional `style` props
- React Native `View`, `Text`, and `StyleSheet`
- imports from `apps/mobile/src/constants/ui.ts`
- dark-first styling, mobile-native spacing, and calm copy support

Phase 6E does not allow:

- route UI changes
- applying `EmptyState` to routes
- modifying `ScreenContainer`
- modifying `SectionHeader`
- `SoftAction`
- `PrivacyNote`
- navigation tabs
- product behavior
- mock data
- API calls
- Supabase/Auth/RLS/Storage logic

## Phase 6F SoftAction Implementation Boundary

Phase 6F allows only:

- `apps/mobile/src/components/SoftAction.tsx`
- named `SoftAction` export
- `label`, optional `hint`, and optional `style` props
- React Native `View`, `Text`, and `StyleSheet`
- imports from `apps/mobile/src/constants/ui.ts`
- passive dark-first visual action styling

Phase 6F does not allow:

- route UI changes
- applying `SoftAction` to routes
- modifying `ScreenContainer`
- modifying `SectionHeader`
- modifying `EmptyState`
- `PrivacyNote`
- `Pressable`
- `TouchableOpacity`
- `onPress`
- navigation tabs
- product behavior
- mock data
- API calls
- Supabase/Auth/RLS/Storage logic

## Phase 6G PrivacyNote Implementation Boundary

Phase 6G allows only:

- `apps/mobile/src/components/PrivacyNote.tsx`
- named `PrivacyNote` export
- optional `title`, required `description`, and optional `style` props
- React Native `View`, `Text`, and `StyleSheet`
- imports from `apps/mobile/src/constants/ui.ts`
- passive privacy copy styling

Phase 6G does not allow:

- route UI changes
- applying `PrivacyNote` to routes
- modifying `ScreenContainer`
- modifying `SectionHeader`
- modifying `EmptyState`
- modifying `SoftAction`
- `Pressable`
- `TouchableOpacity`
- `onPress`
- navigation
- reveal logic
- auth checks
- data fetching
- product behavior
- mock data
- API calls
- Supabase/Auth/RLS/Storage logic

## Phase 6H Mobile UI Foundation Audit Boundary

Phase 6H allows only:

- audit of existing mobile UI foundation files
- documentation/status alignment
- validation commands

Phase 6H does not allow:

- route UI changes
- applying foundation components to routes
- token code changes unless required for typecheck
- component code changes unless required for typecheck
- new components
- navigation tabs
- mock data
- product behavior
- API calls
- package changes
- Supabase/Auth/RLS/Storage logic

## Phase 7A Discover UI Foundation Application Boundary

Phase 7A allows only:

- `apps/mobile/app/discover.tsx`
- application of approved mobile UI foundation pieces to Discover
- static Discover copy and passive components only
- documentation/status alignment
- validation commands

Phase 7A does not allow:

- changes to Chat, Profile, Feed, Reveal Requests, or index routes
- navigation behavior
- tabs
- mock data
- fake users, profiles, media, messages, or reveal requests
- API calls
- backend logic
- package changes
- Supabase/Auth/RLS/Storage logic

## Phase 7F Route UI Consistency Audit Boundary

Phase 7F allows only:

- audit of approved product route foundation usage
- documentation/status alignment
- validation commands

Phase 7F confirms:

- Discover, Chat, Profile, Feed, and Reveal Requests use the approved foundation set
- all product routes remain static and behavior-free
- index remains neutral and does not adopt the foundation in Phase 7
- navigation implementation has not started
- backend, Supabase, Auth, RLS, Storage, API, and migration work remain deferred

## Phase 9F Product Flow Audit Boundary

Phase 9F confirms:

- Chat, Profile, and Reveal Requests may contain static product-flow surfaces
- Chat has no real messages, recorder, playback behavior, reveal logic, or backend calls
- Profile has no real profile edit logic, follower/coin/package logic, mock user/profile data, or backend calls
- Reveal Requests has no approve/reject behavior, actual reveal logic, mock user/profile data, or backend calls
- all Phase 9 surfaces remain presentational and behavior-free
- backend, Supabase, Auth, RLS, Storage, API, migrations, package changes, and apps/web source changes remain deferred

## Phase 9X Android Preview Build Boundary

Phase 9X confirms:

- Android preview APK build/debug fixes may align direct Expo dependencies and renderer-compatible React versions
- the fixed APK opened on a real Android device
- the real-device smoke test passed across the current static routes
- no route UI behavior, recorder behavior, reveal behavior, mock data, backend/API logic, Supabase/Auth/RLS/Storage, migrations, apps/web source changes, or shared package work was introduced

## Phase 10F Chat Interaction Audit Boundary

Phase 10F confirms:

- Chat may contain static context, passive composer, lifecycle, and reveal education surfaces
- no recorder behavior, microphone permission logic, real audio, play/pause behavior, mock data, backend/API logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, or navigation expansion was introduced
- duplicate explanatory Chat surfaces are acceptable for the current static phase but should be planned for simplification before behavior work

## Phase 11C Chat Simplification Validation Boundary

Phase 11C confirms:

- Chat duplicate explanation cleanup has been completed.
- `interactionCard`, `revealCard`, `flowCard`, and Chat `EmptyState` were removed.
- `SectionHeader`, `contextCard`, `composerCard`, `voiceCard`, `lifecycleCard`, `revealEducationCard`, `PrivacyNote`, and `SoftAction` remain.
- Chat still has no recorder behavior, microphone permission logic, real audio, play/pause behavior, mock data, backend/API logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, or navigation expansion.
- APK rebuild was intentionally skipped because only static Chat JSX changed.

## Phase 12E Discover / Feed Flow Audit Boundary

Phase 12E confirms:

- Discover and Feed have clearer static entry surfaces into Chat.
- Discover keeps the existing static `/chat` Link behavior.
- Feed keeps the existing static `/chat` Link behavior.
- Feed's 3-column media direction is static preview only.
- no mock users, mock profiles, avatars, real media, mock media, upload behavior, backend/API logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, router.push, tabs, or new navigation behavior was introduced.
- APK rebuild was intentionally skipped because only static route UI changed.

## Phase 13D Profile / Reveal Flow Audit Boundary

Phase 13D confirms:

- Profile is a static owner-controlled visibility center.
- Reveal Requests is a static calm permission review center.
- no fake profile/requester/user/avatar data, approve/reject buttons, request status logic, backend/API logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, router.push, tabs, or new navigation behavior was introduced.
- latest APK opened successfully on a real Android device and main screens were visually checked.
- Index route shell remains temporary and should later become a real Home/navigation entry experience.

## Explicit Out Of Scope

Current post-Phase-13D scope does not allow:

- design system code
- additional shared components beyond the audited foundation set
- route UI changes beyond approved static foundation, navigation links, Phase 9 product-flow surfaces, and Phase 10 Chat education surfaces
- navigation tabs
- mock data
- Supabase
- Auth
- RLS
- Storage
- migrations
- API integration
- package changes
- `pnpm-lock.yaml` changes
- apps/web source changes
- new shared packages

## Acceptance Criteria

Phase 6A is complete when:

1. The future mobile UI foundation direction is documented.
2. Future token, typography, spacing, radius, and shadow categories are planned but not implemented.
3. Future reusable component candidates are named but not created.
4. Component implementation order is documented for later phases.
5. No app route files, component files, style files, package files, Supabase files, or shared packages are changed.
6. Required validation commands pass.

## Phase 16D Static Home Polish Boundary

Phase 16D confirms Home copy compression stayed within the approved mobile UI foundation boundary.

Confirmed:

- No new components were created.
- No design tokens or style files were added.
- No route UI files were modified during Phase 16D docs/status alignment.
- Home remains static and behavior-free after Phase 16B compression.
- No backend/API, Supabase/Auth/RLS/Storage, mock data, recorder/audio/reveal/upload behavior, package changes, lockfile changes, apps/web source changes, tabs, redirects, `router.push`, or new navigation behavior was added.

## Phase 23O-FIX / 23P Chat UI State Clarity Boundary

Phase 23O-FIX confirms:

- Chat waiting-state composer mapping was corrected in `apps/mobile/app/chat.tsx`.
- Waiting states use passive composer copy and do not show active `Sese cevap ver`.
- Replyable states keep the active voice CTA.
- Duplicate local reply prevention and handler guard remain intact.

Phase 23P confirms:

- Chat header, connection list side label, reveal row, composer state copy, and bottom info copy were clarified without adding new components.
- The UI communicates replyable, waiting, closed, identity-hidden, profile-permitted, and profile-open states with short Turkish copy.
- Profile visibility remains connection-scoped and permission-based.

Boundary:

- No new component, design token, style file, package, recorder, microphone permission, upload, backend/API, Supabase/Auth/RLS/Storage, apps/web source, or navigation behavior was added.
