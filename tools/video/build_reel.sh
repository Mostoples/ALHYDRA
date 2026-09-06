#!/usr/bin/env bash
# ALHYDRA showreel — stage 2: brand cards, lower thirds, xfade assembly, web encodes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="${ALHYDRA_WORK:-$ROOT/.videowork}"
mkdir -p "$D"

SEG="$D/seg"
OUT="$ROOT/public/media"
mkdir -p "$OUT"
# drawtext cannot take a Windows drive-letter path (the colon is a filter
# separator), so stage the faces next to the work files and cd in.
for pair in "font-black.ttf:seguibl.ttf" "font-bold.ttf:segoeuib.ttf" "font-reg.ttf:segoeui.ttf"; do
  dst="${pair%%:*}"; src="${pair##*:}"
  [ -f "$D/$dst" ] || cp "${WINDIR:-/c/Windows}/Fonts/$src" "$D/$dst" 2>/dev/null     || cp "/c/Windows/Fonts/$src" "$D/$dst"
done
cd "$D"

FB="font-black.ttf"
FS="font-bold.ttf"
FR="font-reg.ttf"

# ── Title card ───────────────────────────────────────────────
ffmpeg -v error -y \
  -f lavfi -i "gradients=s=1280x720:c0=#04121A:c1=#0A2430:c2=#04121A:x0=200:y0=0:x1=1080:y1=720:d=6:n=3,fps=30,trim=duration=2.6" \
  -filter_complex "
    [0:v]
    drawbox=x=0:y=352:w=1280:h=2:color=#10B981@0.0:t=fill,
    drawtext=fontfile=$FS:text='H Y B R I D   M U L T I   T O W E R   C U L T I V A T I O N':
      fontcolor=#5EEAD4@0.85:fontsize=17:x=(w-text_w)/2:y=250:alpha='min(1,max(0,(t-0.15)*2.2))',
    drawtext=fontfile=$FB:text='ALHYDRA':
      fontcolor=white:fontsize=104:x=(w-text_w)/2:y=286:alpha='min(1,max(0,(t-0.35)*2.0))',
    drawbox=x='640-140*min(1,max(0,(t-0.7)*1.6))':y=412:w='280*min(1,max(0,(t-0.7)*1.6))':h=3:color=#10B981:t=fill,
    drawtext=fontfile=$FR:text='Algae-Hydroponic Dual-Renewable Apparatus':
      fontcolor=#CBD5E1:fontsize=26:x=(w-text_w)/2:y=442:alpha='min(1,max(0,(t-0.9)*2.0))',
    drawtext=fontfile=$FS:text='Solar + Wind  |  8 Sensors  |  AIoT Cloud Monitoring':
      fontcolor=#94A3B8:fontsize=19:x=(w-text_w)/2:y=492:alpha='min(1,max(0,(t-1.15)*2.0))',
    vignette=angle=PI/4.5,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -t 2.6 "$D/card_in.mp4"
echo ">> title card ok"

# ── End card ─────────────────────────────────────────────────
ffmpeg -v error -y \
  -f lavfi -i "gradients=s=1280x720:c0=#04121A:c1=#08202C:c2=#04121A:x0=1080:y0=0:x1=200:y1=720:d=6:n=3,fps=30,trim=duration=3.2" \
  -filter_complex "
    [0:v]
    drawtext=fontfile=$FB:text='ALHYDRA':
      fontcolor=white:fontsize=76:x=(w-text_w)/2:y=252:alpha='min(1,max(0,(t-0.1)*2.2))',
    drawbox=x='640-110*min(1,max(0,(t-0.45)*1.8))':y=348:w='220*min(1,max(0,(t-0.45)*1.8))':h=3:color=#10B981:t=fill,
    drawtext=fontfile=$FR:text='Real-time monitoring dashboard':
      fontcolor=#CBD5E1:fontsize=25:x=(w-text_w)/2:y=376:alpha='min(1,max(0,(t-0.6)*2.0))',
    drawtext=fontfile=$FS:text='alhydra-id.web.app':
      fontcolor=#10B981:fontsize=34:x=(w-text_w)/2:y=428:alpha='min(1,max(0,(t-0.85)*2.0))',
    vignette=angle=PI/4.5,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -t 3.2 "$D/card_out.mp4"
echo ">> end card ok"

