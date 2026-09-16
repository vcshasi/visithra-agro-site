# Visithra Agro Traders website — v1.7.0

A responsive, dependency-free single-page business website. Open `index.html` in a browser to preview it.

## Site settings — `script.js`

The `CONFIG` object at the very top of `script.js` is already filled in and live:

```js
const CONFIG = {
  businessEmail: 'vcshasikumar@gmail.com',
  phone: '+91-9443311219',
  address: 'Coimbatore, Tamil Nadu, India',
  web3FormsKey: '302de0f9-3952-4527-a9cf-69b7faec6a60',
};
```

- `businessEmail`, `phone`, and `address` are shown directly in the Contact section — edit them here if any of these change.
- `web3FormsKey` enables real email delivery from the contact form (see below). If it's ever cleared back to the placeholder `'YOUR-WEB3FORMS-ACCESS-KEY'`, the form falls back to opening the visitor's own email app with the enquiry pre-filled instead.

## Sending enquiries by email

The form is wired for **[Web3Forms](https://web3forms.com)** — tested end-to-end (real submissions confirmed arriving) as of v1.6.9. It needs no backend and works identically on any static host, so no extra setup is needed on Netlify, Vercel, or elsewhere. To rotate the key or point it at a different inbox later:

1. Go to web3forms.com and enter the email address that should receive enquiries.
2. You'll be emailed a new **Access Key** — copy it.
3. Paste it into `web3FormsKey` in `script.js`, replacing the current one.

Other free options, if you'd rather switch services:

| Service | Notes |
| --- | --- |
| **[Formspree](https://formspree.io)** | 50 submissions/month free, similar setup (swap the `fetch` URL and payload shape in `script.js`). |
| **[Netlify Forms](https://www.netlify.com/products/forms/)** | Free and built-in, but only works if you host on Netlify — add `data-netlify="true"` back to the `<form>` and deploy there instead of using Web3Forms. |
| **[EmailJS](https://www.emailjs.com)** | Sends straight from your own Gmail/Outlook account client-side; more setup (service + template IDs) but no third-party inbox in the middle. |

## Hosting — Cloudflare Pages

This project is deployed on **[Cloudflare Pages](https://pages.cloudflare.com)** — free tier, no build step needed (this is plain HTML/CSS/JS), unlimited bandwidth, strong Europe/India edge coverage, and built-in DDoS/WAF protection on the free plan. A free `<project-name>.pages.dev` subdomain with automatic HTTPS is included; no separate domain purchase is required to go live.

**Deploying:**

1. Push this repo to GitHub (Cloudflare Pages deploys from a connected Git repo).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, authorize the GitHub App, and select this repo.
3. Build settings: **Framework preset: None**, **Build command:** (leave blank), **Build output directory:** `/`.
4. Deploy. Cloudflare assigns a `*.pages.dev` URL immediately.

**Versioned deploys:** every push gets its own preview URL, and the dashboard's Deployments tab lets you roll back to any previous deploy with one click — this pairs naturally with the git-tag versioning below (a tag marks a point in history; its corresponding Cloudflare deployment stays available to re-promote).

**Security headers:** the `_headers` file in this repo (Cloudflare Pages reads it automatically) sets a strict Content-Security-Policy plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS. It only allows the origins this site actually uses (Google Fonts, the Web3Forms API) — verified against a local test server before being relied on in production.

**Adding a real domain later:** truly free domains (e.g. `.tk`/`.ml`) are unreliable and can look untrustworthy for a business, so they aren't recommended. A `.com`/`.in` domain typically costs $8–15/year from a registrar such as [Porkbun](https://porkbun.com), [Namecheap](https://www.namecheap.com), or [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (at-cost pricing) — Cloudflare Pages supports adding a custom domain for free once you have one, no migration needed.

## Product galleries

Each main product family (Gloriosa Superba Products, Coconut Products) has one photo gallery. To add product photos later, edit the `productGalleries` object in `script.js`: add an object with `src`, `alt`, and `caption` to the relevant `photos` list. Every photo displays in a uniform 4:3 frame (cropped to fill, whatever its original orientation) so the gallery looks consistent regardless of source photo size, with prev/next arrows appearing automatically when more than one photo is present.

Existing image files in `assets/` are untouched by this release (including their `gloriossa-*` filenames) — only the on-page text was corrected to "Gloriosa". Replace the files directly once corrected/higher-resolution photos are available; file names can stay the same or be updated to match, just keep the `src` paths in `script.js` in sync.

## Versioning

This project follows semantic versions. Every accepted user brief is recorded in `requests/`, the matching release is described in `CHANGELOG.md`, and every release is tagged in git — see `VERSIONING.md` for how to revert to an older version.
