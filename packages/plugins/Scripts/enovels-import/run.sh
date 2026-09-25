#!/usr/bin/env bash
##############################################################################
# Import Elite Novels chapter documents (.docx) into the novels Directus.
#
# Usage:
#   ./run.sh preview <kind>...   parse + plan only; writes CSVs, touches nothing
#   ./run.sh dry     <kind>...   also resolves everything against Directus, no writes
#   ./run.sh apply   <kind>...   performs the import and saves a rollback log
#
# kinds: characters places items dictionary heroes mythology monsters categorize (default: all, in that order)
#   categorize = give every ability/item/place/dictionary entry its option in the matching category
#
# Env overrides:
#   CONTAINER=novelsDirectus  DOCS=docs/enovels-documents  OUT=$DOCS/import-preview
##############################################################################
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../../.." && pwd)"
MODE="${1:-preview}"; shift || true
if [ $# -gt 0 ]; then KINDS=("$@"); else KINDS=(characters places items dictionary heroes mythology monsters categorize); fi
CONTAINER="${CONTAINER:-novelsDirectus}"
DOCS="${DOCS:-$ROOT/docs/enovels-documents}"
OUT="${OUT:-$DOCS/import-preview}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

case "$MODE" in preview|dry|apply) ;; *) echo "usage: $0 preview|dry|apply [kind...]" >&2; exit 2 ;; esac
mkdir -p "$OUT"

cleanup_container() {
  # docker cp writes as root; the image has no shell, so remove via node as root.
  docker exec -u 0 "$CONTAINER" node -e 'for (const f of ["/tmp/enovels-plan.json","/tmp/import_exec.js","/tmp/categorize_exec.js"]) try { require("fs").unlinkSync(f) } catch {}' || true
}

for kind in "${KINDS[@]}"; do
  echo "== $kind"
  if [ "$kind" = categorize ]; then
    [ "$MODE" = preview ] && continue
    docker cp "$HERE/categorize_exec.js" "$CONTAINER:/tmp/categorize_exec.js" >/dev/null
    log="$OUT/import-log-$kind-$MODE-$(date +%Y%m%d-%H%M%S).json"
    if ! docker exec -e MODE="$MODE" -e PARALLEL="${PARALLEL:-1}" "$CONTAINER" node /tmp/categorize_exec.js > "$log"; then
      cleanup_container; echo "failed; partial log: $log" >&2; exit 1
    fi
    cleanup_container
    [ "$MODE" = dry ] && rm -f "$log" || echo "   log: $log"
    continue
  fi
  python3 "$HERE/parse_docs.py" "$kind" "$DOCS" "$WORK/parsed-$kind.json"
  python3 "$HERE/plan.py" "$WORK/parsed-$kind.json" "$WORK/plan-$kind.json" "$OUT/$kind-preview.csv"
  [ "$MODE" = preview ] && continue

  docker cp "$WORK/plan-$kind.json" "$CONTAINER:/tmp/enovels-plan.json" >/dev/null
  docker cp "$HERE/import_exec.js" "$CONTAINER:/tmp/import_exec.js" >/dev/null
  log="$OUT/import-log-$kind-$MODE-$(date +%Y%m%d-%H%M%S).json"
  if ! docker exec -e MODE="$MODE" "$CONTAINER" node /tmp/import_exec.js > "$log"; then
    cleanup_container; echo "failed; partial log: $log" >&2; exit 1
  fi
  cleanup_container
  [ "$MODE" = dry ] && rm -f "$log" || echo "   log: $log"
done
