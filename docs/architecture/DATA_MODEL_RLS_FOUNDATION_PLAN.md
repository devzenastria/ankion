\# Data Model + RLS Foundation Plan



\## Phase



Phase 17A — Documentation-only Data Model + RLS Foundation Planning



\## Purpose



This document defines the first security-focused data model and RLS planning foundation for ankion.



The goal is to protect the core product rule:



Real profile identity must not leak through anonymous voice, media, chat, feed, or reveal request flows.



This phase is documentation-only.



No Supabase implementation is included in Phase 17A.



\---



\## Current Product State



ankion is currently static and behavior-free.



Completed static foundation includes:



\- Home

\- Discover

\- Feed

\- Chat

\- Profile

\- Reveal Requests

\- Dark-first UI foundation

\- Static Link-based navigation

\- Android APK visual check

\- Docs/status alignment through Phase 16D



No real backend exists yet.



No Supabase project files exist yet.



No Auth exists yet.



No RLS policies exist yet.



No Storage buckets exist yet.



No migrations exist yet.



\---



\## Core Security Rule



Anonymous interaction and real profile identity must be separated.



The system must never expose real profile data through:



\- Discover

\- Feed

\- Chat

\- Voice messages

\- Media moments

\- Reveal requests

\- Notifications

\- Public reads

\- Storage URLs

\- Query joins



Real profile visibility opens only after owner-approved reveal.



\---



\## High-Level Identity Model



\### Auth User



Purpose:



Represents the authenticated account.



Future source:



Supabase Auth.



Contains:



\- auth user id

\- account session identity



Must not directly expose:



\- public profile details

\- anonymous interaction identity

\- reveal decision state



\---



\### Private Profile



Purpose:



Stores the real profile owned by the user.



Possible future fields:



\- user\_id

\- display\_name

\- bio

\- avatar\_path

\- profile\_visibility\_settings

\- created\_at

\- updated\_at



Access rule:



Only the owner can read/write full private profile data by default.



Other users can only see it after approved reveal rules allow it.



\---



\### Anonymous Public Handle



Purpose:



Represents the anonymous interaction identity.



Possible future fields:



\- anonymous\_id

\- owner\_user\_id

\- voice\_style\_metadata placeholder

\- created\_at

\- status



Access rule:



Other users may see anonymous interaction surfaces, but not the linked owner profile unless reveal is approved.



Important:



The anonymous handle must not leak owner\_user\_id through client-readable joins.



\---



\## Proposed Future Tables



This is planning only.



No migrations are created in this phase.



\### profiles\_private



Purpose:



Real profile data.



Owner:



Authenticated user.



Read access:



\- Owner only by default

\- Approved reveal recipient only through controlled policy/view later



Write access:



\- Owner only



Risk:



If this table is readable too broadly, real identity leaks.



\---



\### anonymous\_identities



Purpose:



Anonymous identity layer used in Discover, Feed, Chat, voice, and media flows.



Read access:



\- Limited public/participant-safe fields only



Write access:



\- Owner only



Risk:



Direct owner\_user\_id exposure can break anonymity.



Mitigation:



Use safe views or strict RLS to hide owner linkage from non-owner users.



\---



\### conversations



Purpose:



Chat container between anonymous interaction participants.



Possible future fields:



\- id

\- initiator\_anonymous\_id

\- recipient\_anonymous\_id

\- created\_at

\- last\_activity\_at



Read access:



\- Conversation participants only



Write access:



\- Controlled by participant rules



Risk:



Conversation membership can reveal relationship graph.



\---



\### voice\_messages



Purpose:



Stores metadata for anonymous voice messages.



Possible future fields:



\- id

\- conversation\_id

\- sender\_anonymous\_id

\- audio\_path

\- duration\_seconds

\- created\_at

\- expires\_at optional



Read access:



\- Conversation participants only



Write access:



\- Sender only

\- Enforce daily/send-limit rules later



Risk:



Storage path or metadata could reveal real user identity.



\---



\### reveal\_requests



