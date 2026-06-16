# Chat Interaction System Plan

## Phase

Phase 10F - Chat Interaction Audit Completed

## Purpose

This document defines the next narrow product direction for the ankion mobile app Chat screen.

The Chat screen is the central interaction hub of ankion. It must communicate anonymous, voice-first social interaction clearly while keeping all real product behavior disabled until explicitly planned and approved.

Phase 10A was documentation-only. Phases 10B through 10E were manually implemented as static Chat UI surfaces. Phase 10F audited the result and aligned source-of-truth docs.

---

## Current State

The mobile app is currently static and behavior-free.

The app already has:

- Expo + React Native + TypeScript + Expo Router mobile skeleton
- Static route shell
- Static product routes
- Dark-first UI foundation
- Static navigation shell
- Static Chat product interaction layout
- Static anonymous voice card placeholder
- Static profile reveal request placeholder
- Static Profile privacy/reveal control surface
- Static Reveal Requests card surface
- Successful Android preview APK build
- Successful real-device Android launch and smoke test

The Chat route currently includes:

- Anonymous voice space
- Static context hierarchy card
- Passive voice composer placeholder
- Static anonymous voice card
- Future 21-second voice message copy
- Static 5-step voice message lifecycle explanation
- Static reveal education surface
- Static profile reveal request placeholder
- Static 3-step explanation flow
- PrivacyNote
- SoftAction

The Chat route does not include:

- Real messages
- Mock users
- Mock profiles
- Mock reveal requests
- Voice recorder
- Real audio
- Play/pause behavior
- Reveal logic
- Approve/reject behavior
- Backend/API calls
- Supabase/Auth/RLS/Storage integration

---

## Product Rule

Chat is the core interaction surface of ankion.

Users may arrive at Chat from Discover or Feed.

There is no separate recipient picker.

The first interaction remains anonymous.

The sender's real profile remains hidden by default.

The recipient can request profile visibility later.

The sender/owner controls whether the real profile becomes visible.

The app must feel calm, human, private, and voice-first.

The app must not feel like a dating app.

The app must not use harsh words such as "Rejected".

---

## Phase 10A Scope

This phase only defines the Chat interaction system.

Allowed in this phase:

- Documentation
- Product boundaries
- Future UI slicing
- Static UI planning
- Copy direction
- Risk boundaries
- Acceptance criteria

Not allowed in this phase:

- Route file edits
- Component edits
- Package edits
- Navigation behavior
- router.push
- Tabs
- Backend/API logic
- Supabase
- Auth
- RLS
- Storage
- Migrations
- Mock users
- Mock media
- Mock messages
- Mock reveal data
- Voice recorder
- Real audio
- Play/pause logic
- Reveal approval logic
- Approve/reject behavior

---

## Chat Interaction System Principles

### 1. Chat is the main trust surface

Chat must explain what is happening without overwhelming the user.

The user should understand:

- The interaction starts anonymously.
- Voice is the primary medium.
- The real profile is hidden.
- Profile visibility can be requested.
- The owner controls visibility.
- Future decisions will happen calmly.

### 2. Voice-first, not text-first

Chat should visually prioritize voice interaction.

Text is used only to guide the user.

The product direction should avoid making Chat feel like a normal messaging app.

### 3. Static first, behavior later

Every new Chat UI part should first be added as passive static UI.

No real interaction should be added until the UI is understandable and stable.

### 4. No fake data

Do not add fake users, fake names, fake messages, fake profiles, fake avatars, or fake request records.

Use neutral system-level placeholders instead.

### 5. Privacy must be visible

The user must always understand that real profile visibility is protected.

Privacy communication should be present but not alarming.

### 6. Calm copy

The product language should feel safe and human.

Avoid:

- Rejected
- Denied
- Blocked by default
- Failed
- Warning-heavy language
- Dating-app style emotional pressure

Prefer:

- Not shared yet
- Waiting for permission
- Owner keeps control
- Profile stays private
- You can decide later

---

## Planned Chat Surfaces

### Surface 1 — Chat Context Header

Purpose:

Explain that this is an anonymous voice-first conversation space.

Future UI direction:

- Keep title short.
- Keep subtitle human.
- Avoid identity exposure.
- Avoid showing real user/profile data.

Example direction:

- Title: Chat
- Subtitle: Anonymous voice interaction starts here.

Implementation status:

Already partially present.

Future phase:

Phase 10B

Implementation status:

Completed in Phase 10B as a static context hierarchy card.

---

### Surface 2 — Passive Voice Composer Placeholder

Purpose:

Show where the future 21-second voice action will live without adding recorder behavior.

Rules:

- No Pressable recorder
- No TouchableOpacity recorder
- No microphone permission request
- No recording state
- No waveform generated from audio
- No fake audio
- No play button

Allowed:

- Static card
- Passive label
- Future action explanation
- 21-second rule copy
- Calm disabled-state wording

Future phase:

Phase 10C

Implementation status:

Completed in Phase 10C as a passive/static future voice composer surface.

---

### Surface 3 — Static Voice Message Lifecycle Explanation

Purpose:

Explain what happens after a future anonymous voice is sent.

Lifecycle to communicate:

