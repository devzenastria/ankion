# Profile / Reveal Flow Coherence Plan

## Phase

Phase 13A — Documentation-only Profile / Reveal Requests flow coherence planning

## Purpose

This document defines how the Profile and Reveal Requests screens should stay coherent with the Chat reveal model.

The goal is to make profile visibility feel owner-controlled, calm, private, and permission-based before any real reveal behavior is implemented.

This phase is documentation-only.

No route UI changes are included in Phase 13A.

---

## Product Context

ankion is an anonymous voice-first social app.

Users have real profiles, but first interaction starts anonymously.

Chat is the central interaction hub.

Real profile visibility stays hidden by default.

Profile visibility can be requested later.

The owner decides whether visibility opens.

The app must avoid harsh decision language.

The app must not feel like a dating app.

---

## Current App State

The app is still static and behavior-free.

Current completed static flow foundation:

- Discover leads naturally into Chat.
- Feed leads naturally into Chat.
- Chat explains anonymous voice, lifecycle, and permission-based reveal.
- Profile has a static privacy/reveal control surface.
- Reveal Requests has a static request card surface.
- No backend/API exists.
- No Supabase/Auth/RLS/Storage exists.
- No real reveal logic exists.
- No approve/reject behavior exists.
- No mock requester/profile data exists.

---

## Phase 13A Scope

Allowed:

- Documentation
- Product flow planning
- Profile screen direction planning
- Reveal Requests screen direction planning
- Copy rules
- Static UI slicing

Not allowed:

- Route file edits
- Component edits
- Package edits
- Lockfile edits
- Backend/API
- Supabase
- Auth
- RLS
- Storage
- Migrations
- Mock users
- Mock profiles
- Mock reveal requests
- Voice recorder
- Real audio
- Reveal logic
- Approve/reject behavior
- New navigation behavior
- router.push
- Tabs

---

## Core Rule

Profile and Reveal Requests must support the same product truth:

Real profile visibility is never automatic.

The owner controls whether identity becomes visible.

Reveal requests should feel calm and permission-based, not pressured.

---

## Profile Screen Direction

### Purpose

Profile should become the owner’s private visibility control center.

It should not feel like a public dating profile.

It should not expose profile details to others automatically.

It should explain that real profile information exists, but visibility is controlled.

### Future Static UI Direction

Profile can later include:

- Private profile status explanation
- Visibility control education
- Anonymous activity separation
- Future profile edit area placeholder
- Future reveal control placeholder
- Calm privacy reassurance

### Must Avoid

Do not add:

- Fake name
- Fake avatar
- Fake bio
- Fake follower count
- Fake coin/package logic
- Profile edit behavior
- Public profile preview
- Backend profile data
- Auth logic
- Reveal approval logic

### Recommended Future Slice

Phase 13B — Profile Static Visibility Control Refinement

Allowed file:

- apps/mobile/app/profile.tsx

Goal:

Make Profile feel like the private owner-controlled visibility center while staying static.

---

## Reveal Requests Screen Direction

### Purpose

Reveal Requests should become the calm place where future profile visibility requests are reviewed.

It should not feel like a rejection/approval pressure screen.

It should avoid harsh decision language.

It should not show fake requesters or fake profiles.

### Future Static UI Direction

Reveal Requests can later include:

- Static request review education
- Permission-based decision explanation
- Calm language around pending requests
- Future decision tools placeholder
- Owner-control reminder

### Must Avoid

Do not add:

- Approve button
- Reject button
- Request status logic
- Fake requester
- Fake profile
- Fake avatar
- Fake reveal request record
- Notification logic
- Backend/API
- Supabase/Auth/RLS/Storage
- Harsh text such as “Rejected”

### Recommended Future Slice

Phase 13C — Reveal Requests Static Review Surface Refinement

Allowed file:

- apps/mobile/app/reveal-requests.tsx

Goal:

Make Reveal Requests feel like a calm permission review surface while staying static.

---

## Copy Rules

Use calm language:

- Profile stays private
- Waiting for permission
- Owner keeps control
- Visibility opens only with approval
- You can decide later
- Request review later
- Permission flow later

