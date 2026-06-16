# COMPONENT_SYSTEM.md

## Purpose

Document the approved component system direction for ankion.

This file defines what components the product needs, how they should behave, what privacy/security boundaries they must respect, and how they relate to the approved UI/UX direction.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Design Source References

The component system must stay aligned with:

- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`
- `docs/design/DESIGN_TOKENS.md`
- `docs/design/SCREEN_MAP.md`
- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/security/PRIVACY_MODEL.md`
- `docs/security/SECURITY_RULES.md`

## Important Boundary

This file is not UI implementation code.

Do not create:

- React components
- React Native components
- CSS files
- Tailwind config
- theme objects
- package setup
- framework initialization
- app screens

Implementation must not start from this file alone.

---

# Component System Principles

## CP-001 — Dark-First Premium Mobile UI

Every component must support the dark-first premium visual direction.

Components must feel:

- cinematic
- modern
- mobile-native
- calm
- human
- privacy-respecting

Avoid:

- generic website UI
- dating-app clichés
- loud neon surfaces
- harsh warning cards
- aggressive rejection styling

## CP-002 — Chat Is The Core Surface

Components must reinforce Chat as the central interaction hub.

Discover and Feed components are entry points. Chat components are the core interaction layer.

## CP-003 — Voice Is Primary

Voice recording, playback, waveform, and listening components must have higher product importance than text UI.

Text is allowed for:

- system states
- limits
- calm privacy copy
- buttons
- profile fields
- support/safety flows

Text must not become the main MVP interaction.

## CP-004 — Privacy State Is A First-Class Component Concern

Components must explicitly support:

- hidden
- pending
- revealed
- stay hidden
- decide later
- blocked
- unavailable
- expired
- limit reached

Privacy states must not look like errors unless it is a true safety/destructive state.

## CP-005 — Safe DTO Boundary

Frontend components must be designed to consume safe DTOs, not raw database rows.

Components must not require unsafe fields such as:

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
- raw reveal/grant internals

## CP-006 — Test Lab Compatibility

Key components must be testable in the localhost-only Test Lab with fake data and visual PASS/FAIL states.

---

# Component Inventory Overview

| Group | Component | Purpose | MVP Priority |
| --- | --- | --- | --- |
| App Shell | `AppShell` | Main mobile shell | High |
| App Shell | `BottomTabBar` | Main navigation | High |
| App Shell | `ScreenHeader` | Screen title/action area | High |
| App Shell | `FloatingChatBubble` | Required profile screen chat access | High |
| Onboarding | `WelcomeHero` | Product promise | High |
| Onboarding | `AuthTrustNote` | Explain anonymous-first account model | High |
| Discover | `DiscoverCard` | Anonymous profile entry | High |
| Discover | `HiddenProfilePreview` | Privacy-preserving profile preview | High |
| Discover | `AnonymousSignalBadge` | Curiosity/privacy indicator | Medium |
| Feed | `FeedGrid` | 3-column instant media grid | High |
| Feed | `FeedTile` | Photo/video/audio tile | High |
| Feed | `MediaTypeBadge` | Media type indicator | Medium |
| Instant | `InstantContentViewer` | Detail media viewer | High |
| Instant | `InstantProfileHeader` | Anonymous instant identity | High |
| Instant | `InstantFollowButton` | Follow anonymous instant profile | Medium |
| Chat | `ChatRoom` | Core conversation surface | High |
| Chat | `ChatHeader` | Anonymous/revealed chat identity | High |
| Chat | `VoiceComposer` | Record and send voice | High |
| Chat | `VoiceMessageBubble` | Voice message playback | High |
| Chat | `WaveformPreview` | Voice waveform display | High |
| Chat | `VoiceLimitIndicator` | Daily/same-recipient limit feedback | High |
| Reveal | `RevealRequestButton` | Request profile reveal | High |
| Reveal | `RevealRequestCard` | Incoming reveal request | High |
| Reveal | `RevealDecisionActions` | Show/stay/decide later actions | High |
| Reveal | `RevealStatePill` | Hidden/pending/revealed state | High |
| Profile | `OwnProfileCard` | Owner profile display/edit entry | High |
| Profile | `SafeProfileView` | Hidden or revealed safe profile view | High |
| Profile | `ProfileVisibilityNotice` | Explain privacy state | High |
| Safety | `SafetyActionSheet` | Block/report controls | High |
| Safety | `ReportReasonList` | Report flow reason selection | Medium |
| Notification | `SafeNotificationItem` | Privacy-safe notification row | Medium |
| System | `EmptyState` | Empty screen state | Medium |
| System | `LimitReachedState` | Voice quota exhausted | High |
| System | `UnavailableState` | Deleted/expired/blocked content | High |
| Test Lab | `TestLabCard` | Visual PASS/FAIL verification | High |
| Test Lab | `LeakCheckPanel` | Sensitive field inspection | High |

