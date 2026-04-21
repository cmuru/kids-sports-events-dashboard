## ADDED Requirements

### Requirement: Optional coachName per child in config
Each child entry in `config.yaml` MAY include a `coachName` string. When present it SHALL be a non-empty string. The system SHALL use it to filter events from the shared feed for that child.

#### Scenario: coachName accepted in child config
- **WHEN** a child entry includes a non-empty `coachName` field
- **THEN** `loadConfig` includes `coachName` on the child's config object

#### Scenario: Child without coachName receives all events
- **WHEN** a child entry has no `coachName` field
- **THEN** all events from the shared feed are assigned to that child (no coach filtering applied)

#### Scenario: Empty string coachName rejected
- **WHEN** a child entry has `coachName: ""`
- **THEN** `loadConfig` throws an error indicating `coachName` must be a non-empty string

### Requirement: Events filtered by coach name substring match
The system SHALL assign an event to a child when the event's `DESCRIPTION` field contains the child's `coachName` as a case-insensitive substring.

#### Scenario: Matching event assigned to child
- **WHEN** an event's description contains the child's `coachName` (any case)
- **THEN** that event is included in the child's event list

#### Scenario: Non-matching event excluded
- **WHEN** an event's description does NOT contain the child's `coachName`
- **THEN** that event is NOT included in the child's event list

#### Scenario: Event with no description excluded when coachName is set
- **WHEN** an event has no `DESCRIPTION` property AND the child has a `coachName` configured
- **THEN** that event is NOT included in the child's event list

#### Scenario: Multiple children share events correctly
- **WHEN** the shared feed contains events for two children each with different `coachName` values
- **THEN** each child's event list contains only the events matching their own `coachName`

### Requirement: Unmatched events logged
The system SHALL log the count of events from the shared feed that did not match any child's `coachName`, to aid in diagnosing misconfiguration.

#### Scenario: Unmatched event count logged
- **WHEN** the build processes the shared feed and some events match no child
- **THEN** the build logs a message with the count of unmatched events