Avoid harsh language:

- Rejected
- Denied
- Blocked
- Failed
- Exposed
- Match accepted
- Match rejected

Avoid dating-app language:

- Match
- Like
- Crush
- Swipe
- Hot
- Nearby singles

---

## Relationship With Chat

Chat explains the interaction.

Profile explains owner-controlled visibility.

Reveal Requests explains future request review.

The three screens must support one coherent flow:

1. Anonymous voice interaction starts in Chat.
2. The real profile stays hidden.
3. Profile visibility may be requested.
4. The owner controls visibility.
5. Reveal Requests will later hold review moments.
6. Profile remains the owner’s private control center.

---

## Recommended Implementation Order After Phase 13A

### Phase 13B — Profile Static Visibility Control Refinement

Allowed:

- Edit only `apps/mobile/app/profile.tsx`
- Static UI only
- Existing UI foundation only

Forbidden:

- Profile edit logic
- Fake profile data
- Follower/coin/package logic
- Backend/API
- Auth
- Supabase/RLS/Storage
- Navigation behavior changes

---

### Phase 13C — Reveal Requests Static Review Surface Refinement

Allowed:

- Edit only `apps/mobile/app/reveal-requests.tsx`
- Static UI only
- Existing UI foundation only

Forbidden:

- Approve/reject behavior
- Fake requester/profile data
- Request status logic
- Backend/API
- Supabase/RLS/Storage
- Navigation behavior changes

---

### Phase 13D — Local Validation

Run:

- mobile typecheck
- web typecheck

APK build is not required unless a visual device check is explicitly needed.

---

### Phase 13E — Profile / Reveal Flow Audit + Docs Alignment

Use Codex only after Phase 13B and Phase 13C are manually completed.

Codex should:

- Audit Profile
- Audit Reveal Requests
- Confirm static/behavior-free state
- Confirm no forbidden areas were touched
- Update docs/status files only

---

## Acceptance Criteria for Phase 13A

Phase 13A is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Profile future direction is clear.
- Reveal Requests future direction is clear.
- Phase 13B and Phase 13C are scoped as small manual UI phases.
- No behavior is introduced.

---

## Current Decision

Next phase should be:

Phase 13B — Profile Static Visibility Control Refinement

This should remain static, calm, owner-controlled, and behavior-free.

---

## Phase 13B Through Phase 13D Result

Phase 13B completed Profile static visibility control refinement:

- `apps/mobile/app/profile.tsx` is a static owner-controlled visibility center.
- Profile explains that the real profile exists for the owner first and stays hidden by default.
- Profile separates anonymous activity from real identity.
- Future profile edit and visibility controls are passive `Later` states.
- No fake name/avatar/bio, profile edit logic, follower/coin/package logic, backend/API/Auth/Supabase/RLS/Storage logic, or reveal approval logic was added.

Phase 13C completed Reveal Requests static review surface refinement:

- `apps/mobile/app/reveal-requests.tsx` is a static calm permission review center.
- Reveal Requests explains that visibility requests are calm, private, and owner-controlled.
- Future request/review tools are passive `Later` states.
- Harsh decision language is avoided.
- No approve/reject buttons, fake requester/profile/avatar, request status logic, backend/API/Auth/Supabase/RLS/Storage logic, or reveal logic was added.

Phase 13D completed audit, documentation/status alignment, and latest APK visual check recording.

Latest APK visual check:

- EAS preview APK was built manually with `EAS_NO_VCS=1`.
- EAS CLI was run through `corepack pnpm dlx --allow-build=dtrace-provider eas-cli build -p android --profile preview`.
- APK installed and opened successfully on a real Android device.
- No white screen or crash was reported.
- Screens visually checked: Index / mobile route shell, Discover, Feed, Chat, Profile, Reveal Requests.
- Index route shell remains temporary and should later become a real Home/navigation entry experience.

Next recommended phase:

- Phase 14A documentation-only Home / Navigation polish planning.

No backend, recorder, real audio, reveal behavior, upload behavior, mock data, package change, or navigation expansion should start next.
