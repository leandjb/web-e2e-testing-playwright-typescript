# ci-build Specification

## Purpose

Ensures the E2E suite's dependencies install reproducibly in Docker/CI and fail fast when the
manifest and lockfile disagree, so the report-merge job can never be blocked by an install drift.

## Requirements

### Requirement: Lockfile and manifest specifiers stay consistent

The dependency specifiers declared in `package.json` SHALL exactly match the `specifier`
recorded for each dependency in `pnpm-lock.yaml` so that `pnpm install --frozen-lockfile`
succeeds in CI. The lockfile SHALL remain the source of truth for resolved versions; the
manifest range SHALL be kept in sync with it, not the other way around.

#### Scenario: Frozen install passes when manifest and lockfile agree

- **WHEN** CI runs `pnpm install --frozen-lockfile` inside the `e2e` or `merge` service
- **THEN** installation completes without error and the pinned resolved versions from the lockfile are used

#### Scenario: Mismatch is caught before tests run

- **WHEN** `package.json` declares a range that differs from the lockfile `specifier` (e.g. exact `1.9.0` vs lockfile `^1.9.0`)
- **THEN** `pnpm install --frozen-lockfile` reports the mismatch and exits non-zero, surfacing the inconsistency rather than silently installing a different tree

### Requirement: Reproducible CI dependency install

The Docker `e2e` and `merge` services SHALL install dependencies with `--frozen-lockfile`
(no lockfile mutation) so CI builds are deterministic and the merged-report job cannot be
blocked by an install mismatch.

#### Scenario: Merge job installs deterministically

- **WHEN** the `merge` service runs `pnpm install --frozen-lockfile`
- **THEN** it succeeds using the committed lockfile and proceeds to assemble the HTML report instead of hanging or erroring on a specifier mismatch
