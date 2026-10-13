#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! curl -sf "http://127.0.0.1:8081/status" >/dev/null; then
  echo "Metro is not running on http://127.0.0.1:8081"
  echo "Start it first: npm start"
  exit 1
fi

resolve_ios_simulator() {
  local arg="${1:-}"

  if [[ -n "$arg" && "$arg" != "booted" ]]; then
    echo "$arg"
    return
  fi

  # "booted" is ambiguous when a watch + phone are both booted (simctl error 115).
  local udid
  udid="$(xcrun simctl list devices booted 2>/dev/null | rg -i "iPhone|iPad" | head -1 | rg -o '[A-F0-9-]{36}' || true)"

  if [[ -z "$udid" ]]; then
    echo "No booted iPhone/iPad simulator. Boot one in Device Hub or run:" >&2
    echo "  npm run ios:sim -- --device \"iPhone 17\"" >&2
    exit 1
  fi

  echo "$udid"
}

DEVICE="$(resolve_ios_simulator "${1:-booted}")"
BUNDLE_ID="com.vignesh12.eatmeapp"
URL="exp+eat-me-app://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081"

if ! xcrun simctl get_app_container "$DEVICE" "$BUNDLE_ID" >/dev/null 2>&1; then
  echo "Eat Me dev client is not installed on this simulator ($DEVICE)."
  echo "Run: npm run ios:sim -- --device \"iPhone 17\""
  exit 1
fi

xcrun simctl launch "$DEVICE" "$BUNDLE_ID" >/dev/null 2>&1 || true
xcrun simctl openurl "$DEVICE" "$URL"
echo "Opened $BUNDLE_ID → http://127.0.0.1:8081 (simulator: $DEVICE)"
