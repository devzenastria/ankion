# DESIGN_TOKENS.md

## Purpose

Define the approved design token direction for ankion.

These tokens guide visual consistency across future web, mobile, UI kit, design system, and Test Lab screens.

## Status

Filled

## Owner

ChatGPT / User / Codex-assisted

## Design Direction

ankion is:

- dark-first
- premium
- modern
- cinematic
- mobile-native
- voice-first
- anonymous-first
- calm and human
- privacy-respecting

The design must support the product promise:

```txt
Start hidden. Connect through voice. Reveal only with trust.
```

## Important Boundary

This file defines design token direction only.

It does not create:

- app implementation code
- CSS files
- Tailwind config
- React Native theme files
- package setup
- framework initialization
- UI components
- database schema
- RLS policies

Implementation must not start from this file alone.

---

# Token Principles

## TP-001 — Dark First

Dark theme is the main design direction.

Light theme may exist later as an optional secondary theme, but it must not drive the MVP design.

## TP-002 — Premium, Not Loud

The UI should feel refined, calm, and cinematic.

Avoid:

- neon overload
- cheap gradients
- harsh warning colors
- oversized alert cards
- dating-app color clichés
- generic web dashboard visuals

## TP-003 — Privacy Is A Visual State

Hidden, pending, revealed, blocked, and unavailable states must be visually clear without feeling punitive.

## TP-004 — Voice Must Feel Central

Voice recording, waveform, playback, and listening moments need strong visual priority.

## TP-005 — Mobile Native Density

Spacing, radius, type sizes, touch targets, and navigation must feel native to mobile screens.

## TP-006 — Calm Human Copy Support

Colors and states must support soft language:

- still private
- stay hidden
- decide later
- waiting for permission
- profile is not visible yet

Avoid visual patterns that make privacy states look like errors.

---

# Theme Model

## Primary Theme

```txt
Dark-first premium theme
```

Used for:

- MVP default app UI
- onboarding
- Discover
- Feed
- Chat
- Profile
- Reveal states
- Instant Content Detail
- Test Lab previews

## Secondary Theme

```txt
Light optional theme
```

Used only later if needed.

Light theme must preserve:

- premium feel
- privacy clarity
- calm reveal states
- voice-first hierarchy

---

# Color Tokens

## Dark Theme Core Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.bg.base` | `#080A0F` | Main app background |
| `color.bg.elevated` | `#0D111A` | Elevated surfaces, cards |
| `color.bg.panel` | `#121827` | Sheets, panels, modals |
| `color.bg.soft` | `#161D2E` | Softer secondary surfaces |
| `color.bg.overlay` | `rgba(3, 5, 10, 0.72)` | Modal and media overlay |
| `color.bg.blur` | `rgba(12, 16, 26, 0.64)` | Glass/blurred anonymous cards |
| `color.border.subtle` | `rgba(255, 255, 255, 0.07)` | Soft borders |
| `color.border.visible` | `rgba(255, 255, 255, 0.13)` | Visible component boundaries |
| `color.border.focus` | `#8EA7FF` | Focus ring and selected state |

## Brand Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.brand.primary` | `#8EA7FF` | Main brand accent |
| `color.brand.primarySoft` | `#C1CCFF` | Soft highlight text/icons |
| `color.brand.primaryMuted` | `rgba(142, 167, 255, 0.18)` | Soft selected states |
| `color.brand.deep` | `#5367F5` | Strong CTA gradient anchor |
| `color.brand.glow` | `rgba(142, 167, 255, 0.36)` | Voice/reveal glow |
| `color.brand.secondary` | `#B69CFF` | Secondary premium accent |
| `color.brand.secondaryMuted` | `rgba(182, 156, 255, 0.18)` | Secondary soft state |