---

# App Shell Components

## AppShell

### Purpose

Provides the main mobile application frame.

### Used In

- Discover
- Feed
- Chat
- Profile
- Settings later
- Test Lab preview layout

### Required Behavior

- Dark-first background.
- Mobile-native safe area handling.
- Supports bottom navigation.
- Supports screen-level cinematic background.
- Does not expose debug data in production UI.

### States

- default
- loading
- offline later
- test-lab mode later

### Do Not

- Do not turn this into a desktop dashboard.
- Do not include Test Lab controls in production app shell.

---

## BottomTabBar

### Purpose

Primary mobile navigation.

### Tabs

- Discover
- Feed
- Chat
- Profile

### Required Behavior

- Floating/premium bottom bar feel.
- Clear active state.
- Thumb-friendly.
- Dark-first glass/elevated surface.
- Chat should feel important but not visually noisy.

### Do Not

- Do not add unnecessary MVP tabs.
- Do not add a separate Live tab in MVP.
- Do not add a recipient picker tab.

---

## ScreenHeader

### Purpose

Consistent title/action area per screen.

### Used In

- Discover
- Feed
- Chat
- Profile
- Instant Detail
- Test Lab

### Required Behavior

- Supports title, subtitle, optional left/right actions.
- Can display privacy context.
- Should remain compact and mobile-native.

### Do Not

- Do not expose raw IDs in subtitles.
- Do not use internal database labels as user-facing text.

---

## FloatingChatBubble

### Purpose

Required top-right floating chat bubble on the profile screen.

### Used In

- Own Profile
- Safe Profile View when allowed
- Possibly revealed profile state

### Required Behavior

- Size should follow `touch.floatingChat`.
- Opens or returns to Chat.
- Must be visually premium but not intrusive.
- Must not reveal hidden profile state by itself.

### Do Not

- Do not allow this button to bypass reveal rules.
- Do not show real profile data because chat exists.

---

# Onboarding Components

## WelcomeHero

### Purpose

Communicates ankion’s core promise.

### Main Copy Direction

```txt
Start hidden.
Connect through voice.
Reveal only with trust.
```

### Required Behavior

- Dark cinematic visual.
- Short and emotionally clear.
- Voice-first and anonymous-first message.
- No dating-app positioning.

### Do Not

- Do not overexplain with long legal copy.
- Do not show full public profiles as the first visual hook.

---

## AuthTrustNote

### Purpose

Explains why real account exists while first interaction remains anonymous.

### Copy Direction

- Real account is required.
- First contact stays anonymous.
- Real profile is shown only with permission.

### Required Behavior

- Calm, short, trust-building.
- Does not sound scary.
- Does not imply fake/throwaway accounts.

### Do Not

- Do not expose `auth_user_id`.
- Do not use internal auth terminology in user-facing copy.

---

# Discover Components

## DiscoverCard

### Purpose

Anonymous profile entry card that opens Chat directly.

### Safe Input Concept

`safe_discover_profile`

### Required Visible Data

- anonymous display state
- hidden/blurred identity presentation
- optional safe avatar/visual hint
- safe curiosity signal
- voice-first CTA or hint
- privacy/reveal availability state

### Interaction

