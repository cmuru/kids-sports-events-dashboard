## MODIFIED Requirements

### Requirement: Per-day sections with per-child event labeling
The page SHALL render one section per calendar day that has at least one upcoming event, labeled with the day of week and date in plain language (e.g. "Saturday, May 3"), ordered chronologically. Within each day section, events SHALL be ordered by start time. Each event SHALL display:
- Start time in 12-hour local format with am/pm (for timed events), or the word "All day" (for all-day events)
- Child's name identifying whose event it is
- Event title
- Location, if present, rendered as a clickable link that opens Google Maps for that address in a new tab
- A subtle stale indicator if the child's `fetchStatus` is `"error"` (e.g., "may be outdated")

#### Scenario: Multiple children with events on the same day
- **WHEN** `events.json` contains events for more than one child on the same date
- **THEN** that date's section lists all events from all children ordered by start time, each labeled with the child's name

#### Scenario: Single child with events on a day
- **WHEN** only one child has events on a given date
- **THEN** the day section lists that child's events with the child's name shown on each event

#### Scenario: Events across multiple days
- **WHEN** upcoming events span several different calendar dates
- **THEN** the page renders one section per date in ascending date order

#### Scenario: Event with no location
- **WHEN** an event's `location` is null or empty
- **THEN** the location line is omitted rather than rendered as blank or "null"

#### Scenario: Stale child events shown in day section
- **WHEN** a child's `fetchStatus` is `"error"` and their events appear in a day section
- **THEN** each of that child's event cards includes a subtle notice indicating the data may be outdated

#### Scenario: Event with a location
- **WHEN** an event's `location` is a non-empty string
- **THEN** the location is rendered as a clickable link pointing to Google Maps search for that address
