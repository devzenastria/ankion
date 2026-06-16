# ankion

## Purpose

ankion is a dark-first, premium, mobile-native, voice-first anonymous social discovery app.

Users start hidden, connect through voice, and reveal their real profile only with explicit permission.

Core product sentence:

> Start hidden. Connect through voice. Reveal only with trust.

---

## Current Status

**Status:** Draft  
**Phase:** Pre-implementation documentation review  
**Coding status:** Not started  
**Framework initialization:** Not started  
**Owner:** ChatGPT / User / Codex-assisted

This repository currently contains documentation, project structure, and planning files only.

No app implementation, package setup, framework initialization, Supabase configuration, migrations, RLS SQL, or production code has started.

---

## Product Summary

ankion is not a dating app and not a generic text chat app.

The product is built around anonymous, voice-first social discovery:

- Users create real accounts and real profiles.
- First interaction remains anonymous.
- Discover profile tap opens Chat directly.
- Feed tile opens Instant Content Detail.
- Instant Content Detail can lead into Chat.
- Voice recording happens inside Chat.
- Real profile visibility requires owner approval and an active visibility grant.
- Block status always overrides profile visibility.

---

## Non-Negotiable MVP Rules

- No separate recipient selection screen.
- Chat is the central interaction hub.
- Voice-first interaction must remain central.
- Maximum voice duration is 21 seconds.
- Daily voice send limit is 7 per user.
- Same-recipient daily send limit is 3.
- Voice limits must be enforced server-side.
- Feed uses a 3-column photo / video / audio grid.
- Instant photo, video, and audio are part of MVP.
- Instant content does not reveal the real profile.
- Instant follow does not reveal the real profile.
- Coin or follower-view packages must not reveal the real profile.
- Real profile visibility is permission-based only.
- Avoid harsh UI states such as “Rejected” or “Denied.”
- Design direction is dark-first, premium, modern, cinematic, and mobile-native.

---

## Reveal Rule

Real profile visibility requires:

```text
approved request + active profile visibility grant + no active block = profile visible
```

Important constraints:

- Request approval alone is not enough.
- UI state alone is not enough.
- Active visibility grant is required.
- Block overrides grant.
- Coin, follow, instant content, and media visibility cannot reveal the real profile.

---

## Security Direction

ankion must protect user identity by default.

Frontend must consume safe DTOs, safe views, or safe RPC responses only. Raw sensitive database rows must not be exposed to the frontend.

Sensitive fields must not leak through API responses, UI props, logs, storage paths, reports, notifications, or Test Lab output.

Examples of sensitive fields:

- auth_user_id
- sender_user_id
- owner_user_id
- recipient_user_id
- requester_user_id
- blocker_user_id
- blocked_user_id
- raw_storage_path
- storage_path
- hidden real profile fields before reveal
- moderation internals
- grant/reveal internals where unsafe

---

## Storage Direction

Storage must be private by default.

Rules:

- No public sensitive media buckets.
- No raw storage path returned to frontend.
- No sender or owner identity in unsafe storage paths.
- Use short-lived signed URLs.
- Signed URL generation must check access.
- Block must prevent signed URL access where applicable.
- File audit logs are private.

---

## Test Lab Direction

A localhost-only visual Test Lab is required before production confidence.

Expected future route:

```text
/dev/test-lab
```

Rules:

- localhost-only
- browser-based
- visual PASS/FAIL
- disabled in production
- fake-data only
- no production secrets
- no real user data

The Test Lab must verify product flow, reveal safety, block override, voice limits, storage leak prevention, RLS leak prevention, notification/report privacy, and production guard behavior.

---

## Approved Technology Direction

Approved direction, not yet initialized:

- Language: TypeScript
- Monorepo: pnpm workspace + Turborepo
- Web: Next.js App Router
- Mobile: Expo + React Native
- Backend/Auth/DB/Storage: Supabase
- Database: Supabase Postgres
- Auth: Supabase Auth
- Storage: Supabase private buckets
- Security: RLS + safe RPC/views + storage policies
- Test Lab: localhost-only visual QA area in web app

Do not initialize these before final deep analysis and explicit approval.

---

## Repository Structure

```text
README.md
AGENTS.md
PROJECT_STATUS.md
DECISIONS.md
CHANGELOG.md
PROMPTS.md
FILE_MAP.md

docs/
  product/
  design/
  architecture/
  database/
  security/
  testing/
  handoff/

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

scripts/
```

---

## Implementation Gate

Implementation must not start until all of the following are complete:

1. Project tree is verified.
2. PROJECT_STATUS.md is verified.
3. FILE_MAP.md is verified.
4. Remaining support drafts are reviewed.
5. Final documentation review is complete.
6. Final deep analysis is complete.
7. User explicitly approves implementation.

Forbidden before approval:

- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.json
- node_modules/
- apps/web/src
- apps/mobile/src
- supabase/config.toml
- Supabase migrations
- RLS SQL policies
- application code

---

## Codex Rule

Codex must only receive small, isolated, clearly bounded tasks.

Codex must not build the whole app, initialize frameworks, install packages, create migrations, write RLS SQL, or create app code without explicit approval.

Each Codex task must include:

- exact goal
- exact files allowed
- exact files forbidden
- required output format
- verification checklist
- risk note

---

## Current TODO

- Review remaining optional support drafts.
- Update PROJECT_STATUS.md after final documentation review.
- Run final deep analysis before implementation.
- Prepare only the first tiny setup task after explicit approval.

---

## Project Principle

Build slowly, safely, and cleanly.

Do not let the project drift away from the MVP core:

**anonymous start, voice-first connection, permission-based reveal, privacy-safe architecture.**
