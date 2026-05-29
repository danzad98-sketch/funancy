// Grid
export const GRID_ROWS = 4;
export const GRID_COLS = 6;
export const GRID_SIZE = GRID_ROWS * GRID_COLS;

// Energy
export const ENERGY_CAP = 100;
export const ENERGY_BONUS_CAP = 999;
export const ENERGY_REGEN_MS = 120_000; // 2 minutes
export const ENERGY_COST_PER_PRODUCE = 1;

// Inflation — rate is randomized PER TIME-SPEEDER use:
// magnitude in [INFLATION_MIN, INFLATION_MAX] (1%–3%) with a random sign
// (positive = inflation hits the wallet, negative = deflation rewards it).
// Hourly inflation is no longer used; inflation only fires on time speeder.
export const INFLATION_MIN = 0.01; // 1%
export const INFLATION_MAX = 0.03; // 3%
export const INFLATION_RATE_PER_HOUR = 0; // legacy export kept at 0 to avoid breaking imports

/**
 * Pick a random per-year inflation rate. Magnitude uniformly in [1%, 3%],
 * sign uniformly random. So rate ∈ [-0.03, -0.01] ∪ [0.01, 0.03].
 * Positive = wallet loses value; negative = wallet gains value.
 */
export function rollAnnualInflationRate(): number {
  const magnitude = INFLATION_MIN + Math.random() * (INFLATION_MAX - INFLATION_MIN);
  const sign = Math.random() < 0.5 ? -1 : 1;
  return magnitude * sign;
}

// Orders / Sell requests
export const SELL_REQUEST_SLOTS = 3;

// Base sell price per tier — PRD 1 pricing curve:
//   tier_N price = BASE * 1.10^(N-1)
// Gentle 10% compound per tier; we round to integers for clean display.
// Multipliers on top: single 1.0×, duo 1.5×, category_set 2.0×.
// Scaled 10× from original 5 to match the official Excel mission-target
// economy (stage 2 M1 = 300 coins, etc.). Compound multiplier preserved.
// Result table: { 1: 50, 2: 55, 3: 61, 4: 67, 5: 73, 6: 81, 7: 89, 8: 98 }
const SELL_BASE_TIER_1 = 50;
const SELL_TIER_MULTIPLIER = 1.10;
export const SELL_PRICES: Record<number, number> = Object.fromEntries(
  Array.from({ length: 8 }, (_, i) => [
    i + 1,
    Math.round(SELL_BASE_TIER_1 * Math.pow(SELL_TIER_MULTIPLIER, i)),
  ]),
) as Record<number, number>;
// Resulting table: { 1: 5, 2: 6, 3: 6, 4: 7, 5: 7, 6: 8, 7: 9, 8: 11 }
// Yes — 10% is gentle. PRD says revisit later if needed.

// Bonus multipliers per sell request type
export const SELL_MULTIPLIER_SINGLE = 1.0;
export const SELL_MULTIPLIER_DUO = 1.5;
export const SELL_MULTIPLIER_CATEGORY_SET = 2.0;

// Legacy exports for backward compat
export const ORDER_SLOTS = 2;
export const COIN_REWARDS: Record<number, number> = { ...SELL_PRICES };
export const COIN_REWARD_LEVEL_2 = 100;
export const COIN_REWARD_LEVEL_3 = 200;

// Finance
export const DEPOSIT_ANNUAL_RATE = 0.02;
export const INDEX_FUND_MIN_RETURN = 0.02;
export const INDEX_FUND_MAX_RETURN = 0.08;
export const SINGLE_STOCK_CRASH = -0.20;
export const SINGLE_STOCK_BOOM = 0.25;
export const PENSION_ANNUAL_RATE = 0.05;
export const PROVIDENT_ANNUAL_RATE = 0.04;
export const EMPLOYER_MATCH = 0.50;
export const PENSION_LOCK_SPEEDERS = 5;

// =============================================================
// Time scale — PRD rule: 1 real hour = 1 sim week.
//   52 real hours  = 1 sim year
//   Each time-speeder advances SPEEDER_WEEKS sim weeks (default 52).
// All %-based investment + inflation math is annualized; weekly
// effective rate = (1 + annualRate)^(1/52) - 1, applied as a power
// of N weeks via `applyAnnualInterest(balance, annualRate, weeks/52)`.
// =============================================================
export const WEEKS_PER_YEAR = 52;
export const SPEEDER_WEEKS = 52; // one speeder = one sim year
export const HOURS_PER_YEAR = 8760; // legacy, kept for any straggling import

// Starting values — fresh-user defaults per partner-review feedback.
// New users begin with NOTHING in the wallet: every coin and every booster
// must be earned during the journey. Energy stays full so they can start
// playing immediately.
// With new low Meta-Goal prices (cheapest tier 1 item: earbuds 12),
// 100 coins lets fresh user clear the tutorial's meta-upgrade gate
// immediately (12 earbuds + 16 watch = 28 spent, ~70 left for progression).
export const STARTING_COINS = 100;
export const STARTING_ENERGY = 100;
export const STARTING_TIME_SPEEDERS = 0;
