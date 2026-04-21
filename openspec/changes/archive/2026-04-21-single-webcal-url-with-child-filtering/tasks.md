## 1. Config Schema Changes

- [x] 1.1 Update `KidConfig` interface in `src/build/loadConfig.ts` — remove `calendarUrl`, add optional `coachName?: string`
- [x] 1.2 Update `Config` interface in `src/build/loadConfig.ts` — remove per-child URL handling, add `webcalUrl: string`
- [x] 1.3 Update `loadConfig` function to read and validate top-level `webcalUrl` (required, normalized from `webcal://` to `https://`)
- [x] 1.4 Update `loadConfig` per-child parsing to read optional `coachName`, reject empty-string values with a clear error
- [x] 1.5 Remove `calendarUrl` validation from per-child loop in `loadConfig`

## 2. config.yaml Update

- [x] 2.1 Replace per-child `calendarUrl` entries with a single top-level `webcalUrl` in `config.yaml`
- [x] 2.2 Add `coachName` field to each child entry in `config.yaml` with the correct coach name strings

## 3. parseIcs Update

- [x] 3.1 Remove the `kidName` parameter from `parseIcs` in `src/build/parseIcs.ts` (or make it optional defaulting to `''`) — `kidName` stamping moves to after coach filtering

## 4. New Coach Filter Helper

- [x] 4.1 Create `src/build/filterByCoach.ts` — export `filterByCoach(events: NormalizedEvent[], coachName: string | undefined): NormalizedEvent[]` that returns all events when `coachName` is undefined, or events whose description contains `coachName` (case-insensitive) when set

## 5. Build Pipeline (run.ts)

- [x] 5.1 Fetch the shared `webcalUrl` once before the per-child loop; store result as raw ICS text
- [x] 5.2 Parse the shared ICS once (with no kidName / empty kidName) to get a full `NormalizedEvent[]`
- [x] 5.3 Wrap the single fetch+parse in a try/catch; on failure set a shared error flag for fallback handling
- [x] 5.4 In the per-child loop: call `filterByCoach` with the child's `coachName`, then stamp `kidName` on matched events, then call `filterEvents` (date filter), then sort
- [x] 5.5 Update fallback logic — on shared fetch failure, all children fall back to cached events (same exit-code-1 behaviour when no cache exists)
- [x] 5.6 Log the count of unmatched events (events from the shared feed that didn't match any child's `coachName`)

## 6. Types

- [x] 6.1 Verify `NormalizedEvent.kidName` in `src/types.ts` is still populated correctly after the pipeline refactor (set during per-child assignment, not during parse)

## 7. Verification

- [x] 7.1 Run `npm run build` (or equivalent) and confirm it compiles without TypeScript errors
- [x] 7.2 Run the fetch pipeline locally (`npm run fetch` or equivalent) and confirm each child gets the correct events based on coach name
- [x] 7.3 Confirm the dashboard UI renders both children's events correctly
