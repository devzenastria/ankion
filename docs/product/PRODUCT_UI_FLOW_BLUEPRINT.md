# PRODUCT_UI_FLOW_BLUEPRINT.md

## Purpose

Define the Phase 4A product UI flow blueprint before any product screen implementation begins.

This document translates the approved MVP flows into a screen-level product blueprint while keeping implementation deferred.

## Status

Phase 4A documentation blueprint.

No product UI files, routes, screens, Supabase files, Auth logic, Storage logic, RLS SQL, migrations, or shared packages are created by this document.

## Source Documents

This document follows:

- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`

## MVP Screen List

Planned MVP product screens:

- Discover
- Feed
- Chat
- Profile
- Reveal Requests
- Basic Settings placeholder if needed later

These screens are planning targets only. They must not be implemented until a later explicit implementation task approves exact files.

## App Usage Flow After Login

After login and required profile completion, the user enters the authenticated app.

Planned high-level flow:

1. User lands in the main app.
2. User can move between Discover, Feed, Chat, and Profile.
3. Discover and Feed are discovery surfaces.
4. Chat is the central interaction hub.
5. Profile manages owned profile context and later revealed profile viewing.
6. Reveal Requests may be represented inside Chat first, with a dedicated request surface only if later approved.
7. Basic Settings may be added later as a placeholder for account controls.

## Discover Flow

Discover is for hidden profile discovery.

Planned behavior:

1. User opens Discover.
2. User sees anonymous or blurred profile cards.
3. User taps a Discover item.
4. Chat opens directly with that hidden profile context.
5. The app does not show a separate recipient-selection screen.
6. Real profile details stay hidden unless the owner approves reveal.

Discover must not become a dating-style swipe or match screen.

## Feed Flow

Feed is for instant photo, video, and audio discovery.

Planned behavior:

1. Feed later uses a 3-column media grid.
2. Grid items may represent instant photo, video, or audio content.
3. A Feed item opens Instant Content Detail first where needed.
4. Instant Content Detail leads to Chat.
5. The item owner real profile remains hidden unless reveal is approved.
6. The app does not show a separate recipient-selection screen.

The 3-column grid is a future implementation detail. Do not implement it during Phase 4A.

## Chat Flow

Chat is the central interaction hub.

Chat handles:

- anonymous voice message sending
- voice listening
- profile reveal requests
- reveal decisions
- hidden, waiting, stayed hidden, and revealed states
- return path from revealed profile
- safety actions later

Discover or Feed intent should resolve into Chat without a recipient picker.

## Anonymous Voice Message Flow

Planned anonymous voice flow:

1. User enters Chat from Discover or Feed context.
2. Sender records a voice message inside Chat.
3. Sender sends the voice message while their real profile remains hidden.
4. Recipient listens to the voice message.
5. Listening does not reveal the sender's real profile.
6. Voice remains the primary MVP interaction.

Future implementation must preserve the approved voice limits:

- 21 seconds per voice message
- 7 voice messages per user per day
- 3 voice messages to the same recipient per day

These limits must be enforced server-side later, not only in UI.

## Profile Reveal Flow

Reveal is permission-based and owner-controlled.

Planned flow:

1. Recipient receives or listens to a voice message.
2. Recipient can request to see the sender's real profile.
3. The request appears in Chat or a Reveal Requests surface.
4. Sender can approve, decide later, or stay hidden.
5. Real profile stays hidden unless the profile owner approves and an active visibility grant exists.
6. Request approval alone is not enough.
7. Block overrides visibility.

Required visibility rule:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

## Reveal Copy Rules

Use calm, human wording.

Allowed tone examples:

- Waiting for response
- Profile stayed hidden for now
- You can keep chatting
- Profile is still private
- Decide later

Avoid harsh copy such as:

- Rejected
- Denied
- Access refused

## Profile Flow

Profile supports owned profile context and later revealed profile viewing.

Planned behavior:

1. Before reveal, real profile details stay hidden from others.
2. After valid reveal, approved real profile details may be visible.
3. The Profile screen later includes a top-right floating chat bubble.
4. Tapping the chat bubble returns to the existing Chat.
5. Profile must not become public browsing before permission.

## Instant Content Privacy

Instant photo, video, and audio content may be part of MVP discovery.

Rules:

- Instant content does not reveal real profile automatically.
- Instant profile remains separate from real profile.
- Instant follow or media interaction does not grant real profile visibility.
- Instant Content Detail can lead to Chat.
- Real profile stays hidden unless reveal is approved by the owner.

## Anti-Drift Rules

The MVP must stay:

- voice-first
- anonymous-first
- Chat-centered
- permission-based for real profile reveal
- mobile-native
- not a dating app
- not a generic text chat app
- not a public real-profile social feed

Forbidden product drift:

- separate recipient-selection screen
- dating-style swipe/match mechanics
- public real profile browsing before permission
- Feed opening real profile directly
- Chat becoming text-first
- instant content revealing real profile
- harsh reveal rejection language

## Out Of Scope For Phase 4A

Phase 4A does not include:

- product UI files
- Discover route
- Feed route
- Chat route
- Profile route
- Test Lab route
- Supabase setup
- Auth
- Storage
- RLS
- migrations
- API integration
- package changes
- shared packages

## Future Implementation Gate

Before any product UI screen is created, the user must approve a narrow implementation task that specifies:

1. Goal
2. Allowed files
3. Forbidden files
4. Expected output
5. Safety constraints
6. Verification steps
7. Rollback note if relevant

## Success Criteria

The blueprint is successful if:

1. The MVP screen list is clear.
2. Discover and Feed lead to Chat without a recipient picker.
3. Chat remains the central interaction hub.
4. Voice-first anonymous interaction remains the core.
5. Reveal stays owner-approved and permission-based.
6. Instant content keeps real profile hidden.
7. Profile later includes a top-right floating chat bubble.
8. Product implementation remains deferred.

