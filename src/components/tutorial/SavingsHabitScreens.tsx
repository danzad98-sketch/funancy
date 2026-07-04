'use client';

import { t } from '@/data/strings';

interface ScreenProps {
  onContinue: () => void;
}

/**
 * Stage 3 educational visuals.
 *
 *  1. SavingsHabit1Screen — line graph of money market balance over
 *     12 months at a steady contribution pace. SVG, stroke-dashoffset
 *     draw-in animation. Caption from `savings_habit_1`.
 *
 *  2. SavingsHabit2Screen — side-by-side comparison of two savers:
 *     🔴 someone who waited for "the right moment" (small balance)
 *     🟢 someone who started early (large balance). Two animated bars.
 *     Caption from `savings_habit_2`.
 */

export function SavingsHabit1Screen({ onContinue }: ScreenProps) {
  // 12 months of steady 30/mo contributions @ 4%/yr = 0.327%/mo.
  const months = 12;
  const contribution = 30;
  const monthlyRate = 0.04 / 12;
  const balances: number[] = [];
  let balance = 0;
  for (let i = 1; i <= months; i++) {
    balance = (balance + contribution) * (1 + monthlyRate);
    balances.push(balance);
  }

  const W = 300;
  const H = 170;
  const padL = 32;
  const padR = 8;
  const padT = 12;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxY = balances[balances.length - 1];

  const xFor = (i: number) => padL + (i / (months - 1)) * plotW;
  const yFor = (v: number) => padT + plotH - (v / maxY) * plotH;

  const path = balances
    .map((b, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(b)}`)
    .join(' ');

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('savings_habit_1')}</div>

        <svg
          className="savings-habit-svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          aria-hidden
        >
          {/* axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
                stroke="rgba(74,41,0,0.35)" strokeWidth="1" />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH}
                stroke="rgba(74,41,0,0.35)" strokeWidth="1" />

          {/* month ticks (every 3rd) */}
          {[0, 3, 6, 9, 11].map((i) => (
            <text key={i} x={xFor(i)} y={padT + plotH + 14}
                  fill="rgba(74,41,0,0.72)" fontSize="10" textAnchor="middle">
              {`חודש ${i + 1}`}
            </text>
          ))}

          {/* growth curve */}
          <path
            d={path}
            fill="none"
            stroke="#4ade80"
            strokeWidth="3"
            strokeLinecap="round"
            className="savings-line"
          />
          {/* end-point dot + label */}
          <circle
            cx={xFor(months - 1)} cy={yFor(maxY)}
            r="5" fill="#4ade80" stroke="#fff8ed" strokeWidth="2"
          />
          <text
            x={xFor(months - 1) - 6} y={yFor(maxY) - 10}
            fill="#2c1608" fontSize="11" fontWeight="900" textAnchor="end"
          >
            {`${Math.round(maxY)}₪`}
          </text>
        </svg>

        <div className="savings-habit-legend">
          <span><span className="hedge-dot hedge-dot--green" aria-hidden /> חיסכון חודשי קבוע</span>
        </div>

        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          הבא
        </button>
      </div>
    </div>
  );
}

export function SavingsHabit2Screen({ onContinue }: ScreenProps) {
  // Side-by-side: waited (🔴 small) vs early starter (🟢 large)
  // Numbers chosen to feel intuitive: starting 10 years earlier @ 30/mo →
  // dramatically larger balance.
  const waited = 1200;
  const early  = 4800;
  const max    = Math.max(waited, early);

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{t('savings_habit_2')}</div>

        <div className="savings-compare">
          <div className="savings-compare-col">
            <div className="savings-compare-emoji">🐢</div>
            <div className="savings-compare-label">חיכה לרגע הנכון</div>
            <div className="savings-compare-bar savings-compare-bar--track">
              <div
                className="savings-compare-bar-fill savings-compare-bar-fill--red"
                style={{ ['--target-h' as string]: `${(waited / max) * 100}%` } as React.CSSProperties}
              />
            </div>
            <div className="savings-compare-value savings-value--red">{waited}₪</div>
          </div>

          <div className="savings-compare-col">
            <div className="savings-compare-emoji">🚀</div>
            <div className="savings-compare-label">התחיל מוקדם</div>
            <div className="savings-compare-bar savings-compare-bar--track">
              <div
                className="savings-compare-bar-fill savings-compare-bar-fill--green"
                style={{ ['--target-h' as string]: `${(early / max) * 100}%` } as React.CSSProperties}
              />
            </div>
            <div className="savings-compare-value savings-value--green">{early}₪</div>
          </div>
        </div>

        <button type="button" className="tut-popup-btn" onClick={onContinue}>
          הבנתי
        </button>
      </div>
    </div>
  );
}
