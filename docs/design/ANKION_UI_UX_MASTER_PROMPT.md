# ANKION_UI_UX_MASTER_PROMPT.md

## Purpose
Primary UI/UX source of truth for ankion.

## Status
Approved UI/UX direction.

## Role
This file defines the app's design direction, navigation, screen flow, component naming, color tokens, chat flow, profile privacy, voice-first structure, and mobile UX rules.

## Core Rules
- No separate recipient selection screen.
- Discover profile tap opens Chat directly.
- Feed tile tap opens Instant Content Detail, then Chat.
- Voice messages are sent from Chat.
- Chat is the central interaction hub.
- Feed uses a 3-column photo / video / audio grid.
- Real profile is hidden before permission.
- Profile reveal is permission-based.
- Profile screen includes a top-right floating chat bubble.
- Design must be dark-first, premium, modern, cinematic, mobile-native.
- Avoid harsh words like "Rejected" or "Denied."
- Avoid dating-app patterns.
- Use calm, human, neutral copy.

## Paste Full Master Prompt Below
# Approved Master UI/UX Prompt Content

## Product Definition

ankion is a dark-first, premium, mobile-native, voice-first anonymous social discovery app.

Users create real accounts and real profiles, but their real profile details remain hidden during first interaction. People discover others through Discover or Feed. When a user taps a blurred profile card or a feed item, the experience leads into Chat.

There is no separate recipient selection screen.

The main interaction happens inside the Chat Room, where users send voice messages. A real profile becomes visible only when the profile owner gives permission.

Core product idea:

Start hidden. Connect through voice. Reveal only with trust.

---

## Primary Visual Direction

The primary visual direction must be:

- Dark-first
- Premium
- Modern
- Cinematic
- Emotionally human
- Voice-first
- Mobile-native
- Serious, not playful
- Intimate, but not dating-app-like
- Calm, private, and trust-focused

Dark theme is the main default design direction.

Light theme may exist only as a secondary optional theme, not the core identity.

Do not make ankion look like:
- Tinder
- Bumble
- Instagram
- TikTok
- Snapchat
- A generic messaging clone
- A cheap anonymous app
- A playful teen app
- A neon-heavy dating product

ankion should feel like a serious, premium, anonymous voice-based social discovery product.

---

## Non-Negotiable Product Rules

Follow these rules strictly:

- No separate recipient selection screen.
- Discover profile tap opens Chat directly.
- Feed tile tap opens Instant Content Detail.
- From Instant Content Detail, user can open Chat naturally.
- Voice messages are sent from Chat.
- Chat is the central interaction hub.
- Feed uses a 3-column photo / video / audio grid.
- Real profile is hidden before permission.
- Profile reveal is permission-based.
- Profile screen includes a top-right floating chat bubble.
- Blurred profile cards are a core identity element.
- Profile cards include voice-first identity cues.
- Voice bio is an important profile element.
- Date of birth and gender are collected during onboarding, but not exposed before profile reveal.
- City/location must not dominate MVP and should remain optional or deferred.
- Avoid harsh words like “Rejected” or “Denied.”
- Use calm, human, neutral copy.
- Avoid oversized warning cards.
- Avoid aggressive red states.
- Avoid dating-app visual language.
- Do not expose real name, clear photo, exact age, city, or full profile before permission.
- UI must be mobile-native and thumb-friendly.

---

## Main Navigation

Use a fixed native mobile bottom tab bar with 4 tabs:

1. Chat
2. Feed
3. Discover
4. Profile

Navigation style:

- Dark glass surface
- Slight blur
- Soft top border
- Rounded floating container or native tab bar feel
- Active tab uses premium purple glow
- Inactive tabs use muted gray-blue
- Small notification badges for unread chats or profile requests
- No loud colors
- No oversized icons

Chat is the main hub.

Feed and Chat must remain separate tabs.

Feed is for content discovery.

Chat is for conversations, voice messages, profile requests, reveal decisions, and ongoing interaction.

---

## Core Flow

The main user flow:

1. User opens ankion.
2. User logs in or signs up.
3. User creates a real profile.
4. User selects date of birth and gender.
5. User lands in the app.
6. User browses Discover or Feed.
7. User taps a blurred profile card or feed item.
8. Chat or Instant Content Detail opens.
9. User sends a voice message from Chat.
10. Receiver can listen while real profile remains hidden.
11. Receiver can request to see the profile.
12. Profile owner can reveal, decide later, or stay hidden.
13. Real profile becomes visible only with permission.
14. After reveal, the user can return to Chat easily.

---

## Screen List

Create these mobile screens as the UI/UX foundation:

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

