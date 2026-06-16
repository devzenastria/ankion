# TABLES.md

## Purpose
This document defines the planned database tables for ankion.

The goal is to map approved product flows into clear data ownership areas before writing migrations.

This document must support:
- real account and hidden profile
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice-first Chat
- 21-second voice messages
- daily voice limits
- permission-based profile reveal
- profile visibility grants
- block override
- instant photo/video/audio Feed
- instant profile layer separate from real profile
- private storage and signed URL safety
- reporting and auditability
- Test Lab verification

## Status
Draft table planning direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/database/DATABASE.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md

## Core Table Design Principle

Tables must separate:

1. Real profile identity
2. Anonymous discovery identity
3. Chat/thread interaction
4. Voice message media
5. Profile reveal request state
6. Actual profile visibility permission
7. Instant media identity
8. Safety and audit data

Important rule:

instant content visible does not mean real profile visible.

Reveal rule:

approved request + active profile visibility grant + no active block = profile visible

Frontend must receive safe DTOs, not raw sensitive rows.

---

# Planned MVP Tables

## 1. profiles

### Purpose
Stores the real user profile.

The profile is real, but hidden before permission.

### Expected fields conceptually
- id
- user_id
- display_name
- username
- avatar_file_id or avatar_media_ref
- bio
- date_of_birth
- gender
- optional_city
- profile_completed
- created_at
- updated_at

### Sensitive fields
- user_id
- date_of_birth
- optional_city before reveal
- clear avatar before reveal
- full bio before reveal

### Frontend visibility
Before reveal:
- must not expose real profile fields directly

After valid grant and no block:
- may expose safe profile fields

### RLS / security notes
- Profile owner can manage own profile.
- Other users can only see safe profile data through approved visibility rules.
- Raw profile table should not be used directly for public profile browsing.

---

## 2. profile_interests

### Purpose
Stores user interest chips.

### Expected fields conceptually
- id
- profile_id
- interest_key
- created_at

### Sensitive fields
- profile_id may link to real profile

### Frontend visibility
Before reveal:
- only safe/non-identifying interest chips may be shown if approved

After reveal:
- safe interests may be shown

### RLS / security notes
- Must not reveal profile ownership before permission.

---

## 3. voice_bios

### Purpose
Stores voice bio metadata for profiles.

### Expected fields conceptually
- id
- profile_id
- file_audit_id or media_ref
- duration_seconds
- created_at
- updated_at

### Sensitive fields
- profile_id
- raw storage path through linked media/audit data

### Frontend visibility
Before reveal:
- may expose safe preview only if designed as anonymous voice cue
- must not expose raw path

After reveal:
- may expose signed playback URL if allowed

### RLS / security notes
- Signed URL generation must be controlled.
- Raw storage path must not return to frontend.

---

## 4. chat_threads

### Purpose
Represents a chat room/thread.

Chat is the central interaction hub.

### Expected fields conceptually
- id
- origin_type
- origin_ref_id
- created_at
- updated_at
- last_activity_at

Origin examples:
- discover_profile
- instant_post
- revealed_profile

### Sensitive fields
- origin_ref_id may reveal identity if unsafe
- participant relationships must be protected

### Frontend visibility
Frontend may receive:
- safe chat id
- safe chat summary
- hidden/revealed state
- last safe activity

Frontend must not receive:
- hidden owner_user_id
- raw identity relationships

### RLS / security notes
- Only participants can access a chat.
- Block must affect chat actions.
- Chat creation must not expose real profile before reveal.

---

## 5. chat_participants

### Purpose
Defines which users participate in a chat/thread.

### Expected fields conceptually
- id
- chat_thread_id
- user_id
- role
- joined_at
- left_at
- muted_at

### Sensitive fields
- user_id
- participant mapping

### Frontend visibility
Frontend should not receive raw participant user ids unless safe.

### RLS / security notes
- Participant checks are required for chat access.
- Must not leak hidden participant identity in anonymous state.

---

## 6. voice_messages

### Purpose
Stores voice message metadata sent inside Chat.

### Expected fields conceptually
- id
- chat_thread_id
- sender_user_id
- file_audit_id or media_ref
- duration_seconds
- created_at
- deleted_at
- safety_status

### Sensitive fields
- sender_user_id
- file media reference
- raw storage path through linked audit data

### Frontend visibility
Frontend may receive:
- message id
- safe sender side: self / other
- duration
- signed playback URL if allowed
- listened state
- created time

Frontend must not receive:
- sender_user_id
- raw storage path
- hidden identity fields

### RLS / security notes
- Sender must be participant.
- Block must prevent sending.
- Duration limit must be enforced server-side.
- Signed URL must be controlled.

