## 1. Project scaffold

- [x] 1.1 Initialize a Vite + TypeScript static-site project at the repo root (no framework required beyond vanilla DOM)
- [x] 1.2 Add `package.json` scripts: `dev`, `build`, `build:data`, `build:site`, `typecheck`, `test`
- [x] 1.3 Add `.nvmrc` / `engines` for a current LTS Node version
- [x] 1.4 Add `.gitignore` (node_modules, dist, local env files)
- [x] 1.5 Commit an empty `public/data/events.json` placeholder so first local `dev` runs without the build:data step

## 2. Config loading and validation

- [x] 2.1 Create sample `config.yaml` at repo root with 1–2 placeholder kids and comments explaining each field
- [x] 2.2 Add `yaml` parser dependency and a `src/build/loadConfig.ts` that reads and parses `config.yaml`
- [x] 2.3 Validate required fields per kid (`name`, `calendarUrl`, `seasonEndDate`) with actionable error messages naming the offending kid and field
- [x] 2.4 Validate `seasonEndDate` is `YYYY-MM-DD` and `calendarUrl` is a parseable URL
- [x] 2.5 Normalize `webcal://` to `https://` in the returned config (do not mutate the file)
- [x] 2.6 Resolve effective timezone: use `config.timezone` if set and valid, else host timezone at build time; fail on invalid IANA value

## 3. Feed fetch + ICS parsing

- [x] 3.1 Add `ical.js` (or equivalent) dependency
- [x] 3.2 Implement `src/build/fetchFeed.ts` that performs an HTTPS GET of a normalized URL with a sensible timeout and a descriptive User-Agent
- [x] 3.3 Implement `src/build/parseIcs.ts` that converts a raw ICS string into an array of normalized event objects (`kidName`, `title`, `start`, `end`, `allDay`, `location`)
- [x] 3.4 Handle all-day events (DATE vs DATETIME) and preserve timezone per the configured zone
- [x] 3.5 Unit tests: timed event, all-day event, event with no LOCATION, event with exotic but valid TZID, and a malformed feed (expect a clear thrown error)

## 4. Filtering, resilience, and output

- [x] 4.1 Implement `src/build/filterEvents.ts` that keeps only events whose start is `>= now` and `<= seasonEndDate` (inclusive) in the configured timezone
- [x] 4.2 Implement `src/build/run.ts` that orchestrates: load config → fetch + parse each feed in parallel → filter → assemble `events.json`
- [x] 4.3 Per-child resilience: on fetch/parse error, reuse that child's events from the previously published `events.json` (if reachable via a documented URL), else emit `events: []` with `fetchStatus: "error"`
- [x] 4.4 All-feeds-fail guard: if every child errored AND no prior data is available, exit with a non-zero status so the deploy step is skipped
- [x] 4.5 Write `public/data/events.json` with `generatedAt`, `timezone`, and per-child `{ name, seasonEndDate, events, fetchStatus }`
- [x] 4.6 Unit tests for filter edges: event exactly on `seasonEndDate`, event one minute past midnight after `seasonEndDate`, past event just before now

## 5. Frontend dashboard

- [x] 5.1 Create `index.html` with accessible semantic structure (one `<main>`, per-child `<section>` with an `<h2>` name)
- [x] 5.2 Implement `src/main.ts` to fetch `data/events.json` on load and render each child's section
- [x] 5.3 Format dates as "Saturday, May 3" and times in 12-hour with am/pm; render "All day" for all-day events
- [x] 5.4 Omit the location line entirely when `location` is null/empty
- [x] 5.5 Empty-state message per child: "No more events this season" when `events` is empty
- [x] 5.6 Render a site-wide "Updated …" line using `generatedAt`
- [x] 5.7 Render a per-child stale-data notice when `fetchStatus === "error"`
- [x] 5.8 Render a friendly error message if `events.json` itself cannot be fetched at runtime
- [x] 5.9 CSS: mobile-first, high-contrast, large type; stacked columns under 640px, side-by-side at ≥1024px; no horizontal scroll on narrow viewports
- [x] 5.10 Verify no `<input>`, `<button>`, or `<select>` elements are present (static reading surface only)

## 6. CI / deploy

- [x] 6.1 Add `.github/workflows/deploy.yml` with triggers: `push` to default branch, `schedule: cron '0 * * * *'`, and `workflow_dispatch`
- [x] 6.2 Workflow steps: checkout → setup Node (from `.nvmrc`) → install → `build:data` → `build:site` → upload Pages artifact → deploy
- [x] 6.3 Grant the workflow the minimum `pages: write` + `id-token: write` permissions needed for GitHub Pages deploy
- [x] 6.4 Enable GitHub Pages on the repo with "GitHub Actions" as the source; document this one-time setup in the README
- [x] 6.5 Confirm the published URL is reachable and renders sample data
- [x] 6.6 Document Cloudflare Pages and Netlify as drop-in alternatives (no source changes; host build command = `npm ci && npm run build`)

## 7. Documentation

- [x] 7.1 README: what the site is, who it's for, the one-time setup steps, how to add/remove a kid, and how to change a season-end date
- [x] 7.2 README: troubleshooting section (feed 404, stale data indicator, manual "Run workflow" trigger)
- [x] 7.3 README: privacy note — site is public; webcal URLs in `config.yaml` are assumed non-sensitive share links; how to move them to Actions secrets if that ever changes
- [x] 7.4 Add a short `CONTRIBUTING`-style note or top-of-README section explaining the data flow in 5 bullets so the owner can reason about it in 6 months

## 8. Verification

- [x] 8.1 End-to-end local dry run: real `config.yaml` → `build:data` → `build:site` → open `dist/` in a browser; verify every child renders correctly, past events are hidden, post-season events are hidden, and all-day events display "All day"
- [x] 8.2 Mobile viewport check in a browser devtools emulator (iPhone SE width) and desktop viewport check (≥1024px)
- [x] 8.3 Intentionally break one feed URL; confirm build still succeeds, other children render, and the broken child shows the stale-data notice
- [x] 8.4 Intentionally break all feed URLs; confirm deploy is skipped and the previously deployed site remains live
- [x] 8.5 Hand the final URL to a grandparent-style test user (or simulate: open URL cold on a phone, no instructions) and confirm the page is usable without explanation
