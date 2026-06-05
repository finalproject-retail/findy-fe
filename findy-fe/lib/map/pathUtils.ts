import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";

export function gridPointToGridId(
  gridX: number,
  gridY: number,
  gridCols: number,
): number {
  return gridY * gridCols + gridX + 1;
}

export function resolveShoppingItemGridId(
  item: ShoppingMapItem,
  gridCols: number,
): number {
  if (item.gridId != null) {
    return item.gridId;
  }
  return gridPointToGridId(item.gridX, item.gridY, gridCols);
}

/** 쇼핑 리스트·구역 순서를 유지하며 연속 중복 격자를 제거 */
export function dedupeDestinationGridIds(gridIds: number[]): number[] {
  const result: number[] = [];
  let previous: number | null = null;

  for (const gridId of gridIds) {
    if (gridId === previous) {
      continue;
    }
    result.push(gridId);
    previous = gridId;
  }

  return result;
}

export function destinationGridIdsFromMapItems(
  items: ShoppingMapItem[],
  gridCols: number,
): number[] {
  return dedupeDestinationGridIds(
    items.map((item) => resolveShoppingItemGridId(item, gridCols)),
  );
}

/** map-service가 반환한 방문 순서에 맞게 쇼핑 마커 정렬 */
export function orderShoppingItemsByDestinationGridIds(
  items: ShoppingMapItem[],
  destinationGridIds: number[],
  gridCols: number,
): ShoppingMapItem[] {
  if (destinationGridIds.length === 0) {
    return [...items];
  }

  const buckets = new Map<number, ShoppingMapItem[]>();
  for (const item of items) {
    const gridId = resolveShoppingItemGridId(item, gridCols);
    const list = buckets.get(gridId) ?? [];
    list.push(item);
    buckets.set(gridId, list);
  }

  const ordered: ShoppingMapItem[] = [];
  for (const gridId of destinationGridIds) {
    const matches = buckets.get(gridId);
    if (!matches) {
      continue;
    }
    ordered.push(...matches);
    buckets.delete(gridId);
  }

  for (const remaining of buckets.values()) {
    ordered.push(...remaining);
  }

  return ordered.map((item, index) => ({
    ...item,
    visitOrder: index + 1,
  }));
}

export function applyGridIdToShoppingItem(
  item: ShoppingMapItem,
  gridCols: number,
): ShoppingMapItem {
  const gridId = resolveShoppingItemGridId(item, gridCols);
  const { gridX, gridY } = gridIdToGridPoint(gridId, gridCols);
  return {
    ...item,
    gridId,
    gridX,
    gridY,
  };
}
