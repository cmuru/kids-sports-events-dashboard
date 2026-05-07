## Context

`NormalizedEvent` already has `description: string | null` in `src/types.ts` and the field is populated in `public/data/events.json`. The `renderEvent` function in `src/main.ts` builds each event card's HTML but currently ignores `description`. No pipeline or data changes are needed.

## Goals / Non-Goals

**Goals:**
- Surface the `description` field in the event card, above the location line
- Omit the line when `description` is absent or empty (consistent with existing `location` handling)

**Non-Goals:**
- Styling beyond a new CSS class for the description line
- Any changes to the data pipeline or `events.json` generation

## Decisions

**Single-file change in `renderEvent`**  
The entire change lives in `renderEvent` in `src/main.ts`. A new `descriptionHtml` variable mirrors the existing `locationHtml` pattern: guard on truthiness, escape the value, wrap in a `<div class="event-description">`. This keeps the pattern consistent and easy to read.

A separate component or helper was not warranted — the function is already a straightforward string-builder and adding one more guarded line does not increase complexity.

**New `.event-description` CSS class in `src/style.css`**  
A dedicated class lets the description be styled independently from `.event-location` (e.g. slightly subdued or italic to distinguish it visually from the clickable map link). No style decision is locked in by this — the class is the hook.

## Risks / Trade-offs

- **Description duplicates location text** — in current data, `description` often contains the field name while `location` contains the venue address, so duplication is unlikely but possible if the feed changes. Low risk; no mitigation needed in v1.
- **Long description values** — no truncation is added; description text wraps naturally. Acceptable for the use case.