Purpose:



Stores profile visibility requests.



Possible future fields:



\- id

\- conversation\_id

\- requester\_user\_id or requester\_anonymous\_id

\- owner\_user\_id

\- status

\- created\_at

\- decided\_at



Status language:



Internal status can use controlled enum later, but user-facing copy should stay calm.



Possible internal states:



\- pending

\- approved

\- kept\_private



Avoid user-facing harsh language:



\- rejected

\- denied



Read access:



\- Request owner

\- Requester, only limited fields



Write access:



\- Requester can create

\- Owner can decide



Risk:



Request records can leak who owns which anonymous identity.



\---



\### profile\_visibility\_grants



Purpose:



Represents approved visibility.



Possible future fields:



\- id

\- profile\_owner\_user\_id

\- viewer\_user\_id

\- conversation\_id

\- created\_at

\- revoked\_at optional



Read access:



\- Owner

\- Approved viewer



Write access:



\- Owner only



Risk:



Wrong policy can expose private profiles globally.



\---



\### feed\_items



Purpose:



Future anonymous photo/video/audio moments.



Possible future fields:



\- id

\- anonymous\_identity\_id

\- media\_type

\- media\_path

\- caption optional

\- created\_at



Read access:



\- Public or discovery-scoped, depending on later product decision



Write access:



\- Owner only



Risk:



Media metadata or storage path can reveal real identity.



\---



\## RLS Policy Matrix Draft



| Area | Owner read | Owner write | Participant read | Public read | Notes |

|---|---:|---:|---:|---:|---|

| profiles\_private | Yes | Yes | Only after grant | No | Real identity protected |

| anonymous\_identities | Yes | Yes | Safe fields only | Safe fields only | Hide owner linkage |

| conversations | Yes if participant | Controlled | Yes if participant | No | No public conversation graph |

| voice\_messages | Sender/participant | Sender only | Yes if participant | No | Audio stays scoped |

| reveal\_requests | Owner/requester scoped | Requester creates, owner decides | Limited | No | Avoid identity leakage |

| profile\_visibility\_grants | Owner/viewer scoped | Owner only | Viewer scoped | No | Controls profile reveal |

| feed\_items | Owner | Owner | Depends later | Possibly safe public | No real profile joins |



\---



\## Storage Boundary Planning



Future Storage buckets should be planned separately.



Possible buckets:



\- voice-messages

\- profile-avatars

\- feed-media



Rules:



\- Voice files should not be public by default.

\- Profile avatars should not be public unless profile visibility allows it.

\- Feed media can be public only if it does not expose real profile identity.

\- Storage paths must not include real user names, emails, or obvious identifiers.



Risk:



Even with correct table RLS, public storage URLs can leak identity.



\---



\## Reveal Safety Rules



Reveal must be explicit.



A profile becomes visible only if:



1\. A reveal request exists.

2\. The profile owner approves visibility.

3\. A visibility grant exists.

4\. The viewer is the approved recipient.

5\. The profile query checks the grant.



No grant means no real profile visibility.



\---



\## Anti-Leak Rules



Never expose:



\- owner\_user\_id to non-owner users

\- private profile rows by default

\- auth user email

\- storage paths containing real identity

\- joined private profile data in public feeds

\- reveal request owner identity before allowed

\- requester identity beyond safe scope

\- profile avatar before visibility grant



\---



\## Implementation Order Later



Do not implement now.



Future safe order:



1\. Supabase project planning

2\. Auth skeleton planning

3\. Initial schema draft

4\. RLS policy matrix expansion

5\. Migration planning

6\. Local SQL review

7\. Supabase implementation only after approval

8\. RLS tests before UI integration



\---



\## Forbidden In Phase 17A



Do not add:



\- Supabase files

\- Auth code

\- RLS SQL

\- Storage buckets

\- Migrations

\- Backend/API

\- Real data models in code

\- Package installs

\- package.json edits

\- pnpm-lock.yaml edits

\- Route changes

\- UI changes

