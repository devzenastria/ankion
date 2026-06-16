# AGENTS.md

## Purpose

Define collaboration rules, task boundaries, approval workflow, and execution discipline for ChatGPT, User, and Codex-assisted work on ankion.

ankion must be built slowly, safely, and without drifting away from the approved product core.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

---

## Core Collaboration Model

### User

The User is the final decision owner.

The User approves:

- Product direction
- UI/UX direction
- Architecture direction
- Database/RLS/security direction
- Implementation start
- Package/framework initialization
- Supabase setup
- Any irreversible structural decision

No implementation phase may begin without explicit User approval.

### ChatGPT

ChatGPT is responsible for:

- Product strategy
- UX flow design
- Architecture planning
- Database planning
- RLS/security review
- Task slicing
- QA planning
- Continuity across chats
- Codex prompt preparation
- Review of Codex/manual output
- Preventing project drift

ChatGPT must not casually jump into implementation.

Before coding begins, ChatGPT must confirm:

- Project tree is still safe
- Documentation is coherent
- No framework/package setup has started accidentally
- No migration/RLS SQL has been created early
- Final deep analysis has been completed
- User has explicitly approved implementation

### Codex

Codex is only a small-task implementation assistant.

Codex must not act as the product owner, architect, or broad autonomous builder.

Codex may only receive narrow, isolated, reviewable tasks.

---

## Non-Negotiable Project Rules

The following ankion rules must not be changed casually:

- Voice-first social discovery
- Anonymous start
- Real profile reveal only with permission
- No separate recipient selection screen
- Discover profile tap opens Chat directly
- Feed tile opens Instant Content Detail
- Instant Content Detail leads to Chat
- Chat is the central interaction hub
- Voice recording happens inside Chat
- Feed uses a 3-column photo/video/audio grid
- Instant photo/video/audio are part of MVP
- Real profile remains hidden before permission
- Instant profile/follow/coin cannot reveal real profile
- Block overrides reveal visibility
- Design direction is dark-first, premium, mobile-native, and cinematic
- Test Lab is required before production confidence
- RLS and safe DTO boundaries are critical

---

## Implementation Gate

Implementation must not start until all of the following are complete:

1. Project tree is verified.
2. PROJECT_STATUS.md is verified.
3. FILE_MAP.md is verified.
4. Core product docs are reviewed.
5. Design docs are reviewed.
6. Architecture docs are reviewed.
7. Database docs are reviewed.
8. Security/RLS/storage docs are reviewed.
9. Testing/Test Lab docs are reviewed.
10. Final deep analysis is completed.
11. User explicitly approves the first implementation task.

Until then, do not create:

- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.json
- node_modules/
- apps/web/src
- apps/mobile/src
- supabase/config.toml
- Supabase migrations
- RLS SQL policy files
- Production app code

---

## Codex Task Rules

Codex tasks must be small.

Each Codex task must include:

1. Goal
2. Allowed files
3. Forbidden files
4. Exact expected output
5. Safety constraints
6. Verification steps
7. Rollback note if relevant

Codex must first produce a short task plan before changing files.

Codex must report:

- Files changed
- Files created
- Files intentionally not touched
- Any uncertainty
- How to verify the change

Codex must update FILE_MAP.md when new files are added.

Codex must update PROJECT_STATUS.md after meaningful milestones.

---

## Forbidden Codex Tasks

Codex must not receive tasks like:

- Build the whole app
- Create the full monorepo and apps at once
- Implement auth, chat, database, storage, and UI together
- Write all RLS policies in one task
- Generate all migrations at once
- Create the whole Test Lab at once
- Refactor the entire structure
- Decide product rules independently
- Replace approved documentation direction

Large work must be split by ChatGPT before Codex receives anything.

---

## Allowed Codex Task Size

A safe Codex task should usually affect:

- 1 to 3 files maximum
- One narrow feature or setup step
- One clear verification method
- No hidden architectural decision

Examples of acceptable future tasks:

- Create only base package.json
- Create only pnpm-workspace.yaml
- Create only turbo.json
- Create only base tsconfig
- Create only a placeholder web route after framework approval
- Create only one safe DTO type file after architecture approval
- Create only one Test Lab page skeleton after framework approval

---

## Review Workflow

Every meaningful Codex/manual change must be reviewed in this order:

1. Does it respect MVP core?
2. Does it preserve anonymous-start behavior?
3. Does it avoid real profile leakage?
4. Does it preserve Chat as the central hub?
5. Does it avoid recipient picker drift?
6. Does it respect storage privacy?
7. Does it avoid raw ID/path leaks?
8. Does it fit the approved file structure?
9. Does it keep scope small?
10. Does it update project tracking files if needed?

If any answer fails, the change must be revised before continuing.

---

## Approval Workflow

Use this approval sequence:

1. ChatGPT proposes a small next task.
2. User approves or rejects.
3. If approved, ChatGPT prepares exact Codex/manual instruction.
4. Codex/manual work is executed.
5. User shares changed files or output.
6. ChatGPT reviews output.
7. ChatGPT updates next safe step.

