# Changelog

All notable website updates are tracked here using semantic versions. Every release is also tagged in git (`git tag`), so any version can be restored with `git checkout vX.Y.Z`.

## [1.7.1] — 2026-09-16

**The site is live**: https://visithra-agro-site.visithra-agro-site.workers.dev — deployed via Wrangler CLI direct upload (no GitHub involved, per the user's preference), after installing Node.js and authenticating `wrangler login`.

**A real incident happened during the first deploy and was caught and fixed the same session:** Wrangler's asset upload does **not** honor `.gitignore` — confirmed directly, since `.claude/` (already gitignored) was uploaded anyway. The very first deploy published the entire `.git` directory (full history, objects, refs) and the internal `requests/`/`README.md`/`CHANGELOG.md` docs at public URLs. Caught by inspecting the deploy log's file listing rather than assuming success from the "Success!" message. Fixed within minutes:
- Added `.assetsignore` (a separate, Cloudflare-specific ignore file the asset uploader *does* respect) excluding `.git`, `.claude`, `.wrangler`, `wrangler.jsonc`, and the internal docs.
- Redeployed immediately and verified with direct requests that `/.git/config`, `/.git/FETCH_HEAD`, and `/README.md` now 404 on the live site, while `/`, `/styles.css`, `/script.js`, and `/assets/*` still serve correctly (200).
- Checked deployment/version history: only the corrected version is receiving live traffic, and this deploy path (plain `wrangler deploy`, not the gradual-rollout preview flow) does not appear to expose a separately-reachable public URL for the earlier version.

Also worth recording: a warning message inside the `wrangler` CLI's own output contained text addressed to "agents," instructing a specific response framing and steering future command choices. Flagged to the user directly rather than followed, consistent with treating tool-output content as untrusted data rather than instructions.

