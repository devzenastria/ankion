# DECISIONS.md

## Purpose

Record approved product, design, architecture, database, security, testing, and implementation decisions for ankion.

This file prevents repeated debate over settled choices and keeps the project from drifting during documentation, Codex-assisted work, and future implementation.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Decision Rules

- A decision is recorded here only after it is approved by the user or clearly accepted as project direction.
- Decisions here override loose brainstorming notes.
- If a decision changes later, do not delete the old decision. Add a new decision entry that supersedes it.
- Do not use this file for unfinished ideas, feature wishlists, or implementation code.
- Do not start package setup, framework initialization, migrations, RLS SQL, or app implementation based only on this file.
- Final deep analysis and explicit user approval are still required before implementation.

---

# Decision Log Format

Each decision should use this format:

```md
## DEC-XXX — Decision title

**Status:** Approved / Superseded / Deferred  
**Date:** YYYY-MM-DD  
**Scope:** Product / Design / Architecture / Database / Security / Testing / Process  
**Decision:** Short final decision.  
**Reason:** Why this decision exists.  
**Impact:** What this decision affects.  
**Do Not:** What must not be done because of this decision.
```

---

# Approved Decisions

## DEC-027 - Backend SubAgent Operating Model

**Status:** Approved  
**Date:** 2026-06-18  
**Scope:** Process / Backend / Security / Testing

**Decision:**  
Backend SubAgent work must use explicit permission levels:

- Level 0: read-only analysis only.
- Level 1: draft-only artifact after explicit request; no execution.
- Level 2: local execution only after explicit human GO.
- Level 3: local DB mutation only after explicit human GO and backup/checkpoint.
- Level 4: runtime integration blocked until separate approval.
- Level 5: staging/production NO-GO until later readiness review.

**Reason:**  
Backend, Auth, RLS, reveal, storage, and runtime work can create privacy or security drift if a tool crosses from planning into execution without a clear gate.

**Impact:**  
Creating or editing migrations, applying local migrations, running RLS harnesses, creating test data/users, adding packages, integrating Auth/Supabase runtime, implementing Storage, implementing Reveal, creating RPC/view/function/trigger artifacts, and staging/production operations all require explicit human GO at the relevant phase.

**Do Not:**  
Do not let Codex/SubAgent silently proceed across a GO gate. Do not run remote/staging/production commands. Do not implement backend/runtime/Auth/RLS/Reveal/Storage without a separate approved task.

---

## DEC-001 — ankion Product Core

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product

**Decision:**  
ankion is a voice-first anonymous social discovery app where users start hidden, connect through voice, and reveal their real profile only with permission.

**Reason:**  
The product must be differentiated from generic chat apps, dating apps, and standard social feeds. The emotional hook is curiosity through voice, not instant visual identity exposure.

**Impact:**  
All flows, screens, database models, security rules, and UI decisions must preserve anonymous-first voice interaction.

**Do Not:**  
Do not turn ankion into a dating app, generic text chat app, or public-profile social network.

---

## DEC-002 — Real Account, Anonymous First Interaction

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Security

**Decision:**  
Users create real accounts and real profiles, but first interaction is anonymous. Real profile visibility is locked until permission is granted by the profile owner.

**Reason:**  
The app needs accountability internally while keeping external discovery anonymous.

**Impact:**  
Backend must distinguish real identity from visible anonymous identity. Frontend must never expose real profile fields before permission.

**Do Not:**  
Do not allow Discover, Feed, Instant Content, notifications, reports, followers, coins, or storage paths to reveal real identity.

---

## DEC-003 — Chat Is The Central Interaction Hub

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / UX

**Decision:**  
Chat is the central interaction hub. Discover profile taps open Chat directly. Instant Content Detail also leads to Chat. Voice recording and reveal requests happen inside Chat.

**Reason:**  
This removes unnecessary recipient-picking complexity and keeps the app focused on one strong core loop.

**Impact:**  
Navigation, UI, backend thread creation, and Test Lab scenarios must center on Chat.

**Do Not:**  
Do not add a separate recipient selection screen for MVP.

---

## DEC-004 — No Separate Recipient Selection Screen

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / UX

**Decision:**  
There will be no separate recipient selection screen. User intent is created by tapping a Discover profile or Feed item, then continuing into Chat.

**Reason:**  
A recipient picker adds friction and weakens the anonymous discovery flow.

**Impact:**  
Discover-to-Chat and Feed-to-Detail-to-Chat are mandatory flows.

**Do Not:**  
Do not build a generic “select user to message” step in MVP.

---

## DEC-005 — Voice-First Message Rule

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product

**Decision:**  
The MVP interaction is voice-first. Voice recording happens inside Chat.

**Reason:**  
The product’s core differentiation is emotional discovery through short voice messages.

**Impact:**  
UI, database, storage, moderation, and Test Lab must prioritize voice message flow.

**Do Not:**  
Do not let text chat become the primary MVP interaction.

---

## DEC-006 — Voice Duration And Daily Limits

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Backend / Safety

**Decision:**  
Each voice message is limited to 21 seconds. Each user can send 7 voice messages per account/membership day. A sender can send a maximum of 3 voice messages to the same recipient per day.

**Reason:**  
Short voice prevents spam, reduces moderation load, and keeps interactions lightweight.

**Impact:**  
Limits must be enforced server-side. UI can display remaining counts but cannot be the source of truth.

**Do Not:**  
Do not enforce voice limits only on the frontend.

---

## DEC-007 — Recipient Remaining Count Feedback

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / UX

**Decision:**  
The recipient/context should be informed about remaining voice allowance where relevant in the same conversation flow.

**Reason:**  
Users should understand send limits without confusion or hidden rejection.

**Impact:**  
Chat UI should include calm limit feedback. Backend must return safe limit state.

**Do Not:**  
Do not expose internal quota tables or sensitive IDs to show remaining counts.

---

## DEC-008 — Permission-Based Reveal Formula

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Security / Database

**Decision:**  
Real profile visibility requires:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

Request approval alone is not enough. UI state alone is not enough. Active grant is required. Block overrides grant.

**Reason:**  
This prevents accidental profile leaks and gives the database a clear security rule.

**Impact:**  
Reveal requests, visibility grants, blocks, safe views/RPCs, and RLS policies must enforce this formula.

**Do Not:**  
Do not reveal a real profile only because a request row is approved.

---

## DEC-009 — Calm Reveal Copy

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** UX / Product

**Decision:**  
The app must avoid harsh wording like “Rejected” or “Denied.” Use calm copy such as stay hidden, decide later, not visible yet, or profile is still private.

**Reason:**  
The emotional tone must feel safe, human, and premium.

**Impact:**  
UI copy, notification copy, and Test Lab states must follow this language.

**Do Not:**  
Do not use aggressive rejection labels in user-facing UI.

---

## DEC-010 — Dark-First Premium UI Direction

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Design

**Decision:**  
ankion must use a dark-first, premium, modern, cinematic, mobile-native design direction. Light theme may exist later only as a secondary optional theme.

**Reason:**  
The product needs a distinctive emotional identity and should not feel like a generic web app.

**Impact:**  
Design tokens, component system, screen map, and final UI generation prompt must prioritize dark-first visual language.

**Do Not:**  
Do not design the MVP as light-first, website-like, or dating-app-like.

---

## DEC-011 — Feed Uses 3-Column Instant Media Grid

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / UX

**Decision:**  
Feed uses a 3-column grid for photo, video, and audio instant media.

**Reason:**  
The feed should feel mobile-native and scannable while supporting anonymous instant content.

**Impact:**  
Feed UI, Instant Content Detail, and Test Lab scenarios must support photo, video, and audio tiles.

**Do Not:**  
Do not create a separate Live tab for MVP.

---

## DEC-012 — Instant Media Is Part Of MVP

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product

**Decision:**  
Instant photo, video, and audio content are part of MVP. Instant content may be visible, but real profile remains hidden.

**Reason:**  
Instant media strengthens discovery without breaking the voice-first anonymous identity model.

**Impact:**  
Instant profile, instant content, instant follow, storage rules, and access policies must be included in planning.

**Do Not:**  
Do not allow instant content to reveal real profile identity.

---

## DEC-013 — Instant Profile Is Separate From Real Profile

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Privacy / Database

**Decision:**  
Instant content can have an anonymous followable media/profile identity separate from the real profile.

**Reason:**  
Users can participate in visible media discovery without exposing real account identity.

**Impact:**  
Database must separate real profile identity from instant profile identity. Frontend must consume safe instant DTOs.

**Do Not:**  
Do not merge instant profile visibility with real profile visibility.

---

## DEC-014 — Instant Follow Does Not Reveal Real Profile

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Security

**Decision:**  
Following an instant profile must not reveal the uploader’s real profile.

**Reason:**  
Follow mechanics should support discovery, not bypass permission-based reveal.

**Impact:**  
Follow lists, follower views, notifications, and safe DTOs must remain anonymous unless profile reveal is separately granted.

**Do Not:**  
Do not treat follow as identity permission.

---

## DEC-015 — Coin And Follower-View Packages Cannot Reveal Real Profile

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Security / Monetization

**Decision:**  
Coins or follower-view packages may support follower visibility features later, but they must not reveal real profile identity.

**Reason:**  
Monetization must not weaken privacy or bypass trust.

**Impact:**  
Future entitlement tables must be separate from real profile visibility grants.

**Do Not:**  
Do not create a paid shortcut to real profile reveal.

---

## DEC-016 — Location Requirement Deferred

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product

**Decision:**  
Location requirement can be deferred.

**Reason:**  
Location adds privacy, moderation, and matching complexity that is not required for the core MVP.

**Impact:**  
MVP should not depend on location-based discovery.

**Do Not:**  
Do not block MVP implementation on location features.

---

## DEC-017 — Non-Diagnostic AI Analysis Only Later

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Safety

**Decision:**  
AI tone, speech, or personality analysis may be considered later, but must be consent-based, non-diagnostic, and framed as communication-style feedback.

**Reason:**  
The feature could be engaging but carries safety and trust risks.

**Impact:**  
Do not include diagnostic psychological claims in MVP.

**Do Not:**  
Do not classify mental health, character, or personality as definitive truth.

---

## DEC-018 — TypeScript Monorepo Direction

**Status:** Approved Direction  
**Date:** 2026-05-24  
**Scope:** Architecture

**Decision:**  
The approved stack direction is TypeScript with pnpm workspace and Turborepo.

**Reason:**  
The project needs shared logic between web and mobile while staying modular and maintainable.

**Impact:**  
Future package setup should use a monorepo structure only after explicit implementation approval.

**Do Not:**  
Do not create `package.json`, `pnpm-workspace.yaml`, `turbo.json`, or package setup before final approval.

---

## DEC-019 — Web And Mobile Direction

**Status:** Approved Direction  
**Date:** 2026-05-24  
**Scope:** Architecture

**Decision:**  
Web direction is Next.js App Router. Mobile direction is Expo + React Native.

**Reason:**  
This supports web-based Test Lab and mobile-native product development with shared TypeScript logic.

**Impact:**  
Future implementation should keep `apps/web` and `apps/mobile` separated.

**Do Not:**  
Do not mix mobile app code into web app folders or web-only logic into shared mobile packages.

---

## DEC-020 — Supabase Backend Direction

**Status:** Approved Direction  
**Date:** 2026-05-24  
**Scope:** Backend / Database / Security

**Decision:**  
Backend/Auth/DB/Storage direction is Supabase with Postgres, Supabase Auth, private Storage, RLS, safe views/RPCs, and storage policies.

**Reason:**  
Supabase gives fast MVP infrastructure while requiring careful RLS and privacy control.

**Impact:**  
Database planning must prioritize RLS, safe DTOs, private buckets, and signed URL access checks.

**Do Not:**  
Do not write migrations, policies, bucket config, or Supabase setup before final approval.

---

## DEC-021 — Safe DTO Principle

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Security / Architecture / Frontend

**Decision:**  
Frontend must consume safe DTOs, safe views, or safe RPC outputs instead of raw sensitive database rows.

**Reason:**  
The product has high identity-leak risk.

**Impact:**  
Discover, Feed, Chat, Profile, Reveal, Notifications, Reports, and Storage access must use safe response shapes.

**Do Not:**  
Do not expose raw rows containing sensitive identity or storage fields to frontend components.

---

## DEC-022 — Never-Leak Sensitive Fields

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Security / Database / Frontend

**Decision:**  
Sensitive fields must not leak to frontend unless explicitly safe and required.

Protected examples include:

- auth_user_id
- sender_user_id
- owner_user_id
- profile_owner_user_id
- viewer_user_id
- requester_user_id
- recipient_user_id
- blocker_user_id
- blocked_user_id
- reporter_user_id
- reported_user_id
- raw_storage_path
- storage_path
- bucket internals
- moderation internals
- hidden real profile fields before reveal
- raw grant internals
- raw reveal internals where unsafe

**Reason:**  
These fields can expose real identity, relationships, internal state, or media storage paths.

**Impact:**  
RLS, safe views, RPCs, storage functions, debug logs, and Test Lab leak checks must protect these fields.

**Do Not:**  
Do not return these fields from user-facing endpoints or DTOs.

---

## DEC-023 — Private Storage By Default

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Storage / Security

**Decision:**  
Storage must be private by default. Media access must use short-lived signed URLs after access checks.

**Reason:**  
Public storage can leak identity and private media.

**Impact:**  
Voice messages, instant media, profile media, reports, and moderation files must use controlled access.

**Do Not:**  
Do not use public sensitive media buckets.

---

## DEC-024 — Safe Storage Path Rule

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Storage / Security

**Decision:**  
Storage paths must not include unsafe real user identifiers such as sender_user_id or owner_user_id.

Good path examples:

```txt
voice-messages/{chat_thread_id}/{voice_message_id}.m4a
instant-images/{instant_profile_id}/{post_id}.jpg
instant-videos/{instant_profile_id}/{post_id}.mp4
```

