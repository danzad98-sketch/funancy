"""Extract 5 transparent-background buyer character PNGs from the
group roster image.

Input:  public/assets/Board_2/characters-roster.jpeg  (1280 wide JPEG,
        5 characters in a row on a uniform grey background)
Output: public/assets/Board_2/character-{1..5}.png  (transparent PNGs)

Algorithm:
  1. Open the JPEG, convert to RGBA.
  2. Sample the grey background colour from the 4 corners (they're all
     clearly background).
  3. Flood-fill from every edge pixel into "background" — anything
     within `TOL` of the corner colour AND reachable from an edge.
     Edge-reachability matters because the bearded farmer has grey hair
     that's the same colour as the background, but it's NOT reachable
     from the edge (the head silhouette encloses it). Flood-fill stops
     at the silhouette boundary, preserving inner grey hair.
  4. Set alpha=0 on flood-filled pixels, alpha=255 elsewhere.
  5. Split the result into 5 equal-width tiles and save each.
"""
from PIL import Image
from collections import deque
import os

SRC = 'public/assets/Board_2/characters-roster.jpeg'
OUT_DIR = 'public/assets/Board_2'
N_CHARS = 5
TOL = 18  # per-channel tolerance for "background"


def color_dist(a, b):
    return max(abs(a[0] - b[0]), abs(a[1] - b[1]), abs(a[2] - b[2]))


def flood_alpha_from_edges(im):
    """Return an alpha mask (same size as im) where background = 0,
    character = 255. BFS from every edge pixel inward."""
    w, h = im.size
    px = im.load()
    # Sample background colour as the mean of the 4 corners.
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = (
        sum(c[0] for c in corners) // 4,
        sum(c[1] for c in corners) // 4,
        sum(c[2] for c in corners) // 4,
    )

    visited = [[False] * w for _ in range(h)]
    q = deque()

    # Seed the BFS with all edge pixels that are within tolerance of bg.
    for x in range(w):
        for y_edge in (0, h - 1):
            if not visited[y_edge][x] and color_dist(px[x, y_edge], bg) <= TOL:
                visited[y_edge][x] = True
                q.append((x, y_edge))
    for y in range(h):
        for x_edge in (0, w - 1):
            if not visited[y][x_edge] and color_dist(px[x_edge, y], bg) <= TOL:
                visited[y][x_edge] = True
                q.append((x_edge, y))

    # BFS
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                if color_dist(px[nx, ny], bg) <= TOL:
                    visited[ny][nx] = True
                    q.append((nx, ny))

    # Build alpha mask
    mask = Image.new('L', (w, h), 0)
    mpx = mask.load()
    for y in range(h):
        for x in range(w):
            mpx[x, y] = 0 if visited[y][x] else 255
    return mask


def main():
    print(f'opening {SRC}')
    src = Image.open(SRC).convert('RGBA')
    print(f'  size: {src.size}')

    print('flood-filling background from edges (TOL=%d)' % TOL)
    alpha = flood_alpha_from_edges(src)
    src.putalpha(alpha)

    # Find natural split points: columns where the entire column is
    # transparent (no character content). Then group runs of opaque
    # columns into character regions.
    w, h = src.size
    alpha_band = src.split()[3].load()
    col_has_content = []
    for x in range(w):
        opaque = 0
        for y in range(h):
            if alpha_band[x, y] > 8:
                opaque += 1
                if opaque > 3:
                    break
        col_has_content.append(opaque > 3)

    # Walk through and segment runs of True
    segments = []  # list of (left, right) inclusive
    cur_start = None
    for x, v in enumerate(col_has_content):
        if v and cur_start is None:
            cur_start = x
        elif not v and cur_start is not None:
            segments.append((cur_start, x - 1))
            cur_start = None
    if cur_start is not None:
        segments.append((cur_start, len(col_has_content) - 1))

    print(f'  detected {len(segments)} character segments')
    if len(segments) != N_CHARS:
        # Fallback: pick the N widest segments
        segments.sort(key=lambda s: s[1] - s[0], reverse=True)
        segments = segments[:N_CHARS]
        segments.sort(key=lambda s: s[0])

    PAD = 6
    for i, (left, right) in enumerate(segments):
        l = max(0, left - PAD)
        r = min(w, right + PAD + 1)
        tile = src.crop((l, 0, r, h))
        tb = tile.getbbox()
        if tb:
            tile = tile.crop(tb)
        out = os.path.join(OUT_DIR, f'character-{i + 1}.png')
        tile.save(out, 'PNG')
        print(f'  wrote {out}  {tile.size}')

    print('done.')


if __name__ == '__main__':
    main()
