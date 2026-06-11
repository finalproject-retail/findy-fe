import type { CartLineItem } from "@/contexts/CartContext";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { mapShoppingListLineItemsToMapItems } from "@/lib/shopping/mappers";

/** 쇼핑리스트 항목(상품·카테고리) → 지도 마커 — API 순서·gridId 유지 */
export function buildTripShoppingMapItems(
  lineItems: CartLineItem[],
): ShoppingMapItem[] {
  return mapShoppingListLineItemsToMapItems(lineItems);
}
