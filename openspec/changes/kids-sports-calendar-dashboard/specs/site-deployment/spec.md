## ADDED Requirements

### Requirement: Free-tier static hosting
The site SHALL be deployable to a free static-hosting tier with no paid add-ons. The default target is GitHub Pages; Cloudflare Pages and Netlify are supported drop-in alternatives because the build output is plain static files.

#### Scenario: Default target
- **WHEN** the repository is set up following the project README
- **THEN** `git push` to the default branch results in a publicly reachable URL on GitHub Pages at no cost

#### Scenario: Alternative target
- **WHEN** the owner chooses Cloudflare Pages or Netlify instead
- **THEN** no source-code changes are required; only the deploy step in CI or the host's build config changes

### Requirement: Simple, single-command local build
A fresh clone SHALL build and run locally with a documented pair of commands (install + dev, and install + build), with no global tooling beyond Node.js and a supported package manager.

#### Scenario: Local dev
- **WHEN** a new clone runs the documented install + dev commands
- **THEN** a local dev server starts and renders the dashboard against sample or live config data

#### Scenario: Local production build
- **WHEN** a new clone runs the documented install + build commands
- **THEN** the build produces a self-contained static bundle under a documented output directory (e.g. `dist/`)

### Requirement: Deploy via GitHub Actions on push and on cron
CI SHALL run the full pipeline — install, fetch feeds, parse, build static site, deploy — on every push to the default branch, on a scheduled cron (every 3 hours), and on manual workflow dispatch.

#### Scenario: Push deploy
- **WHEN** a commit lands on the default branch
- **THEN** the workflow runs and the live site reflects the new commit on success

#### Scenario: Scheduled refresh
- **WHEN** the cron trigger fires
- **THEN** the workflow re-fetches feeds and redeploys the site with updated event data

#### Scenario: Failed deploy leaves prior site live
- **WHEN** the workflow fails (e.g. all feeds down, build error)
- **THEN** the previously deployed site remains live and unchanged

### Requirement: No runtime backend and no secrets at runtime
The deployed site SHALL consist solely of static assets. No serverless function, database, or always-on service is required to serve the page. Calendar URLs live in `config.yaml` and are not injected at serve time.

#### Scenario: Static-only deploy
- **WHEN** the build output is inspected
- **THEN** it contains only HTML, CSS, JS, JSON, and static assets — no server code, no environment-dependent runtime config

### Requirement: Owner-editable config updates via a single commit
Updating kids, calendar URLs, or season-end dates SHALL require only editing `config.yaml` and pushing; no additional manual steps (no rebuilding a backend, rotating a secret, or touching host settings).

#### Scenario: Updating a season-end date
- **WHEN** the owner edits `seasonEndDate` for a kid and pushes
- **THEN** the workflow redeploys and the dashboard reflects the new window on the next page load
