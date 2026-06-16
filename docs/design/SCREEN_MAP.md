# SCREEN_MAP.md

## Purpose

Map the approved screens, navigation relationships, route intent, privacy boundaries, and MVP screen ownership for ankion.

This file explains which screens exist, how users move between them, which screens can open Chat, and which screens must keep the real profile hidden.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Source References

This screen map must stay aligned with:

- `docs/product/MVP_CORE.md`
- `docs/product/APP_USAGE_FLOW.md`
- `docs/product/USER_JOURNEY.md`
- `docs/product/CHAT_FLOW.md`
- `docs/product/REVEAL_FLOW.md`
- `docs/product/INSTANT_FLOW.md`
- `docs/design/ANKION_UI_UX_MASTER_PROMPT.md`
- `docs/design/ANKION_FINAL_UI_GENERATION_PROMPT.md`
- `docs/design/DESIGN_TOKENS.md`
- `docs/design/COMPONENT_SYSTEM.md`
- `docs/security/PRIVACY_MODEL.md`
- `docs/security/SECURITY_RULES.md`

## Important Boundary

This file is a navigation and screen planning document only.

It does not create:

- routes
- app code
- React components
- React Native screens
- Next.js files
- Expo files
- package setup
- Supabase setup
- database schema
- RLS policies

Implementation must not start from this file alone.

---

# Core Navigation Rule

ankion does not use a separate recipient selection screen.

Approved flow:

```txt
Discover Profile Card -> Chat
Feed Tile -> Instant Content Detail -> Chat
Existing Chat -> Chat
Profile Floating Chat Bubble -> Chat where allowed
```

Rejected flow:

```txt
Choose recipient -> Compose message -> Send
```

Chat is the central interaction hub.

---

# Primary App Navigation

## Main Tabs

| Tab | Screen | Purpose | MVP |
| --- | --- | --- | --- |
| Discover | `DiscoverScreen` | Anonymous people discovery | Yes |
| Feed | `FeedScreen` | 3-column instant media grid | Yes |
| Chat | `ChatListScreen` / `ChatRoomScreen` | Voice-first conversations | Yes |
| Profile | `ProfileScreen` | Own profile and privacy control | Yes |

## Required Tab Rules

- No separate recipient picker tab.
- No Live tab in MVP.
- No dating-style Match tab.
- No public profile browser tab.
- Chat must feel central.
- Discover and Feed must lead toward Chat.

---

# MVP Screen Inventory

| Screen ID | Screen Name | Purpose | Entry | Exit | Real Profile Visibility |
| --- | --- | --- | --- | --- | --- |
| `S-001` | Welcome | Explain ankion promise | App launch | Auth | Hidden |
| `S-002` | Auth | Sign up / login | Welcome | Profile Setup / Home | Hidden |
| `S-003` | Profile Setup | Create real profile | Auth | Home | Owner only |
| `S-004` | Discover | Anonymous profile discovery | Main tab | Chat | Hidden |
| `S-005` | Feed | Instant media grid | Main tab | Instant Detail | Hidden |
| `S-006` | Instant Content Detail | View anonymous media | Feed | Chat | Hidden |
| `S-007` | Chat List | Existing conversations | Main tab | Chat Room | Conditional |
| `S-008` | Chat Room | Voice, reveal, safety | Discover / Detail / Chat List | Reveal/Profile/Safety | Conditional |
| `S-009` | Reveal Request State | Request profile reveal | Chat Room | Pending state | Hidden |
| `S-010` | Reveal Decision State | Owner decides | Chat / Notification | Hidden or Revealed | Owner-controlled |
| `S-011` | Safe Profile View | Hidden or revealed profile | Chat / Profile Bubble | Chat/Profile | Conditional |
| `S-012` | Own Profile | Manage own profile | Main tab | Edit/Profile Chat | Owner visible |
| `S-013` | Notifications | Privacy-safe activity | System / tab later | Chat | Hidden unless safe |
| `S-014` | Safety / Report | Block/report flow | Chat/Profile | Chat/Profile | Hidden |
| `S-015` | Settings | Account/privacy settings | Profile | Profile | Owner only |
| `S-016` | Dev Test Lab | Visual QA | Localhost only | Test sections | Fake data only |

