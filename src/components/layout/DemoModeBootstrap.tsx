'use client';

import { useEffect } from 'react';
import { detectDemoStage, applyDemoPreset } from '@/lib/demoMode';

/**
 * Mounts once at app root. If the URL carries a `?demo=stageN` param, the
 * preset is applied to the live store and the URL is replaced with the
 * stage's home route. Otherwise: no-op.
 *
 * Mounted inside GameShell so it sits below the Zustand provider and can
 * read/write the store cleanly post-rehydration.
 */
export default function DemoModeBootstrap() {
  useEffect(() => {
    const stage = detectDemoStage();
    if (!stage) return;
    // Defer one microtask so persist's rehydrate has fully landed before
    // we overwrite the store.
    Promise.resolve().then(() => applyDemoPreset(stage));
  }, []);

  return null;
}
