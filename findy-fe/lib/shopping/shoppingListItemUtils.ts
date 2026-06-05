import type { CartLineItem } from "@/contexts/CartContext";

export function isCategoryLineItem(item: CartLineItem): boolean {
  return item.itemType === "CATEGORY";
}

export function isProductLineItem(item: CartLineItem): boolean {
  return item.itemType !== "CATEGORY";
}

export function categoryLineItemKey(item: CartLineItem): string {
  return item.shoppingListItemId ?? item.productId;
}