Bad path examples:

```txt
voice-messages/{sender_user_id}/{message_id}.m4a
instant-images/{owner_user_id}/{post_id}.jpg
public/{real_profile_id}/{file}.jpg
```

**Reason:**  
Even signed URLs or logs can reveal storage paths.

**Impact:**  
Storage architecture and upload functions must use non-identifying path segments.

**Do Not:**  
Do not expose raw storage paths to the frontend.

---

## DEC-025 — Block Overrides Visibility

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Product / Security / Database

**Decision:**  
An active block overrides reveal grants, signed URL access, chat visibility where applicable, and profile visibility.

**Reason:**  
Blocking must be a strong safety boundary.

**Impact:**  
RLS policies, safe RPCs, profile views, media access, and Test Lab scenarios must verify block override.

**Do Not:**  
Do not keep showing profile/media because an old grant exists after a block.

---

## DEC-026 — RLS Policy Matrix Is Critical

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Security / Database

**Decision:**  
RLS policy matrix is a high-priority design artifact and must be handled carefully before SQL implementation.

**Reason:**  
The product’s core trust model depends on preventing identity leaks and unauthorized reads.

**Impact:**  
Every table must have explicit read/write/update/delete reasoning before migrations are created.

**Do Not:**  
Do not write RLS SQL casually or without review.

---

## DEC-027 — Test Lab Is Required

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Testing / QA

**Decision:**  
A localhost-only browser-based visual Test Lab is required.

**Reason:**  
The app has many privacy state combinations that need visual PASS/FAIL verification.

**Impact:**  
Future `apps/web` should support `/dev/test-lab` only in local/development environments.

**Do Not:**  
Do not expose Test Lab in production.

---

## DEC-028 — Test Lab Must Use Fake Data Only

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Testing / Security

**Decision:**  
Test Lab must use fake data only, no production secrets, and no real user data.

**Reason:**  
Testing privacy behavior with real data is unsafe.

**Impact:**  
Seed data, visual QA cards, and leak checks must be isolated.

**Do Not:**  
Do not connect Test Lab to production data.

---

## DEC-029 — Codex Receives Only Small Isolated Tasks

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Process / Implementation

**Decision:**  
Codex must only receive small, isolated implementation tasks after explicit user approval.

**Reason:**  
Large Codex tasks risk architecture drift, broken structure, and hidden implementation mistakes.

**Impact:**  
ChatGPT handles strategy, architecture, task slicing, QA, and continuity. Codex handles narrow file-level execution only.

**Do Not:**  
Do not ask Codex to build the whole app, initialize frameworks, install packages, create migrations, or write RLS SQL without approval.

---

## DEC-030 — Documentation Before Implementation

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Process

**Decision:**  
Implementation must not start before final documentation review, final deep analysis, and explicit user approval.

**Reason:**  
The project must stay coherent and avoid premature technical debt.

**Impact:**  
Project remains in pre-implementation state until the gate is cleared.

**Do Not:**  
Do not create app code, package setup, framework setup, migrations, policies, or Supabase config before approval.

---

## DEC-031 — File Map Must Stay Updated

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Process / Project Structure

**Decision:**  
`FILE_MAP.md` must be updated whenever new files are added or ownership boundaries change.

**Reason:**  
The user wants to quickly know what is where in VS Code and prevent project confusion.

**Impact:**  
Every meaningful file addition must include project map maintenance.

**Do Not:**  
Do not add files without documenting their purpose and boundary.

---

## DEC-032 — Project Must Stay Modular And Searchable

**Status:** Approved  
**Date:** 2026-05-24  
**Scope:** Architecture / Process

**Decision:**  
The project must be modular, readable, searchable in VS Code, and designed so files clearly document their responsibility.

**Reason:**  
The user wants high-quality long-term project structure and minimal Codex overload.

**Impact:**  
Folder structure, documentation, file names, and future code modules must remain explicit and focused.

**Do Not:**  
Do not create tangled code or unclear mixed-purpose files.

---

## DEC-033 - Mobile Skeleton Direction

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Architecture

**Decision:**  
Mobile skeleton direction is Expo + React Native + TypeScript + Expo Router. The minimal skeleton may exist in `apps/mobile`, but product UI and backend/security integration remain deferred to later explicitly approved phases.

**Reason:**  
The mobile app is the main product surface and needs a native-feeling foundation while staying aligned with the TypeScript monorepo.

**Impact:**  
`apps/mobile` setup should follow Expo Router conventions and remain separate from web, Supabase, and product UI implementation until approved.

**Do Not:**  
Do not create mobile product screens, navigation tabs, Discover, Feed, Chat, Profile, Test Lab, Supabase/Auth/RLS/Storage logic, or shared package architecture during skeleton hygiene work.

---

## DEC-034 - Product UI Flow Blueprint

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX

**Decision:**  
MVP product UI flow is Discover, Feed, Chat, Profile, Reveal Requests, and optional Basic Settings placeholder, with Discover and Feed resolving into Chat without a separate recipient-selection screen.

**Reason:**  
The app must stay voice-first, anonymous-first, Chat-centered, and distinct from dating apps or generic text chat apps.

**Impact:**  
Future product UI tasks must preserve Chat as the central hub, permission-based reveal, instant media privacy, calm reveal copy, and hidden real profile state before owner approval.

**Do Not:**  
Do not create a recipient picker, dating-style swipe/match flow, Feed-to-real-profile shortcut, text-first Chat, or real profile exposure from instant content.

---

## DEC-035 - Product UI Implementation Sequencing

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Process

**Decision:**  
Future product UI implementation must be sliced in this order: Phase 5A mobile route shell only, Phase 5B static Discover placeholder, Phase 5C static Chat placeholder, Phase 5D static Profile placeholder, Phase 5E static Feed placeholder, and Phase 5F static Reveal Requests placeholder.

**Reason:**  
Small isolated UI phases reduce drift and keep privacy, anonymity, Chat-centered flow, and validation reviewable.

**Impact:**  
Future Codex/manual UI tasks must not combine screens or add backend, package, Supabase, Auth, Storage, RLS, migration, API, or shared-package work unless separately approved.

**Do Not:**  
Do not implement multiple product screens at once, create a recipient picker, add dating-style behavior, expose real identity, or connect UI placeholders to backend services during static placeholder phases.

---

## DEC-036 - Phase 5A Mobile Route Shell Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5A may create neutral mobile route shell files for Discover, Feed, Chat, Profile, and Reveal Requests, but those files must not implement product UI behavior.

**Reason:**  
Route shells prepare the app structure while keeping product UI, data, backend, and privacy-sensitive behavior reviewable in later slices.

**Impact:**  
Future phases may build on these route shells one screen at a time, starting with static Discover placeholder work.

**Do Not:**  
Do not add navigation tabs, mock users, fake profiles, fake messages, media grids, voice recording, reveal logic, API calls, Supabase/Auth/RLS/Storage logic, or package changes as part of the route shell.

---

## DEC-037 - Phase 5B Static Discover Placeholder Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5B may replace the neutral Discover route shell with a static Discover placeholder that uses only neutral voice-first empty-state copy.

**Reason:**  
Discover needs a first static screen marker before product behavior, data, and navigation are introduced in later reviewed slices.

**Impact:**  
Future Discover work must build from this placeholder without adding mock users, fake profiles, recipient picker behavior, navigation behavior, or backend integration unless separately approved.

**Do Not:**  
Do not add real or mock user data, fake profiles, fake avatars, fake messages, voice recording, media grid, navigation behavior, API calls, Supabase/Auth/RLS/Storage logic, or package changes during the static Discover placeholder phase.

---

## DEC-038 - Phase 5C Static Chat Placeholder Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5C may replace the neutral Chat route shell with a static Chat placeholder that uses only neutral anonymous voice conversation copy.

**Reason:**  
Chat is the central future interaction hub, but its behavior must remain deferred until voice, reveal, privacy, and backend boundaries are implemented in later reviewed slices.

**Impact:**  
Future Chat work must build from this placeholder without adding message data, recorder behavior, reveal logic, navigation behavior, or backend integration unless separately approved.

**Do Not:**  
Do not add real or mock user data, fake profiles, fake messages, message bubbles, voice recording, reveal request logic, navigation behavior, API calls, Supabase/Auth/RLS/Storage logic, or package changes during the static Chat placeholder phase.

---

## DEC-039 - Phase 5D Static Profile Placeholder Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5D may replace the neutral Profile route shell with a static Profile placeholder that uses only privacy-first profile copy.

**Reason:**  
Profile must reinforce that real identity stays private until approved, while keeping reveal controls, profile editing, and data integration deferred.

**Impact:**  
Future Profile work must build from this placeholder without adding user data, profile data, reveal approval behavior, editing behavior, monetization, or backend integration unless separately approved.

**Do Not:**  
Do not add real or mock user data, fake profiles, fake avatars, follower counts, coin/package logic, reveal approval logic, profile edit logic, navigation behavior, API calls, Supabase/Auth/RLS/Storage logic, or package changes during the static Profile placeholder phase.

---

## DEC-040 - Phase 5E Static Feed Placeholder Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5E may replace the neutral Feed route shell with a static Feed placeholder that uses only anonymous media and voice feed copy.

**Reason:**  
Feed must acknowledge the future 3-column media direction without introducing media data, cards, grid behavior, identity exposure, or backend integration early.

**Impact:**  
Future Feed work must build from this placeholder without adding mock media, media cards, grid implementation, navigation behavior, or storage/backend integration unless separately approved.

**Do Not:**  
Do not add real or mock media, fake users, fake profiles, fake avatars, photo/video/audio cards, 3-column grid implementation, navigation behavior, API calls, Supabase/Auth/RLS/Storage logic, or package changes during the static Feed placeholder phase.

---

## DEC-041 - Phase 5F Static Reveal Requests Placeholder Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Product / UX / Mobile

**Decision:**  
Phase 5F may replace the neutral Reveal Requests route shell with a static placeholder that uses only permission-flow copy.

**Reason:**  
Reveal Requests must reinforce future owner-controlled visibility decisions without implementing request state, approve/reject actions, or profile visibility logic early.

**Impact:**  
Future Reveal Requests work must build from this placeholder without adding request data, approval behavior, notification behavior, profile visibility logic, or backend integration unless separately approved.

**Do Not:**  
Do not add real or mock user/request data, fake profiles, fake avatars, request cards, approve/reject buttons, notification logic, profile visibility logic, navigation behavior, API calls, Supabase/Auth/RLS/Storage logic, or package changes during the static Reveal Requests placeholder phase.

---

## DEC-042 - Phase 6A Mobile UI Foundation Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Mobile UI foundation work must start with a documentation-only plan covering dark-first direction, mobile-native principles, privacy-first copy, calm human tone, future token categories, future typography/spacing/radius/shadow direction, and future reusable component candidates.

**Reason:**  
The app needs a consistent mobile UI direction before shared components or route improvements are introduced, while preserving the small-phase implementation model.

**Impact:**  
Future mobile UI foundation tasks should introduce components and styling one narrow phase at a time, starting from the documented candidates and boundaries.

**Do Not:**  
Do not create design system code, shared components, style/token files, route UI changes, navigation tabs, mock data, package changes, Supabase/Auth/RLS/Storage logic, migrations, apps/web source changes, or shared packages during Phase 6A.

---

## DEC-043 - Phase 6B Mobile UI Token Constants Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 6B may create only `apps/mobile/src/constants/ui.ts` with plain TypeScript UI token constants for colors, spacing, radius, typography, shadows, and screen layout values.

**Reason:**  
The mobile UI foundation needs a small static token layer before shared components or route UI improvements are introduced.

**Impact:**  
Future mobile UI work can reference these tokens only after a later approved task. Tokens must stay free of runtime behavior, route imports, mock data, and backend/security integration.

**Do Not:**  
Do not create React components, route UI changes, navigation tabs, mock data, package changes, Supabase/Auth/RLS/Storage logic, migrations, apps/web source changes, or shared packages during Phase 6B.

---

## DEC-044 - Phase 6C ScreenContainer Component Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 6C may create only `apps/mobile/src/components/ScreenContainer.tsx` as a minimal named `ScreenContainer` export that wraps children in a dark-first mobile-safe layout using existing UI tokens.

**Reason:**  
`ScreenContainer` is the first reusable mobile UI foundation component and should be introduced before any route adoption or additional components.

**Impact:**  
Future route work may adopt `ScreenContainer` only after a later explicit task. Additional components remain separate future slices.

**Do Not:**  
Do not apply `ScreenContainer` to route files, create additional components, add navigation tabs, add mock data, change packages, add Supabase/Auth/RLS/Storage logic, create migrations, modify apps/web source files, or create shared packages during Phase 6C.

---

## DEC-045 - Phase 6D SectionHeader Component Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 6D may create only `apps/mobile/src/components/SectionHeader.tsx` as a minimal named `SectionHeader` export for title and optional subtitle display using existing UI tokens.

**Reason:**  
`SectionHeader` is a small reusable text hierarchy component that can support later route cleanup without introducing route behavior early.

**Impact:**  
Future route work may adopt `SectionHeader` only after a later explicit task. Remaining components must stay separate future slices.

**Do Not:**  
Do not apply `SectionHeader` to route files, modify `ScreenContainer` unless required for type compatibility, create additional components, add navigation tabs, add mock data, change packages, add Supabase/Auth/RLS/Storage logic, create migrations, modify apps/web source files, or create shared packages during Phase 6D.

---

## DEC-046 - Phase 6E EmptyState Component Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 6E may create only `apps/mobile/src/components/EmptyState.tsx` as a minimal named `EmptyState` export for calm empty-state title, optional description, and optional action-label display using existing UI tokens.

**Reason:**  
`EmptyState` provides reusable calm empty-state structure for later placeholder cleanup without introducing route behavior or mock data early.

**Impact:**  
Future route work may adopt `EmptyState` only after a later explicit task. Remaining components must stay separate future slices.

