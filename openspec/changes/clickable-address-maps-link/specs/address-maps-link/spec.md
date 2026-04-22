## ADDED Requirements

### Requirement: Address renders as a Google Maps link
When an event has a non-empty location, the system SHALL render the location as an anchor element linking to Google Maps search for that address. The link SHALL open in a new browser tab and SHALL include `rel="noopener noreferrer"`. The Google Maps URL SHALL use the format `https://www.google.com/maps/search/?api=1&query=<url-encoded-address>`.

#### Scenario: Event with a location
- **WHEN** an event's `location` field is a non-empty string
- **THEN** the location is rendered as a clickable `<a>` link pointing to `https://www.google.com/maps/search/?api=1&query=<url-encoded-location>`

#### Scenario: Link opens in new tab
- **WHEN** a user clicks the location link
- **THEN** Google Maps opens in a new browser tab and the dashboard remains open in the original tab

#### Scenario: Link has safe cross-origin attributes
- **WHEN** the location link is rendered
- **THEN** the anchor element has `target="_blank"` and `rel="noopener noreferrer"`

#### Scenario: Event with no location
- **WHEN** an event's `location` is null or empty
- **THEN** no link is rendered (consistent with existing behavior of omitting the location line)
