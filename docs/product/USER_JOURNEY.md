# USER_JOURNEY.md

## Purpose

Document the end-to-end ankion user journey across onboarding, discovery, instant content, chat, voice messaging, reveal requests, privacy states, safety actions, and future promotional video planning.

This document explains how the app feels and behaves when a real user opens ankion and moves through the product.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Scope

This file covers:

- First launch and account creation.
- Real profile creation.
- Anonymous discovery.
- Discover-to-Chat flow.
- Feed-to-Instant-Detail-to-Chat flow.
- Voice-first messaging.
- Reveal request and reveal decision flow.
- Hidden, pending, revealed, blocked, and safe fallback states.
- Anonymous instant media behavior.
- User-facing emotional tone.
- Promotional/reklam video narrative basis.
- Test Lab coverage expectations.

This file does not define:

- UI implementation code.
- Database schema.
- RLS SQL.
- Storage bucket setup.
- Framework initialization.
- Package setup.

---

# Product Journey Summary

ankion starts with a simple emotional promise:

```txt
Start hidden. Connect through voice. Reveal only with trust.
```

The user creates a real account and real profile, but the app does not expose the real profile during first contact.

The user discovers people or anonymous instant content, enters a conversation, sends a short voice message, and later decides whether real profile visibility should open.

The core journey is not:

```txt
profile -> like -> match -> text chat
```

The core journey is:

```txt
anonymous curiosity -> short voice -> trust signal -> optional reveal
```

---

# Primary User Types

## 1. Sender

The sender is the user who starts contact by sending a voice message.

The sender may:

- Discover someone.
- Open Chat directly.
- Send a short anonymous voice message.
- Receive a profile reveal request.
- Approve reveal.
- Stay hidden.
- Decide later.
- Block/report if needed.

## 2. Recipient

The recipient is the user who receives an anonymous voice message.

The recipient may:

- Listen to the voice message.
- Continue the conversation.
- Request to see the sender's profile.
- Wait for approval.
- See the profile only if approved grant exists and no block is active.
- Block/report if needed.

## 3. Instant Content Viewer

The viewer discovers anonymous photo/video/audio content in the Feed.

The viewer may:

- Tap an instant tile.
- Open Instant Content Detail.
- Follow the anonymous instant profile.
- Send a voice message from the detail context.
- Request real profile reveal later through Chat.

## 4. Instant Content Uploader

The uploader posts anonymous instant content.

The uploader may:

- Share instant photo, video, or audio.
- Keep real profile hidden.
- Build anonymous media following.
- Receive voice contact from viewers.
- Reveal real profile only by explicit permission.

---

# Journey Principles

## JP-001 â€” Real Profile Exists, But Starts Hidden

Users create real profiles so the system has accountability and future reveal value.

However, the real profile is not visible during first interaction.

## JP-002 â€” Chat Is The Core Interaction Hub

All meaningful interaction converges into Chat:

- Voice sending.
- Listening.
- Reveal request.
- Reveal decision.
- Safety actions.
- Remaining voice limit feedback.

## JP-003 â€” Voice Creates Curiosity

The first strong human signal is a short voice.

The app should feel like:

```txt
I do not know who this is yet, but their voice made me curious.
```

## JP-004 â€” Reveal Requires Trust

Real profile visibility is a controlled moment, not an automatic consequence.

Required formula:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

## JP-005 â€” Calm Emotional Language

User-facing copy should avoid harsh labels.

Use:

- Still private.
- Stay hidden.
- Decide later.
- Profile not visible yet.
- Waiting for permission.
- You can keep this private.

Avoid:

- Rejected.
- Denied.
- Failed.
- Blocked by system.
- Access forbidden.

---

# End-To-End Journey

## Stage 1 â€” First Launch

### User Goal

Understand what ankion is and why it feels different.

### Screen

Welcome / Intro screen.

### User Sees

- Dark-first premium visual mood.
- Short emotional product promise.
- Clear explanation that first contact is anonymous.
- Voice-first positioning.
- A calm CTA to create account or sign in.

### Example Copy

```txt
Start hidden.
Connect through voice.
Reveal only with trust.
```

### Required Behavior

- Do not suggest dating-style swiping.
- Do not expose public profile browsing as the main hook.
- Do not overexplain security in a scary way.

### Backend Notes

- No backend identity exposure happens at this screen.
- No media access required.

### Test Lab Coverage

