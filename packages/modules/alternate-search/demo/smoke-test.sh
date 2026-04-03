#!/usr/bin/env bash
set -euo pipefail

# alternate-search demo smoke test
#
# Verifies all standard integration route shapes:
# - GET    /:index?q=...
# - GET    /:index?_action=stats
# - POST   /:index              (SearchQuery body)
# - POST   /:index?_action=index (bulk index body)
# - DELETE /:index?id=<docId>
#
# Usage:
#   ./demo/smoke-test.sh
#   BASE_URL=http://localhost:3000 ROUTE_PREFIX=/api/search ./demo/smoke-test.sh
#   ROUTE_PREFIX=/search ./demo/smoke-test.sh            # Nuxt default route in demos
#   INDEX=products ./demo/smoke-test.sh

BASE_URL="${BASE_URL:-http://localhost:3000}"
ROUTE_PREFIX="${ROUTE_PREFIX:-/api/search}"
INDEX="${INDEX:-products}"
CURL_TIMEOUT="${CURL_TIMEOUT:-10}"

# Normalize route prefix (single leading slash, no trailing slash)
ROUTE_PREFIX="/${ROUTE_PREFIX#/}"
ROUTE_PREFIX="${ROUTE_PREFIX%/}"

ENDPOINT="${BASE_URL}${ROUTE_PREFIX}/${INDEX}"
SMOKE_ID="smoke-doc-$(date +%s)"

pass() { printf "[PASS] %s\n" "$1"; }
fail() { printf "[FAIL] %s\n" "$1"; exit 1; }
info() { printf "[INFO] %s\n" "$1"; }

curl_json() {
  local method="$1"
  local url="$2"
  local body="${3:-}"

  if [[ -n "$body" ]]; then
    curl -sS -m "$CURL_TIMEOUT" -X "$method" "$url" \
      -H "content-type: application/json" \
      --data "$body" \
      -w "\n%{http_code}"
  else
    curl -sS -m "$CURL_TIMEOUT" -X "$method" "$url" \
      -w "\n%{http_code}"
  fi
}

assert_http_200() {
  local name="$1"
  local response="$2"
  local status
  status="$(printf "%s" "$response" | tail -n 1)"
  if [[ "$status" != "200" ]]; then
    printf "%s\n" "$response"
    fail "$name returned HTTP $status"
  fi
}

assert_contains() {
  local name="$1"
  local body="$2"
  local needle="$3"
  if ! printf "%s" "$body" | grep -q "$needle"; then
    printf "%s\n" "$body"
    fail "$name response does not contain expected token: $needle"
  fi
}

split_body() {
  # Prints response body without the final status line
  local response="$1"
  printf "%s" "$response" | sed '$d'
}

info "Running alternate-search smoke test"
info "BASE_URL=$BASE_URL"
info "ROUTE_PREFIX=$ROUTE_PREFIX"
info "INDEX=$INDEX"
info "ENDPOINT=$ENDPOINT"

# 1) GET query-string search
r1="$(curl_json GET "${ENDPOINT}?q=shoes")"
assert_http_200 "GET search" "$r1"
b1="$(split_body "$r1")"
assert_contains "GET search" "$b1" '"items"'
assert_contains "GET search" "$b1" '"total"'
pass "GET /:index?q=..."

# 2) GET stats
r2="$(curl_json GET "${ENDPOINT}?_action=stats")"
assert_http_200 "GET stats" "$r2"
b2="$(split_body "$r2")"
assert_contains "GET stats" "$b2" '"count"'
pass "GET /:index?_action=stats"

# 3) POST query body
r3="$(curl_json POST "$ENDPOINT" '{"q":"shoes","page":1,"pageSize":5}')"
assert_http_200 "POST query" "$r3"
b3="$(split_body "$r3")"
assert_contains "POST query" "$b3" '"items"'
assert_contains "POST query" "$b3" '"total"'
pass "POST /:index (SearchQuery body)"

# 4) POST bulk index
bulk_payload=$(cat <<JSON
{"documents":[{"id":"$SMOKE_ID","title":"Smoke Test Product","description":"indexed by smoke-test.sh","category":"testing","price":1.23}]}
JSON
)
r4="$(curl_json POST "${ENDPOINT}?_action=index" "$bulk_payload")"
assert_http_200 "POST bulk index" "$r4"
b4="$(split_body "$r4")"
assert_contains "POST bulk index" "$b4" '"success"'
pass "POST /:index?_action=index"

# 5) Verify newly indexed doc is searchable
r5="$(curl_json GET "${ENDPOINT}?q=Smoke%20Test%20Product")"
assert_http_200 "GET search (new doc)" "$r5"
b5="$(split_body "$r5")"
assert_contains "GET search (new doc)" "$b5" "$SMOKE_ID"
pass "Indexed smoke doc can be searched"

# 6) DELETE doc
r6="$(curl_json DELETE "${ENDPOINT}?id=${SMOKE_ID}")"
assert_http_200 "DELETE doc" "$r6"
b6="$(split_body "$r6")"
assert_contains "DELETE doc" "$b6" '"success"'
pass "DELETE /:index?id=<docId>"

printf "\nAll smoke checks passed for %s\n" "$ENDPOINT"
