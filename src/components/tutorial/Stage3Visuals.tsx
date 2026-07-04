'use client';

import { useGameStore } from '@/stores/useGameStore';
import { t } from '@/data/strings';
import { STAGE3_MM_ANNUAL_RATE } from '@/data/stage3Steps';

interface ScreenProps { onContinue: () => void; ctaLabel?: string; caption?: string; }

/**
 * Weekly savings growth lesson visual.
 *
 *   Animated bar chart: 12 weekly bars showing the deposit balance
 *   climbing as the standing order accumulates. Each bar = the running
 *   total at week N. Caption above, CTA below.
 *
 *   Pulled from real state — uses `s3StandingOrderTotal` divided into
 *   12 even weekly increments so the graph always reflects what the
 *   player actually accumulated this stage.
 */
export function WeeklySavingsGraph(props: ScreenProps) {
  const total = useGameStore((s) => s.s3StandingOrderTotal || 0);
  const weeks = 12;
  // Synthesize 12 weekly values that monotonically rise to `total`.
  // Use a slight curve (sqrt-like) so it feels like accumulation, not linear.
  const values: number[] = Array.from({ length: weeks }, (_, i) => {
    const t = (i + 1) / weeks;
    // Compound-flavored curve so later weeks grow a bit faster.
    return Math.round(total * Math.pow(t, 0.85));
  });

  const W = 320, H = 180;
  const padL = 36, padR = 14, padT = 16, padB = 30;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxV = Math.max(1, ...values);
  const barWidth = plotW / weeks - 4;

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="inflation-screen-caption">{props.caption ?? t('visual_habit_savings')}</div>

        <svg
          className="weekly-savings-svg"
          viewBox={`0 0 ${W} ${H}`}
          width={W}
          height={H}
          aria-hidden
        >
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH}
                stroke="rgba(74,41,0,0.35)" strokeWidth="1" />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH}
                stroke="rgba(74,41,0,0.35)" strokeWidth="1" />
          {values.map((v, i) => {
            const x = padL + i * (plotW / weeks) + 2;
            const h = (v / maxV) * plotH;
            const y = padT + plotH - h;
            return (
              <rect
                key={i}
                x={x} y={y}
                width={barWidth} height={h}
                rx={3} ry={3}
                fill="#4ade80"
                opacity={0.9}
                className="weekly-savings-bar"
                style={{ animationDelay: `${i * 70}ms` }}
              />
            );
          })}
          <text x={padL + plotW - 4} y={padT + 12}
                fill="#15803d" fontSize="13" fontWeight="900" textAnchor="end">
            {Math.round(total)} ₪
          </text>
        </svg>

        <div className="weekly-savings-meta">
          <span className="weekly-savings-bullet" style={{ background: '#4ade80' }} />
          <span>{t('standing_order_label')}</span>
        </div>

        <button type="button" className="tut-popup-btn" onClick={props.onContinue}>
          {props.ctaLabel ?? t('visual_habit_to_goals_btn')}
        </button>
      </div>
    </div>
  );
}

interface LessonBranchProps {
  branch: 'disciplined' | 'partial' | 'spent';
  ordersInSales: number;
  savedTotal: number;
  spentTotal: number;
  onContinue: () => void;
}

/**
 * Stage 3 lesson popup — final behaviour-based screen at step 20.
 *
 *   - disciplined: no purchases during either sale → straight to next stage
 *   - partial: bought during exactly one sale → makeup mission (1.0× orders)
 *   - spent: bought during both sales → bigger makeup mission (1.5× orders)
 */
export function Stage3LessonBranch(p: LessonBranchProps) {
  const codes = {
    disciplined: 'savings_lesson_disciplined',
    partial:     'savings_lesson_partial',
    spent:       'savings_lesson_spent',
  } as const;
  const buttonCode =
    p.branch === 'disciplined'
      ? 'savings_lesson_disciplined_btn'
      : 'savings_lesson_makeup_btn';

  // Interpolate runtime numbers into the lesson copy.
  const interestPct = Math.round(STAGE3_MM_ANNUAL_RATE * 100);
  // Missing amount = orders the player needs to make up, surfaced as approx coins.
  const missingApprox = Math.round(p.spentTotal); // simplified — needs equal recovery in coins
  const raw = t(codes[p.branch]);
  const filled = raw
    .replaceAll('[SAVED]',    String(Math.round(p.savedTotal)))
    .replaceAll('[SPENT]',    String(Math.round(p.spentTotal)))
    .replaceAll('[MISSING]',  String(missingApprox))
    .replaceAll('[INTEREST]', String(interestPct));

  return (
    <div className="inflation-screen" role="dialog" aria-modal="true">
      <div className="inflation-screen-inner">
        <div className="lesson-branch-text" style={{ whiteSpace: 'pre-line' }}>{filled}</div>
        <button type="button" className="tut-popup-btn" onClick={p.onContinue}>
          {t(buttonCode)}
        </button>
      </div>
    </div>
  );
}
