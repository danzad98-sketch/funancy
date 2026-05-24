'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { detectDemoStage, applyDemoPreset } from '@/lib/demoMode';

/**
 * Root route. Two modes:
 *  - With `?demo=stageN`: apply the demo preset (writes a localStorage
 *    snapshot for that stage, then hard-navigates to the stage's home).
 *  - Without `?demo=`: redirect to /board (normal app entry).
 *
 * Client component on purpose: a server-side `redirect('/board')` would
 * strip the `?demo=` query param before it reaches React.
 */
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const stage = detectDemoStage();
    if (stage != null) {
      applyDemoPreset(stage);   // hard-navigates internally
      return;
    }
    router.replace('/board');
  }, [router]);
  return null;
}
