# Environment Variable Strategy Plan

## 1. Environment Strategy Purpose

This document defines ankion's future environment variable strategy before any Supabase implementation begins.

Environment strategy must be finalized before Supabase implementation because misplaced secrets can bypass the product's privacy model, expose service-role access, leak production credentials, or confuse which values are safe for mobile clients.

This phase is planning-only. It does not create `.env` files, add real environment variables, install packages, add a Supabase client, implement Auth, implement RLS, implement Storage, create SQL, create migrations, or change runtime behavior.

## 2. Environment Types

Future environment configuration should be separated by environment:

- local development
- preview/staging
- production

Each environment should have its own configuration boundary. Production secrets must not be copied into local or preview files, and local development values must not be treated as production-safe.

## 3. Supabase Public Key Boundary

The future Supabase public anon key may be used only as a public client-side key when Supabase implementation is explicitly approved later.

The anon key is not a secret, but it is also not permission by itself. All real access control must depend on:

- RLS
- authenticated user context
- safe query boundaries
- reveal grant checks
- Storage access checks

The anon key must never be used as proof that a request is safe. If RLS, Auth, Storage, or safe DTO boundaries are incomplete, the anon key must not be connected to real app behavior.

## 4. Service Role Key Prohibition

The Supabase service role key must never be used in mobile app code.

The service role key must never be exposed through Expo public environment variables.

The service role key must never be committed to the repository.

The service role key may only belong to trusted server-side/admin environments if such backend/admin tooling is explicitly designed, reviewed, and approved later.

No mobile route, mobile library file, Expo config, public environment variable, or client-side code may reference the service role key.

## 5. Expo Public Env Naming Direction

Future Expo public mobile variables must use the `EXPO_PUBLIC_` prefix where Expo requires public client-side environment access.

Only non-secret, client-safe values may use `EXPO_PUBLIC_`.

Do not place these values in `EXPO_PUBLIC_` variables:

- private keys
- Supabase service role keys
- admin secrets
- JWT secrets
- storage signing secrets
- webhook secrets
- provider OAuth secrets
- production credentials
- private admin tokens

Future `EXPO_PUBLIC_` values must be reviewed before mobile code uses them.

## 6. Secrets That Must Never Be Committed

The following must never be committed:

- Supabase service role key
- database password
- JWT secret
- storage signing secret
- webhook secret
- provider OAuth secrets
- any production credentials
- any private admin token
- any value that can bypass RLS, Auth, Storage, or reveal grant checks

## 7. No .env Creation Yet

This phase does not create:

- `.env`
- `.env.local`
- `.env.production`
- `.env.example`
- any other environment file

Environment files may be introduced later only after Supabase implementation receives explicit GO approval and the environment strategy is reviewed again.

## 8. Future Validation Expectations

Future environment validation should check:

- `.gitignore` protects environment files
- no secrets are committed to git
- mobile source does not reference a service role key
- `EXPO_PUBLIC_` variables contain only client-safe values
- production secrets are configured outside source control
- service role keys do not appear in mobile, route UI, apps/web source, package files, or docs intended for client use
- public anon key usage is protected by RLS and authenticated context
- environment names do not encourage mixing local, preview/staging, and production values

## 9. Readiness Impact

Environment variable strategy status:

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

This document does not change app runtime behavior and does not approve Supabase client integration.

## 10. Next Recommended Phase

Phase 20J - Client Integration Boundary Approval Review.

Phase 20J should remain documentation-only unless the user explicitly approves a different narrow implementation task.

## Phase 20J Client Environment Boundary Review Note

Phase 20J confirms the environment strategy remains planning-only while client integration boundary is REVIEWED / PLANNED.

The future mobile client may only use `EXPO_PUBLIC_` values that are non-secret and client-safe. The Supabase service role key, admin secrets, provider secrets, JWT secrets, storage signing secrets, webhook secrets, production credentials, and private admin tokens remain prohibited in mobile.

No `.env` files, real environment variables, Supabase client code, Auth/session handling, package changes, or runtime behavior are authorized by this note.

## Phase 20K Environment Audit Note

Phase 20K confirms testing / audit procedure is PLANNED while environment implementation remains BLOCKED / NO-GO.

Future environment audits must verify that no secrets are committed, mobile source does not reference service role keys, `EXPO_PUBLIC_` values contain only client-safe values, and production secrets are configured outside source control.

No `.env` files, environment variables, package changes, or runtime behavior are authorized by this note.

## Phase 20L Final Environment Go/No-Go Note

Phase 20L confirms environment variable implementation remains blocked.

Final Supabase implementation decision:

```txt
NO-GO
```

No `.env` files, real environment variables, Supabase client setup, Auth/session handling, package changes, or runtime behavior are authorized by this note.

## Phase 21A Package Alignment Boundary Note

Phase 21A completed Expo package alignment and validation without introducing environment variables.

Confirmed:

- `expo install --check`: PASS
- mobile typecheck: PASS
- web typecheck: PASS
- web build: PASS
- mobile Android export:embed: PASS

Environment status remains:

```txt
NO-GO
```

No `.env`, `.env.local`, `.env.production`, `.env.example`, real environment variable, Supabase client, Auth/session handling, SQL/migration, RLS, Storage, or backend/API implementation was added.

## Phase 24B Env Boundary Final Approval Note

Phase 24B updates the environment boundary from planning-only to approved only for a future inert env scaffold, after separate explicit implementation approval.

Boundary decision:

```txt
GO - future inert env scaffold only
```

Allowed later, only with explicit implementation approval:

- Define `EXPO_PUBLIC_SUPABASE_URL` as the client-safe Supabase URL variable name.
- Define `EXPO_PUBLIC_SUPABASE_ANON_KEY` as the client-safe public anon key variable name.
- Create `.env.example` with placeholder/example values only.

Still forbidden:

- `.env`
- `.env.local`
- `.env.production`
- real Supabase URL values
- real anon key values in committed files
- service role keys in any mobile, Expo public, committed, or client-facing file
- provider secrets, JWT secrets, storage signing secrets, production credentials, or admin tokens

The anon key is not a secret, but it is not authorization. Future access must still depend on RLS, authenticated context, safe DTO/view/RPC boundaries, and connection/context-scoped profile visibility grants.

## Phase 24D SDK / Auth Secret Boundary Note

Phase 24D confirms the secret boundary remains locked while SDK dependency and Auth implementation are still gated.

Confirmed:

- `.env.example` may contain only placeholder public values.
- `.env` and `.env.local` must not be created in this phase.
- Service role keys, admin secrets, JWT secrets, Storage signing secrets, provider secrets, production credentials, and private admin tokens must never appear in mobile code, Expo public variables, committed files, or client-facing docs.
- The anon key is public/client-safe only; it is not authorization.
- Future SDK installation does not weaken the service role prohibition.