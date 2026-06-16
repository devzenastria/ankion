# ARCHITECTURE.md

## Purpose
This document defines the high-level architecture of ankion.

It explains how the approved product flows, UI/UX decisions, backend behavior, database model, RLS, storage, and Test Lab must work together.

This is not an implementation file.

## Status
Draft architecture direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md
- docs/testing/TEST_LAB.md

## Product Architecture Summary
ankion is a dark-first, premium, mobile-native, voice-first anonymous social discovery app.

The product architecture is built around these core ideas:

- Chat is the central interaction hub.
- Discover and Feed are entry points into Chat.
- Voice messages are sent from Chat.
- Real profile is hidden before permission.
- Profile reveal requires owner decision and active visibility grant.
- Block overrides all visibility and interaction access.
- Instant media is visible, but real identity remains hidden.
- Storage must not leak identity.
- RLS is a critical security boundary.
- Test Lab must visually verify key flows.

## Approved Technical Direction
The intended technical direction is:

- Language: TypeScript
- Monorepo: pnpm workspace + Turborepo
- Web: Next.js App Router
- Mobile: Expo + React Native
- Backend/Auth/DB/Storage: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Storage: Supabase Storage private buckets
- Security: RLS + safe RPC/views + storage policies
- Test Lab: localhost-only visual QA area in web app

Do not implement these yet.
This document only records the architecture direction.

## High-Level Layers

### 1. Apps Layer
Contains user-facing applications.

Future structure:
- apps/web
- apps/mobile

Responsibilities:
- Render screens
- Handle navigation
- Call safe backend APIs/RPCs
- Show safe DTOs
- Never depend on raw sensitive database rows
- Never expose hidden profile data

Apps must not:
- Decide real profile visibility alone
- Access raw storage paths
- Expose sender_user_id or owner_user_id
- Bypass RLS or RPC safety checks

### 2. Shared Packages Layer
Contains shared types, constants, validators, and UI primitives.

Future structure:
- packages/shared
- packages/ui
- packages/config

Responsibilities:
- Shared TypeScript types
- Shared product constants
- Shared validation schemas
- Shared UI components
- Shared design tokens

Must not contain:
- Supabase service role logic
- Raw RLS bypass logic
- Private backend secrets
- Product-breaking shortcuts

### 3. Backend / Supabase Layer
Supabase provides:

- Auth
- Postgres database
- RLS policies
- RPC functions
- Edge Functions if needed
- Storage
- Signed URL generation
- Realtime/future notifications

Backend must enforce:
- voice duration limit
- daily voice send limit
- same-recipient voice limit
- reveal request state
- visibility grant logic
- block override
- storage access control
- safe frontend responses

### 4. Storage Layer
Storage handles voice, photo, video, and future profile media.

Rules:
- Media must not be public by default.
- Signed URLs must be short-lived where needed.
- Raw storage path must never return to frontend.
- Storage path must not expose sender_user_id or owner_user_id.
- Block must prevent media access where applicable.

### 5. Security / RLS Layer
RLS is a critical security boundary.

RLS and safe RPC/views must protect:
- sender_user_id
- owner_user_id
- raw_storage_path
- profile_visibility_grants
- reveal_requests
- blocks
- reports
- instant content ownership

Frontend must receive safe DTOs instead of raw database rows.

### 6. Test Lab Layer
Test Lab is a localhost-only visual QA area.

Responsibilities:
- Verify product flows visually
- Verify RLS leak scenarios
- Verify storage/signed URL safety
- Verify reveal/grant/block behavior
- Verify Discover-to-Chat and Feed-to-Detail-to-Chat flows
- Verify voice limits
- Never be enabled in production

## Core Domain Areas

### 1. Auth and Profile
Users must create a real account and complete a real profile.

Profile is real but hidden by default.

Architecture implication:
- Auth user and profile ownership must exist.
- Profile display must depend on visibility rules.
- Real profile DTO must be returned only after valid permission.

### 2. Discover
Discover shows blurred profile cards.

Architecture implication:
- Discover must return safe public/anonymous preview data.
- Discover must not return real identity fields before reveal.
- Discover profile tap must create/find Chat safely.

### 3. Feed / Instant Media
Feed shows 3-column photo/video/audio grid.

Architecture implication:
- Feed must return safe instant post DTOs.
- Instant content owner identity must remain hidden.
- Feed tile opens Instant Content Detail.
- Detail can lead to Chat.
- Instant profile is separate from real profile.

### 4. Chat
Chat is the core interaction hub.

Architecture implication:
- Chat/thread model must support anonymous context.
- Chat can originate from Discover profile or Instant Content Detail.
- Voice messages belong to Chat context.
- Reveal request belongs to Chat context.
- Safety actions are available from Chat.

### 5. Voice Messages
Voice is the primary interaction.

Architecture implication:
- Voice upload must use private storage.
- Voice message creation must enforce duration and limits server-side.
- Voice message playback must use safe signed URL logic.
- Voice DTOs must not expose storage path or sender identity.

