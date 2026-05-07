## 1. Render description in event card

- [x] 1.1 In `renderEvent` in `src/main.ts`, add a `descriptionHtml` variable that renders a `<div class="event-description">` when `event.description` is truthy, mirroring the existing `locationHtml` pattern
- [x] 1.2 Insert `${descriptionHtml}` between `${locationHtml}` — wait, above it: place `${descriptionHtml}` immediately before `${locationHtml}` in the returned HTML string

## 2. Style the description line

- [x] 2.1 Add `.event-description` rule to `src/style.css` (font-size, color, or style that visually distinguishes it from the title and location)

## 3. Verify

- [x] 3.1 Start the dev server (`npm run dev`) and confirm events with a description show the description text above the location
- [x] 3.2 Confirm events without a description show no blank line
- [x] 3.3 Confirm events with a description but no location show only the description line (no location)
