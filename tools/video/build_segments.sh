#!/usr/bin/env bash
# ALHYDRA showreel — stage 1: normalise each source clip into a graded
# 1280x720 segment (portrait footage centred over its own blurred fill).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="${ALHYDRA_WORK:-$ROOT/.videowork}"
mkdir -p "$D"

SRC="$ROOT/public/vid"
OUT="$D/seg"
mkdir -p "$OUT"

# order | file | in-point | length | lower-third title | lower-third subtitle
SHOTS=(
  "01|VID_20260825_124836223.mp4|0.6|3.8|HYBRID MULTI TOWER|Solar + Wind + Algae + Hydroponics"
  "02|VID_20260825_124914512.mp4|1.4|3.6|DUAL-RENEWABLE CANOPY|Bifacial solar wings & VAWT turbine"
  "03|VID_20260825_125057591.mp4|1.0|3.6|CONTROL ENCLOSURE|ESP32 gateway, MPPT & battery bank"
  "04|VID_20260825_124849744.mp4|4.0|3.8|PHOTOBIOREACTOR TUBES|Chlorella sp. under 24/7 grow light"
  "05|VID_20260825_125017756.mp4|3.6|3.8|ALGAE CIRCULATION|Continuous airlift mixing"
  "06|VID_20260825_125114498.mp4|0.3|3.4|NUTRIENT RESERVOIR|Closed-loop NFT recirculation"
  "07|VID_20260825_125151409.mp4|1.0|3.6|VERTICAL GROW COLUMN|32 net-pots in a helical pitch"
  "08|VID_20260825_124944983.mp4|3.0|3.8|LEAFY GREENS|Lactuca sativa, day 24"
  "09|VID_20260825_125133784.mp4|1.4|3.4|CANOPY DETAIL|Healthy turgor, no tip-burn"
  "10|VID_20260825_125009783.mp4|0.1|1.9|GROW LIGHT SPECTRUM|Full-spectrum + blue accent"
  "11|VID_20260825_125201140.mp4|3.0|3.8|SYSTEM IN OPERATION|8 sensors streaming to the cloud"
  "12|VID_20260825_125217731.mp4|2.0|3.8|ALHYDRA|Monitored live at alhydra-id.web.app"
)

# Brand grade + composition:
#   bg  : source blown up to fill 1280x720, blurred, darkened, slow drift
#   fg  : source fitted to 720 height, contrast/saturation lift, sharpened
#   trim: rounded feather + vignette + brand gradient wash
for row in "${SHOTS[@]}"; do
  IFS='|' read -r idx file ss len title sub <<< "$row"
  echo ">> segment $idx  <- $file  @${ss}s +${len}s"

  ffmpeg -v error -y -ss "$ss" -t "$len" -i "$SRC/$file" \
    -filter_complex "
      [0:v]fps=30,format=yuv420p,split=2[bgsrc][fgsrc];

      [bgsrc]scale=1280:-2,crop=1280:720,
             gblur=sigma=26,
             eq=brightness=-0.16:saturation=0.55:contrast=1.02,
             colorbalance=rs=-0.05:bs=0.10:gm=0.03,
             zoompan=z='min(zoom+0.0009,1.14)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=30
             [bg];

      [fgsrc]scale=-2:720,crop='min(iw,540)':720,
             eq=contrast=1.10:saturation=1.16:brightness=0.012:gamma=1.02,
             unsharp=5:5:0.45:5:5:0.0,
             colorbalance=rs=-0.02:gs=0.02:bs=0.04
             [fg];

      [bg][fg]overlay=x='(W-w)/2':y=0:shortest=1[comp];

      [comp]vignette=angle=PI/5:mode=forward,
            drawbox=x=0:y=0:w=1280:h=720:color=#04121A@0.10:t=fill,
            format=yuv420p[graded]
    " \
    -map "[graded]" -an \
    -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 \
    "$OUT/seg_$idx.mp4"
done

echo "ALL SEGMENTS DONE"
ls -la "$OUT"
