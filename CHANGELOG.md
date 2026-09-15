# Changelog

All notable website updates are tracked here using semantic versions. Every release is also tagged in git (`git tag`), so any version can be restored with `git checkout vX.Y.Z`.

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