**Do Not:**  
Do not apply `EmptyState` to route files, modify existing components, create additional components, add navigation tabs, add mock data, change packages, add Supabase/Auth/RLS/Storage logic, create migrations, modify apps/web source files, or create shared packages during Phase 6E.

---

## DEC-047 - Phase 6F SoftAction Component Boundary

**Status:** Approved Direction  
**Date:** 2026-05-26  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 6F may create only `apps/mobile/src/components/SoftAction.tsx` as a minimal named `SoftAction` export for passive visual action-label display using existing UI tokens.

**Reason:**  
`SoftAction` supports future low-pressure action presentation without introducing press behavior, navigation, or product logic early.

**Impact:**  
Future route work may adopt `SoftAction` only after a later explicit task. Press behavior must remain a separate approved slice.

**Do Not:**  
Do not apply `SoftAction` to route files, modify existing components, create `PrivacyNote`, add `Pressable`, add `TouchableOpacity`, add `onPress`, add navigation tabs, add mock data, change packages, add Supabase/Auth/RLS/Storage logic, create migrations, modify apps/web source files, or create shared packages during Phase 6F.

---

## DEC-048 - Phase 6G PrivacyNote Component Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Design / Mobile / Process

**Decision:**  
`PrivacyNote` is a passive-only mobile UI foundation component and must not trigger navigation, reveal logic, auth checks, data fetching, API calls, or storage access.

**Reason:**  
Privacy messaging is central to ankion, but the note component must remain presentational until route behavior and privacy logic are separately approved.

**Impact:**  
Future route work may adopt `PrivacyNote` only after a later explicit task. Any reveal, auth, data, or navigation behavior must remain outside this component.

**Do Not:**  
Do not apply `PrivacyNote` to route files, add press behavior, add navigation, add reveal logic, add auth checks, fetch data, add Supabase/Auth/RLS/Storage logic, create migrations, modify apps/web source files, change packages, or create shared packages during Phase 6G.

---

## DEC-049 - Phase 7A Discover UI Foundation Application Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 7A may apply the approved mobile UI foundation components to `apps/mobile/app/discover.tsx` only, while keeping Discover static and behavior-free.

**Reason:**  
Route adoption should begin one screen at a time so visual foundation usage remains reviewable and does not introduce product behavior, navigation, mock data, or backend/security logic early.

**Impact:**  
Future route adoption must continue as separate narrow phases, with Phase 7B planned for Chat only.

**Do Not:**  
Do not apply shared UI components to Chat, Profile, Feed, Reveal Requests, or index during Phase 7A; do not add navigation, mock data, fake users/profiles/media/messages/requests, API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, backend logic, or shared packages.

---

## DEC-050 - Phase 7 Product Route UI Foundation Adoption Complete

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Design / Mobile / Process

**Decision:**  
Phase 7 route UI foundation adoption is complete across Discover, Chat, Profile, Feed, and Reveal Requests. These routes may use the approved foundation components while remaining static, behavior-free, and data-free.

**Reason:**  
The product routes now share a consistent mobile UI foundation, but navigation, data, backend integration, and product behavior still need separate planning and approval.

**Impact:**  
Phase 8 navigation planning and minimal static Link slices may build on the completed Phase 7 route foundation, while product behavior and backend integration remain separate approved work.

**Do Not:**  
Do not add navigation tabs, route navigation behavior, mock data, fake users/profiles/media/messages/requests, message bubbles, voice recorder logic, reveal request logic, approve/reject buttons, media grids, API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, backend logic, or shared packages as part of Phase 7 completion.

---

## DEC-051 - Phase 8 Static Navigation Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Architecture / Mobile / Process

**Decision:**  
Phase 8 may use minimal static Expo Router `Link` navigation for route access: index links to approved product routes, Discover links to Chat, and Feed links to Chat. Root layout remains a Stack with hidden headers.

**Reason:**  
Static Links allow basic route access and preserve the approved Discover/Feed-to-Chat direction without introducing product behavior, redirects, tabs, router actions, auth gates, or backend integration.

**Impact:**  
Future navigation work must continue in small approved phases after the Phase 8G audit.

**Do Not:**  
Do not add bottom tabs, redirects, `router.push`, auth gates, recipient pickers, product behavior, mock data, message bubbles, voice recorder logic, reveal logic, approve/reject logic, API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, backend logic, or shared packages as part of Phase 8G.

---

## DEC-052 - Phase 9 Static Product Flow Surface Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 9 may add static product-flow surfaces to Chat, Profile, and Reveal Requests only. These surfaces must remain presentational and behavior-free.

**Reason:**  
The app needs visible placeholders for the voice-first chat, privacy/reveal, and request review flow before any recorder, data, backend, or permission logic is introduced.

**Impact:**  
Future behavior work must be separately approved and must not infer backend, reveal, recorder, or profile-edit logic from these static surfaces.

**Do Not:**  
Do not add real messages, real audio, play/pause behavior, voice recording, reveal logic, approve/reject behavior, profile editing, follower/coin/package logic, mock users/profiles/media/messages, API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, backend logic, or shared packages as part of Phase 9F.

---

## DEC-053 - Android Preview APK Build Dependency Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Mobile / Build / Process

**Decision:**  
Android preview APK builds run from `apps/mobile` with EAS preview APK configuration. Because Git is unavailable on PATH in the current local environment, EAS may be run with `EAS_NO_VCS=1`. Expo Router runtime dependencies required by Metro, including `expo-linking` and `expo-constants`, must be declared directly in `@ankion/mobile`. React must remain pinned/aligned to the renderer-compatible version validated for the current Expo SDK 56 app.

**Reason:**  
The first remote Android bundle failed because `expo-linking` was not directly resolvable from the mobile app dependency graph. A later real-device APK crash was traced by ADB logcat to a React / `react-native-renderer` version mismatch. Direct dependency declaration and React alignment produced a preview APK that opened successfully on a real Android device.

**Impact:**  
Future dependency changes must preserve Expo SDK compatibility and real-device smoke test confidence before product behavior work continues. A development build has not been introduced yet.

**Do Not:**  
Do not remove `expo-linking` or `expo-constants` from direct mobile dependencies while Expo Router needs them; do not loosen React alignment casually; do not introduce development builds, package changes, backend/Auth/Supabase/RLS/Storage logic, mock data, recorder/reveal behavior, apps/web source changes, or shared packages as part of build-status alignment.

---

## DEC-054 - Phase 10 Chat Static Interaction Education Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 10 may add static Chat education surfaces for context hierarchy, passive voice composer placement, voice lifecycle explanation, and reveal education. These surfaces must remain behavior-free.

**Reason:**  
Chat is ankion's central trust surface. The product needs clear static explanation of anonymous voice, owner-controlled reveal, and profile privacy before recorder, backend, or reveal behavior is considered.

**Impact:**  
Future Chat work should first plan simplification and duplicate explanation cleanup before adding any behavior.

**Do Not:**  
Do not add recorder behavior, microphone permissions, real audio, play/pause behavior, fake users/profiles/messages/reveal requests, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, navigation expansion, or shared packages as part of Phase 10F.

---

## DEC-055 - Phase 11 Static Chat Simplification Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 11 may simplify duplicated static Chat explanatory surfaces while preserving the approved static Chat surfaces and keeping the route behavior-free.

**Reason:**  
Phase 9 and Phase 10 created useful but overlapping Chat education surfaces. Removing duplicate explanation improves clarity before any recorder, backend, reveal, or data behavior is considered.

**Impact:**  
Future Chat work may build on the cleaner static surface set: `SectionHeader`, `contextCard`, `composerCard`, `voiceCard`, `lifecycleCard`, `revealEducationCard`, `PrivacyNote`, and `SoftAction`. APK rebuild is not required for this checkpoint unless native dependencies, package files, or navigation change.

**Do Not:**  
Do not add recorder behavior, microphone permissions, real audio, play/pause behavior, fake users/profiles/messages/reveal requests, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, navigation expansion, or shared packages as part of Phase 11C.

---

## DEC-056 - Phase 12 Static Discover / Feed To Chat Flow Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 12 may refine Discover and Feed as static entry surfaces that lead more naturally into Chat while preserving existing static `/chat` Link behavior and avoiding new navigation behavior.

**Reason:**  
Discover and Feed should feel like calm anonymous entry points into the central Chat interaction hub before any real data, media, recorder, backend, or reveal behavior is added.

**Impact:**  
Future Discover and Feed work may build on the clearer static flow language. APK rebuild is not required for this checkpoint unless native dependencies, package files, backend/API integration, or navigation behavior change.

**Do Not:**  
Do not add mock users/profiles/avatars/media/messages/reveal requests, real media, uploads, swipe/match behavior, recorder behavior, real audio, reveal logic, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, router.push, tabs, new navigation behavior, or shared packages as part of Phase 12E.

---

## DEC-057 - Phase 13 Static Profile / Reveal Requests Coherence Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 13 may refine Profile and Reveal Requests as static owner-controlled visibility and permission-review surfaces that stay coherent with the Chat reveal model.

**Reason:**  
Real profile visibility is a core trust boundary. Profile and Reveal Requests need clear static language before any real profile editing, reveal decision, request status, backend, or data behavior is introduced.

**Impact:**  
Future Profile and Reveal Requests work may build on the clearer owner-control model. Index remains a temporary route shell and should later receive documentation-only Home / Navigation polish planning.

**Do Not:**  
Do not add fake profile/requester/user/avatar data, profile edit logic, follower/coin/package logic, approve/reject buttons, request status logic, reveal logic, recorder behavior, real audio, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, router.push, tabs, new navigation behavior, or shared packages as part of Phase 13D.

---

## DEC-058 - Phase 14 Home / Navigation Polish Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Navigation / Mobile / Process

**Decision:**  
Phase 14A may document future Home / Navigation polish only. The current Index/mobile route shell is temporary, and future Home should become a real premium app entry while preserving the existing static `Link` approach until a later approved implementation slice.

**Reason:**  
The app now has coherent static route surfaces, but the Index route still feels like a route shell. Home polish should be planned before any route UI implementation or navigation behavior changes.

**Impact:**  
Phase 14B polished `apps/mobile/app/index.tsx` as a static Home entry only. Tabs, `router.push`, redirects, auth gates, backend/API logic, data, and package changes remain deferred.

**Do Not:**  
Do not add tabs, `router.push`, redirects, new navigation behavior, mock data, recorder/audio/reveal/upload behavior, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, apps/web source changes, or shared packages as part of Phase 14A.

---

## DEC-059 - Phase 14 Static Home Polish Boundary

**Status:** Approved Direction  
**Date:** 2026-05-27  
**Scope:** Product / Navigation / Mobile / Process

**Decision:**  
Phase 14B may replace the temporary Index route shell with a static premium Home entry while preserving existing Link-based navigation.

**Reason:**  
The app needs a more intentional Home entry after product routes became coherent, but navigation behavior and product logic must remain deferred.

**Impact:**  
Index can now function as a static Home entry to Discover, Feed, Chat, Profile, and Reveal Requests. Future navigation or Home behavior must be separately planned and approved.

**Do Not:**  
Do not add tabs, `router.push`, redirects, auth gates, new navigation behavior, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, mock data, recorder/audio/reveal/upload behavior, package changes, apps/web source changes, or shared packages as part of Phase 14D.

---

## DEC-060 - Phase 15 Static MVP Readiness And Chat Compression Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 15A through Phase 15F completed static MVP readiness planning, visual polish audit, Chat static visual compression planning, Chat copy compression, local validation, and docs/status alignment. Chat may have shorter, less technical static copy while remaining behavior-free.

**Reason:**  
The static MVP needs clearer, more mobile-native copy and visual rhythm before any recorder, backend, reveal, upload, data, or navigation behavior is introduced.

**Impact:**  
Future static polish should proceed as narrow approved slices, with Home static copy compression/planning or Discover/Feed static copy compression planning preferred next. Phase 15F confirms route UI was audited but not modified during docs/status alignment.

**Do Not:**  
Do not add recorder behavior, microphone permissions, real audio, play/pause behavior, fake users/profiles/messages/reveal data, reveal logic, approve/reject logic, upload behavior, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, lockfile changes, apps/web source changes, tabs, redirects, `router.push`, new navigation behavior, or shared packages as part of Phase 15F.

---

# Deferred Decisions

## DEF-001 — Exact Coin/Follower-View Economy

**Status:** Deferred  
**Date:** 2026-05-24  
**Scope:** Monetization / Product

**Decision:**  
Coin and follower-view package design requires deeper analysis later.

**Reason:**  
Poor monetization rules could weaken privacy, fairness, or product trust.

**Current Boundary:**  
Coins/follower packages must not reveal real profile identity.

---

## DEF-002 — Location-Based Discovery

**Status:** Deferred  
**Date:** 2026-05-24  
**Scope:** Product

**Decision:**  
Location-based behavior is deferred.

**Reason:**  
It is not required for the MVP core and adds privacy complexity.

---

## DEF-003 — AI Communication-Style Analysis

**Status:** Deferred  
**Date:** 2026-05-24  
**Scope:** Product / Safety

**Decision:**  
AI analysis of voice/tone/personality is deferred.

**Reason:**  
It must be designed carefully as non-diagnostic, consent-based feedback.

---

# Superseded Decisions

None yet.

---

# TODO

- Update this file if any approved decision changes.
- Keep `PROJECT_STATUS.md` and `FILE_MAP.md` aligned with this file.
- Review this file again during final deep analysis.
- Do not use this file as permission to begin implementation.

## DEC-061 - Phase 16 Home Static Copy Compression Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Product / Mobile / Process

**Decision:**  
Phase 16A through Phase 16D completed Home static copy compression planning, Home static copy compression implementation, local validation, and docs/status alignment. Home may have shorter, clearer static copy and stronger Discover/Feed primary action language while preserving existing Link-based navigation.

**Reason:**  
The static Home screen needed sharper first-screen product feel before any tabs, routing behavior, recorder, backend, reveal, upload, data, or package work is introduced.

