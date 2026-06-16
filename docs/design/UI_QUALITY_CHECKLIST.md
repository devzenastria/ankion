# UI_QUALITY_CHECKLIST.md

## Purpose

Define quality checks for ankion UI work.

This checklist is used before approving UI prompts, generated designs, Figma screens, component drafts, web screens, mobile screens, and Test Lab visual states.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Source References

UI work must stay aligned with:

- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`
- `docs/design/DESIGN_TOKENS.md`
- `docs/design/COMPONENT_SYSTEM.md`
- `docs/design/SCREEN_MAP.md`
- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/security/PRIVACY_MODEL.md`
- `docs/security/SECURITY_RULES.md`
- `docs/testing/TEST_LAB.md`
- `docs/testing/RLS_LEAK_TESTS.md`

## Important Boundary

This checklist does not authorize implementation.

Do not create:

- app code
- React components
- React Native screens
- CSS/theme files
- Tailwind config
- package setup
- framework initialization
- Supabase config
- migrations
- RLS SQL

Implementation requires final deep analysis and explicit user approval.

---

# UI Quality Gate Summary

A UI direction is approved only if it passes these gates:

1. Dark-first premium mobile feel.
2. Voice-first interaction hierarchy.
3. Anonymous-first discovery.
4. Chat as central interaction hub.
5. Discover opens Chat directly.
6. Feed opens Instant Detail, then Chat.
7. No separate recipient selection screen.
8. No dating-app visual pattern.
9. Reveal is permission-based.
10. Real profile stays hidden before grant.
11. Instant content never reveals real profile.
12. Safe DTO mindset is preserved.
13. Sensitive fields are not visible.
14. Calm copy is used.
15. Test Lab can verify critical states.

---

# Approval Status Legend

Use this status format when reviewing screens:

| Status | Meaning |
| --- | --- |
| `PASS` | Meets requirement |
| `FAIL` | Violates requirement |
| `NEEDS_FIX` | Mostly correct but requires targeted change |
| `DEFERRED` | Not required for immediate MVP |
| `BLOCKER` | Must be fixed before implementation |

---

# 1. Brand / Visual Direction Checklist

## Must Pass

- [ ] UI is dark-first by default.
- [ ] UI feels premium, modern, cinematic, and mobile-native.
- [ ] Surfaces use soft elevation, blur, radius, and subtle borders.
- [ ] Voice and privacy moments feel visually important.
- [ ] App does not look like a generic website.
- [ ] App does not look like a dating app.
- [ ] App does not use cheap neon overload.
- [ ] App does not use harsh warning-card visuals for normal privacy states.
- [ ] Typography is readable and calm.
- [ ] Spacing feels native to mobile.
- [ ] Buttons are thumb-friendly.
- [ ] Main CTA hierarchy is clear.
- [ ] Feed grid feels dense and mobile-native.
- [ ] Chat feels clean and emotionally central.

## Blockers

- [ ] Light-first UI as default.
- [ ] Swipe/match visual language.
- [ ] Public-profile social network look.
- [ ] Oversized alert/error styling for normal hidden profile states.
- [ ] UI feels like admin dashboard.
- [ ] UI feels like a generic dating app.

---

# 2. Product Flow Checklist

## Main Flow

- [ ] Welcome explains the product in under 10 seconds.
- [ ] Onboarding explains that real account exists but first contact is anonymous.
- [ ] Profile setup explains real profile stays private until permission.
- [ ] Discover card tap opens Chat directly.
- [ ] Feed tile tap opens Instant Content Detail.
- [ ] Instant Content Detail opens Chat.
- [ ] Chat is the central interaction hub.
- [ ] Voice recording happens inside Chat.
- [ ] Reveal request happens inside Chat.
- [ ] Reveal decision happens inside Chat or safe notification-to-Chat context.
- [ ] Profile screen includes top-right floating chat bubble.
- [ ] Safety actions are reachable from Chat/Profile context.

## Must Not Exist

