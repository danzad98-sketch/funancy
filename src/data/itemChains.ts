import type { Item, ChainId, ItemLevel } from '@/types/game';

/**
 * Working Board item chains. Three chains × eight tiers.
 *
 * Per the official spreadsheet `items_and_chains.xlsx`:
 *   - Tiers 1-3 are merge fuel only (board-only, not sellable).
 *   - Tiers 4-8 are sellable for fixed prices 60 / 70 / 80 / 90 / 100.
 *
 * Chain IDs (`sushi` / `burger` / `art`) are PERSIST-COMPAT names — they
 * map to the new content as follows, keeping persisted grids playable:
 *   `burger` → אפייה וכריכים (Baking & Sandwiches)
 *   `sushi`  → סושי ואוכל סיני (Sushi & Chinese)
 *   `art`    → ירקות וסלטים (Vegetables & Salads)
 *
 * The `image` field points to the PNG in `/public/items/`. Renderers
 * (DraggableItem, MergeGrid drag overlay, OrderGallery) prefer this when
 * present and fall back to the emoji otherwise.
 */

interface ChainDef {
  chain: ChainId;
  levels: { level: ItemLevel; emoji: string; image: string; name: string }[];
}

export const CHAINS: ChainDef[] = [
  {
    chain: 'sushi',          // Chain 2 in the spec — Sushi & Chinese
    levels: [
      { level: 1, emoji: '🌾', image: '/items/chain2_tier1_rice.png',             name: 'אורז' },
      { level: 2, emoji: '🍚', image: '/items/chain2_tier2_cooked_rice.png',      name: 'אורז מבושל' },
      { level: 3, emoji: '🥟', image: '/items/chain2_tier3_gyoza.png',            name: 'גיוזה' },
      { level: 4, emoji: '🍱', image: '/items/chain2_tier4_maki.png',             name: 'מאקי' },
      { level: 5, emoji: '🐟', image: '/items/chain2_tier5_sashimi.png',          name: 'סשימי' },
      { level: 6, emoji: '🍜', image: '/items/chain2_tier6_chinese_noodles.png',  name: 'נודלס סיני' },
      { level: 7, emoji: '🍣', image: '/items/chain2_tier7_sushi_platter.png',    name: 'פלטת סושי' },
      { level: 8, emoji: '✨', image: '/items/chain2_tier8_gourmet_sushi.png',    name: 'סושי גורמה' },
    ],
  },
  {
    chain: 'burger',         // Chain 1 in the spec — Baking & Sandwiches
    levels: [
      { level: 1, emoji: '🌾', image: '/items/chain1_tier1_flour.png',            name: 'קמח' },
      { level: 2, emoji: '🥖', image: '/items/chain1_tier2_dough.png',            name: 'בצק' },
      { level: 3, emoji: '🍞', image: '/items/chain1_tier3_sliced_bread.png',     name: 'לחם פרוס' },
      { level: 4, emoji: '🥪', image: '/items/chain1_tier4_toast.png',            name: 'טוסט' },
      { level: 5, emoji: '🥪', image: '/items/chain1_tier5_simple_sandwich.png',  name: 'כריך פשוט' },
      { level: 6, emoji: '🥙', image: '/items/chain1_tier6_fancy_sandwich.png',   name: 'כריך מפנק' },
      { level: 7, emoji: '🥖', image: '/items/chain1_tier7_baguette.png',         name: 'באגט' },
      { level: 8, emoji: '✨', image: '/items/chain1_tier8_gourmet_baguette.png', name: 'בייגל גורמה' },
    ],
  },
  {
    chain: 'art',            // Chain 3 in the spec — Vegetables & Salads
    levels: [
      { level: 1, emoji: '🥬', image: '/items/chain3_tier1_lettuce.png',            name: 'עלי חסה' },
      { level: 2, emoji: '🥕', image: '/items/chain3_tier2_chopped_vegetables.png', name: 'ירקות חתוכים' },
      { level: 3, emoji: '🥗', image: '/items/chain3_tier3_vegetable_salad.png',    name: 'סלט ירקות' },
      { level: 4, emoji: '🫒', image: '/items/chain3_tier4_greek_salad.png',        name: 'סלט יווני' },
      { level: 5, emoji: '🥗', image: '/items/chain3_tier5_caesar_salad.png',       name: 'סלט קיסר' },
      { level: 6, emoji: '🐠', image: '/items/chain3_tier6_nicoise_salad.png',      name: 'סלט ניסואז' },
      { level: 7, emoji: '🥙', image: '/items/chain3_tier7_buddha_bowl.png',        name: 'בול פוד' },
      { level: 8, emoji: '✨', image: '/items/chain3_tier8_gourmet_bowl.png',       name: 'קערת גורמה' },
    ],
  },
];

export const MAX_LEVEL: ItemLevel = 8;

/** First tier that can be sold for coins. Tiers 1–3 are merge fuel only. */
export const MIN_SELLABLE_TIER: ItemLevel = 4;

export function isSellableTier(level: ItemLevel): boolean {
  return level >= MIN_SELLABLE_TIER;
}

export function getItemDef(chain: ChainId, level: ItemLevel): Omit<Item, 'id'> {
  const chainDef = CHAINS.find((c) => c.chain === chain);
  if (!chainDef) {
    console.error(`[getItemDef] Unknown chain: ${chain}, falling back to sushi`);
    const fallback = CHAINS[0].levels[0];
    return { chain: 'sushi', level: 1, emoji: fallback.emoji, image: fallback.image, name: fallback.name };
  }
  const levelDef = chainDef.levels.find((l) => l.level === level);
  if (!levelDef) {
    console.error(`[getItemDef] Unknown level ${level} for chain ${chain}, falling back to level 1`);
    const fallback = chainDef.levels[0];
    return { chain, level: fallback.level, emoji: fallback.emoji, image: fallback.image, name: fallback.name };
  }
  return {
    chain,
    level: levelDef.level,
    emoji: levelDef.emoji,
    image: levelDef.image,
    name: levelDef.name,
  };
}

let itemIdCounter = 0;
export function createItem(chain: ChainId, level: ItemLevel): Item {
  const def = getItemDef(chain, level);
  return { ...def, id: `item_${Date.now()}_${itemIdCounter++}` };
}
