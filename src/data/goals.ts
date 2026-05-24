import type { LifeGoal } from '@/types/goals';
import type { Stage } from '@/types/finance';

export const LIFE_GOALS: LifeGoal[] = [
  {
    id: 'goal_vacation',
    name: 'חופשה בחו"ל',
    price: 5000,
    emoji: '🏖️',
    stageRequired: 1 as Stage,
    isPurchased: false,
  },
  {
    id: 'goal_used_car',
    name: 'רכב יד שנייה',
    price: 15000,
    emoji: '🚗',
    stageRequired: 2 as Stage,
    isPurchased: false,
  },
  {
    id: 'goal_new_car',
    name: 'רכב חדש',
    price: 40000,
    emoji: '🚙',
    stageRequired: 3 as Stage,
    isPurchased: false,
  },
  {
    id: 'goal_apartment',
    name: 'מקדמה לדירה',
    price: 100000,
    emoji: '🏠',
    stageRequired: 4 as Stage,
    isPurchased: false,
  },
  {
    id: 'goal_dream_home',
    name: 'בית החלומות',
    price: 500000,
    emoji: '🏡',
    stageRequired: 5 as Stage,
    isPurchased: false,
  },
];
