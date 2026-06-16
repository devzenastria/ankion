# Supabase Folder / Migration Structure Plan

## 1. Purpose

This document defines the future folder and migration organization for Supabase implementation in ankion.

It is a planning document only. It does not create folders, migrations, SQL files, Supabase client code, Auth code, RLS policies, Storage buckets, Storage policies, backend/API logic, or environment files.

The goal is to make a future Supabase implementation reviewable, ordered, and security-first before any implementation begins.

## 2. Current Status

Supabase implementation is still NO-GO.

SQL and migrations are still NO-GO.

Auth implementation, RLS implementation, Storage implementation, and Supabase client integration are still NO-GO.

This file is planning-only and must not be treated as approval to implement Supabase.

## 3. Non-Negotiable Boundaries

This phase allows none of the following:

- no SQL
- no migration files
- no Supabase client
- no Auth implementation
- no RLS implementation
- no Storage implementation
- no .env
- no package changes
- no UI route changes
- no backend/API
- no mock data

## 4. Future Supabase Directory Shape

The following structure is an example of a future intended organization only. These folders and files must NOT be created in this phase.

```txt
supabase/
  README.md
  config/
  migrations/
  policies/
  storage/
  tests/
  notes/
```

Future folder purposes:

- `README.md`: Explains local Supabase workflow, implementation gates, validation commands, rollback expectations, and safety boundaries.
- `config/`: Holds future Supabase project configuration notes or approved config files only after explicit implementation approval.
- `migrations/`: Holds future timestamped migration files only after migration creation is separately approved.
- `policies/`: Holds future RLS policy reference material or approved policy files, depending on the approved implementation phase.
- `storage/`: Holds future Storage bucket, path, and policy planning or approved Storage implementation files.
- `tests/`: Holds future RLS verification scripts, fixtures, or checklists after the test approach is approved.
- `notes/`: Holds implementation notes, rollback notes, review findings, and phase handoff details.

## 5. Future Migration Naming Convention

Future migration names should be timestamped, descriptive, and ordered by dependency. These are examples only. Do not create these files in this phase.

Examples:

- `YYYYMMDDHHMMSS_foundation_types_and_extensions`
- `YYYYMMDDHHMMSS_private_profiles`
- `YYYYMMDDHHMMSS_anonymous_identities`
- `YYYYMMDDHHMMSS_conversations`
- `YYYYMMDDHHMMSS_voice_messages`
- `YYYYMMDDHHMMSS_reveal_requests`
- `YYYYMMDDHHMMSS_profile_visibility_grants`
- `YYYYMMDDHHMMSS_feed_items`
- `YYYYMMDDHHMMSS_storage_boundaries`
- `YYYYMMDDHHMMSS_rls_policy_enablement`
- `YYYYMMDDHHMMSS_safe_views_or_rpc_boundaries`

These examples intentionally omit file extensions and SQL statements.

## 6. Future Migration Order

The intended future sequencing is:

1. Extensions/enums/types
2. Private profile tables
3. Anonymous identity tables
4. Conversation tables
5. Voice message metadata tables
6. Reveal request tables
7. Profile visibility grant tables
8. Feed item metadata tables
9. Indexes/constraints
10. RLS enablement
11. RLS policies
12. Storage bucket boundaries
13. Storage policies
14. Safe views/RPC boundaries
15. RLS test fixtures/checks

This order is a planning baseline only. Each implementation slice must still be separately approved before files are created.

## 7. Security-First Rules

Future Supabase work must follow these rules:

- Private profile data must never be reachable from anonymous identity queries.
- Reveal grants must be required before real profile visibility.
- Media storage paths must not leak real profile identity.
- Client-safe views must be separated from private tables.
- RLS must be enabled before any real client access.
- No service-role logic may exist in the mobile client.

## 8. Future File Responsibility Rules

Future files should keep responsibilities narrow:

- Migration files: schema-only and RLS-only slices when approved.
- Policy files: policy planning/reference only unless implementation is explicitly approved.
- Storage docs: bucket, path, and policy plans only until implementation approval.
- Tests folder: future RLS verification scripts and checklists only.
- Notes folder: implementation notes, review notes, rollback notes, and phase handoff notes.

## 9. Forbidden Future Anti-Patterns

Avoid these unsafe patterns:

