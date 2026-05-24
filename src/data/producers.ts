import type { Producer } from '@/types/game';

export const PRODUCERS: Producer[] = [
  {
    id: 'producer_sushi',
    chain: 'sushi',
    energyCost: 1,
    emoji: '🥡',
    name: 'מסעדת סושי',
  },
  {
    id: 'producer_burger',
    chain: 'burger',
    energyCost: 1,
    emoji: '🍳',
    name: 'מטבח המבורגרים',
  },
  {
    id: 'producer_art',
    chain: 'art',
    energyCost: 1,
    emoji: '🖊️',
    name: 'סטודיו אמנות',
  },
];
