## ADDED Requirements

### Requirement: Fetch each child's feed server-side
The system SHALL fetch every configured calendar feed from a build-time job (not from the browser), to avoid CORS and to keep the deployed site static.

#### Scenario: Successful fetch
- **WHEN** the build job runs and a feed responds with a 2xx ICS body
- **THEN** the body is passed to the ICS parser

#### Scenario: Non-2xx or network failure for one feed
- **WHEN** a single feed fails to fetch (network error, timeout, or non-2xx status)
- **THEN** the build logs the error for that child but continues processing other children

### Requirement: Parse ICS feeds into normalized events
The system SHALL parse each feed using an ICS library (`ical.js` or equivalent) and emit, for each event, a normalized object with at minimum: `kidName`, `title`, `start` (ISO-8601 with timezone or date-only for all-day), `end`, `allDay` (boolean), and `location` (string or null).

#### Scenario: Standard timed event
- **WHEN** the feed contains a VEVENT with DTSTART and DTEND including time
- **THEN** the output has `allDay: false` and ISO-8601 `start`/`end` in the configured timezone

#### Scenario: All-day event
- **WHEN** the feed contains a VEVENT whose DTSTART is a DATE value (no time)
- **THEN** the output has `allDay: true` and `start`/`end` as `YYYY-MM-DD` strings

#### Scenario: Event without location
- **WHEN** a VEVENT has no LOCATION property
- **THEN** the output sets `location` to `null`

### Requirement: Filter events to the visible window
The system SHALL include only events whose start date is on or after "now" (at build time) AND on or before the child's `seasonEndDate` (inclusive, in the configured timezone).

#### Scenario: Past event
- **WHEN** an event's start is before the build's current time
- **THEN** it is excluded

#### Scenario: Event within window
- **WHEN** an event starts at or after now and on or before `seasonEndDate`
- **THEN** it is included

#### Scenario: Event after season end
- **WHEN** an event starts after `seasonEndDate` (later calendar date in the configured timezone)
- **THEN** it is excluded

### Requirement: Publish a single static JSON artifact
The system SHALL write the combined per-child event list to `public/data/events.json` (or equivalent path shipped with the deploy) so the frontend can fetch it with a single HTTP request.

#### Scenario: events.json shape
- **WHEN** ingestion completes successfully
- **THEN** `events.json` contains `generatedAt` (ISO-8601 timestamp), `timezone` (IANA string), and `kids` — an array where each element has `name`, `seasonEndDate`, `events` (array of normalized events sorted ascending by start), and `fetchStatus` (`"ok"` or `"error"`)

### Requirement: Resilience via last-known data per child
When a child's feed fails to fetch or parse, the system SHALL attempt to preserve that child's previously published events rather than dropping the child from the output.

#### Scenario: Single feed fails; prior data available
- **WHEN** a child's feed fails but a previously published `events.json` with that child's events exists
- **THEN** the new `events.json` carries forward that child's prior events (still filtered to the current visible window) and marks `fetchStatus: "error"` for that child

#### Scenario: Single feed fails; no prior data available
- **WHEN** a child's feed fails and no prior data is available
- **THEN** the new `events.json` includes that child with `events: []` and `fetchStatus: "error"`

#### Scenario: All feeds fail
- **WHEN** every configured feed fails
- **THEN** the deploy step is skipped so the previously deployed site remains live unchanged

### Requirement: Scheduled and on-demand refresh
The system SHALL refresh event data automatically on a schedule (every 1 hour) AND on every push to the default branch AND on manual workflow dispatch.

#### Scenario: Scheduled run
- **WHEN** the cron trigger fires
- **THEN** ingestion runs end-to-end and, on success, redeploys the site

#### Scenario: Push to main
- **WHEN** a commit lands on the default branch
- **THEN** ingestion runs and redeploys

#### Scenario: Manual trigger
- **WHEN** the owner clicks "Run workflow" in the Actions UI
- **THEN** ingestion runs and redeploys
