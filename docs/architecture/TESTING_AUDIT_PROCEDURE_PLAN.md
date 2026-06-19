# Testing / Audit Procedure Plan

## 1. Testing / Audit Purpose

This document defines the future testing and audit procedure required before Supabase/Auth/RLS/Storage implementation can begin.

The goal is to make sure ankion's privacy model is verified before any real backend, database, storage, or client integration work starts. The product depends on strict separation between real profile identity, anonymous identity, reveal grants, media access, and client-safe data surfaces.

This phase is planning-only. It does not add tests, test scripts, Supabase client code, Auth implementation, RLS implementation, Storage implementation, SQL, migrations, environment files, packages, backend/API code, route UI changes, mock data, or runtime behavior.

## 2. Pre-Implementation Audit Checklist

Before any future Supabase/Auth/RLS/Storage implementation begins, the project should confirm:

- schema readiness is approved
- RLS policy matrix readiness is approved
- Auth boundary readiness is approved
- Storage privacy boundary readiness is approved
- environment strategy readiness is approved
- client integration boundary readiness is approved
- migration rollback/check readiness is approved
- package alignment status is resolved or explicitly accepted
- no service role key is used in mobile
- no public surface can expose `owner_user_id` or private profile fields
- no route UI depends on backend behavior before implementation approval

## 3. Migration Testing Procedure

Future migration testing should include:

- migration dry-run expectation
- pre-migration backup/checkpoint
- post-migration table verification
- post-migration index/constraint verification
- rollback documentation review
- destructive-change review
- failed migration handling
- privacy posture check after failure or rollback
- confirmation that migrations are not connected to client behavior before audit approval

No migration testing commands are implemented in this phase.

## 4. RLS Testing Procedure

Future RLS tests should verify:

- owner can access own private data
- non-owner cannot access private profile data
- anonymous identity cannot expose real profile identity
- reveal grant controls profile visibility
- denied/absent reveal request blocks real profile visibility
- revoked/expired grant blocks real profile visibility
- Discover cannot bypass privacy rules
- Feed cannot bypass privacy rules
- Chat cannot bypass privacy rules
- Profile cannot expose private fields to unrelated users
- Reveal Requests cannot expose real profile identity before approval
- broad select policies do not expose sensitive rows

No RLS SQL or policy tests are implemented in this phase.

## 5. Auth Testing Procedure

Future Auth tests should verify:

- authenticated user ownership
- unauthenticated access blocking
- session boundary behavior
- missing profile state handling
- missing anonymous identity state handling
- account deletion/deactivation handling
- blocked/suspended account assumptions
- anonymous identity and real profile separation
- Auth user id is not exposed through public/discover/feed/chat surfaces
- service role key never appears in mobile code or public environment variables

No Auth implementation or session handling is added in this phase.

## 6. Storage Testing Procedure

Future Storage tests should verify:

- no public bucket assumption exists before approval
- voice/media ownership checks
- participant-safe voice access
- signed URL or controlled access expectation
- reveal-safe media access
- blocked unauthorized media access
- raw storage paths are not exposed to unsafe client surfaces
- feed media does not leak real profile identity
- profile media/avatar access follows reveal grant rules where applicable
- delete/revoke/expiration behavior is audited before implementation

No Storage buckets, policies, upload behavior, or signed URL code are added in this phase.

## 7. Client Integration Testing Procedure

Future client integration tests should verify:

- mobile uses only public anon key after approval
- mobile never references service role key
- `EXPO_PUBLIC_` values contain only client-safe values
- client queries map to approved RLS policy coverage
- no unsafe direct private-table reads
- Discover, Feed, Chat, Profile, and Reveal Requests use approved safe DTO/view/RPC boundaries
- no client query assumes real profile visibility without owner-approved reveal grant
- no client code reads raw Storage paths or admin-only fields

No Supabase client, environment variable reads, package changes, data fetching, or route behavior are added in this phase.

## 8. Regression Testing Procedure

Current documentation-only validation should include:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
corepack pnpm --filter @ankion/mobile exec expo install --check
```

Known deferred package alignment issue:

```txt
expo@56.0.5 should be ~56.0.6
```

This package alignment issue must not be fixed in Phase 20K.

APK build should only run when explicitly needed. A real-device smoke test should happen after meaningful runtime, package, native, navigation, backend, Auth, Storage, or Supabase client changes.

## 9. Readiness Impact

Testing / audit procedure status:

```txt
PLANNED
```

Supabase implementation status:

```txt
NO-GO
```

SQL/migration implementation status:

```txt
NO-GO
```

Auth/RLS/Storage implementation status:

```txt
BLOCKED
```

Runtime behavior:

```txt
unchanged
```

Package alignment:

```txt
DEFERRED
```

This plan does not approve Supabase implementation, SQL, migrations, Auth, RLS, Storage, package changes, client integration, or runtime behavior.

## 10. Next Recommended Phase

Phase 20L - Final Supabase Implementation Go/No-Go Review.

## Phase 20L Final Review Testing Audit Note

Phase 20L confirms the final current Supabase implementation decision is NO-GO.

Testing / audit procedure status remains:

```txt
PLANNED
```

Testing/audit is not executed and is not accepted for implementation yet.

Known blocker:

```txt
expo@56.0.5 should be ~56.0.6
```

Recommended next phase:

```txt
Phase 21A - Expo Package Alignment
```

No tests, test scripts, SQL fixtures, Supabase implementation, package changes, or runtime behavior are authorized by this note.

## Phase 21A Validation Result

Phase 21A completed the deferred Expo package alignment audit.

Validated commands:

```txt
corepack pnpm --filter @ankion/mobile exec expo install --check
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
corepack pnpm --filter @ankion/mobile exec expo export:embed --eager --platform android --dev false
```

Result:

```txt
PASS
```

Readiness impact:

- Package alignment is resolved for Phase 21A.
- Supabase implementation remains NO-GO.
- SQL/migrations, Auth/session handling, RLS, Storage, `.env` files, Supabase client integration, backend/API work, and runtime product behavior remain blocked.

---

## Phase 22E Testing / Audit Procedure Update

Phase 22E aligns this testing and audit procedure with:

* Phase 22A — Schema Draft Expansion
* Phase 22B — RLS Matrix Expansion
* Phase 22C — Storage / Media Capture Intent Boundary Update
* Phase 22D — Safe DTO / RPC Boundary Update

This remains documentation-only.

This note does not authorize:

* test implementation
* test scripts
* SQL fixtures
* migrations
* Supabase implementation
* Supabase client integration
* Auth/session handling
* RLS policies
* Storage buckets
* Storage policies
* signed URL code
* upload behavior
* recorder behavior
* camera/gallery behavior
* `.env` files
* backend/API logic
* route UI changes
* runtime behavior

Supabase implementation remains:

```txt
NO-GO
```

Testing/audit execution remains:

```txt
PLANNED / NOT EXECUTED
```

---

## Phase 22E Audit Scope Expansion

Future testing and audit must now explicitly cover these additional areas:

* blocks
* follows
* voice_usage_daily
* voice_usage_connection_daily
* media_capture_intents
* media_items
* reports
* notifications
* location_presence / nearby_voice_signals
* safe DTO / RPC boundaries
* signed media access boundaries
* capture-now public media authenticity

---

## Phase 22E Block Audit Cases

Future tests must verify:

* active block disables real profile visibility even if an active visibility grant exists
* active block disables new reveal request creation
* active block disables voice message sending
* active block disables follow creation
* active block disables future call access
* active block disables signed media URL generation where applicable
* revoked block does not automatically reopen profile visibility
* block state is not exposed as a raw relationship graph
* unrelated users cannot read block rows
* blocked user cannot revoke blocker’s block

Expected result:

Block is stronger than reveal, follow, chat continuation, media access, signed URL access, and future calls.

---

## Phase 22E Follow Audit Cases

Future tests must verify:

* follow targets anonymous identity or instant profile context
* follow does not reveal real profile
* follow does not create profile visibility grant
* follow does not expose owner_user_id
* follow does not expose auth user id
* follow does not expose private profile fields
* follow cannot override active block
* follow may only affect safe anonymous Feed/Discover priority or badge if product-approved

Expected result:

Follow improves discovery without becoming real profile browsing or reveal bypass.

---

## Phase 22E Voice Usage Audit Cases

Future tests must verify:

* each voice message remains within maximum allowed duration
* daily voice send limit cannot be bypassed by frontend manipulation
* same-recipient daily voice limit cannot be bypassed by frontend manipulation
* `voice_usage_daily` is not directly editable by client
* `voice_usage_connection_daily` is not directly editable by client
* frontend receives only safe remaining-count DTO
* raw quota rows are not returned to client
* sender_user_id and recipient_user_id do not leak through unsafe payloads
* block check happens before voice send is accepted

Expected result:

Voice limits are backend/source-of-truth enforced, not UI-enforced only.

---

## Phase 22E Media Capture Intent Audit Cases

Future tests must verify:

* public Feed/discovery media requires valid media_capture_intent
* gallery upload is rejected for public Feed/discovery media
* capture intent has server-generated nonce
* capture intent expires
* expired intent cannot upload
* used intent cannot be reused
* cancelled/rejected intent cannot upload
* upload cannot choose arbitrary storage path
* media hash or integrity marker is checked if used
* capture surface is validated
* intent cannot be created for another user
* block/safety rules can prevent intent creation

Expected result:

Public instant media is capture-now and cannot be faked by simple gallery upload or replay.

---

## Phase 22E Media Items / Storage Audit Cases

Future tests must verify:

* media_items does not expose raw storage path to frontend
* media_items does not expose storage bucket internals
* media_items does not expose owner_user_id on public-safe surfaces
* media metadata does not bridge anonymous identity to real profile before reveal
* private chat media is accessible only to valid participants
* voice media is accessible only to valid participants
* profile avatar/media is accessible only after valid visibility grant and no active block
* report media is accessible only to moderation/system or reporter-safe status if approved
* signed URL is generated only after access checks
* signed URL lifetime is short
* removed/expired/blocked media does not receive new signed URL
* raw storage paths do not appear in safe DTOs

Expected result:

Storage privacy cannot be bypassed through metadata, paths, public URLs, signed URLs, or client-side assumptions.

---

## Phase 22E Safe DTO / RPC Audit Cases

Future tests must verify:

* Discover uses safe DTO/view/RPC only
* Feed uses safe DTO/view/RPC only
* Chat list uses safe DTO/view/RPC only
* Chat thread uses safe DTO/view/RPC only
* Reveal state uses backend-verified safe result
* Profile visibility uses backend-verified safe result
* Follow state uses safe anonymous DTO
* Voice limit state uses safe remaining-count DTO
* Media access uses safe media access DTO
* Reports use reporter-safe DTO only
* Notifications use safe payloads only

Future tests must also verify frontend never receives:

* owner_user_id
* sender_user_id
* recipient_user_id
* requester_user_id
* profile_owner_user_id
* viewer_user_id
* blocker_user_id
* blocked_user_id
* reporter_user_id
* reported_user_id
* raw storage path
* storage bucket internals
* server nonce
* media hash/security internals
* raw reveal internals
* raw grant internals
* private moderation fields
* private profile fields before reveal
* exact location

Expected result:

Frontend displays safe state but does not receive or decide sensitive security data.

---

## Phase 22E Reveal / Grant Audit Cases

Future tests must verify:

* reveal request approval alone does not reveal profile
* active profile_visibility_grant is required
* active block disables profile visibility even with active grant
* revoked grant disables profile visibility
* expired/invalid grant disables profile visibility if expiry is used later
* frontend cannot infer profile visibility from request state alone
* safe profile DTO returns hidden state when grant is absent
* safe profile DTO returns hidden state when block exists
* raw visibility grant rows are not returned to frontend

Expected result:

Correct visibility formula remains enforced:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

---

## Phase 22E Reports / Notifications Audit Cases

Future report tests must verify:

* reporter can submit report for valid context
* reporter may see only safe own report status if approved
* reported user cannot see reporter identity
* public users cannot read reports
* moderation internals are not returned to frontend

Future notification tests must verify:

* recipient sees only own notifications
* notification payload does not reveal real identity before reveal
* notification route target is safe
* notification does not expose raw storage path
* notification does not expose owner_user_id or sender_user_id
* notification does not expose private moderation fields

Expected result:

Safety systems do not create identity leaks.

---

## Phase 22E Location Audit Cases

Location remains deferred.

Future tests must verify before any implementation:

* exact location is not exposed
* location does not reveal real identity
* location does not enable public profile browsing
* location does not bypass reveal
* Plus cannot reveal real identity through location
* blocked users are filtered from nearby signals
* stale signals expire
* location records do not create persistent tracking graph

Expected result:

Nearby anonymous voice discovery cannot become identity/location tracking.

---

## Phase 22E Regression Validation Commands

Documentation-only validation should continue to include:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
corepack pnpm --filter @ankion/mobile exec expo install --check
```

