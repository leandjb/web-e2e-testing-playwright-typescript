## Context

`docker-compose.yml` `e2e` and `merge` services run `corepack enable && pnpm install --frozen-lockfile`
inside the pinned Playwright image (pnpm 11.21.0, `lockfileVersion: '9.0'`). pnpm v9 records each
importer's declared range under `importers['.'].specifiers.<dep>`; `--frozen-lockfile` compares that
to `package.json` and aborts on mismatch. The committed lockfile currently holds `^1.9.0` /
`^5.6.0` while `package.json` holds `1.9.0` / `5.6.0`, so CI exits 1 at `docker compose run --rm merge`
(and the e2e shards). See proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Make `pnpm install --frozen-lockfile` pass deterministically in CI.
- Keep the lockfile authoritative for resolved versions (no version change shipped).

**Non-Goals:**
- Changing the actually resolved dependency versions.
- Changing the pnpm version or the Docker image.
- Adding or removing dependencies.

## Decisions

### D1. Align `package.json` ranges to the lockfile (add carets)

Edit `package.json` so `@fission-ai/openspec` becomes `^1.9.0` and `typescript` becomes `^5.6.0`,
matching `pnpm-lock.yaml` `importers['.'].specifiers`. With `--frozen-lockfile`, pnpm still installs
the exact resolved version recorded in the lockfile (`version: 1.9.0`), so this changes only the
declared intent, not what gets installed. This is the minimal, network-free fix and is safe even when
the npm registry is unreachable (no install or lockfile mutation is required).

**Alternative considered:** run `pnpm install --lockfile-only` to rewrite the lockfile with exact
(`1.9.0`) specifiers. Rejected as the primary path because it mutates the lockfile, needs registry
metadata access, and the lockfile's caret ranges are already what CI installs — aligning the manifest
is lower-risk and keeps the lockfile untouched.

### D2. Preserve `--frozen-lockfile` in both services

Keep `docker-compose.yml` `e2e` + `merge` `pnpm install --frozen-lockfile` unchanged — the whole point
is that frozen install must keep passing. Do NOT switch to `--no-frozen-lockfile`, which would mask
future drift instead of surfacing it.

## Risks / Trade-offs

- **[Risk]** Adding carets to `package.json` lets a future `pnpm update` bump minors (e.g. `typescript` 5.7).
  → **Mitigation:** `--frozen-lockfile` in CI prevents any unpinned bump in CI; a human must run
  `pnpm install` (not `--frozen-lockfile`) to intentionally update, which regenerates the lockfile.
- **[Risk]** Other deps in `package.json` also diverge from the lockfile.
  → **Mitigation:** verify with `pnpm install --frozen-lockfile` locally before pushing; the only two
  mismatches reported are the ones named above.

## Migration Plan

- Edit `package.json` ranges; co-commit `package.json` (and `pnpm-lock.yaml` if it was touched for clarity).
- Validate: `pnpm install --frozen-lockfile` exits 0 locally and in CI.
- Rollback: revert the `package.json` edit.
