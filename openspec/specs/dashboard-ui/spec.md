## ADDED Requirements

### Requirement: Single public page, no authentication
The dashboard SHALL be a single public URL that renders without any sign-in, account, or setup step. No interactive configuration is exposed in the UI.

#### Scenario: First visit
- **WHEN** a viewer opens the site URL for the first time
- **THEN** events render immediately with no prompts, logins, or cookie banners

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

### Requirement: Site-wide empty state when no days have events
The page SHALL display a single "No more events this season" message when the combined event list across all children is empty, rather than a per-child empty state.

#### Scenario: All children have no upcoming events
- **WHEN** every child's event list is empty
- **THEN** the page renders a single message such as "No more events this season" instead of per-child empty states

### Requirement: Fetch fresh data on each page load
The page SHALL fetch `data/events.json` on every load so viewers see the latest published data without needing to hard-refresh or clear cache.

#### Scenario: Fresh data available
- **WHEN** the page loads and `events.json` is reachable
- **THEN** events render from the freshly fetched JSON

#### Scenario: JSON fetch fails at runtime
- **WHEN** `events.json` cannot be fetched (e.g. the viewer is offline)
- **THEN** the page displays a friendly message explaining that the schedule could not be loaded and to try again shortly, without a console-error-only failure

### Requirement: Show last-updated timestamp and per-child feed status
The page SHALL display the `generatedAt` timestamp from `events.json` in plain language (e.g. "Updated Tuesday at 8:15 am") AND, for any child whose `fetchStatus` is `"error"`, SHALL display a subtle per-event indicator on that child's event cards indicating the data may be outdated.

#### Scenario: All feeds healthy
- **WHEN** every child's `fetchStatus` is `"ok"`
- **THEN** only the site-wide "Updated …" line is shown; no per-child warnings

#### Scenario: One feed errored on last refresh
- **WHEN** a child's `fetchStatus` is `"error"`
- **THEN** each of that child's event cards includes a subtle per-event indicator such as "may be outdated"

### Requirement: Grandparent-friendly presentation
The page SHALL be readable without zooming on a typical phone, SHALL use large, high-contrast typography, and SHALL work without JavaScript errors on evergreen mobile and desktop browsers (current Safari, Chrome, Edge, Firefox).

#### Scenario: Mobile viewport
- **WHEN** the page loads on a viewport narrower than 640px
- **THEN** child sections stack vertically with comfortable spacing and no horizontal scrolling

#### Scenario: Desktop viewport
- **WHEN** the page loads on a viewport wider than 1024px
- **THEN** child sections render side by side (or in a comfortable grid) without clipping or overflow

### Requirement: No interactive controls in v1
The dashboard SHALL NOT expose filters, toggles, search, settings, or any form of input. The only action available to a viewer is reading and bookmarking the page.

#### Scenario: UI surface check
- **WHEN** the page is fully rendered
- **THEN** it contains no `<input>`, `<button>`, or `<select>` elements other than an optional plain link back to the top of the page
