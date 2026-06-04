import {
  addShoppingListItem,
  createShoppingList,
  getShoppingList,
} from "@/lib/shopping/api";
import type { ShoppingListApi } from "@/lib/shopping/types";

/** 지도 쇼핑·검색에서 상품 1건을 서버 쇼핑리스트에 반영 */
export async function addProductToShoppingList(
  productId: string | number,
  quantity = 1,
): Promise<ShoppingListApi> {
  const numericId = Number(productId);
  if (!Number.isFinite(numericId)) {
    throw new Error("유효하지 않은 상품입니다.");
  }

  try {
    return await addShoppingListItem(numericId, quantity);
  } catch (firstError) {
    try {
      const existing = await getShoppingList();
      if (existing.items.length > 0) {
        throw firstError;
      }
    } catch {
      // 목록이 없으면 새로 만든 뒤 다시 담기
    }

    await createShoppingList();
    return addShoppingListItem(numericId, quantity);
  }
}
