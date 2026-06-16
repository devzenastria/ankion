# TECH_STACK_DECISION.md

## Purpose
This document records the approved technology stack direction for ankion.

The goal is to choose a stack that supports:
- mobile-first product development
- dark-first premium UI
- voice-first chat
- Discover / Feed / Chat flows
- permission-based profile reveal
- Supabase RLS and storage security
- Codex-friendly small isolated tasks
- future web Test Lab

## Status
Approved stack direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/architecture/ARCHITECTURE.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

## Approved Stack Summary

Approved direction:

- Language: TypeScript
- Monorepo: pnpm workspace + Turborepo
- Web app: Next.js App Router
- Mobile app: Expo + React Native
- Backend/Auth/DB/Storage: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Storage: Supabase Storage with private buckets
- Security: RLS + safe RPC/views + storage policies
- Test Lab: localhost-only visual QA area in web app
- Styling direction: shared design tokens, dark-first UI, mobile-native components

## Why TypeScript
TypeScript is selected because ankion will share logic across web, mobile, shared packages, validation schemas, constants, and future Supabase client types.

Benefits:
- safer shared types
- clearer DTO contracts
- better Codex task boundaries
- less runtime ambiguity
- easier reuse between web and mobile

Decision:
Use TypeScript as the primary project language.

## Why pnpm Workspace + Turborepo
ankion needs a structured monorepo.

Reasons:
- apps/web and apps/mobile can live together
- packages/shared can hold shared types/constants
- packages/ui can hold reusable components
- packages/config can hold shared project config later
- Codex tasks can be isolated by folder
- FILE_MAP.md can track ownership clearly

Decision:
Use pnpm workspace + Turborepo when implementation begins.

Do not initialize yet.

## Why Next.js App Router for Web
The web app will support:
- future web shell
- future localhost Test Lab
- possible admin/dev-only QA screens
- documentation-adjacent visual checks
- safe preview/testing flows

Decision:
Use Next.js App Router for apps/web when implementation begins.

Important:
The web app is not the main consumer product at first.
The mobile app is the main product.
The web app is important for Test Lab and controlled QA.

## Why Expo + React Native for Mobile
ankion is mobile-native first.

The mobile app must support:
- bottom tab navigation
- chat-first UX
- voice recording
- media feed
- native-feeling gestures
- dark-first premium UI
- iOS/Android delivery path

Decision:
Use Expo + React Native for apps/mobile when implementation begins.

Important:
Mobile UX must follow:
- Chat / Feed / Discover / Profile tab structure
- no recipient picker
- voice-first Chat
- profile reveal only with permission
- top-right chat bubble on profile

## Why Supabase
Supabase is selected as the backend foundation because ankion needs:
- Auth
- Postgres
- RLS
- Storage
- signed URLs
- RPC/views
- possible Edge Functions
- future Realtime/notifications

Decision:
Use Supabase as backend/auth/database/storage foundation.

Important:
Frontend must not rely on raw table reads for sensitive flows.
Safe RPC/views and DTOs must protect identity fields.

## Database Direction
Database will be Supabase Postgres.

Future database docs will define exact tables, but expected domains include:
- profiles
- anonymous chat/thread model
- voice messages
- voice limits
- reveal requests
- profile visibility grants
- instant profiles
- instant posts
- instant follows
- blocks
- reports
- notifications
- file audit logs

Decision:
Database schema will be designed after product/architecture docs are approved.

Do not create migrations yet.

## RLS Direction
RLS is mandatory.

RLS must protect:
- sender_user_id
- owner_user_id
- raw_storage_path
- profile_visibility_grants
- reveal_requests
- blocks
- reports
- instant content ownership

Decision:
Every sensitive table must have RLS planned before implementation.

Important:
RLS policy matrix is a critical artifact.
Do not skip it.

## Storage Direction
Storage must support:
- voice messages
- instant audio
- instant images
- instant videos
- future profile media

