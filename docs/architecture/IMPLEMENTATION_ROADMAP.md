# IMPLEMENTATION_ROADMAP.md

## Purpose

Plan small, isolated implementation phases for ankion after documentation approval, final deep analysis, and explicit user approval.

This roadmap exists to prevent rushed implementation, architecture drift, Codex overload, and privacy/security mistakes.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Current Implementation State

Implementation has not started.

Framework initialization has not started.

Package setup has not started.

Supabase setup has not started.

Database migrations have not started.

RLS SQL has not started.

App UI code has not started.

## Required Gate Before Any Implementation

Implementation may begin only after:

1. Final documentation review is complete.
2. Final deep analysis is complete.
3. User explicitly approves implementation.
4. First task is reduced to a tiny isolated setup step.
5. Files allowed to change are listed.
6. Files forbidden to change are listed.
7. Validation command/check is defined.

---

# Roadmap Principles

## RP-001 — Tiny Tasks Only

Every implementation task must be small enough to review safely.

Codex must not receive broad tasks such as:

```txt
Build the app
Set up the whole monorepo
Create all screens
Create all database tables
Write all RLS policies
Build the backend
```

## RP-002 — Documentation Controls Implementation

Implementation must follow the approved docs.

Important source docs:

- `DECISIONS.md`
- `PROJECT_STATUS.md`
- `FILE_MAP.md`
- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/product/USER_JOURNEY.md`
- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/DESIGN_TOKENS.md`
- `docs/design/COMPONENT_SYSTEM.md`
- `docs/design/SCREEN_MAP.md`
- `docs/security/RLS_POLICIES.md`
- `docs/security/STORAGE.md`
- `docs/security/SECURITY_RULES.md`
- `docs/testing/TEST_LAB.md`
- `docs/testing/RLS_LEAK_TESTS.md`
- `docs/handoff/CODEX_TASKS.md`

## RP-003 — Security Before Feature Growth

Reveal, RLS, storage, safe DTOs, and block override must be designed before public user flows become real.

## RP-004 — Test Lab Before Trusting UI

A localhost-only Test Lab must exist early enough to verify product/security states.

## RP-005 — Working System Must Stay Working

After setup begins, every phase must leave the repository in a valid, understandable state.

## RP-006 — No Hidden Big Bang

Each phase must have:

- goal
- allowed files
- forbidden files
- validation
- rollback path
- update requirement for `PROJECT_STATUS.md`, `CHANGELOG.md`, and `FILE_MAP.md` when relevant

---

# Implementation Phase Overview

| Phase | Name | Goal | Implementation Allowed? | Depends On |
| --- | --- | --- | --- | --- |
| 0 | Final Review Gate | Confirm docs and risks | No | Current docs |
| 1 | Monorepo Base Setup | Create minimal workspace files | Only after approval | Phase 0 |
| 2 | Web App Skeleton | Initialize minimal Next.js structure | Later | Phase 1 |
| 3 | Mobile App Skeleton | Initialize minimal Expo structure | Later | Phase 1 |
| 4 | Shared Package Skeleton | Create shared types/config boundaries | Later | Phase 1 |
| 5 | Design Token Implementation | Map approved tokens to code | Later | Phase 2/3/4 |
| 6 | Dev Test Lab Shell | Create localhost-only Test Lab route | Later | Phase 2 |
| 7 | Fake DTO + Leak Check Layer | Add fake safe payloads and leak checks | Later | Phase 6 |
| 8 | Static UI Flow Prototype | Build non-backend flow screens with fake data | Later | Phase 5/6/7 |
| 9 | Supabase Planning Lock | Finalize migration/RLS task plan | Later, no SQL yet | Phase 8 |
| 10 | Database Migrations | Create database tables incrementally | Later | Phase 9 approval |
| 11 | RLS Policies | Add RLS per table in small batches | Later | Phase 10 |
| 12 | Storage Policies | Add private buckets and signed URL flow | Later | Phase 10/11 |
| 13 | Auth + Profile Base | Connect real auth/profile setup | Later | Phase 10/11 |
| 14 | Discover + Chat Backend | Implement safe Discover-to-Chat flow | Later | Phase 13 |
| 15 | Voice Upload + Limits | Implement voice storage and quotas | Later | Phase 12/14 |
| 16 | Reveal Grants | Implement permission-based reveal | Later | Phase 14/15 |
| 17 | Instant Feed | Implement photo/video/audio instant flow | Later | Phase 12/16 |
| 18 | Safety / Block / Report | Implement safety controls | Later | Phase 16/17 |
| 19 | QA Hardening | Test Lab, leak checks, edge cases | Later | All core phases |
| 20 | MVP Release Prep | Final local/prod readiness | Later | Phase 19 |

