## Why

When viewing sports events on the dashboard, users see an address but must manually copy and paste it into Google Maps to get directions. Making the address a clickable link reduces friction and makes it faster to navigate to an event location.

## What Changes

- Event addresses displayed in the dashboard UI become clickable hyperlinks
- Clicking an address opens Google Maps with that address pre-filled for navigation
- Links open in a new tab to preserve the dashboard view

## Capabilities

### New Capabilities

- `address-maps-link`: Event addresses render as clickable links that open Google Maps for navigation

### Modified Capabilities

- `dashboard-ui`: Address display changes from plain text to an interactive link element

## Impact

- `dashboard-ui` spec requires a delta for address rendering behavior
- Affects the event card/detail component(s) that render address fields
- No new dependencies required (uses a standard Google Maps URL pattern)
- No API or backend changes needed
