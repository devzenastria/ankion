# Voice / Media Storage Boundary Plan

## Phase

Phase 17D — Documentation-only Voice / Media Storage Boundary Planning

## Purpose

This document defines how ankion should safely plan storage boundaries for voice messages, feed media, and profile avatars before any Supabase Storage implementation begins.

The goal is to prevent identity leakage through files, storage paths, public URLs, metadata, or unsafe client access.

This phase is documentation-only.

No Supabase Storage implementation is included in Phase 17D.

---

## Core Security Rule

Storage must not weaken anonymity.

Even if table RLS is correct, identity can still leak through:

- public file URLs
- predictable storage paths
- filenames
- bucket permissions
- media metadata
- avatar access
- signed URL misuse
- client-side joins
- notification payloads

Storage design must protect the separation between:

- anonymous interaction identity
- real profile identity
- private account identity

---

## Current Security Context

Completed planning foundations:

- Phase 17A — Data Model + RLS Foundation Plan
- Phase 17B — Anonymous Identity / Real Profile Separation Plan
- Phase 17C — Reveal Request Security Model

Current state:

- No Supabase files exist
- No Storage buckets exist
- No Auth exists
- No RLS policies exist
- No migrations exist
- No upload behavior exists
- No recorder/audio behavior exists
- No real media exists

---

## Future Storage Areas

### 1. Voice Messages

Future bucket idea:

- `voice-messages`

Purpose:

Stores anonymous voice message audio files.

Default access:

Private.

Access should be limited to:

- sender
- conversation participant
- system/service role if needed

Must not be public by default.

---

### 2. Feed Media

Future bucket idea:

- `feed-media`

Purpose:

Stores anonymous photo, video, and audio moments for Feed.

Possible access:

Public or semi-public later, but only if media does not expose real identity.

Important:

Feed media should never reveal real profile owner by storage path or metadata.

---

### 3. Profile Avatars

Future bucket idea:

- `profile-avatars`

Purpose:

Stores real profile avatar files.

Default access:

Private or grant-controlled.

Access should depend on profile visibility rules.

Profile avatar should not be visible before approved reveal unless product later explicitly allows safe public avatar mode.

---

## Storage Path Rules

Never include:

- email
- real name
- phone number
- public display name
- auth provider id
- obvious user id in public contexts
- private profile id in public anonymous contexts
- readable owner identity

Avoid unsafe paths:

```txt
voice-messages/{user_email}/message.m4a
voice-messages/{real_name}/voice.m4a
feed-media/{owner_user_id}/photo.jpg
profile-avatars/{display_name}/avatar.jpg
```

## Phase 17E Alignment Note

Phase 17E confirms this document is part of the completed Phase 17 security foundation set.

Confirmed:

- Voice/media storage boundary planning is documented before implementation.
- This remains documentation-only.
- No Supabase/Auth/RLS/Storage implementation files, migrations, SQL, backend/API, route/component, package, lockfile, or apps/web source changes were added.

## Phase 20F Storage Privacy Readiness Review Note

Phase 20F reviewed whether this Storage boundary plan is ready for future Supabase Storage implementation.

Gate status:

```txt
NOT READY
```

Review result:

- Storage privacy planning exists, but it is not implementation-ready.
- Phase 20D finalized schema readiness remains NOT READY.
- Phase 20E RLS policy verification readiness remains NOT READY.
- Future storage/media needs include anonymous voice messages, feed images, feed videos, optional instant visual/selfie media, and future profile media.
- Media paths must not expose real user id, private profile id, `owner_user_id`, email, phone, real name, or real profile handle.
- Anonymous media identity and real profile identity must remain separated.
- Media metadata must not bridge anonymous identity to real profile unless a valid reveal grant permits that access.

Unresolved Storage privacy blockers:

- bucket strategy is not finalized
- path privacy rules are incomplete
- signed URL lifetime and generation assumptions are not finalized
- upload access rules are not finalized
- read/access rules are not finalized
- delete/revoke/expiration behavior is not finalized
- voice message recipient/participant access rules need final verification
- feed media public-safe access rules are unclear
- optional instant visual/selfie media boundaries are unclear
- future profile media/avatar grant behavior is unclear
- media metadata table relationship rules are not finalized
- CDN/cache privacy assumptions are not finalized
- storage audit/test expectations are incomplete

Decision:

Do not create Storage buckets, Storage policies, signed URL code, upload behavior, media handling code, SQL, migrations, or Supabase implementation from this plan yet.

## Phase 20G Auth Storage Dependency Note

Phase 20G confirms Storage privacy readiness remains dependent on final Auth boundaries.

Future Storage access must know exactly how authenticated users own anonymous media, private profile media, voice messages, feed media, reveal-grant-dependent profile media, and deleted/deactivated account media before buckets, policies, upload behavior, signed URLs, or media deletion/revocation can be implemented.

## Phase 20H Storage Migration Safety Note

Phase 20H confirms migration rollback/check strategy is PLANNED while Storage-related migration execution remains BLOCKED / NO-GO.

