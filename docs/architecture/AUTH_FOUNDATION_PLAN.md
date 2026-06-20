# Auth Foundation Plan

## Phase

Phase 18C — Documentation-only Auth Foundation Plan

## Purpose

This document defines the authentication foundation for ankion before any Supabase Auth implementation begins.

The goal is to decide how accounts, private profiles, anonymous identities, sessions, and RLS ownership will work safely.

This phase is documentation-only.

No Supabase Auth implementation is included in Phase 18C.

---

## Current Foundation

Completed planning:

- Phase 17A — Data Model + RLS Foundation Plan
- Phase 17B — Anonymous Identity / Real Profile Separation Plan
- Phase 17C — Reveal Request Security Model
- Phase 17D — Voice / Media Storage Boundary Plan
- Phase 17E — Data / RLS / Storage Foundation Audit + Docs Alignment
- Phase 18A — Supabase Implementation Readiness Checklist
- Phase 18B — Expanded RLS Policy Matrix Plan

Current state:

- No Supabase client exists
- No Auth code exists
- No Auth UI exists
- No migrations exist
- No SQL exists
- No RLS policies exist
- No backend/API exists

---

## Core Auth Rule

Auth account identity must be used for ownership and security.

Auth account identity must not be exposed as the user’s public social identity.

The app must separate:

1. Auth Account
2. Private Real Profile
3. Anonymous Identity

---

## Identity Creation Order

Recommended future order:

1. User creates Auth account.
2. System creates `profiles_private` row for the user.
3. System creates `anonymous_identities` row for the user.
4. User enters app through static/product flow.
5. Real profile stays private by default.
6. Anonymous identity is used for Discover, Feed, Chat, voice, and media interactions.

---

## Auth Account

Future source:

Supabase Auth.

Purpose:

- login
- session
- RLS ownership checks
- account lifecycle
- secure user identity

Should not be shown in:

- Discover
- Feed
- Chat
- public anonymous surfaces
- reveal request previews
- feed media cards

Sensitive values:

- auth user id
- email
- provider metadata
- phone number if used later
- auth timestamps

---

## profiles_private Creation

Purpose:

Stores real profile identity.

Creation timing:

After successful Auth account creation.

Possible creation strategies:

1. Client creates profile after signup
2. Database trigger creates profile after Auth user insert
3. Server/RPC creates profile after onboarding

Preferred future direction:

Use controlled server/RPC or trigger-based creation after Auth user exists.

Reason:

Avoid duplicate profiles, missing profiles, and unsafe client-side ownership fields.

Default visibility:

Private.

---

## anonymous_identities Creation

Purpose:

Stores anonymous interaction identity.

Creation timing:

After Auth account creation and private profile creation.

Possible creation strategies:

1. Automatically create one anonymous identity per account
2. Create during first app entry
3. Create during first Discover/Feed/Chat interaction

Preferred future direction:

Create one default anonymous identity during onboarding/account initialization.

Reason:

Discover, Feed, Chat, voice messages, and media need an anonymous identity layer before real behavior begins.

---

## Session Handling Direction

Mobile app should eventually need:

- auth session loading
- signed-in state
- signed-out state
- session refresh handling
- safe loading UI
- safe error UI
- logout behavior

Not implemented now.

Future session states:

- loading
- signed_out
- signed_in_missing_profile
- signed_in_missing_anonymous_identity
- signed_in_ready

Important:

The app should not start real data queries until session state is known.

---

## Unauthenticated Access Direction

Current app is static and open.

Future decision needed:

Unauthenticated users may see:

- landing/home screen
- product explanation
- maybe limited public-safe marketing screen

Unauthenticated users must not access:

- private profile data
- conversations
- voice messages
- reveal requests
- profile visibility grants
- owner-linked anonymous identity data

Recommendation:

Keep real app interactions authenticated.

---

## RLS Ownership Principle

Future RLS policies should use:

```txt
auth.uid()
```

## Phase 18F Alignment Note

Phase 18F confirms this document is part of the completed Phase 18 Supabase readiness planning set.

Confirmed:

- This remains documentation-only.
- No Supabase implementation, Supabase client, Auth code, RLS SQL, Storage buckets/policies, migrations, `.sql`, `.env`, package install, backend/API, route/component, package, lockfile, or apps/web source changes were added.

## Phase 20B Go/No-Go Review Note

Phase 20B confirms this document remains part of the Supabase planning foundation only.

Confirmed:

- This plan does not authorize Supabase implementation.
- Related implementation remains NO-GO until all readiness gates are explicitly passed.
- No SQL, migrations, Supabase client, Auth, RLS, Storage, `.env`, package, backend/API, route, or apps/web changes should start from this plan alone.

## Phase 20D Schema Readiness Review Note

Phase 20D confirms Auth planning remains documentation-only while finalized schema readiness is NOT READY.

Auth implementation must wait until schema ownership, private profile creation timing, anonymous identity creation timing, and client-safe ownership boundaries are finalized and reviewed.

## Phase 20E RLS Auth Boundary Note

Phase 20E confirms that RLS policy verification depends on final Auth ownership boundaries.

Future RLS verification must know exactly how authenticated users map to private profiles, anonymous identities, conversation participation, reveal request ownership, and visibility grant access. Until that boundary is reviewed and approved, Auth and RLS remain planning-only.

