# Anonymous Identity / Real Profile Separation Plan

## Phase

Phase 17B — Documentation-only Anonymous Identity / Real Profile Separation Planning

## Purpose

This document defines how ankion must separate anonymous interaction identity from real profile identity.

The goal is to prevent real profile leakage through Discover, Feed, Chat, voice messages, media moments, reveal requests, storage paths, client queries, or unsafe joins.

This phase is documentation-only.

No Supabase implementation is included in Phase 17B.

---

## Core Product Rule

ankion users may have real profiles.

However, first interaction starts anonymously.

Real profile visibility must remain hidden unless the profile owner explicitly approves visibility later.

Anonymous identity and real profile identity must be treated as two separate layers.

---

## Identity Layers

### 1. Auth Account

Purpose:

Represents the authenticated user account.

Future source:

Supabase Auth.

Used for:

- login session
- ownership checks
- write permissions
- RLS policy evaluation

Must not be directly shown in:

- Discover
- Feed
- Chat
- public anonymous surfaces
- voice message surfaces
- reveal request surfaces

Sensitive fields:

- email
- auth user id
- provider metadata
- account timestamps

---

### 2. Real Profile

Purpose:

Represents the user’s real identity profile.

Future possible table:

- profiles_private

Possible fields:

- user_id
- display_name
- bio
- avatar_path
- profile_details
- visibility_settings
- created_at
- updated_at

Default visibility:

Private.

Readable by:

- owner
- approved viewer only after visibility grant

Not readable by:

- anonymous conversation participant without grant
- public feed viewer
- public discover viewer
- random authenticated users

---

### 3. Anonymous Identity

Purpose:

Represents the safe anonymous surface used in product interaction.

Future possible table:

- anonymous_identities

Possible fields:

- id
- owner_user_id
- public_label optional
- voice_style_placeholder optional
- status
- created_at
- updated_at

Client-safe fields may include:

- anonymous identity id
- safe display label
- generic status
- safe interaction metadata

Client-unsafe fields:

- owner_user_id
- linked real profile id
- auth user id
- email
- private profile fields
- storage paths that expose owner identity

---

## Separation Model

The app should behave as if these are different identities:

```txt
Auth Account
  owns
Real Profile

Auth Account
  also owns
Anonymous Identity

Anonymous Identity
  participates in
Discover / Feed / Chat / Voice / Media

Real Profile
  remains private unless reveal grant exists
```

## Phase 17E Alignment Note

Phase 17E confirms this document is part of the completed Phase 17 security foundation set.

Confirmed:

- Anonymous identity and real profile separation are planned before implementation.
- This remains documentation-only.
- No Supabase/Auth/RLS/Storage implementation files, migrations, SQL, backend/API, route/component, package, lockfile, or apps/web source changes were added.

## Phase 24E Private Profile / Anonymous Identity Finalization Note

Phase 24E finalizes the documentation-level separation rule for the first backend schema planning slice:

- `profiles_private` represents the real user profile and is owner-only by default.
- `anonymous_identities` represents the app-facing anonymous identity and must not carry real profile fields.
- `auth.users` owns both records internally, but `auth.users.id`, `owner_user_id`, and private profile linkage must not be exposed in public or non-owner client DTOs.
- V1 should use one active anonymous identity per auth user unless a future rotation-history phase explicitly changes this.
- `anonymous_identities -> profiles_private` must not be a public or client-visible relation.
- Reveal visibility must be resolved through future connection/context grants, not through a public anonymous-to-real profile join.

No global public profile, username search, public profile browsing, global reveal, or room/chat-room model is approved by this note.

## Phase 24F Anonymous Preview And Reveal Boundary Reinforcement

Phase 24F reinforces the private profile / anonymous identity separation:

- `anonymous_identities` must not expose a client-visible relation to `profiles_private`.
- non-owner anonymous display surfaces are `DTO_ONLY` through `AnonymousSafePreviewDTO`.
- `AnonymousSafePreviewDTO` may include `anonymous_label`, `anonymous_visual_seed`, `voice_presence_label`, and context-safe state only.
- `AnonymousSafePreviewDTO` must not include `owner_user_id`, `auth_user_id`, `profile_private_id`, email, phone, real name, private profile photo, moderation internals, verification internals, device/IP metadata, raw storage paths, or anonymous-to-real correlation data.
- reveal does not convert an anonymous identity into a public real profile.
- reveal only allows a connection/context-scoped `RevealProfileDTO` after owner approval.
- reveal does not authorize raw `profiles_private` reads.

