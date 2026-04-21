## MODIFIED Requirements

### Requirement: Per-day sections with per-child event labeling
The page SHALL render one section per calendar day that has at least one upcoming event, labeled with the day of week and date in plain language (e.g. "Saturday, May 3"), ordered chronologically. Within each day section, events SHALL be ordered by start time. Each event SHALL display:
- Start time in 12-hour local format with am/pm (for timed events), or the word "All day" (for all-day events)
- Child's name identifying whose event it is
- Event title
- Location, if present
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

## REMOVED Requirements

### Requirement: Per-child sections with plain-language formatting
**Reason**: Replaced by per-day sections. Events from all children are now grouped by date rather than by child, giving a unified daily view.
**Migration**: Child name is now shown inline on each event card within the per-day layout. The stale notice moves from a per-child section header to a per-event indicator.

## ADDED Requirements

### Requirement: Site-wide empty state when no days have events
The page SHALL display a single "No more events this season" message when the combined event list across all children is empty, rather than a per-child empty state.

#### Scenario: All children have no upcoming events
- **WHEN** every child's event list is empty
- **THEN** the page renders a single message such as "No more events this season" instead of per-child empty states
