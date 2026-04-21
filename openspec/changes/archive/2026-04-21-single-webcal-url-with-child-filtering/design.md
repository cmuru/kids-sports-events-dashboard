## Context

Currently `config.yaml` requires one `calendarUrl` per child in the `kids` array. The build pipeline (`run.ts`) fetches each child's URL independently and assigns all parsed events to that child. The calendar provider (Blue Sombrero) actually returns the same events on both URLs — both feeds contain events for all children. The correct differentiator is the **coach name**, which appears somewhere in the event's `DESCRIPTION` field.

The new model: one shared `webcalUrl` at the top level of config, each child entry gets a `coachName` used to match events from the combined feed.

## Goals / Non-Goals

**Goals:**
- Replace per-child `calendarUrl` with a single top-level `webcalUrl`
- Add optional `coachName` per child for event-to-child assignment
- Fetch the shared feed once per build run
- Filter events per child by case-insensitive substring match of `coachName` in the event description
- Maintain the existing error/fallback behaviour (cache on failure)

**Non-Goals:**
- Supporting more than one shared feed URL
- Fuzzy or regex coach name matching (simple substring is enough)
- Changing the output `events.json` schema — consumers are unaffected

## Decisions

### 1. Single top-level `webcalUrl` instead of per-child URL

**Decision:** Move `calendarUrl` out of each `kids` entry and into a new top-level `webcalUrl` field.

**Why:** The provider exposes one URL that contains all children's events. Having it per-child was always a coincidence of the old setup. Top-level placement makes the intent clear and prevents accidental duplication.

**Alternative considered:** Keep `calendarUrl` per-child but require them to be identical. Rejected — redundant config invites drift and confusion.

### 2. Coach name as a substring match against the event description

**Decision:** Each child config gains an optional `coachName` string. During filtering, an event is assigned to a child if the event's DESCRIPTION property contains `coachName` (case-insensitive). Events with no matching child are silently dropped.

**Why:** The Blue Sombrero feed embeds coach name in the `DESCRIPTION` field. A simple `includes()` match is reliable and requires no additional dependencies.

**Alternative considered:** Filtering on event `SUMMARY` or `CATEGORIES`. Rejected — coach name is in the description, not the title.

**Alternative considered:** Regex matching. Rejected — overkill; a plain substring is sufficient and simpler to configure.

### 3. `coachName` is optional — children without it receive all events

**Decision:** If `coachName` is omitted for a child, all events from the shared feed are assigned to that child (no filtering applied).

**Why:** Provides a graceful migration path and handles single-child setups where no filtering is needed.

### 4. Fetch the shared feed once, distribute in memory

**Decision:** `run.ts` fetches `webcalUrl` once, parses the full ICS, then filters the resulting event array per child using `coachName`.

**Why:** Avoids duplicate network requests. The feed is the same for all children so fetching N times would be wasteful and could trigger rate limits.

**How:** Extract feed fetch + parse into a shared step before the per-child loop. Pass the full parsed event array to a new `filterByCoach` helper alongside the existing `filterEvents` date filter.

### 5. `parseIcs` drops the `kidName` assignment — it happens later

**Decision:** `parseIcs` currently stamps `kidName` on every event. With a shared feed it can't know the child yet. Change `parseIcs` to accept an empty string or remove the stamp; `kidName` gets set during per-child assignment after coach filtering.

**Why:** Clean separation — parsing produces raw events, assignment decides ownership.

## Risks / Trade-offs

- **Events with no coach name match are silently dropped** → Mitigation: log a count of unmatched events per build run so the user can detect misconfiguration.
- **Coach name strings are fragile** (typos, provider changes) → Mitigation: log matched event counts per child; zero events is a clear signal.
- **Single point of failure** — one fetch failure now affects all children → Mitigation: existing fallback-to-cache logic already handles this; apply it at the shared fetch level before branching per child.

## Migration Plan

1. Update `config.yaml` — replace per-child `calendarUrl` with top-level `webcalUrl`, add `coachName` to each child.
2. Update `KidConfig` interface — remove `calendarUrl`, add optional `coachName`.
3. Update `Config` interface — add `webcalUrl`.
4. Update `loadConfig.ts` — parse and validate `webcalUrl`; parse optional `coachName` per child.
5. Update `parseIcs.ts` — remove `kidName` parameter (or make it optional, set to `''`).
6. Add `filterByCoach.ts` — new helper that filters a `NormalizedEvent[]` by coach name substring.
7. Update `run.ts` — fetch once, parse once, then per-child: coach-filter → date-filter → assign kidName → sort.
8. Rollback: restore the old `config.yaml` shape; the old code is in git.
