## 1. Grouping Logic (src/main.ts)

- [x] 1.1 Add a `groupByDay` function that flattens all children's events into a single array (each event already has `kidName`) and groups them into a `Map<string, NormalizedEvent[]>` keyed by date string (`YYYY-MM-DD`), sorted by date ascending
- [x] 1.2 Within each day group, sort events by `start` ascending (handles both ISO timestamps and `YYYY-MM-DD` all-day strings)

## 2. Rendering (src/main.ts)

- [x] 2.1 Add a `renderDay(dateKey: string, events: NormalizedEvent[], kids: KidData[])` function that emits a `<section>` with the day heading (e.g. "Saturday, May 3") and the list of event cards
- [x] 2.2 Update `renderEvent` to include the child's name as a visible label on each event card
- [x] 2.3 Update `renderEvent` to show a subtle stale indicator when the event's child has `fetchStatus: 'error'` — pass `kids` data through or look up status by `kidName`
- [x] 2.4 Replace `data.kids.map(renderKid).join('')` in `main()` with `groupByDay` + `renderDay` calls
- [x] 2.5 Replace per-child empty states with a single site-wide "No more events this season" message when the combined event list is empty
- [x] 2.6 Remove the now-unused `renderKid` function

## 3. Styles (src/style.css)

- [x] 3.1 Add or update CSS for the day section heading (`.day-section`, `.day-heading` or equivalent)
- [x] 3.2 Add CSS for the child name label on each event card (`.event-child` or equivalent) — should be visually distinct but not dominant
- [x] 3.3 Add CSS for the per-event stale indicator (`.event-stale` or equivalent) — subtle, e.g. small muted text
- [x] 3.4 Remove or repurpose `.kid-section` and `.stale-notice` styles that were per-child-section specific

## 4. Verification

- [x] 4.1 Run `npm run build` and confirm no TypeScript errors
- [x] 4.2 Open the dashboard locally and verify day sections appear in date order with both children's events mixed within each day
- [x] 4.3 Verify each event card shows the child's name
- [x] 4.4 Verify the empty state shows a single message when no events exist