## Voice Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.voice.active` | `#A9F0D1` | Active recording / voice success |
| `color.voice.playing` | `#8EA7FF` | Playback progress |
| `color.voice.waveform` | `rgba(169, 240, 209, 0.84)` | Waveform active bars |
| `color.voice.waveformIdle` | `rgba(255, 255, 255, 0.22)` | Idle waveform bars |
| `color.voice.limit` | `#FFD38A` | Voice limit warning |
| `color.voice.disabled` | `rgba(255, 255, 255, 0.24)` | Disabled voice control |

## Reveal / Privacy Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.privacy.hidden` | `#9BA6BD` | Hidden/private neutral state |
| `color.privacy.pending` | `#FFD38A` | Waiting / decide later state |
| `color.privacy.revealed` | `#A9F0D1` | Approved reveal state |
| `color.privacy.blocked` | `#FF9DA8` | Blocked/safety state |
| `color.privacy.safeSurface` | `rgba(142, 167, 255, 0.10)` | Hidden profile card surface |
| `color.privacy.revealSurface` | `rgba(169, 240, 209, 0.12)` | Revealed state surface |
| `color.privacy.pendingSurface` | `rgba(255, 211, 138, 0.12)` | Pending state surface |

## Text Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.text.primary` | `#F4F7FB` | Main text |
| `color.text.secondary` | `#B8C0D4` | Secondary text |
| `color.text.tertiary` | `#7E879D` | Metadata, hints |
| `color.text.disabled` | `rgba(244, 247, 251, 0.36)` | Disabled labels |
| `color.text.inverse` | `#080A0F` | Text on bright CTA |
| `color.text.brand` | `#C1CCFF` | Brand-highlighted text |
| `color.text.success` | `#A9F0D1` | Positive reveal/access text |
| `color.text.warning` | `#FFD38A` | Soft warning text |
| `color.text.danger` | `#FF9DA8` | Safety action text |

## Status Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.status.success` | `#A9F0D1` | Success / safe approval |
| `color.status.info` | `#8EA7FF` | Info / neutral action |
| `color.status.warning` | `#FFD38A` | Soft warning |
| `color.status.danger` | `#FF9DA8` | Safety / destructive action |
| `color.status.neutral` | `#9BA6BD` | Neutral state |

## Media Palette

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.media.photo` | `#B69CFF` | Photo tile accent |
| `color.media.video` | `#8EA7FF` | Video tile accent |
| `color.media.audio` | `#A9F0D1` | Audio tile accent |
| `color.media.scrimTop` | `rgba(0, 0, 0, 0.08)` | Media top scrim |
| `color.media.scrimBottom` | `rgba(0, 0, 0, 0.58)` | Media bottom scrim |

---

# Optional Light Theme Palette

Light theme is not the MVP driver.

If added later, it must be derived from the same emotional model.

| Token | Hex | Purpose |
| --- | --- | --- |
| `color.light.bg.base` | `#F6F7FB` | Main light background |
| `color.light.bg.elevated` | `#FFFFFF` | Cards/surfaces |
| `color.light.bg.soft` | `#EEF1F8` | Soft background |
| `color.light.text.primary` | `#111827` | Main text |
| `color.light.text.secondary` | `#4B5568` | Secondary text |
| `color.light.border.subtle` | `rgba(17, 24, 39, 0.08)` | Soft border |
| `color.light.brand.primary` | `#5367F5` | Brand accent |

---

# Gradient Tokens

## Brand Gradients

| Token | Value | Purpose |
| --- | --- | --- |
| `gradient.brand.primary` | `linear-gradient(135deg, #8EA7FF 0%, #B69CFF 52%, #A9F0D1 100%)` | Premium hero/CTA highlight |
| `gradient.brand.deep` | `linear-gradient(135deg, #5367F5 0%, #8EA7FF 100%)` | Primary CTA |
| `gradient.bg.cinematic` | `radial-gradient(circle at 30% 0%, rgba(142,167,255,0.22), transparent 34%), radial-gradient(circle at 90% 10%, rgba(182,156,255,0.18), transparent 28%), #080A0F` | Main screen mood |
| `gradient.voice.active` | `linear-gradient(135deg, #A9F0D1 0%, #8EA7FF 100%)` | Recording button / active voice |
| `gradient.reveal.trust` | `linear-gradient(135deg, rgba(169,240,209,0.18), rgba(142,167,255,0.16))` | Reveal approved surface |
| `gradient.hidden.private` | `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(142,167,255,0.08))` | Hidden profile surface |

