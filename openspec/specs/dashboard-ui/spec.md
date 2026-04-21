## ADDED Requirements

### Requirement: Single public page, no authentication
The dashboard SHALL be a single public URL that renders without any sign-in, account, or setup step. No interactive configuration is exposed in the UI.

#### Scenario: First visit
- **WHEN** a viewer opens the site URL for the first time
- **THEN** events render immediately with no prompts, logins, or cookie banners

### Requirement: Per-child sections with plain-language formatting
The page SHALL render one section per configured child, labeled with the child's name, containing that child's upcoming events ordered chronologically. Each event SHALL display:
- Day of week + date in plain language (e.g. "Saturday, May 3")
- Start time in 12-hour local format with am/pm (for timed events), or the word "All day" (for all-day events)
- Event title
- Location, if present

#### Scenario: Child with upcoming events
- **WHEN** `events.json` contains one or more events for a child within the visible window
- **THEN** that child's section lists each event in ascending start order with the fields above

#### Scenario: Child with no upcoming events
- **WHEN** a child has zero events within the visible window
- **THEN** their section renders with a clear message such as "No more events this season" instead of being empty or hidden

#### Scenario: Event with no location
- **WHEN** an event's `location` is null or empty
- **THEN** the location line is omitted rather than rendered as blank or "null"

### Requirement: Fetch fresh data on each page load
The page SHALL fetch `data/events.json` on every load so viewers see the latest published data without needing to hard-refresh or clear cache.

#### Scenario: Fresh data available
- **WHEN** the page loads and `events.json` is reachable
- **THEN** events render from the freshly fetched JSON

#### Scenario: JSON fetch fails at runtime
- **WHEN** `events.json` cannot be fetched (e.g. the viewer is offline)
- **THEN** the page displays a friendly message explaining that the schedule could not be loaded and to try again shortly, without a console-error-only failure

### Requirement: Show last-updated timestamp and per-child feed status
The page SHALL display the `generatedAt` timestamp from `events.json` in plain language (e.g. "Updated Tuesday at 8:15 am") AND, for any child whose `fetchStatus` is `"error"`, SHALL display a subtle notice on that child's section indicating the data may be stale.

#### Scenario: All feeds healthy
- **WHEN** every child's `fetchStatus` is `"ok"`
- **THEN** only the site-wide "Updated …" line is shown; no per-child warnings

#### Scenario: One feed errored on last refresh
- **WHEN** a child's `fetchStatus` is `"error"`
- **THEN** that child's section includes a small notice such as "Latest schedule couldn't be loaded — showing what we had last time"

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
