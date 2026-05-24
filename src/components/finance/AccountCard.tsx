'use client';

import type { Account } from '@/types/finance';
import AccountInfoPopup from './AccountInfoPopup';

interface Props {
  account: Account;
  lastChange?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Collapsed investment platform card — fits in a vertical list.
 * Tap to expand into the full `.fin-card` view (AccountCardExpanded).
 * Visual: navy gradient pill with platform name + balance + caret.
 */
function platformEmoji(type: Account['type']): string {
  switch (type) {
    case 'deposit':       return '🏛️';
    case 'index_fund':    return '💰';
    case 'provident':     return '🏦';
    case 'single_stock':  return '📈'; // S&P 500
    case 'pension':       return '🛡️';
    default:              return '💰';
  }
}

export default function AccountCard({ account, lastChange = 0, onToggle }: Props) {
  // Use a div + role=button so the AccountInfoPopup <button> can nest
  // inside without violating "no button inside a button" HTML rules.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className="fin-pill"
      aria-label={`פתח ${account.name}`}
      data-tut={
        account.type === 'deposit' ? 'deposit-account' :
        account.type === 'index_fund' ? 'money-market-account' :
        account.type === 'single_stock' ? 'sp500-account' :
        undefined
      }
    >
      <div className="fin-pill-left">
        <span className="fin-platform-icon" aria-hidden>{platformEmoji(account.type)}</span>
        <span className="fin-pill-name">{account.name}</span>
        {/* AccountInfoPopup stops propagation internally so tapping ⓘ
            doesn't trigger the parent expand action. */}
        <AccountInfoPopup accountType={account.type} />
      </div>
      <div className="fin-pill-balance">
        {lastChange !== 0 && (
          <span className={`fin-change${lastChange < 0 ? ' neg' : ''}`}>
            {lastChange > 0 ? '↑+' : '↓'}{lastChange}
          </span>
        )}
        <span className="fin-pill-coin" aria-hidden />
        <span className="fin-pill-num">{Math.round(account.balance).toLocaleString()}</span>
        <span className="fin-pill-caret" aria-hidden>◂</span>
      </div>
    </div>
  );
}
