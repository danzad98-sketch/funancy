'use client';

/**
 * GridCell — a single cell on the painted Working Board grid.
 *
 * Positioned absolutely at the painted cell's centre (xPct, yPct).
 * The painted cream square is part of the underlying `grid-frame.png`,
 * so this element renders only the item bubble (when present) plus
 * highlight / hover state outlines on top.
 *
 * Game logic (drop target, drag source, merge flash) UNCHANGED.
 */

import type { CSSProperties } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { GridCell as GridCellType } from '@/types/game';
import DraggableItem from './DraggableItem';

interface Props {
  cell: GridCellType;
  isHighlighted: boolean;
  isDraggedFrom: boolean;
  isMerging?: boolean;
  /** Cell centre in percent of the painted grid PNG. */
  xPct: number;
  yPct: number;
}

export default function GridCell({
  cell,
  isHighlighted,
  isDraggedFrom,
  isMerging,
  xPct,
  yPct,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: cell.index,
  });

  const stateClass = isOver
    ? 'is-hover'
    : isHighlighted && cell.item
    ? 'is-highlight'
    : '';

  const style: CSSProperties = {
    // Painted cell centres expressed as CSS custom properties so the
    // .mk-grid-cell rule can use them in `left`/`top`. The translate(-50%)
    // in CSS centres the element on the painted cell.
    ['--x' as string]: `${xPct}%`,
    ['--y' as string]: `${yPct}%`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mk-grid-cell ${stateClass} ${isMerging ? 'merge-flash' : ''}`}
    >
      {cell.item && !isDraggedFrom && (
        <DraggableItem item={cell.item} cellIndex={cell.index} />
      )}
      {isMerging && <div className="ds-merge-burst" aria-hidden />}
    </div>
  );
}
