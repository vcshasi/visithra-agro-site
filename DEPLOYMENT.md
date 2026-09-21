# Manual Deployment Procedure

How to deploy this site to Cloudflare by hand, from a terminal, with no GitHub and no CI/CD. This is the exact procedure used to put the site live — follow it in order, and don't skip the verification step at the end. It exists because skipping it once already caused a real incident (see below).

> **Shortcut:** `./deploy.sh` runs §2, §3 and §5 of this document in one go — pre-flight checks, deploy, then post-deploy verification — and refuses to deploy if any pre-flight check fails. It's a wrapper around this procedure, not a replacement for it: the steps below are what it automates, and remain the reference if the script needs changing or something goes wrong. Run `./deploy.sh --check-only`, `--verify-only`, or `--skip-verify` to run stages individually.

## 1. One-time machine setup

Only needed the first time you deploy from a given computer.

1. **Install Node.js** (provides `npx`, which runs Wrangler without a separate global install):
   ```bash
   winget install --id OpenJS.NodeJS.LTS -e
   ```
   Open a **new** terminal afterwards — `PATH` is only picked up by new sessions, not ones already open.
2. **Confirm it worked:**
   ```bash
   node --version
   npm --version
   ```
3. **Log in to Cloudflare:**
   ```bash
   npx wrangler login
   ```
   This opens a browser window. Log in to (or create) your Cloudflare account and click **Allow**. Wrangler stores the resulting token locally (`~/.wrangler/config/default.toml` equivalent) — you won't need to log in again on this machine unless the token is revoked.
4. **Confirm you're authenticated as the right account:**
   ```bash
   npx wrangler whoami
   ```

## 2. "Building" the artifact

This project has **no build step**. It's plain HTML/CSS/JS with no framework, bundler, or compiler — the repository's working directory *is* the deployable artifact. "Building" here just means making sure that directory is actually in a correct, ready-to-ship state:

- [ ] `index.html` — version bumped in both `<meta name="version">` and the footer `.site-version` span
- [ ] `README.md` — title line version bumped
- [ ] `CHANGELOG.md` — new entry added at the top describing this release
- [ ] `requests/vX.Y.Z-brief.md` — written for this release
- [ ] `script.js`'s `CONFIG` object — correct live values (business email, phone, address, Web3Forms key), not placeholders
- [ ] `.assetsignore` present and current (see §4 — this is the one that matters most)
- [ ] `_headers` present and correct (security headers — see `CHANGELOG.md` v1.7.0 for what it contains and why)

There is nothing to `npm install`, nothing to compile, no `dist/` folder to generate. If any tooling is ever added later that *does* need a build step, this section needs updating before it's trustworthy again.

## 3. Deploying

From the project root:

```bash
npx wrangler deploy
```

That's it — one command. It reads `wrangler.jsonc` (points Wrangler at this directory as the asset source) and `.assetsignore` (controls what actually gets uploaded — see §4), then uploads and publishes. The output prints the live URL and a Version ID; note both somewhere (e.g. in your commit message or the changelog entry) so you know which deploy corresponds to which release.

**First deploy on a brand new Cloudflare project only:** the project has to exist before `wrangler deploy` will target it —
```bash
npx wrangler pages project create <project-name> --production-branch=master
```
This is a one-time step per project, already done for this site (`visithra-agro-site`). Every deploy after that is just `wrangler deploy`.

## 4. ⚠️ The `.gitignore` incident — read this before touching `.assetsignore`

**What happened:** the very first deploy of this site uploaded the entire `.git` directory — full commit history, objects, refs, hooks — plus a stale `.claude` scratch folder, both publicly reachable at the live URL. Both were listed in `.gitignore`. Neither was supposed to be there.

**Root cause:** Wrangler's static-asset upload (the `assets` mechanism used by `wrangler deploy` / Cloudflare's Workers-with-static-assets, which is what Cloudflare Pages now runs on) **does not read `.gitignore` at all.** `.gitignore` only controls what `git` tracks — it has no effect on what Wrangler decides to upload as a site asset. These are two completely separate ignore mechanisms that happen to use the same file syntax, and it is easy to wrongly assume one implies the other.