## Gradient Rules

Use gradients sparingly.

Allowed:

- onboarding hero
- primary CTA
- voice record button
- reveal trust moment
- selected anonymous profile state

Avoid:

- every card using gradients
- loud rainbow surfaces
- dating-app pink/red gradients as core identity

---

# Typography Tokens

## Font Direction

Use modern system typography first.

Preferred direction:

```txt
iOS: SF Pro
Android: Roboto / system
Web fallback: Inter, system-ui, sans-serif
```

Do not block implementation on custom fonts.

## Type Scale

| Token | Size | Line Height | Weight | Purpose |
| --- | ---: | ---: | ---: | --- |
| `type.display.lg` | `34` | `40` | `700` | Onboarding hero |
| `type.display.md` | `30` | `36` | `700` | Major screen hero |
| `type.heading.lg` | `24` | `30` | `700` | Screen title |
| `type.heading.md` | `21` | `27` | `650` | Section title |
| `type.heading.sm` | `18` | `24` | `650` | Card title |
| `type.body.lg` | `17` | `25` | `400` | Primary readable body |
| `type.body.md` | `15` | `22` | `400` | Main UI text |
| `type.body.sm` | `13` | `19` | `400` | Supporting copy |
| `type.label.lg` | `15` | `20` | `650` | Buttons |
| `type.label.md` | `13` | `18` | `600` | Tabs, chips |
| `type.label.sm` | `12` | `16` | `600` | Metadata |
| `type.caption` | `11` | `14` | `500` | Tiny labels / counters |

## Typography Rules

- Use generous line height for calm readability.
- Avoid all-caps except small labels where necessary.
- Avoid dense paragraphs in mobile screens.
- Keep reveal/privacy copy soft and readable.
- Use `type.body.sm` or `type.label.sm` for voice remaining count.
- Use `type.heading.md` or `type.heading.sm` for reveal cards.

---

# Spacing Tokens

## Base Spacing Scale

| Token | Value | Purpose |
| --- | ---: | --- |
| `space.0` | `0` | None |
| `space.1` | `4` | Tiny gap |
| `space.2` | `8` | Small gap |
| `space.3` | `12` | Compact component padding |
| `space.4` | `16` | Default screen/component gap |
| `space.5` | `20` | Comfortable gap |
| `space.6` | `24` | Section spacing |
| `space.7` | `28` | Large component spacing |
| `space.8` | `32` | Major section spacing |
| `space.10` | `40` | Hero spacing |
| `space.12` | `48` | Large vertical rhythm |
| `space.16` | `64` | Major screen separation |

## Screen Padding

| Token | Value | Purpose |
| --- | ---: | --- |
| `layout.screen.x` | `20` | Main horizontal mobile padding |
| `layout.screen.y` | `16` | Main vertical padding |
| `layout.screen.top` | `12` | Top content start after safe area |
| `layout.screen.bottom` | `24` | Bottom content padding |
| `layout.feed.gap` | `2` | 3-column grid gap |
| `layout.chat.gap` | `10` | Chat bubble vertical gap |

## Spacing Rules

- Chat should breathe but not waste vertical space.
- Feed grid should feel dense and mobile-native.
- Reveal cards should use calm spacing, not alert-style spacing.
- Voice recorder needs enough thumb comfort.

---

# Radius Tokens

| Token | Value | Purpose |
| --- | ---: | --- |
| `radius.none` | `0` | No radius |
| `radius.xs` | `6` | Tiny controls |
| `radius.sm` | `10` | Chips |
| `radius.md` | `14` | Buttons, input fields |
| `radius.lg` | `18` | Cards |
| `radius.xl` | `24` | Large panels |
| `radius.2xl` | `30` | Premium sheets |
| `radius.full` | `999` | Pills, avatars, recorder |