---

# Phase 0 — Final Review Gate

## Goal

Confirm the project is ready to begin implementation planning without actually starting implementation.

## Allowed Work

- Review documentation.
- Update documentation.
- Update `PROJECT_STATUS.md`.
- Update `FILE_MAP.md`.
- Update `CHANGELOG.md`.
- Run final deep analysis.
- Prepare first tiny setup prompt.

## Forbidden Work

- Creating `package.json`
- Creating `pnpm-workspace.yaml`
- Creating `turbo.json`
- Creating `tsconfig.json`
- Creating app code
- Initializing Next.js
- Initializing Expo
- Installing packages
- Creating Supabase config
- Creating migrations
- Writing RLS SQL

## Validation

- Project tree still contains docs/scaffold only.
- No package/framework files exist.
- Final deep analysis result is documented.
- User explicitly approves moving to Phase 1.

## Exit Criteria

Phase 0 exits only when user says implementation/setup may begin.

---

# Phase 1 — Monorepo Base Setup

## Goal

Create the smallest possible monorepo base without app implementation.

## Expected Files Later

Only after approval:

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json` or approved base TypeScript config
- maybe `.gitignore` if missing
- maybe `.npmrc` if needed

## Allowed Scope

- Workspace metadata.
- Script placeholders.
- Package manager configuration.
- Base TypeScript config direction.

## Forbidden Scope

- No Next.js app initialization.
- No Expo initialization.
- No Supabase setup.
- No migrations.
- No RLS SQL.
- No UI screens.
- No app source code.
- No package installation beyond explicitly approved setup.

## Validation

- `pnpm install` can be planned later, not assumed.
- Workspace files are readable.
- No app code is created.
- `FILE_MAP.md`, `PROJECT_STATUS.md`, and `CHANGELOG.md` are updated.

## Recommended First Tiny Task

```txt
Create monorepo base setup files only:
package.json, pnpm-workspace.yaml, turbo.json, tsconfig.base.json.
Do not initialize apps.
Do not install packages.
Do not create src folders.
```

---

# Phase 2 — Web App Skeleton

## Goal

Create a minimal Next.js App Router skeleton only after monorepo base exists.

## Expected Files Later

Possible future files:

- `apps/web/package.json`
- `apps/web/next.config.*`
- `apps/web/app/layout.tsx`
- `apps/web/app/page.tsx`
- `apps/web/app/globals.css`

Exact files must be approved before task.

## Allowed Scope

- Minimal app shell.
- No real product screens yet.
- No Supabase integration yet.
- No real data.

## Forbidden Scope

- No full UI implementation.
- No auth flow.
- No database calls.
- No storage calls.
- No Test Lab unless explicitly scoped in separate task.

## Validation

- Web skeleton can render a placeholder.
- Placeholder clearly says implementation is not complete.
- No product/security rules are bypassed.

---

# Phase 3 — Mobile App Skeleton

## Goal

Create a minimal Expo + React Native skeleton only after monorepo base exists.

## Expected Files Later

Possible future files:

- `apps/mobile/package.json`
- `apps/mobile/app.json`
- `apps/mobile/App.tsx`
- basic Expo config files

Exact files must be approved before task.

## Allowed Scope

- Minimal mobile shell.
- No full screens.
- No auth.
- No Supabase.
- No media upload.
- No reveal logic.

## Validation

- Mobile app can show placeholder later.
- Does not duplicate web logic incorrectly.
- Does not create tangled shared dependencies.

---

# Phase 4 — Shared Package Skeleton

## Goal

Create boundaries for shared TypeScript utilities and safe DTO types.

## Expected Directories Later

Possible future structure:

```txt
packages/shared/
  src/
    dto/
    constants/
    guards/
    privacy/
packages/ui/
  src/
packages/config/
  src/
