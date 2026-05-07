## Why

Each event in `events.json` already carries a `description` field (e.g. "Badger Field > Field 10") that is currently not surfaced in the dashboard UI. Showing it gives viewers useful sub-location detail (field number, complex name) without any extra data-fetching work.

## What Changes

- Each event card gains a description line rendered above the location line
- The description line is omitted when the `description` field is absent or empty (matching the existing behaviour for the location field)

## Capabilities

### New Capabilities

_(none — this change modifies an existing capability)_

### Modified Capabilities

- `dashboard-ui`: Event cards now display the `description` field above the location line when a description value is present

## Impact

- `src/` — the event card component that renders each event's detail lines
- No data-pipeline, API, or dependency changes required; `description` is already present in `events.json`