\- Mock data

\- Recorder/audio behavior

\- Reveal behavior



\---



\## Acceptance Criteria for Phase 17A



Phase 17A is complete when:



\- This document exists.

\- No route files changed.

\- No component files changed.

\- No package files changed.

\- No lockfile changed.

\- No Supabase/Auth/RLS/Storage/migration files were added.

\- Initial data model boundaries are documented.

\- Initial RLS policy matrix direction is documented.

\- Real profile leak risks are identified.

\- Future implementation order is clear.



\---



\## Current Decision



The next technical foundation work should continue as planning only.



Recommended next phase:



Phase 17B — Anonymous Identity / Real Profile Separation Plan

## Phase 17E Alignment Note

Phase 17E confirms Phase 17A through Phase 17D are complete as documentation-only security foundation planning.

Confirmed:

- Data model and RLS foundation planning is documented.
- Anonymous identity / real profile separation planning is documented.
- Reveal request security planning is documented.
- Voice / media storage boundary planning is documented.
- No Supabase/Auth/RLS/Storage implementation files, migrations, SQL, backend/API, route/component, package, lockfile, or apps/web source changes were added.

## Phase 20D Schema Readiness Review Note

Phase 20D confirms the data model direction remains correct for planning, but finalized schema readiness is NOT READY.

Confirmed:

- Private profile data and anonymous identity data must remain separated.
- Reveal grants remain the only planned bridge to real profile visibility.
- Public/discover/feed/chat surfaces must not expose `owner_user_id` or private profile fields.
- No SQL, migrations, Supabase/Auth/RLS/Storage implementation, package, route, backend/API, `.env`, or runtime changes were added.

## Phase 20E RLS Readiness Review Note

Phase 20E confirms the data model and RLS foundation remains planning-only.

RLS policy verification is NOT READY until private profile ownership, anonymous identity visibility, conversation participant access, voice message participant access, reveal requester/owner rules, visibility grant checks, feed public-safe fields, and storage/media metadata boundaries can be verified table by table.

No broad select policy is acceptable, and no public-safe surface may expose `owner_user_id` or private profile fields.

## Phase 20F Storage Boundary Review Note

Phase 20F confirms Storage privacy boundary readiness is NOT READY.

Anonymous media ownership, private profile media ownership, feed media public-safe access, voice media participant access, reveal-grant-dependent media access, signed URL assumptions, and media metadata relationship rules still need final review. Storage paths and metadata must not expose `owner_user_id`, private profile identifiers, real names, emails, phone numbers, or real profile handles.

## Phase 20G Auth Boundary Review Note

Phase 20G confirms Auth flow boundary readiness is NOT READY.

Auth account identity may be used for ownership checks, but it must not be exposed as public identity. Anonymous identity must remain separate from real profile identity, and public/discover/feed/chat surfaces must not expose `owner_user_id`, private profile fields, email, phone, provider metadata, or real profile handles.

## Phase 20H Migration Safety Boundary Note

Phase 20H confirms migration rollback/check strategy is PLANNED while real migration execution remains BLOCKED / NO-GO.

Future migrations must preserve private vs anonymous data separation, deny public leakage of `owner_user_id` and private profile fields, document rollback risk, and stop on failed migration states until privacy posture is verified.

## Phase 24E Field Classification And Identity Boundary Note

Phase 24E sets the default field classification model for the first private profile and anonymous identity schema planning slice.

`FIELD_CLASS` values:

- `SERVER_ONLY`
- `OWNER_ONLY`
- `REVEAL_CONTEXT_ONLY`
- `ANONYMOUS_SAFE_PREVIEW`
- `AGGREGATE_SAFE`
- `PROHIBITED`

Default rule: if a field classification is unclear, it is `SERVER_ONLY`.

`profiles_private` is owner-only by default. Non-owner visibility must be `REVEAL_CONTEXT_ONLY` and must come from an owner-approved connection/context grant through safe DTO/view/RPC boundaries.