After package/native/runtime-related changes, also run:

```txt
corepack pnpm --filter @ankion/mobile exec expo export:embed --eager --platform android --dev false
```

APK build and real-device smoke test should run only when explicitly needed after meaningful runtime, package, native, navigation, backend, Auth, Storage, or Supabase client changes.

---

## Phase 22E Readiness Decision

Testing / audit procedure is updated, but remains:

```txt
PLANNED / NOT EXECUTED
```

Supabase implementation remains:

```txt
NO-GO
```

SQL/migration implementation remains:

```txt
NO-GO
```

Auth/RLS/Storage implementation remains:

```txt
BLOCKED
```

Decision:

Do not create test scripts, SQL fixtures, Supabase client code, Auth/session handling, RLS policies, Storage buckets, Storage policies, signed URL code, upload behavior, `.env` files, backend/API code, route behavior, or runtime behavior from Phase 22E.

Next correct phase:

Phase 22F — Phase 22A-22E Documentation / Status Alignment.

---

## Phase 23S Low-CPU Local APK Build Guidance

This guidance records the preferred future local release APK build standard after a successful APK build observed high CPU usage.

Rules:

- APK builds should run only in an explicitly approved APK build/copy phase.
- Source/docs phases must not touch `C:\ankion-apk`.
- Do not delete `.gradle` and `app.cxx` on every build.
- Clean Gradle/native caches only when build recovery requires it.
- Prefer limited Gradle workers, e.g. `--max-workers=4`.
- Prefer low priority build execution.
- If CPU spikes too high, apply runtime Java/Gradle process priority or affinity limiting.

Preferred future local command pattern:

```bat
cd /d C:\ankion-apk\apps\mobile\android
set "NODE_ENV=production"
start "ANKION APK Build Low CPU" /wait /low cmd /c "gradlew.bat --no-daemon --max-workers=4 assembleRelease"
```

Optional runtime limiter:

```powershell
powershell -NoProfile -Command "Get-Process java,gradle -ErrorAction SilentlyContinue | ForEach-Object { try { $_.PriorityClass='BelowNormal'; $_.ProcessorAffinity=15; Write-Host ('Limited: ' + $_.ProcessName + ' PID=' + $_.Id) } catch { Write-Host ('Skip: ' + $_.ProcessName) } }"
```

Boundary:

- This is build guidance only.
- It does not authorize APK builds during documentation phases.
- It does not authorize backend/Auth/RLS/Storage, real camera/gallery/upload, recorder, package/lockfile, or runtime product behavior changes.
---

## Phase 24E Identity Schema Test Gate Note

Before any SQL/RLS implementation for `profiles_private` and `anonymous_identities`, future tests must cover:

- owner can access own private profile through owner-safe boundary.
- unrelated user cannot read raw private profile.
- pending reveal requester cannot see real profile fields.
- approved viewer can see only approved safe fields in the specific connection/context.
- revoked grant, expired grant, or block denies profile visibility.
- anonymous preview cannot expose `owner_user_id`, `auth_user_id`, `profile_private_id`, private profile fields, real profile photo fields, moderation internals, device/IP/security metadata, or anonymous-to-real correlation.
- no global public profile view exists.
- service role key is absent from mobile, Expo public env, committed files, `.env.example`, and client-facing docs.

Phase 24E is ready only for the next narrow SQL planning slice. It is not ready for SQL implementation.

## Phase 24F Mandatory Deny Tests For Private Profile And Anonymous Identity

Phase 24F adds the mandatory deny-test checklist for the first private profile / anonymous identity RLS planning slice. This is planning-only and does not create test code, SQL, migrations, RLS policies, Supabase runtime behavior, Auth/session handling, Storage policies, backend/API logic, or route data binding.

Required deny tests before executable SQL/RLS implementation:

1. Unauthenticated user cannot select `profiles_private`.
2. Unauthenticated user cannot select `anonymous_identities`.
3. User B cannot raw-select User A `profiles_private`.
4. User B cannot raw-select User A `anonymous_identities`.
5. `connected_without_reveal` cannot receive `RevealProfileDTO`.
6. `connected_with_reveal` cannot raw-select `profiles_private`.
7. `connected_with_reveal` can only receive `RevealProfileDTO` for the exact approved connection/context.
8. Reveal grant from one connection cannot be reused in another connection.
9. Blocked user cannot receive `RevealProfileDTO` even if a previous reveal grant existed.
10. Blocked user cannot receive `AnonymousSafePreviewDTO`.
11. Deleted/suspended user cannot receive private or anonymous DTOs.
12. Raw anonymous identity rows never expose `owner_user_id` to non-owner.
13. `AnonymousSafePreviewDTO` never exposes `auth_user_id`, `owner_user_id`, `profile_private_id`, email, phone, real name, moderation internals, verification internals, device/IP metadata.
14. Owner can access own `OwnerProfileDTO`.
15. Owner can update own allowed private profile fields.
16. Owner cannot update prohibited/system-only fields through client.
17. Owner can access own `OwnerAnonymousIdentityDTO`.
18. Owner cannot mutate internal linkage/security fields through client.
19. Route/query param tampering with profile id must deny access.
20. Route/query param tampering with anonymous identity id must deny access.
21. Service role key is not assumed available to client.
22. Service role behavior remains backend-only and must be audited separately.
23. Raw table reads are not accepted as product API for non-owner flows.
24. Storage/media access remains out of scope and blocked until future Storage/RLS/privacy phase.

Additional Phase 24F audit requirements:

- Validate DTO field allowlists, not only access outcomes.
- Validate block/revoke/deleted/suspended overrides after an earlier reveal grant exists.
- Validate connection/context scoping by attempting to reuse a valid reveal grant across another connection.
- Validate anonymous preview surfaces contain no owner/auth/private-profile linkage.
- Validate client route/query tampering cannot select raw rows or broader DTOs.

Phase 24F readiness:

```txt
READY FOR NEXT NARROW SQL PLANNING SLICE
NOT READY FOR EXECUTABLE SQL/RLS IMPLEMENTATION
```

## Phase 24G Mandatory Auth Boundary Tests

Phase 24G adds mandatory Auth boundary tests. This is planning-only and does not create test code, SQL, migrations, RLS policies, Supabase runtime behavior, Auth/session handling, Storage policies, backend/API logic, or route data binding.

Required tests before actual Auth/Supabase implementation:

1. No session cannot read `OwnerProfileDTO`.
2. No session cannot read `OwnerAnonymousIdentityDTO`.
3. No session cannot read `profiles_private` raw rows.
4. No session cannot read `anonymous_identities` raw rows.
5. `session_loading` does not expose private profile data.
6. Authenticated user cannot read another user's `profiles_private` raw row.
7. Authenticated user cannot read another user's `anonymous_identities` raw row.
8. Authenticated user cannot create `profiles_private` for another `owner_user_id`.
9. Authenticated user cannot create anonymous identity for another `owner_user_id`.
10. Repeated provisioning does not create duplicate `profiles_private`.
11. Repeated provisioning does not create duplicate active anonymous identities.
12. Session exists but missing profile returns `authenticated_unprovisioned`, not normal ready.
13. Session exists but missing anonymous identity returns `authenticated_unprovisioned`, not normal ready.
14. Expired session clears sensitive owner/reveal cache.
15. Logout clears owner profile cache.
16. Logout clears anonymous identity cache.
17. Account switch does not show previous account data.
18. Suspended/deleted user cannot access owner DTOs.
19. Suspended/deleted user cannot receive reveal DTO.
20. Blocked/revoked reveal remains denied even with valid session.
21. Auth does not allow global public profile view.
22. Auth does not allow profile search.
23. Auth does not allow user search.
24. Client-provided `owner_user_id` is ignored or denied.
25. Route/query tampering with profile id is denied.
26. Route/query tampering with anonymous identity id is denied.
27. Anonymous preview DTO contains no owner/auth/private linkage.
28. `RevealProfileDTO` requires exact active connection/context grant.
29. Service role key is not present in client-facing files.
30. Storage/media remains out of scope.

Additional Phase 24G audit requirements:

- Verify logout/account switch/cache reset behavior before any persisted Auth state is accepted.
- Verify expired-session refresh failure clears sensitive local state.
- Verify stale local reveal data cannot authorize profile visibility.
- Verify provisioning is idempotent under repeated startup/retry conditions.

Phase 24G readiness:

```txt
READY FOR NEXT NARROW SQL/AUTH PLANNING SLICE
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
```

## Phase 24H Migration Verification And Docker Planning Checklist

Phase 24H is documentation/planning-only. It does not create test code, SQL, migrations, Docker files, Supabase runtime behavior, Auth/session handling, RLS policies, Storage policies, backend/API logic, payment code, or route data binding.

### Migration Verification Checklist For Next SQL Script Drafting Slice

Before any executable migration application, future review must verify:

1. SQL draft is limited to `profiles_private` and `anonymous_identities`.
2. Conversations, voice messages, reveal requests, profile visibility grants, Storage/media, reports, notifications, payments, and subscriptions are absent.
3. `profiles_private.owner_user_id` uniqueness planning is reviewed.
4. one active anonymous identity per Auth user for V1 is reviewed.
5. soft-delete behavior is reviewed for both tables.
6. prohibited profile fields are absent.
7. client-visible anonymous linkage fields are absent.
8. rollback notes exist for tables, constraints, and indexes.
9. dry-run target is selected: local or staging Supabase.
10. pre-migration snapshot/check is defined.
11. post-migration table/constraint/index checks are defined.
12. RLS policy order is reviewed before any client binding.
13. DTO/view/RPC contracts are reviewed before non-owner access.
14. service-role plan is reviewed and remains backend-only.
15. no APK/device test is required for docs-only Phase 24H.

### Docker Local Bring-Up Planning Checklist

Docker is a future team development target, not implemented in Phase 24H.

Future Docker planning must define:

- file plan for `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and docs update.
- Node/pnpm version handling.
- dependency install command.
- mobile typecheck command.
- web typecheck command.
- web build command.
- optional web dev command.
- optional Expo/Metro support only if local networking works reliably.
- ports and volumes.
- Windows path handling for `C:\ankion`.
- clear exclusion of `C:\ankion-apk` unless a later APK phase approves it.
- no service role keys, production payment keys, committed secrets, real Storage/media, or Supabase local stack before separate approval.

Docker readiness:

```txt
NOT READY FOR DOCKER IMPLEMENTATION
```

### Phase 24H Validation Boundary

Docs-only validation remains:

```txt
corepack pnpm --filter @ankion/mobile typecheck
corepack pnpm --filter @ankion/web typecheck
corepack pnpm --filter @ankion/web build
```

APK/device test:

```txt
NOT APPLICABLE - docs-only phase
```

## Phase 24I SQL Specification Verification Dry-Run Rollback Checklist

Phase 24I is documentation/planning-only. It does not create test code, SQL files, migration files, Supabase migration files, RLS policies, Supabase runtime behavior, Auth/session handling, Storage policies, backend/API logic, Docker implementation, payment/subscription implementation, or route data binding.

Future verification checklist for the Phase 24I specification:

1. Confirm no migration files are created before GO.
2. Confirm no forbidden `profiles_private` fields are included.
3. Confirm no forbidden `anonymous_identities` preview/linkage fields are included.
4. Confirm `profiles_private` owner uniqueness strategy is reviewed.
5. Confirm `anonymous_identities` one-active-per-owner strategy is reviewed.
6. Confirm soft-delete behavior is reviewed for both tables.
7. Confirm no public profile/search/slug fields exist.
8. Confirm no client-visible anonymous-to-real linkage exists.
9. Confirm RLS policies are not assumed by table creation alone.
10. Confirm `OwnerProfileDTO`, `RevealProfileDTO`, `OwnerAnonymousIdentityDTO`, and `AnonymousSafePreviewDTO` contracts are reviewed before runtime binding.
11. Confirm rollback steps are written before migration execution.
12. Confirm dry-run/staging execution path is chosen before production.
13. Confirm service role key remains backend-only and out of client docs/env examples.
14. Confirm Storage/media remains out of scope.
15. Confirm payment/subscription tables remain out of scope.
16. Confirm executable SQL/migration remains blocked until separate GO.

Rollback planning requirements:

- rollback must be explicit before execution.
- rollback must cover table creation, constraints, indexes, and any future enum/type objects.
- rollback must not destroy production user data without separate approval.
- early local/staging rollback can be destructive only if explicitly marked non-production.
- rollback review must check that privacy posture is not weakened.

Dry-run planning requirements:

- local or staging target must be chosen before production.
- pre-migration schema snapshot/check must be defined.
- post-migration table/constraint/index checks must be defined.
- no client runtime may bind to the new tables during dry-run.
- RLS/DTO/Auth tests remain separate gates before runtime use.

Phase 24I readiness:

```txt
READY FOR SQL SCRIPT GO/NO-GO REVIEW
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

