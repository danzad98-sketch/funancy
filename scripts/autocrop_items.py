"""Auto-crop transparent padding from each item PNG so subjects fill the canvas.

After cropping, each image has its subject tightly bounded. Pair with CSS
`object-fit: contain` and identical container dimensions and every item
renders at the same visual size.

Idempotent: re-running is a no-op once images have no padding left.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Optional, Tuple
from PIL import Image

ITEMS_DIR = Path(__file__).resolve().parent.parent / "public" / "items"

# Tolerate near-transparent edge pixels (anti-aliasing leftovers).
ALPHA_THRESHOLD = 8


def auto_crop(path: Path) -> Optional[Tuple[Tuple[int, int], Tuple[int, int]]]:
    """Crop the image at `path` in-place. Returns (old_size, new_size) or None."""
    img = Image.open(path).convert("RGBA")
    old_size = img.size

    # Build a mask where alpha > threshold, then read its bbox.
    alpha = img.split()[3]
    mask = alpha.point(lambda a: 255 if a > ALPHA_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        print(f"  skipped (fully transparent): {path.name}")
        return None

    cropped = img.crop(bbox)
    new_size = cropped.size
    if new_size == old_size:
        print(f"  skipped (already tight): {path.name}")
        return (old_size, new_size)

    cropped.save(path, optimize=True)
    return (old_size, new_size)


def main() -> None:
    pngs = sorted(ITEMS_DIR.glob("*.png"))
    print(f"Auto-cropping {len(pngs)} PNGs in {ITEMS_DIR}")
    for p in pngs:
        result = auto_crop(p)
        if result is not None and result[0] != result[1]:
            os_, ns = result
            saved_w = os_[0] - ns[0]
            saved_h = os_[1] - ns[1]
            print(f"  cropped: {p.name}  {os_} -> {ns}  (-{saved_w}w -{saved_h}h)")


if __name__ == "__main__":
    main()
