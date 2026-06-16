# INSTANT_FLOW.md

## Purpose
This document defines the instant media and Feed flow for ankion.

Instant media is part of MVP. It allows users to share photo, video, and audio content through an anonymous media layer while keeping the real profile hidden by default.

## Status
Approved product flow direction.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/product/REVEAL_FLOW.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

## Core Principle
Instant content is visible, but real identity is hidden.

Correct model:

Instant Feed
-> Instant Content Detail
-> Anonymous content owner preview
-> Chat CTA
-> Chat opens in anonymous context
-> Profile reveal request happens inside Chat
-> Real profile visible only with active grant and no block

Important:
- Instant content must not reveal the real profile automatically.
- Instant profile is separate from real profile.
- Feed engagement must not reveal owner identity.
- Coin, follow, or content interaction must not reveal real profile.
- Reveal still requires owner decision and active visibility grant.

## Instant Media in MVP

Supported instant media types:

1. Instant photo
2. Instant video
3. Instant audio

Instant media must be discoverable through Feed.

MVP Feed layout:
- 3-column photo / video / audio grid
- No Live tab in MVP
- No separate recipient picker
- No public real profile browsing
- No dating-style swipe/match interaction

## Feed Screen

Feed is a content discovery surface.

Feed shows:
- 3-column media grid
- Photo tiles
- Video tiles
- Audio tiles
- Media type indicators
- Optional duration for audio/video
- Anonymous owner indicator
- Minimal engagement indicators if needed

Feed must not show before reveal:
- Real name
- Clear real profile photo
- Exact age
- Exact city
- Full real profile
- owner_user_id
- raw storage path

Allowed filters in MVP:
- For you
- Following

Not allowed in MVP:
- Live
- Heavy algorithmic ranking
- Dating-style filters
- Public profile browsing
- Real identity sorting

## Feed Tile Interaction

When user taps a Feed tile:

Expected result:
1. Instant Content Detail opens.
2. Content is shown.
3. Real owner identity remains hidden.
4. Anonymous media/profile preview is shown.
5. User can open Chat from detail.
6. Chat opens in anonymous context.

Feed tile must not:
- Open real profile directly before reveal
- Expose owner_user_id
- Expose raw storage path
- Create a recipient picker flow
- Reveal identity through metadata

## Instant Content Detail

Instant Content Detail is the bridge between Feed and Chat.

Detail screen may show:
- Full photo/video/audio content
- Audio waveform for audio content
- Video play control for video content
- Anonymous profile preview
- Chat CTA
- Safety menu
- Save/share/more controls if safe

Detail screen must not show:
- Real owner name before reveal
- Clear real owner profile before reveal
- Exact age/city before reveal
- Raw storage path
- owner_user_id
- Hidden real profile fields

Primary action:
- Open Chat

Secondary actions:
- Save / future
- Share / future safe link only
- More
- Report
- Block

## Instant Profile Layer

Instant profile is not the real profile.

Instant profile may include:
- Anonymous media identity
- Blurred or abstract avatar
- Content grid
- Follow button
- Safe anonymous label
- Optional voice/audio identity cue

Instant profile must not include before reveal:
- Real name
- Clear real profile photo
- Exact age
- Exact city
- Full bio
- Social handles
- owner_user_id

## Instant Follow

Instant profile may be followable.

Follow rules:
- Following an instant profile does not reveal the real profile.
- Following does not create profile visibility grant.
- Following does not bypass reveal flow.
- Following does not bypass block.
- Followers may be part of future monetization, but not MVP-critical.

Allowed:
- Follow instant profile
- See followed instant content
- Receive safe notifications for new content

Not allowed:
- See real profile from follow
- See real profile owner identity
- Reveal profile using follow
- Bypass owner permission

## Feed-to-Chat Flow

The approved flow:

1. User opens Feed.
2. User taps photo/video/audio tile.
3. Instant Content Detail opens.
4. User taps Chat CTA.
5. Chat opens in anonymous context.
6. User sends voice message.
7. User may request profile reveal inside Chat.
8. Owner decides whether to reveal.
9. Real profile becomes visible only with active grant and no block.

There must be no recipient picker screen.

## Instant Content to Reveal Flow

Instant content can lead to reveal request only through Chat.

Correct flow:

Instant Content Detail
-> Chat
-> I want to see your profile
-> Owner decision
-> Active grant if revealed
-> Profile visible if no block

Wrong flow:

Instant Content Detail
-> Real profile opens directly

Wrong flow:

Follow instant profile
-> Real profile visible

Wrong flow:

Coin/follower-view
-> Real profile visible

## Voice Request From Instant Content

If viewer is interested in content owner:

Expected product behavior:
- Viewer opens Chat from content detail.
- Viewer can send a voice message.
- Viewer can tap "I want to see your profile."
- Optional voice request can be part of future UX.
- Owner can reveal, decide later, or stay hidden.

The request must remain inside Chat context.

## Anonymous Media Rules

Instant media can be visible, but identity must remain protected.

Frontend may receive:
- instant_post_id
- media type
- safe media display URL if authorized
- duration if audio/video
- anonymous profile label
- instant_profile_id if safe
- safe engagement metadata
- safe chat CTA target

Frontend must not receive before reveal:
- owner_user_id
- real profile id if unsafe
- real name
- clear real avatar
- exact age
- exact city
- raw storage path
- private moderation fields