APK/device test:

```txt
NOT APPLICABLE - docs-only phase
```

## Phase 24J Pre-Migration Audit / Dry-Run / Rollback Checklist

Phase 24J is documentation/planning-only. It does not create test code, SQL files, migration files, Supabase migration files, RLS policies, Supabase runtime behavior, Auth/session handling, Storage policies, backend/API logic, Docker implementation, payment/subscription implementation, or route data binding.

### Pre-Migration Audit Checklist

Before creating the first actual migration file, verify:

1. Slice scope is `profiles_private` and `anonymous_identities` only.
2. Deferred tables are absent: conversations, voice messages, reveal requests, profile visibility grants, Storage/media, reports, notifications, payments, subscriptions.
3. No app code is changed.
4. No runtime Supabase binding is added.
5. No RLS implementation is included.
6. No Auth/session implementation is included.
7. No package/lockfile changes are included.
8. `supabase/migrations` remains unchanged until GO.
9. no `.env`, `.env.local`, service role key, backend secret, or client-facing secret is introduced.

### Forbidden-Field Scan Checklist

Scan the future SQL draft for these forbidden `profiles_private` fields:

- `email`, `phone`, `legal_name`, `exact_date_of_birth`, `precise_location`
- `public_username`, `searchable_handle`, `global_profile_slug`
- `anonymous_identity_id` as public/client-visible linkage
- `raw_verification_document`, `device_id`, `ip_address`
- service role key, backend secrets, anonymous-to-real correlation fields outside approved context

Scan the future SQL draft and DTO planning for these forbidden `anonymous_identities` exposures:

- `auth_user_id` to non-owner
- `owner_user_id` to non-owner preview
- `profile_private_id`
- email, phone, real name, private profile photo
- verification internals, moderation internals, device/IP/security metadata
- anonymous-to-real correlation key

### Dry-Run Checklist

Before production execution, future non-production dry-run must verify:

1. tables are created correctly.
2. constraints exist.
3. indexes exist.
4. prohibited fields are absent.
5. duplicate owner profile insertion is blocked.
6. duplicate active anonymous identity insertion is blocked.
7. soft-delete behavior is understood.
8. rollback works in non-production.
9. no app runtime is required.
10. no real user data is required.
11. no Storage/media/payment tables are included.
12. no service role key is introduced into client files.

### Rollback Checklist

Rollback plan must be written and reviewed before execution. It must cover:

- `profiles_private` table rollback.
- `anonymous_identities` table rollback.
- primary keys.
- owner uniqueness.
- active anonymous identity uniqueness.
- owner lookup indexes.
- partial indexes if used.
- types/enums/check constraints if used later.
- non-production destructive rollback marking.
- production safe disable/stop-forward strategy if user data exists.
- production user data preservation unless separate approval exists.

### Supabase Secret / Client-Facing File Scan Checklist

Before any GO, scan for accidental exposure in:

- mobile source files.
- web source files.
- `.env` / `.env.local` / `.env.example`.
- committed docs.
- screenshots/logs if relevant.
- package scripts/config if relevant.

Must remain absent:

- service role key.
- raw session tokens.
- refresh tokens.
- backend secrets.
- production payment keys.
- private storage paths.

### Non-Production vs Production Execution Difference

- Non-production dry-run may be destructive only if explicitly marked non-production.
- Production execution requires a separate explicit GO.
- Production rollback must not destroy user data without separate approval.
- Production rollback should prefer safe stop-forward or disable strategy once user data exists.

APK/device test:

```txt
NOT APPLICABLE - docs-only phase
```

Phase 24J readiness:

```txt
READY FOR PHASE 24K GO/NO-GO REVIEW
NOT READY TO CREATE ACTUAL MIGRATION FILE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24K First Migration GO / NO-GO Audit Confirmation

Phase 24K is documentation/review-only. It does not create test code, SQL files, migration files, Supabase migration files, RLS policies, Supabase runtime behavior, Auth/session handling, Storage policies, backend/API logic, Docker implementation, payment/subscription implementation, package changes, route data binding, APK build, or runtime product behavior.

Future first migration file must still pass before any execution:

1. forbidden-field scan.
2. rollback section review.
3. dry-run/staging plan review.
4. no-secret and no-service-role-client scan.
5. no deferred-table scope creep check.
6. no app runtime binding check.
7. Auth/RLS/DTO blocker confirmation.

APK/device test:

```txt
NOT APPLICABLE - docs-only phase
```

Phase 24K readiness:

```txt
READY TO CREATE FIRST NARROW MIGRATION FILE IN NEXT PHASE
NOT READY FOR EXECUTABLE SQL/MIGRATION APPLICATION
NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24L Migration File Audit Requirements

Phase 24L created the first narrow migration file:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Required future checks before any executable application:

1. forbidden-field scan against the migration file.
2. forbidden-table scope scan against executable SQL.
3. rollback notes review.
4. non-production dry-run plan approval.
5. no-secret and no-service-role-client scan.
6. Auth/RLS/DTO blocker confirmation.
7. confirmation that app runtime remains unbound.

APK/device test:

```txt
NOT APPLICABLE - migration file creation only
```

Phase 24L readiness:

```txt
Migration file creation: CREATED
Executable SQL/migration application: NOT READY / NOT APPLIED
Auth/Supabase runtime: NOT READY
RLS policy implementation: NOT READY
Storage/media: NOT READY
Payment/subscription: NOT READY
```

## Phase 24M Static Migration Audit And Future Apply Checks

Audited migration file:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Static checks completed:

1. file existence check.
2. create-table scope check.
3. forbidden-field scan.
4. deferred-table executable SQL scan.
5. RLS policy absence check.
6. constraint/index review.
7. UUID/extension review.
8. rollback-notes check.
9. secret/env/package/Docker scope check.

Future local/staging apply phase must still define:

- exact non-production target.
- exact command to run.
- backup/snapshot expectation if applicable.
- rollback command/checklist.
- post-apply table/constraint/index checks.
- RLS deny-by-default confirmation.
- no app runtime binding confirmation.
- no-secret and no-service-role-client scan.

APK/device test:

```txt
NOT APPLICABLE - static migration audit only
```

Phase 24M readiness:

