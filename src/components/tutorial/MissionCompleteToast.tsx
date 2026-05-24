'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';

/**
 * Cross-cutting feedback (PRD page 3, "תוספות נוספות"):
 * "When the user completes a Finance Center mission AND is on a
 *  different screen, a popup shows the progress bar filling to
 *  completion + a confetti animation + auto-dismisses after a
 *  few seconds."
 *
 * Implementation:
 *  - Subscribe to `currentMission.isCompleted` flipping true.
 *  - If the current pathname is NOT '/finance', show this toast.
 *  - The toast auto-dismisses after AUTO_DISMISS_MS.
 *  - Stage 1's blocking mission-complete popup is a different
 *    component (Stage1Overlay step 4); this toast is for future
 *    missions only — gated by `stage1Completed === true`.
 */
const AUTO_DISMISS_MS = 3000;
const NUM_CONFETTI = 22;

interface ShownState {
  id: string;
  description: string;
}

export default function MissionCompleteToast() {
  const currentMission = useGameStore((s) => s.currentMission);
  const stage1Completed = useGameStore((s) => s.stage1Completed);
  const pathname = usePathname();
  const [shown, setShown] = useState<ShownState | null>(null);
  const [lastMissionId, setLastMissionId] = useState<string | null>(null);

  useEffect(() => {
    // Wait until Stage 1's bespoke mission-complete popup is past.
    if (!stage1Completed) return;
    if (!currentMission?.isCompleted) return;
    // Don't double-show on /finance — the user's already looking at it.
    if (pathname === '/finance') return;
    // Don't re-trigger if we've already shown for this mission id.
    if (lastMissionId === currentMission.id) return;

    setLastMissionId(currentMission.id);
    setShown({ id: currentMission.id, description: currentMission.description });
    const t = setTimeout(() => setShown(null), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [currentMission, stage1Completed, pathname, lastMissionId]);

  if (!shown) return null;

  return (
    <div className="mission-toast" role="status" aria-live="polite">
      {/* Confetti particles — each falls + rotates with a randomised
          delay + drift, ditched after the auto-dismiss. */}
      {Array.from({ length: NUM_CONFETTI }).map((_, i) => {
        const left = Math.floor((i * 360) / NUM_CONFETTI) % 360;
        const delay = (i % 6) * 50;
        const palette = ['#ffd87b', '#5ed26a', '#7ed1ff', '#ef7a4a', '#a875ff'];
        const bg = palette[i % palette.length];
        return (
          <span
            key={i}
            className="mission-toast-confetti"
            style={{
              left: `${left}px`,
              background: bg,
              animationDelay: `${delay}ms`,
            }}
          />
        );
      })}
      <div className="mission-toast-card">
        <div className="mission-toast-icon">🏆</div>
        <div className="mission-toast-text">
          <div className="mission-toast-title">המשימה הושלמה!</div>
          <div className="mission-toast-sub">{shown.description}</div>
        </div>
        {/* Progress bar filling to 100% */}
        <div className="mission-toast-bar">
          <div className="mission-toast-bar-fill" />
        </div>
      </div>
    </div>
  );
}