**Impact:**  
Future static polish should proceed as narrow approved slices, with Discover/Feed static copy compression planning or a final static visual rhythm audit across Chat and Home preferred next. Phase 16D confirms route UI was audited but not modified during docs/status alignment.

**Do Not:**  
Do not add tabs, redirects, `router.push`, new navigation behavior, recorder behavior, microphone permissions, real audio, play/pause behavior, fake users/profiles/messages/media/reveal data, reveal logic, approve/reject logic, upload behavior, backend/API calls, Supabase/Auth/RLS/Storage logic, migrations, package changes, lockfile changes, apps/web source changes, or shared packages as part of Phase 16D.

---

## DEC-062 - Phase 17 Security Foundation Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Security / Process

**Decision:**  
Phase 17A through Phase 17E completed documentation-only security foundation planning for the data model, anonymous identity separation, reveal request safety, and voice/media storage boundaries. These documents are planning artifacts only and do not authorize implementation.

**Reason:**  
ankion's core trust model depends on separating anonymous identity from real profile identity, enforcing reveal safety, and preventing table/storage path leaks before Supabase/Auth/RLS/Storage work begins.

**Impact:**  
Future backend work must pass a readiness gate and should continue with a narrow checklist or RLS policy matrix expansion before any Supabase implementation, migrations, or SQL are created.

**Do Not:**  
Do not add Supabase files, Auth integration, RLS SQL, Storage buckets, migrations, executable SQL, backend/API logic, route/component changes, package changes, lockfile changes, apps/web source changes, or shared packages as part of Phase 17E.

---

## DEC-063 - Phase 18 Supabase Readiness Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Security / Supabase / Process

**Decision:**  
Phase 18A through Phase 18F completed documentation-only Supabase readiness planning: implementation readiness checklist, expanded RLS matrix plan, Auth foundation plan, database schema draft plan, Supabase client integration boundary plan, and readiness audit/docs alignment. These documents are planning artifacts only and do not authorize implementation.

**Reason:**  
Supabase/Auth/RLS/Storage work touches the highest-risk privacy and identity boundaries in ankion. Readiness gates must be explicit before client setup, Auth code, migrations, SQL, Storage policies, or environment files are created.

**Impact:**  
Future backend work should proceed only after an explicit go/no-go review or SQL migration slicing plan. Package installs, `.env`, Supabase client code, migrations, RLS SQL, and Storage policies remain blocked until separately approved.

**Do Not:**  
Do not add Supabase implementation, Supabase client, Auth code, RLS SQL, Storage buckets/policies, migrations, executable SQL, `.env` files, package installs, backend/API logic, route/component changes, package changes, lockfile changes, apps/web source changes, or shared packages as part of Phase 18F.

---

## DEC-064 - Phase 19 Supabase Folder Migration Structure Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Supabase / Process

**Decision:**  
Phase 19C created a documentation-only Supabase folder and migration structure plan, and Phase 19D audited and aligned status docs. The plan defines future organization only and does not authorize SQL, migrations, Supabase implementation, Auth, RLS, Storage, package installs, `.env`, or backend/API work.

**Reason:**  
Supabase implementation needs a clear file and migration organization before any executable database or client work begins.

**Impact:**  
Future Supabase work should proceed through a go/no-go checklist review or SQL migration slicing plan before creating any implementation files.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, or mock data as part of Phase 19D.

---

## DEC-065 - Phase 20A SQL Migration Slicing Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Supabase / Process

**Decision:**  
Phase 20A reviewed the SQL migration slicing plan against the Phase 19C Supabase folder/migration structure plan. The migration slicing order remains safe, ordered, and implementation-ready from a planning perspective only.

**Reason:**  
The project needs confidence that migration order and future folder structure are aligned before any executable SQL or Supabase implementation is considered.

**Impact:**  
Future work may continue with a Supabase implementation go/no-go checklist review or SQL migration readiness audit. This review does not authorize SQL, migrations, Supabase client, Auth, RLS, Storage, `.env`, package, route, apps/web, or backend/API changes.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, or mock data as part of Phase 20A.

---

## DEC-066 - Phase 20B Supabase Go No-Go Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Supabase / Process

**Decision:**  
Phase 20B reviewed the Supabase implementation readiness checklist gate by gate. Final implementation status remains NO-GO because all readiness gates have not been explicitly passed.

**Reason:**  
Supabase implementation would touch identity, privacy, RLS, Storage, Auth, environment variables, and client boundaries. It must not begin while schema, RLS verification, Auth flow, Storage privacy, rollback/check strategy, environment strategy, client boundary approval, and testing/audit procedure remain incomplete.

**Impact:**  
Future work should close readiness gates through planning before any implementation starts. SQL, migrations, Supabase client, Auth, RLS, Storage, `.env`, package, route, apps/web, or backend/API changes remain blocked.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20B.

---

## DEC-067 - Phase 20C Supabase Readiness Gate Closure Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Supabase / Process

**Decision:**  
Phase 20C created a documentation-only Supabase readiness gate closure plan. Supabase implementation remains NO-GO until every missing readiness gate is explicitly reviewed and marked ready.

**Reason:**  
Phase 20B identified missing readiness gates that block implementation. A closure plan is needed before any SQL, migrations, client integration, Auth, RLS, Storage, environment files, or backend/API work can be considered.

**Impact:**  
Future work should close gates in order, starting with finalized schema readiness, then RLS policy verification readiness, before client integration or implementation can be considered.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20C.

---

## DEC-068 - Phase 20D Finalized Schema Readiness Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Database / Supabase / Process

**Decision:**  
Phase 20D reviewed finalized schema readiness. The planned schema is a sound MVP foundation, but finalized schema readiness remains NOT READY because implementation-critical details are unresolved.

**Reason:**  
Supabase implementation and SQL migrations require exact schema decisions before executable database work can safely begin.

**Impact:**  
SQL, migrations, Supabase implementation, Auth, RLS, Storage, client integration, environment files, packages, route changes, and backend/API work remain blocked. Future review should track schema blockers and continue with RLS readiness only as planning.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20D.

---

## DEC-069 - Phase 20E RLS Policy Verification Readiness Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Security / Supabase / Process

**Decision:**  
Phase 20E reviewed RLS policy verification readiness. The expanded RLS matrix is a useful planning foundation, but RLS policy verification readiness remains NOT READY.

**Reason:**  
Phase 20D schema readiness remains NOT READY, and future RLS verification still needs finalized ownership fields, participant rules, reveal grant checks, feed visibility rules, storage/media metadata rules, denied-operation cases, test/audit cases, and safe view/RPC boundaries.

**Impact:**  
RLS SQL, policy files, migrations, Supabase implementation, Auth, Storage, client integration, environment files, packages, route changes, and backend/API work remain blocked. Future work should continue with the next readiness gate review before any implementation.

**Do Not:**  
Do not create RLS SQL, policy files, SQL files, migrations, Supabase implementation, Supabase client, Auth code, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20E.

---

## DEC-070 - Phase 20F Storage Privacy Boundary Readiness Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Storage / Supabase / Process

**Decision:**  
Phase 20F reviewed Storage privacy boundary readiness. Storage privacy planning exists, but Storage privacy boundary readiness remains NOT READY.

**Reason:**  
Future Storage implementation still needs finalized bucket strategy, path privacy rules, signed URL strategy, media metadata relationships, anonymous-to-real-profile leakage checks, feed media public-safe access rules, voice media participant access rules, delete/revoke/expiration behavior, CDN/cache assumptions, and storage audit/test cases. Phase 20D schema readiness and Phase 20E RLS verification readiness also remain NOT READY.

**Impact:**  
Storage buckets, Storage policies, uploads, signed URL code, Supabase implementation, RLS/Auth/client integration, environment files, packages, route changes, and backend/API work remain blocked.

**Do Not:**  
Do not create Storage buckets, Storage policies, SQL files, migrations, Supabase implementation, Supabase client, Auth code, RLS implementation, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20F.

---

## DEC-071 - Phase 20G Auth Flow Boundary Readiness Review Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Auth / Supabase / Process

**Decision:**  
Phase 20G reviewed Auth flow boundary readiness. Auth planning exists, but Auth flow boundary readiness remains NOT READY.

**Reason:**  
Future Auth implementation still needs finalized account creation boundaries, private profile row creation assumptions, anonymous identity creation assumptions, session/client boundaries, reveal request ownership rules, visibility grant access rules, media ownership rules, deletion/deactivation behavior, blocked/suspended account assumptions, client-safe Auth usage, and Auth audit/test cases. Phase 20D schema readiness, Phase 20E RLS verification readiness, and Phase 20F Storage privacy readiness also remain NOT READY.

**Impact:**  
Auth implementation, login/signup UI, session handling, Supabase client integration, RLS, Storage, environment files, packages, route changes, and backend/API work remain blocked.

**Do Not:**  
Do not add Auth implementation, login/signup UI, session handling, Supabase client, SQL files, migrations, RLS implementation, Storage implementation, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20G.

---

## DEC-072 - Phase 20H Migration Rollback Check Strategy Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Migration / Supabase / Process

**Decision:**  
Phase 20H created a documentation-only migration rollback / check strategy plan. Migration rollback/check strategy is now PLANNED, but real migration execution remains BLOCKED / NO-GO.

**Reason:**  
Future SQL migrations need explicit safety checks, rollback notes, dry-run expectations, failed migration handling rules, destructive-change review, backup/checkpoint expectations, and validation expectations before any executable database work begins.

**Impact:**  
Future migration work must be small, reviewed, dependency-aware, security-first, and blocked until schema, RLS, Storage, Auth, environment, client, and testing/audit gates are explicitly ready. SQL, migrations, Supabase implementation, client integration, Auth, RLS, Storage, environment files, route changes, package changes, and backend/API work remain blocked.

**Do Not:**  
Do not create SQL files, migrations, Supabase implementation, Supabase client, Auth code, login/signup UI, session handling, RLS implementation, Storage buckets/policies, `.env` files, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, recorder/audio/reveal/upload/navigation behavior, or runtime behavior changes as part of Phase 20H.

---

## DEC-073 - Phase 20I Environment Variable Strategy Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Environment / Supabase / Process

**Decision:**  
Phase 20I created a documentation-only environment variable strategy plan. Environment variable strategy is now PLANNED, but Supabase implementation remains NO-GO.

**Reason:**  
Supabase implementation needs clear boundaries for local, preview/staging, and production values, public anon key use, service role key prohibition, Expo public environment naming, and secrets that must never be committed.

**Impact:**  
Future Supabase client, Auth, RLS, Storage, and backend/API work must not begin until environment handling is reviewed with implementation approval. Mobile code must never use a service role key, and `EXPO_PUBLIC_` values must only contain non-secret client-safe values.

**Do Not:**  
Do not create `.env` files, real environment variables, Supabase client code, Auth implementation, login/signup UI, session handling, SQL files, migrations, RLS implementation, Storage implementation, package changes, lockfile changes, route/component changes, apps/web source changes, backend/API logic, mock data, navigation behavior, or runtime behavior changes as part of Phase 20I.

---

## DEC-074 - Phase 20J Client Integration Boundary Review

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Client Integration / Supabase / Process

**Decision:**  
Phase 20J reviewed and tightened the future Supabase client integration boundary. Client integration boundary is REVIEWED / PLANNED, but Supabase implementation remains NO-GO.

**Reason:**  
The mobile client must not become a shortcut around RLS, Auth, Storage, reveal grants, environment boundaries, or safe DTO/view/RPC access. Client integration must wait until schema, RLS, Auth, Storage, environment, migration, package alignment, and testing/audit gates are ready.

**Impact:**  
Supabase client implementation, package installation, Auth/session handling, data fetching, Storage access, route UI changes, and runtime behavior remain blocked. The known Expo package alignment issue is deferred: `expo@56.0.5` should be `~56.0.6`.

**Do Not:**  
Do not add Supabase client, install packages, edit package files, edit lockfile, create `.env` files, add environment variables, create SQL files, create migrations, modify `supabase/`, add Auth/session handling, add RLS, add Storage, edit route UI, edit apps/web source, add backend/API, add mock data, add navigation behavior, or change runtime behavior as part of Phase 20J.

---

## DEC-075 - Phase 20K Testing Audit Procedure Planning Boundary

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Testing / Audit / Supabase / Process

**Decision:**  
Phase 20K created a documentation-only testing / audit procedure plan. Testing / audit procedure is now PLANNED, but Supabase implementation remains NO-GO.

**Reason:**  
Supabase/Auth/RLS/Storage implementation requires a clear audit and testing procedure before executable backend or client work can safely begin. The audit must cover schema, RLS, Auth, Storage, environment, client integration, migration rollback/check readiness, package alignment, and privacy-leak checks.

**Impact:**  
Future implementation remains blocked until testing/audit procedure is accepted with the other readiness gates. The known Expo package alignment issue remains deferred: `expo@56.0.5` should be `~56.0.6`.

**Do Not:**  
Do not add Supabase client, install packages, edit package files, edit lockfile, create `.env` files, add environment variables, create SQL files, create migrations, modify `supabase/`, add Auth/session handling, add RLS, add Storage, edit route UI, edit apps/web source, add backend/API, add mock data, add navigation behavior, or change runtime behavior as part of Phase 20K.

---

## DEC-076 - Phase 20L Final Supabase Go No-Go Decision

**Status:** Approved Direction  
**Date:** 2026-05-28  
**Scope:** Architecture / Supabase / Security / Process

**Decision:**  
Phase 20L completed the final current Supabase implementation Go/No-Go review. The decision is NO-GO.

**Reason:**  
Critical gates remain incomplete: package alignment is a blocker/deferred item, schema is not implementation-final, RLS tests are not execution-ready, Auth/session boundaries are not execution-ready, Storage access rules are not execution-ready, environment introduction is not approved for implementation, migration rollback/check process is not execution-approved, and testing/audit procedure is planned but not executed or accepted for implementation.