Rules:
- private buckets by default
- short-lived signed URLs
- no raw storage path returned to frontend
- no sender_user_id or owner_user_id in unsafe paths
- block must disable signed URL access where applicable

Decision:
Use Supabase private storage + signed URLs.

Do not create buckets yet.

## Test Lab Direction
Test Lab will be a localhost-only visual QA area.

Expected location later:
- apps/web

Expected route later:
- /dev/test-lab

Test Lab verifies:
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice limits
- hidden profile before reveal
- reveal grant behavior
- block override
- RLS leak tests
- signed URL safety

Decision:
Use web app for Test Lab when implementation begins.

Important:
Test Lab must never be enabled in production.

## UI/UX Stack Direction
UI must follow:
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

Design rules:
- dark-first
- premium
- cinematic
- mobile-native
- chat-centered
- voice-first
- no dating-app patterns
- no recipient picker
- 3-column Feed
- top-right profile chat bubble
- permission-based reveal

Decision:
Implementation must not deviate from approved UI/UX docs.

## Backend Impact of UI Decisions

### No Recipient Picker
Backend must support:
- create/find Chat from Discover profile tap
- create/find Chat from Instant Content Detail
- voice message creation inside Chat context

### Feed Uses Content Detail
Backend must support:
- safe Feed tile listing
- safe Instant Content Detail
- Chat CTA from content detail
- owner identity protection

### Chat Is Main Hub
Backend must support:
- voice messages
- reveal requests
- reveal decisions
- hidden/revealed states
- safety actions
- safe signed media URLs

### Profile Reveal Is Permission-Based
Backend must enforce:
- request state is not visibility
- active visibility grant is required
- block overrides grant
- safe profile DTO only after valid permission

## Not Selected for MVP

Do not use in MVP:
- full custom backend
- separate native iOS and Android codebases
- Firebase as main backend
- Flutter
- Python backend for core app
- complex admin framework
- complex payment stack
- AI/ML services
- live streaming infrastructure
- heavy recommendation engine
- full written-chat-first stack

Reason:
These increase complexity and move the project away from the approved MVP core.

## Implementation Gate
This document does not allow implementation yet.

Before implementation, approve:
- MONOREPO_STRUCTURE.md
- DATABASE.md
- TABLES.md
- RLS_POLICIES.md
- STORAGE.md
- TEST_LAB.md
- CODEX_TASKS.md

Only after those are approved should Codex receive small setup tasks.

## Codex Rules for Future Stack Setup
When setup begins, Codex must:
- perform one small task at a time
- create a short task plan first
- update FILE_MAP.md when adding files
- update PROJECT_STATUS.md after task completion
- not install unnecessary packages
- not scaffold features before docs are approved
- not build the entire app in one task

First future setup task should likely be:
- create package manager / monorepo base only

Not:
- build full app

## Risks

### Risk 1: Starting implementation before docs are ready
Mitigation:
Do not create package.json or framework files until docs are approved.

### Risk 2: UI and backend drift apart
Mitigation:
Use design docs as UI source and architecture/database docs as backend source.

### Risk 3: RLS added too late
Mitigation:
Design RLS policy matrix before migrations are implemented.

### Risk 4: Storage leaks identity
Mitigation:
Private storage, safe paths, signed URLs, no raw path to frontend.

### Risk 5: Codex overbuilds
Mitigation:
Small isolated tasks only.

## Success Criteria
The technology decision is successful if:

1. Web and mobile can share types and design tokens.
2. Mobile app remains the main product.
3. Web can host Test Lab.
4. Supabase supports Auth, DB, RLS, Storage, and RPC needs.
5. Voice-first Chat can be implemented cleanly.
6. Discover / Feed / Chat flows remain aligned.
7. RLS and storage privacy remain central.
8. Codex can work in small isolated tasks.
9. Implementation does not start before required docs are approved.

## Notes
The selected stack is intended to reduce risk, not maximize complexity.

If a tool or package does not directly support the approved MVP core, it should be deferred.
