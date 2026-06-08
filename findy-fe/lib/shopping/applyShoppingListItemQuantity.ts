import { isAxiosError } from "axios";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import {
  addShoppingListItem,
  getShoppingList,
  removeShoppingListItem,
} from "@/lib/shopping/api";
import { resolveShoppingUserId } from "@/lib/shopping/shoppingUserId";
import type { ApiEnvelope, ShoppingListApi } from "@/lib/shopping/types";

export type ShoppingListItemQuantitySnapshot = {
  shoppingListItemId: number;
  productId: string | number;
  currentQuantity: number;
  scannedQuantity: number;
};

function userHeaders() {
  return { "X-User-Id": String(resolveShoppingUserId()) };
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "요청에 실패했습니다.");
  }
  return envelope.data;
}

function isDecreaseRequiresScanError(error: unknown): boolean {
  if (isAxiosError(error)) {
    const data = error.response?.data as { code?: string; message?: string } | undefined;
    if (data?.code === "SHOPPING_LIST_013") {
      return true;
    }
    if (typeof data?.message === "string" && data.message.includes("바코드 스캔")) {
      return true;
    }
  }
  if (error instanceof Error && error.message.includes("바코드 스캔")) {
    return true;
  }
  return false;
}

async function patchShoppingListItemQuantity(
  shoppingListItemId: string | number,
  quantity: number,
): Promise<ShoppingListApi> {
  const response = await shoppingApiClient.patch<ApiEnvelope<ShoppingListApi>>(
    `/api/v1/shopping-lists/items/${shoppingListItemId}/quantity`,
    { quantity },
    { headers: userHeaders() },
  );
  return unwrap(response.data);
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
          "[shopping] decrease restore failed after DELETE",
          restoreError,
        );
      }
      throw new Error(
        "수량을 줄이는 중 오류가 났어요. 쇼핑리스트에서 상품이 사라졌을 수 있으니 새로고침 후 다시 담아 주세요.",
      );
    }
  }
}

/**
 * 쇼핑리스트 항목 수량 변경.
 * 감소는 PATCH 우선(스캔 이력 유지), 구버전 백엔드·스캔 0일 때만 DELETE+POST 폴백.
 */
export async function applyShoppingListItemQuantity(
  snapshot: ShoppingListItemQuantitySnapshot,
  nextQuantity: number,
): Promise<ShoppingListApi> {
  const {
    shoppingListItemId,
    productId,
    currentQuantity,
    scannedQuantity,
  } = snapshot;

  const isDecrease = nextQuantity < currentQuantity;
  const isIncrease = nextQuantity > currentQuantity;

  if (!isDecrease && !isIncrease) {
    return getShoppingList();
  }

  if (isDecrease) {
    if (nextQuantity < scannedQuantity) {
      throw new Error(
        `바코드로 스캔한 ${scannedQuantity}개보다 적게는 줄일 수 없어요.`,
      );
    }

    if (nextQuantity < 1) {
      return removeShoppingListItem(shoppingListItemId);
    }

    try {
      return await patchShoppingListItemQuantity(
        shoppingListItemId,
        nextQuantity,
      );
    } catch (error) {
      // 구버전 백엔드: PATCH 감소 전부 막힘 → 스캔 0일 때만 DELETE+POST
      if (isDecreaseRequiresScanError(error) && scannedQuantity === 0) {
        return decreaseViaRemoveAndReadd(
          shoppingListItemId,
          productId,
          nextQuantity,
          currentQuantity,
        );
      }

      if (isDecreaseRequiresScanError(error) && scannedQuantity > 0) {
        throw new Error(
          "스캔한 상품 수량 줄이기는 shopping-service 최신 빌드가 필요해요. 백엔드 재배포 후 다시 시도해 주세요.",
        );
      }

      throw error;
    }
  }

  return patchShoppingListItemQuantity(shoppingListItemId, nextQuantity);
}