## Radius Rules

- Use larger radius for premium surfaces.
- Use full radius for voice buttons, chips, and status pills.
- Avoid sharp card corners in core app screens.
- Feed tiles may use smaller radius if grid density requires it.

---

# Elevation / Shadow Tokens

## Dark Theme Shadows

| Token | Value | Purpose |
| --- | --- | --- |
| `shadow.none` | `none` | Flat surfaces |
| `shadow.sm` | `0 6px 18px rgba(0, 0, 0, 0.22)` | Small cards |
| `shadow.md` | `0 12px 34px rgba(0, 0, 0, 0.32)` | Elevated cards |
| `shadow.lg` | `0 24px 70px rgba(0, 0, 0, 0.46)` | Sheets/modals |
| `shadow.brand` | `0 0 34px rgba(142, 167, 255, 0.24)` | Brand glow |
| `shadow.voice` | `0 0 42px rgba(169, 240, 209, 0.24)` | Recording state |
| `shadow.reveal` | `0 0 42px rgba(142, 167, 255, 0.20)` | Reveal/trust state |

## Elevation Rules

- Use shadow subtly on dark surfaces.
- Pair elevation with soft borders.
- Use glow only for meaningful states:
  - active recording
  - reveal approved
  - selected CTA
- Avoid glowing every card.

---

# Blur / Glass Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `blur.sm` | `8px` | Light glass effect |
| `blur.md` | `16px` | Cards / nav bars |
| `blur.lg` | `28px` | Sheets / anonymous overlay |
| `blur.profileHidden` | `18px` | Hidden profile media |
| `blur.mediaScrim` | `12px` | Media overlay readability |

## Blur Rules

- Use blur to communicate privacy, not poor image loading.
- Hidden real profile media must stay intentionally obscured.
- Do not use blur in a way that exposes identifiable details.

---

# Opacity Tokens

| Token | Value | Purpose |
| --- | ---: | --- |
| `opacity.disabled` | `0.36` | Disabled controls |
| `opacity.muted` | `0.56` | Secondary visuals |
| `opacity.visible` | `0.78` | Supporting icons/text |
| `opacity.overlay.light` | `0.24` | Light overlay |
| `opacity.overlay.medium` | `0.48` | Medium overlay |
| `opacity.overlay.strong` | `0.72` | Strong privacy overlay |
| `opacity.hiddenProfile` | `0.40` | Hidden profile media opacity |

---

# Icon Tokens

## Icon Sizes

| Token | Value | Purpose |
| --- | ---: | --- |
| `icon.xs` | `14` | Small metadata |
| `icon.sm` | `18` | Chips / inline |
| `icon.md` | `22` | Nav / controls |
| `icon.lg` | `28` | Primary actions |
| `icon.xl` | `36` | Voice recorder |

## Icon Rules

- Use rounded, minimal, line-based icons.
- Avoid aggressive warning icons in reveal states.
- Voice, privacy, and trust icons should feel soft.
- Safety actions may use clearer icons but not alarmist visuals.

---

# Motion Tokens

## Duration

| Token | Value | Purpose |
| --- | ---: | --- |
| `motion.duration.fast` | `120ms` | Tap feedback |
| `motion.duration.base` | `180ms` | Standard UI transition |
| `motion.duration.smooth` | `260ms` | Card/sheet transition |
| `motion.duration.slow` | `420ms` | Onboarding/reveal moment |
| `motion.duration.voicePulse` | `900ms` | Recording pulse loop |

## Easing

| Token | Value | Purpose |
| --- | --- | --- |
| `motion.ease.standard` | `cubic-bezier(0.2, 0.0, 0.0, 1.0)` | Default transition |
| `motion.ease.exit` | `cubic-bezier(0.4, 0.0, 1.0, 1.0)` | Exit |
| `motion.ease.enter` | `cubic-bezier(0.0, 0.0, 0.2, 1.0)` | Enter |
| `motion.ease.softSpring` | `spring(1, 90, 14, 0)` | Soft mobile spring direction |
| `motion.ease.voice` | `cubic-bezier(0.18, 0.84, 0.28, 1.0)` | Voice pulse |

