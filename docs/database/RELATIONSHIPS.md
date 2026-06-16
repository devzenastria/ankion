# RELATIONSHIPS.md

## Purpose
This document defines the planned database relationships for ankion.

The goal is to map table relationships before writing migrations or RLS policies.

This document must support:
- real account and hidden profile
- Discover-to-Chat
- Feed-to-Detail-to-Chat
- voice-first Chat
- permission-based profile reveal
- visibility grant checks
- block override
- instant profile separate from real profile
- storage privacy
- safe frontend DTOs
- Test Lab verification

## Status
Draft relationship planning direction.

Implementation has not started.

## Source Documents
This document follows:
- docs/database/DATABASE.md
- docs/database/TABLES.md
- docs/product/MVP_CORE.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/product/INSTANT_FLOW.md
- docs/security/RLS_POLICIES.md
- docs/security/STORAGE.md

## Core Relationship Principle

Relationships must support anonymity by default.

A database relationship may exist internally, but that does not mean the frontend can see it.

Important:
- Internal ownership links must be protected.
- Frontend must receive safe DTOs.
- Reveal request is not equal to profile visibility.
- Visibility grant controls profile visibility.
- Block overrides grant.
- Instant profile is not real profile.

Core reveal rule:

approved request + active profile visibility grant + no active block = profile visible

Core instant rule:

instant content visible does not mean real profile visible

---

# Main Relationship Groups

## 1. Auth User to Profile

Conceptual relationship:

auth.users
-> profiles.user_id

Meaning:
- One authenticated user owns one real profile.
- Real profile is hidden before permission.

Security note:
- user_id is sensitive.
- user_id must not leak through public profile cards.
- Profile data should be returned through safe profile DTOs.

Frontend must not directly infer:
- auth user id
- real profile owner
- hidden profile details before grant

---

## 2. Profile to Profile Interests

Conceptual relationship:

profiles.id
-> profile_interests.profile_id

Meaning:
- A real profile can have multiple interest chips.

Security note:
- Interests may be shown before reveal only if non-identifying and approved.
- profile_id must not expose real identity.

RLS note:
- Owner can manage own interests.
- Other users should only see safe interest data through safe views/DTOs.

---

## 3. Profile to Voice Bio

Conceptual relationship:

profiles.id
-> voice_bios.profile_id

Meaning:
- A real profile can have a voice bio.

Security note:
- Voice bio can be part of voice-first identity.
- Raw storage path must not be exposed.
- Before reveal, only safe anonymous preview may be shown if allowed.

Storage note:
- voice_bios should reference safe media/file audit metadata, not expose direct path.

---

## 4. Chat Thread to Participants

Conceptual relationship:

chat_threads.id
-> chat_participants.chat_thread_id

auth.users / profiles
-> chat_participants.user_id

Meaning:
- Chat thread has participants.
- Chat can originate from Discover or Instant Content Detail.

Security note:
- participant user ids are sensitive in anonymous state.
- Frontend should receive safe participant labels, not raw ids.

RLS note:
- Only participants can access chat.
- Block must affect chat actions.

---

## 5. Chat Thread to Voice Messages

Conceptual relationship:

chat_threads.id
-> voice_messages.chat_thread_id

Meaning:
- Voice messages belong to a chat thread.

Security note:
- sender_user_id must not leak.
- Frontend may receive self/other direction instead of raw sender id.

Storage note:
- Voice message media must be private.
- signed playback URL must be generated only when allowed.

---

## 6. Voice Messages to Voice Listens

Conceptual relationship:

voice_messages.id
-> voice_listens.voice_message_id

Meaning:
- Voice listen state tracks whether a participant listened.

Security note:
- listener_user_id is sensitive.
- Frontend may receive listened state, not raw listener identity.

RLS note:
- Only relevant chat participants can update/read listen state.

---

## 7. User to Daily Voice Limits

Conceptual relationship:

auth.users
-> voice_daily_limits.user_id

Meaning:
- Tracks daily total voice send count per user.

Rule:
- Daily limit: 7 voice messages per user.

Security note:
- User can see remaining count.
- User must not manually control counters.

Backend note:
- Limit enforcement must be server-side.

---

## 8. Sender/Recipient to Same-Recipient Voice Limits

Conceptual relationship:

sender_user_id
recipient_user_id
-> voice_recipient_daily_limits

Meaning:
- Tracks same-recipient daily voice send count.

Rule:
- Same-recipient daily limit: 3.

Security note:
- sender_user_id and recipient_user_id are sensitive.
- Frontend should receive remaining count for current chat context only.

Backend note:
- Relationship must be evaluated without leaking identity in anonymous UI.

---

## 9. Chat Thread to Reveal Requests

Conceptual relationship:

chat_threads.id
-> reveal_requests.chat_thread_id

Meaning:
- Reveal requests happen inside Chat.

Security note:
- request state can be shown safely.
- requester_user_id and profile_owner_user_id are sensitive.

Product note:
- Reveal request state is not profile visibility.
- Request approval alone must not show profile.

---

## 10. Reveal Request to Profile Visibility Grant

