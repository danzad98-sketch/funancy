export type ChainId = 'sushi' | 'burger' | 'art';
export type ItemLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Item {
  id: string;
  chain: ChainId;
  level: ItemLevel;
  emoji: string;
  name: string;
}

export interface GridCell {
  index: number;
  item: Item | null;
}

// --- Sell request types ---
export type SellRequestType = 'single' | 'duo' | 'category_set';
export type RewardType = 'coins' | 'time_booster' | 'energy' | 'mystery_box' | 'merge_booster';

export interface SellRequestItem {
  chain: ChainId;
  level: ItemLevel;
  emoji: string;
  name: string;
}

export interface SellRequest {
  id: string;
  type: SellRequestType;
  label: string;           // Hebrew label for the request type
  items: SellRequestItem[]; // 1 for single, 2 for duo, 3 for category_set
  rewardType: RewardType;
  rewardAmount: number;
  rewardLabel: string;     // Hebrew label for the reward
  rewardEmoji: string;
  characterEmoji: string;  // legacy — kept for old persisted data compat
  characterName: string;
  /** 1..5 — index into the painted BuyerCharacters component (PRD).
   *  When generating a new request, excludes characterIds present in
   *  active requests so no two visible cards share the same buyer. */
  characterId: 1 | 2 | 3 | 4 | 5;
  bonusMultiplier: number; // 1.0 for single, 1.5 for duo, 2.0 for category_set
}

// Legacy Order type — kept for backward compat with persist
export interface Order {
  id: string;
  requiredChain: ChainId;
  requiredLevel: ItemLevel;
  coinReward: number;
  characterEmoji: string;
  characterName: string;
  itemEmoji: string;
}

export interface Producer {
  id: string;
  chain: ChainId;
  energyCost: number;
  emoji: string;
  name: string;
}
