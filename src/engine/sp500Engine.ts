/**
 * S&P 500 simulation engine — PRD Stage 4 "User flow part 4".
 *
 * From this point in the game onward, the `single_stock` account is
 * driven by the bimodal sampler below — one weekly return per sim week,
 * compounded over the booster's 52-week advance.
 *
 * Distribution:
 *   - Two Gaussian humps centered at −5% and +5% (sigma = 2.5pp)
 *   - Positive hump weighted 0.55, negative 0.45 → slight long-term up-bias
 *   - Hard clip to [−15%, +15%] (re-roll on overflow)
 *
 * Plus one scripted exception: the SECOND time-booster use during Stage 4
 * (the volatility lesson). The store carries a one-shot
 * `s4ScriptedDropPending` flag; when set, the engine uses
 * `generateSP500ScriptedSeries()` (deterministic drop to ~-25% mid-year,
 * recovery to small positive end) instead of sampling randomly.
 */

const POSITIVE_WEIGHT = 0.55;
const NEGATIVE_WEIGHT = 0.45;       // exposed for clarity; not used directly
const POSITIVE_MEAN  =  0.05;
const NEGATIVE_MEAN  = -0.05;
const HUMP_SIGMA     =  0.025;
const HARD_MIN       = -0.15;
const HARD_MAX       =  0.15;

void NEGATIVE_WEIGHT;

/** Standard normal sample via Box-Muller. */
function gaussian(): number {
  // Re-roll u===0 to avoid log(0).
  let u = 0;
  while (u === 0) u = Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Sample one weekly return for the S&P 500.
 * Bimodal: pick hump by weight → Gaussian around its mean → clip to ±15%.
 * If a sample falls outside the clip, re-roll (preserves the distribution
 * shape rather than truncating it).
 */
export function sampleSP500WeeklyReturn(): number {
  for (let attempt = 0; attempt < 16; attempt++) {
    const mean =
      Math.random() < POSITIVE_WEIGHT ? POSITIVE_MEAN : NEGATIVE_MEAN;
    const r = mean + gaussian() * HUMP_SIGMA;
    if (r >= HARD_MIN && r <= HARD_MAX) return r;
  }
  // Last-ditch fallback (should be statistically vanishing).
  return Math.max(HARD_MIN, Math.min(HARD_MAX, POSITIVE_MEAN));
}

/**
 * Generate `weeks` weekly returns sampled IID from the bimodal distribution.
 * Used in every booster tap on `single_stock` after Stage 4.
 */
export function generateSP500Series(weeks: number = 52): number[] {
  const out: number[] = new Array(weeks);
  for (let i = 0; i < weeks; i++) out[i] = sampleSP500WeeklyReturn();
  return out;
}

/**
 * Stage 4 step 4.2 only: re-roll the bimodal sampler until the realized
 * cumulative ends in [+15%, +50%]. The player still sees genuine weekly
 * fluctuations (the rolls themselves are unchanged) — but the year ends
 * clearly UP so the "shoq ha-hon nota la-alot" lesson lands.
 */
export function generateSP500PositiveSeries(weeks: number = 52): number[] {
  for (let attempt = 0; attempt < 200; attempt++) {
    const series = generateSP500Series(weeks);
    let mult = 1;
    for (let i = 0; i < weeks; i++) mult *= 1 + series[i];
    if (mult >= 1.15 && mult <= 1.5) return series;
  }
  // Fallback: synthesize a gentle upward path if the sampler refuses to
  // cooperate (statistically vanishing — but never throw on the lesson).
  const safe: number[] = new Array(weeks);
  for (let i = 0; i < weeks; i++) {
    safe[i] = sampleSP500WeeklyReturn() * 0.6 + 0.005;
  }
  return safe;
}

/**
 * Stage 4 step 4.3 scripted exception: a deterministic 52-week path that
 * - drops smoothly to a cumulative ~-25% at week 26
 * - recovers to ~+5% cumulative at week 52
 *
 * The shape uses a half-sine: deep on the down-leg, gentler recovery.
 * Returns the WEEKLY return series (not cumulative).
 */
export function generateSP500ScriptedSeries(): number[] {
  const weeks = 52;
  // Targets, both as cumulative multipliers from start.
  const drop = 0.75; // multiplier at week 26 (i.e. -25%)
  const end  = 1.05; // multiplier at week 52 (i.e. +5%)

  const cumulative: number[] = new Array(weeks + 1);
  cumulative[0] = 1;
  for (let i = 1; i <= weeks; i++) {
    if (i <= 26) {
      // Smooth half-sine descent 1 → drop.
      const t = i / 26;
      // (1 + cos(π·t)) / 2 starts at 1 and decays smoothly to 0.
      const phase = (1 + Math.cos(Math.PI * t)) / 2;
      cumulative[i] = drop + (1 - drop) * phase;
    } else {
      // Smooth half-sine recovery drop → end across weeks 26..52.
      const t = (i - 26) / 26;
      const phase = (1 - Math.cos(Math.PI * t)) / 2; // 0 → 1
      cumulative[i] = drop + (end - drop) * phase;
    }
  }
  const weekly: number[] = new Array(weeks);
  for (let i = 1; i <= weeks; i++) {
    weekly[i - 1] = cumulative[i] / cumulative[i - 1] - 1;
  }
  return weekly;
}

/**
 * Helper for engine + UI: apply a series of weekly returns to a starting
 * balance, returning the week-by-week running balance (length = weeks+1,
 * starts with `start`).
 */
export function applyWeeklyReturns(start: number, weekly: number[]): number[] {
  const out: number[] = new Array(weekly.length + 1);
  out[0] = start;
  for (let i = 0; i < weekly.length; i++) {
    out[i + 1] = out[i] * (1 + weekly[i]);
  }
  return out;
}
