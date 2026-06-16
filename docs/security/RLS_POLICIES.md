# RLS_POLICIES.md

## Purpose
This document defines the planned Row Level Security model for ankion.

RLS is a critical security artifact and must not be skipped.

The goal is to prevent identity leaks, unsafe profile visibility, storage path exposure, and unauthorized access across ankion's voice-first anonymous social discovery flows.

## Status
Draft RLS planning direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/database/DATABASE.md
- docs/database/TABLES.md
- docs/database/RELATIONSHIPS.md
- docs/security/STORAGE.md
- docs/security/PRIVACY_MODEL.md

## Core RLS Principle
Frontend must not depend on raw sensitive table access.

Correct model:
- RLS protects base tables.
- Safe RPC/views return safe DTOs.
- Frontend receives only fields allowed for the current user and relationship.

Wrong model:
- Frontend reads raw tables.
- UI hides sensitive fields manually.
- Reveal visibility is decided client-side.

## Product Security Rule
Real profile visibility requires:

approved request + active profile visibility grant + no active block = profile visible

Important:
- Request status alone is not enough.
- UI status alone is not enough.
- Grant is required.
- Block overrides grant.
- Coin/follow/instant content cannot reveal real profile.

## Sensitive Fields
These fields must never be casually exposed to frontend:

- auth_user_id
- user_id where it reveals real identity
- sender_user_id
- owner_user_id
- profile_owner_user_id
- viewer_user_id
- requester_user_id
- recipient_user_id
- blocker_user_id
- blocked_user_id
- reporter_user_id
- reported_user_id
- raw_storage_path
- storage_path
- file audit internals
- moderation internals
- hidden profile fields before reveal

## Safe DTO Strategy
Sensitive flows should use safe RPC/views/DTOs.

Expected safe DTOs:
- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

Safe DTOs may include:
- visible: true / false
- safe labels
- safe anonymous avatar
- blurred media token
- safe signed media URL if allowed
- allowed actions
- calm status copy

Safe DTOs must not include:
- raw internal ids where unsafe
- raw storage paths
- hidden real profile data
- grant internals
- report internals
- private moderation fields

---

# RLS Planning Matrix

## 1. profiles

### Risk Level
Critical.

### Why Critical
This table stores real profile identity.

### SELECT
Owner can view own full profile.

Other users must not directly select full profile unless profile visibility is allowed through safe profile view logic.

Before reveal, other users must not receive:
- clear avatar
- real display name
- exact age
- exact city
- full bio
- owner user id

### INSERT
Authenticated user can create own profile.

### UPDATE
Only profile owner can update own profile.

### DELETE
Owner deletion should be controlled and may be deferred or handled through account lifecycle rules.

### Safe Access Needed
Yes.

Use safe profile view/RPC to decide whether another user can see real profile.

### Block Effect
If block exists between viewer and owner, profile must not be visible even if grant exists.

### RLS Notes
Do not allow public profile browsing from raw profiles table.

---

## 2. profile_interests

### Risk Level
Medium.

### SELECT
Owner can view own interests.

Other users can see interests only through safe profile/discover DTO if non-identifying and allowed.

### INSERT
Only profile owner can add interests to own profile.

### UPDATE
Only profile owner can update own interests.

### DELETE
Only profile owner can remove own interests.

### Safe Access Needed
Yes for Discover and pre-reveal states.

### Block Effect
If blocked, interest visibility should be denied through safe DTO.

---

## 3. voice_bios

### Risk Level
High.

### SELECT
Owner can view own voice bio metadata.

Other users may access safe voice bio preview only if allowed by product rules.

### INSERT
Only owner can create own voice bio metadata.

### UPDATE
Only owner can update own voice bio metadata.

### DELETE
Only owner can delete own voice bio metadata.

### Safe Access Needed
Yes.

Raw storage path must never be returned.

### Block Effect
If block exists, signed URL and playback access should be denied where applicable.

---

## 4. chat_threads

### Risk Level
High.

### SELECT
Only chat participants can access safe chat thread data.

Frontend should receive safe chat summary or safe chat room DTO, not raw participant-sensitive rows.