- Intro copy does not imply public profile exposure.
- UI does not use dating-app language.

---

## Stage 2 â€” Account Creation

### User Goal

Create a real account safely.

### Screen

Sign up / login screen.

### User Sees

- Email/phone/social auth direction depending on final implementation.
- Simple trust explanation:
  - real account is required
  - first interactions remain anonymous
  - profile reveal stays under user control

### Required Behavior

- Account creation must not publish the profile.
- User should understand that anonymity is an interaction state, not fake-account chaos.

### Backend Notes

- Supabase Auth direction.
- Internal auth identity must not be exposed to public frontend DTOs.
- `auth_user_id` must be protected.

### Test Lab Coverage

- Auth identity never appears in visible UI payloads.
- Debug output does not expose `auth_user_id`.

---

## Stage 3 â€” Real Profile Setup

### User Goal

Prepare the profile that may later be revealed with permission.

### Screen

Profile setup screen.

### User Adds

- Display name or profile name.
- Avatar/profile media if allowed.
- Short bio or basic profile fields.
- Optional preferences depending on future scope.

### Required Behavior

- The user must understand this real profile is not automatically public.
- Real profile remains hidden in Discover/Feed first-contact states.
- Real profile can become visible only through permission-based reveal.

### Safe Copy

```txt
Your real profile stays private until you choose to show it.
```

### Backend Notes

- Real profile fields must be stored separately from anonymous discovery/instant identity.
- Frontend should later consume safe profile DTOs.

### Test Lab Coverage

- Real profile fields are hidden before reveal.
- Hidden state does not expose owner IDs or private fields.

---

## Stage 4 â€” Home Entry

### User Goal

Choose how to discover people or content.

### Screen

Home shell / main navigation.

### Primary Tabs

- Discover
- Feed
- Chat
- Profile

### Required Behavior

- Chat must feel central.
- Discover and Feed are entry points into Chat, not disconnected features.
- Profile is personal control space, not public exposure by default.

### Do Not Add

- Separate recipient picker.
- Generic inbox-first cold messaging.
- Swipe-match mechanics.

### Test Lab Coverage

- Navigation routes match approved MVP flow.
- Discover and Feed both lead toward Chat paths.

---

# Discover Journey

## Stage 5 â€” Discover Screen

### User Goal

Find someone interesting without seeing their full real identity.

### Screen

Discover.

### User Sees

- Premium anonymous profile cards.
- Blurred or partially hidden identity presentation.
- Voice-first CTA.
- Curiosity-based microcopy.
- No full real profile details before permission.

### Interaction

User taps a Discover card.

### Required Result

The app opens Chat directly with that anonymous profile context.

```txt
Discover Card -> Chat
```

### Required Behavior

- No recipient picker.
- No full profile reveal.
- No sender/owner IDs in frontend.
- No real profile fields before grant.

### Safe UI Data

Use safe concepts such as:

- `safe_discover_profile`
- anonymous display label
- safe avatar/blurred media state
- reveal availability state
- safe interaction status

### Test Lab Coverage

- Discover card tap opens Chat.
- Real profile is hidden.
- Raw identity fields do not leak.

---

## Stage 6 â€” Discover-To-Chat Transition

### User Goal

Start contact quickly.

### Screen

Chat opens from Discover.

### User Sees

- Anonymous recipient context.
- Voice recorder.
- Remaining daily voice count if relevant.
- Calm privacy note.
- Empty or new conversation state.

### Example Copy

```txt
Send a short voice. Your profile stays hidden.
```

### Required Behavior

- Chat thread can be created or loaded.
- Voice recording is the primary action.
- User does not manually select the recipient.
- Context comes from the tapped Discover card.

### Backend Notes

- Thread creation must use server-side identity.
- Frontend must not manually pass unsafe `sender_user_id` or `recipient_user_id` as trusted authority.
- Server validates participants and limits.

### Test Lab Coverage

- Chat opens from Discover with correct anonymous context.
- Voice send button respects limits.
- Unsafe IDs do not appear in UI payload.

---

# Feed / Instant Journey

## Stage 7 â€” Feed Screen

### User Goal

Explore anonymous instant media.

### Screen

Feed.

### User Sees

A 3-column grid containing:

- photo tiles
- video tiles
- audio tiles

### Required Behavior

- Instant media is part of MVP.
- Feed tile opens Instant Content Detail.
- Real profile remains hidden.
- Instant profile is separate from real profile.

