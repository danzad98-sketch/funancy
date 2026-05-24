'use client';

import { useRef, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import type { AccountType } from '@/types/finance';
import AccountCard from './AccountCard';
import AccountCardExpanded from './AccountCardExpanded';
import StandingOrderRow from './StandingOrderRow';

export default function AccountBreakdown() {
  const coins = useGameStore((s) => s.coins);
  const accounts = useGameStore((s) => s.accounts);
  const lastChanges = useGameStore((s) => s.lastChanges);
  const standingOrderActive = useGameStore((s) => s.s3StandingOrderActive);
  const stage3Completed     = useGameStore((s) => s.stage3Completed);
  const [expandedType, setExpandedType] = useState<AccountType | null>(null);
  const investmentsRef = useRef<HTMLDivElement>(null);

  const unlockedAccounts = Object.values(accounts).filter(
    (a) => a.isUnlocked && a.type !== 'checking'
  );

  // Uninvested cash (wallet/bank balance)
  const bankBalance = coins;
  // Total invested = sum of all non-checking account current balances
  const totalInvested = unlockedAccounts.reduce((sum, a) => sum + a.balance, 0);
  // Total assets = everything combined
  const totalAssets = bankBalance + totalInvested;

  return (
    <div className="game-panel mx-3 mt-3 overflow-hidden">
      <div className="bg-gradient-to-l from-bg-finance to-[#0f2238] text-white text-center py-2.5">
        <div className="font-black text-sm game-text-outline tracking-wide">פירוט חשבונות</div>
        <div className="text-[10px] text-white/50 font-bold">שינויים מכניסה אחרונה</div>
      </div>

      {/* --- Total Assets dashboard --- */}
      <div className="mx-3 mt-3 rounded-xl bg-gradient-to-b from-[#2a1f0f] to-[#1a1208] border-2 border-coin-gold/60 p-3 shadow-inner">
        {/* Total assets — big + bold */}
        <div className="text-center mb-3">
          <div className="text-[10px] text-coin-shine/70 font-bold uppercase tracking-wider">סה״כ נכסים</div>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="mk-icon mk-icon-coin mk-icon--lg" aria-hidden />
            <span className="font-black text-3xl text-coin-shine game-text-outline">
              {Math.round(totalAssets).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-coin-gold/20 my-2"></div>

        {/* Breakdown: Bank Balance */}
        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏦</span>
            <div>
              <div className="font-black text-sm text-coin-shine">חשבון בנק</div>
              <div className="text-[9px] text-loss-red/80 font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>מאבד ערך לאינפלציה</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="mk-icon mk-icon-coin mk-icon--sm" aria-hidden />
            <span className="font-black text-lg text-white">
              {Math.round(bankBalance).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Breakdown: Investments — tappable to scroll to details */}
        {/* Total invested — small inline pill, no generic "השקעות" label
            since the named platform cards appear below (PRD 2). */}
        {totalInvested > 0 && (
          <div className="flex items-center justify-between py-2 px-1 border-t border-coin-gold/10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-highlight-green/90 font-bold flex items-center gap-1">
                <span>🛡️</span>
                <span>מוגן מאינפלציה</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="mk-icon mk-icon-coin mk-icon--sm" aria-hidden />
              <span className="font-black text-lg text-white">
                {Math.round(totalInvested).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Standing-order row — only visible during Stage 3 while the
          standing order is active. Quietly confirms 50%-to-deposit is on. */}
      {standingOrderActive && !stage3Completed && <StandingOrderRow />}

      {/* Investment platform cards — each shows its named platform.
          Each card has its own info popup (ⓘ) next to the title. */}
      <div ref={investmentsRef} className="p-3 space-y-2">
        {unlockedAccounts.length === 0 ? (
          <div className="text-center text-xs text-wood-dark/60 font-bold py-4">
            אין השקעות עדיין. התחל להפקיד כדי להגן על הכסף שלך!
          </div>
        ) : (
          unlockedAccounts.map((account) =>
            expandedType === account.type ? (
              <AccountCardExpanded
                key={account.type}
                account={account}
                lastChange={lastChanges[account.type]}
                onClose={() => setExpandedType(null)}
              />
            ) : (
              <AccountCard
                key={account.type}
                account={account}
                lastChange={lastChanges[account.type]}
                isExpanded={false}
                onToggle={() => setExpandedType(account.type)}
              />
            )
          )
        )}
      </div>
    </div>
  );
}
