import { isOutOfStock } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import type { TripZoneLineItem } from "@/lib/shopping/types";

export type TripSheetRow =
  | { kind: "product"; item: CartLineItem }
  | { kind: "zone"; item: TripZoneLineItem };

function routeRank(id: string, routeIds: readonly string[]) {
  const index = routeIds.indexOf(id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** 경로 순서로 상품·구역을 섞고, 픽 완료 상품은 하단으로 보냅니다. */
export function buildTripSheetRows(
  products: CartLineItem[],
  zones: TripZoneLineItem[],
  pickedQuantityByProductId: Record<string, number>,
  routeIds: readonly string[] = [],
): TripSheetRow[] {
  const activeProducts: CartLineItem[] = [];
  const doneProducts: CartLineItem[] = [];

  for (const item of products) {
    const picked = pickedQuantityByProductId[item.productId] ?? 0;
    if (picked >= item.quantity) {
      doneProducts.push(item);
      continue;
    }
    activeProducts.push(item);
  }

  const sortActiveProducts = [...activeProducts]
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aSoldOut =
        isOutOfStock(a.item.product) &&
        (pickedQuantityByProductId[a.item.productId] ?? 0) <= 0;
      const bSoldOut =
        isOutOfStock(b.item.product) &&
        (pickedQuantityByProductId[b.item.productId] ?? 0) <= 0;
      if (aSoldOut !== bSoldOut) return aSoldOut ? -1 : 1;

      const routeDiff =
        routeRank(a.item.productId, routeIds) -
        routeRank(b.item.productId, routeIds);
      if (routeDiff !== 0) return routeDiff;

      return a.index - b.index;
    })
    .map(({ item }) => ({ kind: "product" as const, item }));

  const zoneRows = zones
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const routeDiff =
        routeRank(`zone-${a.item.categoryId}`, routeIds) -
        routeRank(`zone-${b.item.categoryId}`, routeIds);
      if (routeDiff !== 0) return routeDiff;
      return a.index - b.index;
    })
    .map(({ item }) => ({ kind: "zone" as const, item }));

  const activeRows: TripSheetRow[] = [...sortActiveProducts, ...zoneRows]
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const aRouteId =
        a.row.kind === "product"
          ? a.row.item.productId
          : `zone-${a.row.item.categoryId}`;
      const bRouteId =
        b.row.kind === "product"
          ? b.row.item.productId
          : `zone-${b.row.item.categoryId}`;

      const routeDiff = routeRank(aRouteId, routeIds) - routeRank(bRouteId, routeIds);
      if (routeDiff !== 0) return routeDiff;
      return a.index - b.index;
    })
    .map(({ row }) => row);

  const doneRows = doneProducts.map((item) => ({
    kind: "product" as const,
    item,
  }));

  return [...activeRows, ...doneRows];
}