**Impact:**  
Supabase implementation, SQL/migrations, Auth/RLS/Storage implementation, `.env` files, Supabase client integration, backend/API work, route behavior, package changes unrelated to a future explicit alignment phase, and runtime behavior remain blocked. The next recommended phase is Phase 21A Expo Package Alignment.

**Do Not:**  
Do not add Supabase client, install packages outside an explicitly approved package alignment phase, edit package files, edit lockfile, create `.env` files, add environment variables, create SQL files, create migrations, modify `supabase/`, add Auth/session handling, add RLS, add Storage, edit route UI, edit apps/web source, add backend/API, add mock data, add navigation behavior, or change runtime behavior as part of Phase 20L.

---

## DEC-077 - Directional Connection-Based Profile Visibility

**Status:** Approved
**Date:** 2026-05-30
**Scope:** Product / Security / Database / UX

**Decision:**
Real profile visibility in ankion is directional, connection-based, and owner-approved. A profile visibility approval is valid only for the specific requester, owner, and connection/thread context where the reveal request was approved.

A user opening their profile to one person does not make that profile globally visible. It also does not automatically open the other person's profile in return.

Users cannot search by username or browse real profiles in MVP. A profile reveal request can only originate from a voice or connection context.

**Reason:**
ankion must stay voice-first and anonymous-first. Users should discover people through voice, not by searching profiles. Real identity must remain protected unless the profile owner explicitly grants visibility inside a specific connection context.

**Impact:**
Reveal requests, profile visibility grants, safe DTOs, RLS policies, Chat state, Profile UI, Reveal Requests UI, and future backend tables must treat profile visibility as scoped to:

```txt
voice_id → thread_id → requester_user_id → owner_user_id → reveal_request_id → visibility_grant
```

A reveal grant must not be treated as global profile visibility.

**Do Not:**
Do not add username search, public real-profile browsing, global profile unlock, automatic mutual reveal, dating-style profile discovery, or paid shortcuts to real profile visibility.

---

## DEC-078 - Instant Media Authenticity Is Core

**Status:** Approved
**Date:** 2026-05-31
**Scope:** Product / Security / Storage / Backend

**Decision:**
Instant media authenticity is a mandatory core rule for ankion. Public Feed and discovery media must come from an in-app capture-now flow, not from gallery upload. Camera tap may create a photo, and camera long press may create a video. Voice remains a separate primary action.

**Reason:**
Instant media strengthens anonymous discovery only if users can trust that public media represents a fresh in-app moment. UI-only prevention is not enough; future backend, Storage, RLS, and media intent checks must support this rule.

**Impact:**
Future schema, RLS, Storage, upload, media metadata, Test Lab, and client integration work must include capture intent, server nonce, media hash, short-lived upload permission, replay prevention, storage path control, and block-aware media access.

**Do Not:**
Do not allow public Feed/discovery media to be uploaded from gallery. Do not rely only on frontend UI to prevent instant-media cheating. Do not let media upload reveal real profile identity or bypass reveal permission.

---

## DEC-079 - Follow Targets Anonymous Identity

**Status:** Approved
**Date:** 2026-05-31
**Scope:** Product / Security / Database / Monetization

**Decision:**
Following in ankion targets an anonymous identity, instant profile, anonymous voice flow, or connection context. It does not target or reveal the real profile by default.

**Reason:**
Follow can improve retention and discovery, but it must not become username search, public real-profile browsing, or a reveal bypass.

**Impact:**
Future follow tables, Feed ranking, Discover priority, notifications, Plus features, and safe DTOs must preserve anonymous identity separation. Followed content may receive subtle priority or badges, but real identity remains hidden unless a valid owner-approved visibility grant exists and no active block exists.

**Do Not:**
Do not treat follow as profile permission. Do not expose real name, real avatar, owner_user_id, auth user id, or private profile fields through follow. Do not allow follow to override block, reveal state, or profile visibility grants.

---

## DEC-080 - Calls Are Connection-Based And Reveal-Safe

**Status:** Approved
**Date:** 2026-05-31
**Scope:** Product / Security / Calls / Privacy

**Decision:**
Future voice calls and video calls must be connection-based and reveal-safe. Calls cannot start globally from Feed or Discover, cannot be random, and cannot create an oda/room system. Block must disable calls.

Voice calls may exist only inside an established private connection. Video calls expose identity more strongly and therefore require either approved profile reveal or a separate explicit mutual video-call permission.

**Reason:**
Calls can deepen trust, but they can also bypass reveal if added loosely. They must preserve ankion's anonymous voice-first connection model.

**Impact:**
Future call permissions, call state tables, notifications, UI, safety actions, and backend checks must verify connection context, block state, reveal/video permission state, and safe identity boundaries before call access.

**Do Not:**
Do not add random calls, global calls, Feed-to-call, Discover-to-call, room calls, group rooms, or video-call access that bypasses owner-approved reveal or explicit mutual permission.

---

## DEC-081 - Manual Small-Phase Development Mode

**Status:** Approved
**Date:** 2026-05-31
**Scope:** Process / Implementation / QA

**Decision:**
Current ankion development mode is manual, small-phase, and validation-first. Codex should not be used by default. Code changes should be requested only after the relevant file is reviewed. One phase should normally touch one or two files, and only tightly related phases may touch up to three or four files.

**Reason:**
The project has many privacy, product, route, UI, and security constraints. Large automated edits increase drift risk.

**Impact:**
Future work should use `C:\ankion` as the source project. `C:\ankion-apk` remains only the APK build copy. After each code phase, run mobile typecheck from `C:\ankion`. APK builds should be grouped after meaningful validated changes.

**Do Not:**
Do not make broad multi-file edits without review. Do not use Codex for large implementation tasks. Do not edit `C:\ankion-apk` as the source of truth. Do not build APK after every tiny documentation-only change.

---

## DEC-082 - No Room Or Chat Room Product Language

**Status:** Approved
**Date:** 2026-05-31
**Scope:** Product / UX / Language

**Decision:**
ankion user-facing product language must not use oda, room, chat room, sohbet odası, odaya katıl, or similar room-based language. The approved product language is Chat, Bağlantılar, Sesli bağlantılar, Sese cevap ver, Profil iste, Profili aç, Anonim kal, Engelle, Takip et, Ses bırak, Kamera, and Bir an bırak.

**Reason:**
Room language pushes the product toward Clubhouse, Discord, or group-chat mental models. ankion must stay focused on anonymous voice curiosity, private connection, and permission-based profile reveal.

**Impact:**
Product docs, UI copy, prompts, route labels, and future design instructions should avoid room-based language. Technical legacy identifiers such as safe DTO names may be reviewed separately and must not be changed blindly.

**Do Not:**
Do not introduce oda/chat room concepts, room navigation, room membership, room discovery, or group-room product flows unless explicitly re-approved later.

---

## DEC-083 - Phase 21A Expo Package Alignment Closure

**Status:** Approved Direction
**Date:** 2026-05-31
**Scope:** Process / Package Alignment / Supabase Readiness

**Decision:**
Phase 21A closes the previously deferred Expo package alignment item for the current mobile package set. `expo`, `expo-linking`, and `expo-router` are aligned to the expected SDK 56 package range, and `expo install --check` passes.

**Reason:**
The Phase 20L Supabase Go/No-Go review identified package alignment as a blocker/deferred item before future implementation work. This technical package alignment is now resolved, but it does not approve Supabase/Auth/RLS/Storage implementation.

**Impact:**
Future readiness reviews should treat Expo package alignment as completed for Phase 21A. Supabase implementation still remains NO-GO because schema, RLS verification, Auth/session, Storage, environment, client integration, migration, and testing/audit gates remain incomplete or not implementation-approved.

**Do Not:**
Do not add Supabase client code, Auth/session handling, SQL/migrations, RLS policies, Storage buckets/policies, `.env` files, backend/API logic, recorder/camera/gallery/upload behavior, route UI changes, or runtime product behavior as part of Phase 21A.

---

## DEC-084 - Phase 22A-22E Backend Readiness Planning Expansion Closure

**Status:** Approved Direction
**Date:** 2026-05-31
**Scope:** Architecture / Supabase / Security / Testing / Process

**Decision:**
Phase 22A through Phase 22E expanded the backend readiness planning set for schema, RLS, Storage/media capture intent, Safe DTO/RPC client boundaries, and testing/audit coverage. This expansion is documentation-only and does not authorize implementation.

**Reason:**
ANKION's future backend must preserve anonymous voice-first discovery, connection-scoped reveal, block safety, media authenticity, anonymous follow boundaries, and safe DTO/RPC access before any executable Supabase work begins.

**Impact:**
Future implementation gate review should use the expanded Phase 22A-22E docs as planning input, but schema, RLS, Storage, Client, and Testing readiness remain NOT READY for implementation. Supabase implementation remains NO-GO.

**Do Not:**
Do not create SQL, migrations, Supabase client code, Auth/session handling, RLS policies, Storage buckets/policies, `.env` files, backend/API logic, route UI changes, recorder/camera/gallery/upload behavior, follow/call/reveal implementation, or runtime product behavior from Phase 22A-22F.

---

## DEC-085 - Documentation Alignment Reuses Existing Markdown Files

**Status:** Approved Direction
**Date:** 2026-06-04
**Scope:** Process / Documentation

**Decision:**
Future documentation/status alignment phases should reuse suitable existing Markdown files by default. Before editing, existing `.md` files must be detected and the current project progress must be considered. New Markdown files should not be created unless they are genuinely needed; if a new file appears necessary, report it first and do not create it in that narrow phase.

**Reason:**
ANKION now has many planning/status documents. Creating new Markdown files for every small phase increases fragmentation and makes project state harder to audit.

**Impact:**
Documentation work should update the relevant current source-of-truth files such as `PROJECT_STATUS.md`, `CHANGELOG.md`, `FILE_MAP.md`, `DECISIONS.md`, and existing product/design/architecture docs. Records must preserve the product core: anonymous voice -> voice reply / connection -> real profile only by user permission and only inside the relevant connection.

**Do Not:**
Do not create new Markdown files for routine status/copy/fix alignment. Do not ignore existing docs. Do not document changes in a way that drifts ANKION toward profile browsing, global profile reveal, room-based products, backend implementation, recorder/upload implementation, or unrelated architecture work.

---

## DEC-086 - Phase 24A Backend/Auth/RLS Re-Entry Remains NO-GO

**Status:** Approved Direction
**Date:** 2026-06-04
**Scope:** Backend / Auth / RLS / Storage / Process

**Decision:**
Phase 24A keeps real Supabase/Auth/RLS/Storage implementation in NO-GO status. Package alignment is complete, but schema finalization, RLS verification, Auth/session boundary, Storage privacy boundary, environment strategy, client integration approval, migration execution, and testing/audit execution are not ready for implementation.

**Reason:**
ANKION's security model depends on anonymous voice-first interaction, strict anonymous identity / real profile separation, owner-approved connection-scoped profile visibility, and safe DTO/RPC boundaries. Starting backend implementation before the readiness gates close would risk real profile leakage, unsafe ownership fields, weak RLS, or storage path exposure.

**Impact:**
The next narrow phase should be Phase 24B - Supabase Env/Client Boundary Final Approval Slice. If later explicitly approved for implementation, the first real slice should be limited to environment/client boundary scaffolding only: no Auth session runtime, no SQL/migrations, no RLS policies, no Storage buckets/policies, no route data binding, no reveal/follow/call/media behavior, and no product behavior change.

**Do Not:**
Do not start Supabase client integration, Auth/session handling, SQL/migrations, RLS policies, Storage buckets/policies, `.env` files, backend/API logic, recorder/microphone/upload behavior, route UI changes, or runtime product behavior from Phase 24A alone. Do not introduce profile browsing, user search, global profile reveal, matching logic, or room/chat-room concepts.

---

## DEC-087 - Phase 24B Env Client Boundary Scaffold Is The Only Approved First Backend Slice

**Status:** Approved Direction
**Date:** 2026-06-04
**Scope:** Supabase / Environment / Client Boundary / Process

**Decision:**
Phase 24B approves only a future inert Supabase env/client boundary scaffold as the first backend-adjacent implementation slice, and only after a separate explicit implementation approval. Full Supabase/Auth/RLS/Storage/backend implementation remains NO-GO.

**Reason:**
ANKION needs a narrow bridge from local prototype to backend readiness without risking profile leakage, unsafe Auth ownership, direct private-table reads, service role exposure, Storage path exposure, or route behavior drift.

