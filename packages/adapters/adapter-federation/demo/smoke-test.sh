#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
DEMO_PATH="${DEMO_PATH:-/federation-demo}"

URL="${BASE_URL%/}${DEMO_PATH}"

echo "[adapter-federation smoke] Checking demo route: ${URL}"

status=$(curl -sS -o /tmp/adapter-federation-smoke.html -w "%{http_code}" "$URL")

if [[ "$status" != "200" ]]; then
  echo "[adapter-federation smoke] FAIL: expected HTTP 200, got ${status}"
  exit 1
fi

if ! grep -qi "adapter-federation demo" /tmp/adapter-federation-smoke.html; then
  echo "[adapter-federation smoke] FAIL: response did not contain expected demo marker text"
  exit 1
fi

echo "[adapter-federation smoke] PASS: demo route is reachable and returned expected content"