- [ ] No separate recipient selection screen.
- [ ] No Match tab.
- [ ] No Live tab in MVP.
- [ ] No public real-profile browsing.
- [ ] No “like to reveal” mechanic.
- [ ] No reveal request directly from public Feed outside Chat.

---

# 3. Voice-First Checklist

## Voice UI

- [ ] Voice recorder is visually primary in Chat.
- [ ] Recorder has clear idle, recording, review, sending, sent, disabled, and limit states.
- [ ] Recording timer is visible.
- [ ] 21-second duration limit is represented.
- [ ] Voice waveform or equivalent audio visual exists.
- [ ] Playback control is clear.
- [ ] Voice bubbles are readable and tappable.
- [ ] Voice message duration is visible.
- [ ] Voice composer remains thumb-friendly.
- [ ] Voice limit messages are calm and clear.

## Voice Limits

- [ ] Daily 7 voice send limit is represented.
- [ ] Same-recipient 3 voice send limit is represented.
- [ ] UI shows remaining count where relevant.
- [ ] Limit reached state does not shame user.
- [ ] UI does not imply frontend is source of truth.
- [ ] Server-side enforcement is noted for later implementation.

## Blockers

- [ ] Text chat visually dominates the MVP.
- [ ] Voice recorder is hidden or secondary.
- [ ] 21-second rule is missing.
- [ ] Limit state has no UI.
- [ ] Limit state uses harsh failure language.

---

# 4. Discover Checklist

## Discover Screen

- [ ] Discover uses anonymous profile cards.
- [ ] Real profile fields are hidden.
- [ ] Hidden profile preview is intentional and premium.
- [ ] Voice-first CTA or hint exists.
- [ ] Card tap opens Chat.
- [ ] No recipient picker appears.
- [ ] No full profile opens before reveal.
- [ ] No real name is shown before reveal.
- [ ] No real avatar is shown before reveal.
- [ ] No location dependency is introduced.
- [ ] Anonymous state is clear but not suspicious.

## Safe Data Mindset

- [ ] Screen can be powered by `safe_discover_profile`.
- [ ] UI does not need `owner_user_id`.
- [ ] UI does not need `recipient_user_id`.
- [ ] UI does not need raw profile row.

---

# 5. Feed / Instant Checklist

## Feed

- [ ] Feed uses 3-column grid.
- [ ] Feed supports photo tiles.
- [ ] Feed supports video tiles.
- [ ] Feed supports audio tiles.
- [ ] Media type is clear.
- [ ] Tile tap opens Instant Content Detail.
- [ ] Feed does not show real profile owner identity.
- [ ] Feed does not expose raw media paths.
- [ ] Feed does not include Live tab in MVP.

## Instant Content Detail

- [ ] Detail displays selected photo/video/audio.
- [ ] Anonymous instant profile is shown.
- [ ] Instant profile is visually separate from real profile.
- [ ] Follow action follows instant profile only.
- [ ] Instant follow does not reveal real profile.
- [ ] Detail has CTA/path to Chat.
- [ ] Real profile reveal still happens only inside Chat.
- [ ] Storage path is not visible.
- [ ] Block/unavailable states are represented.

## Safe Data Mindset

- [ ] Feed can use `safe_feed_tile`.
- [ ] Detail can use `safe_instant_content_detail`.
- [ ] UI does not need `owner_user_id`.
- [ ] UI does not need `storage_path`.

---

# 6. Chat Checklist

## Chat Room

- [ ] Chat header supports anonymous state.
- [ ] Chat header supports revealed state only when safe.
- [ ] Chat header supports pending state.
- [ ] Chat header supports blocked/unavailable state.
- [ ] Voice timeline is clear.
- [ ] Voice composer is primary.
- [ ] Reveal request action is available when allowed.
- [ ] Reveal request is not available when blocked/unavailable.
- [ ] Safety actions are reachable.
- [ ] Remaining voice count is visible where relevant.
- [ ] Chat copy is calm and human.
- [ ] Chat does not require recipient picker.

