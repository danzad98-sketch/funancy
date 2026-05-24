'use client';

import type { Account } from '@/types/finance';
import { useGameStore } from '@/stores/useGameStore';
import AccountInfoPopup from './AccountInfoPopup';

interface Props {
  account: Account;
  lastChange?: number;
  onClose: () => void;
}

function platformEmoji(type: Account['type']): string {
  switch (type) {
    case 'deposit':       return '🏛️';
    case 'index_fund':    return '💰';
    case 'provident':     return '🏦';
    case 'single_stock':  return '📈';
    case 'pension':       return '🛡️';
    default:              return '💰';
  }
}

export default function AccountCardExpanded({ account, lastChange = 0, onClose }: Props) {
  const { deposit, withdraw } = useGameStore();
  const isLocked = account.lockedUntilSpeeders > 0;

  // Unrealized P/L while position is open; lastTransactionPL when closed.
  // Formula stays as we stabilized it (cost-basis-per-unit math intact).
  const unrealized = account.balance - account.totalDeposited;
  const lastTxPL = account.lastTransactionPL || 0;
  const profitLoss = Math.round(account.balance > 0 ? unrealized : lastTxPL);

  const handleDeposit = () => {
    const input = window.prompt('?כמה להפקיד', '100');
    if (!input) return;
    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) return;
    deposit(account.type, amount);
  };

  const handleSell = () => {
    if (isLocked) {
      window.alert(`הכסף נעול עוד ${account.lockedUntilSpeeders} שימושי מאיץ זמן`);
      return;
    }
    // Default the prompt to the displayed balance so single-Enter sells all.
    const displayedBalance = Math.round(account.balance);
    const input = window.prompt(
      `?כמה למכור (עד ${displayedBalance.toLocaleString()})`,
      String(displayedBalance),
    );
    if (!input) return;
    const amount = parseInt(input, 10);
    if (isNaN(amount) || amount <= 0) return;
    // SELL-ALL DUST FIX: if user requests >= displayed balance, pass the
    // EXACT internal balance so no fractional pennies remain.
    const sellAmount = amount >= displayedBalance ? account.balance : amount;
    withdraw(account.type, sellAmount);
  };

  return (
    <div
      className={`fin-card ${isLocked ? 'locked' : ''}`}
      data-tut={
        account.type === 'deposit' ? 'deposit-account' :
        account.type === 'index_fund' ? 'money-market-account' :
        account.type === 'single_stock' ? 'sp500-account' :
        undefined
      }
    >
      {/* Header strip: platform icon + name + ⓘ on one side, change badge OR lock chip + close on the other */}
      <div className="fin-header">
        <div className="fin-header-left">
          <span className="fin-platform-icon" aria-hidden>{platformEmoji(account.type)}</span>
          <span className="fin-name">{account.name}</span>
          <AccountInfoPopup accountType={account.type} />
        </div>
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="fin-lock-chip">🔒 {account.lockedUntilSpeeders} מאיצים</span>
          ) : lastChange !== 0 ? (
            <span className={`fin-change${lastChange < 0 ? ' neg' : ''}`}>
              {lastChange > 0 ? '↑+' : '↓'}{lastChange}
            </span>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="w-6 h-6 rounded-full bg-white/10 text-white/70 hover:bg-white/20 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Balance hero pill */}
      <div className="fin-balance">
        <span className="fin-balance-coin" aria-hidden />
        <span className="fin-balance-num">{Math.round(account.balance).toLocaleString()}</span>
      </div>

      {/* Glass info row — interest rate + cumulative P/L */}
      <div className="fin-info-row">
        <div className="fin-info-cell">
          <span className="fin-info-label">ריבית</span>
          <span className="fin-info-value">{(account.annualInterestRate * 100).toFixed(0)}% שנתית</span>
        </div>
        <div className="fin-info-cell">
          <span className="fin-info-label">רווח/הפסד ביחס לכל ההפקדות</span>
          <span className={`fin-info-value ${profitLoss >= 0 ? 'pos' : 'neg'}`}>
            {profitLoss >= 0 ? '+' : ''}{profitLoss}
          </span>
        </div>
      </div>

      {/* Action row — green buy, red sell */}
      <div className="fin-actions">
        <button type="button" onClick={handleDeposit} className="fin-btn buy">
          קנייה
        </button>
        <button type="button" onClick={handleSell} disabled={isLocked} className="fin-btn sell">
          מכירה
        </button>
      </div>
    </div>
  );
}
