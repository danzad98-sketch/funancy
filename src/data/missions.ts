import type { Mission, Stage } from '@/types/finance';

export const STAGE_MISSIONS: Mission[] = [
  // Stage 1: PRD "user flow part 1" — earn 100 coins through the
  // Working Board. Reward is 2 time speeders, paid out at the moment
  // the Stage 1 onboarding flow confirms the mission complete popup.
  {
    id: 'mission_1',
    stageId: 1,
    type: 'earn_coins',
    description: 'הרווח 25 מטבעות 💰',
    targetValue: 25,
    currentValue: 0,
    isCompleted: false,
    rewardType: 'speeder',
    rewardAmount: 2,
  },
  // Stage 2: Use the speeder you just earned
  {
    id: 'mission_2',
    stageId: 2,
    type: 'use_speeder',
    description: 'השתמש במאיץ זמן — צפה בריבית גדלה!',
    targetValue: 1,
    currentValue: 0,
    isCompleted: false,
    rewardType: 'coins',
    rewardAmount: 200,
  },
  // Stage 3: Earn 5 coins profit from investments
  {
    id: 'mission_3',
    stageId: 3,
    type: 'deposit_profit',
    description: 'הרוויח 5 מטבעות מהשקעות — ריבית דריבית בפעולה!',
    targetValue: 5,
    currentValue: 0,
    isCompleted: false,
    rewardType: 'speeder',
    rewardAmount: 2,
  },
  // Stage 4: Sell a tier 3+ item — connects board to finance
  {
    id: 'mission_4',
    stageId: 4,
    type: 'sell_tier3',
    description: 'מכור מוצר בדרגה 3 או יותר — מיזוגים משתלמים!',
    targetValue: 1,
    currentValue: 0,
    isCompleted: false,
    rewardType: 'speeder',
    rewardAmount: 2,
  },
  // Stage 5: Diversify investments
  {
    id: 'mission_5',
    stageId: 5,
    type: 'diversify',
    description: 'פזר את ההשקעות שלך — הפקד כסף ב-2 מכשירים שונים',
    targetValue: 2,
    currentValue: 0,
    isCompleted: false,
    rewardType: 'coins',
    rewardAmount: 1000,
  },
];

export function getMissionForStage(stage: Stage): Mission {
  const index = Math.min(stage - 1, STAGE_MISSIONS.length - 1);
  return { ...STAGE_MISSIONS[index] };
}
