# Visithra Agro Traders website — v1.6.9

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

## Hosting for free, with your own domain

Any static host works — this site is plain HTML/CSS/JS with no build step. Recommended free options:

1. **[Cloudflare Pages](https://pages.cloudflare.com)** — generous free tier, fast global CDN, free `yoursite.pages.dev` subdomain, and straightforward custom-domain support. Good default choice.
2. **[GitHub Pages](https://pages.github.com)** — free, simple, works well if the code already lives in a GitHub repo (this project is now a git repo — see `VERSIONING.md`).
3. **[Netlify](https://www.netlify.com)** — also free, and adds built-in form handling as an alternative to Web3Forms (see table above).

**Getting a real domain name:** truly free domains (e.g. `.tk`/`.ml`) are unreliable and can look untrustworthy for a business, so they aren't recommended. A `.com`/`.in` domain typically costs $8–15/year from a registrar such as [Porkbun](https://porkbun.com), [Namecheap](https://www.namecheap.com), or [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (at-cost pricing). Point its DNS at whichever free host you choose above — all three support custom domains on their free tiers. If you want to stay at zero cost for now, use the free subdomain the host gives you (e.g. `visithra-agro.pages.dev`) and add a custom domain later.

## Product galleries

Each main product family (Gloriosa Superba Products, Coconut Products) has one photo gallery. To add product photos later, edit the `productGalleries` object in `script.js`: add an object with `src`, `alt`, and `caption` to the relevant `photos` list. Every photo displays in a uniform 4:3 frame (cropped to fill, whatever its original orientation) so the gallery looks consistent regardless of source photo size, with prev/next arrows appearing automatically when more than one photo is present.

Existing image files in `assets/` are untouched by this release (including their `gloriossa-*` filenames) — only the on-page text was corrected to "Gloriosa". Replace the files directly once corrected/higher-resolution photos are available; file names can stay the same or be updated to match, just keep the `src` paths in `script.js` in sync.

## Versioning

This project follows semantic versions. Every accepted user brief is recorded in `requests/`, the matching release is described in `CHANGELOG.md`, and every release is tagged in git — see `VERSIONING.md` for how to revert to an older version.
