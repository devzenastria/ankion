# STORAGE.md

## Purpose
This document defines the storage security model for ankion.

ankion handles sensitive media:
- chat voice messages
- voice bios
- instant audio
- instant images
- instant videos
- profile/avatar media

Storage must protect user identity, real profile privacy, anonymous interaction, and signed media access.

## Status
Draft storage security direction.

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
- docs/security/RLS_POLICIES.md

## Core Storage Principle
Media can be playable or viewable only through safe access flows.

Frontend must not receive:
- raw storage path
- storage_path
- owner_user_id
- sender_user_id
- auth_user_id
- unsafe media ownership metadata

Correct model:
private storage
-> internal file audit reference
-> safe access check
-> short-lived signed URL
-> frontend playback/display

Wrong model:
public bucket
-> raw path in frontend
-> user identity visible in path
-> permanent media URL

## Product Security Rules

### Profile Reveal Rule
Real profile media can be shown only if:

approved request + active profile visibility grant + no active block = profile visible

### Instant Media Rule
Instant content may be visible, but real profile remains hidden.

instant content visible does not mean real profile visible

### Block Rule
Block overrides storage access where applicable.

If block exists:
- no profile media access
- no new voice media access
- no signed URL generation where applicable
- no real profile/avatar access
- instant media may be hidden depending on relationship/context

## Storage Categories

## 1. Chat Voice Messages

### Purpose
Stores 21-second voice messages sent inside Chat.

### Storage rule
Private storage only.

### Access rule
Only authorized chat participants can access playback through safe signed URL.

### Duration rule
Maximum duration: 21 seconds.

### Limit rule
Sending must respect:
- daily limit: 7 voice messages per user
- same-recipient daily limit: 3

### Path strategy
Use safe context identifiers, not real user ids.

Good examples:
- voice-messages/{chat_thread_id}/{voice_message_id}.m4a
- voice-messages/{safe_context_id}/{voice_message_id}.m4a

Bad examples:
- voice-messages/{sender_user_id}/{message_id}.m4a
- voice-messages/{recipient_user_id}/{message_id}.m4a
- public-voice/{username}/{message_id}.m4a

### Frontend must not receive
- raw storage path
- sender_user_id
- recipient_user_id
- bucket internals

### Frontend may receive
- signed playback URL if allowed
- duration
- waveform metadata if safe
- self/other direction
- listened state

## 2. Voice Bios

### Purpose
Stores profile voice bio media.

Voice bio supports voice-first identity.

### Storage rule
Private storage only.

### Access before reveal
May be available as a safe anonymous preview only if product rules allow it.

Before reveal, it must not expose:
- real profile owner
- raw storage path
- clear identity metadata

### Access after reveal
Can be played if valid profile visibility permission exists and no block exists.

### Good path examples
- voice-bios/{profile_media_ref}/{voice_bio_id}.m4a
- voice-bios/{safe_profile_ref}/{voice_bio_id}.m4a

### Bad path examples
- voice-bios/{owner_user_id}/{voice_bio_id}.m4a
- voice-bios/{username}/{voice_bio_id}.m4a

## 3. Instant Audio

### Purpose
Stores instant audio posts shown in Feed.

### Storage rule
Private or controlled access only.

### Access rule
Instant audio can be visible in Feed/Detail if allowed, but owner identity remains hidden.

### Good path example
- instant-voice/{instant_profile_id}/{post_id}.m4a

### Bad path examples
- instant-voice/{owner_user_id}/{post_id}.m4a
- instant-voice/{real_profile_id}/{post_id}.m4a

### Identity rule
Instant profile id may be used only if it does not expose real owner identity.

## 4. Instant Images

### Purpose
Stores instant photo posts.

### Storage rule
Private or controlled access.

### Good path example
- instant-images/{instant_profile_id}/{post_id}.jpg

### Bad path examples
- instant-images/{owner_user_id}/{post_id}.jpg
- public/{real_profile_id}/{image}.jpg
- avatars/{user_id}/instant.jpg

### Access rule
Feed may show image if safe.  
Real profile must not become visible from image metadata or path.

## 5. Instant Videos

### Purpose
Stores instant video posts.

### Storage rule
Private or controlled access.

### Good path example
- instant-videos/{instant_profile_id}/{post_id}.mp4

### Bad path examples
- instant-videos/{owner_user_id}/{post_id}.mp4
- public/{auth_user_id}/{video}.mp4

### Access rule
Video display must not reveal real owner identity.

## 6. Profile Avatar / Profile Media

### Purpose
Stores real profile visual media.

### Storage rule
Private storage.

### Before reveal
Clear avatar must not be shown.

Allowed before reveal:
- blurred derivative
- abstract anonymous avatar
- safe placeholder
- non-identifying media token

### After reveal
Clear avatar may be shown only with:
- active profile visibility grant
- no active block

### Good path examples
- profile-media/{profile_media_ref}/{file_id}.jpg
- profile-media/{safe_profile_ref}/{file_id}.jpg

### Bad path examples
- avatars/{user_id}/avatar.jpg
- profile-media/{owner_user_id}/avatar.jpg
- public/{username}/avatar.jpg

## File Audit Model

Media should be referenced internally through a file audit or media metadata record.