Conceptual relationship:

reveal_requests.id
-> profile_visibility_grants.reveal_request_id

Meaning:
- A visibility grant may be created after owner reveals profile.

Security note:
- Grant internals should not be exposed to frontend.
- Frontend should receive visible true/false and safe profile DTO.

Product note:
- Grant is the actual visibility permission.
- Grant must be scoped to viewer/owner relationship.
- Grant must not reveal profile globally.

---

## 11. Profile Owner / Viewer to Visibility Grant

Conceptual relationship:

profile_owner_user_id
viewer_user_id
-> profile_visibility_grants

Meaning:
- Grant allows a specific viewer to see a specific owner's real profile.

Security note:
- owner/viewer ids are sensitive.
- Grant must be checked server-side before profile data is returned.

Block note:
- Block overrides grant.
- If block exists, profile must not be visible even if grant exists.

---

## 12. User to Blocks

Conceptual relationship:

blocker_user_id
blocked_user_id
-> blocks

Meaning:
- A user can block another user.

Block must affect:
- chat actions
- voice send
- reveal request creation
- profile visibility
- grant usage
- signed media URL access where applicable
- instant interactions where applicable

Security note:
- Raw block internals should not be broadly visible.
- Frontend may receive current relationship blocked state.

---

## 13. User / Target to Reports

Conceptual relationship:

reporter_user_id
reported_user_id optional internal
target_type + target_id
-> reports

Meaning:
- Reports can target voice messages, chats, profiles, instant posts, or instant profiles.

Security note:
- Reports are highly sensitive.
- reporter_user_id and reported_user_id must not be exposed to unauthorized users.
- Users should only receive safe report confirmation.

---

## 14. User to Instant Profile

Conceptual relationship:

auth.users
-> instant_profiles.owner_user_id

Meaning:
- A real user owns an instant anonymous media profile.

Critical rule:
- Instant profile is not real profile.
- owner_user_id must not leak.
- Instant profile follow does not reveal real profile.

Frontend may see:
- anonymous label
- abstract/blurred avatar
- safe instant content

Frontend must not see:
- owner_user_id
- real profile details

---

## 15. Instant Profile to Instant Posts

Conceptual relationship:

instant_profiles.id
-> instant_posts.instant_profile_id

Meaning:
- Instant profile owns instant photo/video/audio posts.

Security note:
- instant_profile_id may be safe if it does not reveal owner identity.
- owner_user_id must stay hidden.

Storage note:
- instant_posts reference private media metadata.
- raw storage path must not return to frontend.

---

## 16. Instant Profile to Instant Follows

Conceptual relationship:

instant_profiles.id
-> instant_follows.instant_profile_id

auth.users
-> instant_follows.follower_user_id

Meaning:
- Users can follow instant profiles.

Critical rules:
- Follow does not reveal real profile.
- Follow does not create visibility grant.
- Follow does not bypass block.
- Follow does not expose owner_user_id.

---

## 17. Instant Post to Chat Thread

Conceptual relationship:

instant_posts.id
-> chat_threads.origin_ref_id when origin_type = instant_post

Meaning:
- Chat can be created from Instant Content Detail.

Security note:
- Chat must open in anonymous context.
- The instant post owner identity remains hidden.
- Real profile visibility still requires reveal grant.

Backend note:
- create/find chat from instant post must avoid duplicate threads where appropriate.
- It must check block before allowing chat.

---

## 18. Profile / Discover Card to Chat Thread

Conceptual relationship:

profiles.id or safe discover profile ref
-> chat_threads.origin_ref_id when origin_type = discover_profile

Meaning:
- Chat can be created from Discover profile tap.

Security note:
- Discover tap opens Chat directly, but real profile remains hidden.
- The frontend must not receive real profile id if unsafe.
- Safe reference may be required instead of exposing raw profile id.

---

## 19. Notifications to User and Target

Conceptual relationship:

auth.users
-> notifications.recipient_user_id

target_type + target_id
-> related entity

Meaning:
- Notifications route users to chat, reveal response, instant content, or safe profile state.

Security note:
- Notification copy must not reveal identity before reveal.
- target_id must not expose unsafe raw ids if returned to frontend.

Allowed notification copy:
- Someone left you a voice message
- Your profile request has a response
- Profile is now visible
- Someone started a chat from your content

---

## 20. Media Entities to File Audit Logs

Conceptual relationships:

voice_messages.file_audit_id
-> file_audit_logs.id

voice_bios.file_audit_id
-> file_audit_logs.id

instant_posts.file_audit_id
-> file_audit_logs.id

profiles.avatar_file_id
-> file_audit_logs.id

Meaning:
- Media entities reference internal file audit records.

Security note:
- file_audit_logs.storage_path is highly sensitive.
- owner_user_id is highly sensitive.
- Frontend must not receive raw file audit rows.
- Frontend receives signed URL only through safe access flow.

---

# Relationship Rules by Product Flow

## Discover to Chat

Flow:
profiles / safe discover preview
-> chat_threads
-> chat_participants
-> voice_messages

