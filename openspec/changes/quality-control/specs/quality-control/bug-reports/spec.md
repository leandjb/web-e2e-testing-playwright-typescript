## Purpose

Standardizes bug reporting across the project with a consistent template that captures severity, environment, reproduction steps, and traceability to test specifications, ensuring reproducible and actionable defect documentation.

## ADDED Requirements

### Requirement: Bug report template

The system SHALL provide a reusable markdown template (`BUG-TEMPLATE.md`) that standardizes the structure of all bug reports.

#### Scenario: Template contains required sections
- **WHEN** a tester creates a new bug report from the template
- **THEN** the template SHALL include: title, ID, date, reporter, environment (URL, browser, OS, viewport, user), severity (Critical/High/Medium/Low), priority (P0-P3), preconditions, steps to reproduce, expected vs actual result, attachments, related tests, and status

#### Scenario: Severity and priority are independent
- **WHEN** a bug is classified
- **THEN** severity (impact on system) and priority (fix urgency) SHALL be independently assignable

### Requirement: Environment capture

Each bug report SHALL capture the full execution environment to enable reproduction.

#### Scenario: Environment fields are mandatory
- **WHEN** a bug report is submitted
- **THEN** it SHALL include: base URL, browser and version, operating system, viewport size, and user account used

### Requirement: Traceability to test specs

Each bug report SHALL reference related test specifications where applicable.

#### Scenario: Bug links to failing test
- **WHEN** a bug is discovered during automated test execution
- **THEN** the report SHALL reference the test spec file and test case ID

#### Scenario: Bug has no corresponding test
- **WHEN** a bug is discovered via manual or exploratory testing
- **THEN** the related tests section SHALL state "None — discovered via exploratory testing"

### Requirement: Bug status tracking

Each bug report SHALL include a status field with defined states: Open, In Progress, Fixed, Verified, Closed.

#### Scenario: Status transitions are documented
- **WHEN** a bug's status changes
- **THEN** the change SHALL be recorded with date and author in the notes section