### INSERT
Chat creation must be controlled through safe action/RPC.

Allowed origins:
- Discover profile tap
- Instant Content Detail
- Existing revealed profile chat bubble

### UPDATE
System/server-controlled updates only where needed, such as last activity.

### DELETE
Direct user deletion should be limited. Hiding/archive behavior may be safer than deleting shared chat records.

### Safe Access Needed
Yes.

### Block Effect
Block must restrict chat actions and may restrict visibility of active chat actions.

---

## 5. chat_participants

### Risk Level
Critical.

### SELECT
Raw participant rows should not be broadly exposed.

Users may know they are participant in their own chat, but hidden identity relationships must not leak.

### INSERT
Controlled through safe chat creation flow.

### UPDATE
Only safe participant state updates, such as mute/leave, if approved.

### DELETE
Controlled. Avoid exposing participant identity.

### Safe Access Needed
Yes.

### Block Effect
Block affects whether chat can continue.

### RLS Notes
This table is identity-sensitive because it links users to anonymous chats.

---

## 6. voice_messages

### Risk Level
Critical.

### SELECT
Only chat participants can access safe voice message data.

Frontend must not receive:
- sender_user_id
- raw storage path
- hidden identity fields

Frontend may receive:
- message id
- self/other direction
- duration
- listened state
- safe signed playback URL if allowed

### INSERT
Only authenticated participant can create a voice message in allowed chat.

Must enforce:
- not blocked
- max duration 21 seconds
- daily limit 7
- same-recipient daily limit 3

This likely requires safe RPC/action, not raw insert.

### UPDATE
Limited to safe states such as deleted_at or safety status, preferably controlled.

### DELETE
User-side delete/hide may be allowed later. Hard delete should be cautious.

### Safe Access Needed
Yes.

### Block Effect
If block exists:
- no new voice messages
- signed playback may be denied where applicable

---

## 7. voice_listens

### Risk Level
Medium.

### SELECT
Relevant participants can see safe listened status.

Do not expose listener_user_id if unsafe.

### INSERT
Participant can mark a voice message as listened if they are authorized to access that chat.

### UPDATE
Usually not needed except controlled correction.

### DELETE
Usually not needed.

### Safe Access Needed
Yes for chat UI.

### Block Effect
Blocked access should prevent new listen tracking where applicable.

---

## 8. voice_daily_limits

### Risk Level
Medium.

### SELECT
User may see own remaining daily count via safe DTO.

### INSERT
Server-controlled.

### UPDATE
Server-controlled.

### DELETE
Server-controlled or maintenance-only.

### Safe Access Needed
Yes.

### RLS Notes
Frontend must not manipulate counters.

---

## 9. voice_recipient_daily_limits

### Risk Level
High.

### SELECT
User may receive remaining same-recipient count for current chat context only.

Do not expose raw recipient_user_id if unsafe.

### INSERT
Server-controlled.

### UPDATE
Server-controlled.

### DELETE
Server-controlled or maintenance-only.

### Safe Access Needed
Yes.

### RLS Notes
This table can leak interaction relationships if exposed raw.

---

## 10. reveal_requests

### Risk Level
Critical.

### SELECT
Only involved chat participants can see safe reveal request state.

Frontend may receive:
- pending / decide later / stayed hidden / revealed state
- allowed actions
- calm status copy

Frontend must not receive:
- requester_user_id
- profile_owner_user_id if unsafe
- internal decision details

### INSERT
Requester can create request only if:
- participant in chat
- not blocked
- no duplicate active request
- target profile is hidden or reveal flow still relevant

Should be controlled through safe action/RPC.

### UPDATE
Only profile owner can decide:
- reveal my profile
- decide later
- stay hidden

### DELETE
Usually not user-deleted. Cancel request may update state rather than delete.

### Safe Access Needed
Yes.

### Block Effect
Block prevents new requests and invalidates visibility.

### RLS Notes
Request approval alone must not reveal profile.

---

## 11. profile_visibility_grants

### Risk Level
Critical.

### SELECT
Raw grants should not be exposed to frontend.

Frontend should receive:
- visible: true/false
- safe profile DTO if visible