**The fix:** a **separate** file, `.assetsignore`, placed in the project root (same directory as `wrangler.jsonc`). Wrangler's asset uploader *does* read this one. It uses the same gitignore-style pattern syntax, but it is a distinct file that must be maintained separately and kept in sync with `.gitignore` by hand — adding something to `.gitignore` does **not** automatically add it to `.assetsignore`.

Current contents (keep this file and this list in sync if either changes):

```
.git
.claude
.wrangler
node_modules
wrangler.jsonc
.gitignore
.assetsignore
.dev.vars*
.env*
README.md
CHANGELOG.md
VERSIONING.md
requests/
```

**The rule going forward:** any time a new file or folder is added to this repo that should never be publicly served — secrets, internal docs, tooling config, anything version-control-internal — it must be added to **both** `.gitignore` and `.assetsignore`, as two separate edits. Adding it to only one is exactly how the incident happened.

**How the incident was actually caught and fixed** (do this every time, not just when something feels wrong):
1. The first deploy's own console output was read line by line rather than trusting the "✨ Success!" summary — it listed every uploaded file, and `.git/...` paths were visible in that list.
2. `.assetsignore` was created with the exclusions above.
3. `wrangler deploy` was re-run immediately.
4. The fix was verified **by directly requesting the previously-exposed paths from the live URL**, not by assuming the redeploy fixed it:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/.git/config
   curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/.git/FETCH_HEAD
   curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/README.md
   ```
   All three must return `404`. If any comes back `200`, the deploy is **not** done — `.assetsignore` is missing something, fix it and redeploy before moving on.
5. Deployment history (`npx wrangler deployments list`) was checked to confirm the corrected version, not the exposed one, is the one actually receiving live traffic.

## 5. Post-deploy verification checklist

Run this after **every** deploy, no exceptions — this is what step 4 above should have been done the first time, and wasn't, until it caused a real problem.

```bash
# The real site loads:
curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/            # expect 200
curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/styles.css  # expect 200
curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/script.js   # expect 200

# Nothing that shouldn't be public is public:
curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/.git/config   # expect 404
curl -s -o /dev/null -w "%{http_code}\n" https://<your-site>.workers.dev/README.md     # expect 404

# Security headers are actually being served (not just present in the _headers file):
curl -sD - -o /dev/null https://<your-site>.workers.dev/ | grep -i "content-security-policy\|strict-transport"
```

Then, in an actual browser:
- Load the live URL, open the console, confirm no errors
- Submit a real test entry through the contact form (clearly mark it as a test in the message), confirm the success message shows, and confirm the email actually arrives

Do not consider a deploy finished until all of the above pass.

## 6. Rolling back

```bash
npx wrangler deployments list   # deployment history
npx wrangler versions list      # version IDs
```

Rollback itself is done from the Cloudflare dashboard: **Workers & Pages → (this project) → Deployments → select an earlier version → Rollback**. There's no rollback subcommand in this Wrangler version for this deploy path — use the dashboard.

## 7. Renaming the project or the `*.workers.dev` URL

The live URL is `<project-name>.<account-subdomain>.workers.dev` — two independent pieces, changed two different ways:

**Changing the project name** (the first segment): there is no in-place rename. Workers are identified by name, so changing it creates a **new, separate** worker rather than renaming the existing one:
1. Edit `"name"` in `wrangler.jsonc`.
2. `npx wrangler deploy` — this deploys the *new* name as its own worker, live immediately.
3. Run the full verification checklist from §5 against the new name before doing anything else.
4. Only once that's confirmed working, delete the old one so it doesn't linger as an unused duplicate: `npx wrangler delete <old-project-name> --force`.
5. Update the "Live at" URL in `README.md`.

**Changing the account's `workers.dev` subdomain** (the second segment): this is account-wide (affects every Worker on the account, not just this one) and is **dashboard-only** — Wrangler has no CLI command for it (confirmed: `wrangler --help` has no `subdomain` entry). Go to `https://dash.cloudflare.com/<account-id>/workers/subdomain`, signed in as the account owner. No redeploy is needed afterward — the new subdomain applies immediately to all existing workers' URLs, including any that were renamed before the subdomain change.

