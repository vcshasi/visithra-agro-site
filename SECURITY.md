# Security notes

Working notes on this site's security posture — what's in place, and what needs deciding before certain future features are added. Not a formal policy document.

## In place today

- **Content-Security-Policy, HSTS, and other response headers** — set in `_headers`, applied by Cloudflare at the edge. See `CHANGELOG.md` for what's in the policy and why.
- **No third-party CDN dependency** — fonts are self-hosted (`fonts/`), removing the one external origin (besides the contact form's own API call) that used to see every visitor's IP on every page load.
- **Contact form**: honeypot field (`botcheck`) against basic bots, `maxlength` caps on every text field against oversized scripted submissions, and a short data-use notice next to the submit button naming the third party (Web3Forms) that actually delivers the email.
- **No inline `<script>`/`<style>`** anywhere in the HTML — keeps the CSP strict (no `'unsafe-inline'` needed) and rules out a whole class of injection risk.
- **Product photos** — checked for embedded EXIF/GPS/device metadata before publishing; see `README.md`'s "Product galleries" section for the check to run on any new photo before it's added.

## ⚠️ Before adding online payment or ordering

There is no checkout or payment flow on this site today. If one is ever added:

**Always use a hosted checkout** — Razorpay, Stripe, or an equivalent provider's own hosted payment page or embedded widget that keeps card details flowing directly to the payment provider's own servers, never through this site's own code. Doing this keeps the site **out of PCI-DSS scope** entirely (PCI-DSS is the payment card industry's security standard; the scope and cost of complying with it balloons dramatically the moment a site's own code ever touches raw card data, even briefly). Handling card numbers directly on this site — via a custom form, or even just passing them through this site's own backend before forwarding to a processor — is exactly what a hosted checkout exists to avoid, and should not be attempted.

This is a placeholder reminder, not a spec — revisit and expand this section properly once a specific payment feature is actually being scoped.

## Account-level items (not fixable in this repo)

- **Web3Forms access key domain restriction** — the key in `script.js`'s `CONFIG.web3FormsKey` is meant to be public/client-side by design, but it should be restricted to this site's actual domain(s) in the Web3Forms dashboard, so it can't be lifted from the page source and reused elsewhere to relay spam through this account. **Checked (2026-09):** domain restriction is a Web3Forms **Pro-tier feature**, not available on the free plan this account is on. Options are to accept the risk at free tier (low realistic exposure for this site's traffic volume), upgrade to Pro, or switch to a form service with free-tier domain restriction. Revisit if spam submissions actually start appearing.
- **2FA/MFA on the Cloudflare and any future GitHub account** — verify this is enabled in each account's own security settings. Outside what a repository or its code can enforce.
- **HSTS preload submission** — the `_headers` file already sets the `preload` directive. A real custom domain (`visithra-agro.in`) serving HTTPS consistently is now live, so this is no longer blocked — submit at [hstspreload.org](https://hstspreload.org) when ready. **Not done automatically**: preload-list inclusion is effectively permanent (removal, if ever needed, takes months and isn't guaranteed across all browsers), so this needs a deliberate decision, not a default action taken on a routine deploy.