1. Voice is sent anonymously.
2. Recipient can listen in Chat.
3. Recipient can request profile visibility later.
4. Sender decides whether to open the profile.
5. Real profile stays hidden unless approved.

Rules:

- No real message data
- No fake message list
- No timeline with fake users
- No state machine logic
- No backend status

Future phase:

Phase 10D

Implementation status:

Completed in Phase 10D as a static five-step lifecycle explanation.

---

### Surface 4 — Profile Reveal Education Surface

Purpose:

Explain profile visibility request behavior inside Chat.

Must communicate:

- The recipient can ask to see the real profile.
- The sender controls the decision.
- The real profile is not automatically exposed.
- The request can be handled later.
- The flow should not feel aggressive.

Rules:

- No approve button
- No reject button
- No decision handler
- No request state
- No fake requester
- No real profile preview

Future phase:

Phase 10E

Implementation status:

Completed in Phase 10E as a static reveal education surface.

---

### Surface 5 — Limit Awareness Placeholder

Purpose:

Prepare UI space for future daily voice limits without implementing limit logic.

Known future product rules:

- Daily voice send limit: 7 per account/membership day
- Maximum 3 voices to the same recipient per day
- Recipient should be informed in-context about remaining allowed voice messages in that flow

Current phase rule:

Do not implement counters yet.

Allowed later as static planning only:

- Passive explanation
- Future limit area placeholder
- No dynamic number
- No fake remaining count

Future phase:

Not immediate. Plan only after Chat static surfaces are stable.

---

### Surface 6 — Privacy Note

Purpose:

Reinforce that real profile visibility is permission-based.

Current status:

PrivacyNote component already exists and is used.

Future direction:

Keep PrivacyNote short and reassuring.

Avoid oversized warning-style UI.

---

## Recommended Manual Implementation Slices

### Phase 10B — Chat Context Hierarchy Refinement

Goal:

Improve Chat screen hierarchy so the user immediately understands that Chat is the central anonymous voice interaction space.

Allowed:

- Edit only `apps/mobile/app/chat.tsx`
- Static layout improvement
- Copy refinement
- Existing UI foundation usage

Not allowed:

- New components
- New packages
- Backend/API
- Recorder
- Audio behavior
- Reveal logic
- Mock data
- Navigation behavior

Validation:

- Mobile typecheck preferred
- Full validation not required unless risky change happens

---

### Phase 10C — Passive Voice Composer Placeholder

Goal:

Add a passive future voice composer surface.

Allowed:

- Edit only `apps/mobile/app/chat.tsx`
- Static card/surface
- 21-second future voice copy
- Disabled/passive wording

Not allowed:

- Pressable recorder
- Touchable recorder
- Audio permissions
- Recording state
- Real waveform
- Fake message

Validation:

- Mobile typecheck preferred

---

### Phase 10D — Static Voice Lifecycle Explanation

Goal:

Add a simple static explanation of how anonymous voice flow will work.

Allowed:

- Edit only `apps/mobile/app/chat.tsx`
- Static step list
- Calm copy
- No fake user/message content

Not allowed:

- Real flow state
- Fake message records
- Backend/API
- Reveal logic

Validation:

- Mobile typecheck preferred

---

### Phase 10E — Chat Reveal Education Surface

Goal:

Improve the profile reveal explanation inside Chat.

Allowed:

- Edit only `apps/mobile/app/chat.tsx`
- Static education surface
- Calm owner-controlled profile visibility copy

Not allowed:

- Approve/reject buttons
- Actual reveal request creation
- Request status
- Mock requester
- Backend/API

Validation:

- Mobile typecheck preferred

---

### Phase 10F — Chat Product Flow Audit + Docs/Status Alignment

Goal:

Use Codex only after Phase 10B-10E manual work is complete.

Codex should audit:

- Chat remains static
- No forbidden behavior was added
- No mock data was added
- No backend/API/Supabase/Auth/RLS/Storage files were added
- No package files changed unless explicitly approved
- Docs/status files are aligned

Expected Codex scope:

- Audit route files
- Update docs/status files only
- Do not modify route UI unless explicitly instructed

Status:

Completed. Audit confirmed Chat remains static and behavior-free, with no recorder behavior, microphone permission logic, real audio, play/pause behavior, mock data, backend/API logic, Supabase/Auth/RLS/Storage, migrations, package changes, apps/web source changes, or expanded navigation behavior.

Audit note:

Chat now has multiple static explanatory surfaces from Phases 9 and 10. This is acceptable for the current static phase, but the next recommended phase is documentation-only planning for Chat UI simplification / duplicate explanation cleanup before any recorder, backend, or reveal behavior.

---

## Acceptance Criteria for Phase 10A

Phase 10A is complete when:

- This document exists.
- No app route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Future Chat work is sliced into small manual phases.
- Codex usage is deferred until audit/docs alignment.

---

## Current Decision

The current implementation direction remains Chat-first, but behavior is still deferred.

The next recommended phase should be:

Phase 11A - Documentation-only Chat UI simplification / duplicate explanation cleanup planning

This must remain planning-only and must not add recorder, audio, backend, or reveal behavior.

Phase 11A through Phase 11C later completed the documentation-only simplification plan, static Chat duplicate explanation cleanup, and local mobile/web typecheck validation. Chat remains static and behavior-free.
