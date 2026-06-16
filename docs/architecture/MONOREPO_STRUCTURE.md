# MONOREPO_STRUCTURE.md

## Purpose
This document defines the approved monorepo structure for ankion.

It explains where future code, documentation, database assets, Supabase assets, shared packages, UI components, and Test Lab files should live.

This document exists to prevent architecture drift, file confusion, and Codex overbuilding.

## Status
Approved monorepo structure direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/architecture/ARCHITECTURE.md
- docs/architecture/TECH_STACK_DECISION.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

## Approved Root Structure

Approved future root structure:

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

docs/
  product/
  design/
  architecture/
  database/
  security/
  testing/
  handoff/

dev/
  test-lab/

scripts/

Root documentation files:
- README.md
- AGENTS.md
- PROJECT_STATUS.md
- DECISIONS.md
- CHANGELOG.md
- PROMPTS.md
- FILE_MAP.md

## High-Level Rule
Every folder must have a clear responsibility.

Do not mix:
- UI with backend security logic
- product decisions with implementation code
- RLS policy definitions with UI components
- database schema with design prompts
- Test Lab code with production app logic
- Codex planning with runtime application code

## apps/

The apps folder will contain user-facing applications.

Future structure:

apps/
  web/
  mobile/

### apps/web

Purpose:
Web application shell and future localhost Test Lab host.

Future responsibilities:
- Next.js App Router web shell
- Localhost-only Test Lab route
- Development QA screens
- Possible future lightweight web/admin tools
- Visual validation of risky flows

Must not contain:
- mobile-specific logic
- Supabase service role secrets
- raw RLS bypass logic
- production-exposed Test Lab
- uncontrolled backend logic

Important:
Test Lab must never be enabled in production.

### apps/mobile

Purpose:
Main mobile app.

Future responsibilities:
- Expo + React Native app
- Chat / Feed / Discover / Profile navigation
- Voice-first Chat Room
- Feed grid
- Discover cards
- Profile reveal UI
- Mobile media and voice recording UX

Must follow:
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md

Must not contain:
- raw database table assumptions
- direct sensitive field exposure
- business rules that should be enforced backend-side only
- hardcoded bypasses for reveal, block, or storage access

## packages/

The packages folder contains shared code that can be reused across apps.

Future structure:

packages/
  shared/
  ui/
  config/

### packages/shared

Purpose:
Shared non-visual logic.

Future responsibilities:
- TypeScript types
- Safe DTO types
- Product constants
- Shared validation schemas
- Shared route/action names
- Voice limit constants
- Reveal state constants
- Shared utility functions

Examples:
- MAX_VOICE_SECONDS = 21
- DAILY_VOICE_LIMIT = 7
- SAME_RECIPIENT_DAILY_LIMIT = 3
- Reveal state names
- Safe DTO type definitions

Must not contain:
- UI components
- Supabase service role logic
- private secrets
- RLS bypass logic
- app-specific navigation code

### packages/ui

Purpose:
Shared UI primitives and design system components.

Future responsibilities:
- Buttons
- Cards
- Voice waveform components
- Blurred profile card primitives
- Chat bubble primitives
- Bottom tab primitives
- Modal/sheet primitives
- Design token usage

Must follow:
- dark-first design
- premium mobile-native UI
- voice-first component hierarchy
- design token discipline

Must not contain:
- database queries
- Supabase security logic
- RLS policies
- feature-specific business logic
- storage access logic

### packages/config

Purpose:
Shared project configuration later.

Future responsibilities:
- shared TypeScript config
- shared lint config
- shared formatting config
- shared build config

Must not contain:
- app features
- product logic
- database schema
- secrets

## supabase/

The supabase folder contains database, RLS, function, seed, and storage-related assets.

Future structure:

supabase/
  migrations/
  policies/
  functions/
  seed/
  storage/

### supabase/migrations

Purpose:
Database schema migrations.