## Motion Rules

- Use motion to make transitions feel human and mobile-native.
- Avoid gamified dating-app bounces.
- Reveal approved state can have a soft cinematic transition.
- Stay hidden/decide later should not animate like failure.
- Respect reduced motion settings later during implementation.

---

# Touch Target Tokens

| Token | Value | Purpose |
| --- | ---: | --- |
| `touch.min` | `44` | Minimum touch target |
| `touch.comfort` | `48` | Default action target |
| `touch.primary` | `56` | Primary CTA |
| `touch.voiceRecord` | `72` | Main voice record button |
| `touch.floatingChat` | `56` | Floating chat bubble |

## Touch Rules

- Main voice record control must be thumb-friendly.
- Floating chat bubble must be easy to tap.
- Do not create tiny reveal decision buttons.
- Feed grid tiles can be visually compact but must remain tappable.

---

# Layout Tokens

## Mobile Breakpoints

| Token | Value | Purpose |
| --- | ---: | --- |
| `breakpoint.mobile.sm` | `320` | Small mobile |
| `breakpoint.mobile.md` | `375` | Standard mobile |
| `breakpoint.mobile.lg` | `430` | Large mobile |
| `breakpoint.tablet` | `768` | Tablet / expanded layout |
| `breakpoint.web` | `1024` | Web/Test Lab layout |

## Navigation

| Token | Value | Purpose |
| --- | ---: | --- |
| `nav.bottom.height` | `72` | Bottom tab height |
| `nav.bottom.radius` | `26` | Floating nav shape |
| `nav.header.height` | `56` | Header area |
| `nav.chatHeader.height` | `64` | Chat header |
| `nav.profileBubble.size` | `56` | Profile floating chat bubble |

## Feed Grid

| Token | Value | Purpose |
| --- | ---: | --- |
| `feed.columns` | `3` | Required feed layout |
| `feed.gap` | `2` | Tight mobile media grid |
| `feed.tile.radius` | `8` | Tile radius |
| `feed.tile.aspect.photo` | `1 / 1.18` | Photo tile feel |
| `feed.tile.aspect.video` | `1 / 1.28` | Video tile feel |
| `feed.tile.aspect.audio` | `1 / 1` | Audio tile feel |

---

# Component State Tokens

## Hidden Profile State

| Token | Value |
| --- | --- |
| `state.hidden.bg` | `color.privacy.safeSurface` |
| `state.hidden.text` | `color.privacy.hidden` |
| `state.hidden.border` | `color.border.subtle` |
| `state.hidden.blur` | `blur.profileHidden` |
| `state.hidden.opacity` | `opacity.hiddenProfile` |

## Pending Reveal State

| Token | Value |
| --- | --- |
| `state.pending.bg` | `color.privacy.pendingSurface` |
| `state.pending.text` | `color.privacy.pending` |
| `state.pending.border` | `rgba(255, 211, 138, 0.22)` |
| `state.pending.icon` | `color.privacy.pending` |

## Revealed State

| Token | Value |
| --- | --- |
| `state.revealed.bg` | `color.privacy.revealSurface` |
| `state.revealed.text` | `color.privacy.revealed` |
| `state.revealed.border` | `rgba(169, 240, 209, 0.24)` |
| `state.revealed.glow` | `shadow.reveal` |

## Blocked / Safety State

| Token | Value |
| --- | --- |
| `state.safety.bg` | `rgba(255, 157, 168, 0.10)` |
| `state.safety.text` | `color.privacy.blocked` |
| `state.safety.border` | `rgba(255, 157, 168, 0.22)` |
| `state.safety.icon` | `color.privacy.blocked` |

## Disabled State