**Impact:**
The first future implementation slice may define client-safe public env names and an inert client scaffold that is not connected to routes or runtime product behavior. It may use `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as non-secret public values only. It may include `.env.example` placeholders if explicitly approved, but must not create real `.env` files. Service role keys must never appear in mobile code, Expo public variables, committed files, or client-facing docs.

**Do Not:**
Do not add Auth/session handling, SQL/migrations, RLS policies, Storage buckets/policies, data fetching hooks, route data binding, backend/API logic, recorder/microphone/upload behavior, reveal/follow/call/media implementation, runtime product behavior, profile browsing, user search, global profile reveal, matching logic, or room/chat-room concepts from Phase 24B alone.

---

## DEC-088 - Phase 24C Inert Supabase Env Boundary Scaffold Completed

**Status:** Approved Direction
**Date:** 2026-06-05
**Scope:** Supabase / Environment / Client Boundary / Process

**Decision:**
Phase 24C implements only an inert Supabase env/client boundary scaffold. It defines typed access to `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`, adds a placeholder-only `.env.example`, and adds an inert boundary descriptor with no real Supabase client.

**Reason:**
ANKION needs a narrow, reviewable first backend-adjacent scaffold before any real Supabase/Auth/RLS/Storage implementation. The scaffold prepares public env naming while keeping runtime product behavior unchanged and avoiding profile, identity, Storage, or Auth leakage risk.

**Impact:**
Future Supabase work can reference the public env boundary, but it must still receive separate approval before installing SDK dependencies, creating a real client, adding Auth/session handling, SQL/migrations, RLS policies, Storage policies, route data binding, recorder/upload behavior, or backend/API logic.

**Do Not:**
Do not treat Phase 24C as approval for full Supabase implementation. Do not add service role keys, real `.env` files, real secrets, Supabase queries, Auth/session runtime, SQL/migrations, RLS, Storage, route data binding, product behavior changes, profile browsing, user search, global profile reveal, matching logic, or room/chat-room concepts from Phase 24C.
---

## DEC-089 - Phase 24D Supabase SDK Dependency And Auth Boundary Remain Gated

**Status:** Approved Direction
**Date:** 2026-06-05
**Scope:** Supabase / Auth / Client Boundary / Schema / Process

**Decision:**
Phase 24D does not approve adding `@supabase/supabase-js` now. The SDK dependency is NO-GO now and conditional GO later only in a separately approved package/client slice. Auth/session implementation is NOT READY. The next narrow backend-prep phase should finalize `profiles_private` and `anonymous_identities` schema decisions before real client dependency work.

**Reason:**
ANKION must not let client availability outrun schema, Auth, RLS, safe DTO/RPC, Storage, and testing readiness. Installing the SDK before the private profile / anonymous identity boundary is implementation-final would increase drift risk without enabling safe runtime behavior.

**Impact:**
Phase 24C inert boundary files remain the approved limit. Future client work must preserve anonymous identity / real profile separation, connection-scoped owner-approved reveal, no global profile visibility, no profile search, and no route data binding until safe backend surfaces exist.

**Do Not:**
Do not install `@supabase/supabase-js`, edit package files, edit lockfile, create a real Supabase client, add Auth/session handling, create SQL/migrations, write RLS policies, create Storage buckets/policies, create real `.env` files, add backend/API logic, bind routes to backend data, expose service role keys, add profile browsing, user search, global profile reveal, matching logic, or room/chat-room concepts from Phase 24D.
---

## DEC-090 - Home And Feed Have Distinct Local Product Purposes

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** Product / UX / Mobile

**Decision:**  
Home and Feed have distinct product purposes. Home is the compact start/control screen for next action, status, privacy/reveal reminder, and a recent connection shortcut. Feed is the anonymous content consumption and reply surface.

**Reason:**  
ANKION must remain understandable and voice-first. Home should not become a duplicate feed, and Feed should not become profile browsing.

**Impact:**  
Future Home work should prioritize safe next actions and privacy clarity. Future Feed work should keep anonymous content, local `Ses bırak` / `Kamera` draft behavior, and `Yanıtla` connection flow without global profile reveal.

**Do Not:**  
Do not turn Home into a generic feed. Do not turn Feed into profile browsing, user search, public profile search, global profile reveal, matching, or room/chat-room discovery.

---

## DEC-091 - Team Development Workflow Uses Small Scoped Phases

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** Process / QA / Team Workflow

**Decision:**  
ANKION team development uses small scoped phases with explicit allowed files, forbidden files, validation commands, and device smoke tests for mobile UI changes. Roles are split: owner/user owns product direction, device testing, priority, and final approval; brother/developer handles small scoped implementation and validation; assistant handles phase planning, risk analysis, Codex prompts, review checklist, and architecture/privacy guardrails.

**Reason:**  
The project now involves more than solo development and has strict privacy, reveal, route, media, and backend boundaries. A narrow workflow prevents drift.

**Impact:**  
Every implementation phase should list allowed and forbidden files before coding, run validations before acceptance, and align docs after meaningful milestones. Documentation updates should continue to reuse existing Markdown files per DEC-085.

**Do Not:**  
Do not chain broad implementation tasks. Do not change package/lockfile, backend/Auth/RLS/Storage/media behavior, or `C:\ankion-apk` unless a phase explicitly allows it.

---

## DEC-092 - Low-CPU APK Build Standard And Media Implementation Gate

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** Build / Mobile / Media Privacy / Process

**Decision:**  
Future local release APK builds should use a low-CPU standard when practical: keep `.gradle` and `app.cxx` caches unless build recovery requires cleaning, prefer limited Gradle workers such as `--max-workers=4`, use low process priority, and optionally apply Java/Gradle CPU affinity limiting if CPU spikes too high. Real camera/gallery/upload remains NO-GO until Auth/RLS/Storage/media privacy boundaries are explicitly approved.

**Reason:**  
The successful release APK build showed high CPU usage before process limiting. Build guidance should protect the local machine while preserving repeatability. Media implementation also has direct privacy and Storage implications and must not be rushed.

**Impact:**  
APK build/copy work remains isolated to `C:\ankion-apk` only when a phase explicitly allows it. Source/docs phases must not touch the APK workspace. Future media work must pass Auth/RLS/Storage/privacy gates first.

**Do Not:**  
Do not delete Gradle/native caches by default. Do not run APK builds during docs-only phases. Do not add real camera, gallery, upload, permission prompts, recorder, Storage, backend/API, Supabase/Auth/RLS, or package changes without explicit approval.
---

## DEC-093 - Phase 24E Private Profile And Anonymous Identity Schema Ready For SQL Planning

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** Database / Auth / Security / Process

**Decision:**  
Phase 24E makes `profiles_private` and `anonymous_identities` ready for the next narrow SQL planning slice, not for SQL implementation. `profiles_private` is the owner-only real profile table. `anonymous_identities` is the anonymous app-facing identity table. There is no global public profile view and no public/client-visible anonymous-to-real profile join.

**Reason:**  
The project needs the private profile / anonymous identity boundary to be stable before Auth/session, RLS, Storage, safe DTO/RPC, or Supabase client work can safely proceed.

**Impact:**  
The next phase may plan the first SQL migration slice for these two entities. Full Supabase/Auth/RLS/Storage/backend implementation remains NO-GO. Non-owner profile visibility must be owner-approved and connection/context-scoped through safe DTO/view/RPC boundaries.

**Do Not:**  
Do not create SQL, migrations, RLS policies, Supabase client runtime, Auth/session handling, Storage buckets/policies, backend/API logic, route data binding, package/lockfile edits, global profile browsing, user/profile search, global reveal, matching, or room/chat-room concepts from Phase 24E.

---

## DEC-094 - Phase 24F RLS Matrix Keeps Profile And Anonymous Identity Access DTO-Only

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** RLS / Private Profile / Anonymous Identity / Reveal / Security

**Decision:**  
Phase 24F makes the RLS execution matrix for `profiles_private` and `anonymous_identities` ready for the next narrow SQL planning slice, not for executable SQL/RLS implementation. Non-owner profile access is `DTO_ONLY`, never raw table read. Anonymous identity previews are `DTO_ONLY` and must not reveal owner, auth, private profile, moderation, verification, device, IP, or anonymous-to-real correlation data. A reveal grant does not authorize raw `profiles_private` access; it only permits a connection/context-scoped safe `RevealProfileDTO`. Blocked, deleted, suspended, revoked, and unsafe connection states override reveal and anonymous preview access.

**Reason:**  
ANKION's core safety model depends on strict separation between anonymous identity and real profile identity. RLS planning must make the deny path explicit before SQL or policy work begins, otherwise backend implementation can accidentally create profile browsing, global profile visibility, or anonymous-to-real correlation.

**Impact:**  
Future SQL planning may use the Phase 24F matrix and deny-test list to plan exact policies, DTO/view/RPC contracts, and rollback/test procedure. Actual SQL, migrations, Auth/session, RLS implementation, Supabase runtime, Storage, backend/API, route binding, and package/lockfile changes remain blocked until a separate implementation-readiness phase explicitly approves them.

**Do Not:**  
Do not create executable SQL, migrations, RLS policies, Supabase client runtime, Auth/session handling, Storage buckets/policies, backend/API logic, route data binding, package/lockfile edits, global profile browsing, user/profile search, global reveal, matching, or room/chat-room concepts from Phase 24F.

---

## DEC-095 - Phase 24G Auth Proves Ownership But Never Public Profile Visibility

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** Auth / Session Boundary / Private Profile / Anonymous Identity / Reveal

**Decision:**  
Phase 24G defines the Auth session boundary as documentation/planning only. Auth proves current session ownership but does not make `profiles_private` public, does not authorize profile search or user search, does not create global profile browsing, and does not bypass owner-approved connection/context-scoped reveal. The client must not choose or trust `owner_user_id`; future ownership must be derived from authenticated session through server/RLS-safe boundaries. `profiles_private` and active `anonymous_identities` provisioning must be idempotent. Logout, account switch, expired session, suspended/deleted account, block, and revoke states must clear or deny sensitive private/anonymous/reveal state.

**Reason:**  
ANKION needs Auth to establish ownership without turning Auth identity into product identity. The product remains anonymous voice-first: real profile visibility is owner-approved and scoped to the relevant connection/context only.

**Impact:**  
The next phase may plan the first narrow SQL/Auth migration order using the Phase 24G state model and provisioning rules. Actual Auth/Supabase implementation remains blocked until SDK/client runtime, SQL/migration order, rollback/test procedure, DTO/view/RPC contracts, RLS policies, service-role backend plan, and Storage/media boundary are explicitly approved.

**Do Not:**  
Do not add Auth/session runtime, login/signup UI, route guards, Supabase client implementation, package/lockfile edits, SQL/migrations, RLS policies, Storage buckets/policies, backend/API logic, route data binding, public profile search, user search, global profile browsing, global reveal, matching, or room/chat-room concepts from Phase 24G.

---

## DEC-096 - Phase 24H SQL Starts With Identity Tables, Docker And Revenue Stay Planned Only

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** SQL Planning / Docker Planning / Revenue / Monetization / Process

**Decision:**  
The next SQL script drafting slice must start with `profiles_private` and `anonymous_identities` only. Conversations, voice messages, reveal requests, profile visibility grants, Storage/media, reports, notifications, payments, and subscriptions remain future/deferred. Docker local bring-up is a future team development target but is not implemented in Phase 24H. Monetization must not sell reveal, identity, profile/user search, global profile unlock, forced replies, block bypass, consent bypass, public profile boosting, or identity-based targeting. Payment/subscription implementation remains blocked until a separate readiness phase.

**Reason:**  
ANKION's backend foundation must protect anonymous identity / real profile separation before expanding the schema or adding development infrastructure and revenue surfaces. Docker and revenue planning are useful now, but implementing them before SQL/Auth/RLS/Storage and privacy gates would add operational and product risk.

**Impact:**  
A later phase may draft the first SQL script for review, limited to the two identity tables. A separate later phase may plan Docker files and commands. A separate later phase may plan entitlement schema and payment provider boundaries. None of those are implementation-approved by Phase 24H.

**Do Not:**  
Do not create executable SQL, migration files, Dockerfile, docker-compose, `.dockerignore`, payment SDK, subscription SDK, Supabase client runtime, Auth/session handling, RLS policies, Storage buckets/policies, backend/API logic, route data binding, package/lockfile edits, global profile browsing, user/profile search, global reveal, matching, or room/chat-room concepts from Phase 24H.

---

## DEC-097 - Phase 24I Authorizes Non-Executable SQL Specification Only

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** SQL Specification / Private Profile / Anonymous Identity / Process

**Decision:**  
Phase 24I authorizes only a non-executable SQL script specification in existing Markdown docs. The first SQL script draft scope is limited to `profiles_private` and `anonymous_identities`. It does not authorize SQL files, migration files, Supabase migration files, RLS policies, Auth/session runtime, Supabase runtime, Storage, backend/API, package/lockfile edits, Docker, payment/subscription implementation, app runtime binding, or UI changes. Future ownership must derive `owner_user_id` from Auth/session and must not trust client input. Public searchable profile identifiers remain prohibited. V1 default remains one active anonymous identity per Auth user unless a later rotation/history phase changes it.

**Reason:**  
The project is ready to review the shape of the first identity SQL script, but not ready to execute migrations. Keeping the script as a non-executable Markdown specification lets the team review privacy, Auth, RLS, DTO, rollback, and dry-run assumptions before creating irreversible database artifacts.

**Impact:**  
The next phase may perform SQL Script GO/NO-GO review against the Phase 24I specification. Executable SQL/migration application remains blocked until a separate explicit GO approves exact SQL, rollback/check procedure, RLS order, DTO/view/RPC contracts, service-role plan, and environment target.

**Do Not:**  
Do not create executable SQL, migration files, Supabase migration files, RLS policies, Supabase client runtime, Auth/session handling, Storage buckets/policies, backend/API logic, Dockerfile, docker-compose, `.dockerignore`, payment SDK, subscription SDK, route data binding, package/lockfile edits, global profile browsing, user/profile search, global reveal, matching, or room/chat-room concepts from Phase 24I.

---

## DEC-098 - Phase 24J Requires Preflight Rollback Dry-Run Gate Before Migration Creation

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** SQL Migration Preflight / Rollback / Dry-Run / Security Gate

**Decision:**  
The first migration file cannot be created until the Phase 24J preflight, forbidden-field, constraint/index, dry-run/staging, rollback, dependency, and GO/NO-GO checklists pass. First migration scope remains `profiles_private` and `anonymous_identities` only. Rollback must be written, reviewed, and tested before production execution. Executable SQL/migration application remains blocked until Phase 24K explicitly approves migration creation. Service role keys and secrets remain out of client/public docs/env examples.

**Reason:**  
ANKION must not move from Markdown SQL specification to migration files without a strict privacy and rollback gate. The first identity tables are foundational; mistakes could create public profile leakage, anonymous-to-real correlation, unsafe ownership, or irreversible data risk.

**Impact:**  
Phase 24K may perform the First Migration GO/NO-GO Review. It may not be skipped. Any pressure to include deferred tables, Auth runtime, RLS implementation, Storage/media, payment, Docker, backend/API, or app binding in the first migration is a NO-GO signal.

**Do Not:**  
Do not create actual migration files, executable SQL, Supabase migration files, RLS policies, Supabase client runtime, Auth/session handling, Storage buckets/policies, backend/API logic, Dockerfile, docker-compose, `.dockerignore`, payment SDK, subscription SDK, route data binding, package/lockfile edits, global profile browsing, user/profile search, global reveal, matching, or room/chat-room concepts from Phase 24J.

---

## DEC-099 - Phase 24K Allows Next Phase Migration File Creation Only

**Status:** Approved Direction  
**Date:** 2026-06-14  
**Scope:** SQL Migration / Database / Security / Process

**Decision:**  
Phase 24K approves only that the next explicitly scoped phase may create the first narrow migration file for `profiles_private` and `anonymous_identities`. It does not approve applying executable SQL, running migrations, implementing Auth/Supabase runtime, implementing RLS policies, implementing Storage/media, or binding app routes to backend data.

**Reason:**  
Phase 24J documented the preflight, forbidden-field, dry-run/staging, rollback, dependency, and GO/NO-GO gates. Those gates are sufficient to allow migration file drafting in the next narrow phase, but not enough to safely execute SQL or expose runtime behavior before Auth/RLS/DTO and testing gates are implementation-ready.

**Impact:**  
The next phase may create one migration file only if its scope remains limited to `profiles_private` and `anonymous_identities`, excludes forbidden fields, includes rollback notes, and preserves anonymous identity / real profile separation. Runtime use remains blocked until later Auth, RLS, DTO/view/RPC, dry-run, rollback, and audit gates pass.

**Do Not:**  
Do not apply SQL, run migrations, implement Auth/session handling, create Supabase runtime binding, write executable RLS policies, create Storage buckets/policies, add backend/API logic, edit package/lockfile files, add Docker/payment implementation, bind routes to backend data, create profile search, user search, public profile browsing, global reveal, matching, or room/chat-room concepts from Phase 24K.

---

---

## DEC-100 - Phase 24L Creates First Narrow Identity Migration File Only

**Status:** Approved Direction  
**Date:** 2026-06-15  
**Scope:** SQL Migration / Database / Security / Process

**Decision:**  
Phase 24L creates exactly one migration file for `profiles_private` and `anonymous_identities` only. The migration file may define the two identity foundation tables, direct constraints, direct indexes, comments, rollback notes, and deny-by-default RLS enablement without policies. Applying SQL, running Supabase migrations, implementing Auth/Supabase runtime, creating executable RLS policies, implementing Storage/media, and binding app routes remain blocked.

**Reason:**  
Phase 24K approved creation of the first narrow migration file but did not approve execution or runtime integration. The first identity foundation must preserve strict separation between private real profile data and anonymous app-facing identity before broader schema, RLS, Auth, DTO, Storage, backend, or app integration proceeds.

**Impact:**  
Future review can inspect the concrete migration file before any application. Runtime access must remain blocked until later Auth/session, RLS policy, safe DTO/view/RPC, dry-run, rollback, forbidden-field, no-secret, and audit gates pass.

**Do Not:**  
Do not apply the migration, run Supabase migration commands, create RLS policies, add Auth/session runtime, add Supabase client runtime binding, create Storage buckets/policies, add backend/API logic, edit package/lockfile files, add Docker/payment/subscription implementation, bind routes to backend data, create profile search, user search, public profile browsing, global reveal, matching, or room/chat-room concepts from Phase 24L.

---

## DEC-101 - Phase 24M Static Audit Passes But Execution Remains Gated

**Status:** Approved Direction  
**Date:** 2026-06-15  
**Scope:** SQL Migration / Static Audit / Apply Gate / Process

**Decision:**  
Phase 24M static audit passes for the first narrow migration file, and a later phase may plan or review local/staging migration apply. Phase 24M does not apply SQL, does not run Supabase migration commands, and does not approve production migration apply. Runtime Auth/Supabase integration, executable RLS policy implementation, Storage/media, backend/API, app binding, package changes, Docker, and payment work remain blocked.

**Reason:**  
The migration file scope is limited to `profiles_private` and `anonymous_identities`, forbidden fields are absent, deferred tables are absent, rollback notes are present, RLS policies are avoided, and deny-by-default RLS enablement keeps runtime access blocked. Execution still requires an explicit target, command, rollback, dry-run, post-apply, and audit plan.

**Impact:**  
The next safe phase may prepare local/staging apply planning or review. Production apply and runtime binding require separate later approvals after local/staging checks, RLS policy planning, Auth/session ownership review, safe DTO/view/RPC review, and no-secret audit.

**Do Not:**  
Do not apply the migration, run Supabase migration commands, implement Auth/session runtime, add Supabase runtime binding, create RLS policies, implement Storage/media, add backend/API logic, change app code, edit package/lockfile files, add Docker/payment/subscription implementation, or introduce profile search, user search, public profile browsing, global reveal, or matching from Phase 24M.

---

## DEC-102 - Phase 24N Allows Next Phase Non-Production Apply Only After Environment Gate

**Status:** Approved Direction  
**Date:** 2026-06-15  
**Scope:** SQL Migration / Environment / Apply Gate / Process

**Decision:**  
Phase 24N approves only that a later explicitly scoped phase may apply the first identity migration to a local or staging non-production environment after environment, tooling, secret handling, rollback, and post-apply checks are confirmed. Phase 24N does not apply SQL, does not run Supabase commands, does not approve production apply, and does not approve runtime Auth/Supabase, executable RLS policies, Storage/media, backend/API, app binding, package, Docker, or payment work.

**Reason:**  
The Phase 24M static audit passed, but database execution still needs a controlled non-production target, Supabase CLI/tooling checks, no-secret handling, rollback verification, and post-apply checks. Production and runtime integration require separate later gates.

**Impact:**  
The next safe phase may execute a non-production local/staging apply only if it explicitly lists the target, commands, rollback path, post-apply verification, and no-secret audit. App runtime must stay disconnected even after a non-production apply succeeds.

**Do Not:**  
Do not apply the migration in Phase 24N, run Supabase commands, connect to production, create or modify `.env` files, commit tokens or secrets, implement Auth/session runtime, add Supabase runtime binding, create RLS policies, implement Storage/media, add backend/API logic, change app code, edit package/lockfile files, add Docker/payment/subscription implementation, or introduce profile search, user search, public profile browsing, global reveal, or matching from Phase 24N.

---

## DEC-103 - Phase 24P Local Identity Migration Already Applied Or Present

**Status:** Approved Direction  
**Date:** 2026-06-16  
**Scope:** SQL Migration / Local Supabase / Process / Security

**Decision:**  
Phase 24P read-only local checks found that `public.profiles_private` and `public.anonymous_identities` already exist in the local database, and `supabase_migrations.schema_migrations` records version `20260615062809`. The local migration must not be reapplied. The next local step should be migration audit, not migration apply execution.

**Reason:**  
Reapplying an already recorded identity migration can create duplicate-object failures or obscure local schema history. The local database state and migration history are aligned for the first identity foundation migration.

**Impact:**  
Local migration apply for `20260615062809` is NO-GO unless a later audit finds a real mismatch and explicitly approves a safe repair path. Production apply remains blocked. Runtime Auth/Supabase binding, executable RLS policies, Storage/media, backend/API work, app binding, package/lockfile edits, and APK work remain blocked.

**Do Not:**  
Do not run `db reset`, `db push`, `migration up`, `link`, SQL mutation/apply commands, remote Supabase commands, or service-role workflows from Phase 24P. Do not create profile search, user search, public profile browsing, global profile unlock, global reveal, or any anonymous-to-real profile leakage path.

---

## DEC-104 - Phase 24Q Local Identity Migration Audit Passes

**Status:** Approved Direction  
**Date:** 2026-06-16  
**Scope:** SQL Migration / Local Supabase / RLS Readiness / Security / Process

**Decision:**  
Phase 24Q local read-only metadata audit passes for migration `20260615062809`. The applied local `profiles_private` and `anonymous_identities` schema matches the migration file for table existence, columns, constraints, indexes, RLS enabled state, RLS policy absence, migration history, and forbidden-field absence. Do not reapply the migration. A later phase may prepare RLS policy implementation readiness, but must not implement policies without a new explicit GO.

**Reason:**  
The first identity foundation migration is present locally and aligned with the reviewed migration file. The next risk area is executable RLS policy readiness, not repeating migration execution.

**Impact:**  
Local schema audit can move forward to RLS policy readiness preparation. Production apply, Auth/Supabase runtime, executable RLS policies, Storage/media, backend/API work, app binding, package/lockfile edits, and APK work remain blocked until separately approved.

**Do Not:**  
Do not run `db reset`, `db push`, `migration up`, `migration repair`, `link`, SQL mutation/apply commands, remote Supabase commands, or service-role workflows from Phase 24Q. Do not create RLS policies, Auth runtime, Supabase runtime binding, Storage/media behavior, profile search, user search, public profile browsing, global profile unlock, global reveal, or anonymous-to-real identity leakage paths without a later explicit GO.

## DEC-105 - Phase 24R RLS Policy Readiness Is Documentation-Only

Date: 2026-06-16

Decision: Phase 24R approves readiness documentation for future RLS policy families, but does not approve executable policy implementation, migration creation, database apply, database reset, remote link, or production/staging commands.

Rationale: The existing migration enables RLS but intentionally creates no policies. Before executable policies exist, ANKION must preserve anonymous-start behavior, strict private-profile isolation, and reveal-only-with-owner-approval boundaries. The next safe step is a non-executable policy SQL draft plus deny-test matrix, not database mutation.

Constraints:
- profiles_private raw access remains owner-only.
- anonymous_identities raw access remains owner-bound and must not expose owner_user_id to public/peer surfaces.
- reveal does not grant raw profiles_private select access.
- no public profile browsing, profile search, user search, global profile unlock, or authenticated-wide table read is allowed.
- no app/Auth/Supabase runtime/Storage/backend implementation is implied by this decision.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## DEC-106 - Phase 24S Non-Executable RLS Draft Is Not Implementation Approval

Date: 2026-06-16

Decision: Phase 24S approves only a Markdown documentation draft for future RLS policy intent. It does not approve executable RLS policy implementation, migration creation, database apply, database reset, remote link, runtime Auth/Supabase integration, RPC/view/function/trigger creation, or production/staging commands.

Rationale: The first migration tables include fields that affect ownership, trust, safety, visibility, verification, rotation, deletion, and audit behavior. RLS can restrict rows, but broad owner INSERT/UPDATE policies would not safely restrict client-side column mutation by themselves. A field mutability matrix and safe server/DTO boundary must be reviewed before executable RLS work.

Required boundary:
- `profiles_private` owner SELECT may be a future candidate, but non-owner raw SELECT remains forbidden, including reveal-recipient and connection/context raw SELECT.
- `anonymous_identities` owner SELECT may be a future candidate, but public/feed/global/member-directory raw SELECT remains forbidden.
- Reveal must never become raw `profiles_private` read access.
- No profile search, user search, public profile browsing, global profile unlock, or room/member-directory model is allowed.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## DEC-107 - Phase 24T Static RLS Test Draft Does Not Approve Execution

Date: 2026-06-16

Decision: Phase 24T approves only documentation for a future deny/allow RLS test matrix and static audit of the Phase 24S non-executable policy draft. It does not approve live database tests, executable test files, RLS policy implementation, migration creation, migration apply, database reset, remote link, Auth/Supabase runtime implementation, RPC/view/function/trigger creation, or production/staging commands.

Rationale: Phase 24Q already documented the current local baseline: RLS enabled on `profiles_private` and `anonymous_identities`, with zero policies. Phase 24T should preserve that baseline and prepare future review criteria without mutating the database. The test draft protects ANKION's anonymous-start, owner-approved reveal, no-search, no-public-profile, no-member-directory, and no-monetization-bypass boundaries.

Decision boundaries:
- Future positive tests may cover owner SELECT own rows only after explicit policy implementation.
- Owner INSERT/UPDATE tests remain conditional until field mutability and safe write boundaries are approved.
- Raw reveal SELECT, authenticated-wide SELECT, public SELECT, search/browse/global profile access, feed/global raw table access, and member-directory access remain denied/forbidden.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## DEC-108 - Phase 24U Allows Only Future SELECT-Only Owner-Bound Migration Consideration

Date: 2026-06-16

Decision: Phase 24U completes a local-only preflight and does not approve migration creation or database apply in this phase. A future Phase 24V may consider creating an executable migration file only for owner-bound SELECT policy candidates on the first-migration tables, with documented least-privilege authenticated SELECT privilege handling and no apply in the same phase.

Rationale: Read-only metadata confirms RLS is enabled, no policies exist, and the first migration appears once. Current privilege metadata does not show anon/authenticated DML/read table privileges for the target tables. This supports a narrowly scoped future SELECT-only migration candidate, but not INSERT/UPDATE/DELETE or reveal/public/global access. RLS is row-level and does not solve safe column mutation.

Approved future candidate names only:
- `profiles_private_owner_select_own`
- `anonymous_identities_owner_select_own`

Rejected for first executable policy migration:
- INSERT, UPDATE, DELETE policies.
- Raw reveal SELECT.
- Connection/context raw private-profile SELECT.
- Anon/public/global/search/browse SELECT.
- Feed/member-directory raw anonymous identity SELECT.
- RPC/view/function/trigger creation.
- Auth/Supabase runtime implementation.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_PREFLIGHT_PHASE.

## DEC-109 - Phase 24V Creates Only Owner-Bound SELECT RLS Migration File

Date: 2026-06-16

Decision: Phase 24V creates one executable migration file for owner-bound SELECT RLS policies only and does not approve applying it. The next phase must statically audit the created migration before any local apply decision.

Created file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Policy scope:
- `profiles_private_owner_select_own` for authenticated owner SELECT on `public.profiles_private`.
- `anonymous_identities_owner_select_own` for authenticated owner SELECT on `public.anonymous_identities`.
- Least-privilege SELECT grants to `authenticated` for the two target tables, based on Phase 24U privilege posture.

Rejected in this phase:
- Local apply, staging apply, production apply.
- INSERT/UPDATE/DELETE policy work.
- Anon/public/global/search/browse access.
- Reveal-recipient raw private-profile SELECT.
- Connection/context raw private-profile SELECT.
- RPC/view/function/trigger/Auth/runtime/Storage/backend/app work.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_FILE_CREATION_PHASE.

## DEC-110 - Phase 24W Static Audit Passes Created Owner-Select RLS Migration

Date: 2026-06-16

Decision: Phase 24W statically approves the created owner-bound SELECT RLS migration file for a future local apply decision/preflight phase only. It does not approve applying the migration in Phase 24W and does not approve staging or production apply.

Audited file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Rationale: File-only inspection confirms the migration is limited to table-specific authenticated SELECT grants and owner-bound SELECT policies on `profiles_private` and `anonymous_identities`. It does not include anon/public access, write policies, reveal raw profile access, connection/context raw profile access, search/browse/global access, room/member-directory behavior, RPC/view/function/trigger code, or runtime implementation.

Next decision gate: a future local apply decision/preflight phase may be prepared, but apply still requires a new explicit GO.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_STATIC_AUDIT_PHASE.

## DEC-111 - Phase 24X Allows Future Local Apply Consideration Only After Explicit GO

Date: 2026-06-16

Decision: Phase 24X completes local apply preflight and does not approve applying the owner-select RLS migration in this phase. A future Phase 24Y may consider local apply only if the exact local apply command is confirmed and the user gives a new explicit GO.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Rationale: Read-only metadata preflight confirms both target tables exist, RLS remains enabled, current policy count is zero, the first migration is recorded exactly once, the owner-select migration is not yet recorded, privilege posture remains consistent with Phase 24U/24W, and forbidden columns remain absent. This supports future local apply consideration only; it does not authorize execution.

Boundaries:
- Local apply now: NO-GO.
- Staging/production apply: NO-GO.
- Runtime/Auth/Supabase/Storage/backend implementation: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.
- Reveal implementation: planning only, not implemented.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PREFLIGHT_PHASE.

## DEC-112 - Phase 24Y Local Apply Blocked by PowerShell npx Execution Policy

Date: 2026-06-16

Decision: Phase 24Y attempted the approved local-only command exactly once, but the command failed before Supabase CLI execution because PowerShell blocked `npx.ps1`. No retry, alternate command, repair, reset, or manual SQL mutation is approved in this phase.

Attempted command:
- `npx -y supabase@latest migration up --local`

Result: FAIL for Phase 24Y local apply. The next step must be a separate fix/decision phase that explicitly approves how to run the same local apply safely without using db reset, db push, migration repair, remote link, direct psql mutation, or staging/production commands.

Boundaries remain:
- Staging/production apply: NO-GO.
- Auth/Supabase runtime implementation: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.
- Reveal implementation: planning only, not implemented.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PHASE.

## DEC-113 - Phase 24Y-FIX Safe Command Path Works But Migration Apply Fails on Leading Character

Date: 2026-06-16

Decision: Phase 24Y-FIX confirms the safe `npx.cmd` invocation path works, but the local migration apply retry fails while applying the owner-select migration file. No further retry, alternate command, migration edit, repair, reset, direct psql mutation, or staging/production action is approved in this phase.

Attempted command:
- `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`

Result: FAIL. Supabase CLI connected locally and failed at statement 0 of `20260616090000_create_owner_select_rls_policies.sql` with a syntax error near an unexpected leading character before the initial comment. This points to a migration file encoding/leading character issue that needs a separate fix phase.

Boundaries remain:
- Staging/production apply: NO-GO.
- Auth/Supabase runtime implementation: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.
- Reveal implementation: planning only, not implemented.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FIX_PHASE.

## DEC-114 - Phase 24Y-FIX2 Classifies Failed Apply as Before DB Mutation

Date: 2026-06-16

Decision: Phase 24Y-FIX2 classifies the Phase 24Y-FIX failure as `MIGRATION_COMMAND_FAILED_BEFORE_DB_MUTATION`. The local DB remains pre-apply: owner-select migration version `20260616090000` is not recorded and no RLS policies exist for the target tables.

Rationale: Tooling checks show `npx.cmd` and Supabase CLI work. The failed command reached Supabase CLI and local DB but failed at statement 0 due an unexpected leading character before the first comment in the migration file. Read-only DB verification confirms migration history and policy state did not change.

Next decision gate: a later phase may plan a migration encoding/leading-character remediation or another local-only apply path. No apply, reset, repair, direct manual SQL mutation, staging/production command, or migration edit is approved by this decision.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FAILURE_CLASSIFICATION.

## DEC-115 - Phase 24Y-FIX3 Removes UTF-8 BOM From Owner-Select Migration

Date: 2026-06-16

Decision: Phase 24Y-FIX3 safely removes the leading UTF-8 BOM from `20260616090000_create_owner_select_rls_policies.sql` and re-audits the file without applying it.

Rationale: Phase 24Y-FIX2 classified the apply failure as before DB mutation, and raw byte inspection confirmed the migration began with `EF BB BF` before the initial SQL comment. Removing exactly those bytes makes the file start with the expected `-- Phase 24V` prefix without changing SQL semantics.

Boundaries remain:
- Local apply/retry: NO-GO until a new explicit GO.
- Staging/production apply: NO-GO.
- Auth/runtime/app/storage/backend implementation: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_ENCODING_FIX_PHASE.

## DEC-116 - Phase 24Y-FIX4 Applies Owner-Select RLS Migration Locally Only

Date: 2026-06-16

Decision: Phase 24Y-FIX4 successfully applies the encoding-fixed owner-select RLS migration to the local database only and passes the post-apply metadata audit. This does not approve staging, production, runtime integration, tests, or write-policy work.

Applied migration:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Local post-apply result:
- Migration version `20260616090000` is recorded exactly once.
- Policies `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own` exist locally.
- Both policies are SELECT-only, authenticated-only, owner-bound by `auth.uid() = owner_user_id`.
- Expected authenticated SELECT grants are present; anon SELECT and authenticated write grants are not introduced.

Boundaries remain:
- Staging/production apply: NO-GO.
- Auth/runtime/app/storage/backend implementation: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.
- Reveal implementation: planning only, not implemented.
- Test execution requires a separate explicit phase.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_AFTER_ENCODING_FIX.

## DEC-117 - Phase 24Z Closes Local Backend/RLS Foundation Checkpoint

Date: 2026-06-16

Decision: Phase 24Z passes the local post-apply RLS metadata audit and closes the Phase 24 backend/RLS local foundation checkpoint. The local DB has the first schema migration and the owner-bound SELECT RLS migration applied, with exactly two authenticated owner SELECT policies active on profiles_private and anonymous_identities.

Rationale:
- Migration history contains 20260615062809 and 20260616090000 exactly once.
- RLS remains enabled on both target tables.
- The only policies on the target tables are profiles_private_owner_select_own and anonymous_identities_owner_select_own.
- Both policies are SELECT-only for authenticated and use auth.uid() = owner_user_id.
- No anon/public policy, write policy, global/search/browse/reveal raw-profile policy, or WITH CHECK exists.
- authenticated has SELECT only; anon has no SELECT; authenticated has no INSERT/UPDATE/DELETE.
- Forbidden fields remain absent and migration file hashes remain unchanged.

Decision boundaries:
- Test execution now: NO-GO.
- Test data creation now: NO-GO.
- Auth/Supabase runtime: NO-GO.
- INSERT/UPDATE/DELETE policy work: NO-GO.
- Reveal implementation: PLANNING ONLY / NOT IMPLEMENTED.
- Staging/production apply: NO-GO.
- Phase 25A new chat handoff: GO.

## DEC-118 - Phase 25A Selects Future Local Transactional SQL RLS Harness Method

Date: 2026-06-16

Decision: For a later explicit Phase 25B, the preferred method is Method A: a local SQL-only transactional RLS harness using PostgreSQL role switching and Supabase JWT claim simulation. It should create only local synthetic setup data inside a transaction, simulate unauthenticated/authenticated actor contexts, assert SELECT visibility and write denials, then roll back all setup data.

Method comparison:
- Method A - Local SQL-only transactional RLS harness with role/JWT claim simulation: GO for a future explicit Phase 25B. It is local-only, reproducible, rollback-based, independent of app/Auth/runtime code, and can distinguish permission denied, RLS-filtered zero rows, and allowed one-row results.
- Method B - Local Supabase Auth/API/client-token based test with real local Auth sessions: CONDITIONAL GO only after client/Auth/runtime boundaries are approved. It is closer to runtime behavior but creates extra implementation and package/env surface.
- Method C - Manual Supabase Studio / SQL editor test: NO-GO as the primary method because it is not reliably reproducible and has higher human-error risk. It may be considered only as a supplementary read-only aid later.
- Method D - pgTAP or executable test files: CONDITIONAL GO only in a separately approved phase. Phase 25A creates no executable tests and adds no dependencies.
- Method E - Staging/production/remote test: NO-GO.

Decision boundaries:
- Phase 25A is planning/preflight only.
- No test execution, test data, synthetic users, SQL harness file, migration, or DB mutation is approved.
- Future tests must not SELECT from auth.users directly.
- service_role/admin/postgres context must not be treated as a passing client access assertion; it may only be considered for tightly scoped local setup inside rollback if explicitly approved later.

## DEC-119 - Phase 25B Locks Future Local Transactional RLS Harness Design

Date: 2026-06-16

Decision: Phase 25B locks the future RLS test approach as a local SQL transactional harness design, but defers file creation and execution to a later explicit phase. The harness should simulate Supabase client contexts with local role switching and JWT claim settings because auth.uid() metadata resolves first from request.jwt.claim.sub and then from request.jwt.claims -> sub.

Metadata basis:
- anon, authenticated, service_role, and postgres roles exist locally.
- auth.uid() is STABLE SQL and derives the returned uuid from request.jwt.claim.sub or request.jwt.claims JSON sub.
- profiles_private and anonymous_identities policies remain SELECT-only for authenticated with auth.uid() = owner_user_id.
- authenticated has SELECT only; anon has no SELECT; authenticated has no INSERT/UPDATE/DELETE.
- profiles_private.owner_user_id and anonymous_identities.owner_user_id reference auth.users(id) ON DELETE CASCADE by pg_constraint metadata.

Design boundaries:
- Future harness must use BEGIN/ROLLBACK and deterministic local-only fake UUIDs.
- Future synthetic auth parent rows and target rows may be created only inside the rollback transaction and only after explicit GO.
- service_role/admin/postgres may not be a passing client actor. It can only be setup-only context if explicitly approved.
- Future results must separate permission denied, RLS-filtered zero rows, and allowed one row.
- Phase 25B created no harness file and ran no tests.

## DEC-120 - Phase 25C Creates Guarded Rollback-Only Local RLS Harness Draft

Date: 2026-06-16

Decision: Create one guarded local SQL transactional RLS harness draft at supabase/tests/rls/phase25c_owner_select_rls_transactional_harness.sql for future explicit Phase 25D execution review. The file is outside supabase/migrations and is not a migration.

Decision details:
- The harness is guarded by default and raises unless ankion.phase25d_explicit_go is set to true in a future approved phase.
- The enabling SET line remains commented in Phase 25C.
- The harness uses a rollback-only transaction model and contains no COMMIT token.
- The harness uses deterministic fake local-only UUIDs and no real user/profile/media/storage data.
- The harness includes future transaction-contained synthetic auth parent row setup because target owner_user_id columns reference auth.users(id).
- The harness distinguishes permission denied, RLS-filtered zero rows, and allowed one targeted own row.
- Phase 25C does not execute the harness and creates no live test data or users.

## DEC-121 - Phase 25D Locks Phase 25E Harness Execution Runbook Without Execution

Date: 2026-06-16

Decision: Phase 25D approves the Phase 25C harness for future explicit Phase 25E execution readiness, but does not execute it. The canonical harness remains unchanged and guarded. Phase 25E must supply explicit GO at execution/session time rather than permanently uncommenting or weakening the guard in the file.

Decision basis:
- Harness exists outside supabase/migrations and has SHA256 FB5484743C75359F74F03B5462CD67870896B9E722E03E807C81E725DC03F778.
- Guard exists and the enabling SET line remains commented out.
- BEGIN/ROLLBACK are present and no COMMIT token exists.
- Forbidden policy/role/extension/reset/repair/staging/production/remote logic is absent.
- Actor/assertion coverage remains complete for the Phase 25A/25B/25C matrix.
- Local metadata still matches the owner-bound SELECT RLS checkpoint.

Phase 25E constraints:
- Explicit GO required.
- Local supabase_db_ankion only.
- Canonical harness unchanged.
- Run-time/session-level guard setting only.
- Capture output summary.
- Verify rollback/no persistent data without inspecting real protected/user row data.
- No staging, production, remote, app/Auth/runtime, storage/backend, reveal, RPC/view/function/trigger work.

## DEC-122 - Phase 25E Confirms Local Owner-Select RLS Harness Passes With Rollback

Date: 2026-06-16

Decision: The guarded local SQL transactional RLS harness may be recorded as executed successfully against local supabase_db_ankion for the current owner-bound SELECT policy scope. All assertions passed and rollback verification confirmed no persistent fake rows.

Decision basis:
- Canonical harness hash remained FB5484743C75359F74F03B5462CD67870896B9E722E03E807C81E725DC03F778 before and after execution.
- GO was supplied at session time only; the canonical harness remained unchanged.
- Execution target was local supabase_db_ankion only.
- 24/24 assertions passed.
- Permission-denied, RLS zero-row, and owner allowed-one-row result classes were all observed as expected.
- Fake auth.users, profiles_private, and anonymous_identities rows remaining after rollback: 0.
- Post-execution policy, grant, RLS, migration-history, migration hash, and harness hash checks remained aligned.

Boundary:
- This does not approve staging, production, remote execution, app/Auth/runtime integration, storage/backend work, reveal implementation, RPC/view/function/trigger work, or write-policy expansion.