Future responsibilities:
- table creation
- indexes
- constraints
- enum definitions if used
- safe schema evolution

Must not contain:
- UI logic
- product copy
- frontend components
- unrelated scripts

Important:
Migrations should not be written before DATABASE.md and TABLES.md are approved.

### supabase/policies

Purpose:
RLS policy definitions and policy documentation.

Future responsibilities:
- table-by-table RLS policies
- SELECT / INSERT / UPDATE / DELETE rules
- block override rules
- safe visibility rules
- storage access policies if needed

Must follow:
- docs/security/RLS_POLICIES.md
- docs/security/SECURITY_RULES.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md

Important:
RLS policy matrix is a critical artifact and must not be skipped.

### supabase/functions

Purpose:
Future Supabase Edge Functions or RPC-related implementation.

Future responsibilities:
- safe server-side actions if needed
- signed URL generation logic if not handled directly elsewhere
- sensitive operations that must not live in frontend
- server-controlled workflows

Must not contain:
- frontend UI
- unnecessary complex backend if Supabase RPC is enough
- service role exposure to client

### supabase/seed

Purpose:
Local development and test data.

Future responsibilities:
- safe fake users
- safe fake profiles
- fake chat threads
- fake voice messages
- fake instant posts
- Test Lab seed data

Must not contain:
- real user data
- production secrets
- personal/private media

### supabase/storage

Purpose:
Storage planning and future bucket/policy assets.

Future responsibilities:
- private bucket planning
- storage path strategy
- signed URL rules
- media access policy notes

Must follow:
- docs/security/STORAGE.md

## docs/

The docs folder is the source of truth before implementation.

Structure:

docs/
  product/
  design/
  architecture/
  database/
  security/
  testing/
  handoff/

### docs/product

Purpose:
Product behavior and MVP rules.

Contains:
- MVP_CORE.md
- APP_USAGE_FLOW.md
- USER_JOURNEY.md
- REVEAL_FLOW.md
- INSTANT_FLOW.md
- CHAT_FLOW.md

Rules:
- Defines what the product does.
- Does not contain implementation code.
- Controls MVP scope.
- Prevents drift into dating app, generic chat app, or generic media feed.

### docs/design

Purpose:
UI/UX design source of truth.

Contains:
- ANKION_UI_UX_MASTER_PROMPT.md
- ANKION_FINAL_UI_GENERATION_PROMPT.md
- DESIGN_TOKENS.md
- COMPONENT_SYSTEM.md
- SCREEN_MAP.md
- UI_QUALITY_CHECKLIST.md

Rules:
- Defines visual direction.
- Defines screen and component behavior.
- Does not override product/security rules.
- Must remain aligned with product docs.

### docs/architecture

Purpose:
Technical architecture decisions and boundaries.

Contains:
- ARCHITECTURE.md
- TECH_STACK_DECISION.md
- IMPLEMENTATION_ROADMAP.md
- MONOREPO_STRUCTURE.md

Rules:
- Explains how product maps to technical layers.
- Does not implement code.
- Does not create package setup.
- Controls future Codex task boundaries.

### docs/database

Purpose:
Database planning.

Contains:
- DATABASE.md
- TABLES.md
- RELATIONSHIPS.md

Rules:
- Defines tables before migrations.
- Defines relationships before RLS.
- Must reflect product flows.
- Must not be skipped before implementation.

### docs/security

Purpose:
Privacy, RLS, storage, and risk model.

Contains:
- RLS_POLICIES.md
- SECURITY_RULES.md
- STORAGE.md
- RISK_CONTROL.md
- PRIVACY_MODEL.md

Rules:
- Protects anonymity.
- Protects real profile visibility.
- Protects storage paths.
- Defines block override.
- Defines no identity leak expectations.

### docs/testing

Purpose:
Testing and local QA planning.

Contains:
- TEST_LAB.md
- TEST_SCENARIOS.md
- RLS_LEAK_TESTS.md
- QA_CHECKLIST.md

