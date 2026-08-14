## Why

CI's `pnpm install --frozen-lockfile` fails because `package.json` declares exact dependency
ranges (`@fission-ai/openspec: 1.9.0`, `typescript: 5.6.0`) while `pnpm-lock.yaml` records
caret ranges (`^1.9.0`, `^5.6.0`). pnpm v9 stores the declared range under
`importers['.'].specifiers` and `--frozen-lockfile` refuses to install when the manifest range
no longer matches the lockfile range. This blocked the `merge` job (and would block any `e2e`
shard) with exit code 1, so no merged HTML report is produced and the pipeline fails:

```
specifiers in the lockfile don't match specifiers in package.json:
* 2 dependencies are mismatched:
  - @fission-ai/openspec (lockfile: ^1.9.0, manifest: 1.9.0)
  - typescript (lockfile: ^5.6.0, manifest: 5.6.0)
```

## What Changes

- Align `package.json` dependency specifiers with `pnpm-lock.yaml` so `--frozen-lockfile`
  passes. Recommended: add the matching caret ranges — the lockfile stays authoritative for
  resolved versions, so only the declared intent changes, not what gets installed.
- Document the invariant: `package.json` ranges MUST match the lockfile's recorded `specifier`
  for every dependency, because CI relies on `--frozen-lockfile` for reproducible installs.
- (Alternative considered, not the primary path) Regenerate the lockfile with
  `pnpm install --lockfile-only` to drop the carets instead — see design.md D1.

## Capabilities

### New Capabilities

- `ci-build`: reproducible dependency installation for the Docker/CI E2E pipeline, specifically
  manifest/lockfile specifier consistency under `pnpm install --frozen-lockfile`.

### Modified Capabilities

- (none)

## Impact

- `package.json` (dependency/devDependency ranges) — the only file that needs editing.
- `docker-compose.yml` `e2e` + `merge` service install commands depend on the invariant but do
  not need to change.
- `.github/workflows/ci.yml` install path is unaffected except that it now succeeds.
- No runtime or test behavior change — this is build-tooling only.
