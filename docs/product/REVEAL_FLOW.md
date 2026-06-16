# REVEAL_FLOW.md

## Purpose
This document defines the profile reveal flow for ankion.

Reveal is one of the most critical product and privacy flows in ankion. It controls when a hidden real profile becomes visible to another user.

## Status
Approved product flow direction.

## Source Documents
This document follows:
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/product/CHAT_FLOW.md
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md

## Core Principle
Real profile visibility is permission-based.

Users start hidden, connect through voice, and reveal their profile only when they choose.

Correct logic:

approved request + active profile visibility grant + no active block = profile visible

Important:
- Request approval alone is not enough.
- UI status alone is not enough.
- Active visibility grant is required.
- Block overrides visibility.

## Reveal Flow Summary

The reveal flow happens inside Chat.

Flow:

1. User discovers someone through Discover or Feed.
2. Chat opens in hidden profile state.
3. User sends or receives voice messages.
4. User taps "I want to see your profile."
5. Profile owner receives the request.
6. Profile owner chooses:
   - Reveal my profile
   - Decide later
   - Stay hidden
7. If revealed, active visibility grant is created.
8. If no active block exists, profile becomes visible.
9. If blocked later, profile access closes.

## Reveal Entry Points

### 1. From Chat
Primary reveal request starts inside Chat.

User action:
- Tap "I want to see your profile."

Expected result:
- Reveal request is created in the chat context.
- Real profile remains hidden until owner decision and valid grant.

### 2. From Discover-to-Chat
User taps blurred Discover profile card.

Expected result:
- Chat opens directly.
- Real profile remains hidden.
- User can request profile visibility from Chat.

### 3. From Feed-to-Detail-to-Chat
User taps Feed tile, then opens Chat from Instant Content Detail.

Expected result:
- Content owner identity remains hidden.
- Chat opens in anonymous context.
- User can request profile visibility from Chat.

### 4. From Revealed Profile
After reveal, full profile screen includes a top-right floating chat bubble.

Expected result:
- Chat bubble returns to existing Chat.
- It must not create a duplicate chat.
- It must not bypass visibility checks.

## Reveal Actors

### Requester
The requester is the user who wants to see another person's real profile.

Requester can:
- Send profile reveal request
- Wait for decision
- Continue chatting while hidden
- View profile only after valid grant
- Report or block if needed

Requester cannot:
- Force profile visibility
- Use coins to reveal real profile
- Bypass owner decision
- View profile after block
- Access hidden identity fields

### Profile Owner
The profile owner controls whether their real profile becomes visible.

Owner can:
- Reveal profile
- Decide later
- Stay hidden
- Continue chatting
- Block requester
- Report requester

Owner cannot:
- Accidentally reveal real profile through Feed or Discover
- Reveal profile without explicit action
- Be forced by payment/coin/engagement

## Reveal States

### 1. No Request
Default state.

Profile is hidden.

Allowed UI copy:
- Hidden profile
- Profile opens only with permission
- Connect through voice first

### 2. Request Sent
Requester has sent a reveal request.

Profile remains hidden.

Allowed UI copy:
- Profile request sent
- Waiting for response
- You'll see the response here when they decide

### 3. Decide Later
Owner chooses not to decide now.

Profile remains hidden.

Allowed UI copy:
- Waiting for response
- The request will stay inside this chat
- You can keep chatting

### 4. Stay Hidden
Owner chooses to keep profile hidden.

Profile remains hidden.

Allowed UI copy:
- Profile stayed hidden for now
- You can keep chatting
- Profile is not visible right now

Do not use:
- Rejected
- Denied
- Access refused
- Blocked from viewing
- Permission failed

### 5. Revealed
Owner reveals their profile.

Profile becomes visible only if:
- active visibility grant exists
- no active block exists

Allowed UI copy:
- Profile revealed
- You can now view this profile
- Back to chat

### 6. Blocked After Reveal
If either user blocks the other after reveal:

Expected result:
- Profile visibility closes
- Existing grant is no longer usable
- Signed media access is disabled where applicable
- Chat actions are disabled where applicable

Allowed UI copy:
- This connection is no longer available
- You will not see this person anymore

Avoid aggressive or overly alarming UI.

## Product Logic

### Approved Request Is Not Enough
The app must not treat request approval alone as profile visibility.

Wrong model:

reveal_request.status = approved
-> profile visible

Correct model:

reveal_request.status = approved
+ active profile_visibility_grant
+ no active block
-> profile visible

## Profile Visibility Grant

A profile visibility grant represents actual permission to view a real profile.

Grant rules:
- Grant is created only when owner chooses to reveal.
- Grant applies only to the specific viewer/owner relationship.
- Grant must not reveal profile globally.
- Grant must not expose profile to unrelated users.
- Grant must stop working if block exists.
- Grant must be checked before showing real profile data.

## Block Override

Block is stronger than reveal.

If block exists:
- Real profile must not be visible.
- Existing grant must not be usable.
- New reveal request must not be created.
- New voice messages must not be sent.
- Signed media URLs must not be generated where applicable.

Block must always override:
- reveal request state
- visibility grant
- chat continuation
- profile view
- media access

## What Can Be Shown Before Reveal