Future Storage-related migrations must document bucket/path impact, media metadata impact, signed URL assumptions, deletion/revocation behavior, rollback risk, and storage leak validation before any Storage buckets, policies, SQL, migrations, upload behavior, or signed URL code begins.

## Phase 20J Storage Client Boundary Note

Phase 20J confirms client integration boundary is REVIEWED / PLANNED while Storage implementation remains BLOCKED / NO-GO.

The mobile client must not access buckets, upload media, request signed URLs, read raw storage paths, or assume public bucket behavior until Storage privacy boundary, RLS verification, Auth context, environment strategy, package alignment, and testing/audit gates are approved.

## Phase 20K Storage Testing Audit Note

Phase 20K confirms testing / audit procedure is PLANNED while Storage implementation remains BLOCKED / NO-GO.

Future Storage tests must verify no public bucket assumption, voice/media ownership checks, signed URL or controlled access expectations, reveal-safe media access, blocked unauthorized media access, and prevention of raw storage path leaks.

No Storage buckets, policies, upload behavior, signed URL code, test implementation, package changes, or runtime behavior are authorized by this note.

---

## Phase 21A Package Alignment Cross-Reference Note

Phase 21A completed Expo package alignment and validation.

Confirmed:

* `expo` aligned to `~56.0.8`
* `expo-linking` aligned to `~56.0.13`
* `expo-router` aligned to `~56.2.8`
* mobile typecheck passed
* web typecheck passed
* web build passed
* mobile Android export passed
* release APK build passed
* device smoke test passed

This phase did not change schema, SQL, migrations, Supabase, Auth, RLS, Storage, backend/API, route behavior, or runtime product behavior.

Storage implementation remains blocked.

Supabase implementation remains:

```txt
NO-GO
```

---

## Phase 22C Storage / Media Capture Intent Boundary Update

Phase 22C aligns this Storage boundary plan with the Phase 22A schema expansion and Phase 22B RLS matrix expansion.

This remains documentation-only.

This note does not authorize:

* Storage bucket creation
* Storage policy creation
* signed URL code
* media upload behavior
* recorder behavior
* camera behavior
* gallery access
* Supabase implementation
* Supabase client integration
* Auth implementation
* RLS policy creation
* SQL
* migrations
* `.env` files
* backend/API logic
* route UI changes
* runtime behavior

Supabase implementation remains:

```txt
NO-GO
```

Storage implementation remains:

```txt
NOT READY
```

---

## Phase 22C Core Storage Decision

ANKION Storage must support three separate security goals:

1. Keep anonymous interaction separate from real profile identity.
2. Prevent raw media path or bucket metadata from leaking identity.
3. Support capture-now authenticity for public Feed/discovery media.

Storage privacy is not only a bucket problem.

The future implementation must coordinate:

* database schema
* RLS
* safe DTOs
* RPC / Edge Function access checks
* signed URL generation
* media metadata
* block state
* reveal grants
* media capture intents
* client upload boundaries

---

## Phase 22C Media Categories

Future media must be separated by access model.

### 1. Voice Message Media

Purpose:

* private voice messages inside a valid conversation

Default access:

* private

Access may be allowed only for:

* sender
* valid conversation participant
* system/service role for processing or moderation

Required checks:

* user is authenticated
* user owns one participant anonymous identity
* conversation exists
* no active block prevents access
* voice message belongs to conversation
* media item is available
* signed URL is short-lived

Must not expose:

* sender_user_id
* owner_user_id
* auth user id
* raw storage path
* real profile fields

---

### 2. Public-Safe Feed Media

Purpose:

* anonymous Feed/discovery photo, video, or audio moments

Default access:

* controlled access, not raw public path

Access may be allowed only through:

* safe feed DTO
* safe media reference
* signed access result if needed

Required checks:

* feed item is visible
* media item is available
* media does not expose unsafe owner identity through metadata
* block rules do not deny access
* public-safe DTO does not include owner_user_id
* capture-now requirement is satisfied where applicable

Must not expose:

* real profile
* owner_user_id
* auth user id
* raw storage path
* private avatar
* private moderation fields

---

### 3. Private Chat Media

Purpose:

* future private media sharing inside a connection

Default access:

* private

Access may be allowed only for:

* valid conversation participants
* sender
* system/service role where needed

Gallery may be considered later only for private chat/personal sharing.

Gallery must not be used for public Feed/discovery media.

---

### 4. Profile Avatar / Real Profile Media

Purpose:

* real profile media such as clear avatar

Default access:

* private or grant-controlled

Access may be allowed only if:

* active profile_visibility_grant exists
* viewer_user_id is valid for the grant
* grant is scoped to the owner/viewer/connection
* no active block exists
* media is available
* safe profile view/RPC permits the field

Must not expose:

* clear avatar before reveal
* raw avatar storage path
* private profile id
* owner_user_id
* auth user id

---

### 5. Report / Moderation Media

