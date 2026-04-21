## Why

The user's parents (grandparents of the kids) want to keep track of their grandchildren's sports schedules but are not tech-savvy enough to subscribe to webcal feeds in a calendar app. They need a dead-simple web page they can bookmark and open to see what's coming up — no sign-in, no setup, no calendar app configuration. Each kid has their own webcal feed and their own season end date, and grandparents should see only the remaining events of the current season.

## What Changes

- Introduce a zero-maintenance public web dashboard that renders upcoming sports events per child up to each child's configured season end date.
- Pull events from one webcal feed per child; handle `webcal://` → `https://` normalization and ICS parsing.
- Store kid configuration (name, feed URL, season-end date) in a version-controlled config file so updates are a single commit.
- Refresh event data on a schedule via a CI job (no always-on server), then publish as static JSON consumed by the frontend — avoids browser CORS issues with webcal hosts and keeps hosting free.
- Deploy as a static site to a free tier (GitHub Pages / Cloudflare Pages / Netlify) with a single bookmarkable URL.
- Provide a readable, mobile-friendly layout grouped by child, sorted chronologically, with plain-language date/time formatting suitable for non-technical viewers.

## Capabilities

### New Capabilities
- `calendar-config`: Declarative configuration of children and their webcal feeds and season-end dates.
- `event-ingestion`: Scheduled fetch, parse, filter, and publish of ICS events as static JSON.
- `dashboard-ui`: Public static web page that renders each child's upcoming events in a grandparent-friendly layout.
- `site-deployment`: Free-tier static hosting with automatic deploy on push and scheduled data refresh.

### Modified Capabilities
<!-- None — this is a greenfield project. -->

## Impact

- New repository scaffolding: source code, config file, CI workflow, build output.
- New CI workflow (GitHub Actions) that runs on a cron schedule plus on push: fetches ICS feeds, emits JSON, commits or publishes artifacts for the site.
- Free-tier dependency on a static host (default: GitHub Pages) and GitHub Actions minutes (well within free quota for a cron every few hours).
- No backend service, no database, no user accounts, no secrets (webcal URLs are treated as non-sensitive since they are calendar subscription links the user already shares with family).