### INSERT
Only server-controlled when owner explicitly reveals profile.

### UPDATE
Server-controlled or owner-controlled revocation if supported.

### DELETE
Server-controlled or revocation flow.

### Safe Access Needed
Yes.

### Block Effect
Block overrides active grant.

### RLS Notes
Grant must be scoped to owner/viewer relationship and must not reveal globally.

---

## 12. blocks

### Risk Level
Critical.

### SELECT
User can know current relationship block state where needed.

Raw block internals should not be broadly exposed.

### INSERT
Authenticated user can block another user through safe action.

### UPDATE
Block updates should be limited.

### DELETE
Unblock may be allowed to blocker.

### Safe Access Needed
Yes.

### Block Effect
Block itself overrides:
- chat actions
- voice send
- reveal request
- profile view
- grant usage
- signed URL access where applicable
- instant interactions where applicable

### RLS Notes
Block checks must be reused across sensitive flows.

---

## 13. reports

### Risk Level
Critical.

### SELECT
Users should not browse reports.

Reporter may receive a confirmation only.

Moderation/admin access is future-controlled and not MVP public access.

### INSERT
Authenticated user can submit a report for allowed targets.

### UPDATE
Only moderation/admin future process.

### DELETE
Only moderation/admin future process.

### Safe Access Needed
Yes.

### RLS Notes
Never expose:
- reported_user_id
- private report details
- moderation internals

---

## 14. instant_profiles

### Risk Level
Critical.

### SELECT
Frontend may see safe anonymous instant profile data.

Frontend must not see:
- owner_user_id
- real profile details

### INSERT
Authenticated user may create/manage own instant profile.

### UPDATE
Owner can update own instant profile.

### DELETE
Owner can delete or deactivate own instant profile.

### Safe Access Needed
Yes.

### Block Effect
Block may hide instant profile from blocked relationship.

### RLS Notes
Instant profile is not real profile.

---

## 15. instant_posts

### Risk Level
High.

### SELECT
Feed can show safe instant posts.

Frontend may receive:
- instant post id
- media type
- safe media URL if allowed
- anonymous owner preview
- duration
- caption if safe

Frontend must not receive:
- owner_user_id
- raw storage path
- real profile fields before reveal

### INSERT
Owner can create own instant posts.

### UPDATE
Owner can update own instant posts.

### DELETE
Owner can delete own instant posts.

### Safe Access Needed
Yes.

### Block Effect
Block may hide content and prevent signed URL access where applicable.

---

## 16. instant_follows

### Risk Level
High.

### SELECT
User can see own follow state.

Public follower data should be safe and not reveal real owner identity.

### INSERT
Authenticated user can follow an instant profile if not blocked.

### DELETE
Follower can unfollow.

### UPDATE
Usually not needed.

### Safe Access Needed
Yes.

### Block Effect
Block overrides follow.

### RLS Notes
Follow does not create profile visibility grant.

---

## 17. notifications

### Risk Level
Medium.

### SELECT
Only recipient can see own notifications.

Notification content must be identity-safe.

### INSERT
Server-controlled.

### UPDATE
Recipient can mark read.

### DELETE
Recipient can clear/hide own notification if supported.

### Safe Access Needed
Yes.

### RLS Notes
Notifications must not leak real identity before reveal.

---

## 18. file_audit_logs

### Risk Level
Critical.

### SELECT
Highly restricted.

Frontend must not select raw rows.

### INSERT
Server/storage-controlled.

### UPDATE
Server-controlled.

### DELETE
Server/admin-controlled.

### Safe Access Needed
Yes.

Frontend should receive signed URL only through safe access flow.

### Block Effect
Block must affect signed URL access where applicable.

### RLS Notes
Never expose:
- storage_path
- owner_user_id
- signed URL internals
- internal audit records

---

# Safe RPC / View Planning

## Required Safe Access Layers

### safe_discover_profile
Purpose:
Return Discover profile cards without exposing real profile identity.

Must hide:
- real name
- clear avatar
- exact age
- exact city
- owner_user_id

### safe_feed_tile
Purpose:
Return Feed grid tile safely.

