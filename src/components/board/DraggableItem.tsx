'use client';

import { useDraggable } from '@dnd-kit/core';
import { useEffect, useState } from 'react';
import type { Item } from '@/types/game';

interface Props {
  item: Item;
  cellIndex: number;
}

export default function DraggableItem({ item, cellIndex }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { cellIndex },
  });

  // Only play spawn animation once when the item first mounts
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`item-bubble ds-item-lift cursor-grab active:cursor-grabbing touch-none ${
        item.level === 8 ? 'item-trophy' : ''
      } ${isNew ? 'item-spawn-once' : ''} ${isDragging ? 'opacity-30 scale-90' : ''}`}
    >
      {item.emoji}
    </div>
  );
}
