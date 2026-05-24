'use client';

import { useEffect, useState } from 'react';
import { currentDemoStage, clearDemoSession } from '@/lib/demoMode';

/**
 * Subtle "🎬 Demo Mode — שלב N" chip, top-left corner.
 * Visible only when this tab was opened via a `?demo=stageN` URL — the
 * chip reads from `sessionStorage`, so it disappears on a tab close +
 * full state reset. Clicking the ✕ on the chip clears the chip without
 * touching gameplay state.
 */
export default function DemoModeChip() {
  const [stage, setStage] = useState<number | null>(null);

  useEffect(() => {
    setStage(currentDemoStage());
  }, []);

  if (stage == null) return null;

  return (
    <div className="demo-mode-chip" role="status" aria-label={`Demo Mode — שלב ${stage}`}>
      <span className="demo-mode-chip-icon" aria-hidden>🎬</span>
      <span className="demo-mode-chip-label">Demo Mode · שלב {stage}</span>
      <button
        type="button"
        className="demo-mode-chip-close"
        aria-label="סגור"
        onClick={() => { clearDemoSession(); setStage(null); }}
      >
        ✕
      </button>
    </div>
  );
}
