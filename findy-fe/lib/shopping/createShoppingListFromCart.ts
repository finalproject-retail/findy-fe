import type { CartLineItem } from "@/contexts/CartContext";
import {
  addShoppingListItem,
  createShoppingList,
} from "@/lib/shopping/api";
import { cancelActiveShoppingListIfExists } from "@/lib/shopping/cancelActiveShoppingListIfExists";
import { syncCartSelectionToServer } from "@/lib/shopping/syncCartSelection";
import type { ShoppingListApi } from "@/lib/shopping/types";

/** 선택된 장바구니 상품으로 쇼핑리스트 생성 (구역은 addZonesToShoppingList 사용) */
export async function createShoppingListFromCart(
  allCartLines: CartLineItem[],
  selectedLines: CartLineItem[],
): Promise<ShoppingListApi> {
  if (selectedLines.length === 0) {
    throw new Error("쇼핑리스트에 담을 상품이 없습니다.");
  }

  // 취소가 cart.uncheckAllItems()를 호출하므로, 선택 동기화는 취소 이후에 해야 함
  await cancelActiveShoppingListIfExists();
  await syncCartSelectionToServer(allCartLines);

  let shoppingList = await createShoppingList();

  if (shoppingList.items.length === 0) {
    for (const line of selectedLines) {
      shoppingList = await addShoppingListItem(line.productId, line.quantity);
    }
  }

  if (shoppingList.items.length === 0) {
    throw new Error("쇼핑리스트에 담을 항목이 없습니다.");
  }

  return shoppingList;
}
