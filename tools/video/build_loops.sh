#!/usr/bin/env bash
# ALHYDRA — stage 3: decorative loops derived from the same footage.
#   ambient  : landscape hero backdrop, desaturated + darkened, seamless
#   column   : portrait strip for the phone mock / vertical decor panels
#   texture  : tiny abstract algae-bokeh loop used as a section texture
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
D="${ALHYDRA_WORK:-$ROOT/.videowork}"
mkdir -p "$D"

SRC="$ROOT/public/vid"
OUT="$ROOT/public/media"
cd "$D"

seamless () {  # $1 in  $2 out  $3 fade   — crossfade the tail back over the head
  local IN="$1" OUT_F="$2" F="$3"
  local DUR; DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
  local BODY; BODY=$(awk -v d="$DUR" -v f="$F" 'BEGIN{printf "%.3f", d-f}')
  ffmpeg -v error -y -i "$IN" -i "$IN" -filter_complex \
    "[0:v]trim=0:$BODY,setpts=PTS-STARTPTS[a];
     [1:v]trim=$BODY:$DUR,setpts=PTS-STARTPTS[t];
     [0:v]trim=0:$F,setpts=PTS-STARTPTS[h];
     [t][h]blend=all_expr='A*(1-(T/$F))+B*(T/$F)'[x];
     [a][x]concat=n=2:v=1:a=0[v]" \
    -map "[v]" -an -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$OUT_F"
}

# ── 1. Ambient hero backdrop (landscape, 18s) ───────────────
#     three slow-moving plates cross-dissolved, pushed toward the brand teal
for p in "01 VID_20260825_124849744.mp4 3.0" "02 VID_20260825_125017756.mp4 4.0" "03 VID_20260825_125201140.mp4 3.5"; do
  set -- $p
  ffmpeg -v error -y -ss "$3" -t 7 -i "$SRC/$2" -filter_complex "
    [0:v]fps=25,scale=1600:-2,crop=1280:720,
         eq=brightness=-0.22:saturation=0.42:contrast=1.06,
         colorbalance=rs=-0.08:gs=0.02:bs=0.14:rm=-0.04:bm=0.08,
         gblur=sigma=5,
         zoompan=z='min(zoom+0.0006,1.12)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1280x720:fps=25,
         vignette=angle=PI/3.6,format=yuv420p[v]" \
    -map "[v]" -an -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p "$D/amb_$1.mp4"
done
ffmpeg -v error -y -i "$D/amb_01.mp4" -i "$D/amb_02.mp4" -i "$D/amb_03.mp4" -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=1.4:offset=5.6[x];
   [x][2:v]xfade=transition=fade:duration=1.4:offset=11.2[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p "$D/amb_raw.mp4"
seamless "$D/amb_raw.mp4" "$OUT/alhydra-ambient.mp4" 1.6
ffmpeg -v error -y -i "$OUT/alhydra-ambient.mp4" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -cpu-used 4 -an "$OUT/alhydra-ambient.webm"
ffmpeg -v error -y -ss 2 -i "$OUT/alhydra-ambient.mp4" -frames:v 1 -q:v 4 "$OUT/ambient-poster.jpg"
echo ">> ambient done"

# ── 2. Portrait column loop (for the phone mock / vertical decor) ──
ffmpeg -v error -y -ss 2.5 -t 9 -i "$SRC/VID_20260825_124944983.mp4" -filter_complex "
  [0:v]fps=25,scale=-2:960,crop=540:960,
       eq=contrast=1.10:saturation=1.14:brightness=0.01,
       unsharp=5:5:0.4:5:5:0,
       vignette=angle=PI/4.2,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p "$D/col_raw.mp4"
seamless "$D/col_raw.mp4" "$OUT/alhydra-column.mp4" 1.2
ffmpeg -v error -y -ss 1 -i "$OUT/alhydra-column.mp4" -frames:v 1 -q:v 4 "$OUT/column-poster.jpg"
echo ">> column done"

# ── 3. Abstract algae texture (heavily defocused, tiny) ─────
ffmpeg -v error -y -ss 4 -t 8 -i "$SRC/VID_20260825_125017756.mp4" -filter_complex "
  [0:v]fps=20,scale=640:-2,crop=640:360,
       gblur=sigma=18,
       eq=brightness=-0.10:saturation=1.5:contrast=1.15,
       colorbalance=gs=0.10:bs=0.06,format=yuv420p[v]" \
  -map "[v]" -an -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p "$D/tex_raw.mp4"
seamless "$D/tex_raw.mp4" "$OUT/alhydra-texture.mp4" 1.4
echo ">> texture done"

ls -la "$OUT"
for f in "$OUT"/*.mp4 "$OUT"/*.webm; do
  printf "%-34s %s  %ss\n" "$(basename "$f")" "$(du -h "$f" | cut -f1)" \
    "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" | cut -c1-5)"
done
echo "LOOPS COMPLETE"