```txt
Migration static audit: PASS
Ready for later local/staging migration apply phase: READY FOR LOCAL/STAGING APPLY PLANNING OR REVIEW
Ready for production migration apply: NOT READY FOR PRODUCTION MIGRATION APPLY
Ready for app runtime/Auth/Supabase implementation: NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
Ready for RLS policy implementation: NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
Ready for Storage/media implementation: NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24N Local/Staging Apply Precheck And Rollback Verification Plan

Planning target migration:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Phase 24N does not run Supabase commands and does not apply SQL.

### Required Precheck Before Future Local/Staging Apply

1. migration static audit is PASS.
2. migration file is unchanged since Phase 24M, or re-audited if changed.
3. environment is non-production.
4. `auth.users` exists in target environment.
5. `pgcrypto` / `gen_random_uuid()` works.
6. forbidden fields are absent.
7. deferred tables are absent.
8. RLS policy absence is intentional.
9. RLS enablement means deny-by-default.
10. app runtime remains disconnected.
11. rollback plan is available.
12. no real user data is present in local apply.
13. staging backup/snapshot exists if staging is used.

### Rollback Verification Checklist

- rollback must be tested in non-production.
- non-production rollback may drop `anonymous_identities` first, then `profiles_private`, only if no real user data exists.
- production rollback must not drop user data without separate approval.
- FK constraints require rollback order to respect dependencies.
- rollback must verify both tables are removed or safely disabled in non-production.
- rollback must verify no app runtime depends on the tables yet.

### Secret / Env Scan Checklist

Before any future apply, confirm:

- no service role key in app code, web code, Expo public env, `.env.example`, screenshots, logs, or client-facing docs.
- no `.env` or `.env.local` changes are part of the phase unless separately approved for local secret handling.
- production database URL is not used.
- raw Supabase access tokens are not committed.
- staging/local credentials are never committed.
- no app runtime env points to the test database.

APK/device test:

```txt
NOT APPLICABLE - docs-only migration apply planning
```

Phase 24N readiness:

```txt
Ready for local/staging migration apply in next phase: READY FOR LOCAL/STAGING MIGRATION APPLY IN NEXT PHASE
Ready to apply migration in Phase 24N: NOT READY TO APPLY MIGRATION IN THIS PHASE
Ready for production migration apply: NOT READY FOR PRODUCTION MIGRATION APPLY
Ready for Auth/Supabase runtime implementation: NOT READY FOR ACTUAL AUTH/SUPABASE IMPLEMENTATION
Ready for RLS policy implementation: NOT READY FOR EXECUTABLE RLS POLICY IMPLEMENTATION
Ready for Storage/media implementation: NOT READY FOR STORAGE/MEDIA IMPLEMENTATION
```

## Phase 24P Local Migration State Audit Note

Phase 24P completed read-only local migration state checks for:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Findings:

- local Supabase DB was reachable through `supabase_db_ankion`.
- `public.profiles_private` exists.
- `public.anonymous_identities` exists.
- `supabase_migrations.schema_migrations` records `20260615062809`.

Testing/audit impact:

```txt
Local migration apply: NO-GO - already applied or present
Next local step: local migration audit
Production apply: NOT READY
Auth/Supabase runtime: NOT READY
RLS policies: NOT READY
Storage/media: NOT READY
```

Future audit should compare the applied local table, constraint, index, comment, and RLS-enabled state against the migration file without mutating schema and without connecting to remote Supabase.

## Phase 24Q Local Migration Audit / DB Verification

Phase 24Q completed local-only, read-only metadata verification for:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Audit commands inspected only PostgreSQL metadata/catalog sources: `pg_class`, `pg_namespace`, `information_schema.columns`, `pg_constraint`, `pg_indexes`, `pg_policies`, and `supabase_migrations.schema_migrations`. No application/user data rows were read.

Audit result:

```txt
Tables exist and RLS enabled: PASS
Columns match migration file: PASS
Constraints match migration file: PASS
Indexes match migration file: PASS
RLS policies absent: PASS
Migration history records 20260615062809 exactly once: PASS
Forbidden fields absent: PASS
```

Details:

- `public.profiles_private` exists with RLS enabled and force RLS disabled.
- `public.anonymous_identities` exists with RLS enabled and force RLS disabled.
- force RLS disabled is acceptable for this migration because Phase 24L enabled RLS but did not require `FORCE ROW LEVEL SECURITY`.
- zero RLS policies exist for both identity tables.
- forbidden public/search/token/identity-leak columns were absent.

Decision:

```txt
PHASE 24Q PASS - LOCAL MIGRATION AUDIT COMPLETE. DO NOT REAPPLY MIGRATION. NEXT PHASE MAY PREPARE RLS POLICY IMPLEMENTATION READINESS, BUT MUST NOT IMPLEMENT POLICIES WITHOUT A NEW EXPLICIT GO.
```

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

Result: PASS - static policy audit and non-executable deny/allow RLS test draft documented. No executable tests created. No tests run. No database command run.

Scope guard:
- This section is documentation-only.
- This section does not create users, rows, policies, SQL files, migrations, fixtures, or executable tests.
- Phase 24T does not run live DB checks. It relies on the Phase 24Q documented baseline that RLS is enabled and `pg_policies` returned zero rows.
- Source policy draft under audit: Phase 24S section in `docs/architecture/EXPANDED_RLS_POLICY_MATRIX_PLAN.md`.

### Static Audit of Phase 24S Non-Executable Draft

| Audit item | Result | Notes |
| --- | --- | --- |
| No executable SQL file was created for Phase 24S | PASS | Phase 24S content is Markdown documentation only. |
| No new migration file was created | PASS | `supabase/migrations` still lists only `.gitkeep` and `20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`. |
| No migration file was edited for Phase 24S/24T policy implementation | PASS | No executable migration change was made in this phase. |
| Policy-like text is non-executable documentation | PASS | Phase 24S draft is fenced as `text`, not executable SQL. |
| SQL-like block is labelled `NON-EXECUTABLE DRAFT ONLY - DO NOT APPLY` | PASS | Label is present in the canonical Phase 24S draft. |
| Policy-like lines are commented out | PASS | Policy-like lines start with `--`. |
| No public SELECT on `profiles_private` | PASS | Public raw profile table read remains forbidden. |
| No public SELECT on `anonymous_identities` | PASS | Public raw anonymous identity table read remains forbidden. |
| No authenticated-wide SELECT on `profiles_private` | PASS | Blanket authenticated profile table read remains forbidden. |
| No authenticated-wide SELECT on `anonymous_identities` | PASS | Blanket authenticated anonymous identity table read remains forbidden. |
| No reveal-recipient raw SELECT on `profiles_private` | PASS | Reveal must use safe context-scoped projection/DTO/RPC/view/query boundary, not raw table read. |
| No connection/context raw SELECT on `profiles_private` | PASS | Connection context does not authorize raw private profile table access. |
| No profile search, user search, profile browsing, global profile, or public profile behavior | PASS | These remain explicitly forbidden. |
| No room/member-directory behavior | PASS | Connection/member-directory raw table access remains forbidden. |
| No owner_user_id reassignment | PASS | Future owner insert/update remains conditional and must preserve authenticated ownership. |
| Broad owner UPDATE is not treated as safe | PASS | Phase 24S marks broad owner UPDATE conditional/not broadly safe. |
| Client mutation of safety/moderation/system/visibility/rotation/soft-delete fields is not allowed without future safe boundary | PASS | These fields require later field mutability and server/DTO boundary design. |
| DELETE remains forbidden unless future hard-delete design exists | PASS | Direct delete remains NO-GO. |
| Reveal remains safe projection/DTO/RPC/view/query-boundary only | PASS | Reveal does not grant raw `profiles_private` table read access. |

Audit decision: PASS. No blocking mismatch found. Actual policy implementation remains NO-GO.

### Future Test Actor Model

These are future test personas only. Do not create them in the database during Phase 24T. Do not insert rows. Do not run tests in this phase.

| Actor label | Purpose | Phase 24T handling |
| --- | --- | --- |
| `unauthenticated_user` | Represents no active authenticated session. | Documentation-only persona. |
| `authenticated_owner_a` | Owns the target private profile and anonymous identity rows. | Documentation-only persona. |
| `authenticated_non_owner_b` | Authenticated user who does not own owner A rows. | Documentation-only persona. |
| `reveal_recipient_b_for_context_x` | User B with a future owner-approved reveal in one context. | Documentation-only persona; still cannot raw-select `profiles_private`. |
| `connection_participant_b_without_reveal` | User B connected or context-related without approved reveal. | Documentation-only persona; cannot receive real profile raw access. |
| `general_authenticated_user` | Any authenticated user without ownership or context. | Documentation-only persona. |
| `malicious_owner_attempting_owner_user_id_reassignment` | Owner attempting to write or change ownership fields. | Documentation-only persona. |
| `malicious_owner_attempting_system_field_mutation` | Owner attempting to mutate safety/moderation/system/visibility/rotation/soft-delete fields. | Documentation-only persona. |
| `service_role_or_admin_context_excluded_from_client_rls_tests` | Server/admin context that is not part of client RLS verification. | Excluded from client RLS tests. |

### profiles_private Future Deny/Allow Test Matrix

| # | Actor / scenario | Operation target | Expected future result | Reason |
| --- | --- | --- | --- | --- |
| 1 | `unauthenticated_user` | SELECT `profiles_private` | DENY | No unauthenticated raw private profile access. |
| 2 | `general_authenticated_user` | SELECT all `profiles_private` | DENY | No authenticated-wide raw table read. |
| 3 | `authenticated_non_owner_b` | SELECT owner A `profiles_private` row | DENY | Non-owner must not receive raw private profile access. |
| 4 | `authenticated_owner_a` | SELECT own `profiles_private` row | FUTURE ALLOW CANDIDATE | Only after owner SELECT policy is implemented. |
| 5 | `reveal_recipient_b_for_context_x` | SELECT raw `profiles_private` | DENY | Reveal cannot authorize raw table read. |
| 6 | `connection_participant_b_without_reveal` | SELECT raw `profiles_private` | DENY | Connection/context alone does not reveal real profile. |
| 7 | `authenticated_owner_a` | INSERT own row with `owner_user_id = auth.uid()` | CONDITIONAL / FUTURE CANDIDATE | Requires insert field/default/safety design. |
| 8 | `malicious_owner_attempting_owner_user_id_reassignment` | INSERT row for another `owner_user_id` | DENY | Ownership cannot be forged. |
| 9 | `authenticated_owner_a` | UPDATE own `profiles_private` row | CONDITIONAL / NOT READY | Requires field mutability matrix and safe boundary. |
| 10 | `malicious_owner_attempting_owner_user_id_reassignment` | UPDATE `owner_user_id` | DENY | Ownership reassignment forbidden. |
| 11 | `malicious_owner_attempting_system_field_mutation` | UPDATE safety/moderation/status/visibility/soft-delete/system fields | DENY unless future server-side safe boundary explicitly allows a specific transition | Client-side mutation of sensitive fields is unsafe. |
| 12 | `authenticated_owner_a` | DELETE own `profiles_private` row | DENY / NO-GO | Hard delete requires future explicit design. |
| 13 | Public/global/search/browse profile access | SELECT `profiles_private` | DENY / FORBIDDEN | No profile search, user search, public profile, global profile opening, or browsing. |
| 14 | Monetization-based identity/reveal bypass | Any real-profile raw access | DENY / FORBIDDEN | Monetization must never sell identity, reveal, or consent bypass. |

### anonymous_identities Future Deny/Allow Test Matrix

| # | Actor / scenario | Operation target | Expected future result | Reason |
| --- | --- | --- | --- | --- |
| 1 | `unauthenticated_user` | SELECT `anonymous_identities` | DENY | No unauthenticated raw anonymous identity table access. |
| 2 | `general_authenticated_user` | SELECT all `anonymous_identities` | DENY | No authenticated-wide raw anonymous identity table read. |
| 3 | `authenticated_non_owner_b` | SELECT owner A anonymous identity rows directly | DENY | Non-owner must not see raw ownership-linked rows. |
| 4 | `authenticated_owner_a` | SELECT own anonymous identity rows | FUTURE ALLOW CANDIDATE | Only after owner SELECT policy is implemented. |
| 5 | Feed/global anonymous directory | SELECT directly from `anonymous_identities` | DENY / FORBIDDEN | Feed/global surfaces require safe projection/snapshot/DTO/query boundary, not direct raw table access. |
| 6 | Connection/member-directory | SELECT directly from `anonymous_identities` | DENY / FORBIDDEN | No room/member-directory model. |
| 7 | User search / anonymous identity search / browse / discoverability | SELECT `anonymous_identities` | DENY / FORBIDDEN | No user search, anonymous identity browsing, or global discoverability. |
| 8 | `authenticated_owner_a` | INSERT own row with `owner_user_id = auth.uid()` | CONDITIONAL / FUTURE CANDIDATE | Requires rotation/status/safety/default design. |
| 9 | `malicious_owner_attempting_owner_user_id_reassignment` | INSERT row for another `owner_user_id` | DENY | Ownership cannot be forged. |
| 10 | `authenticated_owner_a` | UPDATE own anonymous identity row | CONDITIONAL / NOT READY | Requires field mutability matrix and safe boundary. |
| 11 | `malicious_owner_attempting_owner_user_id_reassignment` | UPDATE `owner_user_id` | DENY | Ownership reassignment forbidden. |
| 12 | `malicious_owner_attempting_system_field_mutation` | UPDATE safety/moderation/status/rotation/soft-delete/system fields | DENY unless future server-side safe boundary explicitly allows a specific transition | Client-side mutation of sensitive fields is unsafe. |
| 13 | `authenticated_owner_a` | DELETE own anonymous identity row | DENY / NO-GO | Hard delete requires future explicit design. |
| 14 | Monetization-based identity lookup/discoverability/reveal bypass | Any identity lookup or consent bypass | DENY / FORBIDDEN | Monetization must never sell identity, discoverability, reveal, or consent bypass. |

### Current Baseline Expectation

Phase 24Q documented that RLS is enabled on `public.profiles_private` and `public.anonymous_identities`, and that `pg_policies` returned zero rows. Therefore, direct client access to both tables should remain deny-by-default until explicit policies are implemented.

Phase 24T does not re-check the database, does not run `psql`, does not run live tests, and does not create test data. This is a documented expectation based on Phase 24Q evidence only.

### Future Positive Allow Candidates

These may become valid only after future policy implementation and review:
- Owner can SELECT only their own `profiles_private` row.
- Owner cannot SELECT another owner's `profiles_private` row.
- Owner can SELECT only their own `anonymous_identities` rows.
- Owner cannot SELECT another owner's `anonymous_identities` rows.
- Owner INSERT own row may pass only if `owner_user_id = auth.uid()` and field defaults/safety rules are satisfied.
- Owner UPDATE may pass only for explicitly owner-editable fields after the field mutability matrix is finalized.

Not allowed as positive tests:
- Broad owner UPDATE is not ready.
- Raw reveal SELECT is not allowed.
- Anonymous feed/global directory direct table SELECT is not allowed.

### Future Negative Tests That Must Remain Denied

- Unauthenticated direct SELECT on `profiles_private`.
- Unauthenticated direct SELECT on `anonymous_identities`.
- Authenticated-wide SELECT on `profiles_private`.
- Authenticated-wide SELECT on `anonymous_identities`.
- Non-owner SELECT on `profiles_private`.
- Non-owner SELECT on `anonymous_identities`.
- Reveal recipient raw SELECT on `profiles_private`.
- Connection participant raw SELECT on `profiles_private`.
- Public profile SELECT.
- Global profile SELECT.
- Profile search.
- User search.
- Profile browsing.
- Anonymous identity browsing.
- Member directory / room directory behavior.
- `owner_user_id` reassignment.
- Mutation of safety/moderation/system/visibility/rotation/soft-delete fields from client.
- DELETE without explicit hard-delete design.
- Monetization-based consent/reveal bypass.

### Non-Executable Test Draft Examples

```text
NON-EXECUTABLE TEST DRAFT ONLY - DO NOT RUN

Actor: authenticated_non_owner_b
Target: public.profiles_private row owned by authenticated_owner_a
Operation: SELECT
Expected: DENY
Reason: non-owner must never receive raw profiles_private table access.

Actor: reveal_recipient_b_for_context_x
Target: public.profiles_private row owned by authenticated_owner_a
Operation: SELECT raw table row
Expected: DENY
Reason: reveal may only expose a safe context-scoped projection/DTO boundary, not raw table access.

Actor: authenticated_owner_a
Target: public.profiles_private own row
Operation: SELECT
Expected: FUTURE ALLOW CANDIDATE
Reason: valid only after an explicit owner SELECT policy is implemented and reviewed.

Actor: malicious_owner_attempting_system_field_mutation
Target: public.anonymous_identities own row
Operation: UPDATE safety_state, status, rotation_state, deleted_at, or audit/system fields
Expected: DENY unless future server-side safe boundary explicitly allows a specific transition
Reason: row-level ownership does not make sensitive column mutation safe.

