# APP_USAGE_FLOW.md

## Overview
This document describes how a real user moves through ankion from first open to anonymous voice interaction, reveal request, reveal approval, Instant Feed discovery, profile viewing, and safety actions.

ankion is a dark-first, premium, mobile-native, voice-first anonymous social discovery app. The app must not feel like a dating app. Users create real accounts and required profiles, but first interactions remain anonymous. Chat is the central interaction hub. Voice messages are sent inside Chat. Real profile visibility exists only through valid `profile_visibility_grants` after owner approval.

## First App Open
1. User opens ankion.
2. Splash screen appears briefly.
3. User sees a calm onboarding entry that explains:
   - Start hidden.
   - Connect through voice.
   - Reveal only with trust.
4. User continues to account creation or login.

## Account Creation
1. User chooses an authentication method.
2. App creates or restores a real account.
3. If the user has no completed profile, app sends them to Profile Creation.
4. If the user has a completed profile, app sends them to the main authenticated app.
5. The app must not allow anonymous browsing without a real account.

## Profile Creation
1. User creates a required real profile.
2. User provides required profile basics.
3. User provides date of birth and gender during onboarding.
4. The app explains that real profile details are hidden before reveal approval.
5. User may add voice-first identity elements such as a voice bio if included in MVP scope.
6. After profile completion, user enters the main app.

## Home Structure
1. Main app uses four bottom tabs:
   - Chat
   - Feed
   - Discover
   - Profile
2. Chat is the central hub for conversations, voice sending, reveal requests, reveal decisions, and ongoing interaction.
3. Feed and Chat remain separate tabs.
4. Discover is for profile discovery and opens Chat directly.
5. Feed is for instant media discovery and opens Instant Content Detail first.
6. Profile contains the user's profile and account controls.

## Discover Flow
1. User opens Discover.
2. User sees blurred anonymous profile cards.
3. Cards may show anonymous labels, hidden profile cues, interest hints, and voice-first cues.
4. Cards must not show real name, clear photo, exact age, exact city, or full real profile before permission.
5. User taps a profile card.
6. App opens Chat directly with that person.
7. App must not show a separate recipient selection screen.

## Chat From Discover Flow
1. User lands in Chat after tapping a Discover profile card.
2. Chat header shows hidden or anonymous identity state.
3. The other user's real profile remains hidden.
4. User can send a voice message from Chat.
5. User can later receive or make a profile reveal request depending on the interaction state.
6. User can access safety actions from Chat.

## Voice Message Send Flow
1. User opens a Chat.
2. User starts voice recording from the Chat input area.
3. Recording is limited to 21 seconds.
4. User can send, cancel, or redo according to the approved voice interaction design.
5. Sent voice message appears inside Chat.
6. Recipient can listen while the sender's real profile remains hidden.
7. Sending a voice message does not automatically expose real profile data.

## Voice Limit Feedback Flow
1. Before sending, app checks daily voice limits.
2. User can send up to 7 voice messages per day total.
3. User can send up to 3 voice messages per day to the same recipient.
4. If the user reaches the total daily limit, app shows calm feedback that the daily voice limit has been reached.
5. If the user reaches the per-recipient daily limit, app shows calm feedback that they can continue later with this chat.
6. Feedback must not feel punitive or alarming.
7. The app must not use harsh language.

## Profile Reveal Request Flow
1. Recipient listens to or interacts in Chat while the sender remains hidden.
2. Recipient can request to see the sender's real profile.
3. Reveal request appears inside Chat as a calm inline state or sheet.
4. Request does not expose real profile data.
5. Request may remain pending while users continue chatting.
6. Recipient can request profile reveal later, not necessarily immediately after the first voice message.

## Reveal Approval Flow
1. Sender receives a reveal request.
2. Sender sees a calm decision state.
3. Sender can approve the reveal.
4. Approval creates or activates `profile_visibility_grants`.
5. Real profile data becomes visible only when a valid grant exists and no block applies.
6. Approved request status alone must not expose real profile data.
7. After reveal, user can open the full profile and return easily to Chat.

## Reveal Hidden / Waiting Flow
1. Sender can choose to keep hidden or decide later.
2. App uses calm copy such as:
   - Profile stayed hidden for now.
   - Waiting for response.
   - You can keep chatting.
3. App must not use "Rejected" or "Denied."
4. Chat can continue while profile remains hidden.
5. No real profile fields become visible without a valid `profile_visibility_grants` record.

## Instant Feed Flow
1. User opens Feed.
2. User sees a 3-column grid of photo, video, and audio content.
3. Instant content may have an anonymous media identity.
4. Feed content must not expose real profile automatically.
5. User taps a feed tile.
6. App opens Instant Content Detail first.
7. App must not open a recipient picker.

## Instant Content Detail Flow
1. User views selected photo, video, or audio detail.
2. Detail screen may show anonymous media identity and content context.
3. Real owner profile remains hidden unless already revealed through a valid grant.
4. User can choose to enter Chat from the detail screen.
5. User can use safety actions if needed.
6. Detail viewing alone never creates profile visibility.