`anonymous_identities` may support anonymous previews, but those previews must not expose `owner_user_id`, `auth_user_id`, `profile_private_id`, private profile fields, real names, private photos, verification details, moderation internals, device/IP/security metadata, or any anonymous-to-real correlation path.

RLS readiness remains blocked from implementation until deny tests are defined for owner access, non-owner denial, pending requester denial, approved connection-scoped reveal access, revoked/blocked access denial, and anonymous preview leakage denial.

## Phase 24F RLS Matrix Cross-Reference

Phase 24F keeps the Phase 24E field classification model and applies it to the RLS planning matrix for `profiles_private` and `anonymous_identities`.

Classification default remains: unclear fields are `SERVER_ONLY`.

Phase 24F confirms:

- `profiles_private` raw non-owner access is `DENY`.
- owner access is `OWNER_ONLY`.
- approved reveal access is `DTO_ONLY` and connection/context-scoped.
- `anonymous_identities` raw non-owner access is `DENY`.
- anonymous preview access is `DTO_ONLY` through safe preview DTO/view/RPC.
- no DTO may expose owner/auth/private-profile linkage, moderation internals, verification internals, device/IP metadata, raw storage paths, or anonymous-to-real correlation.

Canonical details live in `docs/architecture/EXPANDED_RLS_POLICY_MATRIX_PLAN.md`. Mandatory deny tests live in `docs/architecture/TESTING_AUDIT_PROCEDURE_PLAN.md`.

## Phase 24G Auth Ownership Boundary Cross-Reference

Phase 24G confirms that future RLS ownership must derive from authenticated session, not from client-provided ids.

Rules:

- Client-provided `owner_user_id` is unsafe and must not be trusted.
- Insert/update policies must prevent owner spoofing.
- `profiles_private.owner_user_id` remains an internal ownership link.
- `anonymous_identities.owner_user_id` remains an internal ownership link.
- Auth session proves ownership but does not create public profile visibility.
- Owner-safe DTOs and reveal-safe DTOs must remain separate.
- Auth/session boundary is a prerequisite for executable RLS.

## Phase 28I - Conversation / Connection Primitive Data/RLS Preflight (2026-06-18)

Phase 28I records the next planned backend slice after the local controlled creation boundary passed harness verification.

Next slice:
- Conversation / connection primitives.

Why next:
- They follow the now-validated `profiles_private` and `anonymous_identities` creation foundation.
- They support anonymous voice -> reply / connection.
- They do not require Reveal, Storage, public profile search, user search, profile browsing, or runtime app binding.
- They preserve the rule that real profile visibility remains owner-approved and connection/context-bound only.

Future data/RLS boundaries:
- SELECT must be owner/participant-only through authenticated ownership of a participant anonymous identity.
- No global conversation list or public conversation graph.
- No cross-owner conversation access.
- No raw `profiles_private` read path.
- No reveal implication from conversation membership alone.
- No direct broad write policy.
- No room/chat-room/member-directory model.

Anti-abuse carryover:
- Android/client signals remain untrusted.
- Fake microphone, replay/pre-recorded voice, repeated upload/replay, local storage tampering, live-session manipulation, and connection/reply manipulation remain future server-side concerns.
- Rate limits and abuse scoring are required later before runtime acceptance.
- Reveal, identity, consent, and monetization bypass remain blocked.

No SQL, migration creation/editing, DB command, RLS harness, test data/user, runtime integration, Storage, Reveal, APK/native, staging, or production work is approved by this note.

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

## Phase 27B - Owner-Controlled Creation Path Planning (2026-06-18)

Status: PASS - docs-only planning update. No SQL, migration, DB command, RLS harness, test data/user, Auth/runtime, Supabase runtime, Storage, Reveal, RPC/view/function/trigger, package/env/APK/native, staging, or production work was performed.

### Creation Boundary Decision

Direct broad INSERT remains blocked for `profiles_private` and `anonymous_identities`.