Recommended frame sizes:

- iPhone 15: 390 × 844
- Android reference: 360 × 800

Use mobile-safe spacing, native status bar areas, bottom safe areas, and 44px+ touch targets.

---

## Dark-First Color Tokens

Use this color system as the main design foundation.

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

### Brand / Accent

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

### Gradients

- Primary Glow: linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)
- Cinematic Background: radial-gradient(circle at top, rgba(139,92,246,0.22), transparent 36%), #07080D
- Profile Blur Overlay: linear-gradient(180deg, rgba(7,8,13,0.08), rgba(7,8,13,0.76))

---

## Typography

Use a modern, native-friendly type system.

Recommended:

- iOS: SF Pro
- Android: Inter or Roboto
- Figma: Inter

Typography scale:

- Large Title: 32 / 38, Semibold
- Title: 24 / 30, Semibold
- Section Title: 20 / 26, Semibold
- Card Title: 17 / 24, Medium
- Body: 15 / 22, Regular
- Small: 13 / 18, Regular
- Caption: 11 / 14, Medium
- Micro Label: 10 / 13, Medium

Typography rules:

- Use calm, short copy.
- Avoid shouting.
- Avoid all-caps except tiny labels.
- Use generous line height.
- Keep chat text highly readable.
- Do not overload screens with text.

---

## Screen Direction

### 1. Splash

Design a cinematic dark splash screen.

Layout:

- Full-screen dark cinematic gradient
- Centered ankion wordmark
- Subtle voice waveform below the logo
- Purple-cyan glow behind the logo
- Minimal, premium, quiet
- No buttons

Motion note:

- Logo fades in slowly.
- Waveform pulses once like a quiet voice signal.

UX purpose:

Create a premium first impression and introduce the voice-first identity.

---

### 2. Login / Sign up

Layout:

- Dark cinematic background
- Top or center ankion logo
- Headline: “Hear the voice first.”
- Supporting text: “Start hidden. Connect through voice. Reveal only when you choose.”
- Rounded authentication card near the bottom
- Buttons:
  - Continue with Phone
  - Continue with Apple
  - Continue with Google
- Small privacy text at the bottom

Visual direction:

- Glass-like dark card
- 28px corner radius
- Thin soft border
- Subtle glow around the primary phone button
- Plenty of vertical breathing room

UX purpose:

Make onboarding feel safe, premium, private, and real-account based.

---

### 3. Create Profile

Layout:

- Title: “Create your real profile”
- Subtitle: “It stays hidden until you choose to reveal it.”
- Profile photo upload area
- Name input
- Username input
- Voice bio card
- Primary button: Continue

Important:

- Profile photo appears blurred by default.
- Do not show the profile as public.
- Reinforce that the profile is real but hidden until permission.

UX purpose:

Users understand they are creating a real profile, but it will not be exposed automatically.

---

### 4. Date of Birth & Gender Selection

Layout:

- Title: “A few basic details”
- Date of birth picker
- Gender selector chips:
  - Woman
  - Man
  - Prefer not to say
  - Custom
- Helper text: “These details are not shown before your profile is revealed.”
- Primary button: Start using ankion

Visual direction:

- Compact form sections
- Dark cards with subtle borders
- Selected chips use purple fill
- Unselected chips use translucent surface

UX purpose:

Collect necessary data while reinforcing privacy and control.

---

### 5. Discover

Discover is not a dating swipe screen.

Layout:

- Top bar:
  - Left: Discover
  - Right: filter icon and notification dot
- Horizontal filter chips:
  - New
  - Voice-first
  - Shared interests
  - Active now
- Vertical list of large blurred profile cards

Each blurred profile card includes:

- Blurred profile image
- Anonymous label:
  - Hidden profile
  - A voice nearby
  - Someone from your feed
- Short hidden bio preview
- Voice bio player button
- Optional interest chips
- Primary CTA: Open chat

Visual direction:

- Cinematic dark background
- Large rounded cards, 28–32px radius
- Soft purple/cyan edge glow
- Blur should feel elegant, not censored
- Cards should stack vertically with spacious gaps

Interaction:

- Tapping a profile card opens Chat directly.
- No recipient selection screen.

UX purpose:

Discovery is quiet, intentional, and voice-led.

---

### 6. Instant Feed

Feed is a 3-column photo / video / audio grid.

Layout:

- Top bar:
  - Title: Feed
  - Search icon
  - Notification icon
- Filter chips:
  - For you
  - Following
- Main content:
  - 3-column vertical grid
  - Photo, video, and audio tiles mixed together
  - Rounded tile corners
  - Masonry-like vertical rhythm
  - Audio tiles show waveform thumbnails
  - Video tiles show small play icon
  - Photo tiles use subtle cinematic overlays

