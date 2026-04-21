## Why

The app currently expects two separate webcal URLs (one per child), but the calendar provider exposes a single URL that contains events for both children. Filtering by child must now happen at the app level using coach name data embedded in event descriptions, rather than relying on separate feed URLs.

## What Changes

- **BREAKING**: Replace the two per-child `webcalUrl` config fields with a single shared `webcalUrl` field
- Add per-child `coachName` config field used to filter events from the shared feed
- Update calendar fetching logic to use one URL instead of two
- Update event filtering logic to match events to a child based on coach name appearing in the event description

## Capabilities

### New Capabilities

- `single-calendar-feed`: Accept a single webcal URL in config and fetch all events from it
- `coach-name-child-filter`: Filter events to each child based on a configured coach name matched against event descriptions

### Modified Capabilities

<!-- No existing specs require behavioral changes -->

## Impact

- `config.ts` / config schema: shape of child config object changes
- Calendar fetching code: reduce from two fetches to one
- Event filtering / assignment logic: new coach-name-based matching instead of per-URL assignment
- Any UI that renders child-specific event lists