| Token | Value |
| --- | --- |
| `state.disabled.bg` | `rgba(255, 255, 255, 0.06)` |
| `state.disabled.text` | `color.text.disabled` |
| `state.disabled.opacity` | `opacity.disabled` |

---

# Voice UI Tokens

## Voice Recorder

| Token | Value | Purpose |
| --- | --- | --- |
| `voice.record.size` | `72` | Main record button |
| `voice.record.radius` | `radius.full` | Circular/pill control |
| `voice.record.bg` | `gradient.voice.active` | Active recording |
| `voice.record.idleBg` | `color.bg.panel` | Idle state |
| `voice.record.shadow` | `shadow.voice` | Active voice glow |
| `voice.record.maxDuration` | `21s` | MVP duration limit |

## Waveform

| Token | Value | Purpose |
| --- | --- | --- |
| `voice.wave.barWidth` | `3` | Bar width |
| `voice.wave.barGap` | `3` | Bar gap |
| `voice.wave.minHeight` | `6` | Min bar height |
| `voice.wave.maxHeight` | `32` | Max bar height |
| `voice.wave.radius` | `radius.full` | Rounded bars |
| `voice.wave.activeColor` | `color.voice.waveform` | Active bars |
| `voice.wave.idleColor` | `color.voice.waveformIdle` | Idle bars |

## Playback

| Token | Value | Purpose |
| --- | --- | --- |
| `voice.play.buttonSize` | `42` | Play/pause button |
| `voice.play.progressHeight` | `4` | Progress rail |
| `voice.play.progressRadius` | `radius.full` | Progress rail radius |
| `voice.play.activeColor` | `color.voice.playing` | Playback active |
| `voice.play.idleColor` | `rgba(255,255,255,0.16)` | Playback inactive |

---

# Chat Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `chat.bubble.radius` | `22` | Voice bubble radius |
| `chat.bubble.ownBg` | `rgba(142, 167, 255, 0.16)` | Own message bubble |
| `chat.bubble.otherBg` | `rgba(255, 255, 255, 0.08)` | Received message bubble |
| `chat.bubble.systemBg` | `rgba(255, 255, 255, 0.06)` | System/privacy note |
| `chat.bubble.paddingX` | `14` | Bubble horizontal padding |
| `chat.bubble.paddingY` | `12` | Bubble vertical padding |
| `chat.composer.height` | `78` | Voice composer area |
| `chat.composer.bg` | `rgba(13, 17, 26, 0.92)` | Composer surface |
| `chat.limit.text` | `color.voice.limit` | Limit message |
| `chat.header.bg` | `rgba(8, 10, 15, 0.78)` | Blurred header |

---

# Reveal UI Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `reveal.card.bg` | `color.bg.panel` | Reveal request card |
| `reveal.card.radius` | `radius.xl` | Reveal card radius |
| `reveal.card.border` | `color.border.visible` | Card boundary |
| `reveal.card.padding` | `space.5` | Calm spacing |
| `reveal.primary.bg` | `gradient.brand.deep` | Show profile button |
| `reveal.secondary.bg` | `rgba(255,255,255,0.08)` | Stay hidden / decide later |
| `reveal.pending.bg` | `state.pending.bg` | Waiting state |
| `reveal.approved.bg` | `state.revealed.bg` | Revealed state |

## Reveal Copy Tone

Use soft labels:

- Show profile
- Stay hidden
- Decide later
- Still private
- Waiting for permission
- Profile is visible now

Avoid:

- Rejected
- Denied
- Failed
- Access forbidden

---

# Button Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `button.primary.height` | `54` | Primary CTA |
| `button.primary.radius` | `radius.full` | Premium pill |
| `button.primary.bg` | `gradient.brand.deep` | Main action |
| `button.primary.text` | `color.text.primary` | CTA text |
| `button.secondary.height` | `50` | Secondary action |
| `button.secondary.radius` | `radius.full` | Pill |
| `button.secondary.bg` | `rgba(255,255,255,0.08)` | Secondary surface |
| `button.secondary.text` | `color.text.primary` | Secondary text |
| `button.ghost.height` | `44` | Quiet action |
| `button.ghost.bg` | `transparent` | Ghost action |
| `button.ghost.text` | `color.text.secondary` | Ghost text |
| `button.danger.text` | `color.status.danger` | Safety action |