---

# Screen Relationship Map

## Main MVP Flow

```txt
Welcome
  -> Auth
    -> Profile Setup
      -> Discover
      -> Feed
      -> Chat List
      -> Own Profile
```

## Discover Flow

```txt
Discover
  -> tap anonymous DiscoverCard
    -> Chat Room
      -> send voice
      -> receive voice
      -> request profile reveal
      -> reveal decision
      -> Safe Profile View if grant exists
```

## Feed / Instant Flow

```txt
Feed
  -> tap FeedTile
    -> Instant Content Detail
      -> follow anonymous instant profile
      -> open Chat
        -> send voice
        -> request reveal
```

## Chat / Reveal Flow

```txt
Chat Room
  -> RevealRequestButton
    -> Reveal Request State
      -> Waiting
        -> Reveal Decision State
          -> Show Profile
            -> Safe Profile View visible only if grant + no block
          -> Stay Hidden
            -> Hidden state remains
          -> Decide Later
            -> Hidden state remains
```

## Safety Flow

```txt
Chat Room / Safe Profile View
  -> Safety Action Sheet
    -> Block
      -> Profile hidden
      -> media access restricted where applicable
      -> signed URL access blocked where applicable
    -> Report
      -> Report submitted privately
```

## Test Lab Flow

```txt
Localhost /dev/test-lab
  -> Product flow tests
  -> Reveal tests
  -> RLS leak tests
  -> Storage leak tests
  -> Voice limit tests
  -> Production guard test
```

---

# Route Direction

Final route names may change during implementation, but the route intent should remain stable.

## Web Direction Later

Expected future web route direction:

| Future Route | Screen | Notes |
| --- | --- | --- |
| `/` | Welcome or redirect | Depends on auth state |
| `/auth` | Auth | Sign up / login |
| `/onboarding/profile` | Profile Setup | First profile creation |
| `/discover` | Discover | Main tab |
| `/feed` | Feed | Main tab |
| `/instant/[instantContentId]` | Instant Content Detail | Safe ID/slug only |
| `/chat` | Chat List | Main tab |
| `/chat/[chatThreadId]` | Chat Room | Safe thread access required |
| `/profile` | Own Profile | Owner view |
| `/profile/[safeProfileRef]` | Safe Profile View | Must use safe access rules |
| `/notifications` | Notifications | Optional MVP/later |
| `/settings` | Settings | Optional MVP/later |
| `/dev/test-lab` | Test Lab | Localhost/dev only |

## Mobile Direction Later

Expected future mobile navigation stacks:

```txt
RootStack
  AuthStack
  MainTabs
    DiscoverStack
    FeedStack
    ChatStack
    ProfileStack
  ModalStack
    RevealDecision
    SafetySheet
    ReportFlow
```

## Important Route Boundary

Future route params must not expose unsafe IDs.

Avoid route params such as:

- `sender_user_id`
- `owner_user_id`
- `recipient_user_id`
- `auth_user_id`
- raw storage path
- raw bucket path

Use safe references only after backend access checks.

---

# Screen Details

## S-001 — Welcome Screen

### Purpose

Explain ankion’s emotional promise quickly.

### Entry

- App launch.
- Logged-out user.

### Primary Actions

- Create account.
- Sign in.

### Must Show

- Dark-first premium mood.
- Voice-first anonymous discovery.
- Product promise:

```txt
Start hidden. Connect through voice. Reveal only with trust.
```

### Must Not Show

- Full public profile feed.
- Dating-app swipe language.
- Real user identity examples that imply public exposure.

### Exit

- Auth screen.

### Components

- `AppShell`
- `WelcomeHero`
- `AuthTrustNote`
- primary CTA
- secondary sign-in action