No Auth code, Supabase client, RLS SQL, or policy implementation is authorized by this note.

## Phase 20F Storage Auth Boundary Note

Phase 20F confirms Storage privacy readiness depends on future Auth ownership boundaries.

Future Storage access checks must know exactly how authenticated users map to private profiles, anonymous identities, conversation participation, reveal grants, and media ownership before uploads, reads, signed URLs, deletes, revokes, or expirations can be implemented.

## Phase 20G Auth Flow Readiness Review Note

Phase 20G reviewed whether this Auth foundation plan is ready for future Supabase Auth implementation.

Gate status:

```txt
NOT READY
```

Review result:

- Auth planning exists, but it is not implementation-ready.
- Phase 20D finalized schema readiness remains NOT READY.
- Phase 20E RLS policy verification readiness remains NOT READY.
- Phase 20F Storage privacy boundary readiness remains NOT READY.
- Future Auth needs include user account identity, private profile ownership, anonymous identity creation, session boundary, reveal request ownership, profile visibility grant ownership, and media ownership.
- `auth.user_id` may map to private ownership, but it must not be exposed through public, discover, feed, or chat surfaces.
- Anonymous identity must not reveal real profile identity.
- No service role key may be used in the mobile client.
- Client integration must remain blocked until schema, RLS, Storage, Auth, environment, and testing/audit gates pass.

Unresolved Auth flow blockers:

- account creation boundary is not finalized
- private profile row creation assumptions are not finalized
- anonymous identity creation assumptions are not finalized
- login/session ownership boundary is not finalized
- session loading, refresh, signed-out, and missing-profile states need final review
- reveal request requester/owner identity rules are not finalized
- visibility grant ownership and access rules are not finalized
- media ownership rules are not finalized
- deleted/deactivated account behavior is unclear
- blocked/suspended account assumptions are unclear
- client-safe Auth usage rules need final review
- Auth audit/test expectations are incomplete
- schema, RLS, and Storage readiness gates remain NOT READY

Decision:

Do not add Auth implementation, login/signup UI, session handling, Supabase client, package installs, environment files, SQL, migrations, or runtime behavior from this plan yet.

## Phase 20H Auth Migration Safety Note

Phase 20H confirms migration rollback/check strategy is PLANNED while Auth-related migration execution remains BLOCKED / NO-GO.

Future Auth-related migrations must document profile creation assumptions, anonymous identity creation assumptions, ownership fields, rollback risk, failed migration handling, and validation checks before any SQL, triggers, RPCs, Auth implementation, or Supabase client integration begins.

## Phase 20I Auth Environment Boundary Note

Phase 20I confirms environment variable strategy is PLANNED while Auth implementation remains BLOCKED / NO-GO.

Future Auth implementation must not expose provider secrets, service role keys, JWT secrets, production credentials, or private admin tokens through mobile code or `EXPO_PUBLIC_` variables. Auth environment values must be reviewed before login/signup UI, session handling, Supabase client setup, or Auth runtime behavior begins.

## Phase 20J Auth Client Boundary Note

Phase 20J confirms client integration boundary is REVIEWED / PLANNED while Auth implementation remains BLOCKED / NO-GO.

No session handling, login/signup UI, Auth provider setup, Supabase client setup, or Auth runtime behavior may begin until Auth flow boundary, environment strategy, RLS verification, Storage privacy, schema readiness, package alignment, and testing/audit gates are approved.

## Phase 20K Auth Testing Audit Note

Phase 20K confirms testing / audit procedure is PLANNED while Auth implementation remains BLOCKED / NO-GO.

Future Auth tests must verify authenticated ownership, unauthenticated access blocking, session boundaries, account deletion/deactivation handling, and anonymous identity / real profile separation.

No Auth implementation, session handling, login/signup UI, test implementation, package changes, or runtime behavior are authorized by this note.

## Phase 24D Auth Boundary Preflight Note

Phase 24D reviewed whether Auth/session implementation can begin.

Decision:

```txt
Auth boundary: NOT READY for implementation
```

Auth must not begin with login UI, route guards, route data binding, or real profile queries.

The first future Auth work, when separately approved, must define session state boundaries before product behavior:

- loading
- signed_out
- signed_in_missing_profile
- signed_in_missing_anonymous_identity
- signed_in_ready

Auth account identity may own private rows, but it must not become public product identity.

Real profile remains private by default. Even after Auth exists, real profile visibility is not global and must depend on owner-approved connection/context-scoped profile visibility grants plus block checks.

Anonymous identity creation must be reviewed after the `profiles_private` and `anonymous_identities` schema slice is finalized.

No Auth/session implementation, SDK dependency, SQL/migrations, RLS policies, Storage setup, route behavior, or runtime product behavior is authorized by Phase 24D.
## Phase 24E Auth Relationship Decision Note

Phase 24E sets the documentation-level Auth relationship decisions for the first schema planning slice.

`auth.users -> profiles_private`:

- exactly one private profile per auth user in V1.
- future SQL should enforce uniqueness on `profiles_private.owner_user_id`.
- private profile creation should remain controlled by trigger/server/RPC planning, not arbitrary client-owned id submission.

`auth.users -> anonymous_identities`:

- V1 safest default is one active anonymous identity per auth user.
- future rotation may keep history, but ownership linkage remains internal.

`anonymous_identities -> profiles_private`:

