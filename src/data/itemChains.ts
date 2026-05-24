import type { Item, ChainId, ItemLevel } from '@/types/game';

interface ChainDef {
  chain: ChainId;
  levels: { level: ItemLevel; emoji: string; name: string }[];
}

export const CHAINS: ChainDef[] = [
  {
    chain: 'sushi',
    levels: [
      { level: 1, emoji: '🍚', name: 'אורז' },
      { level: 2, emoji: '🍙', name: 'אונגירי' },
      { level: 3, emoji: '🍣', name: 'סושי' },
      { level: 4, emoji: '🍱', name: 'מגש סושי' },
      { level: 5, emoji: '🏮', name: 'דוכן ראמן' },
      { level: 6, emoji: '🍜', name: 'מסעדת ראמן' },
      { level: 7, emoji: '🏯', name: 'מסעדת שף' },
      { level: 8, emoji: '🐉', name: 'אימפריית סושי' },
    ],
  },
  {
    chain: 'burger',
    levels: [
      { level: 1, emoji: '🥩', name: 'קציצה' },
      { level: 2, emoji: '🍔', name: 'המבורגר' },
      { level: 3, emoji: '🌭', name: 'ארוחה מהירה' },
      { level: 4, emoji: '🍟', name: 'ארוחת קומבו' },
      { level: 5, emoji: '🛒', name: 'דוכן אוכל' },
      { level: 6, emoji: '🏪', name: 'מזנון' },
      { level: 7, emoji: '🍽️', name: 'מסעדת גורמה' },
      { level: 8, emoji: '🏆', name: 'רשת מסעדות' },
    ],
  },
  {
    chain: 'art',
    levels: [
      { level: 1, emoji: '✏️', name: 'עיפרון' },
      { level: 2, emoji: '🖌️', name: 'מכחול' },
      { level: 3, emoji: '🎨', name: 'ציור' },
      { level: 4, emoji: '🖼️', name: 'ציור ממוסגר' },
      { level: 5, emoji: '🏛️', name: 'תערוכה' },
      { level: 6, emoji: '🎭', name: 'גלריה' },
      { level: 7, emoji: '🏰', name: 'מוזיאון' },
      { level: 8, emoji: '💎', name: 'אימפריית אומנות' },
    ],
  },
];

export const MAX_LEVEL: ItemLevel = 8;

export function getItemDef(chain: ChainId, level: ItemLevel): Omit<Item, 'id'> {
  const chainDef = CHAINS.find((c) => c.chain === chain);
  if (!chainDef) {
    console.error(`[getItemDef] Unknown chain: ${chain}, falling back to sushi`);
    return { chain: 'sushi', level: 1, emoji: '🍚', name: 'אורז' };
  }
  const levelDef = chainDef.levels.find((l) => l.level === level);
  if (!levelDef) {
    console.error(`[getItemDef] Unknown level ${level} for chain ${chain}, falling back to level 1`);
    const fallback = chainDef.levels[0];
    return { chain, level: fallback.level, emoji: fallback.emoji, name: fallback.name };
  }
  return {
    chain,
    level: levelDef.level,
    emoji: levelDef.emoji,
    name: levelDef.name,
  };
}

let itemIdCounter = 0;
export function createItem(chain: ChainId, level: ItemLevel): Item {
  const def = getItemDef(chain, level);
  return { ...def, id: `item_${Date.now()}_${itemIdCounter++}` };
}
