#!/usr/bin/env bash
# ALHYDRA — app tour showreel.
#
# Builds a scrolling screencast of the live dashboard from stills captured by
# tools/video/capture_app.sh. Each view is composed as:
#
#   chrome_<view>.png   static app frame (sidebar + topbar, correct breadcrumb)
#   full_<view>.png     the same view rendered at its natural full height
#
# The content column (x=240, w=1200) is cropped out of the tall render and
# scrolled inside the frame's content area (240,60 · 1200x840), so the sidebar
# and topbar stay pinned exactly as they do in the real app.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="${ALHYDRA_WORK:-$ROOT/.videowork}"
SHOTS="$D/app"
OUT="$ROOT/public/media"
mkdir -p "$OUT" "$SHOTS"

for pair in "font-black.ttf:seguibl.ttf" "font-bold.ttf:segoeuib.ttf" "font-reg.ttf:segoeui.ttf"; do
  dst="${pair%%:*}"; src="${pair##*:}"
  [ -f "$D/$dst" ] || cp "/c/Windows/Fonts/$src" "$D/$dst"
done
cd "$D"
FB="font-black.ttf"; FS="font-bold.ttf"; FR="font-reg.ttf"

W=1600; H=900          # 16:9 canvas; the 1440-wide app sits centred at x=80
AX=80                  # app x-offset inside the canvas
CW=1200; CH=840        # content viewport inside the app frame
CX=240;  CY=60         # content origin inside the app frame
TOPBAR=60              # the tall capture also contains the topbar at y<60
BG='#070E16'
T=0.6                  # xfade length

# view | full-render height | title | subtitle
# view | seconds | title | subtitle
# Long views get more time so the scroll stays unhurried; short ones are a
# quick beat rather than seconds of a static frame.
VIEWS=(
  "dashboard|4.6|Live Dashboard|Eight sensor channels, updating in real time"
  "control|3.2|Control Panel|Drive the irrigation pumps from anywhere"
  "ai|4.6|AI Insights|Health score, forecasting and anomaly detection"
  "impact|3.4|Environmental Impact|CO2 avoided, carbon captured, water saved"
  "encyclopedia|3.4|Encyclopedia|Crop and microalgae reference library"
  "alerts|3.0|Alert Center|Every threshold breach, logged and triaged"
  "settings|5.0|Settings|Thresholds, IoT integration and profile"
)

height_of () {  # full-render content height, from capture_app.sh
  awk -F'\t' -v v="$1" '$1==v {print $2}' "$SHOTS/heights.tsv"
}

# ── Intro / outro cards ─────────────────────────────────────
ffmpeg -v error -y -f lavfi \
  -i "gradients=s=${W}x${H}:c0=#04121A:c1=#0B2733:c2=#04121A:x0=260:y0=0:x1=1340:y1=900:d=6:n=3,fps=30,trim=duration=2.8" \
  -filter_complex "
    [0:v]
    drawtext=fontfile=$FS:text='T H E   D A S H B O A R D':fontcolor=#5EEAD4@0.9:fontsize=20:
      x=(w-text_w)/2:y=318:alpha='min(1,max(0,(t-0.15)*2.2))',
    drawtext=fontfile=$FB:text='ALHYDRA':fontcolor=white:fontsize=112:
      x=(w-text_w)/2:y=356:alpha='min(1,max(0,(t-0.35)*2.0))',
    drawbox=x='800-150*min(1,max(0,(t-0.7)*1.6))':y=498:w='300*min(1,max(0,(t-0.7)*1.6))':h=3:color=#10B981:t=fill,
    drawtext=fontfile=$FR:text='Real-time monitoring, control and analytics in the browser':
      fontcolor=#CBD5E1:fontsize=27:x=(w-text_w)/2:y=530:alpha='min(1,max(0,(t-0.9)*2.0))',
    vignette=angle=PI/4.5,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -t 2.8 "$D/tour_in.mp4"
echo ">> intro card ok"

ffmpeg -v error -y -f lavfi \
  -i "gradients=s=${W}x${H}:c0=#04121A:c1=#08222E:c2=#04121A:x0=1340:y0=0:x1=260:y1=900:d=6:n=3,fps=30,trim=duration=3.2" \
  -filter_complex "
    [0:v]
    drawtext=fontfile=$FB:text='ALHYDRA':fontcolor=white:fontsize=80:
      x=(w-text_w)/2:y=330:alpha='min(1,max(0,(t-0.1)*2.2))',
    drawbox=x='800-115*min(1,max(0,(t-0.45)*1.8))':y=436:w='230*min(1,max(0,(t-0.45)*1.8))':h=3:color=#10B981:t=fill,
    drawtext=fontfile=$FR:text='Open the dashboard in your browser':fontcolor=#CBD5E1:fontsize=26:
      x=(w-text_w)/2:y=466:alpha='min(1,max(0,(t-0.6)*2.0))',
    drawtext=fontfile=$FS:text='alhydra-id.web.app/app':fontcolor=#10B981:fontsize=36:
      x=(w-text_w)/2:y=520:alpha='min(1,max(0,(t-0.85)*2.0))',
    vignette=angle=PI/4.5,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -r 30 -t 3.2 "$D/tour_out.mp4"
