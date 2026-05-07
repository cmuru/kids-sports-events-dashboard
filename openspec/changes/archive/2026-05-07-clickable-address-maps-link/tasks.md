## 1. Locate and update the location rendering code

- [x] 1.1 Find the component or template that renders event location text
- [x] 1.2 Replace plain location text with an anchor element using the Google Maps search URL (`https://www.google.com/maps/search/?api=1&query=<encoded>`)
- [x] 1.3 Add `target="_blank"` and `rel="noopener noreferrer"` to the anchor

## 2. Styling

- [x] 2.1 Style the location link to be visually distinct (e.g., subtle underline or color) while matching the existing card typography
- [x] 2.2 Verify the link looks correct on both mobile and desktop viewports

## 3. Verification

- [x] 3.1 Confirm that events with a location show a working Maps link that opens in a new tab
- [x] 3.2 Confirm that events with no location still omit the location line entirely (no broken link or empty anchor)
- [x] 3.3 Check the rendered anchor has `rel="noopener noreferrer"` in browser devtools
