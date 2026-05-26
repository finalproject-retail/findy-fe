import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";
import { getProductGridLocation } from "./productGridLocations";

function isPurchasable(item: CartLineItem) {
  return (item.product.stockCount ?? 1) > 0;
}

/** 선택된 장바구니 상품 → 지도 쇼핑 마커 (상품당 1개) */
export function cartToShoppingMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  const selected = items.filter((item) => item.selected && isPurchasable(item));
  const seen = new Set<string>();
  const result: ShoppingMapItem[] = [];

  for (const item of selected) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);

    const { gridX, gridY } = getProductGridLocation(
      item.productId,
      item.product.category,
      result.length,
    );

    result.push({
      id: item.productId,
      name: item.product.name,
      gridX,
      gridY,
      visitOrder: result.length + 1,
    });
  }

  return result;
}
