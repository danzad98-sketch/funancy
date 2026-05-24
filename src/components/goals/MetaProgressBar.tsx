'use client';

/**
 * 9-step Meta Goal progress bar (PRD 3).
 * Each segment is a discrete chunk. Segments fill in order based on
 * the fraction prop, computed by `getMetaProgressFraction` (auto-scale
 * across whatever total upgrades exist in the current data).
 */
const SEGMENTS = 9;

interface Props {
  fraction: number; // 0..1
}

export default function MetaProgressBar({ fraction }: Props) {
  const filled = Math.round(fraction * SEGMENTS);
  const isComplete = filled >= SEGMENTS;

  return (
    <div className={`mk-meta-progress ${isComplete ? 'is-complete' : ''}`}>
      <div className="mk-meta-progress-track">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className={`mk-meta-progress-seg ${i < filled ? 'is-filled' : ''}`}
          />
        ))}
      </div>
      <div className="mk-meta-progress-label">
        {isComplete ? '🏆 הושלם!' : `${filled} מתוך ${SEGMENTS}`}
      </div>
    </div>
  );
}
