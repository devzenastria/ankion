# ANKION_FINAL_UI_GENERATION_PROMPT.md

## Purpose
Final prompt used to generate ankion's dark-first premium mobile UI kit in Figma Make, a UI-focused GPT, or another design generation tool.

## Status
Ready for final content insertion.

## Source of Truth
This prompt must follow:
- docs/design/ANKION_UI_UX_MASTER_PROMPT.md
- docs/product/MVP_CORE.md
- docs/product/APP_USAGE_FLOW.md
- docs/security/SECURITY_RULES.md

## Non-Negotiable UI Rules
- No separate recipient picker.
- Discover opens Chat directly.
- Feed leads to Content Detail, then Chat.
- Chat is the main hub.
- Voice recording lives inside Chat.
- Feed is 3-column photo/video/audio grid.
- Real profile stays hidden before permission.
- Profile screen has a top-right chat bubble.
- Stay hidden / later states must be calm and non-harsh.
- Dark-first design is mandatory.

## Paste Final UI Generation Prompt Below
# Approved Final UI Generation Prompt Content

## Purpose

This prompt is used to generate the final dark-first, premium, mobile-native UI direction for ankion in Figma Make, a UI-focused GPT, or another design generation tool.

This prompt must not change the product logic.

Design is not the product goal. Design must serve the approved ankion core.

---

## Source of Truth

The primary UI/UX reference is:

`docs/design/ANKION_UI_UX_MASTER_PROMPT.md`

The generated UI must follow the master prompt and must not contradict the core product rules.

---

## Product Summary

ankion is a chat-centered, voice-first, anonymous-start social discovery app.

Users create real accounts and real profiles, but their real profile is hidden during the first interaction.

People discover others through Discover or Feed.

When a user taps a blurred profile card or a feed item, the experience leads into Chat.

There is no separate recipient selection screen.

Voice messages are sent from Chat.

Real profile visibility happens only when the profile owner gives permission.

Core idea:

Start hidden. Connect through voice. Reveal only with trust.

---

## Non-Negotiable Product Rules

Follow these rules strictly:

- No separate recipient picker.
- Discover profile tap opens Chat directly.
- Feed tile tap opens Instant Content Detail.
- Instant Content Detail leads naturally to Chat.
- Voice messages are sent from Chat.
- Chat is the central hub.
- Feed uses a 3-column photo / video / audio grid.
- Real profile is hidden before permission.
- Profile reveal is permission-based.
- Profile screen includes a top-right floating chat bubble.
- Blurred profile cards are a core visual identity.
- Voice bio is an important profile element.
- Date of birth and gender are collected during onboarding.
- City/location must not dominate MVP.
- Stay hidden / later states must be calm and non-harsh.
- Do not use “Rejected”, “Denied”, “Blocked from viewing”, or aggressive red states.
- Do not make the app look like a dating app.
- Do not use swipe/match patterns.
- Do not expose real identity before permission.

---

## Visual Direction

Create a dark-first, premium, modern, cinematic, emotionally human, mobile-native UI.

The UI should feel:

- Serious
- Private
- Trust-focused
- Voice-first
- Minimal
- Smooth
- Native mobile
- Premium but not over-designed

Avoid:

- Neon-heavy style
- Cheap anonymous app look
- Dating app look
- Playful teen app look
- Website layout
- Generic chat clone
- Oversized warning cards
- Overly decorative screens

---

## Main Navigation

Use a fixed bottom tab bar with 4 tabs:

1. Chat
2. Feed
3. Discover
4. Profile

Navigation rules:

- Chat is the main hub.
- Feed and Chat are separate tabs.
- Discover opens Chat directly from profile cards.
- Feed opens content detail first, then Chat.
- Profile contains settings and user profile controls.
- Bottom navigation must feel native iOS/Android.

Navigation style:

- Dark glass surface
- Slight blur
- Soft border
- Rounded floating container or native tab bar
- Active tab uses purple glow
- Inactive tabs use muted gray-blue
- Small notification badges only

---

## Required Screens

Generate these mobile app screens:

1. Splash
2. Login / Sign up
3. Create Profile
4. Date of Birth & Gender Selection
5. Discover
6. Instant Feed
7. Chat List
8. Chat Room
9. Voice Recording State
10. Profile Request Sent
11. Profile Visibility Decision
12. Profile Revealed State
13. Full Profile Screen with top-right floating chat bubble
14. Instant Content Detail
15. Notifications
16. Block / Report Flow
17. Prototype Flow Overview

Recommended frames:

- iPhone 15: 390 × 844
- Android reference: 360 × 800

Use native mobile spacing, status bar spacing, bottom safe area, and 44px+ touch targets.

---

## Dark Theme Tokens

Use these as the main tokens.

### Background / Surface