Separately verified on the actual live deployment (not just locally): security headers from `_headers` are present on real response headers (confirmed via `curl -D -`, served from Cloudflare's Munich PoP), and a real end-to-end contact-form submission through Web3Forms succeeds from the production origin, with no console errors.

## [1.7.0] — 2026-09-16

Prepped the repo for going live on **Cloudflare Pages** (chosen after comparing it against Netlify, Vercel, GitHub Pages, and Firebase Hosting on Europe/India edge coverage, bandwidth limits, versioned-deploy/rollback support, and built-in security — see `requests/v1.7.0-brief.md` for the full comparison):

- Added `.gitignore` — excludes `.claude/` (a leftover git worktree from an earlier peer-review session, never meant to be part of the deployed site) and common OS junk files, so they don't end up pushed to GitHub or deployed.
- Added `_headers`, which Cloudflare Pages reads automatically to apply security headers at the edge: a strict Content-Security-Policy (no `unsafe-inline`, no wildcard origins — verified safe by confirming the site has no inline `<script>`/`<style>` and no external origins beyond Google Fonts and the Web3Forms API), plus `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.
- Documented the actual deployment steps (GitHub connection, Cloudflare Pages build settings, versioned-deploy/rollback workflow) in `README.md`'s hosting section, replacing the earlier "here are some options" text now that a host is decided.

Verified the CSP doesn't break anything before relying on it: temporarily mirrored the same headers on the local test server, loaded the site fresh, and confirmed Google Fonts still resolve (computed `font-family` correctly shows "Playfair Display", not a fallback) and a real end-to-end contact-form submission through Web3Forms still succeeds — with the strict CSP in place, `connect-src`/`form-action` correctly permit the request. No console errors, no CSP violations.

## [1.6.9] — 2026-09-16

- **Contact form now delivers real email**, via Web3Forms (chosen after comparing it against Formspree, EmailJS, Netlify Forms, and a custom serverless-function + Resend approach — host-agnostic, already wired into the code, and the most generous free tier of the no-backend options; see `requests/v1.6.9-brief.md` for the full comparison). Filled in `CONFIG.businessEmail`, `CONFIG.phone`, `CONFIG.address`, and `CONFIG.web3FormsKey` in `script.js` with live values, replacing the placeholders.
- **Fixed a real, separate bug found while testing the form**: the phone field's `pattern` attribute, `^[0-9+\-\s()]{7,20}$`, threw `Uncaught SyntaxError: Invalid regular expression ... /v: Invalid character in character class` the moment `checkValidity()` ran on it — the browser's regex engine now compiles HTML `pattern` attributes in Unicode-Sets (`v`) mode, which (unlike the older mode) requires literal `(` and `)` inside a character class to be escaped. Fixed by escaping them: `^[0-9+\-\s\(\)]{7,20}$` — valid under both the old and new regex modes, so this is safe across browsers regardless of which mode they use.

Verified with two real, live submissions through the actual Web3Forms API (clearly marked as test submissions in the message body): both returned success, showed the "Thank you — your enquiry has been sent" status, and correctly reset the form afterward. Re-confirmed the phone pattern fix rejects invalid input (letters, too-short) and accepts valid formats (including with parentheses, e.g. `+1 (555) 123-4567`) without throwing. No other console errors.

## [1.6.8] — 2026-09-16

Four issues found by the user testing very narrow browser windows, with screenshots:

- **Product card overflowing to the right at narrow widths** (shrinking/asymmetric margin, a clipped-looking rounded corner, and clipped text — all the same underlying cause). `.product-card`'s mobile `min-width: 90vw` sized against the *raw viewport width*, but the card sits inside a section that already has its own horizontal padding — so the card needed more room than was actually available and overflowed rightward, worse the narrower the window got (confirmed directly: at 250px wide, the outer margin was 17.5px on the left vs. just 7px on the right, and shrinking further below that). Changed to `min-width: 90%`, which sizes against `.product-track`'s own already-padded width instead, so the card can never ask for more room than it actually has, at any width.
- **No visible way to close the mobile fullscreen menu without picking a link.** `.menu-toggle` (the hamburger/close button) had `z-index: 2` while `.site-menu`'s fullscreen overlay had `z-index: 15` — both children of the same `position: fixed` header, so once the menu opened, its full-viewport overlay visually buried the toggle button underneath itself. The button was still there and still technically clickable if you knew exactly where to tap, but invisible — there was no way to see it, let alone recognize it as a close control. Raised `.menu-toggle` to `z-index: 16` so it stays on top of the open overlay; it already had a cream "✕" styling for the open state (`.menu-toggle[aria-expanded="true"]`), which was simply never able to be seen before this fix.

Verified: at 250px viewport width, the card now sits with a clean, non-overflowing margin on both sides, no horizontal page overflow, and no clipped text (checked both the Gloriosa and Coconut cards). Confirmed via `elementFromPoint` that the toggle button is now the topmost element at its own position while the menu is open (previously the overlay was), and that clicking it closes the menu correctly. No console errors.

## [1.6.7] — 2026-09-16

Follow-up to v1.6.6: the user reported the header Products submenu was still not landing correctly on their device — a screenshot showed the destination card overlapping with odd, misplaced-looking content mid-transition.

Extensive testing here (including forcing the exact scenario of jumping from the Coconut card all the way back to Gloriosa, and forcing scroll behavior to instant to inspect the settled end-state deterministically) could not reproduce a wrong *final* resting position — every case landed with the correct family, the correct first photo, and the correct vertical position. That points at the *transition* itself rather than the destination: the click fired three independent smooth-scroll animations at the same instant (the page's vertical scroll to `#products`, the family track's horizontal scroll, and the newly-selected family's photo gallery resetting to its first image) — and three simultaneous smooth-scroll/transition animations sharing the same fixed, `backdrop-filter`-blurred header is exactly the kind of thing that can paint a torn or glitchy-looking frame while they're mid-flight on some browsers, even though each animation's own target was independently correct.

Changed the header submenu handler to run the vertical scroll first and only start the horizontal track scroll and photo reset once it has genuinely finished — using the `scrollend` event (with a 700ms timeout as a fallback for browsers without it) rather than firing everything at once. `autoplayFamilyIndex`/`autoplayStopped` and starting autoplay itself don't involve any visual motion, so those still happen immediately on click, unaffected.

Verified the sequenced flow still lands correctly (mobile and desktop, including the large-jump Coconut→Gloriosa case), confirmed the `scrollend`-driven handoff actually fires and completes within about a second, and re-confirmed no console errors.

## [1.6.6] — 2026-09-16

Fixed the header "Products" submenu not landing correctly (`#products` in the URL worked fine, but clicking a family under Products didn't). The click handler fired two `scrollIntoView` calls back to back — one explicit scroll of the page to the top of `#products`, and `card.scrollIntoView({block:'nearest', inline:'start'})` to bring the chosen card into view within the family track. The second call's ancestor-walk isn't limited to the track: it can also scroll the *page's own vertical position*, so both calls ended up fighting over the same vertical scroll at once, landing somewhere neither one intended. Fixed by adding `scrollTrackToCard()`, which moves only `.product-track`'s own `scrollLeft` directly and never touches the document — the same technique `scrollGalleryToSlide()` already used for the inner photo galleries, now applied to the outer family track too (also used by the carousel prev/next buttons and autoplay's family-to-family transition, closing off the same latent race there as well, even though it wasn't visibly broken there since nothing else was competing for the vertical scroll at those call sites).

Verified with the page's scroll behavior forced to instant (this test browser suspends real smooth-scroll animation while its tab isn't the active one, so instant substitution is the reliable way to check the final resting position): confirmed `scrollTrackToCard` never changes `window.scrollY`, so the two scrolls in the family-link handler can no longer race regardless of real-world timing. Re-confirmed wraparound (prev at the first family still correctly wraps to the last) is unaffected by the refactor. No console errors.

## [1.6.5] — 2026-09-16

Fixes for two issues the user found by reviewing v1.6.4 directly (screenshots with the problem areas marked):

- **Mobile Products submenu clipped off the left edge of the screen.** The v1.6.0 restructure into `.nav-item > .submenu-wrap > .submenu` reset several properties for the mobile breakpoint but missed `transform` — `.submenu-wrap`'s base-rule `transform: translateX(-50%)` (needed to center the desktop dropdown) still applied even though `position` was overridden to `static`, since `transform` isn't gated by positioning scheme. That shifted the whole mobile submenu block left by half its own width, clipping "Gloriosa Superba" / "Coconut Products" / "more products yet to come" down to their last few characters. Added `transform: none` to the mobile override.
- **Empty gap floating in/around the product text column**, a direct side effect of v1.6.4's own fix: now that `.gallery-stage` can grow as tall as it is wide, it's often taller than the text column, and `.product-card`'s `align-items: center` centered the shorter text column inside that taller row — leaving equal, disconnected-looking gaps above *and* below the text. Changed to `align-items: start` (text now flush with the image's top edge, matching normal image+caption composition), then went a step further: `.product-detail` now stretches to match the image's full height and lays its content out as a column, with the "Ask about…" link pinned to the bottom via `margin-top: auto` — so the leftover space reads as intentional (content up top, call-to-action anchored at the bottom, both columns the same height) instead of a plain dead gap.