Actual SQL/RLS implementation remains blocked until a separate implementation-readiness phase approves Auth/session, migration order, rollback/testing, DTO/view/RPC contracts, service-role usage, and Storage exclusions.

## Phase 24G Auth And Anonymous Identity Boundary

Phase 24G confirms:

- Auth user may own anonymous identity internally.
- Anonymous identity remains app-facing and anonymous.
- Client-facing anonymous preview must not expose `owner_user_id`, `auth_user_id`, `profile_private_id`, email, phone, real name, private profile photo, moderation internals, verification internals, device/IP metadata, raw session data, or any anonymous-to-real correlation path.
- Anonymous identity must not become a real-profile lookup key.
- Auth does not create public profile browsing or user search.
- Rotation/history remains internal until separately approved.

## Phase 24R - RLS Policy Implementation Readiness / No-Apply Policy Plan (2026-06-16)

Result: PASS - RLS policy implementation readiness documented. No policies implemented.

This phase records the future RLS policy families for the existing private-profile and anonymous-identity foundation without creating executable SQL, without editing migrations, and without applying anything to a database.

Readiness boundaries:
- profiles_private direct table access remains owner-only by default. Future policies may allow an authenticated owner to select, insert, and update only the owner's own row. owner_user_id must not be reassigned. Hard delete remains NO-GO unless a separate deletion plan is approved.
- anonymous_identities direct table access remains owner-bound by default. Future policies may allow an authenticated owner to select, insert, and update only the owner's own rows. owner_user_id must not be reassigned. Broad public or authenticated reads are forbidden.
- Reveal recipients must not receive raw profiles_private select access. Any future reveal output must pass through a safe, context-scoped DTO/RPC/view boundary that exposes only approved fields after owner approval.
- Anonymous surfaces must not expose owner_user_id, raw profile rows, storage paths, sensitive verification state, or any field that links anonymous identity to real profile outside the approved context.

Forbidden future policy patterns:
- public select on profiles_private or anonymous_identities.
- authenticated-wide select on profiles_private or anonymous_identities.
- connection-wide or reveal-based raw select on profiles_private.
- searchable, browsable, globally visible, slug/handle/profile-directory policy logic.
- room/member-directory identity exposure.
- monetization, instant profile, follow, or coin flows bypassing owner consent.
- owner_user_id reassignment, raw ID leakage, raw storage path exposure, or sensitive verification/safety field exposure.

Required future deny tests before any executable policy phase:
- unauthenticated direct reads are denied for both tables.
- authenticated non-owner direct reads are denied for both tables.
- owners can access only their own intended rows after policies exist.
- owners cannot insert or update rows for another owner_user_id.
- reveal recipients still cannot raw-select profiles_private.
- no public/search/browse/global profile read path exists.
- no broad anonymous/authenticated select policy exists.
- RLS remains enabled and migration history is not reset or reapplied casually.

GO/NO-GO:
- Non-executable RLS policy SQL draft: GO in a future explicit phase.
- Executable migration creation/apply: NO-GO.
- Remote/staging/production apply: NO-GO.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24S - Non-Executable RLS Policy SQL Draft / No Migration Creation (2026-06-16)

Result: PASS - non-executable RLS policy SQL draft documented. No migration created. No RLS policy implemented. No database command run.

Canonical draft: `docs/architecture/EXPANDED_RLS_POLICY_MATRIX_PLAN.md`.

