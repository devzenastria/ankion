# Backend Runtime Deployment Contract

## Purpose

This contract defines the public-safe runtime requirements for the ANKION backend API. It exists to prevent production API runtimes from issuing or returning sessions from a local Supabase/Auth runtime while the mobile app is configured for the hosted Supabase project.

## Runtime Target

The selected owned backend runtime target is a managed container/backend service.

The runtime must provide a stable API process, controlled deployment and restart behavior, centralized logs, and explicit environment variable management. Cloudflare or another edge layer may route traffic to the runtime, but the backend runtime itself must remain independently verifiable through its health and auth/session gates.

## Required Environment Variable Names

The backend API expects these environment variable names:

- `HOST`
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Only variable names are documented here. Secret values must never be committed, logged, or copied into public documentation.

## Production Supabase URL Rules

In production, `SUPABASE_URL` must point to the hosted Supabase project used by the mobile app.

Production `SUPABASE_URL` must:

- use `https`
- point to a hosted Supabase project
- not point to `localhost`
- not point to `127.0.0.1`
- not point to `0.0.0.0`
- not point to `host.docker.internal`
- not use port `54321`

Development and local test runtimes may use local Supabase values. Production runtimes must fail closed when configured with local Supabase/Auth URLs.

## Secret Handling Boundaries

The Supabase service role key is backend-only. It must never be present in mobile code, mobile build-time configuration, client logs, or public documentation.

Runtime secret handling rules:

- no secrets in tracked files
- no privileged key in mobile
- no tokens in logs
- no request bodies in logs
- no password or recovery email values in logs
- no access token or refresh token values in public reports
- no manual JWT acceptance path in mobile

The backend must return real Supabase Auth sessions from the hosted project. The mobile app must not accept manually signed JWTs as a workaround.

## Health And Readiness Gates

The runtime must expose these gates:

- `/health` is reachable and returns a successful status when the API process is alive
- `/ready` returns a successful status only when required runtime dependencies are configured

Readiness must fail when required backend environment variables are missing or invalid for the active runtime mode.

## Auth And Session Acceptance Gates

A production deployment is not accepted until the username auth path passes all gates:

- username signup returns `200`
- username login returns `200` for valid credentials
- returned access token issuer is the hosted Supabase project
- returned access token key id exists in the hosted Supabase JWKS
- hosted Supabase `/auth/v1/user` returns `200` for the returned access token
- hosted Supabase refresh-token grant returns `200` for the returned refresh token
- the mobile app can complete `setSession` with the returned session
- release APK opens and completes auth without Metro

## Deployment And Restart Boundary

Deployment updates must affect only the backend API runtime unless a separate approved sprint expands the scope.

Allowed deployment boundary:

- update backend runtime environment variables through the managed service secret/config system
- redeploy or restart the backend API runtime
- verify `/health`, `/ready`, and auth/session acceptance gates

Out-of-band changes to database migrations, Supabase project settings, mobile APK builds, or Cloudflare routing require separate approval.

## Post-Deploy Verification Checklist

After each backend runtime deployment:

1. Confirm `/health` returns a successful status.
2. Confirm `/ready` returns a successful status.
3. Run one generated username signup probe without printing credentials or tokens.
4. Confirm the returned access token issuer is the hosted Supabase project.
5. Confirm the returned access token key id exists in hosted Supabase JWKS.
6. Confirm hosted Supabase `/auth/v1/user` accepts the returned access token.
7. Confirm hosted Supabase refresh-token grant accepts the returned refresh token.
8. Confirm the release APK can complete mobile session setup.

## Rollback Trigger Conditions

Rollback or block rollout when any of these conditions occur:

- returned access token issuer host is local
- returned access token key id is missing from hosted Supabase JWKS
- hosted Supabase `/auth/v1/user` rejects the returned access token
- hosted Supabase reports refresh token not found
- mobile `setSession` returns `AuthApiError` with `401` or `403`
- `/ready` fails due to missing or invalid runtime configuration

## Out Of Scope

This contract does not approve or document:

- database migrations
- Supabase project configuration changes
- mobile release builds
- Cloudflare DNS changes
- Cloudflare Tunnel changes
- package installation
- service role use in mobile
- manual JWT signing or manual JWT acceptance in mobile
- provider-specific private deployment commands
- private origin details, tunnel identifiers, or secret values