Do not include Live tab in MVP.

Interaction:

- Tapping a feed tile opens Instant Content Detail.
- From detail screen, user can open Chat.
- No recipient picker.

UX purpose:

Feed is a discovery surface that leads naturally into conversation.

---

### 7. Chat List

Chat is the app’s main hub.

Layout:

- Top bar:
  - Title: Chat
  - Notification icon
  - Requests icon
- Sections:
  - Active chats
  - Profile requests
  - Waiting responses

Chat item includes:

- Blurred avatar or revealed avatar
- Anonymous label or real name after reveal
- Last message preview
- Small waveform preview for voice messages
- Calm status text
- Unread badge

Status copy examples:

- Listened to your voice
- Waiting for response
- Profile still hidden
- Profile revealed
- You can keep chatting

Visual direction:

- Dark elevated surfaces
- Soft compact rows
- Premium rounded cards
- Do not use inbox/outbox language
- Do not use oversized request cards

UX purpose:

Messages, voice interactions, and profile visibility states live here.

---

### 8. Chat Room

Chat Room is the core product space.

Header:

- Back button
- Blurred avatar or revealed avatar
- Label:
  - Hidden profile
  - Revealed profile
- Helper text:
  - “Profile opens only with permission.”
- More / safety menu

Message area:

- Voice message bubbles
- Small system messages
- Optional tiny text/system bubbles only
- Profile request cards

Bottom input:

- Microphone button as primary action
- Message input bar must not overpower voice
- Plus icon
- CTA:
  - I want to see your profile

Visual direction:

- Dark intimate conversation space
- My messages use deep purple
- Other messages use elevated dark gray-blue
- Voice waveform uses cyan
- System messages are tiny, centered, and calm
- No harsh alert banners

UX purpose:

The chat room is where trust is built. Voice should feel natural, personal, and central.

---

### 9. Voice Recording State

This is a state of Chat Room, not a separate full-screen recorder.

Layout:

- Chat remains visible in the background
- Background subtly dims
- Bottom input transforms into active recording mode
- Large active microphone button
- Live waveform
- Recording timer
- Gesture hints:
  - Release to send
  - Slide left to cancel
  - Slide up to lock

Locked recording mode:

- Send
- Redo
- Delete

Visual direction:

- Cyan waveform animation
- Purple active mic glow
- Smooth native-feeling state change
- No heavy modal
- No oversized warning style

UX purpose:

Voice recording should feel native, fast, fluid, and emotionally immediate.

---

### 10. Profile Request Sent

Sender-side chat state.

Layout:

Inside the chat, show a small inline request card.

Title:

- Profile request sent

Description:

- You’ll see the response here when they decide.

Button:

- Cancel request

Visual direction:

- Small card
- Dark glass surface
- Thin border
- Soft purple accent
- No full-screen interruption

UX purpose:

The profile request should feel like part of the conversation, not a transaction.

---

### 11. Profile Visibility Decision

Receiver-side state.

Layout:

Use a soft bottom sheet or inline card inside chat.

Title:

- They want to see your profile.

Description:

- The choice is yours. You can reveal your profile, decide later, or stay hidden.

Actions:

- Reveal my profile
- Decide later
- Stay hidden

Decision explanations:

Reveal my profile:
- “This person will be able to see your real profile.”

Decide later:
- “The request will stay inside this chat.”

Stay hidden:
- “Your profile remains hidden. You can still keep chatting.”

Visual direction:

- Bottom sheet with 32px top radius
- Dark elevated surface
- Minimal iconography
- Purple for primary reveal action
- Neutral styling for later/stay hidden
- Do not use red
- Do not use the word “Rejected”

UX purpose:

The decision must feel safe, calm, and fully controlled by the profile owner.

---

### 12. Profile Revealed State

Layout:

Inside chat, show a small system message:

- Profile revealed

Then show a profile preview card:

- Clear avatar
- Name
- Optional age if allowed after reveal
- Optional city only if user allowed it
- Short bio
- Interests
- Voice bio button

Buttons:

- Open profile
- Back to chat

Visual direction:

- Blur dissolves into clear identity
- Keep it elegant and subtle
- Use a soft success signal, not a celebration explosion
- Maintain chat continuity

UX purpose:

When the profile is revealed, the user should still feel anchored in the conversation.

---

### 13. Full Profile Screen with Top-Right Floating Chat Bubble

Layout:

- Large profile image header
- Cinematic gradient overlay
- Name
- Bio
- Voice bio player
- Interest chips
- Shared content

