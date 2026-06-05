import { getShoppingList } from "@/lib/shopping/api";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";
import type { ShoppingListApi, ShoppingListItemApi } from "@/lib/shopping/types";

export async function findShoppingListItemByProductId(
  productId: string | number,
): Promise<{ shoppingList: ShoppingListApi; item: ShoppingListItemApi }> {
  const shoppingList = await getShoppingList();
  const parsedProductId = parseShoppingProductId(productId);
  const item = shoppingList.items.find((entry) => {
    if (entry.itemType === "CATEGORY" || (entry.category && !entry.product)) {
      return false;
    }
    return entry.product?.productId === parsedProductId;
  });

  if (!item) {
    throw new Error("쇼핑리스트에서 상품을 찾을 수 없습니다.");
  }

  return { shoppingList, item };
}
