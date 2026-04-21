## ADDED Requirements

### Requirement: Top-level webcal URL in config
The system SHALL accept a single `webcalUrl` field at the top level of `config.yaml`. Per-child `calendarUrl` fields SHALL no longer be accepted. The URL MAY use the `webcal://` scheme, which SHALL be normalized to `https://` before fetching.

#### Scenario: Valid webcal URL accepted
- **WHEN** `config.yaml` contains a top-level `webcalUrl` with a `webcal://` or `https://` URL
- **THEN** `loadConfig` returns a `Config` with `webcalUrl` normalized to `https://`

#### Scenario: Missing webcalUrl rejected
- **WHEN** `config.yaml` has no top-level `webcalUrl` field
- **THEN** `loadConfig` throws an error indicating `webcalUrl` is required

#### Scenario: Invalid URL rejected
- **WHEN** `config.yaml` `webcalUrl` is not a valid URL
- **THEN** `loadConfig` throws an error indicating the URL is invalid

### Requirement: Shared feed fetched once per build
The system SHALL fetch the `webcalUrl` feed exactly once per build run, regardless of the number of children configured.

#### Scenario: Single fetch for multiple children
- **WHEN** the build runs with two children configured
- **THEN** exactly one HTTP request is made to the `webcalUrl` endpoint

#### Scenario: Fetch failure falls back to cache for all children
- **WHEN** the single feed fetch fails
- **THEN** all children fall back to their previously cached events (if available)
- **THEN** each child's `fetchStatus` is set to `"error"`

#### Scenario: No cache available on fetch failure
- **WHEN** the single feed fetch fails AND no cached `events.json` exists
- **THEN** the build exits with code 1 without writing output