```txt
Feed Tile -> Instant Content Detail
```

### Do Not Add

- Live tab in MVP.
- Real profile preview from instant tile.
- Owner identity leak in tile data.

### Safe UI Data

Use safe concepts such as:

- `safe_feed_tile`
- instant media type
- anonymous instant profile label
- safe thumbnail/signed URL reference
- safe engagement state

### Test Lab Coverage

- Feed renders 3-column grid.
- Photo/video/audio tiles exist.
- Tile data does not expose `owner_user_id`.
- Tile data does not expose raw storage paths.

---

## Stage 8 â€” Instant Content Detail

### User Goal

View anonymous instant content and decide whether to interact.

### Screen

Instant Content Detail.

### User Sees

- Selected photo/video/audio content.
- Anonymous instant profile identity.
- Follow button for instant profile.
- Voice/contact CTA leading to Chat.
- Optional â€œshow my profileâ€ intent later in Chat context.

### Required Behavior

- Instant follow does not reveal real profile.
- Instant media does not reveal real profile.
- Detail opens Chat when user wants to interact.
- Reveal request is handled inside Chat, not directly from public feed.

```txt
Instant Content Detail -> Chat
```

### Backend Notes

- Signed URL generation must check access.
- Raw storage path is never returned.
- Real profile owner ID is not exposed.
- Block must prevent access where applicable.

### Test Lab Coverage

- Detail page does not reveal real profile.
- Instant follow does not reveal real profile.
- Chat opens from Detail.
- Storage path leak test passes.

---

## Stage 9 â€” Instant Profile Follow

### User Goal

Follow an anonymous media identity without forcing real identity reveal.

### Screen

Instant Content Detail or Instant Profile surface.

### User Sees

- Follow/unfollow action.
- Anonymous media identity.
- No real profile fields.

### Required Behavior

- Follow creates relationship with instant profile only.
- It must not grant real profile visibility.
- Follower-view package or coin feature later must not reveal real profile.

### Test Lab Coverage

- Follow state changes.
- Real profile remains hidden.
- Coin/follower entitlement cannot reveal real profile.

---

# Chat / Voice Journey

## Stage 10 â€” Chat Screen

### User Goal

Communicate through short voice messages.

### Screen

Chat.

### User Sees

- Anonymous conversation header.
- Voice message timeline.
- Voice recorder.
- Remaining count indicator.
- Reveal request action.
- Safety actions.

### Primary Actions

- Record voice.
- Send voice.
- Listen to received voice.
- Request profile reveal.
- Decide reveal request.
- Block/report.

### Required Behavior

- Voice-first interaction remains central.
- Text must not become the main MVP behavior.
- UI may support system copy and state notes, but voice is the core contact medium.

### Test Lab Coverage

- Voice recorder appears.
- Voice send respects 21-second limit.
- Daily limit and same-recipient limit states are visible.
- Limit logic cannot be bypassed by UI-only changes.

---

## Stage 11 â€” Voice Recording

### User Goal

Record and send a short anonymous voice message.

### Screen

Chat voice composer.

### Rules

- Maximum duration: 21 seconds.
- Daily send limit: 7.
- Same-recipient daily send limit: 3.
- Server-side enforcement required.

### User Sees

- Recording timer.
- Stop/send controls.
- Remaining send count.
- Calm limit warning when needed.

### Example Copy

```txt
You have 2 voice sends left for this conversation today.
```

### Required Behavior

- Recording stops or blocks after duration limit.
- Send request is validated server-side.
- UI cannot be trusted as source of truth.

### Backend Notes

- Store media in private storage.
- Use safe non-identifying storage path.
- Do not expose raw storage path.
- Generate signed URL only after access check.

### Test Lab Coverage

- 21-second max state.
- 7 daily sends state.
- 3 same-recipient sends state.
- Limit exhausted state.
- Raw media path not visible.

---

## Stage 12 â€” Receiving And Listening To Voice

### User Goal

Listen to an anonymous voice and decide whether curiosity exists.

### Screen

Chat message timeline.

### User Sees

- Voice bubble.
- Anonymous speaker state.
- Playback control.
- Optional reveal request CTA after listening.

### Required Behavior

- The voice can create curiosity.
- Real profile remains hidden.
- The recipient can request profile reveal later as long as rules allow it.

### Important Rule

The recipient does not have to request profile reveal immediately. They can return later and request reveal if:

