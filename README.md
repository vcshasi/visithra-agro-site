# Visithra Agro Traders website — v1.8.4

**Live at:** https://visithra-agro.in (`www.visithra-agro.in` also works)

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

The key is meant to be public/client-side (it's shipped in `script.js` by design), but should be **domain-restricted** in the Web3Forms dashboard to this site's actual URL — otherwise anyone who reads the page source could lift it and relay spam through your account. This is an account setting on Web3Forms' side, not something set from this repo — see `SECURITY.md`.

Other free options, if you'd rather switch services:

| Service | Notes |
| --- | --- |
| **[Formspree](https://formspree.io)** | 50 submissions/month free, similar setup (swap the `fetch` URL and payload shape in `script.js`). |
| **[Netlify Forms](https://www.netlify.com/products/forms/)** | Free and built-in, but only works if you host on Netlify — add `data-netlify="true"` back to the `<form>` and deploy there instead of using Web3Forms. |
| **[EmailJS](https://www.emailjs.com)** | Sends straight from your own Gmail/Outlook account client-side; more setup (service + template IDs) but no third-party inbox in the middle. |

## Hosting — Cloudflare

Deployed via the **Wrangler CLI** directly (no GitHub needed) — free tier, no build step (plain HTML/CSS/JS), unlimited bandwidth, strong Europe/India edge coverage, and built-in DDoS/WAF protection. Served on the custom domain `visithra-agro.in` (both apex and `www`) with automatic HTTPS via Cloudflare's edge; the free `*.workers.dev` subdomain that hosted the site before the domain went live has been deliberately disabled — all traffic now goes through the custom domain.

Full step-by-step procedure, including the security incident from the first deploy and how it's now prevented: **[DEPLOYMENT.md](DEPLOYMENT.md)**.

**Deploying an update**, once logged in (`npx wrangler login`, one-time):

```bash
./deploy.sh
```

`deploy.sh` runs pre-flight checks (required files present, `.assetsignore` still excluding `.git`, version consistent across `index.html`/`README.md`, Web3Forms key not a placeholder), deploys, then verifies the live site actually serves what it should — refusing to deploy if any pre-flight check fails. `--check-only` / `--verify-only` / `--skip-verify` run individual stages. The bare command underneath it is just:

```bash
npx wrangler deploy
```

That's the whole command — it reads `wrangler.jsonc` (points at this repo's root as the asset directory) and `.assetsignore` (excludes `.git`, `.claude`, and internal docs from what actually gets served — **not** the same list as `.gitignore`; the asset upload does not read `.gitignore` at all, confirmed the hard way on the first deploy).

**Versioned deploys:** `npx wrangler deployments list` / `npx wrangler versions list` show deployment history; rolling back is available from the Cloudflare dashboard (Workers & Pages → this project → Deployments).

**Security headers:** the `_headers` file in this repo is read automatically at Cloudflare's edge and sets a strict Content-Security-Policy plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and HSTS — confirmed present on the live deployment's actual response headers, not just assumed from the config.

**Custom domain:** `visithra-agro.in`, registered via GoDaddy, with GoDaddy left as registrar but nameservers pointed at Cloudflare so Cloudflare manages DNS and issues the certificate. Full setup steps, plus a real incident hit while connecting it, are in `DEPLOYMENT.md` §8. Note: `.in` is a NIXI-governed ccTLD with mandatory WHOIS contact verification — no privacy/proxy service is available for it at any registrar, unlike `.com`.

## Product galleries

Each main product family (Gloriosa Superba Products, Coconut Products) has one photo gallery. To add product photos later, edit the `productGalleries` object in `script.js`: add an object with `src`, `alt`, and `caption` to the relevant `photos` list. Every photo displays in a uniform 4:3 frame (cropped to fill, whatever its original orientation) so the gallery looks consistent regardless of source photo size, with prev/next arrows appearing automatically when more than one photo is present.

**Before adding a new photo, strip its metadata** — phone/camera photos routinely embed GPS coordinates, device model, and timestamps in EXIF data, which would otherwise ship to every site visitor. Checked and confirmed clean on all current photos (`magick identify -verbose <file> | grep -i "^  Profile"` shows nothing on any of them), but that won't be true automatically for new ones:
```bash
magick <new-photo.jpg> -strip <new-photo.jpg>
```

Existing image files in `assets/` are untouched by this release (including their `gloriossa-*` filenames) — only the on-page text was corrected to "Gloriosa". Replace the files directly once corrected/higher-resolution photos are available; file names can stay the same or be updated to match, just keep the `src` paths in `script.js` in sync.

## Security

Response headers, self-hosted fonts, form hardening, and what's still needed before any future payment feature: **[SECURITY.md](SECURITY.md)**.

## Upcoming

Planned work not yet started: **[TODO.md](TODO.md)**.

## Versioning

This project follows semantic versions. Every accepted user brief is recorded in `requests/`, the matching release is described in `CHANGELOG.md`, and every release is tagged in git — see `VERSIONING.md` for how to revert to an older version.