### Privacy Boundary

No user data is shown.

---

## S-002 — Auth Screen

### Purpose

Authenticate user safely.

### Entry

- Welcome CTA.
- Expired session.

### Primary Actions

- Sign up.
- Login.
- Continue auth flow.

### Must Explain

- Real account is required.
- First contact remains anonymous.
- Real profile appears only with permission.

### Exit

- Profile Setup if first-time user.
- Discover/Home if profile already exists.

### Components

- `AppShell`
- `ScreenHeader`
- auth form later
- `AuthTrustNote`

### Privacy Boundary

Do not expose:

- `auth_user_id`
- auth provider internals
- session tokens
- debug auth state

---

## S-003 — Profile Setup Screen

### Purpose

Create the real profile that may later be revealed with permission.

### Entry

- After first signup.
- Missing profile state.

### Primary Actions

- Add display name/profile name.
- Add avatar/media later if approved.
- Add short profile information.
- Complete setup.

### Must Explain

```txt
Your real profile stays private until you choose to show it.
```

### Exit

- Discover/Home.

### Components

- `AppShell`
- `ScreenHeader`
- profile setup form later
- `ProfileVisibilityNotice`

### Privacy Boundary

Real profile is owner-visible only.

Other users cannot access it unless reveal formula passes.

---

## S-004 — Discover Screen

### Purpose

Anonymous profile discovery.

### Entry

- Main tab.
- Post-onboarding default screen.

### Primary Action

Tap anonymous profile card.

### Exit

```txt
DiscoverCard -> ChatRoom
```

### Must Show

- Anonymous cards.
- Hidden profile previews.
- Voice-first CTA/hint.
- Calm privacy state.

### Must Not Show

- Real name before reveal.
- Real avatar before reveal.
- Real bio before reveal.
- Location requirement in MVP.
- Recipient picker.
- Swipe-match behavior.

### Components

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `DiscoverCard`
- `HiddenProfilePreview`
- `AnonymousSignalBadge`

### Safe DTO Direction

- `safe_discover_profile`

### Test Lab Must Verify

- Tap opens Chat.
- Real profile fields are hidden.
- Unsafe IDs are absent.

---

## S-005 — Feed Screen

### Purpose

Display instant photo/video/audio content.

### Entry

- Main tab.

### Primary Action

Tap instant media tile.

### Exit

```txt
FeedTile -> InstantContentDetail
```

### Must Show

- 3-column grid.
- Photo tiles.
- Video tiles.
- Audio tiles.
- Anonymous instant profile context.

### Must Not Show

- Live tab in MVP.
- Real profile owner identity.
- Raw media path.
- `owner_user_id`.

### Components

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `FeedGrid`
- `FeedTile`
- `MediaTypeBadge`

### Safe DTO Direction

- `safe_feed_tile`

### Test Lab Must Verify

- 3-column layout.
- Media type states.
- No raw storage path.
- No owner identity leak.

---

## S-006 — Instant Content Detail Screen

### Purpose

Show selected anonymous instant content and route interested users into Chat.

### Entry

- Feed tile tap.

### Primary Actions

- View/play media.
- Follow anonymous instant profile.
- Open Chat / send voice.

### Exit

```txt
InstantContentDetail -> ChatRoom
```

### Must Show

- Photo/video/audio content.
- Anonymous instant identity.
- Follow action.
- Voice/contact CTA.

### Must Not Show

- Real profile fields.
- Real owner identity.
- Raw storage path.
- Reveal decision outside Chat.

### Components

- `AppShell`
- `ScreenHeader`
- `InstantContentViewer`
- `InstantProfileHeader`
- `InstantFollowButton`
- Chat CTA

### Safe DTO Direction

- `safe_instant_content_detail`

### Test Lab Must Verify

- Instant follow does not reveal profile.
- Chat opens from detail.
- Storage path leak check passes.

---

## S-007 — Chat List Screen

### Purpose

Show existing conversations.

### Entry

