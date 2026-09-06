#!/usr/bin/env bash
# ALHYDRA — capture the live dashboard UI for the app tour video.
#
# Serves public/ locally, then drives headless Chrome through each view twice:
#   chrome_<view>.png  1440x900   the app frame as a user sees it
#   full_<view>.png    1440x2600  the same view with the content column
#                                 expanded to its natural height
# and records each view's real content height in heights.tsv.
#
# Uses public/__cap.html, a capture-only harness that unhides the app shell and
# switches on Demo Mode so the sensor cards carry plausible values.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="${ALHYDRA_WORK:-$ROOT/.videowork}"
SHOTS="$D/app"
PORT="${PORT:-5599}"
mkdir -p "$SHOTS"

CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME (set CHROME=...)"; exit 1; }
[ -f "$ROOT/public/__cap.html" ] || { echo "missing public/__cap.html capture harness"; exit 1; }

VIEWS=(dashboard ai control impact encyclopedia alerts settings)

started=0
if ! curl -sf -o /dev/null "http://127.0.0.1:$PORT/app.html"; then
  (cd "$ROOT/public" && python -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &)
  started=1
  for _ in $(seq 1 20); do curl -sf -o /dev/null "http://127.0.0.1:$PORT/app.html" && break; sleep 0.5; done
fi

shot () { "$CHROME" --headless --disable-gpu --hide-scrollbars \
            --virtual-time-budget=11000 --screenshot="$1" --window-size="$2" "$3" 2>/dev/null >/dev/null; }

for v in "${VIEWS[@]}"; do
  base="http://127.0.0.1:$PORT/__cap.html?v=$v"
  shot "$SHOTS/chrome_$v.png" 1440,900  "$base&h=900&mode=chrome"
  shot "$SHOTS/full_$v.png"   1440,2600 "$base&h=2600&mode=view"
  echo ">> captured $v"
done

# Heights come from the pixels, not the DOM: #content is a stretched flex
# child so it reports the window height, and a second probe run can land on a
# different route than the screenshot did.
python "$ROOT/tools/video/measure_shots.py" "$SHOTS"

[ "$started" = 1 ] && echo "(local server left running on :$PORT)"
echo "CAPTURE COMPLETE -> $SHOTS"
