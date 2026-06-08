import { isAxiosError } from "axios";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import {
  addShoppingListItem,
  getShoppingList,
  removeShoppingListItem,
} from "@/lib/shopping/api";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";
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
          "[shopping] quantity decrease restore failed",
          restoreError,
        );
      }
      throw addError;
    }
  }
}

/**
 * 쇼핑리스트 항목 수량 변경 (스냅샷 1회 기준).
 *
 * 백엔드 규칙:
 * - PATCH /quantity 감소는 기본적으로 막힘 (SHOPPING_LIST_013)
 * - 단, nextQuantity >= scannedQuantity 이면 감소 허용 (shopping-service 최신 빌드 필요)
 *
 * 프론트 전략:
 * - 스캔 0 + 감소 → DELETE + POST (PATCH 안 씀)
 * - 스캔 있음 + 감소(스캔 수 이상) → PATCH (스캔 이력 유지)
 * - 증가 → PATCH
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

  if (__DEV__) {
    console.log("[shopping] quantity change", {
      shoppingListItemId,
      productId: parseShoppingProductId(productId),
      currentQuantity,
      nextQuantity,
      scannedQuantity,
      strategy: isDecrease
        ? scannedQuantity > 0
          ? "PATCH-decrease (scanned)"
          : "DELETE+POST-decrease"
        : isIncrease
          ? "PATCH-increase"
          : "noop",
    });
  }

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

    // 스캔 이력 있음 → PATCH만 가능 (DELETE+POST는 scannedQuantity 초기화됨)
    if (scannedQuantity > 0) {
      try {
        return await patchShoppingListItemQuantity(
          shoppingListItemId,
          nextQuantity,
        );
      } catch (error) {
        if (isDecreaseRequiresScanError(error)) {
          throw new Error(
            "스캔한 상품 수량 줄이기는 최신 shopping-service가 필요해요. 백엔드를 재빌드한 뒤 다시 시도해 주세요.",
          );
        }
        throw error;
      }
    }

    // 스캔 없음 → PATCH 감소 금지, DELETE+POST만 사용
    return decreaseViaRemoveAndReadd(
      shoppingListItemId,
      productId,
      nextQuantity,
      currentQuantity,
    );
  }

  return patchShoppingListItemQuantity(shoppingListItemId, nextQuantity);
}