Expected internal metadata:
- bucket_name
- storage_path
- media_type
- owner_user_id internal
- related_entity_type
- related_entity_id
- created_at
- access context
- signed URL issue tracking if needed

Frontend must not receive raw file audit rows.

Frontend should receive only:
- signed URL if access allowed
- safe media type
- duration if relevant
- safe display metadata

## Signed URL Rules

Signed URLs must be:
- short-lived
- generated only after access checks
- never stored permanently in frontend as durable identity
- invalidated naturally by expiry
- denied when block exists where applicable

Signed URL access must check:
- current user
- relationship to media
- chat participation if voice message
- profile visibility grant if profile media
- block state
- media target type
- report/safety status if needed

## Storage Access by Flow

### Discover Profile Card
Before reveal:
- no clear profile avatar
- no raw profile media
- safe blurred derivative only
- voice bio preview only if safe

### Feed Tile
Before reveal:
- can show instant media safely
- must not expose real owner identity
- must not expose raw storage path

### Instant Content Detail
Can show:
- photo/video/audio content if safe
- anonymous profile preview
- Chat CTA

Must not show:
- owner_user_id
- raw path
- real profile media before reveal

### Chat Voice Playback
Can show:
- signed voice message URL if user is authorized participant
- duration
- waveform data if safe

Must not show:
- sender_user_id
- raw path

### Profile Revealed View
Can show real profile media only if:
- active grant exists
- no block exists

## Block Override

If block exists, storage access must be denied where applicable.

Block must affect:
- voice message playback
- profile avatar/media access
- voice bio playback
- signed URL generation
- instant media access if relationship/context requires hiding
- future media access tied to profile visibility

Block must always override:
- reveal grant
- follow
- coin/future entitlement
- chat continuation
- old signed URL request attempts

## RLS and Storage Policy Planning

Storage security requires both:
- database/RLS checks
- storage access controls

Sensitive storage-related tables:
- file_audit_logs
- voice_messages
- voice_bios
- instant_posts
- profiles
- profile_visibility_grants
- blocks

Storage policy planning must answer:
1. Who owns the file internally?
2. Who can request a signed URL?
3. Does block prevent access?
4. Does reveal grant affect access?
5. Is the media instant content or real profile media?
6. Can this URL reveal identity?
7. Is raw path ever returned to frontend?
8. Is the path safe if leaked accidentally?

## Frontend Rules

Frontend must never:
- construct raw storage paths
- guess bucket paths
- receive owner_user_id
- receive sender_user_id
- receive storage_path
- decide profile media visibility alone
- reuse old signed URLs as permission proof

Frontend should:
- request safe media access
- receive signed URL only if allowed
- handle expired signed URL gracefully
- show calm error states
- not reveal identity in error messages

## Safe Error States

Allowed copy:
- This voice is no longer available
- This media is unavailable right now
- You can keep chatting
- Profile media is hidden for now

Avoid:
- Access denied
- Permission failed
- User blocked you
- You are not allowed
- Storage access rejected

## Test Lab Scenarios

Test Lab must verify storage safety.

### Scenario 1: Raw Path Leak Check
Expected:
- frontend never receives raw_storage_path
- frontend never receives storage_path

### Scenario 2: Chat Voice Playback
Expected:
- authorized participant gets signed playback URL
- non-participant cannot access
- sender_user_id not returned

### Scenario 3: Voice Duration
Expected:
- 21-second voice accepted
- over 21 seconds denied

### Scenario 4: Profile Avatar Before Reveal
Expected:
- clear avatar hidden
- only blurred/anonymous media shown

### Scenario 5: Profile Avatar After Reveal
Expected:
- active grant + no block allows safe avatar access

### Scenario 6: Block After Reveal
Expected:
- profile media access closes
- voice/profile signed URL access denied where applicable

### Scenario 7: Instant Feed Media
Expected:
- Feed tile shows safe instant media
- owner_user_id not returned
- raw path not returned

### Scenario 8: Instant Profile Follow
Expected:
- follow does not reveal real profile media

### Scenario 9: Coin Cannot Unlock Media
Expected:
- coin/future entitlement does not unlock real profile media without grant

### Scenario 10: File Audit Logs
Expected:
- file_audit_logs cannot be read from frontend

## Explicit Non-Goals

Do not use in MVP:
- public media buckets for sensitive media
- permanent public profile avatar URLs
- storage paths containing user ids
- frontend-generated storage paths for sensitive files
- long-lived signed URLs for sensitive media
- coin-based real profile media unlock
- feed media revealing real owner identity
- direct file audit access from frontend

## Success Criteria

Storage model is successful if:

1. Media is not public by default.
2. Raw storage paths never return to frontend.
3. Storage paths do not expose user identity.
4. Voice messages are played through safe signed URLs.
5. Profile media is hidden before reveal.
6. Profile media is visible only with active grant and no block.
7. Instant media can display without revealing real profile.
8. Block disables media access where applicable.
9. File audit logs are private.
10. Test Lab can verify storage leak scenarios.
11. RLS/storage policies can be planned before implementation.

## Notes
Storage is part of ankion's privacy model.

If media access reveals identity before permission, the storage design must be changed before implementation.
