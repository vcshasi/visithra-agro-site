# Changelog

All notable website updates are tracked here using semantic versions. Every release is also tagged in git (`git tag`), so any version can be restored with `git checkout vX.Y.Z`.

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