## Safe Data Mindset

- [ ] Chat can use `safe_chat_room`.
- [ ] Voice bubble can use `safe_voice_message`.
- [ ] Reveal state can use `safe_reveal_request_state`.
- [ ] UI does not need raw participant rows.
- [ ] UI does not expose sender/recipient IDs.
- [ ] UI does not expose raw storage paths.

---

# 7. Reveal Checklist

## Reveal Request

- [ ] Reveal request happens inside Chat.
- [ ] Button copy is calm.
- [ ] Turkish copy can use: `Profilini görmek istiyorum`.
- [ ] Request creation does not reveal profile.
- [ ] Pending state is visible.
- [ ] Waiting state is calm.
- [ ] Request state does not expose unsafe IDs.

## Reveal Decision

- [ ] Owner sees reveal request card.
- [ ] Owner can choose Show profile.
- [ ] Owner can choose Stay hidden.
- [ ] Owner can choose Decide later.
- [ ] Stay hidden keeps profile hidden.
- [ ] Decide later keeps profile hidden.
- [ ] Show profile requires backend grant later.
- [ ] UI does not reveal based on local state only.

## Required Formula

UI must respect this model:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

## Copy Rules

Allowed:

- [ ] Show profile
- [ ] Stay hidden
- [ ] Decide later
- [ ] Still private
- [ ] Waiting for permission
- [ ] Profile is visible now

Avoid:

- [ ] Rejected
- [ ] Denied
- [ ] Failed
- [ ] Forbidden
- [ ] Reddedildi
- [ ] Yasak
- [ ] Erişim reddedildi

## Blockers

- [ ] Profile appears after request alone.
- [ ] Profile appears after approval without grant.
- [ ] Profile remains visible after block.
- [ ] UI uses harsh rejection language.

---

# 8. Profile Checklist

## Own Profile

- [ ] Owner can see own real profile.
- [ ] Profile explains visibility/privacy.
- [ ] Top-right floating chat bubble exists.
- [ ] Edit/manage entry is clear if present.
- [ ] UI does not imply profile is public by default.

## Other User Safe Profile View

- [ ] Before reveal, hidden profile state is shown.
- [ ] Hidden state does not show real name.
- [ ] Hidden state does not show real avatar.
- [ ] Hidden state does not show real bio.
- [ ] Hidden state does not show location.
- [ ] Revealed state shows only safe fields.
- [ ] Blocked state hides/restricts profile again.
- [ ] Profile media uses safe access direction only.
- [ ] UI does not expose raw profile row.

---

# 9. Privacy / Security UI Checklist

## Never-Leak UI Fields

UI must not show, require, or display in debug panels:

- [ ] `auth_user_id`
- [ ] `user_id` where unsafe
- [ ] `sender_user_id`
- [ ] `owner_user_id`
- [ ] `profile_owner_user_id`
- [ ] `viewer_user_id`
- [ ] `requester_user_id`
- [ ] `recipient_user_id`
- [ ] `blocker_user_id`
- [ ] `blocked_user_id`
- [ ] `reporter_user_id`
- [ ] `reported_user_id`
- [ ] `raw_storage_path`
- [ ] `storage_path`
- [ ] bucket internals
- [ ] file audit internals
- [ ] moderation internals
- [ ] hidden real profile fields before reveal
- [ ] raw grant internals
- [ ] raw reveal internals where unsafe

## Safe DTO Mindset

- [ ] Discover uses safe discover data.
- [ ] Feed uses safe tile data.
- [ ] Instant detail uses safe detail data.
- [ ] Chat uses safe room/message data.
- [ ] Reveal uses safe state data.
- [ ] Profile uses safe profile view.
- [ ] Notifications use safe notification data.

## Blockers

- [ ] UI design requires raw database rows.
- [ ] UI design shows raw IDs.
- [ ] UI design shows storage paths.
- [ ] UI design shows moderation internals.
- [ ] UI design reveals hidden profile fields before grant.

---

# 10. Storage / Media UI Checklist