```txt
Tap DiscoverCard -> Chat
```

### Required Behavior

- Does not open full real profile before reveal.
- Does not open recipient picker.
- Does not expose raw owner/user IDs.
- Must feel premium and human.

### States

- default
- highlighted
- already contacted
- voice limit near limit
- unavailable
- blocked hidden state

### Do Not

- Do not show real name before reveal.
- Do not show real avatar before reveal.
- Do not show location unless explicitly approved later.
- Do not add swipe-match behavior.

---

## HiddenProfilePreview

### Purpose

Shows that a real profile exists but is private.

### Required Behavior

- Uses intentional blur/placeholder.
- Uses calm privacy text.
- Makes hidden state feel intentional, not broken.

### Example Copy

```txt
Profile is private for now.
```

### Do Not

- Do not reveal identifiable facial detail through blur.
- Do not show real profile fields before grant.

---

## AnonymousSignalBadge

### Purpose

Small badge that communicates anonymous-first state.

### Example Labels

- Hidden
- Voice first
- Private for now
- Waiting for trust

### Do Not

- Do not use harsh warning language.
- Do not make anonymity feel suspicious.

---

# Feed Components

## FeedGrid

### Purpose

Displays instant photo/video/audio content in a 3-column grid.

### Safe Input Concept

`safe_feed_tile[]`

### Required Behavior

- Exactly 3-column grid for MVP.
- Dense mobile-native media layout.
- Supports photo, video, and audio tiles.
- Uses safe signed media preview references where appropriate.
- Does not reveal real profile.

### Do Not

- Do not add Live tab behavior.
- Do not show real owner identity.
- Do not expose raw storage paths.

---

## FeedTile

### Purpose

Single Feed item tile.

### Media Types

- photo
- video
- audio

### Interaction

```txt
Tap FeedTile -> InstantContentDetail
```

### Required Behavior

- Shows media type clearly.
- Uses safe thumbnail or audio visual.
- For audio tile, use waveform or sound visual.
- Maintains anonymous instant profile context.

### States

- default
- loading media
- unavailable
- blocked
- expired/deleted
- video preview
- audio preview

### Do Not

- Do not expose `owner_user_id`.
- Do not expose `storage_path`.
- Do not show real profile identity.

---

## MediaTypeBadge

### Purpose

Small visual marker for photo/video/audio type.

### Required Behavior

- Clear but minimal.
- Uses media color tokens.
- Does not dominate tile.

### Labels

- Photo
- Video
- Voice / Audio

---

# Instant Components

## InstantContentViewer

### Purpose

Displays selected instant content detail.

### Safe Input Concept

`safe_instant_content_detail`

### Required Behavior

- Supports photo, video, and audio detail.
- Uses anonymous instant identity.
- Provides path to Chat.
- Shows follow action for anonymous instant profile.
- Keeps real profile hidden.

### Interaction

```txt
InstantContentViewer -> Chat
```

### Do Not

- Do not reveal real profile.
- Do not generate reveal directly from public detail outside Chat.
- Do not show raw media paths.

---

## InstantProfileHeader

### Purpose

Shows anonymous instant profile identity attached to instant content.

### Required Behavior

- Shows instant profile label/avatar/anonymous identity.
- Must be clearly separate from real profile.
- May show follow state.
- Does not imply real identity.

### Do Not

- Do not reuse real profile components unless visibility grant exists.
- Do not show real profile fields.

---

## InstantFollowButton

### Purpose

Allows following anonymous instant profile.

### Required Behavior

- Follow/unfollow instant profile only.
- Does not reveal real profile.
- Does not create profile visibility grant.
- Does not bypass reveal flow.

### States

- follow
- following
- loading
- unavailable
- blocked

### Do Not

- Do not use follow as real profile permission.
- Do not show followers as real user identities unless future entitlement and privacy design allow safe view.

---

# Chat Components

## ChatRoom

### Purpose

Main conversation surface.

### Safe Input Concept

`safe_chat_room`

### Required Behavior