- no public direct relation.
- no client-visible join.
- no profile lookup through anonymous identity.

Auth/session implementation remains NOT READY. This note does not authorize login UI, session runtime, SDK dependency, SQL/migration implementation, RLS policy implementation, Storage, route data binding, or backend/API work.

## Phase 24G Auth Session Boundary Plan

Phase 24G is documentation/planning-only. It does not create Auth/session runtime, login/signup UI, Supabase client implementation, executable SQL, migrations, RLS policies, Storage policies, backend/API logic, package changes, route data binding, or runtime product behavior.

Phase 24G decisions:

```txt
READY FOR NEXT NARROW SQL/AUTH PLANNING SLICE
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
```

### Phase 24G Allowed Session States

| State | Meaning | Access posture |
| --- | --- | --- |
| `unauthenticated` | No valid session. | No owner profile access, no anonymous identity ownership access, no reveal access. App may later show signed-out or local preview-only state, but this phase does not implement it. |
| `session_loading` | Session is being checked. | Client must not assume `owner_user_id`, must not show private profile data, and must not call private-profile or anonymous-identity owner APIs. |
| `authenticated_unprovisioned` | Auth session exists but `profiles_private` and/or active `anonymous_identities` may not exist. | App must not proceed as fully provisioned. Future provisioning must create required private records safely. |
| `authenticated_profile_ready` | Auth session exists and `profiles_private` exists. Active anonymous identity may still be missing. | Real profile remains owner-only and not public. |
| `authenticated_anonymous_ready` | Auth session exists and active anonymous identity exists. Private profile may still need completion depending on final flow. | Anonymous identity does not expose real profile. |
| `authenticated_ready` | Auth session exists, `profiles_private` exists, and active anonymous identity exists. | User can later enter authenticated app surfaces through safe DTOs only. Still no global profile visibility. |
| `session_expired` | Previous session is invalid/expired. | Clear sensitive local cache, require re-auth, and do not use stale owner/auth identifiers. |
| `suspended_or_deleted` | User exists but account status blocks app access. | Private and anonymous access must be denied; existing reveal grants must not allow access. |

### Phase 24G Safe Provisioning Order

Future provisioning must be idempotent and ownership must be derived from Auth/session internally:

1. Auth session is established.
2. Server/RLS-safe boundary derives authenticated user internally.
3. `profiles_private` is created if missing.
4. Active `anonymous_identities` record is created if missing.
5. Client receives only safe owner DTOs.
6. Client never receives cross-user `owner_user_id` or raw linkage.
7. User enters `authenticated_ready` only after required private profile and active anonymous identity records are present.

Rules:

- Client must not manually choose `owner_user_id`.
- Client must not send arbitrary profile owner ids.
- Server/RLS must derive ownership from authenticated session.
- Repeated app startup must not create duplicate `profiles_private` rows.
- Repeated app startup must not create duplicate active anonymous identities.
- V1 default: one `profiles_private` per auth user.
- V1 default: one active anonymous identity per auth user; rotation/history remains internal future work.

### Phase 24G Session Bootstrap Algorithm

Planning-level pseudocode only; not implementation.

`bootstrap_session()`:

1. set state = `session_loading`.
2. check current auth session.
3. if no session: clear sensitive private/anonymous/reveal cache and return `unauthenticated`.
4. if session exists but user is suspended/deleted: clear sensitive cache and return `suspended_or_deleted`.
5. check owner private profile through owner-safe boundary.
6. check active anonymous identity through owner-safe boundary.
7. if profile missing or anonymous identity missing: return `authenticated_unprovisioned`.
8. return `authenticated_ready` with safe owner DTOs only.

Client cache is never the source of truth for profile visibility, reveal state, or ownership.

### Phase 24G Logout / Account Switch / Cache Reset

`on_logout_or_account_switch()` must later:

- clear session.
- clear `OwnerProfileDTO` cache.
- clear `OwnerAnonymousIdentityDTO` cache.
- clear reveal grant cache.
- clear anonymous preview cache if linked to previous account context.
- clear voice/media signed URLs if introduced later.
- clear push token association if introduced later.
- clear local private identifiers.
- navigate to a safe signed-out state later.
- never show previous account private/reveal data after logout.

### Phase 24G Session Refresh / Expired Session Rules

- Expired session must not keep private profile state visible.
- Refresh failure must clear sensitive cache.
- Stale local data cannot authorize reveal.
- Stale reveal grant cannot authorize access after block, revoke, session expiry, deleted, or suspended state.
- Client cache is never source of truth for profile visibility.

### Phase 24G Auth Identifier Visibility Rules

Client may use these internally only after future Auth implementation is explicitly approved:

- current session status.
- safe owner DTOs.
- safe anonymous owner DTOs.
- safe anonymous preview DTOs.
- safe reveal profile DTOs.

Never expose to other users:

- `auth_user_id`.
- `owner_user_id`.
- `profile_private_id`.
- anonymous identity internal id when it enables correlation.
- email.
- phone.
- real name/legal name.
- device/IP/security metadata.
- service role key.
- raw session tokens.
- refresh tokens.
- private linkage fields.

### Phase 24G Auth And Reveal Rules

