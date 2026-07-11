#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${AUTH_SMOKE_BASE_URL:-http://127.0.0.1:3002}"
EMAIL="${AUTH_SMOKE_EMAIL:-}"
PASSWORD="${AUTH_SMOKE_PASSWORD:-}"

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Missing credentials. Set AUTH_SMOKE_EMAIL and AUTH_SMOKE_PASSWORD."
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

remember_headers="$tmp_dir/remember.headers"
remember_cookie="$tmp_dir/remember.cookie"
remember_body="$tmp_dir/remember.body"

session_headers="$tmp_dir/session.headers"
session_cookie="$tmp_dir/session.cookie"
session_body="$tmp_dir/session.body"

curl --fail --silent --show-error \
  -D "$remember_headers" \
  -o "$remember_body" \
  -c "$remember_cookie" \
  -H 'content-type: application/json' \
  -X POST "$BASE_URL/api/auth/adapter/sign-in" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"rememberMe\":true}"

grep -qi '^content-type: application/json' "$remember_headers"
grep -qi '^set-cookie: auth-token=.*Max-Age=' "$remember_headers"
grep -q '"session"' "$remember_body"

remember_session_json="$(curl --fail --silent --show-error -b "$remember_cookie" "$BASE_URL/api/auth/adapter/session")"
echo "$remember_session_json" | grep -q '"user"'
echo "$remember_session_json" | grep -q "$EMAIL"

curl --fail --silent --show-error \
  -D "$session_headers" \
  -o "$session_body" \
  -c "$session_cookie" \
  -H 'content-type: application/json' \
  -X POST "$BASE_URL/api/auth/adapter/sign-in" \
  --data "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"rememberMe\":false}"

grep -qi '^content-type: application/json' "$session_headers"
grep -qi '^set-cookie: auth-token=' "$session_headers"
if grep -qi '^set-cookie: auth-token=.*Max-Age=' "$session_headers"; then
  echo "Expected session cookie without Max-Age when rememberMe=false"
  exit 1
fi
grep -q '"session"' "$session_body"

session_json="$(curl --fail --silent --show-error -b "$session_cookie" "$BASE_URL/api/auth/adapter/session")"
echo "$session_json" | grep -q '"user"'
echo "$session_json" | grep -q "$EMAIL"

echo "Auth smoke test passed for rememberMe=true/false at $BASE_URL"