Before valid reveal, frontend may show:

- blurred avatar
- hidden profile label
- anonymous identity label
- voice bio teaser if safe
- interest chips if non-identifying
- chat_id / anonymous thread id
- reveal request state
- safe system messages

Before valid reveal, frontend must not show:

- real name
- clear avatar
- exact age
- exact city
- full bio
- social handles
- real profile id if unsafe
- owner_user_id
- sender_user_id
- raw storage path
- private moderation fields

## What Can Be Shown After Reveal

After valid grant and no block, frontend may show:

- clear avatar
- name
- optional age if allowed
- optional city only if allowed
- bio
- voice bio
- interest chips
- shared content
- profile screen
- top-right chat bubble

Even after reveal, frontend must not show:
- auth user id
- raw storage path
- private moderation fields
- unrelated private identifiers

## Instant Content and Reveal

Instant content does not reveal the real profile automatically.

Rules:
- Instant profile is separate from real profile.
- Feed content may be visible.
- Real profile remains hidden.
- Viewer can open Chat from Instant Content Detail.
- Viewer can send reveal request from Chat.
- Owner decides whether to reveal.
- Coin/follow/engagement must not reveal real profile.

## Coin / Payment Rule

Coins, packages, follower-view, or monetization must not reveal real profile.

Allowed:
- Coin may support future follower-view or secondary features.

Not allowed:
- Coin reveals real profile.
- Coin creates visibility grant.
- Coin bypasses owner decision.
- Coin bypasses block.

## UI Language Rules

Use calm, human, neutral copy.

Good copy:
- Profile request sent
- Waiting for response
- Profile stayed hidden for now
- You can keep chatting
- The choice is yours
- Reveal my profile
- Decide later
- Stay hidden
- Profile revealed

Avoid:
- Rejected
- Denied
- Refused
- Access blocked
- Permission failed
- User rejected you
- You were denied

## Backend Behavior Notes
These are product-behavior notes, not implementation code.

Backend must support:
- Creating reveal request in chat context
- Preventing duplicate active requests
- Letting owner reveal, decide later, or stay hidden
- Creating active visibility grant only after reveal decision
- Checking active grant before profile view
- Checking block before profile view
- Checking block before new reveal request
- Checking block before signed media URL generation where applicable
- Returning safe profile DTOs
- Avoiding owner_user_id / sender_user_id leaks

## Frontend Visibility Rules

Frontend must not decide real profile visibility alone.

Frontend must request a safe profile view result from backend/RPC/view layer.

Frontend should receive:
- visible: true/false
- safe profile fields only if visible
- calm status copy
- allowed actions
- safe chat navigation target

Frontend should not receive:
- raw reveal request internals
- raw visibility grant internals
- raw user ids
- raw storage paths
- sensitive moderation fields

## Test Lab Scenarios

Test Lab must include reveal scenarios.

### Scenario 1: Hidden by Default
Expected:
- Profile hidden before request
- No real name
- No clear avatar
- No raw identity fields

### Scenario 2: Request Sent
Expected:
- Request created in Chat
- Profile remains hidden
- Status shows waiting safely

### Scenario 3: Decide Later
Expected:
- Profile remains hidden
- Request remains available
- Chat can continue

### Scenario 4: Stay Hidden
Expected:
- Profile remains hidden
- No harsh rejected wording
- Chat can continue unless blocked

### Scenario 5: Approved Without Grant
Expected:
- Request status may indicate approval
- But without active grant profile remains hidden
- This must PASS

### Scenario 6: Revealed With Grant
Expected:
- Active grant exists
- No block exists
- Profile becomes visible
- Profile screen includes chat bubble

### Scenario 7: Block After Reveal
Expected:
- Grant exists
- Block exists
- Profile becomes hidden again
- Signed URLs disabled where applicable

### Scenario 8: Coin Cannot Reveal
Expected:
- Coin or entitlement exists
- No visibility grant exists
- Profile remains hidden

### Scenario 9: Instant Content Cannot Reveal
Expected:
- Instant content visible
- Real profile hidden
- Chat reveal request required

### Scenario 10: Leak Check
Expected frontend must not receive:
- owner_user_id
- sender_user_id
- raw_storage_path
- hidden profile details
- grant internals before visibility

## Out of Scope for MVP Reveal

Do not include in MVP:
- Public profile browsing
- Paid real-profile unlock
- Reveal auctions
- Auto reveal after engagement
- AI-based reveal scoring
- Group reveal
- Global reveal status
- Public "rejected" state
- Dating-style match confirmation

## Success Criteria

Reveal flow is successful if:

1. Real profile is hidden by default.
2. User can request reveal inside Chat.
3. Owner can reveal, decide later, or stay hidden.
4. Stay hidden uses calm, non-harsh language.
5. Approval alone does not show profile.
6. Active grant is required.
7. Block overrides grant.
8. Coin cannot reveal profile.
9. Instant content cannot reveal profile directly.
10. Frontend receives only safe profile data.
11. Profile screen has top-right chat bubble after reveal.
12. Test Lab can verify all reveal risks.

## Notes
Reveal is a core trust mechanism of ankion.

If a feature weakens permission-based visibility, it must be deferred.

