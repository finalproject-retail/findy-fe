import type { CartLineItem } from "@/contexts/CartContext";
import { changeCartItemChecked } from "@/lib/shopping/api";
import type { CartApi } from "@/lib/shopping/types";

/** 로컬 선택 상태를 서버 장바구니 checked에 반영 (쇼핑리스트 생성 전) */
export async function syncCartSelectionToServer(
  items: CartLineItem[],
): Promise<CartApi | null> {
  let latest: CartApi | null = null;

  for (const item of items) {
    if (!item.cartItemId) {
      continue;
    }
    latest = await changeCartItemChecked(item.cartItemId, item.selected);
  }

  return latest;
}