- Auth proves ownership/session.
- Auth does not make profiles public.
- Auth does not create global profile browsing.
- Auth does not allow profile search.
- Auth does not allow user search.
- Auth does not bypass reveal grant checks.
- Reveal still requires active owner-approved connection/context grant.
- Block, revoke, deleted, and suspended states override reveal.
- `connected_with_reveal` receives `DTO_ONLY`, never a raw profile row.

### Phase 24G Auth And Anonymous Identity Rules

- Auth user may own anonymous identity internally.
- Anonymous identity remains app-facing and anonymous.
- Client-facing anonymous preview must not expose owner/auth/private-profile linkage.
- Anonymous identity must not become a real-profile lookup key.
- Rotation/history must remain internal until separately approved.

### Phase 24G Auth And RLS Rules

- Future RLS must derive user ownership from authenticated session.
- Policies must not trust client-provided `owner_user_id`.
- Insert/update policies must prevent owner spoofing.
- Delete should be soft-delete unless a future phase approves hard delete.
- Deny tests are mandatory before SQL/RLS implementation.
- Auth/session plan is prerequisite for executable RLS.

### Phase 24G Auth And Service Role Rules

- Service role key remains backend-only.
- Service role key must never be in Expo public env, `.env.example`, app code, web code, client docs, screenshots, or logs.
- Service role use requires a separate backend/server boundary plan.
- Service role must not be treated as part of client Auth flow.

### Phase 24G Auth And Storage / Media Rules

- Auth/session does not authorize real media upload yet.
- Voice/photo/video storage remains blocked until Storage/RLS/privacy boundary phase.
- Any future media access must be connection/context-scoped and deny-by-default.

### Phase 24G Implementation Blockers

Actual Auth/Supabase implementation remains blocked by:

- `@supabase/supabase-js` is still not approved.
- runtime Supabase client remains inert.
- exact SQL/migration order is not implemented.
- migration rollback/check procedure is not executed.
- executable DTO/view/RPC contracts are not implemented.
- RLS policies are not implemented.
- service-role backend plan is not finalized.
- Storage/media boundary is not finalized.

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

## Phase 31A - Auth / Session Boundary Readiness Plan (2026-06-20)

Status: PASS - Auth/session boundary readiness planned as docs-only. No Supabase client implementation, Auth runtime, package install, env file, SQL, migration, DB command, psql, Docker DB command, Supabase CLI, auth simulation, target function call, test user/data creation, runtime wiring, APK/native change, staging, production, commit, or push occurred.

### Source Of Truth

Backend owner authority must come only from `auth.uid()`.

Rules:
- Client state is not an owner source.
- Cached identity is not an owner source.
- Local `anonymous_identity_id` is not owner authority.
- Fake entitlement, fake verification, debug flags, offline state, or rooted/emulator signals cannot produce backend authority.
- `owner_user_id` must not be client-selected, client-overridden, or accepted as an owner creation input.
- Owner assignment remains inside the backend function/RLS boundary.

The Phase 30J verified boundary remains the reference point:
- `public.create_owner_identity_foundation(text, text, text)`.
- No `owner_user_id` argument.
- Owner source is `auth.uid()`.
- Unauthenticated calls raise `AUTHENTICATED_OWNER_REQUIRED`.
- Duplicate owner creation may be safely idempotent by returning original IDs without creating duplicate or orphan rows.

### Session Lifecycle States

Planned future states:

| State | Meaning | Security posture |
| --- | --- | --- |
| `unknown_loading_session` | App is checking session. | No owner creation, no private query, no trusted identity display. |
| `unauthenticated` | No valid session. | No owner creation and no private/anonymous-owner access. |
| `authenticated` | Valid auth context exists. | Eligibility can be evaluated; owner is still backend-derived from `auth.uid()`. |
| `session_refresh_pending` | Refresh is in progress. | No owner creation until refresh result is known. |
| `session_expired` | Previous session is invalid. | Clear sensitive owner/identity/reveal cache and require recovery. |
| `local_cached_session_untrusted` | Local cached state exists but is not validated. | UI may show loading/recovery only; no backend authority. |
| `anonymous_identity_not_created` | Auth exists but active anonymous identity readiness is missing. | Future provisioning may be eligible only after valid session. |
| `anonymous_identity_ready` | Active anonymous identity is confirmed by backend-safe boundary. | Still not a real profile reveal. |
| `profile_creation_pending` | Owner foundation creation is pending. | UI must not assume completion. |
| `profile_creation_denied` | Backend denied creation or session is invalid. | Show safe error/recovery only. |
| `profile_creation_complete` | Backend confirms owner foundation exists. | Client may proceed only through safe DTO/RPC boundaries. |

### Planned DTO / State Boundary

Future DTO/state names:
- `AuthSessionState`.
- `AuthUserView`.
- `AnonymousIdentityReadiness`.
- `OwnerCreationReadiness`.
- `AuthErrorState`.
- `SessionRecoveryState`.

DTO rules:
- If `owner_user_id` appears in any future owner-safe DTO, it must be read-only, server-derived, and never accepted back as authority.
- Client payloads must not contain owner override, target owner, owner switch, target profile, or target anonymous identity fields.
- `anonymous_identity_id` from local cache can only be a UI hint until backend confirms it.
- UI optimistic state cannot replace backend truth.

### Owner Creation Trigger Boundary