Preferred later path: controlled creation boundary. The boundary may be a narrowly approved server-side service/RPC/function design in a future explicit phase, but Phase 27B does not implement or choose executable SQL. The boundary must derive ownership from the authenticated session/server context, not from client-supplied `owner_user_id`.

Direct owner INSERT policy remains a conditional fallback only. It is acceptable to reconsider later only if the policy is narrow, owner-bound, field-limited, protected by immutable owner linkage, covered by deny/allow tests, and reviewed against duplicate creation and abuse risks. It is not the preferred default.

### profiles_private Creation Requirements

Future creation must:
- create at most one active/private profile row per Auth user.
- set `owner_user_id` from trusted server/session context only.
- reject client-supplied owner reassignment or system/safety fields.
- initialize profile visibility, safety, verification, soft-delete, and audit fields with server-owned defaults.
- avoid public username, profile search, global profile slug, public profile browsing, or global profile opening semantics.
- keep raw private profile rows owner-only by default.

### anonymous_identities Creation Requirements

Future creation must:
- keep V1 to one active anonymous identity per Auth user unless a later rotation phase changes it.
- set owner linkage from trusted context only.
- keep anonymous identity app-facing and separated from real profile identity.
- prevent anonymous-to-real lookup paths in non-owner DTOs.
- avoid user search, anonymous identity search, global directory, room/member-directory, and browse semantics.
- initialize safety/status/rotation/audit fields through server-owned defaults.

### RLS / Policy Preconditions

Before implementation:
- Existing owner-bound SELECT policies remain the only implemented RLS policies for these two tables.
- INSERT/UPDATE/DELETE remain deny-by-default until a separate explicit GO approves the creation boundary.
- Future RLS must test cross-owner spoofing, duplicate creation, `owner_user_id` reassignment, system/safety field mutation, raw reveal/profile read denial, and public/search/browse/global denial.
- Reveal must never grant raw `profiles_private` table read access.
- Monetization must never bypass identity, reveal, consent, or anti-abuse boundaries.

### Anti-Abuse / Android / Voice Preconditions

Creation path approval must account for:
- creation path abuse and repeated provisioning attempts.
- Android manipulation risks, with all client signals treated as untrusted.
- root/emulator/hook detection as weak risk signal only, not final security.
- fake microphone input and pre-recorded/replayed voice risk.
- repeated upload/replay and local storage tampering.
- live interaction manipulation.
- speed, volume, and device metadata abuse.
- server-side verification required later.
- rate limits and abuse scoring required later.
- voice freshness/liveness boundaries, replay detection boundaries, and upload nonce/session binding before runtime acceptance.
- moderation, consent, and reveal manipulation risks.

### Future GO Gates

Separate explicit human GO remains required for:
- migration creation or editing.
- local migration apply or DB mutation.
- RLS/write policy implementation.
- controlled function/RPC/service boundary implementation.
- Auth/Supabase runtime integration.
- RLS harness execution or test data/user creation.
- Storage, Reveal, RPC/view/function/trigger, staging, or production.

## Phase 27C - Creation Path Implementation Preflight / Checklist (2026-06-18)

Status: PASS - docs-only preflight/checklist. No SQL, migration, DB command, RLS harness, test data/user, Auth/runtime, Supabase runtime, Storage, Reveal, RPC/view/function/trigger, package/env/APK/native, staging, or production work was performed.

### Phase 28A Candidate Implementation Boundary

Recommended first backend slice: Phase 28A - Controlled Creation Boundary Implementation Slice.

The narrowest acceptable target is the owner-controlled creation boundary prerequisites for `profiles_private` and `anonymous_identities`. Phase 28A should not include Auth runtime, Supabase client runtime, Storage, Reveal, app binding, voice upload runtime, APK/native, staging, or production.

Safe target options for Phase 28A, in order of preference:
1. non-executable implementation draft/checklist for controlled creation boundary SQL and tests.
2. a narrowly scoped local-only migration draft only if separately approved.
3. local-only executable migration creation only after another explicit GO and static review.

### profiles_private Creation Preflight

