#!/usr/bin/env python3
"""Measure the real content height of each full_<view>.png capture.

The captures are rendered into a 2600px-tall window, so every view is followed
by a band of flat page background. Scanning up from the bottom for the first
row that differs from that background gives the height the tour video should
scroll through -- more reliable than asking the DOM, which reports the
stretched flex container rather than the view.
"""
import sys, os, glob
from collections import Counter
from PIL import Image

CONTENT_X, CONTENT_W = 240, 1200      # the content column inside the 1440px app
PAD = 24                              # #content padding, kept in the crop

def content_height(path: str) -> int:
    """Height of the real UI in a full_<view>.png capture.

    The captures render into a tall window, so each view is followed by flat
    page background. Two details make a naive scan fail:

      * card surfaces sit only ~10 RGB units above the page colour, so the
        tolerance has to stay tight; and
      * the page background has its own faint gradient, plus the odd stray
        pixel, so a single deviating row is not proof of content.

    So: tight tolerance, and the deviation must persist across three rows.
    """
    im = Image.open(path).convert("RGB")
    col = im.crop((CONTENT_X, 0, CONTENT_X + CONTENT_W, im.height))
    w, h = col.size
    px = col.load()

    xs = list(range(0, w, 4))
    tally = Counter(px[x, y] for y in range(h - 40, h) for x in xs)
    bg = tally.most_common(1)[0][0]

    tol, min_off = 4, 8

    def deviating(y: int) -> int:
        n = 0
        for x in xs:
            p = px[x, y]
            if (abs(p[0]-bg[0]) > tol or abs(p[1]-bg[1]) > tol or abs(p[2]-bg[2]) > tol):
                n += 1
        return n

    y = h - 1
    while y > 4 and not (deviating(y) > min_off
                         and deviating(y - 2) > min_off
                         and deviating(y - 4) > min_off):
        y -= 1
    return min(h, y + 1 + PAD)

def main(shots_dir: str) -> None:
    out = os.path.join(shots_dir, "heights.tsv")
    rows = []
    for p in sorted(glob.glob(os.path.join(shots_dir, "full_*.png"))):
        view = os.path.basename(p)[len("full_"):-len(".png")]
        rows.append((view, content_height(p)))
    with open(out, "w", encoding="utf-8") as f:
        for view, h in rows:
            f.write(f"{view}\t{h}\n")
            print(f"{view:<14} {h}px")
    print("->", out)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