Rules:
- Discover card must not expose real profile.
- Chat opens directly.
- No recipient picker.
- Real profile remains hidden.
- Reveal request happens later inside Chat.

## Feed to Detail to Chat

Flow:
instant_profiles
-> instant_posts
-> Instant Content Detail safe DTO
-> chat_threads
-> voice_messages

Rules:
- Feed tile opens detail.
- Detail can open Chat.
- Real owner identity remains hidden.
- Instant profile is separate from real profile.
- Reveal happens only through Chat.

## Chat to Reveal

Flow:
chat_threads
-> reveal_requests
-> profile_visibility_grants
-> safe_profile_view

Rules:
- Request is inside Chat.
- Request state is not visibility.
- Grant is required.
- Block check is required.
- Safe profile DTO is returned only if allowed.

## Reveal to Profile

Flow:
profile_visibility_grants
+ no blocks
-> profiles
-> profile_interests
-> voice_bios
-> safe_profile_view

Rules:
- Grant must be active.
- Block must not exist.
- Profile data must be safe.
- Top-right chat bubble returns to existing Chat.

## Block Override

Flow:
blocks
-> affects chat_threads
-> affects voice_messages
-> affects reveal_requests
-> affects profile_visibility_grants
-> affects signed media access

Rules:
- Block is stronger than grant.
- Block disables interactions.
- Block closes profile access.
- Block can disable signed media access where applicable.

---

# Relationship Risk Matrix

## High-Risk Relationships

### profiles.user_id
Risk:
- Real identity leak.

Mitigation:
- Protect with RLS and safe DTOs.

### chat_participants.user_id
Risk:
- Hidden participant identity leak.

Mitigation:
- Return self/other labels instead of raw ids.

### voice_messages.sender_user_id
Risk:
- Sender identity leak.

Mitigation:
- Return safe sender direction only.

### reveal_requests.profile_owner_user_id
Risk:
- Hidden owner identity leak.

Mitigation:
- Return safe reveal state only.

### profile_visibility_grants.owner/viewer ids
Risk:
- Private permission relationship leak.

Mitigation:
- Use server-side visibility checks.

### instant_profiles.owner_user_id
Risk:
- Instant profile reveals real owner.

Mitigation:
- Never expose owner_user_id.

### instant_posts.file_audit_id
Risk:
- Raw media path leak.

Mitigation:
- Signed URL safe access only.

### file_audit_logs.storage_path
Risk:
- Direct media access and identity leak.

Mitigation:
- Highly restricted access.

---

# RLS Planning Impact

Every relationship must answer:

1. Who can see this relationship?
2. Who can create this relationship?
3. Who can update this relationship?
4. Who can delete this relationship?
5. Does block override it?
6. Does reveal grant affect it?
7. Does it expose hidden identity?
8. Should frontend receive raw row or safe DTO only?
9. Is RPC/view required?
10. Does it touch private storage?

RLS policy matrix must be written before migrations.

---

# Safe DTO Relationship Strategy

Frontend should not assemble sensitive relationships from raw tables.

Instead, backend/RPC/views should return:

- safe_discover_profile
- safe_feed_tile
- safe_instant_content_detail
- safe_chat_summary
- safe_chat_room
- safe_voice_message
- safe_reveal_request_state
- safe_profile_view
- safe_notification

Safe DTOs should hide:
- user ids
- owner ids
- sender ids
- raw storage paths
- grant internals
- report internals
- moderation internals

---

# Test Lab Relationship Coverage

Test Lab must indirectly validate these relationships:

1. Discover profile creates/opens Chat safely.
2. Feed tile opens Detail safely.
3. Detail opens Chat safely.
4. Voice message belongs to Chat.
5. Voice message does not leak sender_user_id.
6. Reveal request belongs to Chat.
7. Request alone does not reveal profile.
8. Grant reveals profile only if no block.
9. Block hides profile after grant.
10. Instant follow does not create grant.
11. Coin/future entitlement does not create grant.
12. File audit storage path is never returned.
13. Notifications do not leak identity.
14. Reports do not leak reported_user_id.

---

# Not a Migration

This document does not define final SQL.

Before migrations:
- RLS_POLICIES.md must be approved.
- STORAGE.md must be approved.
- SECURITY_RULES.md must be approved.
- TEST_LAB.md must be approved.
- CODEX_TASKS.md must define small implementation tasks.

## Success Criteria

Relationship planning is successful if:

1. Real profile ownership is protected.
2. Instant profile is separate from real profile.
3. Discover opens Chat without identity leak.
4. Feed opens Detail then Chat without identity leak.
5. Voice messages belong to Chat safely.
6. Reveal request is separate from grant.
7. Grant is scoped and private.
8. Block overrides grant and interaction.
9. Storage audit relationships do not expose paths.
10. Frontend receives safe DTOs, not raw sensitive relationships.
11. RLS can be planned table-by-table.
12. Test Lab can verify all critical relationship risks.

## Notes
Relationships are where identity leaks often happen.

If a relationship makes frontend identity inference possible before permission, it must be redesigned before implementation.
