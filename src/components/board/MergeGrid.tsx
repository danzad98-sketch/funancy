'use client';

/**
 * MergeGrid — painted 6x4 wooden-frame grid (Asset 2).
 *
 * Visual: `public/assets/board/grid-frame.png` (1600x1078) is the
 * backdrop. Each cell is positioned absolutely at the painted cell
 * centre measured by `scripts/measure-grid-cells.py` (option A1 —
 * pixel-faithful, not a CSS-grid overlay).
 *
 * Game logic UNCHANGED from previous version: dnd-kit drag/drop,
 * merge detection, swap fallback, highlight system are identical.
 */

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core';
import { useGameStore } from '@/stores/useGameStore';
import { findHighlightedCells } from '@/engine/orderEngine';
import { canMerge } from '@/engine/mergeEngine';
import { GRID_SIZE } from '@/lib/constants';
import { toast } from '@/components/ui/toast';
import GridCell from './GridCell';

/* Painted-cell centre coordinates as a percentage of the grid PNG.
 * Computed by scripts/measure-grid-cells.py — perfectly aligned 6x4
 * mathematical grid (the painter used a template). Order is row-major
 * so the index matches `cell.index` from the existing store. */
const PAINTED_CELLS = [
  { xPct: 10.64, yPct: 15.68 }, { xPct: 26.32, yPct: 15.68 }, { xPct: 41.97, yPct: 15.69 },
  { xPct: 57.63, yPct: 15.69 }, { xPct: 73.29, yPct: 15.68 }, { xPct: 88.98, yPct: 15.69 },
  { xPct: 10.66, yPct: 37.92 }, { xPct: 26.31, yPct: 37.90 }, { xPct: 41.97, yPct: 37.91 },
  { xPct: 57.62, yPct: 37.92 }, { xPct: 73.28, yPct: 37.92 }, { xPct: 88.98, yPct: 37.93 },
  { xPct: 10.66, yPct: 59.95 }, { xPct: 26.31, yPct: 59.93 }, { xPct: 41.98, yPct: 59.94 },
  { xPct: 57.62, yPct: 59.96 }, { xPct: 73.29, yPct: 59.95 }, { xPct: 88.98, yPct: 59.96 },
  { xPct: 10.66, yPct: 82.38 }, { xPct: 26.31, yPct: 82.38 }, { xPct: 41.98, yPct: 82.37 },
  { xPct: 57.62, yPct: 82.37 }, { xPct: 73.29, yPct: 82.37 }, { xPct: 88.98, yPct: 82.38 },
];

// Custom collision: only match droppable cells (ids 0-23), ignore draggable items
const cellOnlyCollision: CollisionDetection = (args) => {
  const droppableContainers = args.droppableContainers.filter((container) => {
    const id = container.id;
    return typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));
  });
  return rectIntersection({ ...args, droppableContainers });
};

