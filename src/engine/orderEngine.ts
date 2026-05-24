import type { GridCell, SellRequest, SellRequestItem } from '@/types/game';

/**
 * For a single-item sell request: find one matching cell.
 * For a duo: find two matching cells (one per required item).
 * For a category_set: find three matching cells (one per required item).
 *
 * Returns an array of cell indices that satisfy the request, or null if not satisfiable.
 * Each returned index is unique — we never use the same cell twice.
 */
export function findMatchingCellsForRequest(
  grid: GridCell[],
  request: SellRequest
): number[] | null {
  const requiredItems = request.items;
  const usedIndices = new Set<number>();
  const matchedIndices: number[] = [];

  for (const reqItem of requiredItems) {
    let found = false;
    for (const cell of grid) {
      if (
        cell.item &&
        cell.item.chain === reqItem.chain &&
        cell.item.level === reqItem.level &&
        !usedIndices.has(cell.index)
      ) {
        matchedIndices.push(cell.index);
        usedIndices.add(cell.index);
        found = true;
        break;
      }
    }
    if (!found) return null;
  }

  return matchedIndices;
}

/**
 * Check if a sell request can be fulfilled with current board state.
 */
export function canFulfillRequest(grid: GridCell[], request: SellRequest): boolean {
  return findMatchingCellsForRequest(grid, request) !== null;
}

/**
 * Legacy compat: find cells matching any old Order objects.
 * Used by MergeGrid to highlight sellable items.
 */
export function findMatchingCells(grid: GridCell[], orders: { requiredChain: string; requiredLevel: number }[]): Set<number> {
  const matchingIndices = new Set<number>();
  for (const order of orders) {
    for (const cell of grid) {
      if (
        cell.item &&
        cell.item.chain === order.requiredChain &&
        cell.item.level === order.requiredLevel
      ) {
        matchingIndices.add(cell.index);
      }
    }
  }
  return matchingIndices;
}

/**
 * Find all cell indices that could contribute to ANY of the given sell requests.
 * Used for highlighting sellable items on the board.
 */
export function findHighlightedCells(grid: GridCell[], requests: SellRequest[]): Set<number> {
  const highlighted = new Set<number>();
  for (const request of requests) {
    for (const reqItem of request.items) {
      for (const cell of grid) {
        if (
          cell.item &&
          cell.item.chain === reqItem.chain &&
          cell.item.level === reqItem.level
        ) {
          highlighted.add(cell.index);
        }
      }
    }
  }
  return highlighted;
}

// Legacy compat
export function findFirstMatchForOrder(grid: GridCell[], order: { requiredChain: string; requiredLevel: number }): number | null {
  for (const cell of grid) {
    if (
      cell.item &&
      cell.item.chain === order.requiredChain &&
      cell.item.level === order.requiredLevel
    ) {
      return cell.index;
    }
  }
  return null;
}

export function hasMatchForOrder(grid: GridCell[], order: { requiredChain: string; requiredLevel: number }): boolean {
  return findFirstMatchForOrder(grid, order) !== null;
}