- Chat main tab.
- Notification tap may go directly to Chat Room instead.

### Primary Action

Open existing chat.

### Exit

```txt
ChatListItem -> ChatRoom
```

### Must Show

- Safe anonymous/revealed state.
- Last safe activity summary.
- Voice-first conversation indicators.
- Reveal pending states if safe.

### Must Not Show

- Raw participant IDs.
- Hidden real names.
- Raw reveal/grant internals.

### Components

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- safe chat row component later
- `EmptyState`

### Safe DTO Direction

- `safe_chat_summary`

### Test Lab Must Verify

- Hidden chat rows do not leak identity.
- Revealed chat rows only show safe data when grant exists.

---

## S-008 — Chat Room Screen

### Purpose

Core interaction hub.

### Entry

- Discover.
- Instant Detail.
- Chat List.
- Notification.
- Profile floating chat bubble where allowed.

### Primary Actions

- Record voice.
- Send voice.
- Play voice.
- Request reveal.
- Decide reveal request.
- Block/report.

### Must Show

- Anonymous/revealed chat header.
- Voice message timeline.
- Voice composer.
- Voice limit indicator.
- Reveal request/action state.
- Safety actions.

### Must Not Show

- Recipient picker.
- Raw participant IDs.
- Raw storage paths.
- Full profile before reveal grant.

### Voice Rules

- Maximum voice duration: 21 seconds.
- Daily send limit: 7.
- Same-recipient daily send limit: 3.
- Server-side enforcement required.

### Components

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

### Safe DTO Direction

- `safe_chat_room`
- `safe_voice_message`
- `safe_reveal_request_state`

### Test Lab Must Verify

- Voice limit states.
- Reveal request states.
- Approved request without grant remains hidden.
- Grant reveals profile.
- Block overrides grant.
- Sensitive fields are absent.

---

## S-009 — Reveal Request State

### Purpose

Let recipient request real profile visibility inside Chat.

### Entry

- Chat Room reveal button.

### Primary Action

Send reveal request.

### Exit

- Pending state in Chat.

### Must Show

```txt
Profilini görmek istiyorum
```

or English equivalent:

```txt
I’d like to see your profile
```

### Must Not Show

- Real profile after request alone.
- Harsh request copy.
- Raw requester/recipient IDs.

### Components

- `RevealRequestButton`
- `RevealStatePill`
- `PrivacyNote`

### Rule

Request creation does not reveal profile.

### Test Lab Must Verify

- Request created.
- Profile still hidden.
- Request data does not leak unsafe IDs.

---

## S-010 — Reveal Decision State

### Purpose

Let profile owner decide whether to reveal.

### Entry

- Chat Room incoming request card.
- Notification leading to Chat.

### Primary Actions

- Show profile.
- Stay hidden.
- Decide later.

### Exit

- Revealed state if grant active.
- Hidden state if stay hidden/decide later.
- Waiting state if no decision.

### Must Show

Calm decision copy.

Example:

```txt
They’re curious about your profile. You can show it, stay hidden, or decide later.
```

### Must Not Show

- “Rejected.”
- “Denied.”
- Pressure language.
- Reveal state based only on frontend.

### Components

- `RevealRequestCard`
- `RevealDecisionActions`
- `RevealStatePill`

### Required Formula

```txt
approved request + active profile visibility grant + no active block = profile visible
```

### Test Lab Must Verify

- Decide later keeps hidden.
- Stay hidden keeps hidden.
- Show profile creates safe visible state.
- Block reverses visibility.

---

## S-011 — Safe Profile View Screen

### Purpose

Display another user’s profile only through safe visibility logic.

### Entry

- Chat header.
- Reveal approved state.
- Profile floating chat bubble context where allowed.
- Notification if safe.

### States

- hidden before reveal
- pending
- revealed
- blocked
- unavailable

### Must Show Before Reveal

- Hidden profile placeholder.
- Calm privacy explanation.
- Voice/reveal CTA if allowed.

### Must Show After Reveal

