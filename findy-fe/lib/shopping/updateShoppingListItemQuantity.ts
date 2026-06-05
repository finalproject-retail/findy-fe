import { isAxiosError } from "axios";
import {
  addShoppingListItem,
  changeShoppingListItemQuantity,
  removeShoppingListItem,
} from "@/lib/shopping/api";
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

async function decreaseViaRemoveAndReadd(
  shoppingListItemId: string | number,
  productId: string | number,
  nextQuantity: number,
  currentQuantity: number,
): Promise<ShoppingListApi> {
  await removeShoppingListItem(shoppingListItemId);
  try {
    return await addShoppingListItem(productId, nextQuantity);
  } catch (addError) {
    try {
      return await addShoppingListItem(productId, currentQuantity);
    } catch (restoreError) {
      if (__DEV__) {
        console.warn(
          "[shopping] decrease fallback failed; restore also failed",
          restoreError,
        );
      }
      throw addError;
    }
  }
}

async function applyQuantityChange(
  shoppingListItemId: string | number,
  productId: string | number,
  nextQuantity: number,
  resolved: ResolvedShoppingListItem,
): Promise<ShoppingListApi> {
  const isDecrease = nextQuantity < resolved.currentQuantity;
  const canUseRemoveAndReadd =
    isDecrease && resolved.scannedQuantity === 0 && nextQuantity >= 1;

  if (canUseRemoveAndReadd) {
    return decreaseViaRemoveAndReadd(
      shoppingListItemId,
      productId,
      nextQuantity,
      resolved.currentQuantity,
    );
  }

  return changeShoppingListItemQuantity(shoppingListItemId, nextQuantity);
}

/**
 * 쇼핑리스트 수량 변경.
 * resolved가 있으면 재조회 없이 사용합니다 (remove+readd 직후 빈 리스트 조회 방지).
 */
export async function updateShoppingListItemQuantity(
  productId: string | number,
  nextQuantity: number,
  resolved?: ResolvedShoppingListItem,
): Promise<ShoppingListApi> {
  const toResolved = async (): Promise<ResolvedShoppingListItem> => {
    if (resolved) {
      return resolved;
    }
    const { item } = await findShoppingListItemByProductId(productId);
    return {
      shoppingListItemId: item.shoppingListItemId,
      currentQuantity: item.quantity,
      scannedQuantity: item.scannedQuantity ?? 0,
    };
  };

  const snapshot = await toResolved();

  try {
    return await applyQuantityChange(
      snapshot.shoppingListItemId,
      productId,
      nextQuantity,
      snapshot,
    );
  } catch (error) {
    if (!isNotFoundError(error)) {
      throw error;
    }

    const fresh = await findShoppingListItemByProductId(productId);
    const freshSnapshot: ResolvedShoppingListItem = {
      shoppingListItemId: fresh.item.shoppingListItemId,
      currentQuantity: fresh.item.quantity,
      scannedQuantity: fresh.item.scannedQuantity ?? 0,
    };
    return applyQuantityChange(
      freshSnapshot.shoppingListItemId,
      productId,
      nextQuantity,
      freshSnapshot,
    );
  }
}