```

## Allowed Scope

- Placeholder package boundaries.
- No complex implementation.
- No database calls.
- No real app logic.

## Forbidden Scope

- No raw table types as frontend DTOs.
- No Supabase client logic mixed into generic shared package.
- No UI components until design token mapping is approved.

## Validation

- Shared package has clear responsibility.
- No circular dependencies.
- `FILE_MAP.md` updated.

---

# Phase 5 — Design Token Implementation

## Goal

Translate approved design tokens into future web/mobile theme structures.

## Depends On

- `docs/design/DESIGN_TOKENS.md`
- `docs/design/COMPONENT_SYSTEM.md`
- Web/mobile skeletons or shared config package

## Possible Future Outputs

- Shared token object.
- Web CSS variables.
- Mobile theme constants.
- UI package theme exports.

## Forbidden Scope

- No full components.
- No screens.
- No route implementation.
- No product logic.

## Validation

- Tokens match docs.
- Dark-first default.
- Voice/reveal/privacy states included.
- No dating-app visual drift.

---

# Phase 6 — Dev Test Lab Shell

## Goal

Create the localhost-only browser Test Lab shell before real backend integration.

## Depends On

- Web app skeleton.

## Expected Route Later

```txt
/dev/test-lab
```

## Required Guard

- Development/local only.
- Disabled in production.
- Fake data only.
- No production secrets.

## Allowed Scope

- Test Lab landing page.
- Static PASS/FAIL card shell.
- Fake scenario sections.

## Forbidden Scope

- No real Supabase connection.
- No production data.
- No real user data.
- No real secrets.

## Validation

- Local route visible in dev.
- Production guard behavior planned/testable.
- Fake data only.
- `TEST_LAB.md` alignment confirmed.

---

# Phase 7 — Fake DTO + Leak Check Layer

## Goal

Create fake safe DTO examples and local leak-check helpers for Test Lab.

## Depends On

- Test Lab shell.
- Shared package skeleton.

## Required Coverage

Fake payloads for:

- `safe_discover_profile`
- `safe_feed_tile`
- `safe_instant_content_detail`
- `safe_chat_summary`
- `safe_chat_room`
- `safe_voice_message`
- `safe_reveal_request_state`
- `safe_profile_view`
- `safe_notification`

Leak checks for forbidden fields:

- `auth_user_id`
- `sender_user_id`
- `owner_user_id`
- `profile_owner_user_id`
- `viewer_user_id`
- `requester_user_id`
- `recipient_user_id`
- `blocker_user_id`
- `blocked_user_id`
- `reporter_user_id`
- `reported_user_id`
- `raw_storage_path`
- `storage_path`

## Forbidden Scope

- No real DB.
- No real auth.
- No real storage.
- No RLS SQL.

## Validation

- Leak checker marks safe fake payloads as PASS.
- Deliberately unsafe fake payloads can show FAIL in Test Lab.
- Test Lab remains local-only.

---

# Phase 8 — Static UI Flow Prototype

## Goal

Build static UI flow with fake safe data before backend integration.

## Depends On

- Design tokens.
- Component system.
- Screen map.
- Test Lab fake DTOs.

## Screens Later

- Welcome.
- Auth placeholder.
- Profile Setup placeholder.
- Discover.
- Feed.
- Instant Detail.
- Chat.
- Reveal states.
- Safe Profile View.
- Own Profile.
- Safety sheet placeholder.
- Test Lab states.

## Allowed Scope

- Static/fake UI.
- Navigation between fake screens.
- State previews.
- No real backend.

## Forbidden Scope

- No real auth.
- No database.
- No storage upload.
- No real media access.
- No real RLS dependency.

## Validation

- Discover opens Chat.
- Feed opens Instant Detail, then Chat.
- Reveal states render correctly.
- Blocked/hidden states render correctly.
- UI passes quality checklist.

---

# Phase 9 — Supabase Planning Lock

## Goal

Before any SQL, freeze the database/RLS implementation plan.

## Depends On

- Static UI flow confirms required safe DTOs.
- Database docs reviewed.
- Security docs reviewed.

## Required Outputs

- Exact migration sequence.
- Exact table order.
- Table-by-table RLS matrix review.
- Safe view/RPC plan.
- Storage policy plan.
- Rollback notes.

## Forbidden Scope

- No migrations yet.
- No RLS SQL yet.
- No Supabase config yet unless explicitly scoped after this lock.

## Validation

- User approves SQL plan.
- RLS policy matrix has no unresolved critical gap.
- Storage plan avoids raw identity/path leaks.

---

# Phase 10 — Database Migrations

## Goal

Create database schema in small migration batches.

## Depends On

- Phase 9 approval.

## Batch Strategy

Suggested future batches:

1. users/profile core
2. anonymous/instant profile structures
3. chat threads and participants
4. voice messages and limits
5. reveal requests and visibility grants
6. blocks and reports
7. instant content and follows
8. notifications/events if needed

## Forbidden Scope

- No huge all-in-one migration.
- No RLS mixed casually into schema unless scoped.
- No frontend code in migration tasks.

## Validation

- Each migration is readable.
- Each table has documented purpose.
- Sensitive fields are known.
- `FILE_MAP.md`, `CHANGELOG.md`, and database docs updated if needed.

---

# Phase 11 — RLS Policies

## Goal

Implement RLS policies in reviewed, table-by-table batches.

## Depends On

- Database tables exist.
- RLS matrix approved.

## Required Rule

RLS must enforce privacy and identity boundaries.

## Critical Rules

- Request approval alone cannot reveal profile.
- Active visibility grant is required.
- Block overrides grant.
- Instant follow cannot reveal real profile.
- Coin/future entitlement cannot reveal real profile.
- Raw sensitive rows must not be exposed.
- Safe views/RPCs should control frontend access.

## Forbidden Scope

- No casual broad `select` policies.
- No exposing hidden profile fields.
- No bypassing block checks.
- No frontend implementation mixed into RLS tasks.

## Validation

- RLS leak tests pass with fake/local data.
- Forbidden fields are not returned in safe flows.
- Policies are documented.

---

# Phase 12 — Storage Policies

## Goal

Create private media storage model.

## Depends On

- Storage docs.
- Database access checks.
- RLS policies where needed.

## Required Rules

- Private buckets by default.
- No public sensitive media buckets.
- No raw storage path returned to frontend.
- Signed URL generation must check access.
- Block prevents signed URL access where applicable.
- Storage paths must not include unsafe real user IDs.

## Good Path Direction

```txt
voice-messages/{chat_thread_id}/{voice_message_id}.m4a
instant-images/{instant_profile_id}/{post_id}.jpg
instant-videos/{instant_profile_id}/{post_id}.mp4
```

## Forbidden Path Direction

```txt
voice-messages/{sender_user_id}/{message_id}.m4a
instant-images/{owner_user_id}/{post_id}.jpg
public/{real_profile_id}/{file}.jpg
```

## Validation

- Raw storage path leak tests pass.
- Signed URL access respects block/reveal rules.
- No public sensitive buckets.

---

# Phase 13 — Auth + Profile Base

## Goal

Connect Supabase Auth and owner-only profile setup.

## Depends On

- Database/RLS/storage base.

## Allowed Scope

- Signup/login connection.
- Own profile creation.
- Own profile view.
- Owner-only profile editing later.

## Forbidden Scope

- No public real profile browsing.
- No reveal bypass.
- No unsafe auth ID display.

## Validation

- Logged-out users see Welcome/Auth.
- Logged-in without profile goes to Profile Setup.
- Logged-in with profile can access app.
- Other users cannot see real profile without reveal grant.

---

# Phase 14 — Discover + Chat Backend

## Goal

Implement safe Discover-to-Chat flow.

## Depends On

- Auth/profile base.
- Safe DTO strategy.
- Chat tables/RLS.

## Required Flow

```txt
DiscoverCard -> ChatRoom
```

## Forbidden Scope

- No recipient picker.
- No real profile reveal.
- No raw IDs in frontend.
- No full text-chat pivot.

## Validation

- Discover returns safe profiles only.
- Tap creates/opens safe chat.
- Chat uses safe room DTO.
- Hidden profile state remains hidden.

---

# Phase 15 — Voice Upload + Limits

## Goal

Implement voice recording/upload/playback with limits.

## Depends On

- Chat backend.
- Storage policies.
- Safe signed URL flow.

## Rules

- Max duration: 21 seconds.
- Daily send limit: 7.
- Same-recipient daily send limit: 3.
- Server-side enforcement required.

## Forbidden Scope

- No frontend-only quota enforcement.
- No public voice bucket.
- No raw storage path exposed.
- No unsafe sender ID route/path.

## Validation

- Voice upload works.
- Limits enforced server-side.
- UI shows safe remaining count.
- Voice playback uses safe signed URL.
- Blocked access prevents playback where applicable.

---

# Phase 16 — Reveal Grants

## Goal

Implement request, decision, and visibility grant logic.

## Depends On

- Chat backend.
- Profile safe view.
- RLS policies.

## Required Formula

```txt
approved request + active profile visibility grant + no active block = profile visible
```

## Required States

- request available
- request pending
- decide later
- stay hidden
- approved without grant still hidden
- active grant revealed
- block overrides grant

## Forbidden Scope

- No reveal on request alone.
- No reveal on UI state alone.
- No coin/follow-based reveal.
- No harsh rejection copy.

## Validation

- Test Lab reveal scenarios pass.
- RLS leak tests pass.
- Safe profile view returns correct state.
- Block reverses visibility.

---

# Phase 17 — Instant Feed

## Goal

Implement anonymous instant photo/video/audio feed.

## Depends On

- Storage policies.
- Instant profile tables.
- Safe DTOs.
- Chat flow.

## Required Flow

```txt
FeedTile -> InstantContentDetail -> ChatRoom
```

## Required Rules

- 3-column grid.
- Photo/video/audio support.
- Instant profile separate from real profile.
- Instant follow does not reveal real profile.
- Instant content cannot reveal real profile.
- Real profile reveal still happens in Chat.

## Forbidden Scope

- No Live tab in MVP.
- No real profile owner reveal.
- No raw storage paths.
- No owner_user_id exposure.

## Validation

- Feed safe DTOs pass leak checks.
- Detail safe DTOs pass leak checks.
- Follow does not change real profile visibility.
- Chat opens from detail.

---

# Phase 18 — Safety / Block / Report

## Goal

Implement safety controls.

## Depends On

- Chat, reveal, profile, storage, and instant flows.

## Required Rules

- Block overrides grants.
- Block restricts signed URL access where applicable.
- Report does not expose reporter identity.
- Moderation internals remain private.

## Forbidden Scope

- No reporter identity leak.
- No moderation internals in frontend.
- No profile visibility after block.

## Validation

- Block hides/restricts profile.
- Block restricts media where applicable.
- Reports are private.
- Test Lab safety scenarios pass.

---

# Phase 19 — QA Hardening

## Goal

Validate MVP behavior against documentation.

## Required Checks

- Product flow QA.
- UI quality checklist.
- Test Lab PASS/FAIL.
- RLS leak tests.
- Storage leak tests.
- Voice limit tests.
- Reveal grant tests.
- Block override tests.
- Report/notification privacy tests.
- Production guard.

## Forbidden Scope

- No new large features.
- No monetization expansion.
- No AI analysis.
- No location discovery.

## Validation

- All critical Test Lab scenarios pass.
- No known identity leak.
- No raw storage path leak.
- No broken core flow.

---

# Phase 20 — MVP Release Prep

## Goal

Prepare MVP for controlled testing or release.

## Required Work

- Final environment review.
- Production guard review.
- Supabase policy review.
- Storage policy review.
- Test Lab disabled in production.
- Error states reviewed.
- Privacy copy reviewed.
- Basic analytics plan reviewed if needed.
- Final QA checklist complete.

## Forbidden Scope

- No risky new features.
- No rushed monetization.
- No public launch before privacy/security checks.

## Validation

- MVP readiness checklist complete.
- Security/RLS review complete.
- User approves release/testing step.

---

# Codex Task Template For Roadmap Phases

Every Codex task should use this structure:

```md
# TASK: [Short exact task title]