Summary:
- The migration file remains the source of truth for `public.profiles_private` and `public.anonymous_identities`.
- Phase 24S classifies actual columns conservatively and records that RLS controls row access, not safe column-level mutability by itself.
- `profiles_private` contains owner identity, visibility/consent, lifecycle/status, safety, verification, soft-delete, and audit fields. Owner INSERT/UPDATE are therefore CONDITIONAL until a field mutability matrix plus safe RPC/DTO, column-grant, trigger/check, or server-side update design is approved.
- `anonymous_identities` contains owner identity, status, safety, rotation, soft-delete, and audit fields. Owner INSERT/UPDATE are therefore CONDITIONAL until a field mutability matrix plus safe identity creation/update/rotation design is approved.
- Owner SELECT own rows may be a future candidate for both tables.
- Direct DELETE remains NO-GO for both tables until a deletion/retention design is approved.
- Public, unauthenticated, authenticated-wide, non-owner, reveal-recipient raw, connection/context raw, search/browse/global, feed directory, and member-directory raw SELECT paths are forbidden.
- Reveal must never grant raw `profiles_private` table read access. Future reveal output must use a safe context-scoped projection/DTO boundary.

No executable SQL was produced. Any SQL-like text is documented only as commented `text` and labelled `NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY` in the canonical draft.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24T - Non-Executable Deny/Allow RLS Test Draft + Static Policy Audit / No Apply (2026-06-16)

Result: PASS - Phase 24S static policy audit and non-executable future deny/allow RLS test draft documented. No executable tests created. No tests run. No database command run.

Canonical test/audit draft: `docs/architecture/TESTING_AUDIT_PROCEDURE_PLAN.md`.

Summary:
- Phase 24S draft is Markdown-only, fenced as text, labelled `NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY`, and policy-like lines are commented out.
- No executable SQL file, migration file, policy, view, function, trigger, test fixture, or executable test was created.
- No public, authenticated-wide, non-owner, reveal-recipient raw, connection/context raw, search/browse/global profile, feed directory, or member-directory raw table SELECT path is allowed by the draft.
- Broad owner UPDATE remains conditional/not ready because RLS controls rows, not safe mutation of safety/moderation/system/visibility/rotation/soft-delete fields.
- Future test actors are documentation-only personas; no users or rows were created.
- Future positive tests are limited to owner-bound SELECT and conditional owner INSERT/UPDATE after policy and field-mutability review.
- Future negative tests preserve anonymous-start behavior, no public profile, no profile/user search, no profile browsing, no room/member directory, no raw reveal SELECT, and no monetization-based consent bypass.

Current baseline expectation: Phase 24Q documented RLS enabled and zero policies, so direct client access remains deny-by-default until explicit policies are implemented. Phase 24T did not re-check DB state.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_DOCS_ONLY_PHASE.

## Phase 24U - RLS Policy Migration Creation Preflight / No Migration Creation / No Apply (2026-06-16)

Result: PASS - local-only RLS policy migration creation preflight complete. No migration created. No policies implemented. No SQL mutation.

Canonical preflight record: `docs/architecture/SQL_MIGRATION_SLICING_PLAN.md`.

Summary:
- Phase 24U used read-only metadata/catalog SELECT queries only.
- Both first-migration tables remain present with RLS enabled and force RLS false.
- `pg_policies` returned zero rows for `profiles_private` and `anonymous_identities`.
- Migration version `20260615062809` appears exactly once.
- Current table privilege metadata does not show `anon` or `authenticated` table-level SELECT/INSERT/UPDATE/DELETE on either table.
- Current column privilege metadata does not show `anon` or `authenticated` column-level SELECT/INSERT/UPDATE on either table.
- Future owner-bound SELECT policies may require least-privilege authenticated SELECT privilege handling in the future migration, paired with strict RLS and deny/allow tests.
- Future first executable migration candidate scope is limited to `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own` only.
- INSERT/UPDATE/DELETE, raw reveal SELECT, public/anon/global/search/browse SELECT, room/member-directory behavior, RPC/view/function/trigger creation, and runtime implementation remain out of scope.
- Future UPDATE/INSERT remains blocked until field mutability and safe owner-write boundaries are complete.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_PREFLIGHT_PHASE.

## Phase 24V - Executable RLS Policy Migration File Creation / No Apply (2026-06-16)

Result: PASS - one executable migration file was created for owner-bound SELECT policies only. No apply. No policies implemented in DB.

New migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- File creation only; the migration was not run.
- Scope is limited to owner SELECT own row/rows for `public.profiles_private` and `public.anonymous_identities`.
- Least-privilege SELECT grants to `authenticated` are included because Phase 24U documented authenticated lacked table-level SELECT on the target tables.
- No grant was made to `anon`.
- No INSERT/UPDATE/DELETE policies were created.
- No reveal-recipient raw `profiles_private` SELECT policy was created.
- No connection/context raw private-profile SELECT policy was created.
- No public/global/search/browse policy was created.
- No RPC/view/function/trigger/Auth/runtime/Storage/backend/app implementation was created.
- Next required phase is static audit of the created migration file before any local apply decision.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_FILE_CREATION_PHASE.

## Phase 24W - Static Audit of Created RLS Policy Migration / No Apply (2026-06-16)

Result: PASS - static audit of the created owner-bound SELECT RLS migration completed. No apply. No DB commands run. No policies implemented in DB.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- The migration file identity is correct and timestamped after the first migration.
- No new migration file was created in Phase 24W.
- No migration file was edited in Phase 24W.
- Existing first migration remains present.
- The created migration contains only table-specific authenticated SELECT grants and the two owner-bound SELECT policies approved by Phase 24V.
- The policies use `FOR SELECT`, `TO authenticated`, and `auth.uid() = owner_user_id`.
- No anon/public grants, write grants, INSERT/UPDATE/DELETE policies, reveal raw SELECT, connection/context raw SELECT, search/browse/global access, member-directory behavior, RPC/view/function/trigger, or runtime implementation is present.
- Static audit result supports a future local apply decision/preflight phase only; it does not approve apply.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_STATIC_AUDIT_PHASE.

## Phase 24X - Local Apply Decision / Preflight for Created RLS Migration / No Apply (2026-06-16)

Result: PASS - local apply decision/preflight complete. No apply. No SQL mutation. Created RLS migration is eligible for a future local apply phase only with a new explicit GO. Staging/production remain NO-GO.

Audited migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- Phase 24X ran only read-only metadata/catalog SELECT queries.
- Local DB container `supabase_db_ankion` was reachable.
- Both target tables exist and RLS remains enabled.
- Current policy count is zero.
- First migration version `20260615062809` appears exactly once.
- Phase 24V migration version `20260616090000` appears zero times, so it has not been applied locally.
- Table and column privilege posture matches Phase 24U/24W: no anon/authenticated SELECT/INSERT/UPDATE/DELETE table or column privileges observed before apply.
- Forbidden public/search/token/identity-leak columns returned zero rows.
- Future local apply may be considered only in a later phase with explicit GO and command confirmation.
- Future post-apply audit and later deny/allow tests remain separate phases.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PREFLIGHT_PHASE.

## Phase 24Y - Controlled Local Apply of Created RLS Policy Migration / Local Only (2026-06-16)

Result: FAIL - approved local apply command failed before Supabase CLI executed. Stopped without retry, repair, reset, alternate command, or post-apply audit.

Approved command attempted exactly once:
- `npx -y supabase@latest migration up --local`

Sanitized failure summary:
- PowerShell blocked `C:\Program Files\nodejs\npx.ps1` because script execution is disabled by local execution policy.
- Supabase CLI did not run.
- No migration apply completed through this command.

Pre-apply checks had passed before the failed command:
- `supabase_db_ankion` was visible and healthy.
- Both target tables existed with RLS enabled.
- `pg_policies` returned zero rows before apply.
- First migration version `20260615062809` count was 1.
- Owner-select migration version `20260616090000` count was 0 before apply.
- Migration files were not edited.

No retry or alternate apply command was run. No post-apply metadata audit was run because the phase stopped after command failure.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_PHASE.

## Phase 24Y-FIX - Safe Local Apply Command Path Retry / Local Only (2026-06-16)

Result: FAIL - the safe `npx.cmd` command path worked, but the local apply retry failed while applying the migration. Stopped without retry, repair, reset, alternate command, or migration edit.

Approved command attempted exactly once:
- `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`

Sanitized failure summary:
- Supabase CLI invoked successfully through `npx.cmd` and connected to the local database.
- It attempted `20260616090000_create_owner_select_rls_policies.sql`.
- The migration failed at statement 0 with a syntax error near an unexpected leading character before the first comment, consistent with a leading BOM/encoding character.
- No post-apply audit was run because the apply command failed.

