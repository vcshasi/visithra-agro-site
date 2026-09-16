#!/usr/bin/env bash
#
# Build + deploy this site to Cloudflare, then verify the deployment actually worked.
#
#   ./deploy.sh                 pre-flight checks -> deploy -> verify   (the normal path)
#   ./deploy.sh --check-only    pre-flight checks only, no deploy
#   ./deploy.sh --verify-only   verify the already-live site, no deploy
#   ./deploy.sh --skip-verify   deploy without the post-deploy verification
#
# Runs the same steps DEPLOYMENT.md documents by hand. Safe to run manually (Git Bash on
# Windows, or any bash) and from a Claude Code session: it never prompts, never needs a TTY,
# and reports failure through its exit code.
#
#   0  all good        2  deploy failed
#   1  pre-flight failed   3  post-deploy verification failed
#
# NOT part of the site — `.assetsignore` keeps this file out of what gets uploaded.

set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")" || exit 1

SITE_URL="https://www.visithra-agro.workers.dev"
problems=0

say()  { printf '%s\n' "$*"; }
ok()   { printf '  ok    %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; problems=$((problems + 1)); }
warn() { printf '  warn  %s\n' "$*"; }

# Node ships wrangler via npx. A fresh shell (or agent session) may not have it on PATH yet
# even when it is installed, so fall back to the default Windows install location.
ensure_node() {
  if ! command -v npx >/dev/null 2>&1; then
    export PATH="$PATH:/c/Program Files/nodejs"
  fi
  command -v npx >/dev/null 2>&1
}

# ---------------------------------------------------------------- pre-flight (the "build")
# There is no compile/bundle step — this project ships its source as-is. "Building" here means
# confirming the directory is actually in a publishable state, which is what these checks do.
preflight() {
  say "Pre-flight checks"

  for f in index.html styles.css script.js _headers .assetsignore wrangler.jsonc; do
    [ -f "$f" ] && ok "$f present" || bad "$f is MISSING"
  done

  # The one that caused a real incident: wrangler's asset upload ignores .gitignore entirely,
  # so without these entries the whole .git directory gets published. See DEPLOYMENT.md §4.
  for entry in .git .claude; do
    grep -qx -- "$entry" .assetsignore \
      && ok ".assetsignore excludes $entry" \
      || bad ".assetsignore is missing '$entry' — .git/internals would be published"
  done

  # Version has to agree in all three places or the live footer will lie about what's deployed.
  meta_v=$(grep -o 'name="version" content="[^"]*"' index.html | sed 's/.*content="//; s/"//')
  foot_v=$(grep -o 'class="site-version">v[^<]*<' index.html | sed 's/.*>v//; s/<//')
  read_v=$(head -1 README.md | grep -o 'v[0-9][0-9.]*' | sed 's/^v//')
  if [ -n "$meta_v" ] && [ "$meta_v" = "$foot_v" ] && [ "$meta_v" = "$read_v" ]; then
    ok "version $meta_v consistent (meta, footer, README)"
  else
    bad "version mismatch — meta='$meta_v' footer='$foot_v' README='$read_v'"
  fi

  # Match the CONFIG assignment specifically — the placeholder string also appears further
  # down in script.js as the legitimate "is it configured yet?" comparison.
  grep -q "web3FormsKey: *'YOUR-WEB3FORMS-ACCESS-KEY'" script.js \
    && bad "script.js still has the placeholder Web3Forms key — the form would not deliver" \
    || ok "Web3Forms key is set"

  ensure_node && ok "npx available ($(node --version 2>/dev/null))" \
              || bad "node/npx not found — install Node.js (see DEPLOYMENT.md §1)"

  [ "$problems" -eq 0 ]
}

# ------------------------------------------------------------------------------- deploy
deploy() {
  say ""
  say "Deploying"
  npx wrangler deploy || return 1
}

# ------------------------------------------------------------------- post-deploy verify
# Never trust the deploy command's own "Success!" — check what the site actually serves.
verify() {
  say ""
  say "Verifying $SITE_URL"

  local code
  code=$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' "$SITE_URL/")
  if [ "$code" = "000" ]; then
    warn "cannot reach the site from here — DNS may not have propagated to this machine yet"
    warn "the deploy itself succeeded; re-run './deploy.sh --verify-only' in a few minutes"
    return 1
  fi

  # The site itself must be served.
  for path in / /styles.css /script.js; do
    code=$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' "$SITE_URL$path")
    [ "$code" = "200" ] && ok "$path -> 200" || bad "$path -> $code (expected 200)"
  done

  # Nothing internal may be served.
  for path in /.git/config /README.md /CHANGELOG.md /DEPLOYMENT.md /SECURITY.md /TODO.md; do
    code=$(curl -s --max-time 20 -o /dev/null -w '%{http_code}' "$SITE_URL$path")
    [ "$code" = "404" ] && ok "$path -> 404" || bad "$path -> $code (expected 404 — it is PUBLIC)"
  done

  # Security headers must actually arrive, not merely exist in _headers.
  local headers
  headers=$(curl -s --max-time 20 -D - -o /dev/null "$SITE_URL/")
  for h in content-security-policy strict-transport-security x-frame-options x-content-type-options; do
    printf '%s' "$headers" | grep -qi "^$h:" && ok "header $h" || bad "header $h missing"
  done

  # What is live should be the version sitting in this working directory.
  local live_v local_v
  live_v=$(curl -s --max-time 20 "$SITE_URL/" | grep -o 'name="version" content="[^"]*"' | sed 's/.*content="//; s/"//')
  local_v=$(grep -o 'name="version" content="[^"]*"' index.html | sed 's/.*content="//; s/"//')
  [ -n "$live_v" ] && [ "$live_v" = "$local_v" ] \
    && ok "live version $live_v matches local" \
    || bad "live version '$live_v' != local '$local_v'"

  [ "$problems" -eq 0 ]
}

# --------------------------------------------------------------------------------- main
case "${1:-}" in
  --check-only)
    preflight || { say ""; say "Pre-flight FAILED ($problems problem(s))."; exit 1; }
    say ""; say "Pre-flight passed. Not deploying (--check-only)."
    ;;
  --verify-only)
    ensure_node >/dev/null 2>&1
    verify || { say ""; say "Verification FAILED."; exit 3; }
    say ""; say "Verified. $SITE_URL is serving the expected content."
    ;;
  --skip-verify)
    preflight || { say ""; say "Pre-flight FAILED ($problems problem(s)). Not deploying."; exit 1; }
    deploy || { say ""; say "Deploy FAILED."; exit 2; }
    say ""; say "Deployed (verification skipped)."
    ;;
  ""|--deploy)
    preflight || { say ""; say "Pre-flight FAILED ($problems problem(s)). Not deploying."; exit 1; }
    deploy || { say ""; say "Deploy FAILED."; exit 2; }
    problems=0
    verify || { say ""; say "Deployed, but verification FAILED — check the output above."; exit 3; }
    say ""; say "Done. $SITE_URL is live and verified."
    ;;
  *)
    sed -n '3,20p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit 1
    ;;
esac
