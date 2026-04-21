## Why

The current layout groups all of one child's events together, which makes it hard to see what's happening on a given day at a glance — especially when both children have events on the same day. Grouping by day first lets parents (and grandparents) quickly answer "what's this Saturday?" without scanning two separate lists.

## What Changes

- Replace per-child sections with per-day sections, each labeled with the day of the week and date
- Within each day section, events are ordered by start time; events for different children are distinguished by the child's name displayed inline on the event
- The "No more events this season" empty-state moves from per-child to a single site-wide message when no days remain

## Capabilities

### New Capabilities

<!-- No entirely new capabilities -->

### Modified Capabilities

- `dashboard-ui`: The per-child section layout is replaced by a per-day layout. Events from all children appear together under their shared date heading, ordered by time, with the child's name shown on each event row.

## Impact

- `src/App.tsx` (or equivalent UI component) — rendering logic restructured from child-loop to day-loop
- `public/data/events.json` — no schema change; the frontend re-groups the existing flat event arrays client-side
- `openspec/specs/dashboard-ui/spec.md` — requirement for per-child sections is replaced
