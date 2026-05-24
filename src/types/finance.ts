export type AccountType = 'checking' | 'deposit' | 'money_market' | 'index_fund' | 'single_stock' | 'pension' | 'provident';
export type Stage = 1 | 2 | 3 | 4 | 5;

export interface Account {
  type: AccountType;
  name: string;
  balance: number;
  annualInterestRate: number;
  riskLevel: number;
  isUnlocked: boolean;
  totalDeposited: number;
  lockedUntilSpeeders: number;
  // Cumulative realized profit/loss from past withdrawals.
  // Kept for backward-compatibility with persisted state; not used for display.
  realizedProfitLoss: number;
  // P/L of the most recent withdrawal (amountReceived - proportionalCostBasis).
  // Used to display transaction-level P/L when balance reaches 0.
  lastTransactionPL: number;
}

export type MissionType = 'earn_coins' | 'deposit' | 'profit' | 'survive_crash' | 'diversify' | 'first_deposit' | 'deposit_profit' | 'sell_tier3' | 'merge_count' | 'use_speeder';

export interface Mission {
  id: string;
  stageId: Stage;
  type: MissionType;
  description: string;
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  rewardType: 'energy' | 'coins' | 'speeder';
  rewardAmount: number;
}
