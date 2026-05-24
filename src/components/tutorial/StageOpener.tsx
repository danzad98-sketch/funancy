'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** Stage number 1-5. Drives the ribbon chip + dot positioning. */
  stage: 1 | 2 | 3 | 4 | 5;
  /** Title — short, 1-line. */
  title: string;
  /** Body — 1-3 sentences max. \n line-breaks honoured. */
  body: string;
  /** Optional 56px circular icon (emoji or short string). */
  icon?: string;
  /** Primary CTA label. */
  ctaLabel: string;
  onContinue: () => void;
  /** Minimum ms before CTA becomes tappable. Default 1500. */
  minDisplayMs?: number;
}

/**
 * Stage Opener — the same polished template used at the start of every
 * stage in the intro journey. Layout:
 *
 *   ┌──────────────────────────────────────┐
 *   │  ◆ שלב N מתוך 5                       │ ← gold-ribbon stage chip
 *   │                                       │
 *   │           ╭───────╮                   │
 *   │           │  ICON │  (optional)       │ ← 56px circular tile
 *   │           ╰───────╯                   │
 *   │                                       │
 *   │           Title 24/900                 │
 *   │                                       │
 *   │           Body 16/500                  │
 *   │           (1.45 line height)           │
 *   │                                       │
 *   │       [ Primary CTA — gold ]          │
 *   └──────────────────────────────────────┘
 *
 * Used to mark every transition between stages — narrative ritual that
 * ties the 5 stages into one coherent journey.
 */
export default function StageOpener({
  stage, title, body, icon, ctaLabel, onContinue, minDisplayMs = 1500,
}: Props) {
  const [canDismiss, setCanDismiss] = useState(minDisplayMs <= 0);
  useEffect(() => {
    if (minDisplayMs <= 0) { setCanDismiss(true); return; }
    setCanDismiss(false);
    const id = window.setTimeout(() => setCanDismiss(true), minDisplayMs);
    return () => window.clearTimeout(id);
  }, [minDisplayMs]);

  return (
    <div className="stage-opener" role="dialog" aria-modal="true">
      <div className="stage-opener-card">
        <div className="stage-opener-chip" aria-label={`שלב ${stage} מתוך 5`}>
          <span className="stage-opener-chip-mark">◆</span>
          <span>שלב {stage} מתוך 5</span>
          <div className="stage-opener-dots" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`stage-opener-dot ${i <= stage ? 'stage-opener-dot--on' : ''}`}
              />
            ))}
          </div>
        </div>

        {icon && (
          <div className="stage-opener-icon" aria-hidden>{icon}</div>
        )}

        <h2 className="stage-opener-title">{title}</h2>

        <p className="stage-opener-body" style={{ whiteSpace: 'pre-line' }}>{body}</p>

        <button
          type="button"
          onClick={canDismiss ? onContinue : undefined}
          disabled={!canDismiss}
          aria-disabled={!canDismiss}
          className={`stage-opener-cta ${!canDismiss ? 'stage-opener-cta--locked' : ''}`}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}
