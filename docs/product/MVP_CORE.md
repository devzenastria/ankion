# MVP_CORE.md

## Purpose
This document defines the non-negotiable MVP core of ankion.

ankion must not drift into a generic chat app, dating app, media app, or social feed clone.

## Status
Approved core direction.

## Product Definition
ankion is a dark-first, premium, mobile-native, voice-first anonymous social discovery app.

Users start hidden, connect through voice, and reveal their real profile only when they choose.

## Core Product Sentence
Start hidden. Connect through voice. Reveal only with trust.

## Non-Negotiable MVP Rules

### 1. Real Account Required
Users must create a real account before using the app.

Reason:
- Abuse prevention
- Blocking/reporting
- Profile ownership
- Reveal permission control

### 2. Profile Required
Users must create a profile before sending voice messages or participating in discovery.

The profile is real, but it stays hidden before permission.

### 3. Voice-First Interaction
The primary interaction is voice.

MVP must prioritize:
- Voice bio
- Voice messages
- Voice-first Chat
- Voice recording inside Chat

Written chat must not become the primary interaction in MVP.

### 4. No Separate Recipient Selection Screen
There must be no standalone recipient picker screen.

Correct flow:
- Discover profile tap opens Chat directly.
- Feed tile opens Instant Content Detail.
- Instant Content Detail leads to Chat.
- Voice message is sent inside Chat.

### 5. Chat Is the Main Hub
Chat is the central interaction layer.

Chat handles:
- Voice messages
- Profile requests
- Reveal decisions
- Waiting states
- Profile revealed state
- Safety actions

### 6. Discover Flow
Discover shows blurred profile cards.

Before reveal, Discover cards may show:
- Blurred image
- Anonymous label
- Voice bio
- Interest chips
- Open Chat CTA

Before reveal, Discover must not show:
- Real name
- Clear face
- Exact age
- Exact city
- Full profile
- Social handles

### 7. Feed Flow
Feed uses a 3-column photo / video / audio grid.

Feed rules:
- No Live tab in MVP
- No recipient picker
- Feed tile opens Instant Content Detail
- Content owner identity stays hidden
- Detail screen can lead to Chat

### 8. Anonymous Voice Message
Voice messages are sent inside Chat.

Voice message MVP rules:
- Maximum voice length: 21 seconds
- Daily send limit: 7 voice messages per user
- Same-recipient daily limit: 3 voice messages
- Limits must be enforced server-side, not only in UI

### 9. Profile Reveal Request
A user can request to see another user's real profile.

The request happens inside Chat.

Request states:
- Pending
- Decided later
- Revealed
- Stayed hidden

Avoid harsh language like:
- Rejected
- Denied
- Access refused

Use calm language like:
- Profile stayed hidden for now
- Waiting for response
- You can keep chatting

### 10. Permission-Based Profile Reveal
Real profile visibility is permission-based.

Approved product rule:
- Request approval alone is not enough.
- Real profile visibility requires an active visibility grant.
- Block overrides visibility.

Correct logic:
approved request + active profile visibility grant + no active block = profile visible

### 11. Profile Screen
After reveal, the profile screen can show:
- Clear avatar
- Name
- Optional age if allowed
- Optional city only if allowed
- Bio
- Voice bio
- Interest chips
- Shared content

The profile screen must include:
- Top-right floating chat bubble
- Easy return to existing Chat

### 12. Instant Media
Instant media is part of MVP.

Supported MVP media:
- Instant photo
- Instant video
- Instant audio

Rules:
- Instant content does not reveal the real profile automatically.
- Instant profile is separate from real profile.
- Viewer can open Chat from content detail.
- Viewer can send a profile reveal request through Chat.
- Owner decides whether to reveal.

### 13. Block / Report
MVP must include safety basics.

Block must prevent:
- New voice messages
- Profile reveal requests
- Profile viewing
- Existing visibility grant usage
- Signed media URL access where applicable

Report must exist for:
- Voice message
- Chat
- Profile
- Instant content

### 14. Storage Privacy
Media must not be public by default.

Rules:
- Private storage
- Short-lived signed URLs
- Raw storage path must not return to frontend
- Storage path must not expose sender_user_id or owner_user_id

### 15. RLS Required
RLS is a critical security layer.

RLS must protect:
- sender_user_id
- owner_user_id
- raw_storage_path
- profile_visibility_grants
- reveal_requests
- blocks
- reports
- instant content ownership

Frontend must not rely on raw table access for sensitive flows.

### 16. Test Lab Required
MVP development must include localhost-only visual QA.

Test Lab checks:
- Profile hidden before grant
- Discover-to-Chat flow
- Feed-to-Detail-to-Chat flow
- Voice limit enforcement
- Reveal request handling
- Block override
- RLS leak checks
- Signed URL safety

Test Lab must not be enabled in production.

## Explicitly Out of MVP

Do not include in MVP:
- Dating-style swipe/match system
- Public real profile browsing
- Live streaming
- Full written chat as primary interaction
- Complex recommendation algorithm
- Payment system
- Advanced coin economy
- AI personality analysis
- Public comments
- Public likes as a main feature
- Location-heavy discovery
- Admin dashboard beyond basic future planning

## MVP Success Criteria

MVP is successful if:

1. User can create a real hidden profile.
2. User can browse blurred profiles in Discover.
3. User can browse 3-column media Feed.
4. User can open Chat from Discover.
5. User can open Content Detail from Feed and then Chat.
6. User can send a 21-second voice message inside Chat.
7. Voice limits are enforced.
8. Real profile remains hidden before permission.
9. User can request profile reveal.
10. Profile owner can reveal, decide later, or stay hidden.
11. Revealed profile includes a top-right chat bubble.
12. Block/report safety works.
13. RLS and storage privacy rules are respected.
14. Test Lab can verify critical flows.

## Notes
This document controls product scope.

If a future idea conflicts with MVP core, it must be deferred unless explicitly approved.