Rules:
- Test Lab is localhost-only.
- Test Lab must not be production-enabled.
- Critical flows must have visual PASS/FAIL checks.

### docs/handoff

Purpose:
Continuity and task handoff.

Contains:
- CODEX_TASKS.md
- NEW_CHAT_CONTINUATION_PROMPT.md

Rules:
- Codex tasks must be small.
- New chats must preserve project continuity.
- Do not store implementation shortcuts here.

## dev/

Future structure:

dev/
  test-lab/

Purpose:
Development-only Test Lab planning and future local QA tools.

Important:
The actual Test Lab implementation may later live in apps/web route, but dev/test-lab can hold planning, scenarios, fixtures, and local QA references.

Must not:
- be exposed in production
- contain production secrets
- bypass security rules

## scripts/

Purpose:
Future helper scripts.

Potential future uses:
- validation scripts
- local setup scripts
- documentation checks
- migration helper scripts

Must not:
- run destructive operations by default
- contain secrets
- bypass RLS/security controls
- be created before needed

## Root Files

### README.md
Project overview, current phase, and warning against early implementation.

### AGENTS.md
Rules for ChatGPT, Codex, and task responsibilities.

### PROJECT_STATUS.md
Current project state.

Must be updated after each meaningful task.

### DECISIONS.md
Major product, architecture, security, and implementation decisions.

### CHANGELOG.md
Project changes over time.

### PROMPTS.md
Important prompts used in the project.

### FILE_MAP.md
Map of files, purposes, ownership, boundaries, and status.

Must be updated when new files are added or major docs are filled.

## Codex File Placement Rules

Codex must follow these rules:

1. Read relevant docs before modifying files.
2. Create a small task plan before changes.
3. Modify only files explicitly requested.
4. Do not create unrelated files.
5. Do not install packages unless explicitly approved.
6. Do not initialize frameworks unless explicitly approved.
7. Update FILE_MAP.md when adding files.
8. Update PROJECT_STATUS.md after meaningful task completion.
9. Do not build the entire app in one task.
10. Do not move product/security rules into UI-only files.

## Future Implementation Boundaries

### UI implementation
Future UI implementation should live under:
- apps/mobile
- packages/ui
- packages/shared where needed

It must follow:
- docs/design/*
- docs/product/*
- docs/architecture/*

### Backend/database implementation
Future backend/database assets should live under:
- supabase/migrations
- supabase/policies
- supabase/functions
- supabase/storage

It must follow:
- docs/database/*
- docs/security/*
- docs/product/*

### Test Lab implementation
Future Test Lab implementation should likely live under:
- apps/web
- dev/test-lab for planning/support

It must follow:
- docs/testing/*
- docs/security/*
- docs/product/*

## Anti-Drift Rules

Do not allow:
- recipient picker screen
- public profile browsing before permission
- dating-style swipe/match flow
- Feed opening real profile directly
- Chat becoming text-first
- instant profile becoming real profile
- coin revealing real profile
- storage paths leaking identity
- frontend deciding profile visibility alone
- Test Lab enabled in production

## Future First Setup Task
When implementation is approved, the first setup task should be small.

Recommended first implementation task:
- create monorepo package setup only

Potential files later:
- package.json
- pnpm-workspace.yaml
- turbo.json
- base tsconfig

But do not create them yet.

## Success Criteria

Monorepo structure is successful if:

1. Every folder has a clear responsibility.
2. UI, product, architecture, database, security, and testing docs are separated.
3. Future Codex tasks can target one folder/file safely.
4. Sensitive backend logic does not leak into UI packages.
5. Product rules remain easy to find.
6. RLS/storage/security docs guide implementation before code.
7. Test Lab has a clear future location.
8. FILE_MAP.md can track ownership cleanly.
9. The project can scale without becoming tangled.

## Notes
The monorepo structure must serve the product.

If a folder or package does not directly support the approved ankion MVP, it should not be added yet.