- Central screen for voice messages.
- Contains chat header, message list, voice composer, reveal action, safety actions.
- Supports anonymous and revealed identity states.
- Must remain voice-first.

### Entry Points

- Discover Card
- Instant Content Detail
- Notification
- Existing Chat list
- Profile floating chat bubble where allowed

### Do Not

- Do not require recipient picker.
- Do not expose raw participant IDs.
- Do not let text chat become primary MVP interaction.

---

## ChatHeader

### Purpose

Shows current conversation identity state.

### Safe Data

- anonymous label
- safe profile state
- reveal state
- block/unavailable state
- revealed safe profile summary if allowed

### Required Behavior

- Before reveal: hidden/anonymous state.
- Pending: calm waiting state.
- Revealed: safe profile view entry.
- Blocked: calm unavailable/safety state.

### Do Not

- Do not show real name before reveal grant.
- Do not show unsafe participant IDs.

---

## VoiceComposer

### Purpose

Records and sends short voice messages.

### Rules

- Maximum duration: 21 seconds.
- Daily send limit: 7.
- Same-recipient daily send limit: 3.
- Server-side enforcement required.

### Required Behavior

- Primary action in Chat.
- Shows recording timer.
- Shows remaining count where relevant.
- Prevents obvious over-duration UX.
- Still relies on server validation.

### States

- idle
- recording
- reviewing
- sending
- sent
- limit reached
- disabled by block
- error/unavailable

### Do Not

- Do not trust frontend-only limits.
- Do not upload directly to public storage.
- Do not expose raw storage path after upload.

---

## VoiceMessageBubble

### Purpose

Displays a sent or received voice message.

### Safe Input Concept

`safe_voice_message`

### Required Behavior

- Playback control.
- Waveform.
- Duration.
- Sender state as own/other/system-safe label.
- Does not expose raw sender identity.
- Signed URL must be access-checked.

### States

- own message
- received anonymous
- received revealed
- playing
- paused
- loading
- unavailable
- deleted
- blocked access

### Do Not

- Do not show `sender_user_id`.
- Do not show `storage_path`.
- Do not keep playing media after access is blocked.

---

## WaveformPreview

### Purpose

Visual representation of voice.

### Required Behavior

- Used in voice recording, playback, and audio Feed tiles.
- Supports active/idle/disabled states.
- Feels premium and human.
- Does not imply transcription or AI analysis in MVP.

### Do Not

- Do not show fake diagnostic personality analysis.
- Do not create misleading “emotion detection” visuals.

---

## VoiceLimitIndicator

### Purpose

Shows voice send limits calmly.

### Required Behavior

- Shows daily or same-recipient remaining count where relevant.
- Makes limits understandable.
- Should be based on server-returned safe limit state.

### Example Copy

```txt
You have 2 voice sends left for this conversation today.
```

### States

- remaining
- near limit
- exhausted daily
- exhausted same-recipient
- unavailable

### Do Not

- Do not expose internal quota table fields.
- Do not blame or shame the user.

---

# Reveal Components

## RevealRequestButton

### Purpose

Allows recipient to request real profile visibility from Chat.

### Required Copy

Turkish direction:

```txt
Profilini görmek istiyorum
```

English direction:

```txt
I’d like to see your profile
```

### Required Behavior

- Sends request only.
- Does not reveal profile.
- Shows pending state after request.

### States

- available
- already requested
- waiting
- not available
- blocked
- already revealed

### Do Not

- Do not reveal profile on click.
- Do not place this as public Feed action outside Chat.

---

## RevealRequestCard

### Purpose

Shows incoming reveal request to the profile owner.

### Required Behavior

- Calm request explanation.
- Shows relevant anonymous conversation context.
- Offers decision actions.

### Example Copy

```txt
They’re curious about your profile. You can show it, stay hidden, or decide later.
```

### Do Not

- Do not pressure the owner.
- Do not use aggressive approval/rejection framing.

---

## RevealDecisionActions

### Purpose

Decision controls for profile owner.

### Actions

- Show profile
- Stay hidden
- Decide later

### Required Behavior