- the message still exists
- users are not blocked
- no final rejected/approved request rule prevents it
- product rules allow another request state

### Test Lab Coverage

- Voice can be replayed.
- Reveal request can happen later.
- Hidden profile stays hidden before grant.

---

# Reveal Journey

## Stage 13 â€” Request Profile Reveal

### User Goal

Ask to see who sent the voice.

### Screen

Chat.

### User Action

Tap a calm reveal request button.

### Example Copy

```txt
Iâ€™d like to see your profile.
```

or Turkish product copy:

```txt
Profilini gÃ¶rmek istiyorum.
```

### Required Behavior

- Request is sent to the profile owner.
- Request does not reveal profile by itself.
- Request state is shown calmly.
- No harsh rejection copy.

### Backend Notes

- Create reveal request state.
- Do not create profile visibility grant until owner approves.
- Do not expose requester/recipient IDs in unsafe DTOs.

### Test Lab Coverage

- Request created.
- Profile still hidden after request.
- Approved request without grant still does not reveal profile.

---

## Stage 14 â€” Sender Receives Reveal Request

### User Goal

Decide whether to reveal real profile.

### Screen

Chat or notification leading to Chat.

### User Sees

- Calm request card.
- Context from voice conversation.
- Options:
  - show profile
  - stay hidden
  - decide later

### Required Behavior

- Decision must feel safe and pressure-free.
- â€œStay hiddenâ€ should not feel like failure.
- â€œDecide laterâ€ keeps privacy intact.

### Safe Copy

```txt
Theyâ€™re curious about your profile. You can show it, stay hidden, or decide later.
```

### Test Lab Coverage

- Request card appears.
- Decide later keeps profile hidden.
- Stay hidden keeps profile hidden.
- Show profile creates proper visibility grant.

---

## Stage 15 â€” Reveal Approved

### User Goal

Allow the other person to see real profile.

### Screen

Chat / profile reveal state.

### Required Formula

```txt
approved request + active profile visibility grant + no active block = profile visible
```

### User Sees

- Profile becomes visible only after grant exists.
- Chat header/profile state updates.
- Calm confirmation.

### Required Behavior

- Approval must create or activate a profile visibility grant.
- UI must not reveal based only on local state.
- Block overrides grant.

### Backend Notes

- Safe profile view should be returned only after access check.
- Hidden fields remain hidden if grant is missing.
- Signed profile media URLs require access check.

### Test Lab Coverage

- Approved request without grant fails to reveal.
- Grant reveals profile.
- Block after grant hides profile again.
- Sensitive fields still do not leak.

---

## Stage 16 â€” Reveal Not Approved / Stay Hidden

### User Goal

Keep identity private.

### Screen

Chat reveal state.

### User Sees

Calm privacy-preserving copy.

### Example Copy

```txt
Profile is still private.
```

or

```txt
They chose to stay hidden for now.
```

### Required Behavior

- Do not use â€œRejected.â€
- Do not shame the user.
- Do not expose real profile.
- Allow product-defined future request behavior if not permanently closed.

### Test Lab Coverage

- Stay hidden state does not reveal profile.
- UI copy uses calm wording.
- Raw reveal internals do not leak.

---

## Stage 17 â€” Block Override

### User Goal

Stop unwanted interaction.

### Screen

Chat / safety sheet / profile safety action.

### Required Behavior

An active block overrides:

- profile visibility grant
- reveal request state
- media access where applicable
- signed URL generation where applicable
- chat continuation where applicable

### User Sees

Calm safety state, not internal enforcement details.

### Backend Notes

- Every safe view/RPC must check block state where relevant.
- Storage signed URL access must respect block state.
- Notifications must not leak identity after block.

### Test Lab Coverage

- Block overrides existing grant.
- Block prevents signed URL access where applicable.
- Blocked state does not expose sensitive IDs.

---

# Profile Journey

## Stage 18 â€” Own Profile Screen

### User Goal

Manage identity, visibility, and personal presence.

### Screen

Profile.

### User Sees

- Own real profile.
- Editing controls.
- Privacy explanation.
- Top-right floating chat bubble.
- Possibly instant profile/media management depending on final scope.

### Required Behavior

- User can see their own profile.
- Other users cannot see this profile unless reveal formula passes.
- Chat bubble is present as required design element.

### Test Lab Coverage

- Own profile visible to owner.
- Other viewer sees hidden state unless grant exists.
- Chat bubble exists.

