import { cancelShopping, getShoppingList } from "@/lib/shopping/api";

/** 서버에 남아 있는 쇼핑리스트가 있으면 취소(삭제)하고 장바구니로 되돌립니다. */
export async function cancelActiveShoppingListIfExists(): Promise<boolean> {
  try {
    await getShoppingList();
  } catch {
    return false;
  }

  await cancelShopping();
  return true;
}
