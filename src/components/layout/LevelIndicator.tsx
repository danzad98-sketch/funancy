'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { t } from '@/data/strings';

/**
 * Persistent level indicator (PRD QA pass — level widget).
 *
 * Compact stage chip + 5-dot progress strip. Sits inside the header row
 * (between the avatar and the coin pill) so it doesn't fight either the
 * Mission Reminder Widget (bottom-right) or the bottom nav.
 *
 * Reads the current intro-journey stage from the store flags. Disappears
 * once `intro_journey_completed === true` so the post-journey UI is clean.
 */

function getCurrentStage(s: ReturnType<typeof useGameStore.getState>): 1 | 2 | 3 | 4 | 5 {
  if (!s.tutorialCompleted) return 1;
  if (!s.stage1Completed) return 2;
  if (!s.stage3Completed) return 3;
  if (!s.stage4Completed) return 4;
  return 5;
}

export default function LevelIndicator() {
  // Subscribe to the journey flags so the chip re-renders on transitions.
  const tutorialCompleted     = useGameStore((s) => s.tutorialCompleted);
  const stage1Completed       = useGameStore((s) => s.stage1Completed);
  const stage3Completed       = useGameStore((s) => s.stage3Completed);
  const stage4Completed       = useGameStore((s) => s.stage4Completed);
  const stage5Completed       = useGameStore((s) => s.stage5Completed);
  const introJourneyCompleted = useGameStore((s) => s.intro_journey_completed);
  void tutorialCompleted; void stage1Completed; void stage3Completed;
  void stage4Completed; void stage5Completed;

  // Zustand persist rehydrates client-side only — the server has no idea
  // what stage the user is in, so we defer rendering until after the
  // first client effect to avoid the SSR/CSR hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (introJourneyCompleted) return null;

  const stage = getCurrentStage(useGameStore.getState());

  return (
    <div
      className="level-indicator"
      role="status"
      aria-label={t(`stage_label_${stage}`)}
      title={t(`stage_label_${stage}`)}
    >
      <span className="level-indicator-label">{t(`stage_label_${stage}`)}</span>
      <span className="level-indicator-dots" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`level-indicator-dot ${i <= stage ? 'level-indicator-dot--on' : ''}`}
          />
        ))}
      </span>
    </div>
  );
}