- Safe real profile fields.
- Safe media URLs.
- Chat continuation.
- Safety actions.

### Must Not Show

- Raw real profile row.
- Hidden fields.
- Raw storage path.
- Unsafe user IDs.
- Profile after request approval without grant.

### Components

- `AppShell`
- `ScreenHeader`
- `SafeProfileView`
- `ProfileVisibilityGate`
- `ProfileVisibilityNotice`
- `FloatingChatBubble`
- `SafetyActionSheet`

### Safe DTO Direction

- `safe_profile_view`

### Test Lab Must Verify

- Before reveal: hidden.
- After grant: visible.
- After block: hidden/unavailable.
- No sensitive field leak.

---

## S-012 — Own Profile Screen

### Purpose

Let the logged-in user manage their own real profile and privacy state.

### Entry

- Profile main tab.

### Primary Actions

- View own profile.
- Edit profile later.
- Access privacy controls later.
- Open Chat via top-right floating chat bubble.

### Required Element

Top-right floating chat bubble.

### Must Show

- Own real profile.
- Privacy explanation.
- Profile controls.
- Optional instant profile/media management later.

### Must Not Show

- Other users’ hidden data.
- Debug identity fields.
- Public visibility implication.

### Components

- `AppShell`
- `BottomTabBar`
- `ScreenHeader`
- `OwnProfileCard`
- `ProfileVisibilityNotice`
- `FloatingChatBubble`

### Test Lab Must Verify

- Owner sees own profile.
- Other viewers need reveal grant.
- Floating chat bubble exists.

---

## S-013 — Notifications Screen

### Purpose

Show safe activity notifications.

### Entry

- Future tab/entry point.
- Push notification tap.
- System activity area later.

### Notification Types

- New voice received.
- Reveal request received.
- Reveal approved.
- Instant profile followed.
- Safety/system notice.

### Must Show

- Privacy-safe copy.
- Safe context link.

### Must Not Show

- Hidden real profile details.
- Raw user IDs.
- Unsafe storage/media links.
- Moderation internals.

### Components

- `AppShell`
- `ScreenHeader`
- `SafeNotificationItem`
- `EmptyState`

### Safe DTO Direction

- `safe_notification`

### Test Lab Must Verify

- Notification copy preserves anonymity.
- Tap opens safe Chat context.

---

## S-014 — Safety / Report Screen Or Sheet

### Purpose

Allow blocking and reporting.

### Entry

- Chat Room.
- Safe Profile View.
- Voice message options later.
- Instant Content Detail later.

### Primary Actions

- Block.
- Report.
- Cancel.

### Must Show

- Calm safety options.
- Report reason list if reporting.
- Confirmation state.

### Must Not Show

- Reporter identity.
- Reported user private details.
- Moderation internals.
- Internal report IDs.

### Components

- `SafetyActionSheet`
- `ReportReasonList`
- `UnavailableState`

### Test Lab Must Verify

- Block overrides grant.
- Report does not reveal reporter.
- Moderation fields are hidden.

---

## S-015 — Settings Screen

### Purpose

Account and privacy settings later.

### MVP Status

Optional / later unless needed for account basics.

### May Include Later

- Account settings.
- Privacy settings.
- Notification settings.
- Blocked users list.
- Delete account.
- Theme selector if light theme is added later.

### Must Not Include Yet

- Monetization features before analysis.
- AI analysis before consent/safety design.
- Location features before deferred decision is reopened.

### Privacy Boundary

Owner-only screen.

---

## S-016 — Dev Test Lab Screen

### Purpose

Localhost-only browser QA area for product, privacy, RLS, storage, and component states.

### Future Route

```txt
/dev/test-lab
```

### Required Environment

- localhost-only
- fake data only
- disabled in production
- no production secrets
- no real user data

### Must Test