---

## 7. voice_listens

### Purpose
Tracks voice message listened state.

### Expected fields conceptually
- id
- voice_message_id
- listener_user_id
- listened_at

### Sensitive fields
- listener_user_id

### Frontend visibility
Frontend may receive:
- listened / not listened status

Frontend must not receive:
- raw listener identity where unsafe

### RLS / security notes
- Only relevant participants can create/read listen state.

---

## 8. voice_daily_limits

### Purpose
Tracks server-side voice send limits.

### Expected fields conceptually
- id
- user_id
- limit_date
- total_sent_count
- created_at
- updated_at

### Sensitive fields
- user_id

### Rules
- Daily send limit: 7 voice messages per user
- Enforced server-side

### Frontend visibility
Frontend may receive:
- remaining daily count

Frontend must not directly control:
- limit counters

### RLS / security notes
- Updates should be server-controlled through safe action/RPC.

---

## 9. voice_recipient_daily_limits

### Purpose
Tracks same-recipient daily voice send limit.

### Expected fields conceptually
- id
- sender_user_id
- recipient_user_id
- limit_date
- sent_count
- created_at
- updated_at

### Sensitive fields
- sender_user_id
- recipient_user_id

### Rules
- Same-recipient daily limit: 3

### Frontend visibility
Frontend may receive:
- remaining count for current chat context

Frontend must not receive:
- raw recipient identity if unsafe

### RLS / security notes
- Must be enforced server-side.
- Should not leak identity relationships.

---

## 10. reveal_requests

### Purpose
Stores profile visibility requests.

Reveal request is not the same as profile visibility.

### Expected fields conceptually
- id
- chat_thread_id
- requester_user_id
- profile_owner_user_id
- status
- created_at
- decided_at
- decision_note_type if needed

Statuses conceptually:
- pending
- decide_later
- stayed_hidden
- revealed

### Sensitive fields
- requester_user_id
- profile_owner_user_id

### Frontend visibility
Frontend may receive:
- safe request state
- allowed actions
- calm status copy

Frontend must not receive:
- raw owner/requester ids if unsafe

### RLS / security notes
- Only chat participants can interact.
- Owner decides.
- Approval alone must not reveal profile.
- Visibility requires grant.

---

## 11. profile_visibility_grants

### Purpose
Actual permission record for real profile visibility.

### Expected fields conceptually
- id
- profile_owner_user_id
- viewer_user_id
- reveal_request_id
- status
- created_at
- revoked_at
- expires_at optional future

### Sensitive fields
- profile_owner_user_id
- viewer_user_id
- reveal_request_id

### Frontend visibility
Frontend should not receive raw grant internals.

Frontend may receive:
- visible: true / false
- safe profile DTO if visible

### RLS / security notes
- Grant is scoped to one owner/viewer relationship.
- Grant does not reveal profile globally.
- Block overrides grant.
- Profile view must check active grant and no block.

---

## 12. blocks

### Purpose
Stores block relationships.

Block overrides interaction and visibility.

### Expected fields conceptually
- id
- blocker_user_id
- blocked_user_id
- reason_type optional
- created_at

### Sensitive fields
- blocker_user_id
- blocked_user_id

### Effects
Block must prevent:
- new voice messages
- reveal requests
- profile view
- grant usage
- signed media URL access where applicable
- instant interaction where applicable

### Frontend visibility
Frontend may receive:
- blocked state for current relationship
- allowed actions disabled

Frontend must not expose unnecessary block internals.

### RLS / security notes
- Block check must be used across chat, reveal, profile, storage, instant.

---

## 13. reports

### Purpose
Stores safety reports.

### Expected fields conceptually
- id
- reporter_user_id
- reported_user_id optional internal
- target_type
- target_id
- reason
- details optional
- status
- created_at

### Sensitive fields
- reporter_user_id
- reported_user_id
- details
- moderation status internals

### Frontend visibility
Frontend may receive:
- report submitted confirmation

Frontend must not receive:
- reported_user_id
- moderation internals
- private report details

### RLS / security notes
- Report data must be highly restricted.
- Users should not browse reports.

---

## 14. instant_profiles

### Purpose
Stores anonymous media identity layer.

Instant profile is separate from real profile.

### Expected fields conceptually
- id
- owner_user_id
- anonymous_label
- avatar_media_ref optional
- created_at
- updated_at

### Sensitive fields
- owner_user_id

### Frontend visibility
Before reveal:
- may show anonymous label
- may show blurred/abstract avatar
- may show instant content

Must not show:
- real owner identity

