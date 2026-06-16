# Static MVP Visual Polish Audit

## Phase

Phase 15B — Documentation-only Static MVP Visual Polish Audit

## Purpose

This document audits the current static MVP screens for visual clarity, text density, scroll rhythm, premium app feeling, repeated copy, and polish priority.

This phase is documentation-only.

No route UI changes are included in Phase 15B.

---

## Current Static Screens

The current mobile app includes:

- Home
- Discover
- Feed
- Chat
- Profile
- Reveal Requests

All screens are currently static and behavior-free.

No backend, recorder, audio, reveal logic, upload behavior, mock data, tabs, router.push, or new navigation behavior is active.

---

## Visual Audit Criteria

Each screen is reviewed against:

1. Premium app feeling
2. Mobile-native rhythm
3. Text density
4. Scroll balance
5. Repeated privacy copy
6. Clear primary direction
7. Avoidance of dating-app patterns
8. Avoidance of fake data feeling
9. Voice-first clarity
10. Readiness for future behavior

---

## Screen Audit

### Home

Current status:

Home has been upgraded from route shell to premium static app entry.

Strengths:

- Stronger brand entry
- Clear app purpose
- Better than developer route list
- Existing Link-based navigation preserved

Issues:

- Still explanatory
- Needs stronger first-screen impact later
- Could feel more like a real app home with less text

Polish priority:

High

Recommended future polish:

- Reduce hero copy
- Make primary path more visual
- Make Discover and Feed feel like natural primary actions
- Keep secondary routes lower

---

### Discover

Current status:

Discover works as a calm anonymous voice-first entry surface.

Strengths:

- Avoids dating-card pattern
- Keeps profile hidden
- Leads naturally to Chat
- Clear privacy framing

Issues:

- Text-heavy
- Needs more “discovery” feeling later
- Current static surface still explains more than it shows

Polish priority:

Medium-high

Recommended future polish:

- Reduce explanation
- Strengthen top card
- Keep no fake users/profiles
- Make Chat direction feel more natural

---

### Feed

Current status:

Feed prepares future 3-column photo/video/audio grid direction.

Strengths:

- Static grid preview helps product direction
- Avoids real/fake media
- Explains media-to-chat flow
- Keeps instant media anonymous

Issues:

- Static grid may feel placeholder-like
- Text can be compressed
- Future grid visual rhythm needs refinement

Polish priority:

Medium-high

Recommended future polish:

- Improve grid preview spacing
- Reduce explanatory copy
- Preserve no mock media rule
- Keep Feed distinct from Discover

---

### Chat

Current status:

Chat is the strongest product concept screen. It explains anonymous voice, future composer, lifecycle, and reveal education.

Strengths:

- Clear central interaction hub
- Voice-first direction is strong
- Reveal logic is understandable
- Duplicate explanation was already reduced

Issues:

- Still long
- Still education-heavy
- Future top area should become more action-oriented
- Some privacy/reveal copy may repeat

Polish priority:

High

Recommended future polish:

- Compress lifecycle copy
- Make composer visually stronger
- Keep reveal education but reduce length
- Preserve static/behavior-free state

---

### Profile

Current status:

Profile acts as owner-controlled visibility center.

Strengths:

- Does not look like dating profile
- Avoids fake identity data
- Clearly separates anonymous activity from real identity
- Future controls are passive

Issues:

- Can feel like a settings/privacy screen
- Needs more personal product warmth later
- Future profile edit planning will be needed before real profile UI

Polish priority:

Medium

Recommended future polish:

- Make it feel less defensive
- Keep owner-control model
- Avoid fake name/avatar/bio
- Plan future real profile structure separately

---

### Reveal Requests

Current status:

Reveal Requests acts as calm permission review surface.

Strengths:

- Avoids harsh decision language
- Avoids approve/reject behavior
- Permission model is clear
- No fake requesters

Issues:

- Still abstract because no real requests exist
- Needs stronger future empty-state design later
- Copy can be shorter

Polish priority:

Medium

Recommended future polish:

- Compress copy
- Keep calm review model
- Avoid fake request cards
- Plan request-list behavior later

---

## Cross-Screen Issues

### 1. Text Density

Several screens explain the product heavily.

Decision:

Reduce text gradually after static flow remains stable.

Priority:

High

---

### 2. Scroll Rhythm

Screens are scrollable and card-based, but some may feel long.

Decision:

Improve card spacing and top-section hierarchy before adding behavior.

Priority:

High

---

### 3. Repeated Privacy Copy

Privacy is clear, but repeated across many cards.

Decision:

Keep privacy visible but reduce duplicate phrasing later.

Priority:

Medium-high

---

### 4. Component Repetition

Many cards repeat similar visual structure.

Decision:

Plan component extraction before creating reusable components.

Priority:

Medium

---

### 5. Token Consistency

Several screens use hardcoded colors and repeated style values.

Decision:

Plan token/component cleanup later, but do not refactor yet.

Priority:

Medium

---

### 6. Navigation Feeling

Home improved, but navigation is still Link-based and static.

Decision:

Keep current Link approach until navigation system is explicitly planned.

Priority:

Medium

---

## Polish Priority Order

Recommended order:

1. Chat polish planning
2. Home polish refinement
3. Discover / Feed copy compression
4. Profile / Reveal Requests copy compression
5. Static component extraction planning
6. Token consistency planning
7. Navigation system planning

---

## Recommended Next Phases

### Phase 15C — Chat Static Visual Compression Plan

Documentation-only.

Goal:

Plan how to reduce Chat text density while keeping core voice/reveal meaning.

No code.

---

### Phase 15D — Home Static Entry Polish Plan

Documentation-only.

Goal:

Plan how Home can feel more like a real app entry with less explanation.

No code.

---

### Phase 15E — Static Card Pattern Extraction Plan

Documentation-only.

Goal:

Plan reusable static card patterns before creating components.

No component creation yet.

---

### Phase 15F — Static MVP Polish Audit + Docs Alignment

Codex audit after Phase 15B–15E.

Goal:

Align docs/status and confirm no forbidden behavior was added.

---

## Forbidden Areas

Do not add:

- Supabase
- Auth
- RLS
- Storage
- Migrations
- Backend/API
- Mock users
- Mock profiles
- Mock media
- Mock messages
- Mock reveal data
- Voice recorder
- Real audio
- Play/pause behavior
- Reveal logic
- Approve/reject logic
- Upload behavior
- Package installs
- package.json changes
- pnpm-lock.yaml changes
- apps/web source changes
- Shared packages
- Tabs
- router.push
- New navigation behavior

---

## Acceptance Criteria for Phase 15B

Phase 15B is complete when:

- This document exists.
- No route files changed.
- No component files changed.
- No package files changed.
- No lockfile changed.
- No backend/security/data files were added.
- Static screen visual debts are documented.
- Polish priority order is clear.
- No real behavior is introduced.

---

## Current Decision

The static MVP is visually coherent enough to continue.

The next best step is not backend or recorder.

The next best step is targeted static polish planning, starting with Chat visual compression.

## Phase 15F Alignment Note

Phase 15F confirms the Phase 15 static polish sequence is aligned:

- Phase 15A Static MVP Readiness Plan completed.
- Phase 15B Static MVP Visual Polish Audit completed.
- Phase 15C Chat Static Visual Compression Plan completed.
- Phase 15D Chat Static Copy Compression Implementation completed.
- Phase 15E local validation passed after Chat compression.
- Phase 15F docs/status alignment completed.

Chat remains static and behavior-free, with compressed copy and no recorder, audio, reveal, upload, backend/API, data, package, lockfile, or new navigation behavior.
