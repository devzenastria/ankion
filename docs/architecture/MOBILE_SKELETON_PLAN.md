# MOBILE_SKELETON_PLAN.md

## Purpose

Define the Phase 3A mobile skeleton planning direction for ankion before any mobile app implementation begins.

This document exists to make the future mobile setup reviewable, narrow, and aligned with the approved architecture.

## Status

Phase 3B minimal mobile skeleton completed.

Mobile app files now exist only as a neutral Expo Router skeleton. Product UI and backend/security integration have not started.

## Source Documents

This document follows:

- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/MONOREPO_STRUCTURE.md`
- `docs/architecture/TECH_STACK_DECISION.md`
- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`

## Approved Mobile Skeleton Direction

Future mobile skeleton direction:

- Expo
- React Native
- TypeScript
- Expo Router

Phase 3B created the minimal skeleton only. Product UI, Supabase, Auth, Storage, RLS, migrations, and API integration remain deferred to later explicitly approved phases.

## Future apps/mobile Structure

Current minimal structure:

```txt
apps/
  mobile/
    app/
      _layout.tsx
      index.tsx
    src/
      components/
      constants/
      features/
      lib/
      styles/
      types/
    package.json
    tsconfig.json
    app.json
```

Expected future responsibilities:

- `apps/mobile/app/` holds the minimal Expo Router skeleton.
- `apps/mobile/app/_layout.tsx` defines the minimal mobile route shell.
- `apps/mobile/app/index.tsx` holds a neutral placeholder entry route before product UI begins.
- `apps/mobile/src/*` folders are placeholders for later approved implementation.
- `apps/mobile/package.json` defines mobile workspace scripts and minimal Expo dependencies.
- `apps/mobile/tsconfig.json` uses the Expo TypeScript baseline.
- `apps/mobile/app.json` holds minimal Expo app configuration.

## Phase 3B Validation

Phase 3B validation passed:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

Package install was required for the new mobile workspace dependencies. It updated `pnpm-lock.yaml` and generated `apps/mobile/node_modules/`.

## Phase 3C Hygiene Validation

Phase 3C confirmed generated/local-only outputs are ignored:

- root `node_modules/`
- `apps/mobile/node_modules/`
- `.expo/`
- `.expo-shared/`
- `dist/`
- `build/`
- `coverage/`

Phase 3C confirmed `pnpm-lock.yaml` is an expected tracked workspace file and should remain in source control.

Phase 3C validation passed:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

## Future Skeleton Constraints

The Phase 3B skeleton must stay minimal:

- create only the files approved for that exact task
- use TypeScript
- use Expo Router conventions
- avoid product screen implementation
- avoid Supabase integration
- avoid auth, storage, migrations, and RLS logic
- update `PROJECT_STATUS.md`, `FILE_MAP.md`, and `CHANGELOG.md` after implementation

## Out Of Scope

The following remain out of scope after Phase 3C unless separately approved:

- no product UI
- no Discover
- no Feed
- no Chat
- no Profile
- no Test Lab
- no Supabase
- no Auth
- no migrations
- no RLS SQL
- no Storage

## Product Boundaries To Preserve Later

Future mobile work must preserve:

- voice-first social discovery
- anonymous start
- permission-based real profile reveal
- Chat as the central interaction hub
- no separate recipient selection screen
- Discover profile tap opens Chat directly
- Feed tile opens Instant Content Detail
- Instant Content Detail leads to Chat
- voice recording happens inside Chat
- real profile remains hidden before permission
- block overrides reveal visibility

## Implementation Gate

This document does not approve mobile implementation.

Before mobile files are created, the user must explicitly approve a narrow implementation task with:

1. Goal
2. Allowed files
3. Forbidden files
4. Expected output
5. Safety constraints
6. Verification steps
7. Rollback note if relevant

## Success Criteria

Phase 3A planning is successful if:

1. Mobile direction is clear: Expo + React Native + TypeScript + Expo Router.
2. Future `apps/mobile` structure is defined without creating it.
3. Product UI and backend/security implementation remain deferred.
4. Status, file map, changelog, and decisions stay aligned.