Future flow:
1. If unauthenticated, do not call owner creation.
2. If session is loading or refresh is pending, do not call owner creation.
3. If local cached session is present but untrusted, do not call owner creation.
4. If session is valid, evaluate owner creation readiness.
5. Call `public.create_owner_identity_foundation(text, text, text)` only after a separate runtime integration GO.
6. Never send `owner_user_id` or target owner input.
7. Treat duplicate/idempotent original-ID response as safe only when backend row counts remain bounded.

Runtime integration remains a separate phase. Phase 31A does not wire screens, install packages, add env files, or call the function.

### Error / Denial States

Planned future handling:
- `AUTHENTICATED_OWNER_REQUIRED`.
- `session_missing`.
- `session_expired`.
- `session_refresh_failed`.
- `anonymous_identity_creation_pending`.
- `duplicate_idempotent_owner_creation_response`.
- `network_unavailable`.
- `backend_denial`.
- `local_cache_mismatch`.
- `replayed_session_suspected`.
- `rooted_debug_offline_trust_risk`.

### Abuse Carryover

Android/local-state risks remain untrusted:
- cached identity manipulation.
- fake entitlement.
- fake verification.
- replayed session.
- clock manipulation.
- offline bypass.
- rooted/emulator manipulation.
- debug flag abuse.
- client-side trust abuse.
- fake anonymous identity ready state.
- fake profile created state.
- local-only owner switch.

Instant abuse carryover:
- instant-match manipulation.
- reveal state manipulation.
- connection state manipulation.
- local UI forcing.
- cooldown/rate bypass.
- fake presence.
- fake waiting/replyable transition.
- local-only entitlement spoofing.

Voice abuse carryover:
- uploaded voice spoofing.
- replay audio.
- manipulated local draft.
- fake recorder state.
- forged voice metadata.
- anonymous identity carryover.
- connection reply abuse.
- storage boundary bypass.

Face verification remains future-only. A later provider direction may use `@veriff/react-native-sdk`, but ANKION must store only verification result fields and must not store raw face images, selfie video, ID media, or biometric embeddings. Spoofed verification/result fields remain future trust-layer risks only.

### Readiness GO Gates

Separate explicit GO remains required for:
- Supabase client dependency GO.
- package install GO.
- env/client boundary GO.
- runtime Auth integration GO.
- owner creation runtime wiring GO.
- local Auth test GO.
- APK/native GO.
- staging GO.
- production GO.

Staging and production remain NO-GO.

Next recommended phase: Phase 31B - Supabase client dependency and env preflight. Phase 31B must not install packages and must stay at dependency/env decision preflight level.

## Phase 31B - Auth Dependency And Env Preflight (2026-06-20)

Status: PASS - Supabase dependency and env preflight completed as docs-only. No package install, package.json edit, lockfile edit, `.env` change, secret introduction, Supabase client runtime, Auth runtime, owner creation runtime call, DB command, SQL, psql, Docker DB command, Supabase CLI, migration work, RLS harness, APK/native change, staging, production, commit, or push occurred.

Auth dependency decision:
- `@supabase/supabase-js` is not installed in Phase 31B.
- Future install requires separate explicit GO.
- Package install is allowed only after Auth/session boundary, env boundary, owner creation runtime-call boundary, no-service-role-in-client rule, no-secrets-in-repo rule, and rollback/checkpoint plan are ready.

