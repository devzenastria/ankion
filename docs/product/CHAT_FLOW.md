# CHAT_FLOW.md

## Purpose
This document defines the chat-centered product flow for ankion.

Chat is the main interaction hub of ankion. It is where anonymous discovery becomes voice interaction, where profile reveal requests happen, and where trust is built.

## Status
Approved product flow direction.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

## Core Principle
ankion is not built around a separate recipient picker.

Correct model:

Discover or Feed
-> Profile / Content interaction
-> Chat opens
-> Voice message is sent inside Chat
-> Profile reveal request happens inside Chat
-> Reveal decision happens inside Chat
-> Relationship continues inside Chat

## Chat Role in MVP
Chat handles:

- Voice messages
- Voice recording
- Profile reveal requests
- Reveal decisions
- Waiting states
- Profile revealed state
- Safety actions
- Block/report entry points
- Return path from revealed profile

Chat must not become a generic text-first messaging app.

## Chat Entry Points

### 1. Discover to Chat
User taps a blurred profile card in Discover.

Expected result:
- Chat opens directly.
- Real profile remains hidden.
- The chat header shows hidden/anonymous identity.
- User can send a voice message.
- User can request profile visibility.

No separate recipient selection screen is allowed.

### 2. Feed to Detail to Chat
User taps a Feed tile.

Expected result:
- Instant Content Detail opens first.
- Real owner identity remains hidden.
- User can open Chat from the detail screen.
- Chat opens in anonymous context.
- User can send a voice message from Chat.

Feed must not expose real profile before permission.

### 3. Profile Screen to Chat
After reveal, the full profile screen includes a top-right floating chat bubble.

Expected result:
- Tapping the chat bubble returns to the existing Chat.
- It must not create a duplicate chat.
- It must not expose unrelated profile data.

## Chat Identity States

### Hidden Profile State
Before permission, Chat shows:

- Blurred avatar
- Anonymous label
- Calm helper text
- Voice-first interaction
- Profile request CTA

Allowed copy examples:
- Hidden profile
- Profile opens only with permission
- You can connect through voice first

Not allowed:
- Real name
- Clear face
- Exact age
- Exact city
- Full bio
- Social handles

### Profile Request Sent State
When a user sends a profile reveal request:

- The request appears as a small inline card inside Chat.
- The user can see that the request is waiting.
- The app should not use aggressive or transactional language.

Allowed copy:
- Profile request sent
- You'll see the response here when they decide
- Waiting for response

### Decision Pending / Later State
If the profile owner chooses to decide later:

- Real profile remains hidden.
- The request remains inside the chat.
- Chat can continue.
- The app must avoid harsh language.

Allowed copy:
- Waiting for response
- The request will stay inside this chat
- You can keep chatting

### Stay Hidden State
If the profile owner chooses to stay hidden:

- Real profile remains hidden.
- Chat can still continue unless blocked.
- Do not use "Rejected" or "Denied."

Allowed copy:
- Profile stayed hidden for now
- You can keep chatting

### Profile Revealed State
If the profile owner reveals the profile:

- Chat shows a calm system message.
- A profile preview card appears.
- User can open full profile.
- User can return to Chat easily.

Allowed copy:
- Profile revealed
- You can now view this profile
- Back to chat

## Chat Header Rules

Before reveal, header shows:

- Blurred avatar
- Hidden profile label
- Short helper text
- Safety/menu button

After reveal, header may show:

- Clear avatar
- Name
- Profile access shortcut
- Safety/menu button

Header must not expose identity before grant.

## Voice Message Flow

### Voice Recording
Voice recording happens inside Chat.

Recording states:
- Idle
- Recording
- Locked recording
- Preview
- Sent
- Failed

Recording UI must support:
- Hold to record
- Release to send
- Slide left to cancel
- Slide up to lock
- Send
- Redo
- Delete

### Voice Message Rules
MVP voice message rules:

- Maximum duration: 21 seconds
- Daily send limit: 7 per user
- Same-recipient daily limit: 3
- Limits must be enforced server-side
- UI may show remaining limits but cannot be the only enforcement layer

### Voice Bubble Content
Voice message bubble should include:

- Play / pause
- Waveform
- Duration
- Sent status
- Listened status

Optional:
- Tiny transcript hint later

Text must not dominate voice.

## Chat Actions

Chat primary actions:

- Send voice message
- Listen to voice message
- Request profile visibility
- Open revealed profile
- Return from profile
- Report
- Block
- Mute notifications / future option

Secondary or future actions:
- Short text/system messages
- Reactions
- Saved voice

