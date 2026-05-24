'use client';

/**
 * BuyerCharacters — 5 painted buyer portraits, sourced from the
 * Board_2 mockup roster image and extracted into individual
 * transparent PNGs by `scripts/extract-buyer-characters.py`.
 *
 *  #1 blonde male in light-blue button-up shirt
 *  #2 brunette woman in green chef top + white apron
 *  #3 Black female police officer in navy uniform with gold badge
 *  #4 older grey-bearded man in plaid shirt + brown overalls
 *  #5 Asian woman scientist in white lab coat
 *
 * Rotation rule (PRD): no two visible sell requests share the same id.
 */

export type BuyerId = 1 | 2 | 3 | 4 | 5;

interface Props {
  id: BuyerId;
  size?: number;
}

export function BuyerCharacter({ id, size = 88 }: Props) {
  // Source PNGs are head-and-shoulders crops with transparent
  // backgrounds; native sizes vary 200–245px wide × 330–360px tall.
  // We render them at the requested `size` (width), and let height
  // scale naturally to keep proportions intact.
  return (
    <img
      src={`/assets/Board_2/character-${id}.png`}
      alt=""
      aria-hidden="true"
      width={size}
      style={{ width: size, height: 'auto', display: 'block' }}
      draggable={false}
    />
  );
}
