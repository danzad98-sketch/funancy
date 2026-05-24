'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';
import {
  getCurrentTutorialStep,
  TUTORIAL_STEPS,
  gateNeedsArm,
} from '@/data/tutorialSteps';
import { t } from '@/data/strings';
import TutorialPopup from './TutorialPopup';
import Spotlight from './Spotlight';
import Arrow from './Arrow';
import DragGestureDemo from './DragGestureDemo';
import StageOpener from './StageOpener';

/**
 * Tutorial orchestrator (PRD v2).
 *
 * Behaviour:
 *  • While `tutorialArmed === false` → popup is visible with its
 *    Continue button (label per step). User taps → step is "armed".
 *  • While `tutorialArmed === true` → popup hidden, spotlight + arrow
 *    + drag-demo (if any) stay visible, the required action is now
 *    possible. Action handler advances on completion.
 *  • Steps with `gate: 'continue'` skip the armed state and advance
 *    immediately on button tap.
 *  • Step 1.7 `gate: 'nav-meta'` also skips arming — its button is
 *    the action: tap = route to /goals AND advance.
 */
export default function TutorialOverlay() {
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const tutorialArmed = useGameStore((s) => s.tutorialArmed);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const completeTutorial = useGameStore((s) => s.completeTutorial);
  const armTutorialStep = useGameStore((s) => s.armTutorialStep);
  const pathname = usePathname();
  const router = useRouter();

  // Body class so external components can know the tutorial is active.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!tutorialCompleted) {
      document.body.classList.add('tutorial-active');
    } else {
      document.body.classList.remove('tutorial-active');
    }
    return () => document.body.classList.remove('tutorial-active');
  }, [tutorialCompleted]);

  // Auto-advance gate `has-ready-sell` once a sell ticket becomes ready
  // — only fires after the step is armed (per PRD: user taps Continue
  // first, then performs the action).
  useEffect(() => {
    if (tutorialCompleted) return;
    const step = getCurrentTutorialStep(tutorialStep);
    if (!step || step.gate !== 'has-ready-sell' || !tutorialArmed) return;
    const id = setInterval(() => {
      const ready = document.querySelector('.mk-sellcard-sell:not(:disabled)');
      if (ready) advanceTutorial();
    }, 300);
    return () => clearInterval(id);
  }, [tutorialCompleted, tutorialStep, tutorialArmed, advanceTutorial]);

  if (tutorialCompleted) return null;

  const step = getCurrentTutorialStep(tutorialStep);
  if (!step) return null;

  // Route gate: render only on the correct screen.
  if (pathname && step.route && pathname !== step.route) return null;

  const isLastStep = tutorialStep === TUTORIAL_STEPS.length - 1;

  // Continue-button handler depends on gate kind:
  //   • `continue` → advance (or complete if last)
  //   • `nav-meta` → route + advance (button IS the action)
  //   • other gates → arm the step (popup hides, spotlight stays)
  const handleContinue = () => {
    if (step.gate === 'continue') {
      if (isLastStep) {
        completeTutorial();
      } else {
        advanceTutorial();
      }
      return;
    }
    if (step.gate === 'nav-meta') {
      router.push('/goals');
      advanceTutorial();
      return;
    }
    armTutorialStep();
  };

  // Spotlight + arrow stay visible during both phases (popup-up + armed).
  // The popup itself only renders while !armed (and never for action gates
  // already armed — those wait for the action handler to advance).
  const showPopup = !tutorialArmed;

  // Stage 1 opener — replace the bare welcome popup with the polished
  // stage-opener template so the journey starts with a consistent ritual.
  if (showPopup && step.textCode === 'onboarding_welcome') {
    return (
      <StageOpener
        stage={1}
        icon="🎓"
        title={t('stage1_opener_title')}
        body={t('stage1_opener_body')}
        ctaLabel={t('stage1_opener_cta')}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <>
      <Spotlight selector={step.target} blockClicks={true} />
      {step.arrow && step.target && (
        <Arrow selector={step.target} direction={step.arrow} />
      )}
      {step.dragDemo && tutorialArmed && (
        // Drag-gesture demo for the merge step — only render once the
        // user has tapped Continue, so the demo doesn't compete with
        // the popup for attention.
        <DragGestureDemo />
      )}
      {showPopup && (
        <TutorialPopup
          text={t(step.textCode)}
          position={step.position}
          anchorSelector={step.target ?? undefined}
          onContinue={handleContinue}
          continueLabel={t(step.btnTextCode ?? 'onboarding_btn_continue')}
        />
      )}
    </>
  );
}