Important:

Place a floating chat bubble button at the top-right corner.

Chat bubble style:

- Circular
- 48–56px touch target
- Purple or dark glass surface
- Soft glow
- Always easy to notice
- Tapping returns to the existing Chat Room

Visual direction:

- Premium profile, not dating profile
- Avoid swipe, match, heart-heavy visual language
- Focus on voice, trust, and shared presence

UX purpose:

After profile reveal, returning to conversation must be effortless and instinctive.

---

### 14. Instant Content Detail

Layout:

- Full-screen media detail
- Photo: large cinematic image with overlay
- Video: full-screen player with minimal controls
- Audio: large waveform with blurred profile background
- Bottom area:
  - Caption
  - Anonymous profile preview
  - CTA: Chat
- Right-side vertical action rail:
  - Save
  - Share
  - More

Visual direction:

- Dark immersive media view
- Minimal controls
- Smooth gradients
- Do not crowd the screen
- Keep identity hidden unless already approved

UX purpose:

Content should lead into a chat naturally without exposing identity.

---

### 15. Notifications

Layout:

- Top bar: Notifications
- Grouped notification list
- Rounded dark notification rows
- Small type icons

Notification examples:

- Someone left you a voice message
- Your profile request has a response
- Profile is now visible
- Someone started a chat from your content

Buttons:

- Open
- Go to chat
- View request

Visual direction:

- Calm, social, subtle
- Avoid alarm-like red UI
- Use small badges and soft accent colors

UX purpose:

Notifications should feel like quiet social signals, not warnings.

---

### 16. Block / Report Flow

Access points:

- Chat room top-right menu
- Profile screen menu
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

Confirmation message:

- Thanks for letting us know. You won’t have to see this person anymore.

Button:

- Done

Visual direction:

- Use bottom sheets
- Keep language calm
- Avoid full red screens
- Use safety color only as a small accent
- No oversized warning cards

UX purpose:

Safety should be accessible, fast, and emotionally steady.

---

## Blurred Profile Card Rules

Blurred profile cards are a core identity element of ankion.

Design rules:

- Use elegant blur, not censorship.
- Do not reveal identifiable facial details.
- Preserve mood, color, and silhouette.
- Use cinematic gradients over the blur.
- Rounded corners: 28–32px.
- Add soft purple/cyan glow on edges.
- Include a voice bio player.
- Include a clear chat CTA.
- Keep anonymous copy short and human.

Before reveal, use labels like:

- Hidden profile
- A voice nearby
- A voice from your feed
- Profile opens only with permission

Do not show:

- Real name
- Clear face
- Exact age
- Exact city
- Full bio
- Social handles

---

## Voice-First Chat Experience

Voice is the main emotional layer of the app.

Voice UI rules:

- Microphone is a primary interaction.
- Waveforms should look polished and premium.
- Cyan indicates active voice states.
- Purple indicates primary decisions/actions.
- Voice bubbles show duration clearly.
- Listening state is subtle.
- Recording gestures should feel native.

Required gestures:

- Hold to record
- Release to send
- Slide left to cancel
- Slide up to lock

Voice bubble content:

- Play / pause
- Waveform
- Duration
- Sent / listened state
- Optional tiny transcript hint, not dominant

---

## Anonymous Start & Permission-Based Reveal

Before permission:

- Show blurred profile visuals.
- Use anonymous labels.
- Hide real profile details.
- Keep chat possible.
- Keep voice interaction possible.
- Make hidden state feel normal, not blocked.

After permission:

- Reveal clear avatar.
- Show name.
- Show optional age/city only if allowed.
- Show bio.
- Show interests.
- Show voice bio.
- Show shared content.
- Provide easy return to chat.
- Keep the top-right floating chat bubble visible on profile.

Neutral hidden-state copy:

- Profile still hidden
- Profile stayed hidden for now
- Waiting for response
- They chose to stay hidden
- You can keep chatting

Avoid:

- Rejected
- Denied
- Blocked from viewing
- Access refused
- Permission failed

---

## Component System

Create reusable components with variants and states.

### Navigation Components

- Bottom Tab Bar
- Top App Bar
- Back Button
- Notification Icon with Badge
- Floating Chat Bubble
- Context Menu Button
- Safe Area Spacer

### Profile Components

- Blurred Profile Card
- Hidden Avatar
- Revealed Avatar
- Profile Preview Card
- Profile Reveal Request Card
- Profile Revealed Card
- Voice Bio Player
- Interest Chips
- Anonymous Identity Label

### Feed Components