Actor: general_authenticated_user
Target: public.anonymous_identities
Operation: SELECT all rows for feed/global directory
Expected: DENY / FORBIDDEN
Reason: feed/global surfaces require safe projected anonymous metadata, snapshots, DTOs, or controlled query boundaries.
```

### Phase 24T GO/NO-GO

- Static audit of Phase 24S draft: PASS.
- Non-executable deny/allow test matrix: PASS.
- Actual RLS policy implementation: NO-GO.
- Executable migration creation: NO-GO.
- Database apply/reset/reapply/link/remote command: NO-GO.
- Executable test creation or live test execution: NO-GO.

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

## Phase 25A - Controlled Local RLS Deny/Allow Test Method Selection + Preflight (2026-06-16)

Status: PASS - planning/preflight only. No tests were run, no data was created, no SQL harness file was created, and no DB mutation occurred.

### Method Comparison

| Method | Future decision | Rationale |
|---|---:|---|
| Method A - Local SQL-only transactional RLS harness using PostgreSQL roles and Supabase JWT claim simulation | GO for future explicit Phase 25B | Preferred candidate. Local-only, transactional, reproducible, rollback-based, independent from app/Auth/runtime, and able to distinguish permission denied, RLS-filtered zero rows, and allowed one-row results. |
| Method B - Local Supabase Auth/API/client-token based test with real local Auth sessions | CONDITIONAL GO | Useful later for runtime realism, but requires approved client/Auth/runtime/package/env boundaries first. |
| Method C - Manual Supabase Studio / SQL editor test | NO-GO as primary method | Higher human-error risk and lower reproducibility. May only be a supplementary read-only aid later. |
| Method D - pgTAP or executable test files | CONDITIONAL GO in a separate explicit phase | Could become useful, but Phase 25A must not create executable tests or add dependencies. |
| Method E - Staging/production/remote test | NO-GO | Remote/staging/production remain forbidden. |

Selected future direction: Method A, but only for a later explicit Phase 25B. No Method A script or execution is created in Phase 25A.

### Actor Model for Future Tests

| Actor | Purpose | Future simulated role | Future auth.uid()/JWT-sub concept | Allowed scope | Expected result | Explicit exclusions |
|---|---|---|---|---|---|---|
| unauthenticated_user | Confirm anonymous table access is blocked | anon | null/no sub | SELECT denial checks only | DENY by missing table SELECT grant | No real auth session, no user row, no data creation in Phase 25A |
| authenticated_owner_a | Confirm owner can read own rows | authenticated | synthetic owner_a UUID | Own targeted rows only | ALLOW one targeted own row | No INSERT/UPDATE/DELETE in current scope |
| authenticated_non_owner_b | Confirm non-owner cannot read owner_a rows | authenticated | synthetic owner_b UUID | Non-owner SELECT checks | DENY by RLS-filtered zero rows | No raw profile read, no ownership bypass |
| reveal_recipient_b_for_context_x | Confirm reveal does not grant raw profiles_private SELECT | authenticated | synthetic owner_b UUID with conceptual context_x | Raw table SELECT denial only | DENY by RLS-filtered zero rows | No reveal implementation, no raw profiles_private entitlement |
| connection_participant_b_without_reveal | Confirm connection alone does not expose raw profile rows | authenticated | synthetic owner_b UUID | Raw table SELECT denial only | DENY by RLS-filtered zero rows | No room/member-directory model |
| malicious_owner_attempting_owner_user_id_reassignment | Confirm owner_user_id reassignment remains blocked | authenticated | synthetic owner_a UUID | Future write-denial attempt only | DENY by missing UPDATE grant now | No UPDATE policy work in Phase 25A |
| malicious_owner_attempting_system_field_mutation | Confirm safety/system fields remain protected | authenticated | synthetic owner_a UUID | Future write-denial attempt only | DENY by missing UPDATE grant now | No mutation, no system-field policy work in Phase 25A |
| service_role_or_admin_context_excluded_from_client_rls_tests | Distinguish setup/admin context from client assertions | service_role/postgres only if explicitly approved later | not a client auth.uid() assertion | Future local setup-only inside rollback if needed | Excluded from client PASS/FAIL assertions | Must not be used as a passing client access test because it may bypass RLS |

### Future Test Data Requirements

- Use deterministic local-only fake UUIDs for owner_a, owner_b, context_x, and target rows.
- No production/staging data, real user data, personal data, real email, phone, real profile content, secrets, media files, storage objects, or app runtime involvement.
- profiles_private.owner_user_id and anonymous_identities.owner_user_id reference auth.users(id), so a later explicit phase must choose a safe local-only parent-user setup method or equivalent local FK-safe setup.
- Do not SELECT from auth.users directly; direct auth.users reads remain forbidden.
- Future cleanup must rely on transaction rollback or a separately approved local cleanup strategy. Do not use db reset or migration repair as normal cleanup.

### Result Interpretation Rule

Future tests must report DENY/ALLOW precisely:
- Permission denied because table privilege is missing, expected for unauthenticated SELECT and authenticated write attempts in the current policy scope.
- Zero visible rows because RLS filtered a non-owned row, expected for authenticated non-owner/reveal-recipient/connection-participant raw SELECT attempts.
- One visible row because authenticated owner SELECT matched auth.uid() = owner_user_id, expected only for targeted owner-owned rows.

## Phase 25B - Controlled Local RLS Harness Metadata Preflight + Harness Design Lock (2026-06-16)

Status: PASS - read-only metadata/preflight/design only. No RLS tests were executed, no row data was selected from protected tables or auth.users, no test data/users were created, and no SQL harness file was created.

### Metadata Findings

- Roles: anon, authenticated, service_role, and postgres exist locally.
- auth.uid(): metadata shows a STABLE SQL function returning uuid from current_setting('request.jwt.claim.sub', true), falling back to current_setting('request.jwt.claims', true)::jsonb ->> 'sub'. It is not security definer.
- Future simulation setting: both request.jwt.claim.sub and request.jwt.claims are relevant. request.jwt.claim.sub has precedence in the current function definition. Future harness should set role plus JWT claim settings locally and document which branch is being exercised.
- Policies: profiles_private_owner_select_own and anonymous_identities_owner_select_own remain the only target policies. Both are SELECT policies for authenticated with (auth.uid() = owner_user_id) and no WITH CHECK.
- Grants: authenticated has SELECT on both target tables; anon has no SELECT; authenticated has no INSERT/UPDATE/DELETE.
- FK metadata: pg_constraint confirms profiles_private.owner_user_id and anonymous_identities.owner_user_id reference auth.users(id) ON DELETE CASCADE. No auth.users row data was selected.
- Target ID metadata: owner_user_id is non-null uuid on both target tables; auth.users.id is non-null uuid by information_schema metadata.
- Forbidden fields: protected target-table forbidden field metadata query returned zero rows.

### Harness Design Lock

Future Phase 25C/25D harness design:
1. Use one local SQL transactional harness.
2. Start with BEGIN.
3. Use deterministic local-only fake UUIDs for owner_a, owner_b, context_x, parent rows, and target rows.
4. If approved, create synthetic local auth parent rows or another safe FK-satisfying setup method only inside the transaction.
5. Insert only fake local target rows inside the transaction.
6. Simulate actors one by one with local role and JWT claim settings.
7. Assert expected outcomes using precise result categories.
8. End with ROLLBACK so no persistent data remains.
9. Use no remote/staging/production data and no app/Auth/runtime dependency.

### Actor Simulation Model

- unauthenticated_user: anon role, no JWT sub, expected permission denied for target SELECT.
- authenticated_owner_a: authenticated role, JWT sub = owner_a UUID, expected one visible targeted own row.
- authenticated_non_owner_b: authenticated role, JWT sub = owner_b UUID, expected zero visible rows for owner_a rows.
- reveal_recipient_b_for_context_x: authenticated role, JWT sub = owner_b UUID, expected zero raw profiles_private rows; reveal never grants raw profiles_private read.
- connection_participant_b_without_reveal: authenticated role, JWT sub = owner_b UUID, expected zero raw profile/anonymous identity rows through connection participation.
- malicious_owner_attempting_owner_user_id_reassignment: authenticated owner context, expected denied by missing UPDATE grant now; future policies must preserve owner_user_id immutability.
- malicious_owner_attempting_system_field_mutation: authenticated owner context, expected denied by missing UPDATE grant now; future policies must protect system/safety fields.
- service_role_or_admin_context_excluded_from_client_rls_tests: setup-only context if explicitly approved later; never a passing client actor assertion.

### Result Interpretation

Future harness assertions must not collapse denial modes:
- Permission denied: missing table privilege, expected for unauthenticated SELECT and authenticated write attempts under current grant posture.
- RLS-filtered zero rows: authenticated role has table SELECT but policy filters non-owned rows, expected for non-owner/reveal/connection raw row attempts.
- Allowed one row: authenticated owner SELECT matches auth.uid() = owner_user_id for the targeted own row.

### Phase 25B Boundary

No harness file was created. No SQL was executed beyond read-only metadata/catalog inspection. Phase 25C requires explicit GO before any harness artifact is drafted.

## Phase 25C - Controlled Local SQL Transactional RLS Harness File Draft - No Execution (2026-06-16)

Status: PASS - one guarded local SQL harness file drafted only. No execution occurred.

Harness location:
- supabase/tests/rls/phase25c_owner_select_rls_transactional_harness.sql

Execution guard:
- The harness begins a transaction, then checks current_setting('ankion.phase25d_explicit_go', true).
- The required SET LOCAL ankion.phase25d_explicit_go = 'true' line is present but commented out.
- Without explicit future Phase 25D enablement, the harness raises an exception.

Transaction model:
- BEGIN at the start.
- Fake deterministic local-only setup inside the transaction.
- Temp result recording only.
- ROLLBACK at the end.
- No COMMIT token.

Actor simulation model:
- unauthenticated_user via anon role and no JWT sub.
- authenticated_owner_a via authenticated role and owner_a sub in both request.jwt.claim.sub and request.jwt.claims.
- authenticated_non_owner_b via authenticated role and owner_b sub.
- reveal_recipient_b_for_context_x via authenticated role and owner_b sub plus context label only.
- connection_participant_b_without_reveal via authenticated role and owner_b sub.
- malicious mutation actors via authenticated owner context, expecting missing write grants.
- service_role/admin/postgres remain excluded from passing client assertions.

Result interpretation:
- Permission denied: expected for anon SELECT and authenticated write attempts where table privilege is missing.
- RLS-filtered zero rows: expected for authenticated non-owner/reveal/connection/direct-directory raw access to owner_a rows.
- Allowed one row: expected only for authenticated_owner_a selecting the targeted own row.

Phase boundary:
- The file may contain future INSERT/UPDATE/DELETE/SELECT statements as draft harness content, but none were executed in Phase 25C.
- Phase 25D must perform final static/pre-execution review before any guarded local execution.

## Phase 25D - Final Pre-Execution Static Review + Phase 25E Runbook Lock (2026-06-16)

Status: PASS - final static review/runbook only. The harness was not executed.

### Static Review Findings

Harness:
- supabase/tests/rls/phase25c_owner_select_rls_transactional_harness.sql
- SHA256: FB5484743C75359F74F03B5462CD67870896B9E722E03E807C81E725DC03F778

Review result:
- Path is outside supabase/migrations.
- Explicit GO guard is present.
- current_setting('ankion.phase25d_explicit_go', true) guard is present.
- Enabling SET LOCAL ankion.phase25d_explicit_go = 'true' remains commented out.
- Guard raises when explicit GO is not enabled.
- BEGIN and ROLLBACK are present, and ROLLBACK appears after assertion sections.
- No COMMIT token exists.
- No persistent helper table/function is created.
- No forbidden CREATE/ALTER/DROP POLICY, ALTER TABLE, permanent DROP TABLE, CREATE/ALTER/DROP ROLE/USER, CREATE EXTENSION, db reset, migration repair, remote, staging, or production logic was found.
- CREATE TEMP TABLE is used only for transaction-local result recording.

Coverage result:
- Actor coverage includes unauthenticated_user, authenticated_owner_a, authenticated_non_owner_b, reveal_recipient_b_for_context_x, connection_participant_b_without_reveal, malicious_owner_attempting_owner_user_id_reassignment, malicious_owner_attempting_system_field_mutation, and excluded service/admin context guidance.
- profiles_private assertions cover anon SELECT deny, non-owner zero rows, owner one row, reveal raw deny, connection raw deny, INSERT/UPDATE/DELETE deny, owner_user_id reassignment deny, safety field mutation deny, public/global/search/browse deny, and monetization bypass deny.
- anonymous_identities assertions cover anon SELECT deny, non-owner zero rows, owner one row, global directory deny, member-directory deny, search/browse/discoverability deny, INSERT/UPDATE/DELETE deny, owner_user_id reassignment deny, safety field mutation deny, and monetization bypass deny.
- Result interpretation remains explicit: permission denied, RLS-filtered zero visible rows, allowed one targeted own row.

### Read-Only Metadata Review

Local DB metadata was checked without selecting protected/user row data:
- 20260615062809 migration history count = 1.
- 20260616090000 migration history count = 1.
- Roles anon, authenticated, service_role, and postgres exist.
- RLS is enabled on public.profiles_private and public.anonymous_identities; force RLS is false on both.
- Policies remain profiles_private_owner_select_own and anonymous_identities_owner_select_own, both SELECT for authenticated using (auth.uid() = owner_user_id) and no WITH CHECK.
- authenticated SELECT grants remain present; anon SELECT remains absent; authenticated INSERT/UPDATE/DELETE remains absent.
- auth.uid() remains STABLE SQL and resolves request.jwt.claim.sub before request.jwt.claims JSON sub.
- owner_user_id FKs to auth.users(id) ON DELETE CASCADE remain present for both target tables.

### Phase 25E Execution Runbook - Not Executed In Phase 25D

1. Require explicit Phase 25E execution GO from the user.
2. Confirm local DB target is supabase_db_ankion and do not use remote/staging/production.
3. Run one final immediate static validation of the canonical harness file: path, hash, guard, commented SET, BEGIN/ROLLBACK, no COMMIT, no forbidden SQL.
4. Keep the canonical harness file unchanged.
5. Provide the GO setting at execution time through a local session preamble or another approved local-only method; do not permanently uncomment the guard line.
6. Execute the canonical harness only against the local DB.
7. Capture the readable output summary: test_name, target_table, actor, expected_result, observed_result, pass, notes.
8. Confirm rollback/no persistent data afterward using metadata/count-safe checks only if appropriate and without inspecting real protected/user row data.
9. Do not involve app/Auth/runtime code, storage/backend, reveal, RPC/view/function/trigger, staging, production, or remote systems.

Phase 25D did not execute this runbook.

## Phase 25E - Controlled Local RLS Harness Execution + Rollback Verification (2026-06-16)

Status: PASS - guarded local harness executed once against local supabase_db_ankion.

### Pre-Execution Gates

- Filesystem/static gate: PASS.
- Harness hash gate: PASS, FB5484743C75359F74F03B5462CD67870896B9E722E03E807C81E725DC03F778.
- Migration hash gate: PASS.
- Local DB availability gate: PASS, supabase_db_ankion healthy/available.
- Metadata drift gate: PASS.

### Execution Summary

Execution shape:
- In-memory session preamble supplied SET ankion.phase25d_explicit_go = 'true'.
- Canonical harness content was streamed to psql through docker exec against supabase_db_ankion.
- The canonical harness file was not edited and no modified copy was created.

Result:
- psql exit code: 0.
- Total assertions: 24.
- Passed: 24.
- Failed: 0.

Assertion class summary:
- Permission denied: PASS for missing anon SELECT and missing authenticated INSERT/UPDATE/DELETE grants.
- RLS-filtered zero rows: PASS for authenticated non-owner, reveal-recipient, connection-participant, public/global/search/browse/direct-directory, and monetization-bypass direct-table checks.
- Allowed one row: PASS for authenticated_owner_a selecting own profiles_private row and own anonymous_identities row.

### Rollback Verification

Fake-ID-targeted count checks after execution:
- auth.users fake parent rows remaining: 0.
- profiles_private fake rows remaining: 0.
- anonymous_identities fake rows remaining: 0.

No SELECT * or broad protected/user row inspection was performed.

### Post-Execution Metadata

- Migration history counts remain 1 for 20260615062809 and 20260616090000.
- RLS remains enabled on both target tables; force RLS remains false.
- Policies remain profiles_private_owner_select_own and anonymous_identities_owner_select_own.
- authenticated SELECT remains present; anon SELECT remains absent; authenticated INSERT/UPDATE/DELETE remains absent.
- Harness hash and migration hashes remain unchanged.

Phase 25E validates the local owner-bound SELECT RLS foundation only. It does not approve staging, production, app/Auth/runtime, reveal, storage/backend, RPC/view/function/trigger, or write-policy work.

## Phase 27A - Backend SubAgent Operating Model / Planning Only (2026-06-18)

Status: PASS - planning-only operating model added for future backend SubAgent work. This phase does not approve backend implementation, SQL, migration changes, Supabase commands, DB mutation, Auth/runtime, Storage, Reveal, RPC/view/function/trigger, test data/users, staging, or production.

### Current Backend/RLS Checkpoint

- `profiles_private` and `anonymous_identities` foundation migration exists.
- Owner-bound SELECT RLS policies exist for authenticated owner reads only.
- Local owner-select RLS harness executed PASS in Phase 25E.
- Phase 25E recorded 24 total assertions, 24 passed, 0 failed.
- Rollback verification recorded fake auth/users/profile/anonymous rows remaining at 0.
- No staging or production apply has been approved.
- Auth/runtime/reveal/storage/RPC/view/function/trigger/write-policy work remains blocked.

### Backend SubAgent Permission Levels

Level 0 - Read-only analysis:
- Allowed: inspect docs, source structure, migrations, and test plans; summarize risks; propose phase plans.
- Forbidden: code changes, migration changes, DB changes, command execution that mutates state.

Level 1 - Draft-only artifact:
- Allowed only after explicit request: draft SQL/test/docs artifacts for review.
- Forbidden: apply, run, mutate, generate test users/data in a database, or treat draft as approved execution.

Level 2 - Local execution with explicit GO:
- Allowed only after human GO: run approved local-only scripts or harnesses, preferably rollback-safe.
- Forbidden: remote, staging, production, unapproved data creation, or silent continuation into the next gate.

Level 3 - Local DB mutation with explicit GO:
- Allowed only after human GO and backup/checkpoint: apply an approved local migration or approved local mutation.
- Forbidden: staging, production, remote DB work, migration repair/reset/link/push unless separately approved.

Level 4 - Runtime integration:
- Blocked until separate approval. Includes app Supabase/Auth client integration, session management, Storage, Reveal, and backend runtime integration.

Level 5 - Staging/production:
- NO-GO until a later explicit readiness review and human approval.

### Mandatory GO Gates

Explicit human GO is required before:
- Creating a migration file.
- Editing a migration file.
- Applying a local migration.
- Running an RLS harness.
- Creating test data or test users.
- Adding a package or dependency.
- Implementing Auth runtime integration.
- Implementing Supabase client runtime integration.
- Implementing Storage.
- Implementing Reveal.
- Creating or changing RPC/view/function/trigger artifacts.
- Applying anything to staging.
- Applying anything to production.

### Recommended Next Backend Slice

Phase 27B should be planning-only for the owner-controlled creation path for `profiles_private` and `anonymous_identities`.

Phase 27B should compare:
- Direct owner INSERT policy later.
- Controlled function/RPC later.
- Service boundary later.

Phase 27B must not execute SQL, create or edit migrations, add runtime integration, create users/data, or change package/env/native files.

This is the safest next slice because Phase 25E validated owner SELECT only, while INSERT/creation remains intentionally denied and unresolved. Planning the creation boundary before writing policy SQL reduces risk around owner_user_id spoofing, safety/system field mutation, duplicate row creation, and anonymous identity / real profile separation.

### Notification And Handoff Model

- SubAgent cannot silently proceed across GO gates.
- Every backend phase must return PASS, FAIL, or PARTIAL.
- Every backend phase must report files changed, validation run, forbidden actions avoided, and remaining risks.
- Codex status/output is the primary checkpoint until a notification path is designed.
- Phone/mobile notification must not be assumed as guaranteed.
- If notification automation is desired later, create a separate planning phase before implementation.

## Phase 27B - Owner-Controlled Creation Path Test Planning (2026-06-18)

Status: PASS - docs-only test planning update. No tests were run. No test data/users were created. No DB command, migration, SQL, RLS harness, runtime, package/env/APK/native, staging, or production work was performed.

Future creation path tests must be added before any implementation:

1. Authenticated owner cannot create `profiles_private` for another `owner_user_id`.
2. Authenticated owner cannot create `anonymous_identities` for another `owner_user_id`.
3. Repeated provisioning cannot create duplicate `profiles_private` rows.
4. Repeated provisioning cannot create duplicate active `anonymous_identities` rows.
5. Client-supplied system/safety/verification/moderation fields are ignored or rejected.
6. `owner_user_id` cannot be reassigned during creation or later mutation.
7. Reveal recipient cannot raw-select `profiles_private` after creation.
8. Anonymous preview cannot expose `owner_user_id`, `auth_user_id`, `profile_private_id`, or anonymous-to-real correlation.
9. Public/profile search, user search, global profile opening, profile browsing, room/member-directory, and global anonymous directory paths remain denied.
10. Monetization cannot bypass identity, reveal, consent, creation, or anti-abuse controls.

Android/voice/live anti-abuse test planning:
- Treat all Android client signals as untrusted.
- Root/emulator/hook checks may be tested only as weak risk signals, not final blockers.
- Fake microphone input, pre-recorded/replayed voice, repeated upload/replay, local storage tampering, live-session manipulation, and speed/volume/device metadata abuse must have server-side mitigation plans before runtime acceptance.
- Future runtime tests must include rate limits, abuse scoring, voice freshness/liveness boundaries, replay detection boundaries, and upload nonce/session binding.

Future execution gates:
- Any RLS harness update or execution requires separate explicit human GO.
- Any test data/user creation requires separate explicit human GO.
- Any local DB mutation requires backup/checkpoint and explicit human GO.
- Staging and production remain NO-GO.

## Phase 27C - Creation Boundary Test Checklist (2026-06-18)

Status: PASS - docs-only test checklist. No tests were run. No RLS harness was run. No test data/users were created.

Before any apply or runtime binding, future tests must include:

1. `authenticated_owner_a` can create only a `profiles_private` row whose owner is owner_a.
2. `authenticated_owner_a` cannot create `profiles_private` for owner_b.
3. `authenticated_owner_a` cannot create a duplicate private profile.
4. `authenticated_owner_a` cannot set `profiles_private` safety/status/audit/system/reveal fields.
5. `authenticated_owner_a` can create only an `anonymous_identities` row whose owner is owner_a.
6. `authenticated_owner_a` cannot create anonymous identity for owner_b.
7. `authenticated_owner_a` cannot create a duplicate active anonymous identity.
8. `authenticated_owner_a` cannot set anonymous identity safety/status/rotation/audit/system fields.
9. `authenticated_non_owner_b` cannot select, insert, update, or infer owner_a raw rows.
10. `unauthenticated_user` cannot create or read private/profile/anonymous raw rows.
11. `reveal_recipient_b_for_context_x` cannot raw-select `profiles_private`.
12. Public/search/browse/global profile, anonymous directory, room/member-directory, and monetization-bypass labels remain denied.
13. Android/voice/live inputs are treated as untrusted and cannot by themselves unlock profile visibility.
14. Fake microphone, replay/pre-recorded voice, repeated upload/replay, local storage tampering, live-session manipulation, and device metadata abuse have server-side mitigation plans before runtime.

Future RLS harness changes or execution require separate explicit human GO.

## Phase 28D - Controlled Creation Function Harness Planning (2026-06-18)

Status: PASS - planning-only harness design for the local controlled creation boundary. No test execution, SQL execution, DB command, RLS harness run, test data/user creation, Auth runtime, Supabase client runtime, Storage, Reveal, app runtime integration, package/env/APK/native work, staging, production, Dev Console work, or commit was performed.

### Harness Scope

- Local-only.
- Target function only: `public.create_owner_identity_foundation(text, text, text)`.
- Target tables only: `profiles_private` and `anonymous_identities`.
- No reveal, Storage, runtime Auth, Supabase client, app binding, APK/native, staging, or production.
- Future harness execution requires separate explicit GO.

### Future Actor Model

1. `unauthenticated_caller`: anon/no JWT context; function call must be rejected.
2. `authenticated_owner_a`: authenticated role with owner A JWT claim; own foundation creation may pass.
3. `authenticated_owner_b_non_owner`: authenticated role with owner B JWT claim; cannot create rows for owner A or read owner A raw private rows.
4. `duplicate_owner_private_profile`: owner A calls provisioning after a private profile already exists; duplicate must be blocked or safely idempotent.
5. `duplicate_active_anonymous_identity`: owner A calls provisioning after an active anonymous identity already exists; duplicate active identity must be blocked or safely idempotent.

### Required Future Assertions

1. Unauthenticated caller is rejected.
2. Authenticated owner can create only their own foundation rows.
3. Caller cannot pass or spoof `owner_user_id`.
4. Duplicate `profiles_private` creation is blocked or safely handled.
5. Duplicate active `anonymous_identities` creation is blocked or safely handled.
6. Non-owner cannot create for another user.
7. Direct table INSERT remains blocked outside the controlled function.
8. Direct UPDATE and DELETE remain blocked.
9. Raw `profiles_private` read is not granted by creation.
10. Function does not expose real profile data through anonymous identity output.
11. System, safety, audit, status, verification, rotation, soft-delete, and reveal fields are not client-controlled.
12. Authenticated execute grant is intentional and narrow.
13. Anon execute remains denied.
14. Function `search_path` remains fixed.
15. Dynamic SQL remains absent.

### Future Harness Execution Design

- Simulate `auth.uid()` locally by setting role and JWT claim settings in a transaction, following the Phase 25 harness model.
- Use deterministic local-only fake UUIDs and fake parent rows only after separate explicit GO.
- Record assertion rows in a transaction-local temp table.
- Count total, passed, and failed assertions explicitly.
- End with rollback unless a later approved phase documents a different cleanup-safe method.
- Do not print raw private profile rows, broad `SELECT *`, real user data, email, phone, storage paths, or secrets.
- Block execution unless the target is local `supabase_db_ankion`.
- No staging or production execution is allowed.

### Test Data Boundary

- No test users or test data are created in Phase 28D.
- Future test data/user creation requires separate explicit GO.
- Persistent fake data must be cleaned and verified.
- Future Phase 28E must include cleanup verification before any harness execution is approved.

### Anti-Abuse Carryover

- Android/client signals remain untrusted.
- Fake microphone, replay/pre-recorded voice, live-session manipulation, repeated upload/replay, local storage tampering, and device metadata abuse remain future server-side concerns.
- Creation boundary tests must not rely on Android client-only checks.
- Reveal, identity, consent, and monetization bypass remain blocked.

### Phase 28E Recommendation

Recommended next phase: Phase 28E - Local RLS / Function Harness Dry Plan or Implementation Prep.

Phase 28E must still not run tests unless explicit GO is given.

Exact future GO for any harness execution:
`GO: Run Phase 28E local controlled creation function harness only.`

## Phase 28F - Controlled Creation Function Crypto Schema Fix Planning Note (2026-06-18)

Status: PASS - corrective migration candidate prepared for static review only. No DB command, migration apply, SQL execution, RLS harness run, test data/user creation, runtime integration, staging, or production occurred.

Phase 28E blocker:
- The first creation-behavior assertion failed because `gen_random_bytes(8)` was unqualified while the function uses fixed `search_path = public, auth`.
- Local metadata showed the crypto function in schema `extensions`.

Fix candidate:
- `supabase/migrations/20260618170000_fix_controlled_creation_crypto_schema.sql`
- Replaces `public.create_owner_identity_foundation(text, text, text)`.
- Uses `extensions.gen_random_bytes(8)`.
- Preserves `SECURITY DEFINER`, fixed `search_path`, `auth.uid()` ownership, no `owner_user_id` argument, and no broad write policies.

Future testing:
- Phase 28E harness must not be rerun until the Phase 28F migration candidate passes static review and any local apply phase receives separate explicit GO.

## Phase 28H - Controlled Creation Function Harness Rerun Result (2026-06-18)

Status: PASS - local-only controlled creation function harness rerun completed against `supabase_db_ankion`.

Harness target:
- Function: `public.create_owner_identity_foundation(text, text, text)`.
- Tables: `public.profiles_private` and `public.anonymous_identities`.
- Execution model: transaction-scoped temporary local test actors/data with rollback.

Result:
- Total assertions: 27.
- Passed: 27.
- Failed: 0.
- Persistent fake auth/users/profile/anonymous rows remaining after rollback: 0.

Covered assertions:
- Function exists, keeps `SECURITY DEFINER`, fixed `search_path=public, auth`, `auth.uid()` ownership derivation, no `owner_user_id` argument, no dynamic SQL, anon execute denial, and narrow authenticated execute grant.
- Corrective crypto call uses `extensions.gen_random_bytes(8)` and has no unqualified `gen_random_bytes(8)` call.
- Unauthenticated caller is rejected.
- Authenticated owner can create own foundation.
- Duplicate private profile and duplicate active anonymous identity are blocked or safely handled.
- Non-owner cannot create for another user because there is no owner argument and owner counts remain isolated.
- Function result does not expose real private profile fields.
- Direct table INSERT/UPDATE/DELETE remains blocked.
- Non-owner raw `profiles_private` read is not newly granted.
- System, safety, audit, status, reveal, and rotation fields remain server/default-controlled.
- No broad write policies or write grants were introduced.

No raw private profile row contents were printed. No staging, production, migration edit/apply, RLS policy edit, runtime integration, Storage, Reveal, APK/native, package/dependency, or Dev Console work was performed.

## Phase 29F - Connection Primitive Metadata Verification Plan (2026-06-19)

Status: PASS - planning-only local verification plan for the connection primitive tables. No DB command, SQL execution, RLS harness run, test execution, test data/user creation, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

### Local Verification Scope

- Local-only target for future execution: `supabase_db_ankion`.
- Target tables: `public.connections` and `public.connection_participants`.
- Verification should inspect metadata/schema only by default.
- Do not print `profiles_private` rows or private profile data.
- Do not verify reveal, Storage, voice upload/storage, runtime objects, staging, or production.

### Required Future Phase 29G Assertions

1. `public.connections` exists.
2. `public.connection_participants` exists.
3. RLS is enabled on both tables.
4. No `CREATE POLICY` exists on either table.
5. No `SELECT`, `INSERT`, `UPDATE`, or `DELETE` grants exist for `anon`, `authenticated`, or `PUBLIC`.
6. No `TRUNCATE`, `REFERENCES`, or `TRIGGER` grants exist for `anon`, `authenticated`, or `PUBLIC`.
7. FK targets are only `public.anonymous_identities` and `public.connections`.
8. No `profiles_private` FK or raw read path exists.
9. Status, lifecycle, and reply eligibility constraints exist.
10. Participant role and participant state constraints exist.
11. Safety/moderation fields exist.
12. Timestamps and soft delete fields exist.
13. No `voice_messages` table exists.
14. No Storage, Reveal, or runtime objects are introduced.
15. No global conversation listing path exists.
16. No room/chat-room model exists.
17. No profile search, user search, or browsing path exists.

### Test Data Boundary

- Phase 29G should remain metadata/schema verification only unless a later prompt explicitly approves data tests.
- No test data or test users are created in Phase 29F.
- Any future data tests require separate explicit GO and cleanup verification.
- Persistent fake data must remain 0 in any future execution phase.

Exact future GO:
`GO: Run Phase 29G local connection primitive metadata verification only.`

## Phase 29G - Connection Primitive Metadata Verification Result (2026-06-19)

Status: PASS - local metadata/schema verification completed against `supabase_db_ankion`.

Execution boundary:
- Metadata/catalog/privilege/RLS/FK/constraint checks only.
- No RLS harness with test actors.
- No test users or test data.
- No row data output and no `profiles_private` row contents.
- No migration creation, migration edit, migration apply, schema change, RLS policy edit/create, runtime integration, Storage, Reveal, APK/native, staging, or production.

Result:
- Metadata assertions: 32 total, 32 passed, 0 failed.
- `public.connections` and `public.connection_participants` exist.
- RLS is enabled on both tables.
- No policies exist on either table.
- No anon/authenticated/PUBLIC DML or unsafe non-DML table privileges remain.
- FK targets remain limited to `public.anonymous_identities` and `public.connections`.
- No `profiles_private` FK/read path exists.
- Required status/lifecycle/reply eligibility, participant role/state, safety/moderation, timestamp, and soft-delete metadata exists.
- No voice/reveal/storage/runtime/listing/search/room object was introduced.
- Persistent fake data remaining from Phase 29G: 0, because no fake data was created.

## Phase 29H - Connection Primitive RLS Policy Test Preflight (2026-06-19)

Status: PASS - planning-only test preflight for future participant-only SELECT policies. No DB command, SQL execution, RLS policy implementation, RLS harness run, test execution, test data/user creation, migration creation/editing, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

### Future Actor Model

1. unauthenticated caller.
2. authenticated participant A.
3. authenticated participant B.
4. authenticated non-participant.
5. anonymous identity owner.
6. blocked/frozen future actor state.

### Future Deny / Allow Assertions

1. unauthenticated caller cannot read `public.connections`.
2. unauthenticated caller cannot read `public.connection_participants`.
3. authenticated participant A can read only their own eligible connection.
4. authenticated participant B can read only the same eligible connection.
5. authenticated non-participant cannot read connection rows.
6. authenticated non-participant cannot read participant rows.
7. participant cannot read an unrelated connection.
8. global list query is denied or returns zero rows.
9. no raw `profiles_private` read is granted through connection context.
10. no direct INSERT, UPDATE, or DELETE policy is introduced.
11. blocked/frozen future actor state prevents unsafe continuation.
12. connection status or reply eligibility does not imply Reveal.

### Execution Boundary

- Phase 29H does not run tests.
- Future Phase 29I may only prepare a migration candidate after explicit GO.
- Any local RLS harness execution requires a later separate explicit GO.
- Test output must not print raw private profile row contents.
- Persistent fake data must remain 0 in any future execution phase.

Exact future GO:
`GO: Start Phase 29I connection primitive RLS policy migration candidate.`

## Phase 29I - Connection Primitive RLS Candidate Test Planning Note (2026-06-19)

Status: PASS - local source migration candidate prepared for future participant-only SELECT tests. No DB command, SQL execution, local migration apply, RLS harness run, test execution, test data/user creation, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Candidate under review:
- `supabase/migrations/20260619123000_create_connection_participant_select_rls_policies.sql`

Future test expectations after static review and approved local apply:
1. unauthenticated caller cannot select `public.connections`.
2. unauthenticated caller cannot select `public.connection_participants`.
3. authenticated participant A can select only their own eligible connection.
4. authenticated participant B can select the same eligible connection.
5. authenticated non-participant cannot select connection rows.
6. authenticated non-participant cannot select participant rows.
7. participant cannot select unrelated connection rows.
8. blocked/frozen/deleted connection or participant state does not open visibility.
9. no global list query returns unrelated rows.
10. no raw `profiles_private` read is granted.
11. no INSERT, UPDATE, DELETE, or `WITH CHECK` write path exists.
12. anon and PUBLIC remain without SELECT grants.

Any execution of these assertions requires a later explicit harness GO. Persistent fake data must remain 0 in any future execution phase.

## Phase 29J - Connection Primitive RLS Apply Readiness Test Plan (2026-06-19)

Status: PASS - planning-only readiness note for future local apply and verification of participant-only SELECT policies. No DB command, SQL execution, local migration apply, RLS harness run, test execution, test data/user creation, runtime integration, Storage, Reveal, APK/native, package/dependency, staging, or production work occurred.

Future Phase 29L verification checks after approved local apply:
1. `connections_participant_select_own` policy exists on `public.connections`.
2. `connection_participants_participant_select_same_connection` policy exists on `public.connection_participants`.
3. authenticated SELECT grant exists only as required for RLS evaluation.
4. anon and PUBLIC grants remain absent.
5. INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, and TRIGGER grants remain absent for anon/authenticated/PUBLIC.
6. unauthenticated caller cannot select either table.
7. authenticated non-participant cannot select either table.
8. participant can select only own eligible connection context.
9. participant cannot select unrelated connection rows.
10. global list behavior remains denied.
11. raw `profiles_private` read remains denied.
12. no direct write policy or `WITH CHECK` path exists.

Execution boundary:
- Phase 29J does not apply the migration and does not run tests.
- Future Phase 29K local apply requires explicit DB-mutation GO.
- Future data tests require a separate explicit harness GO and cleanup verification.
- Persistent fake data must remain 0 unless a later data-test phase explicitly creates temporary rollback-scoped data.

Exact future GO:
`GO: Start Phase 29K local connection participant select RLS policy apply.`

## Phase 29L - Connection Participant RLS Verification Plan (2026-06-19)

Status: PASS - docs-only planning for future participant-bound SELECT RLS verification. No DB command, SQL execution, local migration apply, Supabase db push/reset/link, RLS harness run, test execution, test data/user creation, source/runtime change, package/env/APK/native change, staging, production, Dev Console work, or commit occurred.

### Verification Target

- Local-only target for a future approved execution phase: `supabase_db_ankion`.
- Tables under test later: `public.connections` and `public.connection_participants`.
- Policies under test later:
  1. `connections_participant_select_own`.
  2. `connection_participants_participant_select_same_connection`.
- No raw `profiles_private` row contents may be selected, printed, or inferred in test output.
- No Reveal, Storage, voice upload/storage, runtime integration, APK/native, staging, or production behavior is part of this verification plan.

### Future Actor Model

1. unauthenticated caller.
2. authenticated participant A, owning an active anonymous identity attached to connection X.
3. authenticated participant B, owning another active anonymous identity attached to connection X.
4. authenticated non-participant C, owning an active anonymous identity not attached to connection X.
5. authenticated participant D, attached to unrelated connection Y only.
6. blocked/frozen/deleted future actor or connection state.

### Positive Participant SELECT Cases

1. participant A can select their eligible `public.connections` row for connection X.
2. participant B can select the same eligible `public.connections` row for connection X.
3. participant A can select `public.connection_participants` rows only for connection X.
4. participant B can select `public.connection_participants` rows only for connection X.
5. same-connection participant visibility exposes anonymous participant context only; it does not expose real profile fields or imply Reveal.

### Negative Denial Cases

1. unauthenticated caller cannot select `public.connections`.
2. unauthenticated caller cannot select `public.connection_participants`.
3. authenticated non-participant C cannot select connection X.
4. authenticated non-participant C cannot select participant rows for connection X.
5. participant A cannot select unrelated connection Y.
6. participant D cannot select connection X.
7. global list attempts must return no rows outside the caller's participant-bound contexts.
8. direct INSERT, UPDATE, DELETE, or `WITH CHECK` write paths remain absent.
9. anon and PUBLIC remain without SELECT grants.
10. raw `profiles_private` reads remain denied and must not appear in output.

### Linkage And Isolation Assumptions

- Participant access depends on `public.anonymous_identities.owner_user_id = auth.uid()`.
- The owned anonymous identity must be active, not deleted, and attached through `public.connection_participants`.
- Ownership of any anonymous identity is insufficient unless that identity participates in the specific connection.
- Cross-connection isolation must prove connection X and connection Y do not leak rows to each other.
- `connection_participants` visibility boundaries must remain same-connection only and must not reveal unrelated participants.
- `public.connection_participants` visibility is same-connection scoped and must not become a participant directory, room roster, profile search, or user search surface.

### Leak Prevention Expectations

- Do not print raw `profiles_private` rows, real names, private profile ids, owner ids beyond pass/fail metadata, or any private profile field.
- Do not expose a global conversation graph, participant graph, profile browsing path, public profile path, room/chat-room model, or reveal shortcut.
- Test reports should use assertion names, PASS/FAIL counts, and synthetic actor labels only.
- Persistent fake data must be cleaned if a later execution phase creates it; final persistent fake data must be 0.

### Anti-Abuse Carryover

- Instant-reply manipulation checks are future server-side controls: repeated reply attempts, forged reply eligibility, stale connection state, and local storage tampering must be considered later.
- Voice-reply manipulation checks are future server-side controls: fake microphone, replayed/pre-recorded audio, live-session manipulation, repeated upload, and nonce/session binding risks must be considered later.
- Android-specific runtime/device caution remains future work only: root/emulator/hook signals are weak risk signals, client attestation cannot be trusted alone, and real profile visibility must never depend only on device-side checks.
- Rate limits, abuse scoring, server-side session binding, and reveal/consent manipulation defenses remain required later.

### Execution Gate

Phase 29L does not run verification. Any DB execution, RLS harness work, test users, or test data require a later explicit GO:

`GO: Run Phase 29M local connection participant RLS verification harness only.`

## Phase 29N - Connection Participant RLS Recursion Fix Plan (2026-06-19)

Status: PASS - docs-only fix planning after Phase 29M local RLS harness failed with recursion. No DB command, Docker DB command, psql, SQL execution, migration creation/editing/apply, RLS harness rerun, test execution, test data/user creation, source/runtime change, package/env/APK/native change, staging, production, Dev Console work, git add, commit, or push occurred.

### Phase 29M Failure Summary

Exact error:

`ERROR: infinite recursion detected in policy for relation "connection_participants"`

Current recursive shape:

1. Selecting `public.connections` evaluates `connections_participant_select_own`.
2. That policy checks membership by querying `public.connection_participants`.
3. Selecting from `public.connection_participants` evaluates `connection_participants_participant_select_same_connection`.
4. That policy also queries `public.connection_participants`.
5. PostgreSQL detects recursive RLS evaluation on `connection_participants`.

Blocked Phase 29M assertions:

- participant can SELECT own/same connection.
- non-participant cannot SELECT connection.
- cross-connection participant cannot SELECT unrelated connection.
- participant can SELECT allowed `connection_participants` rows.
- non-participant cannot SELECT `connection_participants` rows.
- cross-connection participant membership does not leak.

Already confirmed before blocker:

- local DB target was confirmed.
- RLS was enabled on `public.connections` and `public.connection_participants`.
- SELECT policies existed.
- `auth.uid()` simulation worked.
- rollback/cleanup left persistent test data at 0.

### Fix Objective

- Remove recursive policy evaluation.
- Preserve participant-only read access.
- Preserve same-connection participant visibility.
- Preserve cross-connection isolation.
- Preserve authenticated non-participant denial.
- Preserve `public.anonymous_identities.owner_user_id = auth.uid()` linkage.
- Prevent data leakage through `public.connection_participants`.

### Future Migration Design

Future Phase 29O should draft, not apply, a narrow corrective migration that:

1. creates `public.is_connection_participant_for_current_user(target_connection_id uuid) returns boolean`.
2. marks it `SECURITY DEFINER`.
3. fixes `search_path`.
4. schema-qualifies `public.connection_participants`, `public.anonymous_identities`, and any other referenced object.
5. returns only boolean.
6. avoids dynamic SQL.
7. checks `auth.uid()` through `public.anonymous_identities.owner_user_id`.
8. checks active/non-deleted `anonymous_identities` rows where current schema supports `status` and `deleted_at`.
9. checks active/non-deleted participant rows where current schema supports `participant_state`, `safety_state`, and `deleted_at`.
10. updates `public.connections` SELECT policy to call the helper with `public.connections.id`.
11. updates `public.connection_participants` SELECT policy to call the helper with `public.connection_participants.connection_id`.
12. avoids direct self-referencing SELECT inside the `connection_participants` policy.

This should break recursion because the policy predicate no longer embeds a self-referencing SELECT against `connection_participants`; the helper performs a membership check under a controlled function boundary and returns only true/false.

### Security Requirements

- `SECURITY DEFINER` must be narrowly justified and reviewed.
- Function owner and RLS behavior must be explicitly checked in local Supabase/Postgres before any apply is accepted.
- Fixed `search_path` is required.
- Referenced tables must be schema-qualified.
- No dynamic SQL.
- No row data return.
- No service role key or service role dependency.
- No broad privilege escalation.
- No raw `profiles_private` read.
- No global conversation list.
- No profile/user search.
- No room/chat-room model.
- No Reveal implication.
- EXECUTE posture must be explicit:
  - revoke from PUBLIC by default.
  - no anon execute unless separately justified.
  - authenticated execute only if required for RLS policy evaluation.
- If helper ownership/RLS behavior does not avoid recursion locally, the future phase must stop and report a blocker rather than broadening table policies.

### Later Verification Requirements

After a future approved migration draft/review/apply sequence, local verification must include:

1. metadata check for helper existence, signature, `SECURITY DEFINER`, fixed `search_path`, and boolean return.
2. metadata check for explicit EXECUTE grants/revokes.
3. metadata check for updated `public.connections` and `public.connection_participants` policies.
4. `auth.uid()` simulation.
5. participant positive SELECT.
6. non-participant denial.
7. cross-connection isolation.
8. participant rows visibility within same connection only.
9. non-participant participant-row denial.
10. rollback/cleanup.
11. persistent fake data remaining 0.

### Abuse Carryover

- Instant-reply manipulation must not infer hidden participant rows or connection existence outside participant-bound context.
- Voice-reply manipulation must not bypass participant-bound reads, even with replay, stale state, repeated upload, or forged local reply eligibility.
- Android runtime/device phases must not assume backend permission from local UI state, device-side flags, root/emulator/hook checks, or client attestation alone.
- Rate limits, abuse scoring, nonce/session binding, and reveal/consent manipulation defenses remain future server-side work.

### Exact Future GO

`GO: Create Phase 29O local migration draft for connection participant RLS recursion fix only.`

## Phase 29O - Connection Participant RLS Recursion Fix Draft Review Plan (2026-06-19)

Status: PASS - local migration draft created for future static review. No DB command, Docker DB command, psql, Supabase CLI execution, SQL execution, migration apply, RLS harness rerun, test execution, test data/user creation, source/runtime change, package/env/APK/native change, staging, production, git add, commit, or push occurred.

Draft under review:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

Future static review must verify:
1. `SECURITY DEFINER` helper exists with signature `public.is_connection_participant_for_current_user(target_connection_id uuid)`.
2. helper returns boolean only.
3. helper has fixed `search_path = public, auth, pg_temp`.
4. all table references are schema-qualified.
5. dynamic SQL is absent.
6. no row data is returned.
7. `auth.uid()` is linked to `public.anonymous_identities.owner_user_id`.
8. participant membership is checked through `public.connection_participants`.
9. existing recursive SELECT policies are dropped and recreated.
10. no INSERT, UPDATE, DELETE, or `WITH CHECK` policies are added.
11. no service role dependency exists.
12. function EXECUTE posture is explicit and does not grant anon/PUBLIC execution.

Future apply/harness sequence remains blocked until separate explicit GO phases after static review.

## Phase 29P - SECURITY DEFINER / RPC Probing Exposure Static Review (2026-06-19)

Status: NEEDS_REVISION - static/apply readiness review completed. No DB command, Docker DB command, psql, Supabase CLI execution, SQL execution, migration apply, RLS harness rerun, test execution, test data/user creation, SQL migration edit, source/runtime change, package/env/APK/native change, staging, production, git add, commit, or push occurred.

Reviewed draft:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

Review outcome:
1. helper returns boolean only and no row data.
2. helper uses `SECURITY DEFINER`, fixed `search_path = public, auth, pg_temp`, schema-qualified table references, and no dynamic SQL.
3. helper preserves `auth.uid()` to `public.anonymous_identities.owner_user_id` participant membership checks.
4. helper grants EXECUTE to `authenticated` while living in `public`.
5. direct authenticated RPC calls may be possible through Supabase/PostgREST if the function remains exposed.
6. random UUID probing is impractical, but boolean membership probing for known or leaked connection UUIDs is not acceptable before revision.
7. Phase 29O must not be locally applied as-is.

Future verification requirement:
- Phase 29Q must revise the draft to avoid direct product RPC exposure before any Phase 29R/29S local apply or harness sequence.

Exact next GO:
`GO: Create Phase 29Q migration revision for connection participant RLS recursion RPC exposure only.`

## Phase 29Q - Revised Connection Participant RLS Recursion Migration Review Plan (2026-06-19)

Status: PASS - existing Phase 29O migration draft revised to reduce public RPC probing exposure. No DB command, Docker DB command, psql, Supabase CLI execution, SQL execution, migration apply, RLS harness rerun, test execution, test data/user creation, new migration file, source/runtime change, package/env/APK/native change, staging, production, git add, commit, or push occurred.

Revised draft:
- `supabase/migrations/20260619153000_fix_connection_participant_rls_recursion.sql`

Static checkpoint verification must confirm:
1. public helper was removed from final policy calls.
2. `private.is_connection_participant_for_current_user(target_connection_id uuid)` exists.
3. helper remains boolean-only, `SECURITY DEFINER`, fixed `search_path`, schema-qualified, and dynamic-SQL-free.
4. policy calls use the private helper for both `public.connections` and `public.connection_participants`.
5. recursive policy shape remains removed.
6. no INSERT, UPDATE, DELETE, or `WITH CHECK` policy is added.
7. no broad table grants or service-role dependency is added.
8. private schema and helper EXECUTE posture are reviewed before any apply.

Exact next GO:
`GO: Commit Phase 29Q revised migration checkpoint only.`

## Phase 29R - Local Apply Metadata Verification For Connection Participant RLS Recursion Fix (2026-06-19)

Status: PASS - revised migration applied locally and metadata verified. No RLS harness, test execution, test data/user creation, staging, production, remote Supabase command, source/runtime change, package/env/APK/native change, migration edit, new migration file, git add, commit, or push occurred.

Verified:
1. local DB target was `supabase_db_ankion` / `postgres`.
2. pre-apply schema-only checkpoint was created outside the repository.
3. `private` schema exists.
4. `private.is_connection_participant_for_current_user(uuid)` exists and returns boolean.
5. helper is `SECURITY DEFINER` with fixed `search_path=public, auth, pg_temp`.
6. `public.is_connection_participant_for_current_user(uuid)` is absent.
7. `public.connections` and `public.connection_participants` SELECT policies call the private helper.
8. RLS remains enabled on both target tables.
9. no INSERT, UPDATE, DELETE policies or unsafe table grants were added.
10. no Phase 29R test users/data were created.

Phase 29S must rerun the local RLS harness to validate participant access, non-participant denial, cross-connection isolation, and private helper EXECUTE behavior.

Exact next GO:
`GO: Run Phase 29S local RLS harness rerun for connection participant recursion fix only.`
