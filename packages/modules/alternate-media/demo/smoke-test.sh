#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
DEMO_PATH="${DEMO_PATH:-/media-demo}"

URL="${BASE_URL%/}${DEMO_PATH}"

echo "[alternate-media smoke] Checking demo route: ${URL}"

status=$(curl -sS -o /tmp/alternate-media-smoke.html -w "%{http_code}" "$URL")

if [[ "$status" != "200" ]]; then
  echo "[alternate-media smoke] FAIL: expected HTTP 200, got ${status}"
  exit 1
fi

if ! grep -qi "alternate-media demo" /tmp/alternate-media-smoke.html; then
  echo "[alternate-media smoke] FAIL: response did not contain expected demo marker text"
  exit 1
fi

echo "[alternate-media smoke] PASS: demo route is reachable and returned expected content"
