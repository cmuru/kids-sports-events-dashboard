## Context

The UI is a single `src/main.ts` file with no framework. It renders HTML strings via `container.innerHTML`. Currently `renderKid()` loops over `data.kids` and renders one `<section>` per child, each containing that child's events in chronological order. Each event card shows date, time, title, and location.

The `events.json` output has events stored per-child:
```json
{ "kids": [
  { "name": "Emma", "events": [...] },
  { "name": "Oliver", "events": [...] }
]}
```

All grouping logic lives entirely in the frontend — the data shape does not need to change.

## Goals / Non-Goals

**Goals:**
- Re-group the rendered output by calendar date (one section per day), in ascending date order
- Within each day, show events sorted by start time; label each event with the child's name
- Preserve all existing event fields: time, title, location, stale notice
- Keep the site-wide "No upcoming events" empty state when no days exist
- Pure frontend change — no changes to `events.json` schema or build pipeline

**Non-Goals:**
- Changing the `events.json` data shape
- Sorting or filtering logic changes in `run.ts`
- Adding any new UI interactivity

## Decisions

### 1. Group client-side from the existing flat per-child arrays

**Decision:** In `main.ts`, collect all events from all children into a single flat array (tagging each with `kidName`), then group by the date portion of `start`, and sort within each day by `start`.

**Why:** `kidName` is already on every `NormalizedEvent`, so no data changes are needed. The grouping is a straightforward client-side reduce. The `events.json` shape stays stable — nothing downstream breaks.

**Alternative considered:** Restructure `events.json` to emit a pre-grouped `days` array from the build step. Rejected — adds build complexity for a purely presentational concern, and means the data format can't easily be re-grouped differently later.

### 2. Replace `renderKid` with `renderDay` — no per-child sections

**Decision:** Replace the `data.kids.map(renderKid)` call with a `groupByDay(allEvents).map(renderDay)` call. `renderDay` emits a `<section>` per date. Each event card inside gains a child name badge/label.

**Why:** The section-per-child structure is the root of the current grouping. Replacing it at the top level is the minimal surgical change.

### 3. Stale notice moves to per-event badge, not per-section

**Decision:** Since there are no longer per-child sections, show a stale indicator inline on each event belonging to a child with `fetchStatus: 'error'` (e.g., a small "⚠ may be outdated" note under the event title).

**Why:** The stale notice needs to stay associated with its child's events even when those events are mixed into shared day sections.

**Alternative considered:** Single site-wide stale banner. Rejected — loses the per-child attribution that helps parents know which child's data is stale.

### 4. Empty state becomes site-wide

**Decision:** When the combined flat event list is empty, render a single "No more events this season" message instead of one per child.

**Why:** With no day sections to render, per-child empty states no longer have a natural home.

## Risks / Trade-offs

- **Events on the same day at the same time for different children** appear in insertion order (Emma before Oliver, as configured). This is acceptable — exact-same-time conflicts are rare and insertion order is deterministic. → No mitigation needed.
- **All-day events** use a `YYYY-MM-DD` string for `start` rather than an ISO timestamp. The date-key extraction must handle both formats. → Extract the date portion by splitting on `T` for timed events and using the string directly for all-day events.
