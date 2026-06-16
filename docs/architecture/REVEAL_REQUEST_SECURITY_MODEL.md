# Reveal Request Security Model

## Phase

Phase 17C — Documentation-only Reveal Request Security Model

## Purpose

This document defines how reveal requests must work safely in ankion before any Supabase/Auth/RLS implementation begins.

The goal is to protect the core rule:

A real profile must not become visible unless the profile owner explicitly approves visibility.

This phase is documentation-only.

No Supabase implementation is included in Phase 17C.

---

## Core Product Rule

Reveal is permission-based.

A request does not expose a profile.

A request does not prove identity.

A request does not grant access.

A request only creates a review moment for the profile owner.

Real profile visibility opens only after an approved visibility grant exists.

---

## Current Security Context

Completed planning foundations:

- Phase 17A — Data Model + RLS Foundation Plan
- Phase 17B — Anonymous Identity / Real Profile Separation Plan

Current state:

- No backend exists
- No Supabase files exist
- No Auth exists
- No RLS policies exist
- No Storage buckets exist
- No migrations exist
- No reveal logic exists

---

## Reveal Request Lifecycle

### 1. Anonymous interaction exists

A reveal request should only happen after an interaction context exists.

Possible future context:

- conversation
- anonymous voice interaction
- anonymous media-to-chat interaction

Rule:

No reveal request should be created without a valid scoped interaction context.

---

### 2. Requester asks for visibility

Requester may ask to see the owner’s real profile.

Important:

The requester should not receive real profile data at request creation time.

Request creation only records intent.

---

### 3. Owner receives review opportunity

The profile owner can later review the request.

User-facing language should stay calm:

- Review when ready
- Keep private for now
- Open visibility later
- Owner keeps control

Avoid:

- Rejected
- Denied
- Failed
- Exposed
- Match accepted
- Match rejected

---

### 4. Owner decision creates grant

If owner approves visibility, a separate `profile_visibility_grants` record should be created.

The grant, not the request itself, controls profile visibility.

---

### 5. Viewer accesses profile through grant

Real profile data can be returned only if:

- viewer is authenticated
- viewer is the approved viewer
- active grant exists
- grant is linked to the correct profile owner
- grant has not been revoked
- RLS or safe view confirms access

---

### 6. Owner may revoke later

Future product may allow visibility revocation.

Revocation should not delete historical request context automatically.

Revocation should prevent future real profile reads.

---

## Future Tables Involved

### reveal_requests

Purpose:

Stores the request event.

Possible future fields:

- id
- conversation_id
- requester_user_id
- requester_anonymous_id
- profile_owner_user_id
- target_anonymous_id
- state
- created_at
- reviewed_at

Internal state names may be technical.

Suggested internal states:

- pending
- approved
- kept_private
- expired
- cancelled

User-facing copy must stay calm.

Do not use harsh UI labels.

---

### profile_visibility_grants

Purpose:

Stores approved profile visibility access.

Possible future fields:

- id
- profile_owner_user_id
- viewer_user_id
- conversation_id
- reveal_request_id
- created_at
- revoked_at

Rule:

Real profile reads should depend on this table, not only on reveal request state.

---

### profiles_private

Purpose:

Stores real profile data.

Default access:

- owner only

Extended access:

- approved viewer only through active visibility grant

---

### anonymous_identities

Purpose:

Connects anonymous interaction surfaces to owner-controlled identity.

Critical rule:

Non-owner clients must not directly resolve anonymous identity to owner profile.

---

## Read / Write Rules

| Entity                    | Create                     | Read                                 | Update                                            | Delete                       |
| ------------------------- | -------------------------- | ------------------------------------ | ------------------------------------------------- | ---------------------------- |
| reveal_requests           | requester in valid context | requester limited, owner scoped      | owner can review, requester can cancel if allowed | normally no client delete    |
| profile_visibility_grants | owner only                 | owner and approved viewer            | owner can revoke                                  | normally soft revoke         |
| profiles_private          | owner only                 | owner, approved viewer through grant | owner only                                        | owner/account lifecycle only |
| anonymous_identities      | owner/system               | safe fields only for non-owner       | owner/system                                      | system-controlled            |

---

## RLS Direction

### reveal_requests

Requester can insert only if:

- requester is authenticated
- requester is participant in conversation
- request targets a valid anonymous identity in that context
- no duplicate active request exists for same scoped context

Owner can select if:

- request targets owner’s anonymous identity
- owner owns the target identity

Requester can select limited fields if:

- requester created the request
- response does not expose private profile data

Owner can update review state if:

- owner owns target anonymous identity
- request is pending

---

### profile_visibility_grants

Owner can insert grant if:

- owner owns target real profile
- owner owns target anonymous identity
- reveal request exists
- request targets owner
- viewer is requester or approved viewer

Viewer can select grant if:

- viewer_user_id = auth.uid()
- grant is active

Owner can revoke grant if:

- profile_owner_user_id = auth.uid()

---

### profiles_private

Owner can select own row.

Approved viewer can select only if:

- active visibility grant exists
- grant.viewer_user_id = auth.uid()
- grant.profile_owner_user_id = profiles_private.user_id
- grant.revoked_at is null

No public select.

---

## Safe Request Visibility

Requester may see:

- request id
- generic state
- created_at
- conversation reference
- calm user-facing status

Requester must not see before approval:

- profile owner real name
- owner private avatar
- owner private bio
- owner email
- owner_user_id if avoidable
- private profile row
- hidden identity linkage

Owner may see:

- request id
- request context
- requester safe anonymous identity
- conversation reference
- created_at

Owner should not automatically see requester real profile unless separate grant allows it.

---

## Notification Safety

Future notifications must not leak identity.

Unsafe notification:

```txt
John wants to see your real profile.
```

## Phase 17E Alignment Note

Phase 17E confirms this document is part of the completed Phase 17 security foundation set.

Confirmed:

- Reveal request safety, owner-controlled visibility, and grant/block boundaries are planned before implementation.
- This remains documentation-only.
- No Supabase/Auth/RLS/Storage implementation files, migrations, SQL, backend/API, route/component, package, lockfile, or apps/web source changes were added.