Written chat must not become the MVP's main interaction.

## Profile Reveal Request Flow Inside Chat

### Sender Side
User wants to see hidden profile.

Flow:
1. User taps "I want to see your profile."
2. Optional voice note can be attached later.
3. Request card appears inside Chat.
4. Status becomes waiting.
5. User waits for owner decision.

### Owner Side
Profile owner receives request inside Chat or request area.

Available decisions:
- Reveal my profile
- Decide later
- Stay hidden

Do not use:
- Rejected
- Denied
- Access refused

### Reveal Logic
UI wording must follow product logic:

approved request + active profile visibility grant + no active block = profile visible

Request approval alone is not enough.

## Block and Safety Rules in Chat

Chat must provide access to safety actions.

Safety menu options:
- Mute notifications
- Hide this person
- Report
- Block

Block must prevent:
- New voice messages
- Profile reveal requests
- Profile viewing
- Existing visibility grant usage
- Signed media URL access where applicable

After block:
- Existing Chat may remain in history if needed
- Interaction actions must be disabled
- Profile access must close

## Backend Behavior Notes
These are product-behavior notes, not implementation code.

Chat backend must support:

- Creating or finding a chat/thread from Discover profile tap
- Creating or finding a chat/thread from Instant Content Detail
- Sending voice message in chat context
- Enforcing 21-second duration limit
- Enforcing daily 7 voice limit
- Enforcing same-recipient 3 voice limit
- Creating profile reveal request inside chat context
- Showing request states safely
- Checking active profile visibility grant before showing profile
- Checking block before voice send, reveal request, profile view, and signed URL access
- Avoiding sender_user_id / owner_user_id leaks to frontend
- Returning safe chat DTOs instead of raw database rows

## Frontend Visibility Rules

Before reveal, Chat frontend may show:

- chat_id / anonymous thread id
- blurred avatar token
- anonymous label
- voice message metadata
- signed media URL if allowed
- reveal request state
- listened state
- safe system messages

Before reveal, Chat frontend must not show:

- sender_user_id
- owner_user_id
- real profile id if unsafe
- raw storage path
- real name
- clear avatar
- exact age
- exact city
- private moderation fields

## Test Lab Scenarios

Test Lab must include Chat scenarios:

### Scenario 1: Discover to Chat
Expected:
- Tap blurred profile
- Chat opens
- Real profile hidden
- Voice send available

### Scenario 2: Feed to Detail to Chat
Expected:
- Tap Feed tile
- Content detail opens
- Chat CTA opens Chat
- Owner identity hidden

### Scenario 3: Voice Limit
Expected:
- 21-second voice allowed
- Over 21 seconds denied
- 7 daily limit enforced
- 3 same-recipient limit enforced

### Scenario 4: Profile Request
Expected:
- Request created inside Chat
- Profile remains hidden
- Status visible safely

### Scenario 5: Decide Later
Expected:
- Request stays pending/later
- Profile hidden
- Chat can continue

### Scenario 6: Stay Hidden
Expected:
- Profile remains hidden
- No harsh rejected language
- Chat can continue unless blocked

### Scenario 7: Profile Revealed
Expected:
- Grant exists
- No block exists
- Profile preview appears
- Full profile can open
- Chat bubble returns to same Chat

### Scenario 8: Block Override
Expected:
- Block disables voice send
- Block disables profile request
- Block disables profile view
- Block disables signed URL where applicable

### Scenario 9: Leak Check
Expected frontend must not receive:
- sender_user_id
- owner_user_id
- raw_storage_path
- hidden profile details before grant

## Out of Scope for MVP Chat

Do not include in MVP Chat:

- Full text-first messaging system
- Group chats
- Canlı oda sistemi
- Voice calls
- Video calls
- Read receipt complexity beyond simple listened state
- Heavy reactions system
- Public comments
- Dating match mechanics

## Success Criteria

Chat flow is successful if:

1. Discover opens Chat without recipient picker.
2. Feed opens Detail, then Chat.
3. Voice messages are sent from Chat.
4. Chat stays voice-first.
5. Profile stays hidden before permission.
6. Profile request happens inside Chat.
7. Owner decision is calm and controlled.
8. Profile reveal requires valid visibility grant.
9. Block overrides chat/profile access.
10. Safety actions are accessible.
11. Frontend receives only safe chat data.
12. Test Lab can verify all critical Chat flows.

## Notes
Chat is the product center of ankion.

If a feature does not strengthen voice-first anonymous trust-building, it should be deferred.


