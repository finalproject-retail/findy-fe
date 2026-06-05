import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { mapNotificationProductToProduct } from "@/lib/notifications/mapNotificationProduct";
import { resolveNotificationUserId } from "@/lib/notifications/resolveNotificationUserId";
import type {
  ApiEnvelope,
  ShoppingRecommendationNotificationApiData,
} from "@/lib/notifications/types";
import type { Product } from "@/components/product";
import { notificationApiClient } from "./notificationClient";

export type ShoppingRecommendationNotificationResult = {
  shouldShow: boolean;
  notificationId?: number;
  recommendationLogId?: number;
  notificationType?: string;
  title?: string;
  content?: string;
  product?: Product;
};

export type FetchShoppingRecommendationNotificationParams = {
  storeId: number;
  shoppingListId?: number | null;
  sourceProductId?: number | string | null;
  currentGridId?: number | null;
  excludeProductIds?: Array<number | string>;
};

function toNumericId(value: number | string | null | undefined): number | undefined {
  if (value == null) {
    return undefined;
  }
  const parsed = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function fetchShoppingRecommendationNotification(
  params: FetchShoppingRecommendationNotificationParams,
): Promise<ShoppingRecommendationNotificationResult> {
  const userId = resolveNotificationUserId();
  if (!userId) {
    return { shouldShow: false };
  }

  const query: Record<string, string | number> = {
    userId,
    storeId: params.storeId,
  };

  const shoppingListId = toNumericId(params.shoppingListId);
  if (shoppingListId != null) {
    query.shoppingListId = shoppingListId;
  }

  const sourceProductId = toNumericId(params.sourceProductId);
  if (sourceProductId != null) {
    query.sourceProductId = sourceProductId;
  }

  const currentGridId = toNumericId(params.currentGridId);
  if (currentGridId != null) {
    query.currentGridId = currentGridId;
  }

  const excludeIds = (params.excludeProductIds ?? [])
    .map((id) => toNumericId(id))
    .filter((id): id is number => id != null);

  try {
    const response = await notificationApiClient.get<
      ApiEnvelope<ShoppingRecommendationNotificationApiData>
    >("/api/v1/recommendations/notifications/shopping", {
      params: {
        ...query,
        excludeProductIds: excludeIds.length > 0 ? excludeIds : undefined,
      },
      paramsSerializer: {
        indexes: null,
      },
    });

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "쇼핑 추천 알림을 불러오지 못했습니다.");
    }

    const data = body.data;
    if (!data?.shouldShow) {
      return { shouldShow: false };
    }

    const product = mapNotificationProductToProduct(
      data.product ?? undefined,
      data.product?.productId,
    );

    return {
      shouldShow: true,
      notificationId: data.notificationId ?? undefined,
      recommendationLogId: data.recommendationLogId ?? undefined,
      notificationType: data.notificationType ?? undefined,
      title: data.title ?? undefined,
      content: data.content ?? undefined,
      product: product ?? undefined,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[notifications/shopping]",
        parseApiErrorMessage(error, "쇼핑 추천 알림 실패"),
      );
    }
    return { shouldShow: false };
  }
}