export default function MergeGrid() {
  const grid = useGameStore((s) => s.grid);
  const sellRequests = useGameStore((s) => s.sellRequests);
  const moveItem = useGameStore((s) => s.moveItem);
  const mergeItems = useGameStore((s) => s.mergeItems);
  const claimMaxTierBonus = useGameStore((s) => s.claimMaxTierBonus);
  // Tutorial gating: any successful merge during armed step 1.3 advances.
  const tutorialStep = useGameStore((s) => s.tutorialStep);
  const tutorialCompleted = useGameStore((s) => s.tutorialCompleted);
  const tutorialArmed = useGameStore((s) => s.tutorialArmed);
  const advanceTutorial = useGameStore((s) => s.advanceTutorial);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [mergedCellIndex, setMergedCellIndex] = useState<number | null>(null);

  const matchingCells = findHighlightedCells(grid, sellRequests);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 8 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const activeItem = activeItemId
    ? grid.find((c) => c.item?.id === activeItemId)?.item
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItemId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveItemId(null);
        return;
      }

      const currentGrid = useGameStore.getState().grid;
      let fromIndex: number;
      const dataIndex = active.data.current?.cellIndex;
      if (dataIndex !== undefined && dataIndex !== null && !isNaN(Number(dataIndex))) {
        fromIndex = Number(dataIndex);
      } else {
        const sourceCell = currentGrid.find((c) => c.item?.id === active.id);
        if (!sourceCell) {
          setActiveItemId(null);
          return;
        }
        fromIndex = sourceCell.index;
      }

      let toIndex: number;
      const overIdNum = Number(over.id);
      if (!isNaN(overIdNum) && overIdNum >= 0 && overIdNum < GRID_SIZE) {
        toIndex = overIdNum;
      } else {
        const targetCell = currentGrid.find((c) => c.item?.id === over.id);
        if (!targetCell) {
          setActiveItemId(null);
          return;
        }
        toIndex = targetCell.index;
      }

      if (fromIndex === toIndex) {
        setActiveItemId(null);
        return;
      }

      const fromCell = currentGrid[fromIndex];
      const toCell = currentGrid[toIndex];

      if (!fromCell?.item) {
        setActiveItemId(null);
        return;
      }

      if (!toCell.item) {
        moveItem(fromIndex, toIndex);
      } else if (canMerge(fromCell.item, toCell.item)) {
        const result = mergeItems(fromIndex, toIndex);
        if (result) {
          setMergedCellIndex(toIndex);
          setTimeout(() => setMergedCellIndex(null), 500);
          // Tutorial step 1.3 — armed merge advances to step 1.4.
          if (!tutorialCompleted && tutorialStep === 2 && tutorialArmed) {
            advanceTutorial();
          }
        }
      } else if (
        // Same chain at MAX_LEVEL — `canMerge` rejects this normally,
        // but it's a special "empire complete" event: clear both and
        // award the max-tier bonus.
        fromCell.item.chain === toCell.item.chain &&
        fromCell.item.level === 8 &&
        toCell.item.level === 8
      ) {
        const prize = claimMaxTierBonus(fromIndex, toIndex);
        if (prize > 0) {
          setMergedCellIndex(toIndex);
          setTimeout(() => setMergedCellIndex(null), 500);
          toast.primary(`+${prize.toLocaleString()} • 🏆 אימפריה הושלמה!`, {
            iconClass: 'mk-icon mk-icon-coin mk-icon--sm',
          });
        }
      } else {
        moveItem(fromIndex, toIndex);
      }

      setActiveItemId(null);
    },
    [moveItem, mergeItems, claimMaxTierBonus, tutorialCompleted, tutorialStep, tutorialArmed, advanceTutorial]
  );

  return (
    <div className="mx-3 mt-3">
      <DndContext
        sensors={sensors}
        collisionDetection={cellOnlyCollision}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Painted grid backdrop — wooden frame + 24 cream cells. Items
            sit absolutely-positioned on top, anchored to the painted
            cell centres. */}
        <div className="mk-grid">
          {grid.map((cell) => {
            const coord = PAINTED_CELLS[cell.index];
            return (
              <GridCell
                key={cell.index}
                cell={cell}
                isHighlighted={matchingCells.has(cell.index)}
                isDraggedFrom={cell.item?.id === activeItemId}
                isMerging={mergedCellIndex === cell.index}
                xPct={coord.xPct}
                yPct={coord.yPct}
              />
            );
          })}

          {/* Empty board hint */}
          {grid.every((c) => c.item === null) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-[#7a4a1e]/85 font-bold text-sm pulse drop-shadow">
                <div className="text-3xl mb-1">👇</div>
                <div>לחץ על יצרן כדי להתחיל!</div>
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeItem ? (
            <div
              className={`item-bubble scale-125 ${
                activeItem.image ? 'item-bubble--image' : 'shadow-xl'
              } ${activeItem.level === 8 ? (activeItem.image ? 'item-trophy--image' : 'item-trophy') : ''}`}
            >
              {activeItem.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeItem.image} alt={activeItem.name} draggable={false} />
              ) : (
                activeItem.emoji
              )}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
