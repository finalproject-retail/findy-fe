import { cartToShoppingMapItems } from "@/components/cart/cartToShoppingMapItems";
import { zonesToShoppingMapItems } from "@/components/cart/zonesToShoppingMapItems";
import type { CartLineItem } from "@/contexts/CartContext";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { isProductLineItem } from "@/lib/shopping/shoppingListItemUtils";
import type { TripZoneLineItem } from "@/lib/shopping/types";

/** 상품·구역 쇼핑리스트 항목을 지도 마커 목록으로 합칩니다. */
export function buildTripShoppingMapItems(
  lineItems: CartLineItem[],
  zoneItems: TripZoneLineItem[],
): ShoppingMapItem[] {
  const productItems = cartToShoppingMapItems(
    lineItems
      .filter(isProductLineItem)
      .map((item) => ({ ...item, selected: true })),
  );
  const zoneMapItems = zonesToShoppingMapItems(zoneItems);

  const seen = new Set<string>();
  const merged = [...productItems, ...zoneMapItems].filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });

  return merged.map((item, index) => ({
    ...item,
    visitOrder: index + 1,
  }));
}
