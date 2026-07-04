'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGameStore } from '@/stores/useGameStore';

/* Illustrated "temple/bank" icon — matches Finance Center mockup pose. */
function BankTempleIcon({ active }: { active: boolean }) {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" aria-hidden="true">
      <defs>
        <linearGradient id="tempG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff7df" />
          <stop offset="100%" stopColor="#d9a85a" />
        </linearGradient>
      </defs>
      {/* base */}
      <rect x="3" y="28" width="34" height="5" rx="1" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1.2" />
      {/* columns */}
      <rect x="7" y="14" width="3.5" height="14" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1" />
      <rect x="14" y="14" width="3.5" height="14" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1" />
      <rect x="22.5" y="14" width="3.5" height="14" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1" />
      <rect x="29.5" y="14" width="3.5" height="14" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1" />
      {/* architrave */}
      <rect x="4" y="11" width="32" height="4" rx="1" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1.2" />
      {/* pediment */}
      <polygon points="4,11 20,2 36,11" fill="url(#tempG)" stroke="#7a4a1e" strokeWidth="1.2" strokeLinejoin="round" />
      {/* gold star */}
      <path d="M20 4.5l1 2.3 2.5 0.25-1.9 1.7 0.6 2.5L20 9.7l-2.2 1.55 0.6-2.5-1.9-1.7 2.5-0.25z"
            fill={active ? '#ff8f00' : '#ffc94a'} stroke="#8a5a1a" strokeWidth="0.5" />
    </svg>
  );
}

