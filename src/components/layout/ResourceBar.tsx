'use client';

import { useGameStore } from '@/stores/useGameStore';
import { useState, useEffect } from 'react';
import { getTimeUntilNextRegen } from '@/engine/energyEngine';
import { ENERGY_CAP } from '@/lib/constants';
import CountUp from '@/components/ui/CountUp';
// LevelIndicator is mounted separately in GameShell as a strip under
// the header (PRD QA pass — Option B placement).

/**
 * Avatar SVG — placeholder until the painted portrait asset is supplied.
 * The illustration itself is flagged AWAITING ASSET via the parent wrapper.
 */
function AvatarIllustration({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffe3c0" />
          <stop offset="100%" stopColor="#f0b68b" />
        </radialGradient>
        <linearGradient id="hairGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffd46a" />
          <stop offset="100%" stopColor="#c88a2a" />
        </linearGradient>
      </defs>
      <path d="M8 26c0-10 6-17 14-17s14 7 14 17v4c-2-2-5-3-7-3H15c-2 0-5 1-7 3z" fill="url(#hairGrad)" />
      <ellipse cx="22" cy="24" rx="9" ry="10.5" fill="url(#skinGrad)" />
      <path d="M13 18c2-5 6-7 9-7s7 2 9 7c-2-1-5-2-9-2s-7 1-9 2z" fill="url(#hairGrad)" />
      <ellipse cx="19" cy="24" rx="1.2" ry="1.6" fill="#3a2410" />
      <ellipse cx="25" cy="24" rx="1.2" ry="1.6" fill="#3a2410" />
      <path d="M19.5 28.5q2.5 2 5 0" stroke="#b03a2a" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="27" r="1.4" fill="#f5a48a" opacity="0.55" />
      <circle cx="28" cy="27" r="1.4" fill="#f5a48a" opacity="0.55" />
    </svg>
  );
}

/**
 * Pixel-faithful header per chat mockup:
 *   [avatar+lvl badge]   [coin pill]   [bolt pill / timer]   [hourglass pill]   ✨
 *
 * Icons (coin / bolt / hourglass) are painted PNGs supplied by the user.
 * Place them at:  public/assets/icons/coin.png, bolt.png, hourglass.png
 *
 * NO game mechanics are touched here — store reads only.
 */
export default function ResourceBar() {
  const { coins, energy, timeSpeeders, level, lastEnergyRegenTimestamp } = useGameStore();
  const resetGame = useGameStore((s) => s.resetGame);
  const [countdown, setCountdown] = useState('02:00');

  const handleRestart = () => {
    if (typeof window !== 'undefined' && window.confirm('?לאתחל את המשחק')) {
      resetGame();
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getTimeUntilNextRegen(lastEnergyRegenTimestamp, Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastEnergyRegenTimestamp]);

  return (
    <div className="mk-header sticky top-0 z-50 flex items-center justify-between gap-1.5">
      {/* Avatar + level badge */}
      <div className="relative shrink-0">
        <div className="mk-avatar-frame">
          <AvatarIllustration size={56} />
        </div>
        <div className="mk-level-badge">{level}</div>
      </div>

      {/* Coins pill */}
      <div className="mk-pill" aria-label="מטבעות">
        <span
          className="mk-pill-icon"
          aria-hidden
          style={{ '--icon-url': "url('/assets/icons/coin.png')" } as React.CSSProperties}
        />
        <CountUp value={coins} />
      </div>

      {/* Energy pill + timer sub-pill underneath */}
      <div className="mk-pill-stack">
        <div className="mk-pill" aria-label="אנרגיה">
          <span
            className="mk-pill-icon"
            aria-hidden
            style={{ '--icon-url': "url('/assets/icons/bolt.png')" } as React.CSSProperties}
          />
          <CountUp value={energy} duration={260} />
        </div>
        {/* Countdown hides when energy is at cap — nothing to count down to. */}
        {energy < ENERGY_CAP && <span className="mk-pill-sub">{countdown}</span>}
      </div>

      {/* Hourglass pill */}
      <div className="mk-pill" aria-label="מאיצי זמן">
        <span
          className="mk-pill-icon"
          aria-hidden
          style={{ '--icon-url': "url('/assets/icons/hourglass.png')" } as React.CSSProperties}
        />
        <CountUp value={timeSpeeders} duration={260} />
      </div>

      {/* Restart Demo button — visible in the header so the presenter
          can wipe progression between audiences without losing the
          generous demo resources. Confirms via native dialog before
          calling resetGame(). */}
      <button
        type="button"
        onClick={handleRestart}
        aria-label="אתחל הדגמה"
        title="אתחל הדגמה"
        className="mk-restart-btn"
      >
        🔄
      </button>
    </div>
  );
}