- Show profile should create/activate grant through backend.
- Stay hidden keeps profile hidden.
- Decide later keeps profile hidden.
- UI must reflect server state after action.

### Do Not

- Do not treat local button state as grant.
- Do not use “Rejected” or “Denied.”

---

## RevealStatePill

### Purpose

Compact state indicator.

### States

- Hidden
- Waiting
- Still private
- Visible now
- Unavailable
- Blocked

### Required Behavior

- Calm visual state.
- Uses reveal/privacy tokens.
- No harsh language.

---

## ProfileVisibilityGate

### Purpose

Component-level visibility wrapper concept for safe profile display.

### Required Logic Direction

Real profile data may be displayed only when backend-safe state confirms:

```txt
approved request + active profile visibility grant + no active block
```

### Required Behavior

- If not visible, render hidden state.
- If visible, render `SafeProfileView`.
- If blocked, render blocked/unavailable state.
- Must not rely only on client inference.

### Do Not

- Do not pass raw profile row into this component.
- Do not calculate visibility from request approval alone.

---

# Profile Components

## OwnProfileCard

### Purpose

Displays owner’s own real profile.

### Required Behavior

- Owner can view their own profile.
- Editing entry may exist later.
- Shows privacy explanation.
- Includes or coexists with floating chat bubble on Profile screen.

### Do Not

- Do not imply profile is public by default.
- Do not reuse own-profile display for other users without visibility gate.

---

## SafeProfileView

### Purpose

Shows another user’s profile only when safe.

### Safe Input Concept

`safe_profile_view`

### Required Behavior

- Before reveal: hidden placeholder.
- After approved grant and no block: safe real profile fields.
- After block: unavailable/hidden state.
- Uses signed media URLs only after access checks.

### Do Not

- Do not show raw profile table data.
- Do not show hidden fields.
- Do not show storage paths.

---

## ProfileVisibilityNotice

### Purpose

Explains profile visibility state calmly.

### Example Copy

- Your profile is private until you choose to show it.
- Profile is still private.
- You can decide later.
- This profile is visible to you now.

### Do Not

- Do not use legalistic or scary copy.
- Do not use “access denied” for normal privacy state.

---

# Safety Components

## SafetyActionSheet

### Purpose

Shows block/report/safety actions.

### Required Behavior

- Accessible from Chat and Profile contexts where relevant.
- Block must be clear but not visually chaotic.
- Report should be calm and structured.

### Actions

- Block
- Report
- Cancel
- Possibly remove conversation later

### Do Not

- Do not expose reporter identity.
- Do not expose moderation internals.
- Do not use public shame language.

---

## ReportReasonList

### Purpose

Allows selecting report reason.

### Required Behavior

- Uses safe generic options.
- Does not reveal reporter identity.
- Does not show internal moderation codes in user-facing UI.

### Possible Reasons

- Unwanted contact
- Harassment
- Spam
- Unsafe content
- Other

### Do Not

- Do not include raw IDs in confirmation screen.
- Do not expose report state to reported user.

---

# Notification Components

## SafeNotificationItem

### Purpose

Privacy-safe notification row.

### Types

- New voice received
- Reveal request received
- Reveal approved
- Instant profile followed
- Safety/system notice

### Required Behavior

- Must preserve anonymity.
- Opens safe app context.
- Does not reveal hidden real profile details.

### Example Copy

```txt
You received a new voice.
```

```txt
Someone wants to see your profile after hearing your voice.
```

### Do Not

- Do not include hidden real name.
- Do not include unsafe IDs.
- Do not include raw media links.

---

# System Components

## EmptyState

### Purpose

Calm empty screen feedback.

### Used In

- Empty Chat list
- Empty Feed
- Empty Discover
- Empty notifications
- Empty Test Lab section

### Required Behavior

- Short, helpful copy.
- No blame.
- Clear next action where needed.

---

## LimitReachedState

### Purpose

Shows voice limit reached state.

### Required Behavior

- Explains limit calmly.
- Does not blame user.
- Does not imply permanent failure.
- Can tell when they may try again if backend provides safe info.