echo ">> outro card ok"

# ── One scrolling segment per view ──────────────────────────
for row in "${VIEWS[@]}"; do
  IFS='|' read -r v dur title sub <<< "$row"
  vh=$(height_of "$v"); vh=${vh:-900}
  # The tall capture includes the topbar, which the frame already provides —
  # start the crop below it, or the finished frame shows two topbars.
  travel=$(( vh - TOPBAR - CH )); [ "$travel" -lt 0 ] && travel=0
  echo ">> segment $v (content ${vh}px, scroll ${travel}px)"

  # ease: hold 0.7s, scroll, hold 0.8s
  YEXPR="$TOPBAR+max(0,min(1,(t-0.7)/($dur-1.5)))*$travel"

  ffmpeg -v error -y \
    -loop 1 -t "$dur" -i "$SHOTS/chrome_$v.png" \
    -loop 1 -t "$dur" -i "$SHOTS/full_$v.png" \
    -filter_complex "
      [1:v]crop=$CW:$CH:$CX:'$YEXPR',format=rgba[scr];
      [0:v]format=rgba[frame];
      [frame][scr]overlay=$CX:$CY:shortest=1[app];
      [app]pad=$W:$H:$AX:0:color=$BG,
           drawbox=x=$AX:y=0:w=1440:h=$H:color=#1E3A4A@0.8:t=2,
           drawbox=x=$((AX+CX+18)):y=730:w=632:h=84:color=#04121A@0.9:t=fill,
           drawbox=x=$((AX+CX+18)):y=730:w=4:h=84:color=#10B981:t=fill,
           drawtext=fontfile=$FS:text='$title':fontcolor=white:fontsize=30:
             x=$((AX+CX+44)):y=746:shadowcolor=black@0.8:shadowx=1:shadowy=1,
           drawtext=fontfile=$FR:text='$sub':fontcolor=#A7F3D0:fontsize=19:
             x=$((AX+CX+44)):y=784:shadowcolor=black@0.8:shadowx=1:shadowy=1,
           format=yuv420p[out]" \
    -map "[out]" -an -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 \
    "$D/tour_$v.mp4"
done

# ── Assemble ────────────────────────────────────────────────
FILT="$D/tour.filter"; : > "$FILT"
INPUTS=(-i "$D/tour_in.mp4")
DURS=(2.8)
for row in "${VIEWS[@]}"; do
  IFS='|' read -r v dur _t _s <<< "$row"
  INPUTS+=(-i "$D/tour_$v.mp4"); DURS+=("$dur")
done
INPUTS+=(-i "$D/tour_out.mp4"); DURS+=(3.2)

TRANS=(fade smoothup dissolve smoothleft fadeblack dissolve smoothright fade)
n=${#DURS[@]}
for i in $(seq 0 $((n-1))); do echo "[$i:v]setpts=PTS-STARTPTS,format=yuv420p[c$i];" >> "$FILT"; done

prev="[c0]"; cum=${DURS[0]}
for i in $(seq 1 $((n-1))); do
  off=$(awk -v c="$cum" -v t="$T" 'BEGIN{printf "%.3f", c-t}')
  tr=${TRANS[$(( (i-1) % ${#TRANS[@]} ))]}
  if [ "$i" -eq $((n-1)) ]; then lbl="[vout]"; else lbl="[x$i]"; fi
  echo "${prev}[c$i]xfade=transition=$tr:duration=$T:offset=$off$lbl;" >> "$FILT"
  prev="$lbl"
  cum=$(awk -v c="$cum" -v d="${DURS[$i]}" -v t="$T" 'BEGIN{printf "%.3f", c+d-t}')
done
sed -i '$ s/;$//' "$FILT"
echo ">> timeline = ${cum}s"

ffmpeg -v error -y "${INPUTS[@]}" -/filter_complex "$FILT" -map "[vout]" -an \
  -c:v libx264 -preset slow -crf 25 -pix_fmt yuv420p -r 30 \
  -profile:v high -level 4.0 -movflags +faststart -x264-params "keyint=60:min-keyint=30" \
  "$OUT/alhydra-apptour.mp4"
echo ">> mp4 done"

ffmpeg -v error -y -i "$OUT/alhydra-apptour.mp4" \
  -c:v libvpx-vp9 -crf 38 -b:v 0 -row-mt 1 -cpu-used 3 -pix_fmt yuv420p -an \
  "$OUT/alhydra-apptour.webm"
echo ">> webm done"

ffmpeg -v error -y -ss 4.2 -i "$OUT/alhydra-apptour.mp4" -frames:v 1 -q:v 3 "$OUT/apptour-poster.jpg"

ls -la "$OUT"/alhydra-apptour.* "$OUT"/apptour-poster.jpg
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/alhydra-apptour.mp4"
echo "APP TOUR COMPLETE"
