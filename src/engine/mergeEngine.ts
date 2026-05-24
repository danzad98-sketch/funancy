import type { Item, ItemLevel } from '@/types/game';
import { createItem, MAX_LEVEL } from '@/data/itemChains';

export function canMerge(item1: Item, item2: Item): boolean {
  return (
    item1.chain === item2.chain &&
    item1.level === item2.level &&
    item1.level < MAX_LEVEL
  );
}

export function doMerge(item1: Item, item2: Item): Item {
  if (!canMerge(item1, item2)) {
    throw new Error('Cannot merge these items');
  }
  const newLevel = (item1.level + 1) as ItemLevel;
  return createItem(item1.chain, newLevel);
}