---

## Stage 19 â€” Viewing Someone Elseâ€™s Profile Before Reveal

### User Goal

Understand that profile is private.

### Screen

Safe Profile View / hidden profile state.

### User Sees

- Hidden profile presentation.
- Calm prompt to connect through voice.
- No real identity fields.
- No raw metadata.

### Required Behavior

- Show only safe placeholder data.
- Do not leak real name, avatar, bio, location, IDs, media paths, or internal grant state.

### Test Lab Coverage

- Before reveal, real profile fields are absent.
- No sensitive IDs are present in frontend payload.
- No storage path is present.

---

## Stage 20 â€” Viewing Someone Elseâ€™s Profile After Reveal

### User Goal

See profile after trust is established.

### Screen

Safe Profile View / revealed profile state.

### Required Behavior

Profile is visible only if:

```txt
approved request + active profile visibility grant + no active block
```

### User Sees

- Approved real profile fields.
- Safe media URLs.
- Chat continuation path.
- Safety actions.

### Backend Notes

- Return `safe_profile_view`, not raw profile row.
- Hide fields that are not intended for public reveal.
- Signed URLs must be generated with access checks.

### Test Lab Coverage

- Revealed profile shows only safe fields.
- Raw IDs and storage paths remain hidden.
- Block reverses access.

---

# Notification Journey

## Stage 21 â€” Reveal Request Notification

### User Goal

Know someone requested profile visibility without exposing identity unsafely.

### Required Behavior

- Notification can say someone is curious.
- Notification should lead to Chat.
- Notification must not reveal hidden profile details.
- Notification must not include unsafe internal IDs.

### Example Copy

```txt
Someone wants to see your profile after hearing your voice.
```

### Test Lab Coverage

- Notification copy is safe.
- No sender/recipient ID leak.
- Tap opens safe Chat context.

---

## Stage 22 â€” Voice Received Notification

### User Goal

Return to the voice message.

### Required Behavior

- Notification should preserve anonymity.
- Tap opens Chat.
- No real profile reveal in notification preview.

### Example Copy

```txt
You received a new voice.
```

### Test Lab Coverage

- Notification does not reveal sender identity.
- Tap opens Chat with safe anonymous state.

---

# Safety / Report Journey

## Stage 23 â€” Report

### User Goal

Report unsafe content or behavior.

### Screen

Safety sheet / report flow.

### Required Behavior

- Reports must not expose reporter identity to reported user.
- Report metadata must remain private.
- Moderation internals must not be returned to normal frontend views.

### Test Lab Coverage

- Report submitted.
- Reported user does not see reporter identity.
- Moderation fields are not exposed.

---

## Stage 24 â€” Delete / Remove Content

### User Goal

Remove own content or stop visibility.

### Required Behavior

- Deleted or unavailable content must not continue enabling reveal flows.
- Media access should stop where applicable.
- UI should show calm unavailable state.

### Test Lab Coverage

- Deleted voice cannot be used to bypass reveal rules.
- Deleted instant content does not expose stale media URL.
- Signed URLs expire or become invalid according to access rules.

---

# Promotional / Reklam Video Narrative Basis

This section can be used later to design an advertising or promotional video.

## Video Concept

A person opens ankion at night. The interface is dark, cinematic, quiet, and premium.

They see anonymous people and moments, not full profiles.

They tap one.

A chat opens.

They send a 21-second voice.

Someone listens.

Curiosity forms.

The recipient taps:

```txt
Profilini gÃ¶rmek istiyorum.
```

The sender receives the request.

They pause.

They can choose:

- show profile
- stay hidden
- decide later

The product message appears:

```txt
Start hidden. Connect through voice. Reveal only with trust.
```

## Video Flow

### Scene 1 â€” Dark App Opening

- Phone screen in dark environment.
- ankion logo.
- Soft cinematic motion.
- No dating-app visuals.

### Scene 2 â€” Anonymous Discovery

- Discover cards appear.
- Identity is intentionally hidden.
- Voice-first CTA is visible.

### Scene 3 â€” First Voice

- User taps a card.
- Chat opens directly.
- Voice recorder starts.
- 21-second timer appears.

### Scene 4 â€” Listening Moment

- Recipient sees anonymous voice.
- Taps play.
- UI feels intimate, calm, and respectful.

### Scene 5 â€” Curiosity

- Button appears:
  - `Profilini gÃ¶rmek istiyorum`