Rules:
- Max duration: 21 seconds
- Daily send limit: 7
- Same-recipient daily limit: 3

### 6. Reveal Requests
Reveal request happens inside Chat.

Architecture implication:
- Request state must be separate from visibility.
- Approved request alone must not show profile.
- Visibility requires active grant.
- Block overrides grant.

Correct logic:
approved request + active profile visibility grant + no active block = profile visible

### 7. Profile Visibility Grants
Visibility grant is the actual permission record.

Architecture implication:
- Grant must be scoped to viewer/owner relationship.
- Grant must not reveal profile globally.
- Grant must be checked before profile DTO is returned.
- Grant must stop working if block exists.

### 8. Block / Report
Block and report are required MVP safety basics.

Architecture implication:
- Block must disable new voice messages.
- Block must disable reveal requests.
- Block must disable profile view.
- Block must disable signed URL access where applicable.
- Report must not leak identities to unauthorized users.

## Safe DTO Principle
Frontend must receive safe DTOs.

Wrong:
Frontend reads raw database rows and hides fields in UI.

Correct:
Backend/RPC/view returns only safe fields for the current user and current relationship.

Safe DTO examples:
- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view

Sensitive fields must not be included unless explicitly safe:
- sender_user_id
- owner_user_id
- raw_storage_path
- auth_user_id
- private moderation fields
- hidden profile fields before grant

## UI Decisions That Affect Backend

### No Recipient Picker
Because there is no recipient selection screen:

Backend must support:
- create/find chat from Discover profile tap
- create/find chat from Instant Content Detail
- send voice message inside chat context

### Feed Leads to Detail, Then Chat
Because Feed tile opens content detail first:

Backend must support:
- safe feed listing
- safe content detail
- safe chat creation from content detail
- owner identity protection

### Chat Is the Hub
Because Chat is central:

Backend must support:
- voice send
- reveal request
- owner decision
- profile visibility state
- block/report entry points
- safe signed URL generation

### Profile Reveal Is Permission-Based
Because profile is hidden by default:

Backend must support:
- reveal requests
- visibility grants
- grant checks
- block override
- safe profile DTOs

### Test Lab Is Required
Because risky flows must be visually checked:

Backend and frontend must expose development-only test flows that can verify:
- hidden profile
- reveal grant
- block override
- voice limits
- storage safety
- RLS leak prevention

## Suggested Future Monorepo Boundaries

Future structure:

apps/
  web/
  mobile/

packages/
  shared/
  ui/
  config/

supabase/
  migrations/
  policies/
  functions/
  seed/
  storage/

dev/
  test-lab/

docs/
  product/
  design/
  architecture/
  database/
  security/
  testing/
  handoff/

Responsibilities:
- apps/web: web shell, future Test Lab, possible admin/dev tools
- apps/mobile: main mobile app
- packages/shared: shared types, constants, validation
- packages/ui: shared UI primitives/components
- packages/config: shared lint/build/config later
- supabase: migrations, policies, functions, seed, storage docs
- docs: product and architecture source of truth
- dev/test-lab: localhost visual QA plan

## Do Not Implement Yet
This architecture document does not authorize implementation.

Before implementation:
- TECH_STACK_DECISION.md must be approved.
- MONOREPO_STRUCTURE.md must be approved.
- DATABASE.md must be approved.
- RLS_POLICIES.md must be approved.
- STORAGE.md must be approved.
- TEST_LAB.md must be approved.
- Codex tasks must remain small and isolated.

## Architecture Risks

### Risk 1: UI hides sensitive fields instead of backend preventing access
Mitigation:
Use safe DTOs, RLS, RPC/views, and storage policies.

### Risk 2: Reveal approval directly opens profile
Mitigation:
Use active visibility grant and block check.

### Risk 3: Feed leaks owner identity
Mitigation:
Instant profile layer must be separate from real profile.

### Risk 4: Voice upload leaks sender identity through path
Mitigation:
Use safe storage paths and signed URLs.

### Risk 5: Codex overbuilds
Mitigation:
Small isolated tasks only. Documentation before implementation.

### Risk 6: App becomes generic chat or dating app
Mitigation:
Preserve voice-first, dark-first, chat-centered, permission-based reveal rules.

## Architecture Success Criteria

Architecture is successful if:

1. Discover can lead to Chat without recipient picker.
2. Feed can lead to Detail, then Chat.
3. Voice messages are created inside Chat.
4. Voice limits are enforced server-side.
5. Real profile stays hidden before permission.
6. Reveal requires active visibility grant.
7. Block overrides grant and media access.
8. Instant content does not reveal real profile.
9. Frontend receives safe DTOs only.
10. Storage paths do not leak identity.
11. RLS protects sensitive tables.
12. Test Lab can verify critical product/security flows.
13. Codex can implement the project in small isolated tasks.

## Notes
Architecture must serve the approved product flow.

If a technical shortcut weakens anonymity, voice-first interaction, permission-based reveal, or safe storage/RLS behavior, it must not be used.