- App Background: #07080D
- Deep Surface: #0D0F18
- Surface: #121522
- Elevated Surface: #191D2E
- Glass Surface: rgba(18, 21, 34, 0.72)
- Modal Surface: #1E2235

### Borders / Dividers

- Soft Border: rgba(255, 255, 255, 0.08)
- Strong Border: rgba(255, 255, 255, 0.14)
- Hairline Divider: rgba(255, 255, 255, 0.06)

### Text

- Text Primary: #F8FAFC
- Text Secondary: #CBD5E1
- Text Muted: #7C8496
- Text Disabled: #475569

### Brand / Voice

- Brand Purple: #8B5CF6
- Brand Purple Light: #A78BFA
- Brand Purple Deep: #5B21B6
- Voice Cyan: #22D3EE
- Voice Cyan Soft: rgba(34, 211, 238, 0.18)
- Emotional Pink: #F472B6

### States

- Success Soft: #22C55E
- Pending Soft: #FACC15
- Safety Soft: #FB7185

Use red only as a small safety accent, never as a dominant harsh state.

---

## Typography

Use a modern native-friendly type system.

Recommended:

- Figma: Inter
- iOS: SF Pro
- Android: Inter or Roboto

Scale:

- Large Title: 32 / 38 Semibold
- Title: 24 / 30 Semibold
- Section Title: 20 / 26 Semibold
- Card Title: 17 / 24 Medium
- Body: 15 / 22 Regular
- Small: 13 / 18 Regular
- Caption: 11 / 14 Medium
- Micro Label: 10 / 13 Medium

Copy rules:

- Short
- Calm
- Human
- Neutral
- No shouting
- No aggressive warnings
- No dating-app wording

---

## Screen-by-Screen Requirements

### Splash

- Dark cinematic background
- ankion wordmark
- Subtle purple-cyan waveform
- No buttons
- Premium quiet mood

### Login / Sign up

- Dark cinematic background
- ankion logo
- Headline: “Hear the voice first.”
- Supporting text: “Start hidden. Connect through voice. Reveal only when you choose.”
- Glass auth card
- Continue with Phone
- Continue with Apple
- Continue with Google
- Small privacy note

### Create Profile

- Real profile creation
- Blurred photo upload
- Name
- Username
- Voice bio card
- Continue button
- Clear privacy helper text

Important:

The profile is real but hidden until permission.

### Date of Birth & Gender Selection

- Date of birth picker
- Gender selector chips:
  - Woman
  - Man
  - Prefer not to say
  - Custom
- Helper text:
  “These details are not shown before your profile is revealed.”

### Discover

- Vertical list of large blurred profile cards
- Filter chips:
  - New
  - Voice-first
  - Shared interests
  - Active now
- Each card:
  - Blurred profile image
  - Anonymous label
  - Voice bio player
  - Interest chips
  - Open Chat CTA

Interaction:

Tapping a profile card opens Chat directly.

No recipient picker.

### Instant Feed

- 3-column grid
- Photo / video / audio mixed tiles
- Audio tiles show waveform thumbnail
- Video tiles show play icon
- Photo tiles use cinematic overlay
- Filters:
  - For you
  - Following

Do not include Live tab in MVP.

Interaction:

Feed tile opens Instant Content Detail.
From detail, user can open Chat.

### Chat List

- Main hub of the app
- Active chats
- Profile requests
- Waiting responses
- Chat cards include:
  - blurred or revealed avatar
  - anonymous label or real name after reveal
  - last voice/message preview
  - waveform preview
  - calm status
  - unread badge

Do not use inbox/outbox wording.

### Chat Room

- Header:
  - back button
  - blurred/revealed avatar
  - hidden profile / revealed profile label
  - safety menu
- Message area:
  - voice bubbles
  - profile request card
  - tiny calm system messages
- Bottom input:
  - microphone as primary action
  - optional small input must not dominate
  - CTA: I want to see your profile

Voice must feel central.

### Voice Recording State

This is a Chat Room state, not a separate recorder screen.

- Chat remains visible
- Bottom input transforms into recorder
- Live waveform
- Recording timer
- Hold to record
- Release to send
- Slide left to cancel
- Slide up to lock
- Locked state: Send / Redo / Delete

### Profile Request Sent

Inline chat card:

- Profile request sent
- You’ll see the response here when they decide.
- Cancel request

No full-screen interruption.

### Profile Visibility Decision

Receiver-side bottom sheet or inline card.

Title:

They want to see your profile.

Actions:

- Reveal my profile
- Decide later
- Stay hidden

Copy:

- Reveal my profile: “This person will be able to see your real profile.”
- Decide later: “The request will stay inside this chat.”
- Stay hidden: “Your profile remains hidden. You can still keep chatting.”

Do not use red.
Do not use Rejected.

### Profile Revealed State

Inside Chat:

