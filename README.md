# Visithra Agro Traders website — v0.6.0

A responsive, dependency-free single-page business website. Open `index.html` in a browser to preview it.

## Publish for free

The simplest option is Netlify: drag this folder into [Netlify Drop](https://app.netlify.com/drop). The contact form is already marked up for Netlify Forms. In the Netlify dashboard, enable form notifications and set the business email address there.

It also deploys cleanly to GitHub Pages or Cloudflare Pages. On those hosts, connect the form to a service such as FormSubmit, Formspree, or a small serverless endpoint before publishing.

## Product galleries

Each product sub-category has a photo gallery. To add product photos later, edit the `productGalleries` object in `script.js`: add an object with `src`, `alt`, and `caption` to the relevant `photos` list. The gallery renders only the images available for that sub-product, directly in the picture frame as a horizontal scroll, with prev/next arrows appearing automatically when more than one photo is present.

## Before launch

1. Replace the intentionally obvious `YOUR-BUSINESS-EMAIL@example.com` placeholder in `script.js` for local email-draft testing.
2. Replace the illustrated product areas with your real product images when available.
3. Update the copyright name if the registered business spelling differs.

## Versioning

This project follows semantic versions. Every accepted user brief is recorded in `requests/`, and the matching release is described in `CHANGELOG.md`. Keep these files updated whenever the website changes.
