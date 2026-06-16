# Supabase Client Integration Boundary Plan

## Phase

Phase 18E — Documentation-only Supabase Client Integration Boundary Plan

## Purpose

This document defines where and how Supabase client integration should later happen in ankion.

The goal is not to install Supabase, create a client, add environment variables, or write code yet.

The goal is to protect the architecture before implementation by defining safe client boundaries, session handling direction, query rules, and forbidden direct access patterns.

This phase is documentation-only.

No Supabase client implementation is included in Phase 18E.

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
- Phase 18C — Auth Foundation Plan
- Phase 18D — Database Schema Draft Plan

Current state:

- No Supabase package installed
- No Supabase client exists
- No `.env` file added
- No Auth implementation exists
- No SQL exists
- No migrations exist
- No RLS policies exist
- No Storage buckets exist
- No backend/API exists

---

## Core Integration Rule

The mobile client must never become a shortcut around the privacy model.

Client integration must respect:

- RLS
- anonymous identity separation
- real profile privacy
- reveal grant rules
- storage access boundaries
- safe query payloads

The client should not directly query sensitive tables unless the access pattern is explicitly safe.

---

## Future Supabase Client Location

Possible future location:

```txt
apps/mobile/src/lib/supabase.ts
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

Phase 20D confirms Supabase client integration remains blocked while finalized schema readiness is NOT READY.

The client must not be introduced until schema, RLS verification, Storage privacy, Auth flow, environment strategy, and testing/audit gates are explicitly passed.

## Phase 20E RLS Client Boundary Note

Phase 20E confirms Supabase client integration remains blocked.

The client must not be introduced until RLS verification readiness passes, safe view/RPC boundaries are finalized, and public-safe query surfaces are proven not to expose private profile data, `owner_user_id`, raw storage paths, or reveal internals.

No Supabase client, package install, environment file, route integration, or data fetching hook is authorized by this note.

## Phase 20F Storage Client Boundary Note

Phase 20F confirms client-side Storage integration remains blocked.

The mobile client must not upload media, request signed URLs, read raw storage paths, or access Storage-backed media until bucket strategy, path privacy, signed URL rules, metadata access rules, reveal-grant-dependent media visibility, and audit/test procedures are approved.

## Phase 20G Auth Client Boundary Note

Phase 20G confirms Supabase client and Auth integration remain blocked.

The mobile client must not add login/signup UI, session handling, Supabase client setup, environment variable reads, Auth providers, or data fetching until schema, RLS, Storage, Auth, environment, and testing/audit gates are explicitly passed. No service role key may ever be used in the mobile client.

## Phase 20H Migration Client Boundary Note

Phase 20H confirms migration rollback/check strategy is PLANNED while client integration remains BLOCKED / NO-GO.

The mobile client must not connect to migrated tables, policies, views, RPCs, or Storage surfaces until future migrations pass pre-checks, post-checks, rollback documentation review, RLS/privacy verification, environment strategy review, and client integration approval.

## Phase 20I Environment Client Boundary Note

Phase 20I confirms environment variable strategy is PLANNED while client integration remains BLOCKED / NO-GO.

Future mobile client environment use must follow `docs/architecture/ENVIRONMENT_VARIABLE_STRATEGY_PLAN.md`. `EXPO_PUBLIC_` variables may contain only non-secret client-safe values. The Supabase service role key must never be used in mobile code, Expo public environment variables, committed files, route UI, or client-side configuration.

No Supabase client, environment variable reads, Auth/session integration, data fetching, package changes, or runtime behavior are authorized by this note.

## Phase 20J Client Integration Boundary Approval Review Note

Phase 20J reviewed and tightened the future Supabase client integration boundary.

Client integration boundary status:

```txt
REVIEWED / PLANNED
```

Implementation status:

```txt
NO-GO
```

### Client Integration Purpose

Supabase client integration must remain blocked until finalized schema readiness, RLS policy verification readiness, Auth flow boundary readiness, Storage privacy boundary readiness, environment strategy, migration rollback/check strategy, and testing/audit procedure are ready.

The client must never shape or bypass the security model. The client can only consume access patterns that are already protected by schema design, RLS, Auth context, Storage rules, safe DTO/view/RPC boundaries, and reveal grant checks.

### Mobile Client Boundary

Future mobile code may use the public anon key only after explicit implementation approval.

The mobile client must never:

- use the service role key
- bypass RLS
- assume access without authenticated user context
- query data without explicit policy coverage
- read raw private profile rows
- read raw owner identifiers from public-safe surfaces
- treat the anon key as permission

### Auth Session Boundary

No session handling is implemented yet.

Future session handling must be designed before implementation and must preserve separation between:

- Auth account identity
- private real profile identity
- anonymous interaction identity

Anonymous identity and real profile identity must remain separated in client state, query payloads, and UI surfaces.

### Data Access Boundary

Discover, Feed, Chat, Profile, and Reveal Requests must not directly read unsafe/private tables.

Any future query must be mapped to explicit RLS policy coverage first. Real profile visibility must depend on owner-approved reveal grants and must not be inferred from reveal request state alone.

Future client access should prefer safe DTOs, safe views, or reviewed RPCs rather than raw sensitive rows.

### Storage Access Boundary

No bucket access is approved yet.

Voice, photo, video, and future profile media access must be owner-safe, participant-safe, and reveal-safe. Public bucket assumptions are not approved.

The client must not read raw storage paths, generate signed URLs, upload media, or assume media visibility until Storage privacy boundaries are approved and tested.

### Environment Boundary

Client integration must align with `docs/architecture/ENVIRONMENT_VARIABLE_STRATEGY_PLAN.md`.

`EXPO_PUBLIC_` values may contain only client-safe non-secret values. Service role keys, admin secrets, provider secrets, JWT secrets, storage signing secrets, webhook secrets, production credentials, and private admin tokens remain prohibited in mobile.

### Implementation Approval Gate

Supabase client implementation can start only after:

- finalized schema readiness is approved
- RLS policy verification readiness is approved
- Auth flow boundary is approved
- Storage privacy boundary is approved
- environment strategy is approved for implementation
- migration rollback/check strategy is approved for implementation
- package alignment issue is resolved or explicitly accepted
- testing/audit procedure is defined

Known package alignment item:

- `expo install --check` currently reports `expo@56.0.5` should be `~56.0.6`.
- This is deferred and must not be fixed in Phase 20J.

### Current Status

- Client integration boundary: REVIEWED / PLANNED
- Supabase implementation: NO-GO
- SQL/migrations: NO-GO
- Auth/RLS/Storage implementation: BLOCKED
- Runtime behavior: unchanged
- Package alignment: DEFERRED

No Supabase client, package install, package edit, lockfile edit, `.env`, Auth/session handling, RLS, Storage, backend/API, route UI, apps/web source, navigation behavior, mock data, or runtime behavior is authorized by this review.

## Phase 20K Client Testing Boundary Note

Phase 20K confirms testing / audit procedure is PLANNED while client integration remains BLOCKED / NO-GO.

Future client integration tests must verify that mobile uses only approved public anon key access, never references service role keys, uses only client-safe `EXPO_PUBLIC_` values, maps queries to approved RLS policy coverage, avoids unsafe direct private-table reads, and does not infer real profile visibility without owner-approved reveal grants.

No Supabase client, data fetching, test implementation, package changes, or runtime behavior are authorized by this note.

## Phase 20L Final Client Integration Go/No-Go Note

Phase 20L confirms Supabase client integration remains NO-GO.

Client integration boundary status remains REVIEWED / PLANNED, but implementation is blocked by package alignment, schema, RLS, Auth/session, Storage, environment, migration, and testing/audit blockers.

Recommended next phase:

```txt
Phase 21A - Expo Package Alignment
```

No Supabase client, package changes, Auth/session handling, data fetching, route changes, or runtime behavior are authorized by this note.

## Phase 21A Package Alignment Result

Phase 21A resolved the deferred Expo package alignment item for the current mobile package set.

Confirmed:

- `expo`: `~56.0.8`
- `expo-linking`: `~56.0.13`
- `expo-router`: `~56.2.8`
- `corepack pnpm --filter @ankion/mobile exec expo install --check`: PASS

Client integration impact:

- Package alignment is complete for this readiness item.
- Supabase client integration remains NO-GO.
- Client integration remains blocked by schema, RLS, Auth/session, Storage, environment, migration, testing/audit, and explicit implementation approval gates.
- No `.env` files, Supabase client, Auth/session handling, SQL/migrations, RLS, Storage, backend/API logic, route UI changes, or runtime product behavior were added in Phase 21A.

---

## Phase 22D Safe DTO / RPC Boundary Update

Phase 22D aligns this client integration boundary with the Phase 22A schema expansion, Phase 22B RLS matrix expansion, and Phase 22C Storage / Media Capture Intent boundary update.

This remains documentation-only.

This note does not authorize:

* Supabase client implementation
* Auth/session handling
* data fetching hooks
* SQL
* migrations
* RLS policies
* Storage buckets
* Storage policies
* signed URL code
* media upload behavior
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

Client integration remains:

```txt
BLOCKED
```

---

## Phase 22D Core Client Rule

The mobile client must consume only safe DTOs, safe views, or reviewed RPC outputs.

The mobile client must not directly consume raw sensitive table rows for:

* private profiles
* anonymous identity ownership
* reveal requests
* visibility grants
* blocks
* voice usage counters
* media capture intents
* media metadata
* reports
* notifications
* location/nearby signals

The client can display state, request actions, and route users.

The client must not decide security.

---

## Phase 22D Never-Return Fields

Frontend-facing DTOs must not return these fields unless a later safe exception is explicitly approved:

* auth user id
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
* raw reveal request internals
* raw visibility grant internals
* private moderation fields
* private profile fields before reveal
* exact location
* service role or admin-only values

If a frontend feature needs one of these values, the design is unsafe until reviewed.

---

## Phase 22D Safe DTO Categories

Future client access should be organized around safe DTO categories.

### 1. Safe Discover DTO

Purpose:

* show anonymous discovery entries

May include:

* anonymous identity id if safe
* safe anonymous label
* blurred or abstract avatar reference
* voice teaser metadata
* safe topic/interest chips
* safe chat target
* follow state if safe
* block-safe availability state

Must not include:

* real name
* clear real avatar
* owner_user_id
* auth user id
* private profile id
* raw storage path
* reveal grant internals

---

### 2. Safe Feed DTO

Purpose:

* show public-safe anonymous media or voice moments

May include:

* feed item id
* media type
* safe media reference
* duration if audio/video
* anonymous owner preview
* safe engagement metadata
* safe chat target
* followed badge if safe

Must not include:

* owner_user_id
* auth user id
* real profile id
* real name
* clear real avatar before reveal
* raw storage path
* storage bucket
* capture intent internals
* media hash/security internals

---

### 3. Safe Chat List DTO

Purpose:

* show existing private anonymous connections

May include:

* conversation id
* safe anonymous participant preview
* last activity time
* safe last voice/message summary
* reveal state summary
* unread count
* allowed actions

Must not include:

* participant owner_user_id
* sender_user_id
* recipient_user_id
* private profile fields
* raw voice storage path
* raw grant internals
* raw block internals

---

### 4. Safe Chat Thread DTO

Purpose:

* show a valid private connection/thread

May include:

* conversation id
* safe participant preview
* safe voice message references
* safe reveal request status
* safe profile visibility status
* safe remaining voice counts
* allowed actions
* block-safe availability state

Must not include:

* raw participant user ids
* raw storage paths
* raw quota rows
* raw reveal request rows
* raw visibility grant rows
* private profile fields unless safe profile view permits them

---

### 5. Safe Reveal DTO

Purpose:

* show reveal request state and allowed actions

May include:

* visible state summary
* calm status copy
* allowed actions
* requester/owner safe anonymous preview
* safe chat target

Must not include:

* raw request internals
* raw grant internals
* owner_user_id
* requester_user_id
* profile_owner_user_id
* private profile fields before valid grant
* harsh rejected/denied labels

Profile visibility must be returned as a backend-verified result.

Correct frontend shape direction:

```txt
visible: true/false
safeProfile: only if visible
statusCopy
allowedActions
safeChatTarget
```

Frontend must not infer real profile visibility from `reveal_request.state` alone.

---

### 6. Safe Profile DTO

Purpose:

* show real profile only after valid visibility check

May include after valid grant and no block:

* clear avatar safe media reference
* display name
* bio
* safe profile fields approved by product rules
* safe shared content
* safe chat target

Must not include:

* auth user id
* raw profile row
* raw storage path
* raw grant internals
* moderation fields
* unrelated private identifiers

If no valid grant exists or block exists, the DTO must return hidden/private state, not private profile data.

---

### 7. Safe Follow DTO

Purpose:

* show follow state for anonymous identity or instant profile

May include:

* isFollowing
* followedAt if safe
* muted state if safe
* safe target anonymous identity reference

Must not include:

* target owner_user_id
* target real profile
* private profile fields
* reveal grant state
* follower graph beyond approved safe aggregate

Follow must not create or imply profile visibility.

---

### 8. Safe Voice Limit DTO

Purpose:

* show remaining voice allowance without exposing quota internals

May include:

* dailyRemaining
* perConnectionRemaining
* maxDurationSeconds
* resetHint if safe
* allowedToSend
* calm status copy

Must not include:

* raw voice_usage_daily row
* raw voice_usage_connection_daily row
* sender_user_id
* recipient_user_id
* internal enforcement fields

The backend must remain source of truth.

---

### 9. Safe Media Access DTO

Purpose:

* allow media display only after access checks

May include:

* media item id
* media type
* duration if safe
* safe media reference
* signed access result if authorized
* expiry hint if needed

Must not include:

* raw storage path
* storage bucket
* owner_user_id
* media hash/security internals
* server nonce
* capture intent internals

Signed URL generation must happen only after backend/RPC/Edge Function access checks.

---

### 10. Safe Report DTO

Purpose:

* let reporter submit report and optionally see safe report status

May include:

* report id
* safe status
* safe category
* created timestamp

Must not include:

* reporter_user_id to reported user
* private moderation notes
* internal safety scoring
* unrelated identity links

---

### 11. Safe Notification DTO

Purpose:

* show notification without leaking identity

May include:

* notification id
* safe title
* safe body
* safe route target
* read state
* created timestamp

Must not include:

* real name before reveal
* clear real avatar before reveal
* owner_user_id
* sender_user_id
* raw storage path
* private moderation fields
* unsafe route target

Notifications must route only to safe surfaces.

---

### 12. Location / Nearby DTO

Status:

* deferred

Future direction may include only coarse anonymous nearby signal data.

Must not include:

* exact location
* real identity
* owner_user_id
* private profile
* profile browsing by location
* persistent tracking graph

Location client integration remains NO-GO until separate privacy model, schema, RLS, client, and test gates pass.

---

## Phase 22D RPC / View Preference

Future client integration should prefer RPC or safe views for high-risk flows.

High-risk flows that should not use raw direct table access:

* reveal profile visibility check
* creating reveal request
* approving reveal request
* revoking visibility grant
* sending voice message
* checking voice limits
* creating media capture intent
* completing media upload
* generating signed media access
* blocking user
* following anonymous identity
* submitting report
* returning notifications
* future calls
* future nearby voice signals

The RPC/view layer should return safe DTOs, not raw table rows.

---

## Phase 22D Client Action Boundary

The client may request actions.

The backend must decide whether actions are allowed.

Client may request:

* start chat from safe target
* send voice
* request reveal
* reveal own profile
* stay hidden
* block
* follow anonymous identity
* request media capture intent
* submit report
* mark notification as read

Client must not decide:

* whether profile is visible
* whether block is active
* whether a grant is valid
* whether quota is enforceable
* whether media access is authorized
* whether capture intent is valid
* whether signed URL should be created
* whether location signal is safe

---

## Phase 22D Open Decisions Blocking Client PASS

Client integration remains blocked until these are finalized:

* exact safe DTO names and shapes
* exact RPC/view list
* exact route-to-DTO mapping
* exact allowed direct table access, if any
* exact Auth session state model
* exact profile visibility RPC behavior
* exact voice send RPC behavior
* exact media capture intent RPC behavior
* exact signed URL generation boundary
* exact block/follow/report/notification DTO boundaries
* exact environment variable approval
* full client integration test plan

---

## Phase 22D Readiness Decision

This client integration boundary is updated, but remains:

```txt
NOT READY FOR CLIENT IMPLEMENTATION
```

Decision:

Do not create Supabase client code, install Supabase packages, add `.env` files, add Auth/session handling, add data fetching hooks, create SQL, migrations, RLS policies, Storage policies, backend/API logic, route behavior, or runtime behavior from Phase 22D.

Next correct planning phase:

Phase 22E — Testing / Audit Procedure Update for Phase 22A-22D.

## Phase 24B Client Boundary Final Approval Note

Phase 24B approves only a future inert Supabase client boundary scaffold after separate explicit implementation approval.

Decision:

```txt
GO - future inert client scaffold only
```

Allowed later, only with explicit implementation approval:

- Create a mobile env boundary module, for example `apps/mobile/src/lib/supabaseEnv.ts`.
- Create an inert mobile client boundary module, for example `apps/mobile/src/lib/supabaseClient.ts`.
- Optionally add `@supabase/supabase-js` only if package and lockfile edits are explicitly included in that future implementation slice.

The inert client scaffold must not:

- be imported by route screens
- fetch data
- run Auth/session handling
- query raw tables
- access Storage
- create signed URLs
- expose service role or admin values
- decide reveal/profile visibility
- change navigation or runtime product behavior

Full client integration remains blocked until schema, RLS, Auth/session, Storage, environment, safe DTO/RPC, migration, and testing/audit gates are approved.

## Phase 24C Inert Client Boundary Result

Phase 24C created the inert mobile boundary only.

Current files:

- `apps/mobile/src/lib/env.ts`: public env reader only.
- `apps/mobile/src/lib/supabaseBoundary.ts`: inert boundary descriptor only.

No SDK import, no real client, no Auth/session handling, no data fetching, no Storage access, and no route import exists.

## Phase 24D SDK Dependency Decision

Decision:

```txt
@supabase/supabase-js: NO-GO now / conditional GO later
```

Do not install the SDK yet.

A later SDK slice may be considered only if it explicitly allows package and lockfile edits and keeps these constraints:

- no route/screen data binding
- no Auth/session runtime unless separately approved
- no direct raw private-table queries
- no Storage access
- no signed URL generation
- no reveal/profile visibility decision in the client
- no runtime product behavior change

Future conversion path:

1. Keep `supabaseBoundary.ts` inert while schema/Auth/RLS gates are unresolved.
2. When a later package slice is approved, add the SDK dependency without route imports.
3. Only after Auth/session and RLS/safe DTO gates pass, convert the boundary into a real client factory.
4. Only after safe DTO/RPC surfaces exist, allow route data binding in separate tiny phases.

The anon key is not authorization. Access still depends on Auth context, RLS, safe DTO/RPC boundaries, block checks, and owner-approved connection-scoped profile visibility grants.
## Phase 24E Client DTO Boundary Note

Phase 24E confirms that future client access to private profile and anonymous identity data must be DTO-first.

Client access rules:

- no raw non-owner reads from `profiles_private`.
- no raw public reads from `anonymous_identities` that expose owner linkage.
- non-owner profile visibility requires safe reveal-specific DTO/view/RPC and active owner-approved connection/context visibility grant.
- anonymous previews require safe anonymous DTO/view/RPC that excludes `owner_user_id`, `auth_user_id`, `profile_private_id`, private profile fields, real profile photo fields, moderation internals, device/IP/security metadata, and any correlation path to real identity.
- service role key remains forbidden in mobile, Expo public variables, committed files, `.env.example`, and client-facing docs.

No client implementation, SDK dependency, query hook, route data binding, Auth/session runtime, Storage access, or product behavior is authorized by this note.

## Phase 24G Auth Session Boundary Client Constraint

Phase 24G documents the future Auth/session state model but does not authorize client implementation.

Current client boundary remains:

- `apps/mobile/src/lib/env.ts` is a public env reader only.
- `apps/mobile/src/lib/supabaseBoundary.ts` is inert only.
- `@supabase/supabase-js` is still not approved.
- no runtime Auth binding exists.
- no route/screen imports or backend data binding are authorized.

Future Auth integration must follow Phase 24G states:

- `unauthenticated`
- `session_loading`
- `authenticated_unprovisioned`
- `authenticated_profile_ready`
- `authenticated_anonymous_ready`
- `authenticated_ready`
- `session_expired`
- `suspended_or_deleted`

The client must not trust client-provided `owner_user_id`, must not expose raw session tokens or refresh tokens, and must clear sensitive owner/anonymous/reveal cache on logout, account switch, expired session, suspended account, or deleted account.

## Phase 24N Migration Apply Planning Client Boundary Confirmation

Phase 24N plans only the local/staging database apply environment for:

- `supabase/migrations/20260615062809_create_private_profile_and_anonymous_identity_foundation.sql`

Client boundary remains unchanged:

- mobile app runtime stays disconnected from the migration apply work.
- no route, screen, hook, or local product state reads from Supabase tables.
- no Supabase runtime client is added or activated.
- no Auth/session implementation is added.
- no `.env` or `.env.local` is created or modified.
- `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` remain inert boundary names only until a separate runtime phase.
- service role keys must never enter app code, web code, Expo public env, `.env.example`, screenshots, logs, or client-facing docs.

A successful future local/staging migration apply will not by itself authorize app runtime binding.