Requirements before any implementation:
- Owner-bound creation only.
- `owner_user_id` must be derived from trusted server/session context, never trusted from client payload.
- Client must not set safety, status, audit, verification, visibility, moderation, soft-delete, or system fields.
- Safe defaults must initialize profile status, visibility default, safety state, verification summary, timestamps, and soft-delete fields.
- Duplicate private profile creation must be prevented by owner uniqueness and idempotent provisioning semantics.
- Soft delete/reactivation must be a separate explicit design; creation must not silently restore or duplicate soft-deleted rows.
- RLS `WITH CHECK` for any direct fallback must require `auth.uid() = owner_user_id`, but RLS alone is not enough to protect field mutability.
- Tests must pass before apply: owner own-row create, owner spoof denial, duplicate denial, non-owner denial, unauthenticated denial, denied-field mutation denial, and raw reveal read denial.

### anonymous_identities Creation Preflight

Requirements before any implementation:
- Owner-bound internally, anonymous-facing externally.
- No real profile leakage through owner linkage, label, visual seed, voice presence, status, or DTO output.
- No public/global lookup, profile search, user search, anonymous identity search, browse, room/member-directory, or global directory behavior.
- V1 one-active-identity-per-owner rule must be enforced.
- Rotation/history remains deferred to a separate explicit phase.
- Safety/status/rotation/audit defaults must be server-owned.
- Anonymous label, visual seed, and voice presence defaults must be safe and non-identifying.
- RLS `WITH CHECK` for any direct fallback must require `auth.uid() = owner_user_id`, but controlled creation remains preferred.
- Tests must pass before apply: owner own identity create, owner spoof denial, duplicate active identity denial, non-owner denial, unauthenticated denial, denied-field mutation denial, anonymous-to-real correlation denial, and global directory/search denial.

### Field Mutability Matrix Preflight

| Category | profiles_private examples | anonymous_identities examples | Rule |
|---|---|---|---|
| Client-provided fields | chosen display name, short bio, optional owner-safe profile preferences | optional anonymous label preference if allowed later | Allowed only through strict allowlist and validation. |
| Server/default-only fields | id, created_at, updated_at, default visibility/status values | id, created_at, updated_at, default active/status values | Client must not set directly. |
| Immutable ownership fields | owner_user_id | owner_user_id | Derived from trusted context and never reassigned. |
| Safety/moderation fields | safety_state, moderation flags | safety state, disabled/archive status | Server/moderation only. |
| Audit fields | created_at, updated_at, deleted_at, audit metadata | created_at, updated_at, deleted_at, rotation/audit metadata | Server only. |
| Reveal/visibility fields | profile_visibility_default, reveal-safe projection eligibility | none that exposes real profile | Must not grant raw profile reads. |
| Future verification fields | verification_summary_state | voice/safety summary if any | Server-owned; client signal is untrusted. |

### Android / Voice / Live Anti-Abuse Preflight

Before voice/reveal/runtime acceptance, future plans must handle untrusted client signals, fake microphone input, replay/pre-recorded voice, repeated upload/replay, local storage tampering, live-session manipulation, speed/volume/device metadata abuse, root/emulator/hook checks as weak risk signals only, server-side verification, rate limits, abuse scoring, voice freshness/liveness, upload nonce/session binding, and replay detection.

Real profile visibility must never depend only on client-side checks. Monetization must never bypass identity, reveal, consent, or anti-abuse controls.

## Phase 29A - Conversation / Connection Primitive Data Boundary Candidate (2026-06-18)

Result: PASS - a narrow migration candidate now models connection primitives without applying them to any DB.

Data boundary:
- `connections` represents anonymous voice reply / connection continuity.
- `connection_participants` represents the participant boundary for anonymous identities inside a connection.
- The candidate depends on `anonymous_identities` and does not depend on `profiles_private`.
- Connection status and reply eligibility are server-owned future states and do not imply real profile reveal.
- Safety/moderation fields are present for future server-side enforcement and must not rely on client-only Android/device signals.

