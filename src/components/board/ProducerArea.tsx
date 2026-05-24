'use client';

/**
 * ProducerArea — three painted "spawner" cards from the casual-merge mockup.
 *
 * Visual: each card is a hand-painted PNG (Chinese takeout, oven, rake)
 * with the purple-tile + gold-border + bolt energy chip + glow baked in.
 * Sources: `public/assets/producers/spawner-{1..3}.png`.
 *
 * Game logic UNCHANGED: tapping a card calls `spawnItem(chain)` exactly
 * as before. Disabled state (no energy / board full) desaturates the
 * card and triggers a shake. Mapping to PRODUCERS:
 *   spawner-1 = sushi   (Chinese takeout)
 *   spawner-2 = burger  (oven)
 *   spawner-3 = art     (rake)
 *
 * Micro-interactions (CSS-driven via class toggles):
 *   .is-spawning — gold flash + sparkle (~320ms) on successful tap
 *   .is-shaking  — denied shake (~320ms) on tap-while-disabled
 *   :active      — press-down 0.95 then bounce-back (idle keyframe resumes)
 *   .is-disabled — greyscale + dimmed brightness, idle paused
 */

import { useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { PRODUCERS } from '@/data/producers';

const CARD_CLASS_BY_CHAIN: Record<string, string> = {
  sushi: 'mk-spawner-card--sushi',
  burger: 'mk-spawner-card--burger',
  art: 'mk-spawner-card--art',
};

export default function ProducerArea() {
  const energy = useGameStore((s) => s.energy);
  const grid = useGameStore((s) => s.grid);
  const spawnItem = useGameStore((s) => s.spawnItem);
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const tutorialArmed = useGameStore((s) => s.tutorialArmed);
  const producerTapCount = useGameStore((s) => s.producerTapCount);
  const bumpProducerTapCount = useGameStore((s) => s.bumpProducerTapCount);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [spawningId, setSpawningId] = useState<string | null>(null);

  const boardFull = grid.every((cell) => cell.item !== null);
  const noEnergy = energy < 1;
  const isDisabled = boardFull || noEnergy;

  // Tutorial gating: during step 1.2 ONLY the oven (burger) is tappable,
  // and only AFTER the user has tapped "המשך" (tutorialArmed === true).
  // After 4 successful taps the tutorial advances.
  const tutorialActive = !tutorialCompleted;
  const isOvenStep = tutorialActive && tutorialStep === 1;

  const handleTap = (producerId: string, chain: string) => {
    if (isDisabled) {
      setShakingId(producerId);
      setTimeout(() => setShakingId(null), 320);
      return;
    }
    // Tutorial gate. During the tutorial:
    //   - any step that's NOT step 1.2 → block all producers entirely
    //   - step 1.2 + !armed → block all producers (popup not yet dismissed)
    //   - step 1.2 + armed → only burger/oven allowed
    if (tutorialActive) {
      if (!isOvenStep) return;
      if (!tutorialArmed) return;
      if (chain !== 'burger') return;
    }

    spawnItem(chain as 'sushi' | 'burger' | 'art');
    setSpawningId(producerId);
    setTimeout(() => setSpawningId(null), 320);

    if (isOvenStep) {
      // Read the FRESH count from the store (not the stale React closure)
      // and increment. Rapid synchronous clicks would otherwise all see
      // producerTapCount=0 and never reach the advance threshold.
      bumpProducerTapCount();
      const fresh = useGameStore.getState().producerTapCount;
      if (fresh >= 4) advanceTutorial();
    }
  };

  return (
    <div className="mk-spawner-row mx-3 mt-3 px-1">
      {PRODUCERS.map((producer) => (
        <button
          key={producer.id}
          type="button"
          onClick={() => handleTap(producer.id, producer.chain)}
          aria-label={`ייצר ${producer.name}`}
          className={`mk-spawner-card ${CARD_CLASS_BY_CHAIN[producer.chain] ?? ''} ${
            isDisabled ? 'is-disabled' : ''
          } ${shakingId === producer.id ? 'is-shaking' : ''} ${
            spawningId === producer.id ? 'is-spawning' : ''
          }`}
        />
      ))}
    </div>
  );
}