Purpose:

* future safety report attachments or moderation evidence

Default access:

* private

Access may be allowed only for:

* reporter-safe own limited status if needed
* moderation/system role

Must not expose:

* reporter_user_id to reported user
* moderation notes
* internal safety scoring
* raw storage path
* unrelated identity links

---

## Phase 22C Capture-Now Rule

Public Feed/discovery media must be capture-now.

This means:

* public photo/video/audio posts must come from in-app capture flow
* gallery upload must not be accepted for public Feed/discovery media
* frontend-only UI prevention is not sufficient
* backend and Storage flow must enforce authenticity

Future public media upload must require:

1. media_capture_intent creation
2. server nonce
3. short expiry
4. controlled upload permission
5. media hash or equivalent integrity marker
6. capture surface validation
7. storage path assignment
8. media_items metadata creation
9. replay prevention
10. block-aware access check

---

## Phase 22C media_capture_intents Boundary

`media_capture_intents` is the future table-level gate for controlled capture and upload.

It must not be treated as a normal client-created row.

Future direction:

* client requests intent
* server/RPC/Edge Function creates nonce and expiry
* client performs in-app capture
* upload is accepted only while intent is valid
* intent can be used once
* expired intent is rejected
* reused intent is rejected
* cancelled/rejected intent cannot upload
* storage path is assigned by trusted logic, not arbitrary client input

Must not expose:

* nonce to unrelated users
* owner_user_id to public surfaces
* raw storage path
* internal validation fields
* replay/security internals

---

## Phase 22C media_items Boundary

`media_items` is the future metadata table that separates safe media access from raw Storage access.

Frontend should not receive raw Storage rows.

Frontend may receive only:

* safe media reference
* media type
* duration if safe
* visibility state if safe
* signed access result if authorized
* public-safe display URL only after access check

Frontend must not receive:

* storage_bucket
* storage_path
* owner_user_id
* auth user id
* private profile id
* moderation internals
* media hash/security internals
* unsafe identity links

---

## Phase 22C Storage Path Rules

Storage paths must be non-identifying.

Allowed direction:

```txt
voice-messages/{conversation_id}/{voice_message_id}.m4a
feed-media/{anonymous_identity_id}/{feed_item_id}/{media_item_id}.jpg
feed-media/{anonymous_identity_id}/{feed_item_id}/{media_item_id}.mp4
private-chat-media/{conversation_id}/{media_item_id}
profile-media/{opaque_profile_media_id}/{media_item_id}
reports/{report_id}/{media_item_id}
```

Unsafe direction:

```txt
voice-messages/{sender_user_id}/{message_id}.m4a
feed-media/{owner_user_id}/{post_id}.jpg
profile-avatars/{real_name}/avatar.jpg
public/{real_profile_id}/{file}.jpg
reports/{reporter_user_id}/{reported_user_id}.jpg
```

Path rule:

Even if a signed URL is short-lived, the path itself must not reveal identity.

---

## Phase 22C Signed URL Rules

Signed URLs must be generated only after access checks.

Future signed URL checks must include:

* authenticated user
* requested media item exists
* media item is available
* user is owner, valid participant, approved viewer, or safe public viewer depending on media type
* no active block denies access
* reveal grant exists for real profile media if needed
* URL lifetime is short
* raw path is not returned separately
* expired/revoked/removed media does not receive a URL

Signed URL generation must not be done directly by uncontrolled frontend logic.

---

## Phase 22C Block Interaction

Block must override media access where applicable.

If active block exists:

* profile media must not be accessible
* private voice media must not remain accessible if policy requires closure
* new signed URLs must not be generated
* new reveal request must not be created
* new voice/media send must not be accepted
* follow must not create access
* future calls must not start

If a signed URL was already generated before block, future implementation must decide whether short lifetime is sufficient or whether additional revocation strategy is required.

This remains unresolved.

---

## Phase 22C Open Decisions Blocking Storage PASS

Storage readiness remains NOT READY until these are finalized:

* final bucket list
* final path strategy
* whether voice, feed, private chat, profile, and reports use separate buckets or strict folder namespaces
* signed URL lifetime
* signed URL revocation behavior after block
* media_items nullable rules
* capture_intent lifecycle
* hash/integrity strategy
* server nonce format and replay prevention
* public Feed media access model
* private chat gallery allowance boundary
* profile avatar grant behavior
* report media retention
* CDN/cache assumptions
* Storage audit/test cases
* safe DTO/RPC boundary for media access

---

## Phase 22C Storage Readiness Decision

This Storage boundary is updated, but remains:

```txt
NOT READY FOR STORAGE IMPLEMENTATION
```

Decision:

Do not create Storage buckets, Storage policies, signed URL code, upload behavior, media handling code, SQL, migrations, Supabase client code, Auth implementation, RLS policies, `.env` files, backend/API code, route behavior, or runtime behavior from Phase 22C.

Next correct planning phase:

Phase 22D — Safe DTO / RPC Boundary Update.
