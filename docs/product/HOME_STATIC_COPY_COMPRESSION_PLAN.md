\# Home Static Copy Compression Plan



\## Phase



Phase 16A — Documentation-only Home Static Copy Compression Planning



\## Purpose



This document defines how the Home screen should later be compressed and polished without changing navigation behavior.



The goal is to make Home feel more like a real premium app entry and less like a product explanation page.



This phase is documentation-only.



No route UI changes are included in Phase 16A.



\---



\## Current Home State



Home was previously upgraded from a temporary route shell to a static premium app entry.



Current Home includes:



\- Brand block

\- Hero card

\- Primary path card

\- Flow card

\- Route card

\- PrivacyNote

\- SoftAction



Current Home is better than the old route shell, but still has explanatory density.



\---



\## Compression Goal



The next Home polish should:



\- Reduce long explanatory copy

\- Strengthen first-screen impact

\- Make Discover and Feed feel like primary actions

\- Keep Chat/Profile/Reveal Requests available as secondary areas

\- Preserve existing Link-based navigation

\- Avoid tabs

\- Avoid router.push

\- Avoid new navigation behavior

\- Avoid fake user/activity/data



\---



\## Keep / Compress / Remove Decision



\### 1. Brand Block



Decision: Keep, but compress.



Current role:



Introduces ankion and the voice-first privacy promise.



Compression direction:



\- Keep brand name.

\- Shorten title.

\- Shorten description.

\- Make first screen feel sharper.



Possible future copy:



\- Title: Anonymous voice-first discovery.

\- Description: Start with voice. Reveal identity only with permission.



\---



\### 2. Hero Card



Decision: Keep, but compress.



Current role:



Explains the product promise.



Compression direction:



\- Reduce paragraph length.

\- Keep privacy-first message.

\- Keep pills.

\- Avoid repeating the same concept from brand block.



\---



\### 3. Primary Path Card



Decision: Keep and visually strengthen.



Current role:



Points users to Discover and Feed.



Compression direction:



\- Make Discover and Feed the strongest Home actions.

\- Reduce explanation.

\- Keep existing Link behavior.



Future direction:



This should become the main Home action area.



\---



\### 4. Flow Card



Decision: Compress heavily.



Current role:



Explains the static product flow.



Compression direction:



\- Keep 3-step logic.

\- Reduce each description.

\- Avoid documentation tone.



Possible future steps:



1\. Discover or Feed

2\. Chat

3\. Profile control



\---



\### 5. Route Card



Decision: Keep as secondary navigation.



Current role:



Links to Chat, Profile, and Reveal Requests.



Compression direction:



\- Keep lower on screen.

\- Make it feel like app areas, not developer route list.

\- Keep Link-based static navigation.



\---



\### 6. PrivacyNote



Decision: Keep, but shorten later if repeated.



Current role:



Confirms current screen is static and behavior-free.



Compression direction:



\- Avoid developer-facing phrases in user-facing UI.

\- Keep privacy reassurance.



\---



\### 7. SoftAction



Decision: Reconsider later.



Current role:



Passive future navigation note.



Compression direction:



\- Remove if Home feels too explanatory after compression.

\- Keep only if it helps clarity.



\---



\## User-Facing Copy Rules



Home should not sound like internal planning.



Avoid:



\- static

\- phase

\- route

\- behavior-free

\- backend

\- implementation

\- navigation system



Prefer:



\- Start with voice

\- Keep identity private

\- Explore anonymously

\- Continue into Chat

\- Profile opens only with permission



\---



\## Proposed Future Home Order



Recommended order after compression:



1\. Brand Block

2\. Hero Card

3\. Primary Discover / Feed actions

4\. Compact flow card

5\. Secondary app areas

6\. Short privacy note

7\. Optional SoftAction



\---



\## Phase 16B Recommendation



\### Phase 16B — Home Static Copy Compression Implementation



Allowed:



\- Edit only `apps/mobile/app/index.tsx`

\- Static UI only

\- Existing Link-based navigation only

\- Existing components only



Goal:



Compress Home copy and improve first-screen product feel without adding behavior.



Forbidden:



\- Tabs

\- router.push

\- New navigation behavior

\- Backend/API

\- Supabase/Auth/RLS/Storage

\- Mock users

\- Mock media

\- Mock messages

\- Voice recorder

\- Real audio

\- Reveal logic

\- Upload behavior

\- Package changes



\---



\## Validation For Future Phase 16B



Run:



\- `corepack pnpm --filter @ankion/mobile typecheck`

\- `corepack pnpm --filter @ankion/web typecheck`



APK build is not required unless multiple visual changes accumulate.



\---



\## Acceptance Criteria for Phase 16A



Phase 16A is complete when:



\- This document exists.

\- No route files changed.

\- No component files changed.

\- No package files changed.

\- No lockfile changed.

\- No backend/security/data files were added.

\- Home compression direction is documented.

\- Future Home implementation remains limited to static UI.

\- No real behavior is introduced.



\---



\## Current Decision



The next Home work should be copy and visual compression only.



The product should not move to tabs, router.push, backend, recorder, reveal logic, upload behavior, or real data yet.

## Phase 16B-16D Completion Record

Phase 16B completed:

- `apps/mobile/app/index.tsx` was manually updated.
- Home copy was compressed.
- First-screen product feel improved.
- Discover/Feed became clearer primary actions.
- Existing Link-based navigation was preserved.
- No tabs, `router.push`, redirects, or new navigation behavior were added.

Phase 16C completed:

- Local validation passed after Home static copy compression.

Phase 16D completed:

- Docs/status alignment was completed.
- Route UI files were audited but not modified.
- No backend/API, Supabase/Auth/RLS/Storage, mock data, recorder/audio/reveal/upload behavior, package changes, lockfile changes, apps/web source changes, tabs, redirects, `router.push`, or new navigation behavior was added.

Next recommended phase:

- Discover/Feed static copy compression planning, or a final static visual rhythm audit across Chat and Home.
