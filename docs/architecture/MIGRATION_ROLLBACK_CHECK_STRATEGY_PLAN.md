# Migration Rollback / Check Strategy Plan

## 1. Purpose

This document defines how ankion will plan migration safety, rollback notes, and validation checks before real Supabase SQL migration work begins.

This is planning-only. It does not approve SQL, migration files, Supabase implementation, Auth implementation, RLS implementation, Storage implementation, Supabase client integration, environment files, backend/API work, route changes, package changes, or runtime behavior.

## 2. Current Status

- Supabase implementation remains NO-GO.
- SQL/migration implementation remains NO-GO.
- No migration files are created in this phase.
- This phase is planning-only.

## 3. Readiness Dependencies

Migration execution remains blocked because:

- finalized schema readiness is NOT READY
- RLS policy verification readiness is NOT READY
- Storage privacy boundary readiness is NOT READY
- Auth flow boundary readiness is NOT READY

These gates must be reviewed and explicitly marked ready before any real migration work can begin.

## 4. Future Migration Safety Principles

Future migration work must follow these principles:

- one small migration slice at a time
- no mixed schema/RLS/storage/client changes in one migration
- no destructive migration without explicit review
- no broad policy changes without test cases
- no production migration without backup/checkpoint
- no client integration before RLS verification
- rollback notes required for each future migration
- no production data exposure during failed or partial migration states
- no migration that weakens private profile, anonymous identity, reveal, or media privacy boundaries without explicit separate approval

## 5. Future Pre-Migration Checks

Before any future migration is applied, the migration owner should confirm:

- schema diff reviewed
- table ownership model confirmed
- private vs anonymous data separation confirmed
- RLS impact reviewed
- Storage/media impact reviewed
- Auth ownership impact reviewed
- rollback note prepared
- validation plan prepared
- no service-role mobile dependency
- no public leakage of `owner_user_id` or private profile fields
- no public leakage of raw storage paths, private media paths, or real profile media
- dependent readiness gates are explicitly passed
- migration order and dependency chain are reviewed
- production backup/checkpoint expectations are documented before production use

## 6. Future Post-Migration Checks

After any future migration is applied, the migration owner should confirm:

- migration applied successfully
- expected tables/indexes/constraints exist
- RLS enablement verified where applicable
- denied access cases checked
- public-safe surfaces checked
- reveal grant boundaries checked
- storage metadata boundaries checked if applicable
- app typechecks still pass
- no package/route/runtime changes unless explicitly approved
- no unexpected client-visible owner identifiers
- no unexpected private profile visibility
- no unexpected Storage path or signed URL exposure

## 7. Rollback Documentation Expectations

Each future migration must document:

- what changed
- why it changed
- whether rollback is possible
- rollback approach at a high level
- data-loss risk
- privacy-leak risk
- dependency on previous migrations
- dependency from later migrations
- validation required after rollback
- whether rollback can temporarily weaken RLS, reveal, or Storage boundaries

Do not include SQL rollback scripts in this planning document.

## 8. Failed Migration Handling

If a future migration fails:

- stop immediately
- do not stack more migrations on top
- record the failed step
- inspect the error
- inspect any partial database state
- verify that RLS/privacy posture was not weakened
- restore/checkpoint if needed
- rerun only after the cause is understood
- update status docs before continuing
- do not connect client integration to the partial state

## 9. Destructive Change Rules

Destructive changes include:

- dropping tables
- dropping columns
- changing ownership fields
- changing reveal grant semantics
- weakening RLS assumptions
- changing media path semantics
- changing private profile exposure boundaries
- changing anonymous identity ownership/linkage behavior
- changing profile visibility grant behavior
- changing Storage metadata relationships

These require explicit separate approval before implementation.

## 10. Future Validation Commands

For documentation-only phases, run:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
```

If quick, also run:

```txt
corepack pnpm --filter @ankion/web build
corepack pnpm --filter @ankion/mobile exec expo install --check
```

For future real migration phases, migration-specific validation commands must be defined later and should not be implemented now.

## 11. Phase 20H Acceptance Criteria

Phase 20H is complete when:

- migration rollback/check strategy is documented
- Supabase remains NO-GO
- SQL/migrations remain NO-GO
- no `.sql` files are created
- no `supabase/` folder modifications are made
- no package/lockfile changes are made
- no route UI changes are made
- validation passes

## 12. Next Recommended Phase

Phase 20I - Environment Variable Strategy Plan.

Phase 20I must still be documentation-only and must not create `.env` files.

## Phase 20K Migration Testing Audit Note

Phase 20K confirms testing / audit procedure is PLANNED while real migration execution remains BLOCKED / NO-GO.

Future migration testing must verify dry-run expectations, pre-migration backup/checkpoint, post-migration schema state, rollback documentation, destructive-change review, failed migration handling, and privacy posture after migration or rollback.

No SQL files, migrations, rollback scripts, test scripts, package changes, or runtime behavior are authorized by this note.