Pre-retry checks had passed before the failed command:
- `supabase_db_ankion` was visible and healthy.
- Both target tables existed with RLS enabled.
- `pg_policies` returned zero rows before retry.
- First migration version `20260615062809` count was 1.
- Owner-select migration version `20260616090000` count was 0 before retry.

No PowerShell execution-policy change, `Set-ExecutionPolicy`, or `-ExecutionPolicy Bypass` was used.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FIX_PHASE.

## Phase 24Y-FIX2 - Local Apply Failure Classification + Read-Only DB State Verification / No Apply (2026-06-16)

Result: PASS - local apply failure classified. No apply retry performed. DB remains pre-apply.

Classification: `MIGRATION_COMMAND_FAILED_BEFORE_DB_MUTATION`.

Summary:
- `npx.cmd`, `npm.cmd`, Node, and Supabase CLI via `npx.cmd` are available.
- Phase 24Y-FIX reached Supabase CLI and local DB, then failed while applying `20260616090000_create_owner_select_rls_policies.sql` at statement 0 due an unexpected leading character before the initial comment.
- The failure is consistent with a leading BOM/encoding character at the start of the migration file.
- Read-only DB verification shows first migration version `20260615062809` count = 1, owner-select migration version `20260616090000` count = 0, `pg_policies` zero rows, RLS enabled on both target tables, and forbidden fields zero rows.
- No apply retry, migration edit, repair, reset, direct SQL mutation, tests, app/runtime changes, package/env changes, or APK workspace changes occurred.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_FAILURE_CLASSIFICATION.

## Phase 24Y-FIX3 - Migration File Encoding / Leading Character Remediation + Static Re-Audit / No Apply (2026-06-16)

Result: PASS - owner-select RLS migration file encoding remediated and statically re-audited. No apply. No DB commands run.

Target migration file:
- `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql`

Summary:
- Pre-fix prefix classification: `UTF8_BOM_EF_BB_BF`.
- Pre-fix SHA256: `31A9DFB5C5F62BAF010F379C08805D7103643C0C7DB5F07EEEEECF713C31B397`.
- Remediation performed: removed exactly leading bytes `EF BB BF` from the target migration file.
- Post-fix SHA256: `FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455`.
- Post-fix first bytes now begin with ASCII `2D 2D` / `-- Phase 24V`.
- Static re-audit passed: owner-bound SELECT policy scope and authenticated SELECT grants are preserved; no forbidden SQL or broad access was added.
- Original first migration was not edited and no new migration file was created.
- No apply retry or DB command was run.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_MIGRATION_ENCODING_FIX_PHASE.

## Phase 24Y-FIX4 - Controlled Local Apply Retry After Encoding Fix / Local Only (2026-06-16)

Result: PASS - created RLS policy migration applied to local DB only after encoding fix. Post-apply metadata audit PASS. Owner-bound SELECT policies now exist locally. Staging/production remain NO-GO. Auth/runtime/app implementation remain NO-GO.

Summary:
- Used approved command exactly once: `cmd /d /s /c "npx.cmd -y supabase@latest migration up --local"`.
- Applied `supabase/migrations/20260616090000_create_owner_select_rls_policies.sql` locally only.
- Migration history now records `20260616090000` exactly once; first migration remains recorded exactly once.
- `pg_policies` now shows exactly `profiles_private_owner_select_own` and `anonymous_identities_owner_select_own`.
- Both policies are SELECT, target `{authenticated}`, and use `(auth.uid() = owner_user_id)`.
- RLS remains enabled on both target tables.
- Authenticated has expected table-specific SELECT on both target tables; no anon SELECT and no authenticated write grants appeared.
- Forbidden field scan returned zero rows.
- No staging/production apply, app/runtime implementation, tests, test data, migration edits, new migrations, db reset, db push, migration repair, link, or remote command occurred.

Tooling note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_LOCAL_APPLY_AFTER_ENCODING_FIX.

## Phase 24Z - Local Post-Apply RLS Metadata Audit + Controlled Deny/Allow Test Planning/Preflight (2026-06-16)