### Do Not

- Do not expose quota internals.
- Do not allow frontend bypass.

---

## UnavailableState

### Purpose

Shows content/profile/message unavailable.

### Reasons

- deleted
- expired
- blocked
- access changed
- media unavailable

### Required Behavior

- Calm copy.
- No raw internal reason required unless safe.
- Does not leak which exact security rule caused it when unsafe.

---

## PrivacyNote

### Purpose

Small explanatory note for hidden/reveal states.

### Required Behavior

- Human copy.
- Short.
- Appears near relevant actions.

### Example Copy

```txt
Your profile stays hidden unless you choose to show it.
```

---

# Test Lab Components

## TestLabCard

### Purpose

Visual PASS/FAIL test unit for localhost-only Test Lab.

### Required Behavior

- Shows test name.
- Shows expected result.
- Shows actual safe result.
- Shows PASS/FAIL state.
- Uses fake data only.

### Do Not

- Do not connect to production data.
- Do not expose production secrets.
- Do not ship in production.

---

## LeakCheckPanel

### Purpose

Displays sensitive field leak checks during local QA.

### Required Behavior

- Scans fake payloads for forbidden fields.
- Shows visual PASS/FAIL.
- Can list detected unsafe keys in dev-only context.

### Must Check

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
- raw grant/reveal internals

---

# Component State Matrix

| Component | Hidden | Pending | Revealed | Blocked | Limit Reached | Unavailable |
| --- | --- | --- | --- | --- | --- | --- |
| `DiscoverCard` | Yes | Optional | No full reveal | Yes | Optional | Yes |
| `FeedTile` | Yes | No | No real reveal | Yes | No | Yes |
| `InstantContentViewer` | Yes | No | No real reveal | Yes | No | Yes |
| `ChatHeader` | Yes | Yes | Yes | Yes | Optional | Yes |
| `VoiceComposer` | No | No | No | Yes | Yes | Yes |
| `VoiceMessageBubble` | Yes | No | Yes if safe | Yes | No | Yes |
| `RevealRequestButton` | Yes | Yes | Yes | Yes | No | Yes |
| `RevealRequestCard` | Yes | Yes | Yes | Yes | No | Yes |
| `SafeProfileView` | Yes | Yes | Yes | Yes | No | Yes |
| `SafeNotificationItem` | Yes | Yes | Yes if safe | Yes | No | Yes |

---

# Screen-to-Component Mapping

## Welcome

Required components:

- `AppShell`
- `WelcomeHero`
- `AuthTrustNote`
- primary CTA button
- secondary sign-in action

## Auth

Required components:

- `AppShell`
- `ScreenHeader`
- auth form components later
- `AuthTrustNote`

## Profile Setup

Required components:

- `AppShell`
- `ScreenHeader`
- profile form components later
- `ProfileVisibilityNotice`

## Discover

Required components:

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `DiscoverCard`
- `HiddenProfilePreview`
- `AnonymousSignalBadge`

## Feed

Required components:

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `FeedGrid`
- `FeedTile`
- `MediaTypeBadge`

## Instant Content Detail

Required components:

- `AppShell`
- `ScreenHeader`
- `InstantContentViewer`
- `InstantProfileHeader`
- `InstantFollowButton`
- CTA to Chat

## Chat

Required components:

- `AppShell`
- `ChatRoom`
- `ChatHeader`
- `VoiceMessageBubble`
- `WaveformPreview`
- `VoiceComposer`
- `VoiceLimitIndicator`
- `RevealRequestButton`
- `RevealRequestCard`
- `RevealDecisionActions`
- `SafetyActionSheet`

## Profile

Required components:

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `OwnProfileCard`
- `SafeProfileView`
- `ProfileVisibilityNotice`
- `FloatingChatBubble`

## Notifications

Required components:

- `AppShell`
- `ScreenHeader`
- `SafeNotificationItem`
- `EmptyState`

## Test Lab

Required components:

- `AppShell` or dev-only shell
- `TestLabCard`
- `LeakCheckPanel`
- fake state previews for key components

---

