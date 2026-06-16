# Supabase Implementation Go / No-Go Review

## Phase

Phase 19A — Documentation-only Supabase Implementation Go / No-Go Review

## Purpose

This document decides whether ankion is ready to start Supabase implementation.

The goal is not to implement Supabase yet.

The goal is to make a controlled Go / No-Go decision before package installs, `.env`, SQL migrations, Auth, RLS, Storage, or client integration begin.

This phase is documentation-only.

No implementation is included in Phase 19A.

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
- Phase 18E — Supabase Client Integration Boundary Plan
- Phase 18F — Supabase Readiness Audit + Docs Alignment

Current state:

- No Supabase client exists
- No Supabase package install exists
- No `.env` file exists
- No Auth code exists
- No SQL exists
- No migrations exist
- No RLS policies exist
- No Storage buckets or policies exist
- No backend/API exists
- Mobile app remains static/behavior-free

---

## Core Product Risk

ankion depends on strict privacy boundaries.

The most dangerous failure would be:

- anonymous identity linking to real profile
- real profile becoming visible before approval
- profile avatar leaking through public storage
- owner_user_id leaking through client queries
- reveal request exposing real identity
- conversation membership becoming publicly readable
- voice/media storage paths revealing identity

Supabase implementation must not start unless these risks are controlled.

---

## Go / No-Go Summary

Current decision:

**No-Go for direct Supabase implementation.**

Reason:

The planning foundation is strong, but implementation should still be sliced before writing SQL, migrations, package installs, or client code.

Approved next direction:

**SQL Migration Slicing Plan only.**

Not approved yet:

- Supabase package install
- Supabase client creation
- `.env` creation
- Auth implementation
- SQL migration creation
- RLS SQL creation
- Storage bucket creation
- UI data integration

---

## Readiness Review

### 1. Product Privacy Model

Status:

Ready for planning.

Evidence:

- anonymous identity separation planned
- real profile privacy planned
- reveal grant model planned
- storage boundaries planned
- anti-leak rules documented

Verdict:

Go for implementation slicing.

No-Go for implementation.

---

### 2. Auth Model

Status:

Planned but not implementation-ready.

Known direction:

- Auth Account owns Private Profile
- Auth Account owns Anonymous Identity
- `auth.uid()` should drive ownership
- profile creation and anonymous identity creation should be controlled

Missing before implementation:

- exact signup flow
- exact profile creation strategy
- exact anonymous identity creation strategy
- session provider implementation plan
- missing profile recovery behavior
- missing anonymous identity recovery behavior

Verdict:

No-Go for Auth implementation.

---

### 3. Database Schema

Status:

Drafted but not SQL-ready.

Known tables:

- profiles_private
- anonymous_identities
- conversations
- voice_messages
- reveal_requests
- profile_visibility_grants
- feed_items

Missing before SQL:

- exact Postgres types
- exact constraints
- exact default values
- exact enum SQL definitions
- exact foreign key `on delete` behavior
- exact RLS dependency order
- exact migration file slicing

Verdict:

Go for SQL migration slicing plan.

No-Go for actual migration.

---

### 4. RLS Matrix

Status:

Expanded but not SQL-ready.

Known direction:

- deny by default
- owner-only profile access
- participant-only conversation access
- grant-controlled profile visibility
- safe anonymous fields only
- no public private profile reads

Missing before SQL:

- exact policy names
- exact SQL predicates
- exact helper functions if needed
- exact safe views/RPC decision
- policy test matrix before implementation

Verdict:

Go for RLS SQL planning.

No-Go for RLS implementation.

---

### 5. Storage Model

Status:

Planned but not implementation-ready.

Known buckets:

- voice-messages
- feed-media
- profile-avatars

Known rules:

- voice private by default
- profile avatars private by default
- feed media requires separate safety review
- signed URLs should require access checks

Missing before implementation:

- exact bucket policies
- exact signed URL strategy
- exact metadata stripping strategy
- exact file size/type limits
- exact upload lifecycle

Verdict:

No-Go for Storage implementation.

---

### 6. Client Integration

Status:

Boundary planned, not implementation-ready.

Known direction:

- Supabase client should live in a dedicated module later
- route files should not contain raw table queries
- service/query modules should mediate access
- safe views/RPCs may be needed

Missing before implementation:

- package install approval
- env variable strategy
- session provider plan
- service module structure
- error/loading state contracts

Verdict:

No-Go for client integration.

---

## Implementation Gate Status

| Gate                  | Status                            | Decision       |
| --------------------- | --------------------------------- | -------------- |
| Product privacy model | Strong planning exists            | Go for slicing |
| Auth foundation       | Planned, not exact enough         | No-Go          |
| Schema draft          | Planned, not SQL-ready            | Go for slicing |
| RLS matrix            | Expanded, not SQL-ready           | Go for slicing |
| Storage boundary      | Planned, not policy-ready         | No-Go          |
| Client boundary       | Planned, not implementation-ready | No-Go          |
| Test strategy         | Not detailed enough               | No-Go          |
| Migration slicing     | Not yet defined                   | Next phase     |

---

## Approved Next Work

The next safe phase should be:

**Phase 19B — SQL Migration Slicing Plan**

Purpose:

Plan migration files and implementation order without writing SQL.

Allowed:

- documentation only
- migration naming plan
- table creation order
- enum creation order
- RLS enablement order
- policy planning order
- storage policy planning order
- rollback notes

Forbidden:

- actual `.sql` files
- actual migrations
- Supabase client
- package install
- `.env`
- Auth code
- route changes
- backend/API
- Storage bucket creation

---

## Not Approved Yet

Do not start:

- `pnpm add @supabase/supabase-js`
- `.env` creation
- Supabase client file
- SQL migration files
- RLS policies
- Storage policies
- Auth screens
- session provider
- backend/API
- recorder/audio integration
- reveal request behavior
- upload behavior

---

## Required Before First SQL Migration

Before actual SQL migration begins, these must exist:

1. SQL Migration Slicing Plan
2. Exact enum SQL plan
3. Exact table order plan
4. Exact foreign key behavior plan
5. Exact RLS policy order plan
6. RLS test checklist
7. Rollback/recovery notes
8. Supabase folder structure plan

---

## Required Before Supabase Client Install

Before package install begins, these must exist:

1. Supabase package approval note
2. Environment variable plan
3. Supabase client module location decision
4. Session provider implementation plan
5. Safe query service boundary plan
6. No-direct-route-query rule
7. Basic local validation plan

---

## Required Before Auth Implementation

Before Auth implementation begins, these must exist:

1. Signup/login flow plan
2. Session state plan
3. Profile creation strategy
4. Anonymous identity creation strategy
5. Missing profile recovery strategy
6. Missing anonymous identity recovery strategy
7. Logout behavior plan

---

## Required Before Storage Implementation

Before Storage implementation begins, these must exist:

1. Bucket creation plan
2. Bucket policy plan
3. Signed URL access strategy
4. File naming rules
5. Metadata stripping plan
6. Upload limits
7. Revoked access handling

---

## Current Decision

Supabase implementation is not approved yet.

The foundation is strong enough to continue planning implementation slices.

Next recommended phase:

**Phase 19B — SQL Migration Slicing Plan**

This should remain documentation-only.

No SQL, no migrations, no Supabase implementation.
