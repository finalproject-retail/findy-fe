import { tripLineItemsToShoppingMapItems } from "@/components/cart/cartToShoppingMapItems";
import { zonesToShoppingMapItems } from "@/components/cart/zonesToShoppingMapItems";
import type { CartLineItem } from "@/contexts/CartContext";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import type { TripZoneLineItem } from "@/lib/shopping/types";

/** 상품·구역 쇼핑리스트 항목을 지도 마커 목록으로 합칩니다. */
export function buildTripShoppingMapItems(
  lineItems: CartLineItem[],
  zoneItems: TripZoneLineItem[],
): ShoppingMapItem[] {
  const productItems = tripLineItemsToShoppingMapItems(lineItems);
  const zoneMapItems = zonesToShoppingMapItems(zoneItems);

  return [...productItems, ...zoneMapItems].map((item, index) => ({
    ...item,
    visitOrder: index + 1,
  }));
}