- Request is sent.

### Scene 6 â€” Permission Moment

- Sender receives request.
- Options:
  - show profile
  - stay hidden
  - decide later

### Scene 7 â€” Trust-Based Reveal

- If approved, profile appears softly.
- If not, hidden state remains calm.
- No harsh rejection.

### Scene 8 â€” Closing Line

```txt
ankion
Start hidden. Connect through voice. Reveal only with trust.
```

---

# Screen-by-Screen Journey Map

| Step | Screen | Entry | Main Action | Exit | Real Profile State |
| --- | --- | --- | --- | --- | --- |
| 1 | Welcome | App launch | Understand product | Sign up / login | Hidden |
| 2 | Auth | Welcome | Create account | Profile setup | Hidden |
| 3 | Profile Setup | Auth | Create real profile | Home | Hidden |
| 4 | Discover | Home | Tap anonymous card | Chat | Hidden |
| 5 | Feed | Home | Tap instant tile | Instant Detail | Hidden |
| 6 | Instant Detail | Feed | View / follow / contact | Chat | Hidden |
| 7 | Chat | Discover or Detail | Send/listen voice | Reveal request or continue | Hidden |
| 8 | Reveal Request | Chat | Request profile | Waiting state | Hidden |
| 9 | Reveal Decision | Chat/Notification | Show/stay/decide later | Revealed or hidden | Conditional |
| 10 | Revealed Profile | Approved grant | View safe profile | Continue chat | Visible only with grant + no block |
| 11 | Blocked State | Safety action | Block | Access restricted | Hidden |
| 12 | Own Profile | Main nav | Edit/manage | Chat/Home | Owner can view |

---

# Required Safe DTO Concepts

The journey should be supported by safe frontend-facing concepts such as:

- `safe_discover_profile`
- `safe_feed_tile`
- `safe_instant_content_detail`
- `safe_chat_summary`
- `safe_chat_room`
- `safe_voice_message`
- `safe_reveal_request_state`
- `safe_profile_view`
- `safe_notification`

These are conceptual names at this planning stage. They are not implementation code yet.

---

# Journey-Level Never-Leak Fields

The user journey must never require frontend exposure of unsafe fields such as:

- `auth_user_id`
- `sender_user_id`
- `owner_user_id`
- `profile_owner_user_id`
- `viewer_user_id`
- `requester_user_id`
- `recipient_user_id`
- `blocker_user_id`
- `blocked_user_id`
- `reporter_user_id`
- `reported_user_id`
- `raw_storage_path`
- `storage_path`
- bucket internals
- moderation internals
- hidden real profile fields before reveal
- raw grant internals
- raw reveal internals where unsafe

---

# Test Lab Journey Coverage

The Test Lab must visually verify this user journey with fake data.

## Minimum Required Journey Tests

- Welcome and product promise copy.
- Discover-to-Chat.
- Feed-to-Detail-to-Chat.
- Hidden profile before reveal.
- Voice recording max duration.
- Daily voice send limit.
- Same-recipient voice send limit.
- Voice received and replay state.
- Reveal request created.
- Approved request without grant still hidden.
- Grant reveals profile.
- Stay hidden keeps profile hidden.
- Decide later keeps profile hidden.
- Block overrides grant.
- Instant follow cannot reveal real profile.
- Coin/follower entitlement cannot reveal real profile.
- Signed URL access does not expose raw storage path.
- Sensitive ID leak check.
- Notification privacy check.
- Report privacy check.
- Production guard disables Test Lab.

---

# Success Criteria

The user journey is successful if:

- A first-time user understands ankion in under 10 seconds.
- The user can move from Discover to Chat without a recipient picker.
- The user can move from Feed to Instant Detail to Chat.
- Voice feels like the primary emotional interaction.
- Real profile visibility feels controlled and permission-based.
- Hidden states feel calm, not punitive.
- Instant media adds discovery without exposing real identity.
- Reveal logic cannot be bypassed by UI state, follow state, coins, or old requests.
- The app feels premium, dark-first, mobile-native, and not like a dating app.
- The journey can be demonstrated later as a promotional video.

---

# Current Status

This document is ready for final documentation review.

Implementation must not start from this document alone.

Before implementation:

1. Complete final documentation review.
2. Run final deep analysis.
3. Confirm implementation gate.
4. Prepare only the first tiny setup task.
5. Get explicit user approval.

