import type { CartZoneItem } from "@/components/category";
import type { CartLineItem } from "@/contexts/CartContext";
import {
  addCategoryShoppingListItem,
  addShoppingListItem,
  createShoppingList,
} from "@/lib/shopping/api";
import { cancelActiveShoppingListIfExists } from "@/lib/shopping/cancelActiveShoppingListIfExists";
import { syncCartSelectionToServer } from "@/lib/shopping/syncCartSelection";
import type { ShoppingListApi } from "@/lib/shopping/types";

/** 선택된 장바구니 상품·구역으로 쇼핑리스트 생성 */
export async function createShoppingListFromCart(
  allCartLines: CartLineItem[],
  selectedLines: CartLineItem[],
  zones: CartZoneItem[] = [],
): Promise<ShoppingListApi> {
  if (selectedLines.length === 0 && zones.length === 0) {
    throw new Error("쇼핑리스트에 담을 항목이 없습니다.");
  }

  // 취소가 cart.uncheckAllItems()를 호출하므로, 선택 동기화는 취소 이후에 해야 함
  await cancelActiveShoppingListIfExists();

  if (selectedLines.length > 0) {
    await syncCartSelectionToServer(allCartLines);
  }

  let shoppingList = await createShoppingList();

  if (selectedLines.length > 0 && shoppingList.items.length === 0) {
    for (const line of selectedLines) {
      shoppingList = await addShoppingListItem(line.productId, line.quantity);
    }
  }

  for (const zone of zones) {
    shoppingList = await addCategoryShoppingListItem({
      categoryId: zone.categoryId,
      categoryName: zone.label,
      quantity: 1,
    });
  }

  if (shoppingList.items.length === 0) {
    throw new Error("쇼핑리스트에 담을 항목이 없습니다.");
  }

  return shoppingList;
}

/** 구역만으로 쇼핑리스트 생성 */
export async function createShoppingListFromZones(
  zones: CartZoneItem[],
): Promise<ShoppingListApi> {
  return createShoppingListFromCart([], [], zones);
}
