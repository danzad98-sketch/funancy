import type { Account, AccountType } from '@/types/finance';
import {
  DEPOSIT_ANNUAL_RATE,
  PROVIDENT_ANNUAL_RATE,
  PENSION_ANNUAL_RATE,
  PENSION_LOCK_SPEEDERS,
} from '@/lib/constants';

interface AccountDef {
  type: AccountType;
  name: string;
  annualInterestRate: number;
  riskLevel: number;
  unlocksAtStage: number;
  lockedUntilSpeeders: number;
}

// PRD 2 — staged unlock for investment platforms.
//   Stage 1: פיקדון בנקאי     (deposit)
//   Stage 2: קרן כספית         (index_fund)
//   Stage 3: קופת גמל להשקעה   (provident)
//   Stage 4: תיק מסחר עצמאי    (single_stock)
// `checking` is the בנק wallet account, always unlocked.
// `pension` stays in code, hidden until its level is reached (PRD 2.1).
export const ACCOUNT_DEFS: AccountDef[] = [
  {
    type: 'checking',
    name: 'חשבון בנק',
    annualInterestRate: 0,
    riskLevel: 0,
    unlocksAtStage: 1,
    lockedUntilSpeeders: 0,
  },
  {
    // PRD intro-journey: Bank Deposit unlocks at Stage 2 with `deposit_intro`.
    // Stays HIDDEN during the Stage 1 onboarding tutorial.
    type: 'deposit',
    name: 'פיקדון בנקאי',
    annualInterestRate: DEPOSIT_ANNUAL_RATE,
    riskLevel: 0,
    unlocksAtStage: 2,
    lockedUntilSpeeders: 0,
  },
  {
    type: 'index_fund',
    name: 'קרן כספית',
    annualInterestRate: PROVIDENT_ANNUAL_RATE,
    riskLevel: 0.3,
    unlocksAtStage: 2,
    lockedUntilSpeeders: 0,
  },
  {
    type: 'provident',
    name: 'קופת גמל להשקעה',
    annualInterestRate: PROVIDENT_ANNUAL_RATE,
    riskLevel: 0.1,
    unlocksAtStage: 3,
    lockedUntilSpeeders: PENSION_LOCK_SPEEDERS,
  },
  {
    // PRD Stage 4: this account is the S&P 500 (large-cap US index).
    // Its returns are driven by `sp500Engine.ts` from Stage 4 onward.
    type: 'single_stock',
    name: 'S&P 500',
    annualInterestRate: 0,
    riskLevel: 0.6,
    unlocksAtStage: 4,
    lockedUntilSpeeders: 0,
  },
  {
    type: 'pension',
    name: 'קרן פנסיה',
    annualInterestRate: PENSION_ANNUAL_RATE,
    riskLevel: 0.1,
    unlocksAtStage: 5,
    lockedUntilSpeeders: PENSION_LOCK_SPEEDERS,
  },
];

export function createInitialAccounts(): Record<AccountType, Account> {
  const accounts = {} as Record<AccountType, Account>;
  for (const def of ACCOUNT_DEFS) {
    accounts[def.type] = {
      type: def.type,
      name: def.name,
      balance: 0,
      annualInterestRate: def.annualInterestRate,
      riskLevel: def.riskLevel,
      isUnlocked: def.unlocksAtStage <= 1,
      totalDeposited: 0,
      lockedUntilSpeeders: def.lockedUntilSpeeders,
      realizedProfitLoss: 0,
      lastTransactionPL: 0,
    };
  }
  return accounts;
}
