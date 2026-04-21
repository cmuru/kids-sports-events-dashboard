## Context

The audience for the dashboard is the user's parents (grandparents of the kids). They are explicitly non-technical: they will not install a calendar app, subscribe to webcal feeds, configure a Google Calendar, or manage accounts. The viable interaction is: receive a single URL from their child, bookmark it, open it, see what's coming up. The owner (the user, a technical parent) is willing to edit a config file and push a commit to change settings.

Each child has a single webcal subscription URL produced by their sports league's scheduling tool. These ICS feeds are typically hosted on domains that do not send permissive CORS headers, so a browser cannot reliably fetch them directly. At the same time, the user wants to stay on free hosting with no backend, so any server-side work must happen at build/refresh time in CI, not at request time.

Season-end dates differ per child (different sports, different leagues, different end dates), and the dashboard must hide anything past a child's own end date.

## Goals / Non-Goals

**Goals:**
- Grandparent-friendly: single URL, no login, no setup, large readable layout, works on phone and desktop.
- Per-child view with events up to a per-child season-end date.
- Free hosting end-to-end, including scheduled data refresh.
- Deploy is a single `git push`; data refresh is automatic on a cron.
- Owner updates kids / feeds / season-end dates in one config file committed to the repo.
- Resilient to a feed being temporarily unreachable (dashboard still renders stale-but-last-known data).

**Non-Goals:**
- Authentication or access control (an unguessable URL is acceptable; feeds are already shared with family).
- In-browser editing of kids or end-of-season dates.
- Two-way calendar sync, RSVPs, notifications, or reminders.
- Support for multiple feeds per child, recurring-event edge cases beyond what `ical.js` handles out of the box, or timezones other than the user's local timezone.
- Native app or PWA installability in v1.

## Decisions

### 1. Hosting: GitHub Pages (default), with Cloudflare Pages as a drop-in alternative
- **Why:** GitHub Pages is free, has no separate account setup beyond the repo itself, and deploys automatically from a GitHub Actions workflow. The user is already using GitHub.
- **Alternatives considered:**
  - *Cloudflare Pages / Netlify / Vercel:* all viable free tiers; require a separate account link. Kept as documented fallback but not the default.
  - *Self-hosted / VPS:* violates "free only" and "simple deploy" constraints.

### 2. Data pipeline: GitHub Actions cron → static JSON committed (or deployed as artifact) → static site reads JSON
- **Why:** Avoids CORS entirely; no runtime backend; keeps hosting free. The build step fetches each webcal feed server-side, parses with `ical.js`, filters by each child's season-end date, and emits `public/data/events.json`. The static site just fetches this JSON at page load.
- **Refresh cadence:** cron every 1 hour (well within GitHub Actions free minutes). Also runs on push to `main` so config edits take effect immediately.
- **Alternatives considered:**
  - *Client-side fetch of ICS with a public CORS proxy:* adds a third-party dependency the user can't control, and public proxies are unreliable / rate-limited.
  - *Serverless function (Vercel / Cloudflare Worker) fetching on request:* more moving parts, more accounts, and cold-start latency for grandparents on slow connections.
  - *Commit JSON back to the repo vs. publish as a Pages artifact:* publishing as part of the Pages deploy artifact is cleaner (no noisy data commits). Decision: build JSON in the same workflow that deploys the site, so `events.json` ships as a static asset alongside `index.html`.

### 3. Stack: minimal static site (Vite + TypeScript, vanilla DOM or a very small framework)
- **Why:** The UI is one page with a list per child. A heavy SPA framework is overkill. Vite gives fast dev + a clean static build; TypeScript catches config/shape bugs. No client-side routing, no state management library.
- **Alternatives considered:**
  - *Plain `index.html` with a `<script>` tag:* even simpler, but TS + bundler pays for itself once we have ICS types and date formatting.
  - *Next.js / Astro / SvelteKit:* unnecessary surface area for a single static page.