# ── Assembly ─────────────────────────────────────────────────
# name | duration | lower-third title | lower-third subtitle
CLIPS=(
  "card_in.mp4|2.6||"
  "seg/seg_01.mp4|3.8|HYBRID MULTI TOWER|Solar + wind + algae + hydroponics"
  "seg/seg_02.mp4|3.6|DUAL-RENEWABLE CANOPY|Solar wings & vertical-axis turbine"
  "seg/seg_03.mp4|3.6|CONTROL ENCLOSURE|ESP32 gateway, MPPT & battery bank"
  "seg/seg_04.mp4|3.8|PHOTOBIOREACTOR TUBES|Microalgae under full-spectrum light"
  "seg/seg_05.mp4|3.8|ALGAE CIRCULATION|Continuous airlift mixing"
  "seg/seg_06.mp4|3.4|NUTRIENT RESERVOIR|Closed-loop recirculation"
  "seg/seg_07.mp4|3.6|VERTICAL GROW COLUMN|Net-pots on a helical pitch"
  "seg/seg_08.mp4|3.8|LEAFY GREENS|Hydroponic lettuce canopy"
  "seg/seg_09.mp4|3.4|CANOPY DETAIL|Healthy turgor, no tip-burn"
  "seg/seg_10.mp4|1.9|GROW LIGHT|Full-spectrum with blue accent"
  "seg/seg_11.mp4|3.8|SYSTEM IN OPERATION|8 sensors streaming to the cloud"
  "seg/seg_12.mp4|3.8|MONITOR IT LIVE|alhydra-id.web.app"
  "card_out.mp4|3.2||"
)
TRANS=(fade smoothleft circleopen wipeup dissolve smoothright fadeblack circlecrop slideup dissolve wipeleft radial fadeblack)
T=0.7

FILT="$D/reel.filter"
: > "$FILT"
INPUTS=()
n=${#CLIPS[@]}

for i in $(seq 0 $((n-1))); do
  IFS='|' read -r file dur title sub <<< "${CLIPS[$i]}"
  INPUTS+=(-i "$D/$file")
  if [ -z "$title" ]; then
    # cards: brand watermark only is unnecessary — pass through
    echo "[$i:v]setpts=PTS-STARTPTS,format=yuv420p[c$i];" >> "$FILT"
  else
    # persistent brand lockup + timed lower third
    end=$(awk -v d="$dur" 'BEGIN{printf "%.2f", d-0.45}')
    {
      echo -n "[$i:v]setpts=PTS-STARTPTS,"
      echo -n "drawbox=x=48:y=42:w=3:h=24:color=#10B981:t=fill,"
      echo -n "drawtext=fontfile=$FS:text='ALHYDRA':fontcolor=white@0.92:fontsize=21:x=60:y=42:shadowcolor=black@0.55:shadowx=1:shadowy=1,"
      echo -n "drawbox=x=48:y=558:w=4:h=58:color=#10B981@0.95:t=fill:enable='between(t,0.35,$end)',"
      echo -n "drawtext=fontfile=$FS:text='$title':fontcolor=white:fontsize=31:x=68:y=556:shadowcolor=black@0.65:shadowx=2:shadowy=2:alpha='if(between(t,0.35,$end),min(1,(t-0.35)*3.5),0)',"
      echo -n "drawtext=fontfile=$FR:text='$sub':fontcolor=#A7F3D0:fontsize=19:x=68:y=596:shadowcolor=black@0.65:shadowx=2:shadowy=2:alpha='if(between(t,0.5,$end),min(1,(t-0.5)*3.5),0)',"
      echo "format=yuv420p[c$i];"
    } >> "$FILT"
  fi
done

# chain the xfades
prev="[c0]"
IFS='|' read -r _f cum _t _s <<< "${CLIPS[0]}"
for i in $(seq 1 $((n-1))); do
  IFS='|' read -r _f dur _t _s <<< "${CLIPS[$i]}"
  off=$(awk -v c="$cum" -v t="$T" 'BEGIN{printf "%.3f", c-t}')
  tr=${TRANS[$(( (i-1) % ${#TRANS[@]} ))]}
  if [ "$i" -eq $((n-1)) ]; then lbl="[vout]"; else lbl="[x$i]"; fi
  echo "${prev}[c$i]xfade=transition=$tr:duration=$T:offset=$off$lbl;" >> "$FILT"
  prev="$lbl"
  cum=$(awk -v c="$cum" -v d="$dur" -v t="$T" 'BEGIN{printf "%.3f", c+d-t}')
done
# strip trailing semicolon of last line
sed -i '$ s/;$//' "$FILT"
echo ">> filtergraph built ($(wc -l < "$FILT") lines), timeline = ${cum}s"

ffmpeg -v error -y "${INPUTS[@]}" -/filter_complex "$FILT" \
  -map "[vout]" -an \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -r 30 \
  -profile:v high -level 4.0 -movflags +faststart \
  -x264-params "keyint=60:min-keyint=30" \
  "$OUT/alhydra-showreel.mp4"
echo ">> mp4 done"

ffmpeg -v error -y -i "$OUT/alhydra-showreel.mp4" \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -cpu-used 3 -pix_fmt yuv420p -an \
  "$OUT/alhydra-showreel.webm"
echo ">> webm done"

ffmpeg -v error -y -ss 4.4 -i "$OUT/alhydra-showreel.mp4" -frames:v 1 -q:v 3 "$OUT/showreel-poster.jpg"

ls -la "$OUT"
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$OUT/alhydra-showreel.mp4"
echo "REEL COMPLETE"
