import type { CartLineItem } from "@/contexts/CartContext";

/** 담기 완료(픽 수량 ≥ 주문 수량) 항목을 리스트 하단으로 */
export function sortTripLineItemsForChecklist(
  items: CartLineItem[],
  pickedQuantityByProductId: Record<string, number>,
): CartLineItem[] {
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const aDone =
        (pickedQuantityByProductId[a.item.productId] ?? 0) >= a.item.quantity;
      const bDone =
        (pickedQuantityByProductId[b.item.productId] ?? 0) >= b.item.quantity;
      if (aDone !== bDone) return aDone ? 1 : -1;
      return a.index - b.index;
    })
    .map(({ item }) => item);
}