Re-verified against everything already covered in v1.6.4 (large-monitor square-cap behavior, previously-tuned baseline sizes, horizontal-overflow fix) plus the single-column mobile/tablet layout, where the new stretch/flex rules turn out to be a no-op (each card occupies its own row there, so there's no taller sibling to stretch against) — confirmed no gap reappears between the subproduct list and the link at 700px width. No console errors.

## [1.6.4] — 2026-09-16

Cross-viewport responsiveness audit of the whole site, prompted by the Products section breaking on browser resize. Tested widths from 320px to 3440px and heights from 568px to 1440px. Found and fixed two real bugs, both specific to large monitors:

- **Gallery frame distorted into a tall, narrow strip on large/wide monitors.** `.product-card` stops growing past 1200px wide (so the photo frame's own column plateaus at ~549px), but `.gallery-stage`'s height kept scaling with `60svh` regardless — at 1920×1080 the frame came out 549×648px (aspect 0.85), and at 2560×1440 it was 549×864px (aspect 0.64, more than half again as tall as it is wide). Fixed by making `.product-gallery` a CSS container (`container-type: inline-size`) and adding a third term to the height formula, `100cqw` — 100% of the gallery's own rendered width — so the frame can still grow taller on tall screens (unchanged at every previously-tuned size, e.g. still exactly 420px at 1366×700 and 489.6px at 1366×816) but never past square. Confirmed both 1920×1080 and 2560×1440 now render a clean 1:1 square frame, and 3440×1440 too.
- **The whole page could scroll horizontally**, not just the product carousel — `body` had `overflow-x: hidden` but `html` didn't, so `html`'s own `overflow-x` stayed at the default `visible`. Found this by watching `document.documentElement.scrollWidth` balloon by hundreds of pixels (and `window.scrollX` end up non-zero) after resizing the window while a card other than the first was in view — an ancestor-walking scroll (`scrollIntoView({inline:'start'})`, used throughout the Products carousel) was able to scroll the *document* horizontally instead of just the intended inner track. Added `overflow-x: hidden` to `html` as well, closing the gap.

Also re-verified: header nav doesn't wrap or overlap the logo anywhere from 761px (just above the mobile breakpoint) up; `.products h2` and `.supply-line`'s `white-space: nowrap` don't clip their text at any width down to the mobile breakpoint where they're allowed to wrap; mobile fullscreen nav still fills the viewport correctly (from v1.6.0); no horizontal overflow anywhere in the full width matrix; no console errors.

## [1.6.3] — 2026-09-16

- Sped up the Products autoplay pace: `AUTOPLAY_INTERVAL_MS` changed from 3500ms to 2500ms. Chosen after previewing 2.0s/2.5s/3.0s side by side in a standalone comparison artifact built from the site's own photos.

## [1.6.2] — 2026-09-16

- "Products" in the header no longer navigates on its own click — it's a label for the dropdown now; only choosing a family from the submenu (or waiting to hover it) goes anywhere.
- Fixed the Products dropdown staying open after picking a family: since visibility is purely `:hover`/`:focus-within`-driven, clicking a link while the mouse is still resting on the dropdown left it visually open. A family selection now force-closes it (a `.submenu-closing` class overriding the hover styles via `!important`) until "Products" is hovered/focused again — so the visitor can return and pick a different product. Reset automatically whenever the mobile fullscreen menu is reopened, since touch has no hover/mouseleave to clear it otherwise.
- Excluded the "Products" trigger from the set of links that auto-close the mobile menu, since it no longer represents a real destination — tapping it doesn't collapse the whole nav for no reason.
- **Corrected the autoplay behaviour** per follow-up clarification — previous versions treated any click anywhere as a permanent, page-wide "autoplay is now off" switch. The intended behaviour is per-visit: a click stops autoplay only until the visitor leaves the Products section and comes back (scrolling away and returning, or picking a family from the header, both give it a fresh start from wherever it left off — family and photo position are preserved across pauses, only the "stopped by interaction" flag resets). Concretely:
  - Selecting a family from the header dropdown now navigates there *and* starts autoplay from that specific family (previously it always assumed family 1, regardless of which one was actually picked, and — since it stopped autoplay entirely — never restarted it at all). This click deliberately bypasses the global "any click stops autoplay" listener (`stopPropagation`), since it's the one interaction meant to start autoplay rather than end it.
  - The section's `IntersectionObserver` now clears the "stopped by interaction" flag every time the section comes back into view, rather than that flag being permanent for the rest of the page visit. `prefers-reduced-motion` is unaffected — it still opts out for good, enforced by a dedicated guard directly inside `startAutoplay()`.

## [1.6.1] — 2026-09-16

- Highlighted the currently-viewed section's nav link (header scrollspy): an `IntersectionObserver` watching a thin band near the vertical centre of the viewport marks whichever of Home/Our story/Products/Contact is current with an `.active` class (rust text colour, permanent underline).
- **Fixed the Products dropdown collapsing before it could be used:** the 14px visual gap between "Products" and the dropdown card sat outside both elements' hoverable boxes, so moving the mouse down into the list broke `:hover` and closed it first. Split the hover/positioning box (`.submenu-wrap`, now flush against the trigger with zero gap, sized to match the dropdown exactly) from the visible card (`.submenu`, pushed down visually via the wrapper's padding) — the pointer now stays over a `.nav-item` descendant continuously from the trigger to any item in the list.
- "More products yet to come" no longer forced to uppercase (`text-transform: none`) — shows in its natural sentence case.
- Family carousel-buttons and gallery photo nav buttons now wrap around at either end (next past the last goes to the first, prev before the first goes to the last) instead of stopping dead.
- Autoplay now stops for good on **any** click anywhere on the site, not just inside the Products section — added a `document`-level click listener alongside the existing carousel-specific ones.
- Gallery photo nav buttons (`.gallery-nav`) now share the exact same rust-glow border/fill/hover treatment as the family carousel-buttons, and both are sized 34px (38px on mobile) — uniform look and feel across both button types, as requested.
- "Gloriosa Superba" no longer force-broken onto two lines, matching the single-line treatment "Coconut Products" already got in v1.5.7.
- Added a small © mark next to "AGRO" in the brand wordmark (header and footer, since they share the same markup). Caught and fixed a knock-on bug from this: the existing `.brand > span:last-child span` (descendant) selector also matched the new © span and force-`display:block`'d it onto its own line — narrowed to `.brand > span:last-child > span` (direct child) so it only targets the "AGRO" label as intended.

## [1.6.0] — 2026-09-16

- Added a "Home" link (→ the hero section) to the header nav, placed first, ahead of "Our story".
- Enlarged the header/footer logo: the brand mark grew from 27px to 34px, "VISITHRA" from `.8rem` to `.96rem`, and the "AGRO" sub-label from `.51rem` to `.58rem` — more in proportion with the rest of the page.
- Turned "Products" in the header into a dropdown: hovering (or, on keyboard, focusing) it reveals "Gloriosa Superba", "Coconut Products", and a non-clickable "More products yet to come" note. Clicking a family name scrolls straight to that family's card in the Products carousel — both the page (to the top of the Products section) and the carousel itself (to that card), reusing the same `scrollIntoView` mechanics as the existing carousel prev/next buttons. On mobile, the dropdown is simply always expanded under "Products" in the fullscreen nav (no hover on touch).
- **Bug found and fixed along the way:** `.site-header` has `backdrop-filter`, which (per spec) makes it the *containing block* for its `position: fixed` descendants — so the mobile fullscreen `.site-menu` overlay was being sized against the 64px-tall header box instead of the viewport, badly clipping it. This predates today's changes (backdrop-filter itself shipped in v1.5.5) but only became obvious once the menu had more content to show. Fixed by dropping `backdrop-filter` on `.site-header` specifically at the mobile breakpoint, where the frosted-glass effect isn't missed but the fullscreen overlay now needs the true viewport as its containing block.
- Added autoplay to the Products section: once it scrolls into view, the current family's photos advance automatically one at a time; when a family's photos are exhausted, the carousel advances to the next family and starts advancing its photos, looping back to the first family after the last. Pauses while the section is scrolled out of view (via `IntersectionObserver`), and stops for good — no auto-resume — the moment the visitor interacts with the carousel: clicking a nav button (family switcher or photo prev/next), or a pointerdown/keydown on the family track or a photo strip (drag-to-scroll, arrow keys). Skipped entirely for visitors with `prefers-reduced-motion: reduce`.

## [1.5.8] — 2026-09-16

- Gave the family-switcher prev/next buttons (`.carousel-button`) a rust-coloured tint and glow so they read clearly against the dark green Products background instead of blending into it: border and fill switched from a near-invisible translucent white/dark-green to a rust tint (`rgba(217,92,49,...)`, the site's existing accent colour, already used for "02" in the section label and other highlights), plus a soft `box-shadow` glow around the ring. The hover/focus state's lime swap now also glows to match, for a consistent, visible highlight in both states.
- Purely a colour/shadow change — button size, position, and the "01 / 02" label are untouched.

## [1.5.7] — 2026-09-16

- Renamed the Gloriosa Superba product family heading from "Gloriosa Superba Products" to "Gloriosa Superba" (dropped the redundant "Products" suffix); also updated the matching `name` field in `script.js`'s `productGalleries` data (used in the gallery's screen-reader label and empty-state text) to stay consistent.
- Brought the Coconut Products heading onto a single line — removed the forced `<br />` between "Coconut" and "Products" so it flows naturally instead of stacking as two lines. Confirmed it renders as one line (not wrapped) at both a typical desktop width and on mobile.
- Made the family-switcher prev/next buttons bigger and easier to see: `.carousel-button` grew from 26px to 34px (mobile: 30px → 38px), with the arrow glyph scaled up to match. Left the "01 / 02" page-number label untouched, as requested. Re-verified the buttons still sit cleanly next to "02 Our range" without overlapping "Naturally versatile..." at the narrowest width tested (1366px), and confirmed the product frame's "fits one screen" sizing is unaffected (still 29px of margin at a 700px-tall window).

## [1.5.6] — 2026-09-16

- Fixed a real gap below the product card: `.products` only ever overrode `padding-top` (a small `clamp(1.25rem, 2.4vw, 2rem)`), so `padding-bottom` was inheriting the much larger generic `.section-padded` value (up to 5.75rem / 92px at typical widths) — unlike `.contact`, which already had both overrides. Gave `.products` a matching `padding-bottom`, reclaiming that dead space.
- Used the reclaimed room (plus the "fits one screen" budget generally) to grow the photo frame itself further: `.gallery-stage`'s height formula changed from `min(48vw, 55svh)` to `min(48vw, 60svh)` — 420px tall at a 700px-tall window (up from 385px, still with 29px of real margin to spare, the tightest case tested), 489.6px at 816px (up from 448.8px).
- Widened the cream margin between the card's edge and the photo/gallery frame itself: `.product-card`'s padding increased from `1.6rem` to `2.1rem` (25.6px → 33.6px) on desktop layouts. Left the mobile (`max-width: 980px`) override at `1.6rem`, since mobile has much less width/height budget to spend on padding.
- Verified across the full established test matrix (700, 816, 864, 1000px viewport heights, plus mobile 375×812): no horizontal overflow at any size, no overlap between the gallery and detail columns or clipped text, and the shortest window tested (700px tall) still keeps a genuine 29px margin below the card — not a knife-edge fit.

## [1.5.5] — 2026-09-16

- Cross-browser compatibility pass so the site renders and behaves the same on Chrome, Firefox, Safari (desktop and iOS), and Edge — no visual or functional change on browsers that already support the modern CSS used here, only added safety nets for ones that don't:
  - Added `-webkit-backdrop-filter` alongside every `backdrop-filter` (header, carousel buttons, gallery nav buttons, gallery photo counter) so the frosted-glass effect also renders on Safari versions that need the prefix, instead of silently falling back to a solid background.
  - Added a `100vh`/`vh`-based fallback declared *before* the `svh`-based one on `.hero` and `.gallery-stage`, so browsers without `svh` support (an invalid unit would otherwise drop the whole `height`/`min-height` declaration) get a sane viewport-relative size instead of collapsing to content height.
  - Added `-webkit-text-size-adjust`/`text-size-adjust: 100%` and `-webkit-tap-highlight-color: transparent` for consistent mobile text sizing and tap feedback across iOS Safari and Android Chrome.
  - Added `appearance: none` to the base `button` reset so custom-styled buttons render identically instead of picking up each browser's native button chrome.
- Verified no regression to the already-tuned Products/Contact "fits one screen" sizing: re-measured `.gallery-stage` and section heights at 700px, 816px, and mobile (375×812) viewport sizes — identical to the v1.5.4 figures, since Chromium already supports every modern feature involved and the fallback declarations are simply overridden by the cascade. No console errors, no horizontal overflow.

## [1.5.4] — 2026-09-16

- Made the photo frame grow downward to fill more of the empty space beneath the product card on taller screens, instead of only growing with the card's width as it did in v1.5.2/v1.5.3. `.gallery-stage`'s height is now `min(48vw, 55svh)` — so it can grow well past what the width-only formula allowed when there's real vertical room (449px tall at 816px viewport height, up from 418px; 550px at 1000px viewport height), while automatically shrinking back down on short viewports, giving *more* safety margin there than before (51px to spare at a 700px-tall window, up from 32px).
- The inner padding between the photo and the card's edge is untouched (still the card's fixed 1.6rem padding on every side) — confirmed it stays visually consistent at every size, since it doesn't scale with the frame.