## Storage Rules for Instant Media

Instant media must use private storage or controlled access.

Rules:
- No public raw storage path.
- Signed URLs must be short-lived where needed.
- Storage paths must not expose owner_user_id.
- Storage paths should use safe identifiers such as instant_profile_id or post_id.
- Block must prevent media access where applicable.

Correct path examples:
- instant-voice/{instant_profile_id}/{post_id}.m4a
- instant-images/{instant_profile_id}/{post_id}.jpg
- instant-videos/{instant_profile_id}/{post_id}.mp4

Wrong path examples:
- instant-images/{owner_user_id}/{post_id}.jpg
- instant-videos/{auth_user_id}/{post_id}.mp4
- public/{real_profile_id}/{file}.jpg

## Block Rules for Instant Flow

Block must affect instant interactions.

If block exists:
- User must not open Chat with blocked party.
- User must not send voice messages.
- User must not create reveal request.
- User must not view real profile.
- Signed media access should be denied where applicable.
- Blocked content may be hidden from Feed if needed.

Block overrides:
- follow
- reveal grant
- content interaction
- chat continuation
- media access where applicable

## Report / Safety Rules

Instant content must support safety actions.

Report entry points:
- Feed tile menu
- Instant Content Detail menu
- Chat menu
- Profile menu after reveal

Report reasons:
- Inappropriate content
- Fake profile concern
- Harassment or pressure
- Unwanted message
- Other

Safety language must be calm.

Avoid:
- Large red warning screens
- Aggressive blocking copy
- Public shaming indicators

## Notifications

Instant notifications must not leak identity.

Allowed notification examples:
- A followed instant profile shared new content
- Someone started a chat from your content
- Someone left you a voice message
- Your profile request has a response

Not allowed:
- Real name before reveal
- Clear identity before reveal
- Exact owner details before reveal

## Backend Behavior Notes
These are product-behavior notes, not implementation code.

Backend must support:
- Creating instant posts for photo/video/audio
- Listing safe Feed tiles
- Opening safe Instant Content Detail
- Creating or finding Chat from Instant Content Detail
- Returning safe instant profile preview
- Protecting owner_user_id
- Protecting raw storage paths
- Generating signed URLs only when allowed
- Checking block before Chat access
- Checking block before media access where applicable
- Ensuring instant follow does not create real profile visibility
- Ensuring coin/follower-view cannot reveal real profile
- Returning safe DTOs instead of raw database rows

## Frontend Visibility Rules

Before reveal, frontend may show:
- instant post media
- media type
- duration
- anonymous label
- blurred/abstract avatar
- instant profile preview
- follow button
- Chat CTA
- safe content metadata

Before reveal, frontend must not show:
- owner_user_id
- auth user id
- real profile id if unsafe
- real name
- clear real avatar
- exact age
- exact city
- raw storage path
- moderation internals

After valid reveal and no block, frontend may show:
- real profile data allowed by reveal rules
- profile screen
- top-right chat bubble
- safe shared content

## Test Lab Scenarios

Test Lab must include instant flow scenarios.

### Scenario 1: Feed Grid
Expected:
- Feed shows 3-column photo/video/audio grid
- No Live tab
- No recipient picker

### Scenario 2: Feed Tile Detail
Expected:
- Tapping tile opens Instant Content Detail
- Real profile remains hidden
- owner_user_id not returned
- raw storage path not returned

### Scenario 3: Detail to Chat
Expected:
- Chat CTA opens Chat
- Chat opens in anonymous context
- Voice message can be sent from Chat

### Scenario 4: Instant Follow
Expected:
- User can follow instant profile
- Real profile remains hidden
- No visibility grant is created

### Scenario 5: Instant Reveal Request
Expected:
- User opens Chat from detail
- User requests profile reveal inside Chat
- Profile remains hidden until owner reveal + active grant

### Scenario 6: Coin Cannot Reveal
Expected:
- Coin or entitlement exists
- No active visibility grant exists
- Real profile remains hidden

### Scenario 7: Block Override
Expected:
- Block disables Chat access
- Block disables reveal request
- Block disables profile view
- Block disables signed media URL where applicable

### Scenario 8: Leak Check
Expected frontend must not receive:
- owner_user_id
- raw_storage_path
- real profile fields
- private moderation fields

## Out of Scope for MVP Instant Flow

Do not include in MVP:
- Live streaming
- Public comments
- Public likes as a main feature
- Heavy creator analytics
- Paid real-profile unlock
- Auto reveal from engagement
- Public real profile browsing
- Complex recommendation algorithm
- Dating-style discovery mechanics

## Success Criteria

Instant flow is successful if:

1. Feed shows photo/video/audio grid.
2. Feed has no Live tab in MVP.
3. Feed tile opens Instant Content Detail.
4. Detail opens Chat naturally.
5. No recipient picker exists.
6. Real profile remains hidden before permission.
7. Instant profile is separate from real profile.
8. Follow does not reveal real profile.
9. Coin does not reveal real profile.
10. Reveal request happens inside Chat.
11. Storage path and owner identity do not leak.
12. Block overrides instant interaction.
13. Test Lab verifies all critical instant risks.

## Notes
Instant media strengthens discovery, but must not weaken anonymity.

If instant content starts exposing real identity without permission, it violates ankion core.