## Context

This is the ankion project.

Current phase:
[phase number and name]

## Allowed Files

- [exact file path]
- [exact file path]

## Forbidden Files

- [exact file path]
- [folder or file type]

## Task

[Exact small change.]

## Required Boundaries

- Do not change product rules.
- Do not bypass reveal/privacy rules.
- Do not expose sensitive IDs.
- Do not add raw storage paths.
- Do not modify files outside allowed list.
- Do not start unrelated setup.

## Required Output

- Short task plan before changes.
- Files changed.
- Files not touched.
- Validation result.
- Risk found, if any.

## Validation

[Exact check or command.]
```

---

# Phase Completion Rules

After each meaningful phase:

1. Update `PROJECT_STATUS.md`.
2. Update `CHANGELOG.md`.
3. Update `FILE_MAP.md` if files were added or responsibilities changed.
4. Confirm no forbidden files were created.
5. Confirm next task remains small.
6. Confirm project still matches `DECISIONS.md`.

---

# Current Recommended Next Step

Do not start Phase 1 yet.

Current next step is:

```txt
Complete final documentation review, update FILE_MAP.md / PROJECT_STATUS.md / CHANGELOG.md, then run final deep analysis.
```

After that, the first possible implementation task should be:

```txt
Phase 1 — Monorepo Base Setup
```

But only after explicit user approval.

---

# Current Status

This document is ready for final documentation review.

Implementation must not start from this document alone.

Before implementation:

1. Complete final documentation review.
2. Run final deep analysis.
3. Confirm implementation gate.
4. Prepare only the first tiny setup task.
5. Get explicit user approval.