Do not skip review.

Do not chain multiple implementation tasks without checking the result of the previous task.

---

## File Ownership Rules

Do not mix planning, implementation, and security responsibilities.

Product docs must not contain app code.

Design docs must not contain backend logic.

Architecture docs must not contain package setup commands unless clearly marked as future implementation direction.

Database docs must not become migration files.

Security docs must not become executable RLS SQL until the implementation phase is approved.

Testing docs must define scenarios before test code exists.

---

## UI/UX Work Rule

All UI/UX work must respect:

- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md
- docs/design/DESIGN_TOKENS.md
- docs/design/COMPONENT_SYSTEM.md
- docs/design/SCREEN_MAP.md
- docs/design/UI_QUALITY_CHECKLIST.md

Codex or any UI generator must not bypass the approved dark-first, premium, mobile-native direction.

The app must not look like:

- A dating app
- A generic text chat app
- A website squeezed into mobile
- A warning-heavy security dashboard

---

## Security Review Rule

Any future implementation touching profile visibility, media access, chat, reveal, block, reports, notifications, storage, or DTOs must be checked against:

- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md
- docs/security/SECURITY_RULES.md
- docs/security/PRIVACY_MODEL.md
- docs/security/RISK_CONTROL.md
- docs/testing/RLS_LEAK_TESTS.md

Default rule:

Frontend consumes safe DTOs only.

Raw sensitive rows, raw storage paths, and unsafe owner/sender/requester IDs must not be exposed.

---

## Test Lab Rule

Test Lab is required.

It must remain:

- localhost-only
- browser-based
- visual PASS/FAIL
- disabled in production
- fake-data only
- free of production secrets
- free of real user data

No production release confidence should be claimed without Test Lab coverage for privacy, reveal, block, storage, and RLS leak scenarios.

---

## Continuity Rule

When the chat becomes long or context-heavy, ChatGPT must prepare a clean continuation prompt using:

- docs/handoff/NEW_CHAT_CONTINUATION_PROMPT.md
- PROJECT_STATUS.md
- FILE_MAP.md
- Latest decisions
- Current implementation state
- Next safe step

The next chat must begin with verification, not coding.

---

## Current Rule

Current phase is still pre-implementation planning and documentation review.

Do not start package setup, framework initialization, migrations, RLS SQL, or app implementation until final deep analysis is complete and the User explicitly approves the first implementation task.
---

## ANKION AUTODEV v1 Rules

ANKION is an anonymous voice-based connection app. Anonymous identity and real profile data must remain strictly separated. Real profile visibility is owner-approved and context-based only.

### Core Product Constraints

- No public profile browsing, user search, global profile discovery, dating-style swipe/browse behavior, or room/chat-room direction.
- Anonymous-start behavior, reveal approval, block/report safety, safe DTO boundaries, storage privacy, RLS, Auth, and monetization boundaries must not be changed automatically.
- "Make it work now, fix later" is forbidden.

### Safe Development Rules

- AUTODEV v1 is a local, human-gated orchestration scaffold only.
- It may read a task queue, validate scope, run allowed validation commands, inspect git diff, detect forbidden file changes, and write PASS/FAIL reports.
- It must not run Codex recursively, modify product behavior, or perform broad refactors.
- Human approval is required before accepting, merging, shipping, or continuing from any AUTODEV result.

### Forbidden Files And Areas

- Do not change `package.json`, `pnpm-lock.yaml`, `.env`, `.env.*`, production configuration, EAS configuration, CI/CD, app signing, APK/release build setup, Android native files, iOS native files, Supabase migrations, Auth/session implementation, RLS policies, payment, or monetization implementation without explicit user permission and phase approval.
- No package or lockfile changes are allowed without explicit user permission.
- No Supabase, Auth, or RLS changes are allowed without explicit phase approval.

### AUTODEV v1 Validation Commands

Only these validation commands are approved for AUTODEV v1:

- `corepack pnpm --filter @ankion/mobile typecheck`
- `corepack pnpm --filter @ankion/web typecheck`
- `corepack pnpm --filter @ankion/web build`

### Release Boundary

AUTODEV v1 must not push, deploy, publish, release, create commits, build release APKs, run Gradle release builds, run emulator/adb, or modify dangerous files. APK testing is out of scope for AUTODEV v1.
---

## ANKION AUTODEV v2 Rules

AUTODEV v2 is a human-gated local orchestrator scaffold only. It cannot modify ANKION app source automatically and cannot run recursive Codex.

AUTODEV v2 must fail closed when git is unavailable or when `git diff --name-only` / `git diff --stat` cannot run. It must report forbidden file status as `UNKNOWN` when independent diff verification is unavailable.

Human approval is mandatory for every AUTODEV result. AUTODEV v2 must not run APK, Gradle, adb, package installation, Auth, RLS, Supabase, deploy, push, commit, publish, or release actions.

