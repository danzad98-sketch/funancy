import type { Stage } from './finance';

// Legacy type — kept for persist compat
export interface LifeGoal {
  id: string;
  name: string;
  price: number;
  emoji: string;
  stageRequired: Stage;
  isPurchased: boolean;
}

// --- New Meta Goal system ---

/**
 * Unified level-based state model.
 *   locked   — gated by an unfinished prior stage, no Buy button
 *   level_0  — stage is active, nothing owned yet, next Buy is tier[0]
 *   level_1  — tier[0] owned, next Buy (if any) is tier[1]
 *   level_2  — tier[1] owned, next Buy (if any) is tier[2]
 *   level_3  — tier[2] owned (only reachable on multi_level), chain complete
 *
 * Every Buy charges exactly one tier price and advances exactly one level.
 * There is no separate "upgrade" concept — each Buy IS the next progression.
 */
export type MetaItemState =
  | 'locked'
  | 'level_0'
  | 'level_1'
  | 'level_2'
  | 'level_3'
  | 'level_4';

export type MetaItemKind = 'upgradeable' | 'purchase_only' | 'multi_level';

export interface MetaItemTier {
  emoji: string;
  name: string;
  price: number;
}

export interface MetaItem {
  id: string;
  kind: MetaItemKind;
  state: MetaItemState;
  tiers: MetaItemTier[]; // 1 for purchase_only, 2 for upgradeable, 3 for multi_level
}

export type MetaStageStatus = 'locked' | 'active' | 'completed';

export interface MetaStage {
  id: number;
  name: string;
  description: string;
  emoji: string;
  status: MetaStageStatus;
  items: MetaItem[];
}
