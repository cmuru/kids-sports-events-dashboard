## ADDED Requirements

### Requirement: Single declarative config file
The system SHALL read all per-child configuration from a single file named `config.yaml` at the repository root.

#### Scenario: Config file present and valid
- **WHEN** `config.yaml` exists at the repo root with a non-empty `kids` list and each entry has `name`, `calendarUrl`, and `seasonEndDate`
- **THEN** the build succeeds and downstream steps (ingestion, UI) consume the parsed config

#### Scenario: Config file missing
- **WHEN** `config.yaml` is not present at the repo root
- **THEN** the build fails with an error message naming the missing file

### Requirement: Per-child configuration fields
Each entry in `kids` SHALL provide `name` (non-empty string), `calendarUrl` (parseable URL), and `seasonEndDate` (ISO-8601 calendar date `YYYY-MM-DD`). The system SHALL treat `seasonEndDate` as inclusive in the configured timezone.

#### Scenario: Kid entry missing a required field
- **WHEN** any kid entry is missing `name`, `calendarUrl`, or `seasonEndDate`
- **THEN** the build fails with an error naming the kid (by index or name) and the missing field

#### Scenario: Invalid season-end date format
- **WHEN** `seasonEndDate` is not a valid `YYYY-MM-DD` date
- **THEN** the build fails with an error naming the kid and the invalid value

#### Scenario: Invalid calendar URL
- **WHEN** `calendarUrl` cannot be parsed as a URL
- **THEN** the build fails with an error naming the kid and the invalid value

#### Scenario: Events on the season-end date are kept
- **WHEN** a feed contains an event on the same calendar date as `seasonEndDate`
- **THEN** that event is included in the output

#### Scenario: Events after the season-end date are dropped
- **WHEN** a feed contains an event after `seasonEndDate`
- **THEN** that event is excluded from the output

### Requirement: Webcal URL normalization
The system SHALL accept `webcal://` calendar URLs and internally rewrite them to `https://` before fetching, without requiring the owner to hand-edit the scheme.

#### Scenario: webcal scheme is normalized
- **WHEN** a `calendarUrl` begins with `webcal://`
- **THEN** the fetcher requests the equivalent `https://` URL

#### Scenario: https scheme is used as-is
- **WHEN** a `calendarUrl` begins with `https://`
- **THEN** the fetcher requests it unchanged

### Requirement: Optional timezone field
The config MAY include a top-level `timezone` IANA string (e.g. `America/Toronto`). When omitted, the system SHALL default to the build host's timezone at build time.

#### Scenario: Timezone provided
- **WHEN** `timezone` is set to a valid IANA zone
- **THEN** all date filtering and display use that zone

#### Scenario: Timezone omitted
- **WHEN** `timezone` is not set
- **THEN** the build uses the host system timezone and records the chosen zone in the published output for visibility

#### Scenario: Invalid timezone
- **WHEN** `timezone` is set but not a recognized IANA zone
- **THEN** the build fails with an error naming the invalid value