## 8. Connecting a custom domain (done for `visithra-agro.in`)

This is the procedure actually used to move the live site from `*.workers.dev` onto `visithra-agro.in`, registered separately at GoDaddy.

1. **Add the domain to Cloudflare:** dashboard → **Add a domain** → enter the domain → Free plan → Cloudflare scans existing DNS records → it hands back two nameservers unique to your account (e.g. `xxxx.ns.cloudflare.com`, `yyyy.ns.cloudflare.com`).
2. **Point the registrar's nameservers at Cloudflare:** at GoDaddy, Domain → DNS → Nameservers → "I'll use my own nameservers" → enter the two from step 1, replacing GoDaddy's defaults. Registrar stays GoDaddy; only DNS authority moves to Cloudflare. Wait for the zone to show **Active** in Cloudflare (usually 10–30 min).
3. **Attach the domain to the Worker:** Workers & Pages → the worker → Settings → Domains & Routes → Add → Custom Domain → enter the domain. Repeat for the `www` subdomain as a second Custom Domain on the same worker, so both work without a separate redirect rule.
4. **Verify** with the checklist in §5, run against the new domain(s) — do not stop at the dashboard showing "Active"; request the actual pages and headers.

### ⚠️ Two incidents hit while doing this — read before repeating

**Nameserver typo silently rejected as "update failed."** When entering the two Cloudflare nameservers at the registrar, a one-character typo (`cloudfare.com` instead of `cloudflare.com`) produced a generic "Your attempt to update nameservers has failed" error with no indication of *what* was wrong. The registrar's own per-field message ("this nameserver isn't registered") was the actual clue. **Lesson:** when a nameserver update is rejected, re-read each entered value character-by-character against what Cloudflare's dashboard actually displays, rather than assuming the failure is environmental.

**Adding the apex as a Custom Domain failed with "already has externally managed DNS records."** The domain had just been registered, and the registrar (GoDaddy) had auto-provisioned a placeholder "Website Builder" site for it, wiring the apex via leftover `A` records (parking-page IPs) plus a `_domainconnect` CNAME (GoDaddy's own DNS auto-configuration protocol) that Cloudflare's initial zone scan (step 1 above) imported as real records. These blocked Cloudflare's Custom Domain feature from claiming the apex name, and — more subtly — **DNS for the apex kept resolving to a genuine Cloudflare IP range even after nameservers were correctly switched, but served GoDaddy's Website Builder placeholder content, not this site**, because GoDaddy's Website Builder product is itself fronted by Cloudflare (a different zone/config, not this one), so a "Cloudflare IP" alone did not prove "our Worker." **Fix:** in the zone's DNS → Records, delete the leftover `A` records for the apex and the `_domainconnect` CNAME (and any stray `www` CNAME pointing to the apex), then retry adding the Custom Domain. **Lesson, consistent with §4's:** a `200` status code and a "Cloudflare"-looking IP address are not proof the *right* thing is being served — fetch the actual response body and check it's genuinely this site's HTML (e.g. `grep` for a string unique to this site, and confirm the CSP header is this repo's own policy, not some other CSP), not just that *a* page loaded.

## 9. Reference

| File | Purpose |
|---|---|
| `wrangler.jsonc` | Tells Wrangler this is a static-assets project and where the asset directory is (`.`, the repo root) |
| `.assetsignore` | Controls what gets **uploaded to Cloudflare** — separate from `.gitignore`, see §4 |
| `.gitignore` | Controls what gets **committed to git** — does not affect deployment at all |
| `_headers` | Security response headers, applied automatically at Cloudflare's edge (see `CHANGELOG.md` v1.7.0) |