## Chat From Instant Content Flow
1. User taps Chat from Instant Content Detail.
2. App opens Chat with the content owner or related anonymous identity.
3. Chat header preserves hidden identity unless a valid reveal grant exists.
4. User sends voice from Chat.
5. Reveal requests and decisions happen inside Chat.
6. No separate recipient selection screen appears.

## Profile Screen Flow
1. User opens Profile tab.
2. User sees their own profile controls and visibility-related context.
3. If viewing a revealed person's full profile, the screen shows approved visible details only.
4. Full Profile screen must include a top-right floating chat bubble.
5. Tapping the floating chat bubble returns to the existing Chat.
6. Profile screen must not encourage dating-app patterns such as swipe, match, or heart-heavy behavior.

## Anonymous Media Profile Flow
1. Instant media can be associated with an anonymous media identity.
2. Anonymous media identity may show mood, content type, voice cues, or hidden profile labels.
3. Anonymous media identity must not expose:
   - Real name.
   - Clear real profile photo.
   - Exact age.
   - Exact city.
   - `sender_user_id`.
   - `owner_user_id`.
   - Raw storage path.
4. If profile reveal has already been granted and no block applies, approved profile details may appear according to visibility rules.

## Block / Safety Flow
1. User can access safety actions from Chat, Profile, and Instant Content Detail.
2. User can block, report, hide, or mute where applicable.
3. Block immediately overrides all access.
4. Block prevents profile visibility even if a previous grant exists.
5. Block prevents further interaction where required by safety rules.
6. Safety copy must be calm and clear.
7. Safety screens must avoid oversized warning visuals and harsh red states.

## Empty States
1. Empty Chat:
   - Explain that voice conversations will appear here.
   - Offer calm entry points to Discover or Feed.
2. Empty Discover:
   - Explain that new hidden profiles will appear when available.
3. Empty Feed:
   - Explain that new instant content will appear when available.
4. Empty Requests:
   - Explain that profile requests will appear inside Chat.
5. Empty Notifications:
   - Explain that voice messages, reveal responses, and chat activity will appear here.

## Error States
1. Voice upload failure:
   - Keep the user in Chat.
   - Offer retry or discard.
2. Voice length exceeded:
   - Stop at 21 seconds or ask user to redo according to final UX.
3. Daily voice limit reached:
   - Show calm limit feedback.
4. Per-recipient voice limit reached:
   - Show calm per-chat limit feedback.
5. Reveal request unavailable:
   - Explain that the profile cannot be requested right now.
6. Profile unavailable:
   - Do not leak whether the cause is block, privacy, or missing permission.
7. Media unavailable:
   - Do not expose raw storage paths.
8. Signed URL expired:
   - Refresh access through backend rules or show a calm retry state.

## End-to-End Example Journey
1. A new user opens ankion.
2. They create a real account.
3. They create a required real profile.
4. They enter the app and open Discover.
5. They tap a blurred profile card.
6. Chat opens directly.
7. They record and send a 21 second anonymous voice message.
8. The recipient listens while the sender remains hidden.
9. Later, the recipient asks to see the sender's profile.
10. The sender sees the request in Chat.
11. The sender chooses to approve.
12. App creates `profile_visibility_grants`.
13. The recipient can now see approved profile details.
14. The recipient opens the full profile.
15. The recipient taps the top-right floating chat bubble.
16. The existing Chat opens again.
17. If either user blocks the other, all access is overridden.

## Backend Notes From Usage Flow
1. Real account and profile creation are required before main app access.
2. Chat must be addressable from Discover cards without a recipient picker.
3. Feed must route through Instant Content Detail before Chat.
4. Voice limits must be enforceable by user, day, recipient, and duration.
5. Reveal request state must be separate from actual profile visibility.
6. `profile_visibility_grants` is the source of truth for real profile visibility.
7. Approved status alone must not reveal real profile data.
8. Blocks must override chat access, profile visibility, media access, and grants.
9. Private storage is required.
10. Signed URLs must be short-lived.
11. Raw storage paths must never return to frontend.
12. Internal identifiers such as `sender_user_id` and `owner_user_id` must not leak to frontend.
13. RLS policy matrix must be designed before implementation.

## Test Lab Scenarios Generated From This Flow
1. First app open to account creation.
2. Account creation to required profile completion.
3. Discover card opens Chat directly.
4. Discover flow never shows recipient picker.
5. Chat sends a 21 second voice message.
6. Total daily voice limit blocks the 8th send with calm feedback.
7. Per-recipient limit blocks the 4th same-recipient send with calm feedback.
8. Recipient requests profile reveal from Chat.
9. Sender approves reveal and profile becomes visible through `profile_visibility_grants`.
10. Approved request status without grant does not reveal profile.
11. Sender chooses to stay hidden and Chat remains usable.
12. Feed tile opens Instant Content Detail.
13. Instant Content Detail opens Chat.
14. Instant content does not expose real profile automatically.
15. Full Profile screen includes top-right floating chat bubble.
16. Floating chat bubble returns to existing Chat.
17. Block overrides existing profile visibility.
18. Signed URL expiry does not expose raw storage path.
19. Frontend payloads do not expose `sender_user_id` or `owner_user_id`.
20. Empty and error states use calm, human copy.