## Media Display

- [ ] Media UI assumes private storage.
- [ ] UI does not show raw storage paths.
- [ ] UI does not show bucket names.
- [ ] UI can handle signed URL unavailable/expired states.
- [ ] UI can handle blocked media access.
- [ ] UI can handle deleted media.
- [ ] Voice playback unavailable state is calm.
- [ ] Instant media unavailable state is calm.

## Good UI Assumption

UI should assume media access is represented by a safe playable/viewable media reference, not raw storage path.

## Blockers

- [ ] UI design exposes storage path.
- [ ] UI design treats media as public forever.
- [ ] UI cannot handle expired signed URLs.
- [ ] UI ignores block-based media restriction.

---

# 11. Notification Checklist

## Notification UI

- [ ] New voice notification preserves anonymity.
- [ ] Reveal request notification preserves anonymity.
- [ ] Reveal approved notification only shows safe state.
- [ ] Instant follow notification does not reveal real profile.
- [ ] Notification tap opens safe Chat context.
- [ ] Notification copy is calm.
- [ ] Notification does not show hidden real profile.

## Example Safe Copy

```txt
You received a new voice.
```

```txt
Someone wants to see your profile after hearing your voice.
```

## Blockers

- [ ] Notification preview reveals real name before grant.
- [ ] Notification includes unsafe IDs.
- [ ] Notification includes raw media link.

---

# 12. Safety / Report Checklist

## Safety UI

- [ ] Block action is reachable.
- [ ] Report action is reachable.
- [ ] Safety sheet is calm and clear.
- [ ] Report reason selection is simple.
- [ ] Reporter identity is not shown.
- [ ] Reported user does not see reporter identity.
- [ ] Moderation internals are not visible.
- [ ] Blocked state hides/restricts profile/media where applicable.

## Copy

Allowed:

- Block
- Report
- This content is unavailable
- You can control this interaction

Avoid:

- Public accusation language
- Internal moderation codes
- Aggressive threat copy

---

# 13. Accessibility Checklist

## Visual Accessibility

- [ ] Text contrast is readable on dark background.
- [ ] Secondary text is still readable.
- [ ] Primary actions are visually clear.
- [ ] Touch targets are at least 44px.
- [ ] Voice record control is thumb-friendly.
- [ ] Reveal decision buttons are easy to tap.
- [ ] Privacy state is not communicated by color alone.
- [ ] Hidden state uses text + visual treatment.
- [ ] Blocked state uses text + visual treatment.
- [ ] Reduced motion can be supported later.
- [ ] Focus states are planned for web.

## Blockers

- [ ] Critical state communicated only by color.
- [ ] Tiny reveal buttons.
- [ ] Tiny voice controls.
- [ ] Low-contrast text.
- [ ] Motion-heavy reveal with no reduced-motion direction.

---

# 14. Copy / Language Checklist

## Tone

- [ ] Copy is calm.
- [ ] Copy is short.
- [ ] Copy is human.
- [ ] Copy avoids blame.
- [ ] Copy does not pressure users to reveal.
- [ ] Copy makes privacy feel normal.

## Preferred Turkish Copy

- [ ] Profilini görmek istiyorum
- [ ] Profilini göster
- [ ] Gizli kal
- [ ] Sonra karar ver
- [ ] Profil hâlâ gizli
- [ ] İzin bekleniyor
- [ ] Profil artık görünür
- [ ] Bugünkü ses hakkın doldu
- [ ] Bu kişiye bugün daha fazla ses gönderemezsin

## Avoid Turkish Copy

- [ ] Reddedildi
- [ ] Engellendin
- [ ] Yasak
- [ ] Erişim reddedildi
- [ ] Başarısız

---

# 15. Test Lab UI Checklist

## Test Lab Requirements