### 4. Config format: single `config.yaml` at the repo root
- **Why:** YAML is the most forgiving format for the owner to edit by hand (comments, trailing commas not an issue, dates readable). One file means one place to look.
- **Schema (validated at build time):**
  ```yaml
  kids:
    - name: "Alex"
      calendarUrl: "webcal://example.com/alex.ics"
      seasonEndDate: "2026-06-15"   # inclusive, local date
    - name: "Sam"
      calendarUrl: "https://example.com/sam.ics"
      seasonEndDate: "2026-05-30"
  timezone: "America/Toronto"       # optional; defaults to system tz at build time
  ```
- **URL normalization:** `webcal://…` is rewritten to `https://…` before fetching.
- **Validation:** build fails loudly if a kid entry is missing any field, if a date isn't ISO-8601, or if a URL doesn't parse.

### 5. UI: one page, grouped by child, chronological, today-anchored
- **Layout:** A column (or stacked card) per child with the child's name as a big heading, followed by their upcoming events. Each event shows: day of week + date in plain language ("Saturday, May 3"), start time, title, and location when present. Past events (before "now") and events after that child's `seasonEndDate` are hidden. If a child has no remaining events, show a clear "No more events this season" message instead of an empty column.
- **Responsive:** single column on mobile, side-by-side columns on wider screens. Large, high-contrast typography.
- **No interactivity beyond reading:** no filters, no toggles, no search. The dashboard auto-fetches fresh JSON on each page load.

### 6. Resilience
- Each feed is fetched independently; a failure for one child does not fail the build. The previous successful `events.json` is reused for any failing feed where possible (implemented by the build job reading the currently-published `events.json` as a fallback per-child). If every fetch fails, the deploy is skipped and the previously deployed site stays up.
- The page shows a small "Last updated: <timestamp>" so a stale feed is visible (not silent).

## Risks / Trade-offs

- **Feed provider changes URL or format** → Mitigation: build fails loudly with a clear error; owner updates `config.yaml`. Per-child isolation means one broken feed doesn't take down the whole dashboard.
- **Public URL is technically discoverable** → Mitigation: unguessable GitHub Pages subpath is sufficient for this family-only use case; documented in README that this is not a privacy boundary. If ever needed, can add Cloudflare Access / basic-auth via Cloudflare Pages later without changing the app.
- **GitHub Actions cron can drift / occasionally skip** → Mitigation: 1h cadence means even a skipped run still refreshes within 2h; owner can trigger "Run workflow" manually from the Actions tab.
- **Timezone subtleties around all-day events and DST** → Mitigation: rely on `ical.js` for timezone handling, pin a configured timezone in `config.yaml`, and include explicit tests for all-day and DST-boundary events.
- **ICS feed auth tokens in URL could leak via repo history** → Mitigation: `config.yaml` is committed; the user confirms these are non-sensitive share links. If that changes, move URLs to GitHub Actions secrets and read them at build time. Documented in README.
- **Over-engineering risk** → Mitigation: no framework beyond Vite, no database, no server, no auth. Anything not in scope for v1 is explicitly a non-goal.

## Migration Plan

N/A — greenfield project. Initial rollout:
1. Scaffold repo (Vite + TS, config, build script, CI workflow).
2. Add real `config.yaml` with each kid.
3. Enable GitHub Pages on the repo and point it at the Actions deploy.
4. Share the published URL with grandparents; have them bookmark it on phone and desktop.

Rollback: revert the offending commit on `main`; next workflow run redeploys the prior version. If GitHub Pages itself is the problem, swap the deploy step to Cloudflare Pages — no source changes needed since the output is plain static files.

## Open Questions

- **Number of kids and typical event volume?** Affects layout density decisions, but the design handles 1–N kids generically.
- **Any existing preference between GitHub Pages and Cloudflare Pages?** Default chosen is GitHub Pages for minimum account overhead; can flip at deploy-config time without code changes.
