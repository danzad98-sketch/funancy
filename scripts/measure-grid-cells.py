"""Detect painted-cell centres in grid-frame.png so the React grid can
absolute-position items at exact percentages (A1).

Strategy: the painted grid has cream-coloured cell faces inside a
darker brown frame. We threshold for cream, label the connected
components, filter by area, then sort by (row,col) to get 24 cell
centres. Output is dumped as percentages so it survives any CSS
scaling of the background image.
"""
from PIL import Image
import numpy as np

SRC = 'public/assets/board/grid-frame.png'
EXPECTED_COLS = 6
EXPECTED_ROWS = 4

im = Image.open(SRC).convert('RGB')
W, H = im.size
arr = np.array(im)

# Cream cell mask: high luminance + low saturation tilt towards yellow-cream.
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
luma = 0.299 * r + 0.587 * g + 0.114 * b
warm = (r.astype(int) > b.astype(int))  # cream is warmer than the wooden frame's saturation
# We want the cream cell faces, which are very bright AND only mildly warm.
mask = (luma > 200) & warm & (r.astype(int) - b.astype(int) < 60) & (g.astype(int) > 190)

# Connected components via flood-fill (numpy).
visited = np.zeros_like(mask, dtype=bool)
components = []
H_, W_ = mask.shape
for y in range(H_):
    for x in range(W_):
        if mask[y, x] and not visited[y, x]:
            # BFS with stack
            stack = [(y, x)]
            pixels = []
            min_y, max_y, min_x, max_x = y, y, x, x
            while stack:
                cy, cx = stack.pop()
                if cy < 0 or cy >= H_ or cx < 0 or cx >= W_: continue
                if visited[cy, cx] or not mask[cy, cx]: continue
                visited[cy, cx] = True
                pixels.append((cy, cx))
                if cy < min_y: min_y = cy
                if cy > max_y: max_y = cy
                if cx < min_x: min_x = cx
                if cx > max_x: max_x = cx
                stack.append((cy + 1, cx))
                stack.append((cy - 1, cx))
                stack.append((cy, cx + 1))
                stack.append((cy, cx - 1))
            area = len(pixels)
            if area > 5000:  # filter tiny noise components
                cy_avg = sum(p[0] for p in pixels) / area
                cx_avg = sum(p[1] for p in pixels) / area
                components.append({
                    'cx': cx_avg, 'cy': cy_avg,
                    'area': area,
                    'bbox': (min_x, min_y, max_x, max_y),
                })

print(f'found {len(components)} components')

# Keep the 24 largest (the painted cells should each be ~ same area).
components.sort(key=lambda c: -c['area'])
top = components[:EXPECTED_COLS * EXPECTED_ROWS]
top.sort(key=lambda c: (c['cy'], c['cx']))

# Assign rows by clustering cy into 4 bands.
ys = sorted(c['cy'] for c in top)
# Find 4 cluster centres via simple bucket
import statistics
n = len(top)
rows = [None] * n
# Sort by cy, then split into 4 groups of 6
top_by_y = sorted(top, key=lambda c: c['cy'])
for row_idx in range(EXPECTED_ROWS):
    chunk = top_by_y[row_idx * EXPECTED_COLS:(row_idx + 1) * EXPECTED_COLS]
    chunk.sort(key=lambda c: c['cx'])
    for col_idx, comp in enumerate(chunk):
        comp['row'] = row_idx
        comp['col'] = col_idx

# Dump as percentages
print(f'\nimage size: {W} x {H}')
print('\ncell centres as % of image (row,col -> x%, y%):')
print('export const PAINTED_CELLS = [')
for r in range(EXPECTED_ROWS):
    for c in range(EXPECTED_COLS):
        comp = next((cc for cc in top if cc.get('row') == r and cc.get('col') == c), None)
        if comp is None:
            print(f'  // row {r} col {c} — NOT FOUND')
            continue
        x_pct = comp['cx'] / W * 100
        y_pct = comp['cy'] / H * 100
        print(f"  {{ row: {r}, col: {c}, xPct: {x_pct:.2f}, yPct: {y_pct:.2f} }},")
print('];')

# Also compute frame inset (where cells start/end on each axis)
all_min_x = min(c['bbox'][0] for c in top)
all_max_x = max(c['bbox'][2] for c in top)
all_min_y = min(c['bbox'][1] for c in top)
all_max_y = max(c['bbox'][3] for c in top)
print(f'\ngrid bbox in image px: ({all_min_x},{all_min_y}) -> ({all_max_x},{all_max_y})')
print(f'frame inset (left,top,right,bottom) % = '
      f'({all_min_x/W*100:.1f}, {all_min_y/H*100:.1f}, '
      f'{(W-all_max_x)/W*100:.1f}, {(H-all_max_y)/H*100:.1f})')