- Mixing real profile and anonymous identity in one public table.
- Exposing `owner_user_id` through public feed, discover, or chat surfaces.
- Creating reveal approval with client-trusted flags only.
- Uploading media before storage policy design.
- Adding broad select policies.
- Using mock users, media, or messages to simulate backend.
- Shipping Supabase client before RLS verification.

## 10. Validation Expectations For This Phase

Because this phase is markdown-only, expected validation is:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
```

If quick, also run:

```txt
corepack pnpm --filter @ankion/web build
corepack pnpm --filter @ankion/mobile exec expo install --check
```

## 11. Phase 19C Acceptance Criteria

Phase 19C is complete when:

- Exactly one markdown file is created.
- No SQL files are created.
- No Supabase folder is created unless it already existed and was not modified.
- No package or lockfile changes are made.
- No route UI changes are made.
- No backend/API changes are made.
- No Supabase/Auth/RLS/Storage implementation is added.
- Validation passes.

## 12. Next Recommended Phase

Phase 19D — Supabase folder/migration structure audit + docs/status alignment.

Phase 19D should only audit this planning document and update status docs. It should still avoid SQL, migrations, Supabase implementation, Auth implementation, RLS implementation, Storage implementation, package changes, route changes, backend/API changes, `.env` files, and mock data.

## Phase 19D Audit Note

Phase 19D confirms this document was created as the only Phase 19C file change and remains documentation-only.

Confirmed:

- No SQL files were created.
- No migrations were created.
- The existing `supabase/` folder was not modified.
- No Supabase/Auth/RLS/Storage implementation was added.
- No package files, lockfile, route UI files, apps/web source files, backend/API files, `.env` files, or mock data were changed.

Next recommended phase:

- Phase 20A SQL migration slicing plan review, or Supabase implementation go/no-go checklist review only.

## Phase 20A Review Note

Phase 20A reviewed this folder and migration structure plan against `docs/architecture/SQL_MIGRATION_SLICING_PLAN.md`.

Review result:

- The future folder shape remains planning-only and should not be created or modified yet.
- The future timestamped migration naming convention aligns with the SQL migration slicing plan.
- The future migration order aligns with the existing dependency and security sequence.
- SQL implementation, migrations, Supabase client, Auth, RLS, Storage, `.env`, package, backend/API, route, and apps/web changes remain NO-GO until separately approved.

## Phase 20B Go/No-Go Review Note

Phase 20B confirms the future folder and migration structure remains planning-only.

Confirmed:

- Do not create or modify Supabase folders for implementation yet.
- Do not create SQL or migration files yet.
- Folder/migration organization should wait until the Supabase readiness checklist receives explicit GO status.

## Phase 20E RLS Structure Boundary Note

Phase 20E confirms the future Supabase folder and migration structure remains planning-only.

Because RLS policy verification readiness is NOT READY, no policy files, RLS SQL, `.sql` migrations, safe view/RPC files, Storage policy files, or Supabase implementation files should be created yet.

## Phase 20F Storage Structure Boundary Note

Phase 20F confirms the future Storage folder and policy structure remains planning-only.

Because Storage privacy boundary readiness is NOT READY, no Storage bucket files, Storage policy files, `.sql` migrations, Supabase implementation files, upload code, signed URL code, or media handling code should be created yet.

## Phase 20G Auth Structure Boundary Note

Phase 20G confirms the future Supabase/Auth structure remains planning-only.

Because Auth flow boundary readiness is NOT READY, no Auth implementation files, Supabase client files, login/signup UI, session provider, environment files, SQL migrations, triggers, RPCs, or ownership policy files should be created yet.

## Phase 20H Migration Structure Safety Note

Phase 20H confirms the future Supabase folder and migration structure remains planning-only.

`docs/architecture/MIGRATION_ROLLBACK_CHECK_STRATEGY_PLAN.md` now documents future migration rollback/check strategy expectations, but no SQL files, migration files, rollback scripts, or `supabase/` folder changes should be created yet.

Future migration files must not be created until all required readiness gates pass and implementation is explicitly approved.

## Phase 20I Environment Structure Boundary Note

Phase 20I confirms environment variable strategy is PLANNED while the future Supabase folder and migration structure remains planning-only.

No `.env` files, environment templates, Supabase config files, SQL migrations, Storage policy files, or Supabase implementation files should be created yet. Future environment files may only be introduced after explicit implementation approval.