---

# Input Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `input.height` | `52` | Standard input |
| `input.radius` | `radius.lg` | Input radius |
| `input.bg` | `rgba(255,255,255,0.07)` | Input surface |
| `input.border` | `color.border.subtle` | Default border |
| `input.focusBorder` | `color.border.focus` | Focus state |
| `input.text` | `color.text.primary` | Input text |
| `input.placeholder` | `color.text.tertiary` | Placeholder |

---

# Card Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `card.bg` | `color.bg.elevated` | Default card |
| `card.radius` | `radius.xl` | Card radius |
| `card.border` | `color.border.subtle` | Border |
| `card.shadow` | `shadow.sm` | Elevation |
| `card.padding` | `space.4` | Default padding |
| `card.premiumBg` | `linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035))` | Premium card surface |
| `card.hiddenBg` | `gradient.hidden.private` | Hidden profile card |
| `card.revealBg` | `gradient.reveal.trust` | Reveal card |

---

# Navigation Tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `tab.bg` | `rgba(13, 17, 26, 0.86)` | Bottom tab background |
| `tab.blur` | `blur.md` | Bottom tab blur |
| `tab.border` | `color.border.subtle` | Top border |
| `tab.active` | `color.brand.primarySoft` | Active item |
| `tab.inactive` | `color.text.tertiary` | Inactive item |
| `tab.height` | `nav.bottom.height` | Tab height |

---

# Test Lab Tokens

Test Lab should visually use the same design language but clearly stay development-only.

| Token | Value | Purpose |
| --- | --- | --- |
| `test.pass` | `color.status.success` | PASS state |
| `test.fail` | `color.status.danger` | FAIL state |
| `test.warning` | `color.status.warning` | Warning state |
| `test.card.bg` | `color.bg.panel` | Test card |
| `test.card.radius` | `radius.lg` | Test card radius |
| `test.mono.text` | `#D7DCE8` | Debug-safe text |

## Test Lab Visual Rules

- Test Lab must not look like production user UI.
- It can use technical labels.
- It must show clear PASS/FAIL states.
- It must never display real user data.
- It must never display production secrets.
- It must help detect sensitive field leaks.

---

# Accessibility Direction

## Minimum Direction

Future implementation should aim for:

- readable contrast on dark backgrounds
- minimum 44px touch targets
- visible focus states
- non-color-only state indicators
- reduced motion support
- readable voice limit messages
- clear playback controls

## Accessibility Rules

- Do not rely only on blur to explain hidden state.
- Pair privacy states with text.
- Do not use red as default privacy denial color.
- Use danger colors only for safety/destructive actions.
- Ensure voice controls are obvious without reading long text.

---

# Do / Do Not

## Do

- Use dark cinematic backgrounds.
- Use soft premium borders.
- Use calm gradients sparingly.
- Give voice UI strong visual importance.
- Make reveal states feel safe.
- Make hidden states feel intentional.
- Keep Feed dense and mobile-native.
- Keep Chat clean and central.
- Keep Test Lab visually clear.

## Do Not

- Use dating-app pink/red identity as the main brand.
- Make the app look like a website.
- Use harsh rejection visuals.
- Use public-profile social network patterns.
- Make every surface glow.
- Expose real profile details in visual states before permission.
- Use warning-card design for normal privacy states.
- Create tokens that imply app code has started.

---

# Future Implementation Mapping

When implementation is explicitly approved later, these token groups may map to:

- shared TypeScript theme objects
- React Native theme constants
- web CSS variables
- Tailwind theme extension
- Figma variables
- Test Lab visual state constants

But no implementation file should be created from this document until the implementation gate is cleared.

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
