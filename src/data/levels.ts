/**
 * Game levels — PRD section 5.
 *
 * Empty placeholder. The user will send the level definitions in a
 * follow-up message. Until then this file is intentionally empty so
 * the existing game state (uses the constants in `lib/constants.ts`
 * and the staged-unlock thresholds baked into `data/accounts.ts`
 * and `data/metaGoals.ts`) keeps working unchanged.
 *
 * The shape below is the contract the consumer code will look for.
 * When the level data arrives:
 *   1. Populate `LEVELS` with the level objects (one per game level)
 *   2. Call `getLevelConfig(playerLevel)` from any place that needs to
 *      know which platforms / meta stages / mission pool / starting
 *      resources are available at the player's current level.
 */

import type { AccountType } from '@/types/finance';

export interface LevelConfig {
  /** 1-based level number. */
  level: number;
  /** Display label shown to the player (Hebrew). */
  label?: string;
  /** Which Finance-Center investment platforms unlock at this level. */
  unlockedPlatforms?: AccountType[];
  /** Which Meta-Goal stage IDs are accessible at this level. */
  unlockedMetaStages?: number[];
  /** Coins handed to a brand-new player who starts at this level. */
  startingCoins?: number;
  /** Initial energy. */
  startingEnergy?: number;
  /** Initial time speeders. */
  startingTimeSpeeders?: number;
  /** Mission IDs available for selection at this level. */
  missionPool?: string[];
  /**
   * Free-form extension bucket so the upcoming level definitions can
   * include arbitrary parameters (e.g. inflation range overrides,
   * speeder cadence, multiplier tweaks) without breaking the contract.
   */
  meta?: Record<string, unknown>;
}

/**
 * The actual level table. Populated by the follow-up message.
 * Keep sorted ascending by `level`.
 */
export const LEVELS: LevelConfig[] = [];

/**
 * Look up the config for a given player level. Returns `null` if the
 * level hasn't been defined yet — callers should treat that as "use
 * the current built-in defaults" (i.e. behave exactly as today).
 */
export function getLevelConfig(level: number): LevelConfig | null {
  if (LEVELS.length === 0) return null;
  return LEVELS.find((l) => l.level === level) ?? null;
}

/**
 * Highest level defined in the table. Returns 0 if none defined yet.
 * Useful for clamping the player's currentLevel against the table size.
 */
export function getMaxDefinedLevel(): number {
  if (LEVELS.length === 0) return 0;
  return Math.max(...LEVELS.map((l) => l.level));
}
