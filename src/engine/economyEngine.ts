import type { Account, AccountType } from '@/types/finance';
import {
  INDEX_FUND_MIN_RETURN,
  INDEX_FUND_MAX_RETURN,
  SINGLE_STOCK_CRASH,
  SINGLE_STOCK_BOOM,
  WEEKS_PER_YEAR,
  SPEEDER_WEEKS,
} from '@/lib/constants';
import {
  generateSP500Series,
  generateSP500ScriptedSeries,
  generateSP500PositiveSeries,
  applyWeeklyReturns,
} from '@/engine/sp500Engine';

/**
 * Legacy export — retained so any caller that still imports
 * `applyInflation` doesn't crash. Inflation now lives entirely in
 * `useTimeSpeeder` (random 1%-3% per year, applied to wallet only).
 */
export function applyInflation(balance: number, _hoursElapsed: number): number {
  return balance;
}

/**
 * Compound interest over a fractional-year window.
 *   final = balance * (1 + annualRate)^years
 * Pass `years = weeks / WEEKS_PER_YEAR` to advance by N sim weeks.
 */
export function applyAnnualInterest(balance: number, annualRate: number, years: number): number {
  return balance * Math.pow(1 + annualRate, years);
}

export function getRandomStockReturn(isIndexFund: boolean): number {
  if (isIndexFund) {
    return INDEX_FUND_MIN_RETURN + Math.random() * (INDEX_FUND_MAX_RETURN - INDEX_FUND_MIN_RETURN);
  }
  // Single stock: binary outcome
  return Math.random() > 0.4 ? SINGLE_STOCK_BOOM : SINGLE_STOCK_CRASH;
}

/**
 * Advance the economy by `weeks` simulated weeks.
 *
 * Under the PRD time scale (1 real hour = 1 sim week), one time-speeder
 * advances `SPEEDER_WEEKS` weeks (= 52 = 1 sim year by default). Math:
 *   - Deterministic interest accounts (deposit / pension / provident)
 *     compound by `(1 + annualRate)^(weeks/52)`.
 *   - Stochastic accounts (index_fund / single_stock) roll once per call.
 *     The roll represents the cumulative random return over the period,
 *     not weekly volatility. Future work: distribute per week if N>52.
 *   - single_stock first-speeder crash mechanic preserved as a teaching
 *     moment per PRD 2.2.
 */
export function advanceSimWeeks(
  accounts: Record<AccountType, Account>,
  checkingBalance: number,
  marketCrashTriggered: boolean,
  weeks: number = SPEEDER_WEEKS,
  /** Stage 3 teaching mode: forces `index_fund` to grow at a deterministic
   *  4%/yr (no randomness) so the savings-habit lesson is legible. Reverts
   *  to the normal stochastic engine once Stage 3 is complete. */
  deterministicMoneyMarket: boolean = false,
  /** Stage 4 one-shot teaching mode: if true, the S&P 500 (`single_stock`)
   *  uses the scripted drop-and-recovery series for THIS tap only. */
  useScriptedSP500Drop: boolean = false,
  /** Stage 4 one-shot: force a positive-ending bimodal series so the
   *  growth-lesson popup is guaranteed to show a winning year. */
  useScriptedSP500Positive: boolean = false,
): {
  accounts: Record<AccountType, Account>;
  checkingBalance: number;
  changes: Record<string, number>;
  crashOccurred: boolean;
  /** Week-by-week balance trajectory for `single_stock` from this tap.
   *  Length = weeks+1. Empty if S&P 500 isn't unlocked or has no balance. */
  sp500Path: number[];
} {
  const newAccounts = { ...accounts };
  const changes: Record<string, number> = {};
  let crashOccurred = false;
  let sp500Path: number[] = [];

  const years = weeks / WEEKS_PER_YEAR;

  // Inflation is not applied to the checking account here. Wallet-only
  // inflation rolls inside `useTimeSpeeder` (random ±1–3% per speeder).
  // Checking holds value 1:1 (it's a 0%-yield investment, not the bank).

  for (const type of Object.keys(newAccounts) as AccountType[]) {
    const account = { ...newAccounts[type] };
    if (!account.isUnlocked || account.balance <= 0) {
      newAccounts[type] = account;
      continue;
    }

    const oldBalance = account.balance;

    switch (type) {
      case 'deposit':
        account.balance = applyAnnualInterest(account.balance, account.annualInterestRate, years);
        break;
      case 'index_fund': {
        if (deterministicMoneyMarket) {
          // Stage 3 teaching mode: steady 4%/yr compounding.
          account.balance = applyAnnualInterest(account.balance, 0.04, years);
        } else {
          const indexReturn = getRandomStockReturn(true);
          // Random return scaled to the time window: a 6% annual roll
          // over 26 weeks ≈ sqrt(1.06) - 1 ≈ +2.96%.
          account.balance = account.balance * Math.pow(1 + indexReturn, years);
        }
        break;
      }
      case 'single_stock': {
        // PRD Stage 4: single_stock is the S&P 500. Returns are sampled
        // weekly from the bimodal sp500Engine distribution. Two one-shot
        // overrides exist:
        //   - useScriptedSP500Drop:     deterministic drop+recovery (4.3)
        //   - useScriptedSP500Positive: positive-ending re-roll      (4.2)
        const w = Math.round(weeks);
        const weekly = useScriptedSP500Drop
          ? generateSP500ScriptedSeries()
          : useScriptedSP500Positive
            ? generateSP500PositiveSeries(w)
            : generateSP500Series(w);
        const path = applyWeeklyReturns(account.balance, weekly);
        sp500Path = path;
        account.balance = path[path.length - 1];
        break;
      }
      case 'pension':
      case 'provident':
        account.balance = applyAnnualInterest(account.balance, account.annualInterestRate, years);
        if (account.lockedUntilSpeeders > 0) {
          account.lockedUntilSpeeders--;
        }
        break;
    }

    changes[type] = Math.round(account.balance - oldBalance);
    newAccounts[type] = account;
  }

  // Suppress unused-var warning for legacy crash params now that the
  // single_stock case no longer uses them.
  void SINGLE_STOCK_CRASH; void SINGLE_STOCK_BOOM; void marketCrashTriggered;

  return {
    accounts: newAccounts,
    checkingBalance: Math.round(checkingBalance),
    changes,
    crashOccurred,
    sp500Path,
  };
}

/**
 * Backward-compat alias — same behavior as before this refactor.
 * Equivalent to `advanceSimWeeks(..., 52)`.
 */
export const simulateOneYear: typeof advanceSimWeeks = (a, b, c) =>
  advanceSimWeeks(a, b, c, WEEKS_PER_YEAR);