RLS boundary:
- RLS is enabled deny-by-default.
- No policies are created in Phase 29A.
- Future SELECT must be participant-only.
- Future write access must use a controlled boundary and must not trust client-supplied owner IDs.
- No raw `profiles_private` read, public/global conversation list, profile/user search, room/chat-room model, or reveal shortcut is introduced.

## Phase 30A - Owner-Controlled Creation Path Rebaseline (2026-06-19)

Status: PASS - docs-only planning update. No DB command, SQL execution, migration creation/editing/apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Current data model baseline:
- `public.profiles_private.owner_user_id` references `auth.users(id)` and is unique through `profiles_private_owner_user_id_key`.
- `public.profiles_private` includes status, safety, visibility, verification, timestamp, and soft-delete fields that must remain server/default-owned during first creation.
- `public.anonymous_identities.owner_user_id` references `auth.users(id)`.
- `public.anonymous_identities` includes `status`, `safety_state`, `rotation_state`, `rotated_at`, timestamps, and `deleted_at`.
- `anonymous_identities_one_active_per_owner_idx` preserves one active anonymous identity per owner where `status = 'active'` and `deleted_at is null`.
- RLS is enabled on both tables. Owner SELECT policies exist. Direct INSERT/UPDATE/DELETE policies are still absent.

Preferred future creation model:
- Controlled authenticated RPC/function boundary remains preferred over direct INSERT RLS.
- The boundary must derive ownership from `auth.uid()` and must not accept `owner_user_id` from the client.
- Caller-controlled input must stay limited to an explicit allowlist; owner, safety, status, verification, rotation, audit, deleted, reveal, and system fields remain unavailable to the caller.
- Direct INSERT RLS is a conditional fallback only if future review proves strict `WITH CHECK`, field-level mutability, duplicate prevention, and abuse controls without broad privilege escalation.

Creation invariants:
- An authenticated user can create or receive only their own private profile.
- An authenticated user can create or receive only their own anonymous identity.
- Duplicate private profiles and duplicate active anonymous identities must be blocked or safely idempotent.
- Anonymous labels, visual seeds, and voice presence fields must remain non-identifying and must not encode real profile attributes.
- No public anonymous creation, service-role dependency, profile search, user search, global browsing, or anonymous-to-real lookup path is allowed.

Exact next GO:
`GO: Create Phase 30A docs checkpoint commit only.`

## Phase 30B - Owner-Controlled Creation Migration Shape Plan (2026-06-19)

Status: PASS - docs-only migration planning update. No DB command, SQL execution, migration creation/editing/apply, RLS harness, auth simulation, test data/user creation, runtime integration, package/env/APK/native work, staging, or production occurred.

Future migration objective:
- Keep creation of `public.profiles_private` and `public.anonymous_identities` behind a controlled authenticated function boundary.
- Do not add broad direct INSERT/UPDATE/DELETE table grants or generic write policies.
- Derive ownership from `auth.uid()` only.

Planned function boundary:
- Preferred future functions: `public.create_my_private_profile(...)` and `public.create_my_anonymous_identity(...)`.
- The existing `public.create_owner_identity_foundation(text, text, text)` may remain only as a reviewed wrapper or compatibility function if it does not broaden output or ownership semantics.
- Function signatures must not accept `owner_user_id`, target user id, `profile_private_id`, `anonymous_identity_id`, safety/status/verification/rotation/deleted fields, reveal fields, or arbitrary JSON mutation payloads.

`profiles_private` creation plan:
- Authenticated owner can create or receive only one own private profile.
- `owner_user_id` is set internally from `auth.uid()`.
- Duplicate prevention relies on `profiles_private_owner_user_id_key` plus explicit conflict/error handling.
- Caller input is limited to approved profile fields such as chosen display name, short bio, and age band after validation.
- Server/default-owned fields remain unavailable: status, safety, visibility default, verification summary, audit/timestamps, deleted state, and future face verification result fields.