Status: PHASE 24Z PASS - LOCAL POST-APPLY RLS METADATA AUDIT COMPLETE. OWNER-BOUND SELECT RLS FOUNDATION IS ACTIVE LOCALLY. CONTROLLED DENY/ALLOW TEST PLANNING/PREFLIGHT DOCUMENTED. NO TESTS RUN. PHASE 24 BACKEND/RLS LOCAL FOUNDATION CHECKPOINT COMPLETE. PHASE 25 MAY START IN A NEW CHAT WITH HANDOFF.

Scope:
- Local post-apply metadata audit only.
- Controlled deny/allow test planning and preflight only.
- No migration apply, db push, db reset, migration repair, remote command, staging apply, or production apply.
- No SQL mutation, direct CREATE POLICY, GRANT, REVOKE, CREATE/ALTER/DROP, INSERT, UPDATE, DELETE, or TRUNCATE.
- No tests run, no executable test files created, no test data created, and no test users created.
- No migration files edited and no new migration files created.
- No app code, package, lockfile, env, APK workspace, Auth runtime, Supabase runtime, Storage/backend, RPC, view, function, trigger, Edge function, reveal, or write-policy implementation.

Local metadata audit results:
- Docker visibility: supabase_db_ankion present and healthy. supabase_vector_ankion remains restarting and is not a blocker for read-only DB metadata audit.
- Migration history: 20260615062809 count = 1; 20260616090000 count = 1; both expected versions present exactly once.
- Target tables: public.profiles_private and public.anonymous_identities exist; RLS enabled on both; force RLS remains false on both.
- Policies: exactly two policies exist on the two target tables: profiles_private_owner_select_own and anonymous_identities_owner_select_own.
- Policy details: both are PERMISSIVE SELECT policies for authenticated with USING predicate (auth.uid() = owner_user_id) and no WITH CHECK.
- Forbidden policy semantics: no USING true, no broad OR predicate, no anon/public policy target, no INSERT/UPDATE/DELETE policy, no public/search/global/browse/discoverability policy, no reveal-recipient raw profiles_private SELECT, and no room/member-directory policy.
- Table grants: authenticated has SELECT on both target tables; anon does not have SELECT; authenticated does not have INSERT, UPDATE, or DELETE. postgres retains local owner/admin privileges; service_role/anon/internal-style baseline REFERENCES/TRIGGER/TRUNCATE entries may appear from local grants.
- Column privileges: authenticated SELECT appears at column level as a consequence of the table SELECT grant; no authenticated INSERT or UPDATE column privilege was found. Future field mutability remains blocked until a separate safe boundary design exists.
- Forbidden fields: zero forbidden identity/search/global/secret fields found across profiles_private and anonymous_identities.
- Migration file hashes unchanged: 20260615062809 hash F9D291FDB0578C54DF2B8A64F6D321438341CBED3DB3BF93ACF362F483721AAC; 20260616090000 hash FC7225AA95C3027D3CEBC6B1F4B4676D0F51950FB1C940B2A7C7B90422F66455.
- Phase 24V migration starts with "-- Phase 24V" and has no UTF-8 BOM.
- Git note: GIT_UNAVAILABLE_ON_PATH_NON_FATAL_FOR_POST_APPLY_AUDIT_PHASE.

Future Phase 25A controlled deny/allow test actors, not created in Phase 24Z:
1. unauthenticated_user
2. authenticated_owner_a
3. authenticated_non_owner_b
4. reveal_recipient_b_for_context_x
5. connection_participant_b_without_reveal
6. malicious_owner_attempting_owner_user_id_reassignment
7. malicious_owner_attempting_system_field_mutation
8. service_role_or_admin_context_excluded_from_client_rls_tests

Future profiles_private deny/allow matrix, not executed in Phase 24Z:
1. unauthenticated_user SELECT profiles_private: DENY.
2. authenticated_non_owner_b SELECT owner_a profiles_private row: DENY.
3. authenticated_owner_a SELECT own profiles_private row: ALLOW through owner SELECT policy.
4. reveal_recipient_b_for_context_x SELECT raw profiles_private: DENY.
5. connection_participant_b_without_reveal SELECT raw profiles_private: DENY.
6. authenticated_owner_a INSERT profiles_private: DENY / outside current policy scope.
7. authenticated_owner_a UPDATE profiles_private: DENY / outside current policy scope.
8. authenticated_owner_a DELETE profiles_private: DENY / outside current policy scope.
9. public/global/search/browse profile access: DENY / forbidden.
10. monetization-based identity/reveal bypass: DENY / forbidden.

