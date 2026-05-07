## Context

The dashboard currently displays event location text as a plain string. Users who want directions must manually copy it into Google Maps. This is a purely frontend change with no backend or data model impact — the location string is already present in `events.json`.

## Goals / Non-Goals

**Goals:**
- Wrap any non-empty location string in an `<a>` tag pointing to Google Maps
- Open the link in a new tab so the dashboard remains open
- Keep the visual change minimal — the link should feel like a natural part of the event card

**Non-Goals:**
- Validating or geocoding the address (trust the string as-is)
- Supporting maps services other than Google Maps
- Changing how the address is stored or fetched

## Decisions

### Use a direct Google Maps search URL

Encode the address into `https://www.google.com/maps/search/?api=1&query=<encoded-address>`.

- **Why this over a `maps://` deep-link**: The deep-link only works on iOS/macOS and would break on Android and desktop. The `maps/search` URL works in any browser and redirects to the native app on mobile when appropriate.
- **Why search URL over directions URL**: A search URL requires only the destination. A directions URL would also need an origin, which we do not have.

### Minimal visual styling

Style the link to look like the existing location text but with a subtle underline or color cue. Avoid making it look like a big CTA button — this is a utility link, not a primary action.

- **Why**: The grandparent-friendly design principle favors legibility over flashy UI. The link should be obvious enough to be discoverable without disrupting the layout.

### `rel="noopener noreferrer"` on the link

Always include these rel attributes on `target="_blank"` links.

- **Why**: Security best practice — prevents the opened tab from accessing `window.opener`.

## Risks / Trade-offs

- **Address strings may not geocode well** → Google Maps search is tolerant of partial or informal addresses; degraded worst case is a Maps search with no result, which is still safe.
- **Link opens new tab (may surprise some users)** → This is the right trade-off since closing a tab is easy, but losing the dashboard state is not.