`anonymous_identities` creation plan:
- Authenticated owner can create or receive only own anonymous identity.
- Active identity uniqueness relies on `anonymous_identities_one_active_per_owner_idx`.
- Anonymous label, visual seed, and voice presence fields must be generated or allowlisted as non-identifying values.
- Caller cannot link an identity to another owner, hijack another anonymous identity, rotate another identity, or set safety/status/rotation/deleted fields.

Face verification boundary:
- Future identity verification is separate from this creation migration plan.
- A later managed IDV SDK direction, for example `@veriff/react-native-sdk`, may be considered only in a runtime/device phase.
- Database storage should be limited to verification result fields; raw face images, selfie video, ID media, and biometric embeddings must not be stored by ANKION.

Next required GO:
`GO: Create Phase 30B docs checkpoint commit only.`

## Phase 30C - Existing Owner-Controlled Creation Boundary Assessment (2026-06-20)

Status: NO-GO / ALREADY_IMPLEMENTED - no new SQL migration draft was created. Existing migrations already implement the controlled creation boundary for `public.profiles_private` and `public.anonymous_identities`.

Data model evidence:
- `public.profiles_private.owner_user_id` is unique through `profiles_private_owner_user_id_key`.
- `public.anonymous_identities` has one active identity per owner through `anonymous_identities_one_active_per_owner_idx`.
- The controlled function creates or returns only rows for `auth.uid()`.

Function boundary:
- Existing function: `public.create_owner_identity_foundation(text, text, text)`.
- `auth.uid()` is required; unauthenticated callers are denied.
- `owner_user_id` is set internally and is not accepted as an input.
- Caller input is limited to validated profile display fields; status, safety, verification, rotation, audit, deleted, reveal, and system fields remain unavailable.
- Anonymous label, visual seed, and voice presence values remain controlled by function defaults.

Security posture:
- `SECURITY DEFINER` with fixed `search_path`.
- Schema-qualified crypto generation after the Phase 28F correction.
- No dynamic SQL.
- No service-role dependency.
- Explicit EXECUTE revoke/grant posture.
- No broad table grants and no direct write policies were added for client table writes.

Next required GO:
`GO: Create Phase 30C docs checkpoint commit only.`

## Phase 30D - Existing Owner-Controlled Creation Verification Planning (2026-06-20)

Status: PASS - docs-only verification planning. No DB command, SQL execution, migration creation/editing/apply, auth simulation, RLS harness, test data/user creation, runtime/Auth work, APK/native work, staging, or production occurred.

Existing boundary baseline:

- `public.create_owner_identity_foundation(text, text, text)` remains the target boundary.
- `auth.uid()` is required.
- `owner_user_id` is derived internally from `auth.uid()` and is not accepted as client input.
- `profiles_private_owner_user_id_key` prevents duplicate private profiles.
- `anonymous_identities_one_active_per_owner_idx` prevents duplicate active anonymous identities.
- `SECURITY DEFINER`, fixed `search_path`, schema-qualified references, no dynamic SQL, no service-role dependency, explicit EXECUTE revoke/grant posture, and no broad table grants remain the required security posture.

Future local verification plan:

- Verify function metadata, arguments, grants, RLS state, owner SELECT policies, and uniqueness constraints/indexes before behavioral tests.
- Use a local-only transaction-wrapped harness with User A, User B, and unauthenticated context.
- Prove User A can create only User A's own foundation.
- Prove spoofed `owner_user_id` cannot be supplied through the function input.
- Prove unauthenticated creation is denied.
- Prove duplicate private profile and duplicate active anonymous identity attempts are denied or safely idempotent.
- Prove cross-user creation, linkage hijacking, and non-owner SELECT are denied.
- Prove rollback/cleanup leaves no persistent deterministic test data.

Remaining blocked:

- Runtime Supabase/Auth integration, staging/production, APK/Android, Storage/voice upload, Reveal, monetization readiness, and face verification implementation remain separate explicit-GO phases.

Exact next GO:

`GO: Run Phase 30D checkpoint verification only.`