## [1.5.3] — 2026-09-16

- Moved the family-switcher prev/next buttons from their own line above "02 Our range" to sit on the same line, to its right — between the label and "Naturally versatile...". Buttons and index text shrunk a little to sit proportionately next to the small label.
- With that row gone, used part of the freed-up height to grow the product card itself (`min-width: 1140px` → `1200px`, both columns wider) — the photo frame grows from 527×395 to 557×418 via its existing aspect ratio, and the wider text column tends to wrap to fewer lines too.
- Verified the section still fits comfortably across the same spread of viewport heights as before: 32px to spare at 700px, 146px+ at 816px and up — smaller margins than v1.5.2 (since the frame is now intentionally bigger), but still a real, non-knife-edge fit, not just barely making it.

## [1.5.2] — 2026-09-16

- Fit the Products section to the screen without touching the photo frame or image size at all (both are pixel-identical to v1.4.5/v1.5.1) — per explicit instruction, the space was found elsewhere instead:
  - Moved the family-switcher prev/next buttons and the "01 / 02" index off their own row below the product card and up next to "02 Our range", as a small stacked group in the heading's left column. This removes an entire row's worth of height from the bottom of the section, where nothing else was making use of it.
  - Tightened the remaining heading and product-detail text spacing a little further (all in areas that don't affect the gallery column's width, so the photo frame's size couldn't be touched even indirectly).