- Discover-to-Chat.
- Feed-to-Detail-to-Chat.
- Hidden profile before reveal.
- Voice limits.
- Reveal request.
- Approved request without grant.
- Grant reveals profile.
- Block overrides grant.
- Instant follow cannot reveal real profile.
- Coin cannot reveal real profile.
- Raw storage path leak checks.
- Sensitive ID leak checks.
- Report privacy.
- Notification privacy.
- Production guard.

### Components

- `TestLabCard`
- `LeakCheckPanel`
- fake screen previews
- visual PASS/FAIL cards

### Must Not Do

- Do not ship in production.
- Do not connect to production data.
- Do not expose real secrets.

---

# Screen State Matrix

| Screen | Hidden | Pending | Revealed | Blocked | Limit Reached | Empty | Unavailable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Welcome | N/A | N/A | N/A | N/A | N/A | No | No |
| Auth | N/A | N/A | N/A | N/A | N/A | No | Yes |
| Profile Setup | Owner only | N/A | Owner only | N/A | N/A | No | Yes |
| Discover | Yes | Optional | No full reveal | Yes | Optional | Yes | Yes |
| Feed | Yes | N/A | No real reveal | Yes | N/A | Yes | Yes |
| Instant Detail | Yes | N/A | No real reveal | Yes | N/A | No | Yes |
| Chat List | Yes | Yes | Yes if safe | Yes | Optional | Yes | Yes |
| Chat Room | Yes | Yes | Yes if safe | Yes | Yes | Yes | Yes |
| Reveal Request | Yes | Yes | N/A | Yes | N/A | N/A | Yes |
| Reveal Decision | Yes | Yes | Yes after grant | Yes | N/A | N/A | Yes |
| Safe Profile View | Yes | Yes | Yes after grant | Yes | N/A | N/A | Yes |
| Own Profile | Owner visible | N/A | Owner visible | N/A | N/A | No | Yes |
| Notifications | Yes | Yes | Yes if safe | Yes | N/A | Yes | Yes |
| Safety / Report | Safe context | N/A | Safe context | Yes | N/A | N/A | Yes |
| Settings | Owner only | N/A | Owner only | N/A | N/A | Optional | Yes |
| Test Lab | Fake states | Fake states | Fake states | Fake states | Fake states | Fake states | Fake states |

---

# Screen Access Rules

## Public / Logged-Out

Allowed:

- Welcome
- Auth

Not allowed:

- Discover
- Feed
- Chat
- Profile
- Instant Detail with private data
- Notifications
- Settings

## Logged-In Without Profile

Allowed:

- Profile Setup
- limited auth/session screens

Not allowed:

- full Discover
- full Feed
- sending voice
- reveal requests

## Logged-In With Profile

Allowed:

- Discover
- Feed
- Instant Detail
- Chat
- Own Profile
- safe settings/notifications

Still protected:

- other users’ real profiles before reveal
- raw media paths
- unsafe IDs
- moderation internals
- report internals

## Blocked Relationship

When active block exists:

- Profile visibility is hidden/unavailable.
- Existing grant is overridden.
- Signed media URL access is blocked where applicable.
- Chat continuation may be restricted according to product rules.
- Notifications must not leak identity.

---

# Navigation Guards

## Auth Guard

Screens requiring login:

- Profile Setup
- Discover
- Feed
- Instant Detail
- Chat List
- Chat Room
- Own Profile
- Notifications
- Settings

## Profile Completion Guard

Screens requiring profile setup:

- Discover
- Feed interaction
- Chat sending
- Reveal request
- Instant upload later

## Reveal Visibility Guard

Screens/components requiring reveal formula:

- Safe Profile View
- revealed Chat header
- real profile media
- real profile details

Formula:

```txt
approved request + active profile visibility grant + no active block = profile visible
```

## Test Lab Guard

`/dev/test-lab` must be available only when:

- local development environment
- fake data mode
- production guard passes

It must be unavailable in production.

---

# Safe DTO Mapping By Screen