Future anonymous_identities deny/allow matrix, not executed in Phase 24Z:
1. unauthenticated_user SELECT anonymous_identities: DENY.
2. authenticated_non_owner_b SELECT owner_a anonymous identity rows directly: DENY.
3. authenticated_owner_a SELECT own anonymous identity rows: ALLOW through owner SELECT policy.
4. feed/global anonymous directory SELECT directly from anonymous_identities: DENY / forbidden.
5. connection/member-directory SELECT directly from anonymous_identities: DENY / forbidden.
6. user search / anonymous identity search / browse / discoverability SELECT: DENY / forbidden.
7. authenticated_owner_a INSERT anonymous_identities: DENY / outside current policy scope.
8. authenticated_owner_a UPDATE anonymous_identities: DENY / outside current policy scope.
9. authenticated_owner_a DELETE anonymous_identities: DENY / outside current policy scope.
10. monetization-based identity lookup/discoverability/reveal bypass: DENY / forbidden.

Future Phase 25A local test data constraints:
- Local-only test data only; no staging or production.
- No real user data, personal data, email, phone, or real identity fields.
- No auth.users direct SELECT.
- No raw secret keys in docs.
- Use controlled local test users/claims only if a safe test harness is explicitly approved.
- Test data cleanup must be separately approved and local-only.
- Do not use db reset or migration repair as normal cleanup.

Future Phase 25A method decision required before tests run:
- Candidate methods: Supabase SQL test harness with local role/claim simulation; psql session-level JWT claims simulation if safe and documented; Supabase client local test harness only after runtime boundary approval; or a dedicated local SQL test script only in a separate explicit phase.
- Phase 24Z does not choose or implement the test method.

Phase 24 closure decision:
- Phase 24 backend/RLS local foundation checkpoint is complete.
- First schema migration exists and is applied locally.
- First owner-bound SELECT RLS migration exists and is applied locally.
- Local DB has owner-bound SELECT RLS active.
- Write policies remain NO-GO.
- Reveal remains planning-only and not implemented.
- Auth/runtime/app integration remains NO-GO.
- Staging and production remain NO-GO.
- Phase 25 may begin in a new chat with a handoff prompt.

## Phase 27B - Creation Path Separation Reinforcement (2026-06-18)

Phase 27B keeps real profile identity and anonymous identity separated during future row creation planning.

Creation decisions:
- `profiles_private` creation must be owner-controlled and must not create a public profile, searchable profile, global profile, or profile-browsing surface.
- `anonymous_identities` creation must be owner-bound internally but anonymous-facing externally; it must not expose `owner_user_id`, `auth_user_id`, `profile_private_id`, or anonymous-to-real correlation data to non-owner clients.
- Direct broad INSERT remains blocked. Controlled creation boundary is preferred later because it can enforce owner binding, duplicate prevention, server-owned defaults, audit fields, rate limits, and abuse scoring before rows exist.
- Direct owner INSERT policy is only a conditional fallback after field mutability, RLS, anti-abuse, and deny/allow tests are explicitly approved.

Reveal and profile visibility boundaries:
- Real profile visibility remains owner-approved and connection/context-bound only.
- Real profile visibility must never depend only on Android/client-side checks.
- Reveal must never grant raw `profiles_private` table read access.
- Monetization must never bypass identity, reveal, consent, or anti-abuse boundaries.

Android/voice/live anti-abuse planning:
- Android client signals are untrusted and may only inform risk scoring.
- Root/emulator/hook checks are weak risk signals, not absolute blockers.
- Fake microphone input, replay/pre-recorded voice, repeated upload/replay, local storage tampering, live-session manipulation, and speed/volume/device metadata abuse must be treated as future attack paths.
- Server-side verification, rate limits, abuse scoring, voice freshness/liveness boundaries, replay detection, and upload nonce/session binding are required before voice/reveal/runtime acceptance.

Phase boundary: no SQL, migration, DB command, runtime integration, Auth/Supabase client, Storage, Reveal, RPC/view/function/trigger, test data/user, staging, or production work is approved by this note.
