import { tripLineItemsToShoppingMapItems } from "@/components/cart/cartToShoppingMapItems";
import type { CartLineItem } from "@/contexts/CartContext";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import { zonesToShoppingMapItems } from "@/components/cart/zonesToShoppingMapItems";
import { mapShoppingListLineItemsToMapItems } from "@/lib/shopping/mappers";
import { isCategoryLineItem } from "@/lib/shopping/shoppingListItemUtils";
import type { TripZoneLineItem } from "@/lib/shopping/types";

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

/** 담은 수량을 전부 스캔한 상품만 경로 목적지에서 제외 */
export function remainingTripLineItems(
  lineItems: CartLineItem[],
  pickedQuantityByProductId: Record<string, number>,
): CartLineItem[] {
  return lineItems.filter((item) => {
    if (isCategoryLineItem(item)) {
      return !(item.checked ?? false);
    }
    const picked = pickedQuantityByProductId[item.productId] ?? 0;
    return picked < item.quantity;
  });
}

function destinationGridIdsFromTripMapItems(
  lineItems: CartLineItem[],
  gridCols: number,
): number[] {
  if (lineItems.length === 0) {
    return [];
  }

  return destinationGridIdsFromMapItems(
    tripLineItemsToShoppingMapItems(lineItems),
    gridCols,
  );
}

/** 현재 쇼핑 리스트 기준 경로 API destinationGridIds (추가·삭제·새로고침 반영) */
export function destinationGridIdsFromTripLineItems(
  lineItems: CartLineItem[],
  gridCols: number,
  apiDestinationGridIds?: number[],
): number[] {
  const fromMapItems = destinationGridIdsFromTripMapItems(lineItems, gridCols);

  if (apiDestinationGridIds != null && apiDestinationGridIds.length > 0) {
    if (fromMapItems.length === 0) {
      return dedupeDestinationGridIds(apiDestinationGridIds);
    }

    const remainingSet = new Set(fromMapItems);
    const filtered = apiDestinationGridIds.filter((gridId) =>
      remainingSet.has(gridId),
    );

    return dedupeDestinationGridIds(
      filtered.length > 0 ? filtered : apiDestinationGridIds,
    );
  }

  return fromMapItems;
}

/** 상품·구역 트립 기준 경로 API destinationGridIds */
export function resolveTripDestinationGridIds(
  productLineItems: CartLineItem[],
  zoneItems: TripZoneLineItem[],
  gridCols: number,
  apiDestinationGridIds?: number[],
): number[] {
  const hasDestinations =
    productLineItems.length > 0 || zoneItems.length > 0;
  if (!hasDestinations) {
    return [];
  }

  if (apiDestinationGridIds != null && apiDestinationGridIds.length > 0) {
    return dedupeDestinationGridIds(apiDestinationGridIds);
  }

  return destinationGridIdsFromMapItems(
    [
      ...mapShoppingListLineItemsToMapItems(productLineItems, gridCols),
      ...zonesToShoppingMapItems(zoneItems),
    ],
    gridCols,
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