- [ ] Test Lab is localhost-only.
- [ ] Test Lab uses fake data only.
- [ ] Test Lab is disabled in production.
- [ ] Test Lab shows visual PASS/FAIL.
- [ ] Test Lab does not use production secrets.
- [ ] Test Lab does not use real user data.
- [ ] Test Lab can inspect fake payloads for leaks.
- [ ] Test Lab visually displays hidden/pending/revealed/blocked states.
- [ ] Test Lab checks raw storage path leaks.
- [ ] Test Lab checks sensitive ID leaks.
- [ ] Test Lab checks production guard.

## Required Test Lab Scenarios

- [ ] Discover-to-Chat.
- [ ] Feed-to-Detail-to-Chat.
- [ ] Hidden profile before reveal.
- [ ] Voice duration limit.
- [ ] Daily voice send limit.
- [ ] Same-recipient voice send limit.
- [ ] Reveal request.
- [ ] Approved request without grant.
- [ ] Grant reveals profile.
- [ ] Stay hidden keeps hidden.
- [ ] Decide later keeps hidden.
- [ ] Block overrides grant.
- [ ] Instant follow cannot reveal real profile.
- [ ] Coin/follower entitlement cannot reveal real profile.
- [ ] Raw storage path leak check.
- [ ] Sensitive ID leak check.
- [ ] Notification privacy.
- [ ] Report privacy.
- [ ] Production guard.

---

# 16. Screen-Specific Approval Checklist

## Welcome

- [ ] Product promise is clear.
- [ ] No dating-app positioning.
- [ ] Anonymous-first and voice-first are clear.
- [ ] CTA is simple.

## Auth

- [ ] Real account + anonymous first interaction explained.
- [ ] Auth screen does not feel scary.
- [ ] No auth internals visible.

## Profile Setup

- [ ] Real profile privacy is explained.
- [ ] Profile is not presented as public by default.
- [ ] Setup feels short and mobile-native.

## Discover

- [ ] Anonymous cards.
- [ ] Tap opens Chat.
- [ ] No full real profile.
- [ ] No recipient picker.

## Feed

- [ ] 3-column grid.
- [ ] Photo/video/audio support.
- [ ] Tap opens Instant Detail.
- [ ] No real identity leak.

## Instant Detail

- [ ] Anonymous instant identity.
- [ ] Follow does not reveal real profile.
- [ ] CTA opens Chat.
- [ ] No raw storage path.

## Chat

- [ ] Voice-first.
- [ ] Voice limits visible.
- [ ] Reveal action exists.
- [ ] Safety actions exist.
- [ ] Hidden/revealed states clear.

## Reveal

- [ ] Request does not reveal profile.
- [ ] Owner decision is pressure-free.
- [ ] Grant required for visibility.
- [ ] Block overrides reveal.

## Profile

- [ ] Own profile visible to owner.
- [ ] Other profile hidden before reveal.
- [ ] Floating chat bubble exists.
- [ ] Safe profile view only after grant.

## Safety

- [ ] Block/report easy to find.
- [ ] Report is private.
- [ ] Block changes visibility/access.

---

# 17. Design Review Output Template

Use this format when reviewing a screen or UI set:

```md
## UI Review Result

**Area:** [screen/component/flow name]  
**Status:** PASS / NEEDS_FIX / FAIL / BLOCKER  

### Passed

- ...

### Needs Fix

- ...

### Blockers

- ...

### Required Changes

1. ...

### Do Not Change

- ...

### Approval

Approved / Not approved
```

---

# 18. Implementation Readiness Checklist

UI is ready for implementation only if:

- [ ] UI/UX master prompt is approved.
- [ ] Final UI generation prompt is approved.
- [ ] Design tokens are filled.
- [ ] Component system is filled.
- [ ] Screen map is filled.
- [ ] UI quality checklist is filled.
- [ ] Product flow docs are aligned.
- [ ] Security/privacy docs are aligned.
- [ ] RLS leak test expectations are aligned.
- [ ] Test Lab expectations are aligned.
- [ ] Final documentation review is complete.
- [ ] Final deep analysis is complete.
- [ ] User explicitly approves implementation.

If any item is missing, do not start implementation.

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