# Component Copy Rules

## Use Calm Copy

Preferred terms:

- Hidden
- Still private
- Waiting for permission
- Decide later
- Stay hidden
- Show profile
- Visible now
- Voice limit reached for today
- Try again later

## Avoid Harsh Copy

Avoid:

- Rejected
- Denied
- Failed
- Forbidden
- Access blocked
- User refused you
- You are not allowed

## Turkish Product Copy Direction

Preferred Turkish labels:

- Profilini görmek istiyorum
- Profilini göster
- Gizli kal
- Sonra karar ver
- Profil hâlâ gizli
- İzin bekleniyor
- Profil artık görünür
- Bugünkü ses hakkın doldu
- Bu kişiye bugün daha fazla ses gönderemezsin

Avoid Turkish labels:

- Reddedildi
- Engellendin
- Yasak
- Erişim reddedildi
- Başarısız

---

# Data Boundary Rules For Components

## Components May Receive

Components may receive safe fields such as:

- safe display label
- safe anonymous profile label
- safe profile visibility state
- safe media type
- safe signed media URL
- safe voice duration
- safe remaining count
- safe reveal state
- safe block/unavailable state
- safe notification text

## Components Must Not Require

Components must not require:

- raw user IDs
- raw auth IDs
- raw relationship IDs
- raw storage paths
- bucket names
- moderation internals
- internal RLS decision details
- raw reveal/grant records
- hidden profile fields before reveal

---

# Accessibility Requirements

Components should support:

- readable dark-theme contrast
- minimum 44px touch targets
- visible focus states later on web
- reduced motion support later
- non-color-only state indication
- readable voice/playback controls
- clear state text for privacy/reveal behavior

Do not rely only on:

- blur
- color
- icons
- animation

to communicate critical privacy state.

---

# Component QA Checklist

Before implementation later, each component should answer:

1. What safe DTO does it consume?
2. Can it render hidden state?
3. Can it render blocked/unavailable state?
4. Does it avoid unsafe IDs?
5. Does it avoid raw storage paths?
6. Does it follow dark-first tokens?
7. Does it preserve voice-first behavior?
8. Does it avoid dating-app patterns?
9. Does it use calm copy?
10. Can Test Lab verify its critical states?

---

# MVP Component Priority

## Must Exist For MVP

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `WelcomeHero`
- `AuthTrustNote`
- `DiscoverCard`
- `HiddenProfilePreview`
- `FeedGrid`
- `FeedTile`
- `InstantContentViewer`
- `InstantProfileHeader`
- `ChatRoom`
- `ChatHeader`
- `VoiceComposer`
- `VoiceMessageBubble`
- `WaveformPreview`
- `VoiceLimitIndicator`
- `RevealRequestButton`
- `RevealRequestCard`
- `RevealDecisionActions`
- `RevealStatePill`
- `OwnProfileCard`
- `SafeProfileView`
- `ProfileVisibilityNotice`
- `FloatingChatBubble`
- `SafetyActionSheet`
- `EmptyState`
- `LimitReachedState`
- `UnavailableState`
- `TestLabCard`
- `LeakCheckPanel`

## Can Be Added After MVP Base

- advanced notification components
- advanced report category UI
- richer instant profile management
- coin/follower-view UI
- AI communication-style feedback components
- light theme selector
- advanced media editing/upload controls

---

# Implementation Mapping Later

When implementation is explicitly approved, components may later map to:

```txt
packages/ui
apps/web/components
apps/mobile/components
packages/shared/types
dev/test-lab/component-states
```

But this file does not authorize creating those files yet.

---

# Success Criteria

The component system is successful if:

- Every MVP screen has a clear component inventory.
- Chat, voice, and reveal components are treated as core.
- Discover and Feed correctly lead toward Chat.
- Components never require raw sensitive fields.
- Components support hidden/pending/revealed/blocked states.
- The design stays dark-first and premium.
- The app does not drift into dating-app UI.
- Test Lab can verify important privacy and product states.
- Codex can later receive small isolated component tasks without guessing the whole product.

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
