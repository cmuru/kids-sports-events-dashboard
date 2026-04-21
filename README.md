# Kids Sports Calendar Dashboard

A simple web page for grandparents (or anyone) to see the kids' upcoming sports schedule — no app, no account, no setup required. Just open the URL and see what's coming up.

## How it works

1. You edit `config.yaml` with each kid's webcal calendar URL and season end date.
2. A scheduled GitHub Action runs every hour, fetches each calendar, and rebuilds the site.
3. The site is hosted free on GitHub Pages — one URL to bookmark.

---

## One-time setup

### 1. Fork or clone this repo

Make sure the repo is **public** (required for free GitHub Pages).

### 2. Edit `config.yaml` with your kids' info

```yaml
timezone: "America/Toronto"   # your local IANA timezone

kids:
  - name: "Alex"
    calendarUrl: "webcal://your-league-site.com/alex.ics"
    seasonEndDate: "2026-06-30"

  - name: "Sam"
    calendarUrl: "webcal://your-league-site.com/sam.ics"
    seasonEndDate: "2026-05-31"
```

`webcal://` URLs are automatically converted to `https://` — paste them as-is from your league site.

### 3. Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

### 4. Push `config.yaml` to trigger the first deploy

```bash
git add config.yaml
git commit -m "Add kid calendars"
git push
```

The Actions tab will show the workflow running. Once it completes (~2 min), your site is live at:

```
https://<your-github-username>.github.io/<repo-name>/
```

Share that URL with grandparents and have them bookmark it.

---

## Updating a kid's info

| Task | What to do |
|---|---|
| Change a season end date | Edit `seasonEndDate` in `config.yaml`, push |
| Add a new kid | Add a new entry under `kids:`, push |
| Remove a kid | Delete their entry, push |
| Change a calendar URL | Edit `calendarUrl`, push |

The site refreshes automatically within an hour, or immediately after you push.

---

## Troubleshooting

**The schedule shows "showing what we had last time"**
The calendar feed couldn't be reached during the last hourly refresh. It will retry next hour. You can also trigger a manual refresh: go to **Actions** → **Build and Deploy** → **Run workflow**.

**A kid has no events showing**
Check that `seasonEndDate` in `config.yaml` is in the future and in `YYYY-MM-DD` format.

**The workflow failed (red ✗ in Actions)**
- Open the failed run and check the logs.
- Most common cause: the calendar URL is wrong or the league site is temporarily down.
- If all feeds fail at once, the previous deploy stays live — grandparents see no change.

**I want to trigger a fresh fetch right now**
Go to **Actions** → **Build and Deploy** → **Run workflow** → **Run workflow** (green button).

---

## Alternative hosting (Cloudflare Pages or Netlify)

No source code changes needed. The output is plain static files.

**Cloudflare Pages / Netlify:**
- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Set the environment variable `BASE_URL=/` (no subdirectory needed on these hosts)

The hourly data refresh via GitHub Actions cron still works — it rebuilds and redeploys to GitHub Pages. If you move hosting away from GitHub Pages entirely, set up a cron job or webhook on your new host to trigger a rebuild every hour.

---

## Privacy note

The site URL is public and technically discoverable. For a family sports schedule this is generally fine — the same information is shared with team families anyway. The calendar URLs in `config.yaml` are committed to the repo; if your league URLs contain private tokens, move them to GitHub Actions secrets:

1. Add each URL as a secret in **Settings → Secrets → Actions** (e.g. `ALEX_CAL_URL`)
2. Edit `config.yaml` to use a placeholder
3. Edit `.github/workflows/deploy.yml` to inject the secrets as environment variables before `npm run build:data`
4. Update `loadConfig.ts` to read from `process.env` when the config field is a placeholder

---

## Data flow (for future reference)

1. **`config.yaml`** — owner edits this file to configure kids and their calendar URLs.
2. **`npm run build:data`** (`src/build/run.ts`) — fetches each ICS feed, parses events, filters to each kid's season window, writes `public/data/events.json`.
3. **`npm run build:site`** (`vite build`) — bundles `index.html` + `src/main.ts` + `src/style.css` into `dist/`, copying `public/data/events.json` alongside.
4. **GitHub Actions** — runs steps 2 and 3 on push and every hour, then deploys `dist/` to GitHub Pages.
5. **Browser** — fetches `data/events.json` on each page load and renders the schedule; no backend involved.
