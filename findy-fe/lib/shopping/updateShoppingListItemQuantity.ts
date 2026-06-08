import { isAxiosError } from "axios";
import { applyShoppingListItemQuantity } from "@/lib/shopping/applyShoppingListItemQuantity";
import { findShoppingListItemByProductId } from "@/lib/shopping/resolveShoppingListItem";
import type { ShoppingListApi } from "@/lib/shopping/types";

export type ResolvedShoppingListItem = {
  shoppingListItemId: number;
  currentQuantity: number;
  scannedQuantity: number;
};

function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

/** productId 기준 쇼핑리스트 수량 변경 (장바구니 등 외부 호출용) */
export async function updateShoppingListItemQuantity(
  productId: string | number,
  nextQuantity: number,
): Promise<ShoppingListApi> {
  const loadSnapshot = async () => {
    const { item } = await findShoppingListItemByProductId(productId);
    return {
      shoppingListItemId: item.shoppingListItemId,
      productId,
      currentQuantity: item.quantity,
      scannedQuantity: item.scannedQuantity ?? 0,
    };
  };

  try {
    const snapshot = await loadSnapshot();
    return await applyShoppingListItemQuantity(snapshot, nextQuantity);
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }
    const snapshot = await loadSnapshot();
    return applyShoppingListItemQuantity(snapshot, nextQuantity);
  }
}