/* Illustrated "photos + car" icon — Meta Goal. */
function GoalsPhotosIcon({ active }: { active: boolean }) {
  return (
    <svg width="42" height="36" viewBox="0 0 42 36" aria-hidden="true">
      <defs>
        <linearGradient id="photoBG" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9fd7ef" />
          <stop offset="100%" stopColor="#f2b3a8" />
        </linearGradient>
      </defs>
      {/* back photo — palm/beach */}
      <g transform="rotate(-10 13 18)">
        <rect x="4" y="6" width="18" height="22" rx="1.5" fill="#fff6e3" stroke="#7a4a1e" strokeWidth="1.2" />
        <rect x="5.2" y="7.2" width="15.6" height="17" fill="url(#photoBG)" />
        {/* palm trunk */}
        <path d="M14 22 q-0.5 -5 0 -10" stroke="#6a3a1a" strokeWidth="1.2" fill="none" />
        {/* fronds */}
        <path d="M14 12 q-4 -2 -6 0 M14 12 q4 -2 6 0 M14 12 q-3 -4 -1 -6 M14 12 q3 -4 1 -6" stroke="#2b7a3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        {/* sand */}
        <rect x="5.2" y="20" width="15.6" height="4" fill="#f0d89a" />
      </g>
      {/* front photo — red sports car */}
      <g transform="rotate(8 26 22)">
        <rect x="17" y="12" width="22" height="18" rx="1.5" fill="#fff6e3" stroke="#7a4a1e" strokeWidth="1.2" />
        <rect x="18.2" y="13.2" width="19.6" height="13" fill="#a3dfe6" />
        {/* road */}
        <rect x="18.2" y="22" width="19.6" height="4.2" fill="#c9b58a" />
        {/* car body */}
        <path d="M20 22 l2 -3 h8 l3 3 z" fill="#d43a3a" stroke="#8a1f1f" strokeWidth="0.9" />
        <rect x="22" y="20" width="5" height="2.5" fill="#fff5ee" opacity="0.7" />
        <circle cx="23" cy="23.5" r="1.2" fill="#2a1408" />
        <circle cx="30" cy="23.5" r="1.2" fill="#2a1408" />
      </g>
      {active && (
        <circle cx="36" cy="6" r="3" fill="#ff8f00" stroke="#fff" strokeWidth="1.2">
          <animate attributeName="r" values="3;4;3" dur="1.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

/* "Work/stall" icon — shows striped awning for current board tab. */
function BoardStallIcon({ active }: { active: boolean }) {
  return (
    <svg width="40" height="36" viewBox="0 0 40 36" aria-hidden="true">
      {/* awning */}
      <rect x="4" y="6" width="32" height="6" fill="#e63838" />
      <rect x="4" y="6" width="32" height="6" fill="url(#stripes)" />
      <defs>
        <pattern id="stripes" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="3" height="6" fill="#e63838" />
          <rect x="3" width="3" height="6" fill="#fff5ee" />
        </pattern>
      </defs>
      {/* counter */}
      <rect x="4" y="12" width="32" height="3" fill="#8a5a2a" />
      <rect x="8" y="15" width="24" height="14" fill="#c9a56a" stroke="#7a4a1e" strokeWidth="1.2" />
      <rect x="14" y="20" width="12" height="9" fill="#f0d89a" />
      {active && <circle cx="34" cy="6" r="2.5" fill="#ff8f00" />}
    </svg>
  );
}

const tabs: Array<{
  href: string;
  label: string;
  tutKey: 'nav-finance' | 'nav-board' | 'nav-goals';
  render: (active: boolean) => React.ReactNode;
}> = [
  { href: '/finance', label: 'מרכז פיננסי', tutKey: 'nav-finance', render: (a) => <BankTempleIcon active={a} /> },
  { href: '/board',   label: 'עבודה',       tutKey: 'nav-board',   render: (a) => <BoardStallIcon active={a} /> },
  { href: '/goals',   label: 'מטרות',       tutKey: 'nav-goals',   render: (a) => <GoalsPhotosIcon active={a} /> },
];

export default function BottomNav() {
  const pathname = usePathname();
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);
  const stage1Completed = useGameStore((s) => s.stage1Completed);
  const stage1Step = useGameStore((s) => s.stage1Step);
  const advanceStage1 = useGameStore((s) => s.advanceStage1);
  const stage1Active = tutorialCompleted && !stage1Completed;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 px-3 pb-3 pt-2 flex items-end justify-between gap-2 pointer-events-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        // Tutorial gating: during step 1.7 (tutorialStep === 6) ONLY the
        // goals nav is tappable. Both the popup button "עבור" AND the
        // nav button itself trigger the route + advance.
        const isGoalsStep = !tutorialCompleted && tutorialStep === 6;
        const blockedByTutorial = !tutorialCompleted && !(isGoalsStep && tab.tutKey === 'nav-goals');

        // Stage 1 nav gating:
        //   step 0 → finance nav only
        //   step 2 → board nav only
        const isStage1FinanceStep = stage1Active && stage1Step === 0;
        const isStage1BoardStep   = stage1Active && stage1Step === 2;
        const blockedByStage1 =
          (isStage1FinanceStep && tab.tutKey !== 'nav-finance') ||
          (isStage1BoardStep   && tab.tutKey !== 'nav-board');

        const blocked = blockedByTutorial || blockedByStage1;

        const handleClick = (e: React.MouseEvent) => {
          if (blocked) {
            e.preventDefault();
            return;
          }
          if (isGoalsStep && tab.tutKey === 'nav-goals') {
            advanceTutorial();
          } else if (isStage1FinanceStep && tab.tutKey === 'nav-finance') {
            advanceStage1();
          } else if (isStage1BoardStep && tab.tutKey === 'nav-board') {
            advanceStage1();
          }
        };

        return (
          <Link
            key={tab.href}
            href={tab.href}
            onClick={handleClick}
            data-tut={tab.tutKey}
            className={`nav-illus-card pointer-events-auto ${isActive ? 'active' : ''}`}
          >
            <div className={isActive ? 'drop-shadow' : 'opacity-95'}>{tab.render(isActive)}</div>
            <span className="text-[11px] font-black text-[#5a2a00] mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