Auth env decision:
- `EXPO_PUBLIC_SUPABASE_URL` can be public client configuration in a future approved phase.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` can be the public anon key in a future approved phase.
- Public anon key does not grant access by itself.
- Service role key, JWT secret, storage signing secret, provider secret, production credential, and admin token are forbidden in mobile code, Expo public env, repo docs, logs, screenshots, and commits.
- `.env.example` must stay placeholder-only.
- Real local secrets must not be written into docs or committed files.

Auth/source-of-truth preservation:
- `auth.uid()` remains backend owner source.
- Client owner spoofing remains forbidden.
- Auth session state is request eligibility and UI state only.
- Cached identity, fake entitlement, fake verification, fake profile-created state, fake anonymous-identity-ready state, and local-only owner switch cannot produce backend authority.

Runtime remains NO-GO:
- no login flow.
- no signup flow.
- no session provider.
- no owner creation runtime call.
- no screen import of Supabase client.
- no Storage/voice/reveal runtime.
- no APK/native.
- no staging/production.

Next recommended phase: Phase 31C - Auth DTO/session contract preflight.

## Phase 31C - Auth DTO / Session Contract Preflight (2026-06-20)

Status: PASS - Auth DTO/session contract preflight completed as docs-only. No source code, TypeScript interface/type file, runtime Auth integration, Supabase client binding, package install, package/lockfile edit, `.env` change, DB command, SQL, psql, Docker DB command, Supabase CLI, target function call, auth simulation, test data, migration work, RLS harness, APK/native work, staging, production, commit, or push occurred.

### `AuthSessionState`

Planned states:
- `unknown`.
- `loading`.
- `unauthenticated`.
- `authenticated`.
- `refresh_pending`.
- `expired`.
- `refresh_failed`.
- `local_cached_untrusted`.
- `recovery_required`.

Rules:
- Session state is for UI/request eligibility.
- Session state is not an owner assignment source.
- `owner_user_id` cannot be derived from client session state.

### `AuthUserView`

Planned fields:
- user id, only as server/auth-derived view.
- email/phone kept minimal if ever displayed.
- auth provider metadata is not client authority.
- verification flags are not client authority.
- debug/local flags are not owner authority.

Rule: `AuthUserView` is not the backend owner source. Backend owner source remains only `auth.uid()`.

### `AnonymousIdentityReadiness`

Planned states:
- `unknown`.
- `not_created`.
- `creation_eligible`.
- `creation_pending`.
- `ready`.
- `denied`.
- `blocked`.
- `stale_cache`.
- `needs_refresh`.

Rules:
- Local cached `anonymous_identity_id` is not backend authority.
- `ready` is not trusted until server-confirmed.
- Fake anonymous identity ready state remains an Android/local abuse risk.

### `OwnerCreationReadiness`

Planned states:
- `not_authenticated`.
- `session_loading`.
- `session_expired`.
- `eligible`.
- `pending`.
- `complete`.
- `denied`.
- `idempotent_existing`.
- `blocked_by_policy`.
- `network_unavailable`.
- `needs_recovery`.

Rules:
- Owner creation can advance only after a valid authenticated session.
- Client cannot send `owner_user_id`.
- Function call remains future runtime GO.
- Duplicate/idempotent existing response is a safe state only when backend row counts remain bounded.

### `AuthErrorState`

Planned codes:
- `AUTHENTICATED_OWNER_REQUIRED`.
- `SESSION_MISSING`.
- `SESSION_EXPIRED`.
- `SESSION_REFRESH_FAILED`.
- `OWNER_CREATION_DENIED`.
- `OWNER_CREATION_IDEMPOTENT_EXISTING`.
- `ANONYMOUS_IDENTITY_NOT_READY`.
- `LOCAL_CACHE_MISMATCH`.
- `REPLAYED_SESSION_SUSPECTED`.
- `OFFLINE_TRUST_BLOCKED`.
- `DEBUG_TRUST_BLOCKED`.
- `NETWORK_UNAVAILABLE`.
- `UNKNOWN_AUTH_ERROR`.

### `SessionRecoveryState`

Planned states:
- `none`.
- `refresh_required`.
- `reauth_required`.
- `clear_local_cache_required`.
- `server_recheck_required`.
- `blocked_until_online`.
- `security_review_required`.

Rules:
- Recovery cannot promote local cache to backend truth.
- Offline mode cannot authorize owner creation or identity readiness.

### DTO Trust Boundary

Trusted backend-derived fields are server/Auth/RLS/RPC confirmed. Untrusted local-only fields include cache, optimistic UI, debug flags, local verification, local entitlement, and offline state. Display-only fields may render UI but cannot authorize actions. Request eligibility fields may allow the client to request an action, but backend decides.

Forbidden client-authority fields:
- `client_owner_user_id`.
- `owner_user_id_override`.
- `force_authenticated`.
- `force_identity_ready`.
- `force_profile_created`.
- `local_entitlement_override`.
- `verification_override`.
- `debug_auth_bypass`.

### Owner Creation Call Contract

Future function args remain:
- `p_chosen_display_name`.
- `p_short_bio`.
- `p_age_band`.

`owner_user_id` never enters client payload. `auth.uid()` remains backend owner source. Duplicate private profile idempotent response is documented as PASS in Phase 30J. No runtime call occurs in Phase 31C.

### Abuse And Future Gates

Android local-state risks remain: cached identity, fake entitlement, fake verification, replayed session, clock manipulation, offline bypass, rooted/emulator manipulation, debug flag abuse, client-side trust abuse, fake profile created state, fake anonymous identity ready state, local-only owner switch, and local auth bypass.

Instant abuse risks remain: instant-match manipulation, reveal state manipulation, connection state manipulation, local UI forcing, cooldown/rate bypass, fake presence, fake waiting/replyable transition, and local-only entitlement spoofing.

Voice abuse risks remain: uploaded voice spoofing, replay audio, manipulated local draft, fake recorder state, forged voice metadata, anonymous identity carryover, connection reply abuse, and storage boundary bypass.

Face verification remains future-only. `@veriff/react-native-sdk` is only a future provider direction; ANKION stores only verification result fields and never raw face images, selfie video, ID media, or biometric embeddings. Verification result fields cannot be client-overridden.

Future GO gates: DTO/source implementation GO, Supabase dependency install GO, env/client boundary update GO, runtime Auth integration GO, owner creation runtime wiring GO, local Auth test GO, APK/native GO, staging GO, and production GO. Staging and production remain NO-GO.

Next recommended phase: Phase 31D - Auth DTO/source implementation planning. Phase 31D must not implement source code.

## Phase 31D - Auth DTO / Source Implementation Planning (2026-06-20)

Status: PASS - Auth DTO/source implementation planning completed as docs-only. This phase does not create or edit TypeScript files, change `apps/`, install packages, change env files, bind runtime Supabase/Auth, wire screens, run DB/SQL commands, invoke backend functions, execute auth simulation, create test data, create/apply migrations, run RLS harnesses, build APK/native artifacts, touch staging/production, commit, pull, or push.

### Read-Only Source Inspection

Observed source state:

- `apps/mobile/src/lib` contains `.gitkeep`, `env.ts`, and `supabaseBoundary.ts`.
- `env.ts` reads only public Supabase env placeholders and exposes no secret or runtime client.
- `supabaseBoundary.ts` exposes `InertSupabaseBoundary` with `clientAvailable: false`.
- Auth/session source search found no existing auth/session implementation.
- Supabase screen import search found no `@supabase` imports and no runtime Supabase screen imports.

### Future Source Placement Plan

Recommended Phase 31E placement:

```txt
apps/mobile/src/lib/authSessionBoundary.ts
```

This single inert boundary file is the lowest-risk first source step because it keeps DTO/session contracts close to the existing inert Supabase/env boundary without creating a broader auth module tree too early.

Alternatives considered:

- `apps/mobile/src/lib/auth/` can be used later when runtime Auth, providers, or helpers exist.
- `apps/mobile/src/lib/session/` can be used later if session handling becomes a separate domain.

Phase 31D selects the single-file boundary approach. Runtime screen imports, Supabase client imports, login/signup/session provider wiring, and owner creation runtime calls remain NO-GO.

### Future File Plan

Selected future file:

- `authSessionBoundary.ts`

Deferred split files:

- `authSessionTypes.ts`
- `authSessionContract.ts`
- `ownerCreationReadiness.ts`
- `anonymousIdentityReadiness.ts`
- `authErrors.ts`

The split files should be introduced only if the single boundary file becomes too large or if runtime implementation creates separate ownership boundaries.

### Type And Interface Plan

Future inert source may define these names:

- `AuthSessionState`
- `AuthSessionStatus`
- `AuthUserView`
- `AnonymousIdentityReadiness`
- `AnonymousIdentityReadinessStatus`
- `OwnerCreationReadiness`
- `OwnerCreationReadinessStatus`
- `AuthErrorState`
- `AuthErrorCode`
- `SessionRecoveryState`
- `SessionRecoveryStatus`

These names must remain inert DTO/source contract names until runtime Auth integration receives explicit GO.

### Forbidden DTO / Source Fields

Future DTO/source contracts must not include:

- `client_owner_user_id`
- `owner_user_id_override`
- `force_authenticated`
- `force_identity_ready`
- `force_profile_created`
- `local_entitlement_override`
- `verification_override`
- `debug_auth_bypass`

`owner_user_id` may only appear as server-derived/read-only where explicitly justified. Client owner assignment is forbidden. Backend owner source remains `auth.uid()`.

### Source Trust Boundary Plan

Trust classes:

- local-only UI state
- server-derived state
- request eligibility state
- display-only state
- forbidden authority state

Rules:

- UI optimistic state is not backend truth.
- Local cache is not backend authority.
- Cached `anonymous_identity_id` is not authority without server confirmation.
- Provider metadata, debug flags, verification display flags, and local entitlement flags cannot authorize owner creation or identity readiness.
- Request eligibility can permit a client request, but backend Auth/RLS/RPC remains authoritative.
- Owner assignment happens only through the backend `auth.uid()` boundary.

### Future Implementation Acceptance Criteria

Phase 31E or later source implementation requires explicit GO and must satisfy:

- source change only under the approved path
- no package install
- no runtime Auth wiring
- no Supabase client screen import
- no client-authoritative `owner_user_id`
- no forbidden DTO/source fields
- no `.env` change
- type-only/inert implementation
- TypeScript compile/typecheck plan documented before execution
- no APK/native
- no DB/SQL

### Future Typecheck / Test Plan

Phase 31D does not run tests or typecheck.

Future GO may allow read-only script inspection followed by the approved project typecheck command, such as `tsc --noEmit` or an existing typecheck script if present. Typecheck execution requires explicit approval in the implementation phase. APK builds, auth simulations, RLS harnesses, and runtime tests remain outside Phase 31D.

### Runtime NO-GO

No login, signup, session provider, owner creation runtime call, Supabase client import to screens, Storage/voice/reveal runtime, APK/native, staging, or production work is allowed by this plan.

### Abuse Carryover

Android local-state risks remain: cached identity, fake entitlement, fake verification, replayed session, clock manipulation, offline bypass, rooted/emulator manipulation, debug flag abuse, client-side trust abuse, fake profile created state, fake anonymous identity ready state, local-only owner switch, and local auth bypass.

Instant abuse risks remain: instant-match manipulation, reveal state manipulation, connection state manipulation, local UI forcing, cooldown/rate bypass, fake presence, fake waiting/replyable transition, and local-only entitlement spoofing.

Voice abuse risks remain: uploaded voice spoofing, replay audio, manipulated local draft, fake recorder state, forged voice metadata, anonymous identity carryover, connection reply abuse, and storage boundary bypass.

Face verification remains future-only. Provider direction may be `@veriff/react-native-sdk`. ANKION must not store raw face images, selfie video, ID media, or biometric embeddings. Only verification result fields may be stored, and verification result fields cannot be client-overridden.

## Phase 31E - Auth DTO / Source Inert Implementation (2026-06-20)

Status: PASS - The Phase 31C/31D Auth DTO/session contract was implemented as one inert TypeScript source boundary file.

Created file:

```txt
apps/mobile/src/lib/authSessionBoundary.ts
```

Implementation boundary:

- no imports
- no Supabase import
- no React import
- no runtime Auth wiring
- no login/signup/session provider
- no app screen wiring
- no owner creation runtime call
- no DB/SQL
- no APK/native
- no staging/production

Exported contracts:

- `AuthSessionStatus`
- `AuthSessionState`
- `AuthUserView`
- `AnonymousIdentityReadinessStatus`
- `AnonymousIdentityReadiness`
- `OwnerCreationReadinessStatus`
- `OwnerCreationReadiness`
- `AuthErrorCode`
- `AuthErrorState`
- `SessionRecoveryStatus`
- `SessionRecoveryState`
- `SessionBoundarySnapshot`

The source boundary preserves the Phase 31C trust model: local-only UI state and cache are not backend truth, display-only state is not authority, request eligibility is not authorization, and server-confirmed state remains the only safe boundary for ownership-sensitive behavior.

Forbidden DTO/source fields remain absent from the new source file: `client_owner_user_id`, `owner_user_id_override`, `force_authenticated`, `force_identity_ready`, `force_profile_created`, `local_entitlement_override`, `verification_override`, and `debug_auth_bypass`.

Owner creation remains future-only. Future payload shape is limited to `p_chosen_display_name`, `p_short_bio`, and `p_age_band`; client owner assignment remains forbidden; backend owner source remains `auth.uid()`. Phase 31E does not call `public.create_owner_identity_foundation` and does not create an RPC wrapper.

Next recommended phase: Phase 31F - Auth DTO/source inert implementation checkpoint / commit. Phase 31F requires explicit GO and must be commit-only/checkpoint-only.

## Phase 31G - Auth DTO / Source Inert Typecheck Planning (2026-06-20)

Status: PASS - Typecheck strategy planning completed as docs-only. No typecheck command, `tsc`, npm, yarn, pnpm, source edit, package edit, env edit, runtime Auth, Supabase client wiring, DB/SQL, APK/native, staging/production, commit, push, or pull occurred.

Read-only findings:

- Root `package.json` exposes `typecheck` as `turbo run typecheck`.
- `apps/mobile/package.json` exposes `typecheck` as `tsc --noEmit`.
- `apps/mobile/tsconfig.json` exists and includes `src`.
- `apps/mobile/src/lib/authSessionBoundary.ts` remains imports-free, forbidden-field-free, and free of runtime side-effect tokens.

Typecheck command discovery plan:

- Future Phase 31H should prefer the existing mobile package typecheck script because the changed inert source is under `apps/mobile/src/lib`.
- Workspace root typecheck through Turbo is a broader fallback and should be used only if Phase 31H explicitly chooses workspace-wide coverage.
- Direct `tsc --noEmit` is the underlying script target but should not bypass the existing package script without a reason.

Scope:

- Validate the inert DTO/source file against the mobile TypeScript project.
- Do not test or implement runtime Auth, Supabase client behavior, owner creation calls, DB/SQL behavior, APK/native behavior, or package/env behavior.

Failure interpretation:

- Missing script or missing tsconfig is a planning/config gap.
- Type-only syntax, export mismatch, strictness, or module resolution errors require scoped diagnosis before any source/config fix.
- Forbidden imports, forbidden fields, or runtime side-effect tokens are security NO-GO findings.
- Unused export warnings only count as failure if the current TS/project configuration treats them as errors.

Phase 31H requires separate explicit GO and may execute typecheck only. Source mutation, package install, package/env changes, runtime Auth, DB/SQL, APK/native, staging/production, and commit remain forbidden unless separately approved.

## Phase 31I - Document Auth DTO / Source Inert Typecheck Result (2026-06-20)

Status: PASS - Phase 31H mobile typecheck result documented. Phase 31I is docs-only and does not run typecheck, `tsc`, npm, yarn, pnpm, edit source, edit packages, change env, wire runtime Auth, add Supabase imports, run DB/SQL, build APK/native artifacts, touch staging/production, commit, pull, or push.

Documented Phase 31H execution:

```txt
Command: & 'C:\Program Files\nodejs\npm.cmd' --prefix apps/mobile run typecheck
Working directory: C:\ankion
Exit result: 0
TypeScript errors: none
```

Working tree was clean before and after Phase 31H. Source, package/env, runtime/Auth, DB/SQL, APK/native, commit, and push were not changed or executed.

Tooling note:

- PowerShell `npm.ps1` was blocked by local execution policy.
- `npm.cmd` inside the sandbox reached the script but hit TypeScript binary read `EPERM`.
- Approved sandbox-outside `npm.cmd` execution passed.
- This note is an environment/tooling constraint, not a source or runtime risk.

Typecheck PASS means the inert DTO/source boundary is TypeScript-valid in the mobile package typecheck. It is not proof of login, signup, session provider, owner creation runtime, Supabase client behavior, DB/SQL behavior, storage behavior, APK/native behavior, staging behavior, or production behavior.

Auth/owner carryover remains unchanged: `auth.uid()` is backend owner source-of-truth, client `owner_user_id` is not authority, public anon key is not authorization, Auth context plus RLS plus safe DTO/RPC boundaries remain required, and the inert DTO file cannot assign ownership.

Forbidden DTO/source fields remain blocked: `client_owner_user_id`, `owner_user_id_override`, `force_authenticated`, `force_identity_ready`, `force_profile_created`, `local_entitlement_override`, `verification_override`, and `debug_auth_bypass`.

Android local-state abuse, instant abuse, voice abuse, and face verification future-only boundaries remain in force. Face verification provider direction may remain `@veriff/react-native-sdk`, but ANKION does not store raw face image, selfie video, ID media, or biometric embedding; only verification result fields may be stored in a future approved phase.