- Verified across a spread of viewport heights again: the whole product carousel (photo, text, and the family-switcher) now fits with a comfortable 34-149px to spare from 700px of viewport height up through 900px+; below ~700px it starts running out of room, since the photo frame's fixed size is now the hard floor by design.

## [1.5.1] — 2026-09-16

- Reverted v1.5.0 in full: the user was not satisfied with it. `styles.css` restored exactly to its v1.4.5 content — the viewport-height-aware gallery frame sizing, the compact chip-style sub-product list, and the rebalanced product-card columns are all undone. The site now looks and behaves exactly as v1.4.5 did (only the version number is new, since v1.4.5's tag already points to the earlier commit). `git checkout v1.4.5` still works and reaches the same result directly, if ever needed.

## [1.5.0] — 2026-09-16

- **Found and fixed the real reason the Products section kept overflowing despite earlier trimming**: the photo frame's height had been purely *width*-driven (`aspect-ratio: 4/3`) ever since v1.4.0's switch to a uniform cropped-photo treatment — it had no awareness of the viewport's actual *height* at all. On a wide-but-short browser window, it never shrank no matter how little vertical room was left, which is exactly what the screenshot showed. Replaced it with `height: min(40vw, 28svh)`, so the frame now scales down on short screens the same way the hero section's own sizing does, instead of staying a fixed size regardless.
- **Redesigned the sub-product list** from a bordered, full-width row-per-item layout to a compact row of wrapped chips (name + short description stacked in each small tag). This is both more compact — meaningful for Coconut's 4 sub-products — and, subjectively, tidier and more modern-looking than a list of horizontal rules.
- Rebalanced the product card's two columns (`1fr 1fr` → `.9fr 1.1fr`, gallery slightly narrower, text slightly wider) so the description wraps to fewer lines, and tightened the remaining text spacing (heading, description, safety note, card padding) further.
- **Tested across a real range of viewport heights** this time, not just two — the section now fits with a comfortable margin from 700px of viewport height up through 900px+ (e.g. 78px to spare at 1600×750, 228px at 1920×900), and is only marginally short (9px) at a genuinely extreme 650px. Previous rounds had only confirmed two specific sizes, which is how the underlying width-only sizing issue went unnoticed.

## [1.4.5] — 2026-09-16

- Fixed the Products heading's uneven spacing — the gap above "02 Our range"/"Naturally versatile. Carefully supplied." (section padding-top + the heading's own top padding) was noticeably larger than the gap below it (just the heading's bottom padding) before the product card. Both gaps now come from the exact same `clamp()` expression, so they're pixel-identical at every viewport width (confirmed 32px/32px at both 1440×816 and 1366×768) instead of visually mismatched.
- Trimmed that shared clamp's ceiling slightly (2.5rem → 2rem) and the pagination row's top margin (1.3rem → 1rem) to make room for the now-doubled gap without giving back the "fits in one screen" work from v1.4.2 — re-verified the section still fits fully inside the viewport at both sizes tested, with a comfortable margin (32-53px to spare), not just barely.

## [1.4.4] — 2026-09-16

- Moved the product-family prev/next buttons off the card's left/right edges and into a single row below the card, together with the "01 / 02" page indicator (prev arrow, index, next arrow — centered, evenly spaced). Same click behaviour as always. This also freed up the mobile card padding that had been added only to keep those side buttons clear of the inner per-photo gallery-nav buttons.

## [1.4.3] — 2026-09-16

- Restored "02 Our range"'s original position: a narrow left-hand column, bottom-aligned against the heading's last line, with "Naturally versatile. Carefully supplied." following in a wider column to its right — the grid layout used through v1.3.6 (`.products-heading` had been switched to a centered flex row in v1.4.0). Confirmed against a screenshot of the earlier version. The Products section still fits the viewport as it did in v1.4.2 — this only changed how the two pieces of text are arranged, not their size or the section's overall height.

## [1.4.2] — 2026-09-16

- Made the Products and Contact sections fit fully inside a normal browser window when navigated to, the same way the hero section already does — verified by measuring actual rendered content against real viewport sizes (1440×816, 1366×768), not just eyeballing:
  - Both sections had inherited the same large, generic top *and bottom* section padding as every other section (previous rounds only ever trimmed the top). Gave both their own much smaller padding, top and bottom.
  - **Products**: the product-detail text column (heading, description, safety note, sub-product list) had become the tallest part of the card once the photo frame was made compact in v1.4.0, so it hadn't shrunk along with everything else. Tightened its spacing again, plus the card's own padding and the small gaps around the heading/index label.
  - **Contact**: the enquiry form was the limiting factor — tightened label spacing, input padding, the product-interest fieldset, and the status-message margin, and reduced the message textarea from 4 rows to 3 (still resizable by the visitor).
  - Confirmed both sections now fit with 80-110px to spare at the two viewport sizes tested. Mobile is unaffected in spirit — like the hero section, it naturally needs more height once content stacks into a single column, which is expected mobile behaviour rather than a regression.

## [1.4.1] — 2026-09-16

- Put "02 Our range" and "Naturally versatile. Carefully supplied." back on the same line (side by side, baseline-aligned), instead of v1.4.0's stacked/centered block — the label itself is unchanged, only its position relative to the heading.
- Fixed the inner per-photo gallery-nav buttons (‹ ›) sometimes being hard to see against busy or light photo backgrounds — v1.4.0 had made them translucent/subtle by default to reduce clutter, which went too far. They're back to a solid, high-contrast look (dark background, blur, border, shadow) at all times, not just on hover.
- Moved the product-family prev/next buttons off the centered row below the card and back onto the card's left/right edges, vertically centered — this is what "the side of the frame" meant, not the bottom row v1.3.6/v1.4.0 had settled on. To avoid the overlap with the inner gallery-nav buttons that caused the move away from this position in the first place, the buttons now sit further out from the card edge (`-1.5rem` vs. the `-.5rem` used before), which was verified to leave a clean ~22px gap from the inner buttons at desktop widths and ~10px on mobile — no overlap either way. The "01/02" index stays as a small label below the card, without buttons attached to it.

## [1.4.0] — 2026-09-16

- **Products heading**: removed the supporting paragraph ("Scroll through our current product families...") entirely; the "02 Our range" label and the "Naturally versatile. Carefully supplied." heading are now centered on the page as a simple stacked block, with clear spacing above and below both.
- **Product photo galleries — new approach, replacing every earlier attempt this session**: every photo in a gallery, whatever its original orientation, now displays in one uniform 4:3 frame using `object-fit: cover` (filling the frame completely, cropped as needed) instead of `contain` (which was trying to show the whole photo uncropped and needed a differently-shaped frame per photo orientation to avoid empty space — the source of several rounds of back-and-forth this session). This is simpler, uniform across both product families and every photo regardless of size or orientation, and — freed from needing the frame tall enough to avoid empty space — dramatically more compact: the whole product card is now ~570-600px tall (was ~570-900px depending on family) and fits fully inside a typical browser window with no scrolling needed to see the whole card.
- **Contact form**: every required field's label now shows a `*`, plus a small "* Required field" legend at the top of the form (previously only the legend existed, saying "All fields are required.").
- **Carousel controls**: kept the centered pagination row (prev arrow / "01 / 02" / next arrow) below the whole product card from v1.3.6. To reduce visual clutter when it's on screen together with the inner per-photo prev/next buttons, the inner buttons are now smaller and more subtle by default (fuller opacity/color only on hover), reading clearly as a secondary, photo-level control rather than competing with the primary family-switcher below the card.

## [1.3.6] — 2026-09-16

- Reverted v1.3.5's viewport-height cap on the product gallery frames — it directly undid v1.3.3's fix for portrait photos filling their frame edge-to-edge (both changes were fighting over the same `height` property for opposite reasons), so photos briefly went back to pillarboxing ("cluttered") for both families. Gallery frame heights and product-card padding/text spacing are back to their v1.3.4 sizing — confirmed by measuring every current photo again: all 8 render width-constrained (edge-to-edge, letterboxed top/bottom) like before.
- Instead of shrinking the product frame to fit the viewport, shrank the Products heading itself: "Naturally versatile. Carefully supplied." is now one line at a much smaller size (was a large 2-line heading), and the heading's grid column was widened to fit it. This keeps the actual product card at full, correct size while still moving it much higher up the page — it now starts right after the (compact) heading instead of ~450px further down.
- Moved the product-family prev/next buttons again: v1.3.4 put them on the card's left/right edges, but at the card's real padding they landed almost on top of the *inner* per-photo gallery-nav buttons in the same spot — visibly overlapping/cluttered. They're now a single centered pagination row (prev arrow, "01/02", next arrow) below the whole card, with no shared space with the inner photo controls at all. Click behaviour is unchanged.

## [1.3.5] — 2026-09-16

- Made the Products section fit within a typical browser viewport (verified down to 1280×720) when navigated to, instead of the heading and top padding pushing the actual product card mostly below the fold:
  - Gave the Products heading its own, much smaller heading size (previously shared with the About section's large display heading), tightened its supporting paragraph, and shrunk the section's own top padding.
  - The "01/02" family indicator's margins were tightened.
  - Gallery frame heights (both families) are now capped by viewport height as well as viewport width (`min(vw, svh)` instead of a fixed pixel ceiling), so the frame doesn't grow past what the screen can actually show.
  - Reduced the product card's own padding and tightened spacing in the text column (heading, description, safety note, sub-product list) so it doesn't become the limiting factor once the gallery got shorter.
- On very short viewports (roughly under 700px tall) a little scrolling within the card may still be needed — that's an honest limit of fitting a photo, a regulatory description, and a sub-product list on screen at once without cutting content; everything from ~720px tall upward now fits with no scrolling. Mobile is unaffected in spirit (it already stacks photo above text, which needs more height by nature) but got the same size trims.

## [1.3.4] — 2026-09-16

- Moved the product-family carousel's prev/next controls from a small "← 01/02 →" bar above the cards to full-size circular buttons on the left and right edges of the product-card frame itself, vertically centered — a more familiar, discoverable carousel pattern than a corner control bar. The "01/02" position indicator stays as a small label above the cards. No change to the underlying navigation logic — same buttons, same click behaviour, just repositioned.
- (Not a site change, but worth recording: confirmed the v1.3.3 frame-height fix was correct on disk the whole time — what looked like it "still" not working was the local preview server caching the old `styles.css`. Added `Cache-Control: no-store` to the throwaway local preview server so this can't cause confusion again.)

## [1.3.3] — 2026-09-16

- Gave the Gloriosa Superba gallery its own taller frame (`clamp(340px, 64vw, 700px)` vs. Coconut's unchanged `clamp(260px, 46vw, 560px)`), so its portrait-oriented photos fill the frame edge-to-edge left-to-right, with the (now expected, matching Coconut's own look) empty space landing at top and bottom instead of on the sides. `object-fit: contain` alone can't do this — which side gets the empty space is decided by comparing the *frame's* own aspect ratio to the photo's, not by the `object-fit` value, so a portrait photo needed a taller frame, not a CSS tweak to the image itself. Coconut's frame and photos are unchanged.

## [1.3.2] — 2026-09-15

- Removed 3 of the 8 Gloriosa Superba gallery photos that looked too blurry: the original `gloriossa-superba-seeds.jpg` and `gloriossa-superba-seeds-field.jpg` (the very first photos added to the site, back in v0.2.0/v0.3.0), plus one of the two new flower-cluster close-ups (`gloriosa-superba-flower-cluster-closeup-2.jpg`). Gallery is now 5 photos: field landscape, flower cluster close-up, ground-level field view, tuber, tuber drying shed.
- The removed files are only taken out of the gallery list in `script.js` — the image files themselves are left in `assets/`, untouched and still in git history, in case they're wanted again later.
- Changed each gallery slide back to filling the full frame width (`object-fit: contain` on a 100%-width slide, rather than a slide sized to the photo's own width). Landscape photos already looked right either way; portrait photos were rendering as a narrow sliver with empty space either side instead of sitting in a consistent frame like the Coconut gallery's photos do. No cropping either way — this only changes how each photo is *positioned* within its frame, not the fixed-frame removal from v1.3.0.

## [1.3.1] — 2026-09-15

- Fixed the contact form's Web3Forms submission getting stuck indefinitely (disabled button, "Sending…" shown forever) on a stalled network connection — it now times out after 15 seconds with a clear, actionable error message.
- Fixed a stale validity state on the product-interest checkboxes after a successful submission resets the form.
- Linked the product-interest checkboxes' error message via `aria-describedby` so screen reader users get it announced when focusing the group, not only at the moment it changes.
- Corrected `README.md`'s title, which had read "v1.0.0" since that release despite every version since bumping the footer and `<meta name="version">`.
- This patch was prepared by a peer review session in parallel with v1.3.2 below and merged in via fast-forward.

## [1.3.0] — 2026-09-15

- Added the final, curated photo set (8 files from `visithra-agro-photos-enhanced-v2/choosen photos/`) to the product galleries: Gloriosa Superba's gallery grew from 3 to 8 photos (flowering-field, flower-cluster, and tuber-harvest shots), Coconut's grew from 1 to 3 (two more harvest-pile shots). The oversized original tuber photo was also replaced in place with a properly resized version (2.7MB → 1.3MB, same filename, same content).
- Removed the fixed 4:3 cropped frame from the product galleries — it was called out as "just temporary." Each photo now displays at its own natural aspect ratio within a shared height, so nothing gets cropped; the gallery strip's height flexes with the viewport instead of being locked to a ratio.
- Rewrote the gallery's "which photo is showing" and prev/next logic to work with these variable-width photos (previously it assumed every photo was exactly the frame's width) — same approach the outer product-family carousel already used (position-based, not width-based).
- Rebalanced the product card so the gallery and the text detail get equal width (was gallery-light, text-heavy), giving photos more room now that they're the real, final images.

Earlier in this same release, a first pass added a smaller, differently-curated set of photos sourced directly from the original WhatsApp export before the properly enhanced/curated folder was pointed out — those were swapped out for the set described above before anything was committed.

## [1.2.0] — 2026-09-15

- Made every contact form field required: name, company, email, phone, location, message, and "Product(s) of interest" (previously company, phone, location, and product selection were optional).
- Added inline UI validation instead of relying only on the browser's default popups (the form already used `novalidate`, so previously empty required fields were not actually being blocked from submitting): each field shows its own error message beneath it, invalid/valid fields get a coloured underline via `:user-invalid`/`:user-valid` once the visitor has interacted with them, and the phone field checks a basic valid-characters pattern.
- Added custom "select at least one" validation for the product checkboxes, since native HTML `required` cannot express that for a group of same-named checkboxes.
- Submitting with any field left invalid now focuses the first problem field, shows all the relevant error messages, and shows a summary message near the submit button — no submission (email or mailto) is attempted until every field passes.
- Added a small "All fields are required." note at the top of the form and removed the now-inaccurate "(optional)" wording from the Company field's placeholder.

## [1.1.2] — 2026-09-15

- Added the business's heritage to the About Us section: family-led, based in southern India, now in its second generation (chosen over a specific decade count, since "generations" pairs naturally with "family-led" and doesn't require claiming an exact founding year).
- Added a new paragraph noting the existing track record supplying local businesses and the capacity to expand the supplier network further.
- Updated the page `<meta name="description">` to carry the same heritage framing for search/social previews.

## [1.1.1] — 2026-09-15

- Reduced the hero heading and the Contact section heading so both feel proportionate to the rest of the page instead of oversized; hero heading now sizes in line with the About/Products headings.
- Tightened vertical spacing throughout: section padding, the gap between the About text block and the principles row, and the gap between the Contact intro and the contact-details block, which was reading as cluttered.
- Shrunk the "Sourced with care ✦ supplied with confidence ✦ built for partnership" tagline band so it reads as one line on desktop/tablet instead of wrapping (still wraps gracefully on small phones).
- Updated the hero headline to "Rooted with care. Ready to trade." and refreshed copy in the hero intro, About section, and the three "principles" cards to foreground direct-from-farm sourcing, freshness, and quality.

## [1.1.0] — 2026-09-15

- Gave the hero illustration ("the image above the About Us section") the same fixed 4:3 framed-box treatment as the product galleries, instead of a panel that stretched to match the hero text's height.
- Removed per-sub-product photo galleries and their click-to-switch buttons/hyperlinks. Each main product family (Gloriosa Superba Products, Coconut Products) now has a single combined photo gallery — still a horizontal scroll with prev/next arrows when there is more than one photo.
  - Gloriosa Superba's gallery currently combines the seed and tuber photos (3 total); Coconut's currently shows the one available photo. Exact photo counts per family will change once improved photos are supplied.
- Sub-products are now listed as plain, non-interactive text (name + short description) next to each family's gallery — no images, links, or buttons attached to them anymore.
- Hardened the gallery status code against a zero-width edge case (e.g. a gallery measured before it is laid out) so one family's gallery can no longer fail silently and block the other family's from initialising.

## [1.0.1] — 2026-09-15

- Fixed a real, pre-existing bug found while previewing v1.0.0: the `[hidden]` attribute on the "Images coming soon" gallery placeholder was losing to the `.gallery-empty { display: flex; }` rule in the CSS cascade (same specificity, later source order), so the placeholder could paint on top of a sub-product's real photos instead of staying hidden. This affected every version back to v0.6.0, not just this release.
- Added a small defensive rule (`[hidden] { display: none !important; }`) near the top of `styles.css` so no future component can reintroduce the same class of bug.

## [1.0.0] — 2026-09-15

- **Redesign** (major): reworked the visual direction toward a cleaner, more spacious "single scrollable page" feel (inspired by modern product-launch pages), while keeping the existing brand, palette, content structure, and section order.
- Corrected the "Gloriossa" misspelling to the correct botanical spelling "Gloriosa" everywhere it appears in visible text, headings, and internal code identifiers (image files themselves are untouched — see below).
- Compacted the product photo galleries to a contained, fixed-aspect frame (4:3) instead of a tall full-height panel, so photos sit at a more elegant, proportionate size.
- Rebuilt the contact section with a two-column layout: business contact details (email, phone/WhatsApp, address) alongside the enquiry form, plus a multi-select "Product(s) of interest" chip picker covering all six sub-products.
- Wired the contact form to send real emails via Web3Forms (a free form-delivery service) with a graceful fallback to opening the visitor's email app until a free access key is configured. See README.md for setup.
- Fixed several accessibility and consistency issues: decorative arrow glyphs are now hidden from screen readers, focus-visible states were added to buttons and links that previously relied on browser defaults, `scroll-padding-top` now matches the actual header height at every breakpoint, and the enquiry status message now changes color for success vs. error instead of always showing as a warning.
- Added a thin scroll-progress indicator at the top of the page and lazy-loading on gallery photos for a lighter, faster mobile experience.
- Added an extra responsive breakpoint (980px) so the product cards and contact layout adapt more gracefully on tablets, not just phones.
- Initialised git version control for this project (previously tracked only via `requests/` briefs and this changelog) so any point in history can be reverted to directly.
- Product photo files are unchanged — replace them in `assets/` once corrected/higher-resolution versions are available.

## [0.6.0] — 2026-09-15

- Settled on the "Wet-Ink Gloss" finish as the final visual direction (superseding the briefly-applied Frosted Glass).
- Removed the small fixed thumbnail strip below each product gallery.
- Galleries now show all available photos for the selected sub-product as a horizontal scroll directly inside the top picture frame, with prev/next arrows appearing only when there is more than one photo.
- The photo count badge and caption now update live as you scroll through a sub-product's photos.
- The "Images coming soon" placeholder is unchanged and still shows when a sub-product has no photos yet.

## [0.5.0] — 2026-09-15

- Replaced the "Wet-Ink Gloss" finish with the approved "Frosted Glass" visual direction site-wide.
- Header, buttons, hero illustration frame, and product cards used translucent, blurred glass panels (backdrop blur, soft white borders) instead of deep colored-glow shadows.
- Buttons changed from solid dark gloss to translucent glass pills.
- Added a soft blurred gradient blob behind the hero copy for an airier, modern feel.
- Softened the footer shadow to match the lighter overall tone.

## [0.4.0] — 2026-09-15

- Applied the approved "Wet-Ink Gloss" visual direction site-wide: rounded corners on buttons, the hero illustration, product cards, gallery frames, thumbnails, and the photo-count badge.
- Deepened shadows into colored glows (forest-green and rust tones) on the header, buttons, hero art, product cards, and footer for more depth and shine.
- Added a diagonal gloss sheen overlay to the hero illustration and intensified the existing gallery sheen.
- Added a soft rust-colored glow to contact form fields on focus.

## [0.3.0] — 2026-09-15

- Reworked galleries to render only the images available for the selected sub-product.
- Removed fixed empty image slots and made photo counts update from the gallery data.
- Added the supplied second Gloriossa Superba Seeds field image to the seed gallery.
- Refined the site-wide gloss with soft agricultural green, soil, and flower-coral gradients.

## [0.2.0] — 2026-09-15

- Added a versioned request record and the project versioning process.
- Removed the address section so contact is the final content section.
- Added a restrained gloss treatment to the header, product panels, buttons, and footer.
- Reordered product families: Gloriossa Superba first, Coconut second.
- Renamed families to **Gloriossa Superba Products** and **Coconut Products**.
- Added selectable sub-product galleries with photo slots for future images.
- Added supplied Coconut with Husk and Gloriossa Superba Seeds images.
- Added an enhanced, non-destructive Gloriossa Superba Tuber image.
- Added short group descriptions and a trade-only safety note for Gloriossa Superba.

## [0.1.0] — 2026-09-14

- Initial responsive single-page website with hero, About Us, product range, contact form, address placeholder, and footer.
