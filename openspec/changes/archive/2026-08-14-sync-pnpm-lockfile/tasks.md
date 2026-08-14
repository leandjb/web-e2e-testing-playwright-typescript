## 1. Align manifest with lockfile

- [x] 1.1 In `package.json`, change `@fission-ai/openspec` from `1.9.0` to `^1.9.0`
- [x] 1.2 In `package.json`, change `typescript` from `5.6.0` to `^5.6.0`
- [x] 1.3 Commit `package.json` (and `pnpm-lock.yaml` if it was touched) so the manifest ranges match the lockfile `specifier` entries

## 2. Verify reproducible install

- [x] 2.1 Run `pnpm install --frozen-lockfile` (or the equivalent `docker compose run --rm merge`) and confirm it exits 0 with no specifier mismatch
- [x] 2.2 Push and confirm the CI `e2e` shards and `merge` job install and produce the merged HTML report (exit 0)