- 3-Column Media Grid
- Photo Tile
- Video Tile
- Audio Tile
- Waveform Thumbnail
- Media Type Badge
- Instant Content Header
- Vertical Action Rail

### Chat Components

- Chat List Item
- Anonymous Chat Header
- Voice Message Bubble
- Waveform Player
- Message Input Bar
- Microphone Button
- Profile Request CTA
- Inline System Message
- Read / Listened State

Text Message Bubble may exist only as a secondary/system component. Do not make written chat the main interaction.

### Voice Components

- Hold-to-Record Button
- Active Recording Bar
- Live Waveform
- Recording Timer
- Slide-to-Cancel Hint
- Slide-to-Lock Hint
- Locked Recording State
- Send / Redo / Delete Actions

### Form Components

- Text Input
- Phone Login Button
- Social Login Button
- Date Picker
- Gender Selector Chips
- Primary Button
- Secondary Button
- Ghost Button

### Modal / Sheet Components

- Bottom Sheet
- Profile Visibility Decision Sheet
- Safety Action Sheet
- Report Reason Sheet
- Confirmation Sheet

---

## Microinteraction Notes

Include microinteraction annotations in design.

Splash:

- Logo fades in.
- Waveform pulses once.
- Background glow slowly breathes.

Bottom Navigation:

- Active tab lifts 2px.
- Purple glow appears under active tab.
- Badge softly scales in.

Discover Cards:

- Card compresses slightly on press.
- Blur shifts subtly but does not reveal identity.
- Voice bio button shows tiny waveform motion.

Feed Grid:

- Tiles animate with slight stagger on scroll.
- Audio tiles show subtle waveform movement.
- Video tiles show soft play shimmer.

Chat:

- New voice bubble slides in gently.
- Waveform animates during playback.
- Listened state appears as small text, not a loud badge.

Recording:

- Mic button pulses while recording.
- Waveform responds live.
- Timer increments smoothly.
- Slide-to-cancel text fades in only while recording.

Profile Request:

- Request card slides into chat.
- Receiver decision sheet rises from bottom.
- No full-screen disruption.

Profile Reveal:

- Blur dissolves slowly.
- Avatar becomes clear.
- Name appears after avatar.
- Success state is quiet, not celebratory.

Stay Hidden:

- Show inline message:
  - Profile stayed hidden for now.
- Secondary text:
  - You can keep chatting.
- No red color.
- No harsh warning.

---

## Figma-Ready Design Instructions

Create the design as a structured mobile UI kit.

Required Figma pages:

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

- Auto Layout for all cards, lists, sheets, and navigation.
- 8px spacing system.
- 24px screen horizontal padding where appropriate.
- 16px inner card padding.
- 20–32px card radius.
- 44px minimum touch targets.
- Native status bar and home indicator spacing.
- Component variants for dark/light, default/active/disabled/loading states.
- Dark-first components as default variants.
- Consistent icon sizes: 20px, 24px, 28px.
- Subtle shadows and glows, not heavy drop shadows.

Suggested spacing:

- Screen padding: 20–24px
- Card padding: 16–20px
- Section gap: 24px
- List item gap: 12px
- Button height: 48–56px
- Bottom nav height: 72–84px including safe area
- Chat input height: 56–68px

---

## Visual Do / Don’t

### Do

- Make it cinematic and dark-first.
- Make it feel native mobile.
- Make voice interactions visually central.
- Use premium rounded surfaces.
- Use soft blur and glass effects carefully.
- Use calm, emotionally intelligent copy.
- Keep anonymity clear.
- Keep chat central.
- Keep profile reveal permission-based.
- Make the top-right chat bubble obvious on profile.

### Don’t

- Do not design a website.
- Do not make it look like Tinder or a dating app.
- Do not use swipe-match patterns.
- Do not expose real identity before permission.
- Do not create a recipient selection screen.
- Do not use oversized warning cards.
- Do not use harsh red modals.
- Do not use words like “Rejected.”
- Do not make the interface childish or overly playful.
- Do not overcrowd the feed with social metrics.

---

## Quality Gate

Before accepting UI/UX output, check:

- Is it dark-first?
- Is it mobile-native?
- Does it avoid dating-app patterns?
- Is Chat the central hub?
- Is voice the primary interaction?
- Is there no separate recipient picker?
- Does Discover open Chat directly?
- Does Feed lead naturally to Chat?
- Is the Feed a 3-column photo/video/audio grid?
- Is the real profile hidden before permission?
- Does the Profile screen include a top-right floating chat bubble?
- Are stay hidden / later states calm and non-harsh?
- Is the design premium enough to build a serious product around?

If any answer is no, revise before moving forward.