| Screen | Safe DTO Concept |
| --- | --- |
| Discover | `safe_discover_profile` |
| Feed | `safe_feed_tile` |
| Instant Detail | `safe_instant_content_detail` |
| Chat List | `safe_chat_summary` |
| Chat Room | `safe_chat_room`, `safe_voice_message`, `safe_reveal_request_state` |
| Reveal Request | `safe_reveal_request_state` |
| Reveal Decision | `safe_reveal_request_state` |
| Safe Profile View | `safe_profile_view` |
| Notifications | `safe_notification` |
| Test Lab | fake safe DTO payloads |

## Never Use Raw Rows In Screens

Screens must not directly consume raw rows from:

- profiles
- real profiles
- chat participants
- voice messages
- reveal requests
- profile visibility grants
- blocks
- reports
- storage files
- moderation logs

Use safe views/RPCs or backend-composed DTOs later.

---

# Screen-Level Never-Leak Fields

No user-facing screen should require or display:

- `auth_user_id`
- `user_id` where unsafe
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
- file audit internals
- moderation internals
- hidden real profile fields before reveal
- raw grant internals
- raw reveal internals where unsafe

---

# MVP Screens

The MVP should include these screens at minimum:

1. Welcome
2. Auth
3. Profile Setup
4. Discover
5. Feed
6. Instant Content Detail
7. Chat List
8. Chat Room
9. Reveal Request/Decision states inside Chat
10. Safe Profile View
11. Own Profile
12. Safety/Report sheet
13. Dev Test Lab

Notifications and Settings can be included if needed for a clean MVP foundation, but they must remain privacy-safe.

---

# Deferred Screens

These screens are not part of immediate MVP implementation unless explicitly approved later:

| Screen | Reason Deferred |
| --- | --- |
| Coin Store | Monetization requires deeper analysis |
| Follower View Package Screen | Privacy/monetization model not finalized |
| Location Discovery Screen | Location requirement deferred |
| AI Voice Analysis Screen | Requires consent/safety framing |
| Live Screen | No Live tab in MVP |
| Advanced Instant Profile Dashboard | Can come after core instant flow |
| Light Theme Settings | Secondary optional theme later |
| Public Profile Browser | Conflicts with anonymous-first model |
| Recipient Picker | Explicitly rejected for MVP |

---

# Screen Copy Direction

## Preferred Copy

- Start hidden.
- Connect through voice.
- Reveal only with trust.
- Profilini görmek istiyorum.
- Profilini göster.
- Gizli kal.
- Sonra karar ver.
- Profil hâlâ gizli.
- İzin bekleniyor.
- Profil artık görünür.
- Bugünkü ses hakkın doldu.
- Bu kişiye bugün daha fazla ses gönderemezsin.

## Avoid

- Rejected
- Denied
- Failed
- Forbidden
- Access blocked
- Reddedildi
- Yasak
- Erişim reddedildi
- Engellendin
- Swipe
- Match
- Like to reveal

---

# Screen QA Checklist

Before implementation later, each screen must answer:

1. What is the screen’s entry point?
2. What is the screen’s exit point?
3. Does the screen accidentally create a recipient picker?
4. Does the screen preserve Chat as the central hub?
5. Does the screen use safe DTOs only?
6. Does the screen avoid unsafe IDs?
7. Does the screen avoid raw storage paths?
8. Does the screen preserve hidden profile state before reveal?
9. Does the screen respect block override?
10. Does the screen use calm copy?
11. Does the screen fit dark-first premium mobile design?
12. Can Test Lab verify its critical state?

---

# Success Criteria

This screen map is successful if:

- Every MVP screen has a clear purpose.
- Navigation never requires a recipient selection screen.
- Discover leads directly to Chat.
- Feed leads to Instant Detail, then Chat.
- Chat remains the core interaction hub.
- Voice sending stays central.
- Real profile reveal is controlled by permission and grant.
- Instant media never reveals real profile.
- Block overrides visibility.
- Screens consume safe DTOs, not raw rows.
- Test Lab can verify critical product/security states.
- Codex can later implement screens in small isolated tasks without guessing navigation.

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
