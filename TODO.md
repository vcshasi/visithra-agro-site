# Upcoming TODOs

Planned work not yet started. Not a spec for any of these — just tracking that they're next, with enough context to pick each back up.

## 1. Restrict the Web3Forms key to the live domain

Already flagged as pending in `SECURITY.md` and `README.md`'s "Sending enquiries by email" section — this is a Web3Forms **dashboard** setting (web3forms.com → this form's settings → domain restriction), not a code change, so it can't be done from this repo. **Checked (2026-09): this is a Pro-tier feature, not available on the current free plan.** Options: accept the risk at free tier (revisit if spam actually appears), upgrade to Pro, or switch form services. Not urgent enough to act on unprompted — listed here so the decision doesn't get lost.

## 2. Feasibility analysis: live chat (WhatsApp integration or a chatbot)

Not scoped yet — this is a research/decide step before any implementation. Worth weighing when picked up:
- **WhatsApp "click to chat" link/widget** — `https://wa.me/<number>`, effectively free, no backend, works today with the phone number already in `CONFIG.phone`. Simplest option, but no automation — every chat is answered by a real person.
- **WhatsApp Business API** — proper integration (message templates, automation, multi-agent), but paid and meaningfully more setup (a registered WhatsApp Business Account, a BSP like Twilio/360dialog, approval process).
- **A hosted chatbot widget** (Tawk.to, Crisp, Tidio, or similar) — free tiers exist, drop-in `<script>` widget, some support basic automated replies/FAQs before handing off to a human. Would need a CSP update (`_headers`) to allow whichever provider's origin, and a privacy-notice update alongside `SECURITY.md`'s existing note, since a third party would then be handling live chat content too.

## 3. Replace the hero section's illustration with a practical photo

`.hero-art` (the "HARVESTED WITH PURPOSE" panel on the homepage) is currently a CSS-drawn illustration — stylised sun/hills/palm trees, not a real photograph. Replace it with an actual farm/product photo, in the same spirit as the product gallery photos. Needs a suitable source photo first (reuse one of the existing `assets/` photos, or a new one supplied) — check it for EXIF/GPS metadata before adding, per the standing step in `README.md`'s "Product galleries" section.