Must hide:
- owner_user_id
- raw storage path
- real profile fields

### safe_instant_content_detail
Purpose:
Return instant content detail safely.

Must hide:
- owner_user_id
- raw storage path
- real identity before reveal

### safe_chat_summary
Purpose:
Return Chat list item safely.

Must hide:
- hidden participant identity
- raw participant ids where unsafe

### safe_chat_room
Purpose:
Return Chat Room data safely.

Must hide:
- sender_user_id
- owner_user_id
- raw storage path
- hidden profile details

### safe_voice_message
Purpose:
Return playable voice message metadata safely.

Must return:
- self/other direction
- duration
- signed URL if allowed
- listened state

Must hide:
- sender_user_id
- raw storage path

### safe_reveal_request_state
Purpose:
Return reveal request state safely.

Must hide:
- requester_user_id if unsafe
- owner_user_id
- grant internals

### safe_profile_view
Purpose:
Return real profile only if active grant and no block.

Must enforce:
approved request + active grant + no block = visible

### safe_notification
Purpose:
Return identity-safe notifications.

Must avoid:
- real name before reveal
- unsafe target ids

---

# RLS Product Flow Checks

## Discover to Chat
RLS must ensure:
- Discover card is safe.
- Raw profile is not exposed.
- Chat can be opened safely.
- Participant identity does not leak.

## Feed to Detail to Chat
RLS must ensure:
- Feed tile is safe.
- Instant detail is safe.
- owner_user_id is hidden.
- Chat opens anonymously.

## Voice Message Send
RLS/safe action must ensure:
- user is chat participant
- no block exists
- duration is valid
- daily limit is not exceeded
- same-recipient limit is not exceeded
- storage reference is protected

## Reveal Request
RLS/safe action must ensure:
- requester is chat participant
- owner is valid target
- no block exists
- duplicate request is handled
- profile remains hidden until grant

## Profile View
RLS/safe action must ensure:
- active grant exists
- no block exists
- safe profile DTO is returned
- raw profile row is not exposed

## Block
RLS must ensure:
- blocker can create block
- block state affects all sensitive flows
- blocked relationship cannot continue unsafe actions

## Storage Access
RLS/storage policy must ensure:
- raw path is hidden
- signed URL is issued only if allowed
- block prevents access where applicable

---

# RLS Leak Test Requirements

Test Lab must verify:

1. Cannot read sender_user_id from voice message.
2. Cannot read owner_user_id from instant profile.
3. Cannot read raw_storage_path from media.
4. Cannot view real profile without grant.
5. Cannot view real profile with approved request but no grant.
6. Can view real profile with active grant and no block.
7. Cannot view real profile after block.
8. Coin cannot reveal real profile.
9. Instant follow cannot reveal real profile.
10. Feed tile does not leak real owner identity.
11. Notifications do not leak real identity before reveal.
12. Reports do not expose reported_user_id.
13. File audit logs are not readable from frontend.
14. Test Lab is disabled in production.

---

# RLS Implementation Notes for Later

Do not implement SQL policies yet.

When implementation starts:
- enable RLS on every sensitive table
- write policies table by table
- prefer safe RPC/views for sensitive read flows
- test every policy through Test Lab
- never rely on frontend hiding fields
- document every policy in FILE_MAP and security docs

---

# Out of Scope for This Document

This document does not include:
- SQL policy code
- migration code
- Supabase config
- function code
- storage bucket creation
- package setup
- app implementation

## Success Criteria

RLS planning is successful if:

1. Real profile is hidden by default.
2. Discover cards are safe.
3. Feed tiles are safe.
4. Chat data is participant-safe.
5. Voice messages do not leak sender identity.
6. Reveal request does not reveal profile.
7. Active grant is required for profile view.
8. Block overrides grant.
9. Instant profile does not reveal real profile.
10. Storage paths are hidden.
11. Reports are private.
12. Frontend consumes safe DTOs.
13. Test Lab can verify all leak scenarios.

## Notes
RLS is one of ankion's most important security layers.

If a policy decision weakens anonymity, profile permission, block override, or storage safety, it must be redesigned before implementation.
