# ALHYDRA — video pipeline

Everything the site shows as video is **generated** from the raw camera files
in `public/vid/`. That folder is the editing source: ~226 MB, kept out of git
and excluded from Firebase Hosting (`firebase.json` → `hosting.ignore`).
Only the renders in `public/media/` ship.

The footage is portrait (1080×1920, rotation −90 in metadata), so every
landscape render centres the sharp frame over a blurred fill of itself rather
than cropping the tower.

## Requirements

- `ffmpeg` / `ffprobe` on `PATH` (built with `libx264`, `libvpx-vp9`, `libwebp`)
- Bash (Git Bash is fine on Windows)
- `capcut-cli` (`npm i -g capcut-cli`) — only for the editable CapCut draft

## Build

Run in order from anywhere; the scripts locate the repo themselves.
Intermediates land in `.videowork/` (gitignored, override with `ALHYDRA_WORK`).

```bash
bash tools/video/build_segments.sh   # 1. grade + letterbox the 12 chosen shots
bash tools/video/build_reel.sh       # 2. title/end cards, lower thirds, xfades, encodes
bash tools/video/build_loops.sh      # 3. ambient / column / texture decor loops
```

### Outputs (`public/media/`)

| File | What it is | Used by |
|---|---|---|
| `alhydra-showreel.mp4` / `.webm` | 39 s branded cut, 1280×720 | `#showreel` player on the landing page |
| `showreel-poster.jpg` | poster frame (t = 4.4 s) | same |
| `alhydra-ambient.mp4` / `.webm` | 17 s seamless, desaturated | hero backdrop (`.media-layer`) |
| `ambient-poster.jpg` | poster for the above | same |
| `alhydra-column.mp4` | 7 s seamless portrait loop | gallery "live loop" + dashboard rig panel |
| `column-poster.jpg` | poster for the above | same |
| `alhydra-texture.mp4` | 6 s defocused algae bokeh | moving texture behind the CTA card |
| `alhydra-apptour.mp4` / `.webm` | 28 s scrolling tour of the dashboard, 1600×900 | `#app-tour` player on the landing page |
| `apptour-poster.jpg` | poster frame | same |

Loops are made seamless by cross-blending the tail back over the head, so they
repeat without a visible cut.

Chapter cue points live on the `data-reel-time` buttons in `public/index.html`,
next to their labels — `motion.js` reads them from the markup, so a re-cut only
needs those numbers updated.

## App tour (the dashboard screencast)

```bash
bash tools/video/capture_app.sh    # 1. drive headless Chrome through each view
bash tools/video/build_apptour.sh  # 2. compose the scrolling screencast
```

`capture_app.sh` serves `public/` locally and drives `public/__cap.html`, a
capture-only harness that unhides the app shell, switches on Demo Mode so the
sensor cards carry plausible values, and hides the chrome that would otherwise
float over the frame (FABs, toasts, the aura layer). For each view it takes:

* `chrome_<view>.png` — 1440×900, the app exactly as a user sees it
* `full_<view>.png` — the same view with the content column expanded to its
  natural height

`measure_shots.py` then reads the real content height out of the pixels.
(The DOM cannot be trusted here: `#content` is a stretched flex child, so it
reports the window height rather than the view's.)

`build_apptour.sh` composes each view by scrolling the content column
(`x=240, w=1200`, below the 60px topbar) inside the static frame's content
area, so the sidebar and topbar stay pinned exactly as they do in the app.

## Product stills

`public/img/photos/` holds graded 1200 px JPEG/WebP plus 520 px WebP
thumbnails derived from the three HDR stills in `public/vid/`. Regenerate with:

```bash
for f in public/vid/*.jpg; do
  b=$(basename "$f" .jpg)
  ffmpeg -y -i "$f" -vf "scale=1200:-2,eq=contrast=1.06:saturation=1.10:brightness=0.008,unsharp=5:5:0.35:5:5:0" -q:v 4 "public/img/photos/$b.jpg"
done
```

## Editable CapCut draft (9:16 social cut)

`alhydra-social.spec.json` describes a vertical cut of the same shot list with
CapCut's own transitions and text track — the shareable counterpart to the
landscape web reel.

```bash
capcut compile tools/video/alhydra-social.spec.json
capcut lint   "$LOCALAPPDATA/CapCut/User Data/Projects/com.lveditor.draft/ALHYDRA Social Cut"
```

It compiles straight into the CapCut draft store, so it appears in the app's
project list ready to open and keep editing. Media paths in the spec are
relative to the spec file.
