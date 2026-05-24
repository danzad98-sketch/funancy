# -*- coding: utf-8 -*-
"""
Strip the opaque light-grey backdrop from the three header icons
(coin / bolt / hourglass) so they render naturally over the cream
pill on the Working Board header.

The source files were saved as JPEGs (no alpha channel) renamed to
.png — they have a flat ~#e7e7e7 background baked into every pixel
that isn't part of the painted icon. We:

  1. Inspect the four corners to learn the actual background colour
     (it varies a few RGB units between the three files).
  2. Build an alpha mask: pixels close to that background colour
     fade to transparent; pixels far from it stay opaque. We use a
     soft threshold (delta_in < dist < delta_out → linear ramp) so
     the painted edge stays anti-aliased rather than getting a hard
     cookie-cutter outline.
  3. Save as a true RGBA PNG, overwriting the JPEG-with-png-extension
     that the dev server is currently serving.
"""

from PIL import Image
import math
import os

ROOT = r"C:\Users\danza\OneDrive\Desktop\CALUDE1\funancy\public\assets\icons"
ICONS = ["coin", "bolt", "hourglass"]

# Inner threshold: pixels within DELTA_IN of bg → fully transparent.
# Outer threshold: pixels DELTA_OUT or further away → fully opaque.
# Between them, alpha ramps linearly (preserves anti-aliased edges).
DELTA_IN = 14.0
DELTA_OUT = 38.0


def sample_bg(im_rgb):
    """Median-ish corner sample. Avoids the off-chance one corner is
    inside the painted icon's glow halo."""
    w, h = im_rgb.size
    pad = 2
    corners = [
        im_rgb.getpixel((pad, pad)),
        im_rgb.getpixel((w - 1 - pad, pad)),
        im_rgb.getpixel((pad, h - 1 - pad)),
        im_rgb.getpixel((w - 1 - pad, h - 1 - pad)),
    ]
    rs = sorted(c[0] for c in corners)
    gs = sorted(c[1] for c in corners)
    bs = sorted(c[2] for c in corners)
    # median of 4 corners
    return ((rs[1] + rs[2]) // 2, (gs[1] + gs[2]) // 2, (bs[1] + bs[2]) // 2)


def strip(name):
    path = os.path.join(ROOT, f"{name}.png")
    im = Image.open(path).convert("RGB")
    bg = sample_bg(im)
    print(f"[{name}] size={im.size} bg={bg}")

    px = im.load()
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    out_px = out.load()

    br, bg_, bb = bg
    delta_range = DELTA_OUT - DELTA_IN

    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b = px[x, y]
            dist = math.sqrt((r - br) ** 2 + (g - bg_) ** 2 + (b - bb) ** 2)
            if dist <= DELTA_IN:
                a = 0
            elif dist >= DELTA_OUT:
                a = 255
            else:
                a = int(255 * (dist - DELTA_IN) / delta_range)
            out_px[x, y] = (r, g, b, a)

    out.save(path, "PNG")
    print(f"[{name}] wrote {path} as RGBA PNG")


if __name__ == "__main__":
    for n in ICONS:
        strip(n)
    print("done.")
