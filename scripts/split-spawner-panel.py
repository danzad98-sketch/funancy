"""Split the painted spawner panel into 3 individual card PNGs.

Equal-thirds crop (no frame removal) so each painted card keeps its
cream rounded frame + purple tile + gold border + glow. This matches
the mockup look where the producers sit on a unified painted panel
that reads as 3 framed game icons.

Output:
  public/assets/board/spawner-card-1.png  (sushi  - takeout box)
  public/assets/board/spawner-card-2.png  (burger - oven)
  public/assets/board/spawner-card-3.png  (art    - rake)
"""
from PIL import Image

SRC = 'public/assets/board/spawner-panel.png'
im = Image.open(SRC).convert('RGBA')
W, H = im.size  # 1280 x 408
THIRD = W // 3  # 426

for i in range(3):
    left = i * THIRD
    right = (i + 1) * THIRD if i < 2 else W
    card = im.crop((left, 0, right, H))
    out = f'public/assets/board/spawner-card-{i + 1}.png'
    card.save(out, 'PNG')
    print(f'card {i + 1}: {card.size} -> {out}')

print('done')