### RLS / security notes
- owner_user_id must not leak.
- Instant profile follow does not reveal real profile.

---

## 15. instant_posts

### Purpose
Stores instant photo/video/audio post metadata.

### Expected fields conceptually
- id
- instant_profile_id
- media_type
- file_audit_id or media_ref
- caption
- duration_seconds
- created_at
- deleted_at
- safety_status

### Sensitive fields
- instant_profile_id may link internally to owner
- media storage reference

### Frontend visibility
Frontend may receive:
- post id
- media type
- safe media URL if allowed
- duration
- anonymous owner preview
- safe engagement metadata

Frontend must not receive:
- owner_user_id
- raw storage path
- real profile fields before reveal

### RLS / security notes
- Feed listing should use safe DTO/view.
- Storage access must be controlled.

---

## 16. instant_follows

### Purpose
Tracks following of instant profiles.

### Expected fields conceptually
- id
- follower_user_id
- instant_profile_id
- created_at

### Sensitive fields
- follower_user_id
- instant_profile owner relationship indirectly

### Rules
Following an instant profile:
- does not reveal real profile
- does not create visibility grant
- does not bypass block

### Frontend visibility
Frontend may receive:
- following state for current user
- safe follower count if approved

### RLS / security notes
- Must not leak owner_user_id.
- Block must override follow interaction.

---

## 17. notifications

### Purpose
Stores safe notification events.

### Expected fields conceptually
- id
- recipient_user_id
- type
- safe_title
- safe_body
- target_type
- target_id
- read_at
- created_at

### Sensitive fields
- recipient_user_id
- target_id if it can reveal unsafe entity

### Notification rule
Notifications must not leak real identity before reveal.

Allowed copy:
- Someone left you a voice message
- Your profile request has a response
- Profile is now visible
- Someone started a chat from your content
- A followed instant profile shared new content

### RLS / security notes
- Only recipient can see notification.
- Notification content must be generated safely.

---

## 18. file_audit_logs

### Purpose
Tracks uploaded media and signed URL/access audit references.

### Expected fields conceptually
- id
- bucket_name
- storage_path
- media_type
- owner_user_id internal
- related_entity_type
- related_entity_id
- created_at
- signed_url_issued_at optional
- access_context optional

### Sensitive fields
- storage_path
- owner_user_id
- related internal entity ids
- signed URL audit metadata

### Frontend visibility
Frontend must not receive:
- raw storage_path
- owner_user_id
- internal audit fields

Frontend may receive:
- signed URL only through safe access flow

### RLS / security notes
- Highly restricted.
- Used internally for storage safety.
- Must support block checks where applicable.

---

# Future / Deferred Tables

## coin_ledger

### Status
Future / not MVP.

### Rule
Coin must not reveal real profile.

### Notes
May support future monetization or follower-view features.

## follower_view_entitlements

### Status
Future / not MVP.

### Rule
Follower-view entitlement must not create real profile visibility grant.

### Notes
May support future instant profile follower visibility.

---

# Safe DTO Mapping Direction

Future backend/view/RPC layer should expose safe DTOs such as:

- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

Raw tables must not be the primary frontend contract for sensitive flows.

---

# Table Risk Matrix

## Highest Risk Tables
These require extra RLS/security attention:

- profiles
- chat_participants
- voice_messages
- reveal_requests
- profile_visibility_grants
- blocks
- reports
- instant_profiles
- instant_posts
- file_audit_logs

## Main Risks
- real profile leak
- sender_user_id leak
- owner_user_id leak
- raw_storage_path leak
- reveal approval treated as profile visibility
- block not overriding grant
- instant profile treated as real profile
- coin/follow revealing profile

---

# Test Lab Table Coverage

Test Lab must verify table behavior indirectly through safe flows:

1. Hidden profile before reveal
2. Discover safe profile card
3. Feed safe tile
4. Chat safe room DTO
5. Voice send limit
6. Same-recipient send limit
7. Reveal request does not reveal profile
8. Active grant reveals profile
9. Block hides profile after grant
10. Instant follow does not reveal profile
11. Coin/future entitlement does not reveal profile
12. Raw storage path not returned
13. owner_user_id not returned
14. sender_user_id not returned

---

# Not a Migration

This document does not define final SQL.

Before creating migrations:
- RELATIONSHIPS.md must be approved.
- RLS_POLICIES.md must be approved.
- STORAGE.md must be approved.
- TEST_LAB.md must be approved.
- CODEX_TASKS.md must define small implementation tasks.

## Notes
Table design must serve the approved product.

If a table or field weakens anonymity, reveal permission, block override, storage privacy, or safe frontend DTOs, it must be redesigned before implementation.