- Small system message: Profile revealed
- Profile preview card:
  - clear avatar
  - name
  - optional age only if allowed
  - optional city only if allowed
  - short bio
  - interests
  - voice bio
- Buttons:
  - Open profile
  - Back to chat

Keep the user anchored in conversation.

### Full Profile Screen

- Large profile image area
- Gradient overlay
- Name
- Bio
- Voice bio player
- Interest chips
- Shared content

Must include:

Top-right floating chat bubble.

Chat bubble:

- 48–56px
- circular
- purple or dark glass
- soft glow
- obvious but not loud
- tapping returns to existing Chat Room

Avoid dating profile style.

### Instant Content Detail

- Full-screen media detail
- Photo/video/audio detail
- Anonymous profile preview
- CTA: Chat
- Right-side minimal action rail:
  - Save
  - Share
  - More

Real identity remains hidden unless approved.

### Notifications

- Calm grouped notification list
- Rounded dark rows
- Soft badges

Examples:

- Someone left you a voice message
- Your profile request has a response
- Profile is now visible
- Someone started a chat from your content

### Block / Report Flow

Access points:

- Chat menu
- Profile menu
- Instant content detail menu

Bottom sheet options:

- Mute notifications
- Hide this person
- Report
- Block

Report reasons:

- Unwanted message
- Fake profile concern
- Inappropriate content
- Harassment or pressure
- Other

Confirmation:

Thanks for letting us know. You won’t have to see this person anymore.

No full red screens.

---

## Component System

Create reusable components:

### Navigation

- Bottom Tab Bar
- Top App Bar
- Back Button
- Notification Icon with Badge
- Floating Chat Bubble
- Context Menu Button

### Profile

- Blurred Profile Card
- Hidden Avatar
- Revealed Avatar
- Profile Preview Card
- Profile Reveal Request Card
- Profile Revealed Card
- Voice Bio Player
- Interest Chips
- Anonymous Identity Label

### Feed

- 3-Column Media Grid
- Photo Tile
- Video Tile
- Audio Tile
- Waveform Thumbnail
- Media Type Badge
- Instant Content Header
- Vertical Action Rail

### Chat

- Chat List Item
- Anonymous Chat Header
- Voice Message Bubble
- Waveform Player
- Message Input Bar
- Microphone Button
- Profile Request CTA
- Inline System Message
- Read / Listened State

Text bubble may exist only as secondary/system support.
Do not make written chat dominant.

### Voice

- Hold-to-Record Button
- Active Recording Bar
- Live Waveform
- Recording Timer
- Slide-to-Cancel Hint
- Slide-to-Lock Hint
- Locked Recording State
- Send / Redo / Delete Actions

### Forms

- Text Input
- Phone Login Button
- Social Login Button
- Date Picker
- Gender Selector Chips
- Primary Button
- Secondary Button
- Ghost Button

### Sheets

- Bottom Sheet
- Profile Visibility Decision Sheet
- Safety Action Sheet
- Report Reason Sheet
- Confirmation Sheet

---

## Microinteractions

Add annotations for:

- Splash logo fade
- Waveform pulse
- Active tab purple glow
- Discover card press compression
- Blur shift without identity reveal
- Feed grid staggered scroll
- Voice waveform playback animation
- Mic pulse while recording
- Timer increment
- Slide-to-cancel hint
- Request card sliding into chat
- Decision sheet rising from bottom
- Blur dissolving after reveal
- Profile chat bubble press feedback

---

## Figma Structure

Create these Figma pages:

- 00 Design Tokens
- 01 Components
- 02 Navigation
- 03 Onboarding
- 04 Discover
- 05 Feed
- 06 Chat
- 07 Profile Reveal Flow
- 08 Profile
- 09 Notifications
- 10 Safety
- 11 Prototype Flow

Use:

- Auto Layout
- 8px spacing system
- 20–24px screen padding
- 16–20px card padding
- 20–32px card radius
- 44px minimum touch targets
- Native status bar and home indicator spacing
- Dark-first variants as default
- Subtle shadows and glows

---

## Quality Gate

Before finalizing the UI, verify:

- Dark-first?
- Mobile-native?
- Premium?
- Not dating-app-like?
- No recipient picker?
- Discover opens Chat directly?
- Feed opens Detail then Chat?
- Chat is the central hub?
- Voice is the main interaction?
- Feed is 3-column photo/video/audio?
- Real profile hidden before permission?
- Profile screen has top-right chat bubble?
- Stay hidden / later states are calm?
- No harsh rejected/denied wording?
- No public identity leak before permission?

If any answer is no, revise before presenting the design.

---

## Final Output Requirement

Generate a complete dark-first, premium, mobile-native UI kit for ankion.

The final UI must clearly communicate:

ankion is a serious anonymous voice-based social discovery app where people start hidden, connect through voice, and reveal their profile only when they choose.
