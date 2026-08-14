#!/usr/bin/env bash
#
# run-e2e.sh — single entrypoint for the Playwright suite (local AND CI).
#
# Usage:
#   bash run-e2e.sh <N> <mode>
#     N     number of shards to run in parallel (local). Default: 1 for smoke, 2 for full.
#     mode  "smoke" (run @smoke only) or "full" (all tests).        Default: full.
#
# In CI the matrix invokes this with N=1 and supplies SHARD_INDEX / TOTAL_SHARDS
# via the environment, so a single shard runs per job. The merge job merges the
# uploaded blobs separately, so this script skips merge/cleanup when CI=true.
#
set -uo pipefail

MODE="${2:-full}"
if [ "$#" -ge 1 ] && [ -n "${1:-}" ]; then
  N="$1"
else
  if [ "$MODE" = "smoke" ]; then N=1; else N=2; fi
fi

GREP_FLAG=""
if [ "$MODE" = "smoke" ]; then
  GREP_FLAG="--grep @smoke"
fi

# TOTAL defaults to N for local parallel runs; in CI TOTAL_SHARDS is provided.
TOTAL_SHARDS="${TOTAL_SHARDS:-$N}"

run_shard() {
  local idx="$1"
  local total="$2"
  echo ">> [shard $idx/$total] mode=$MODE"
  timeout 900 docker compose run --rm \
    -e "SHARD_INDEX=$idx" \
    -e "TOTAL_SHARDS=$total" \
    -e "TEST_MODE=$MODE" \
    e2e bash -c "set -e; if [ ! -x node_modules/.bin/playwright ]; then corepack enable && pnpm install --frozen-lockfile; fi; node_modules/.bin/playwright test --shard=$idx/$total $GREP_FLAG"
}

overall=0

if [ "${N:-1}" -gt 1 ]; then
  pids=()
  for i in $(seq 1 "$N"); do
    run_shard "$i" "$N" &
    pids+=("$!")
  done
  for pid in "${pids[@]}"; do
    wait "$pid" || overall=1
  done
else
  # Single shard: honour externally-provided SHARD_INDEX / TOTAL_SHARDS (CI matrix).
  run_shard "${SHARD_INDEX:-1}" "$TOTAL_SHARDS" || overall=1
fi

# In CI the shard job uploads blob-report as an artifact and a separate merge job
# produces the final report, so skip merge + cleanup here.
if [ "${CI:-}" = "true" ]; then
  echo ">> CI shard job complete; blob-report will be uploaded as an artifact."
  exit "$overall"
fi

# Local: merge the per-shard blob reports into a single HTML report, then clean up.
echo ">> merging shard reports into backups/report"
set +e
timeout 300 docker compose run --rm merge
merge_rc=$?
set -e

# Keep the shared node_modules_cache volume so subsequent local runs reuse the
# installed deps and never hit corepack/npm (which can hang when offline).
# Force a clean reinstall with: docker compose down -v
docker compose down --remove-orphans 2>/dev/null || true

if [ "$overall" -ne 0 ]; then
  echo "!! One or more shards failed."
  exit 1
fi
if [ "$merge_rc" -ne 0 ]; then
  echo "!! Report merge failed."
  exit 1
fi

echo ">> Done. Merged report at backups/report"
