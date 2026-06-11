import { isOutOfStock } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { isCategoryLineItem } from "@/lib/shopping/shoppingListItemUtils";

function routeRank(productId: string, routeProductIds: readonly string[]) {
  const index = routeProductIds.indexOf(productId);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

/** 경로 방문 순 → 픽 완료 항목은 하단 */
export function sortTripLineItemsForChecklist(
  items: CartLineItem[],
  pickedQuantityByProductId: Record<string, number>,
  routeProductIds: readonly string[] = [],
): CartLineItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aCategory = isCategoryLineItem(a.item);
      const bCategory = isCategoryLineItem(b.item);
      if (aCategory !== bCategory) return aCategory ? 1 : -1;

      if (aCategory && bCategory) {
        const aDone = a.item.checked ?? false;
        const bDone = b.item.checked ?? false;
        if (aDone !== bDone) return aDone ? 1 : -1;
        return a.index - b.index;
      }

      const aSoldOut =
        isOutOfStock(a.item.product) &&
        (pickedQuantityByProductId[a.item.productId] ?? 0) <= 0;
      const bSoldOut =
        isOutOfStock(b.item.product) &&
        (pickedQuantityByProductId[b.item.productId] ?? 0) <= 0;
      if (aSoldOut !== bSoldOut) return aSoldOut ? -1 : 1;

      const aDone =
        (pickedQuantityByProductId[a.item.productId] ?? 0) >= a.item.quantity;
      const bDone =
        (pickedQuantityByProductId[b.item.productId] ?? 0) >= b.item.quantity;
      if (aDone !== bDone) return aDone ? 1 : -1;

      const routeDiff =
        routeRank(a.item.productId, routeProductIds) -
        routeRank(b.item.productId, routeProductIds);
      if (routeDiff !== 0) return routeDiff;

      return a.index - b.index;
    })
    .map(({ item }) => item);
}
