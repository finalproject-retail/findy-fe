import {
  saveRecommendationClickLogSafe,
  saveRecommendationPurchaseConversionLogSafe,
  saveSubstituteSelectionLogSafe,
} from "@/lib/recommendations/api/recommendationLogs";
import type { SavePurchaseConversionLogRequest } from "@/lib/recommendations/types";
import { resolveRecommendationUserIdNumber } from "@/lib/recommendations/resolveRecommendationUserId";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";

type TrackedRecommendationLog = {
  recommendationLogId: number;
  productId: number;
  sourceProductId?: number;
};

const trackedLogs = new Map<number, TrackedRecommendationLog>();

function resolveUserIdNumber(): number | null {
  return resolveRecommendationUserIdNumber();
}

function parseProductId(value: string | number | null | undefined): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  try {
    return parseShoppingProductId(String(value));
  } catch {
    const parsed = Number(String(value).trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
}

function registerTrackedLog(entry: TrackedRecommendationLog) {
  trackedLogs.set(entry.recommendationLogId, entry);
}

export function trackRecommendationImpressionLog(params: {
  recommendationLogId: number;
  productId: string | number;
  sourceProductId?: string | number | null;
}) {
  const productId = parseProductId(params.productId);
  if (productId == null) {
    return;
  }

  registerTrackedLog({
    recommendationLogId: params.recommendationLogId,
    productId,
    sourceProductId: parseProductId(params.sourceProductId) ?? undefined,
  });
}

/** POST /clicks + 구매 전환 추적용 등록 */
export function reportRecommendationClick(params: {
  recommendationLogId: number;
  productId?: string | number | null;
  sourceProductId?: string | number | null;
}) {
  const productId = parseProductId(params.productId);
  if (productId != null) {
    registerTrackedLog({
      recommendationLogId: params.recommendationLogId,
      productId,
      sourceProductId: parseProductId(params.sourceProductId) ?? undefined,
    });
  }

  saveRecommendationClickLogSafe(params.recommendationLogId);
}

/** POST /substitute-selections + 구매 전환 추적용 등록 */
export function reportSubstituteSelection(params: {
  recommendationLogId: number;
  sourceProductId: string | number;
  selectedProductId: string | number;
}) {
  const userId = resolveUserIdNumber();
  const sourceProductId = parseProductId(params.sourceProductId);
  const selectedProductId = parseProductId(params.selectedProductId);

  if (userId == null || sourceProductId == null || selectedProductId == null) {
    return;
  }

  registerTrackedLog({
    recommendationLogId: params.recommendationLogId,
    productId: selectedProductId,
    sourceProductId,
  });

  saveSubstituteSelectionLogSafe({
    recommendationLogId: params.recommendationLogId,
    userId,
    sourceProductId,
    selectedProductId,
  });
}

export function buildPurchaseConversionRequest(
  orderId: number,
  purchasedProductIds: Array<string | number>,
): SavePurchaseConversionLogRequest | null {
  const userId = resolveUserIdNumber();
  if (userId == null || !Number.isFinite(orderId)) {
    return null;
  }

  const purchasedIds = [
    ...new Set(
      purchasedProductIds
        .map((id) => parseProductId(id))
        .filter((id): id is number => id != null),
    ),
  ];

  if (purchasedIds.length === 0 || trackedLogs.size === 0) {
    return null;
  }

  const purchasedSet = new Set(purchasedIds);
  const recommendationLogIds = [...trackedLogs.values()]
    .filter((log) => purchasedSet.has(log.productId))
    .map((log) => log.recommendationLogId);

  if (recommendationLogIds.length === 0) {
    return null;
  }

  return {
    userId,
    orderId,
    recommendationLogIds,
    purchasedProductIds: purchasedIds,
  };
}

export function reportPurchaseConversionForOrder(
  orderId: number,
  purchasedProductIds: Array<string | number>,
) {
  const request = buildPurchaseConversionRequest(orderId, purchasedProductIds);
  if (!request) {
    return;
  }

  saveRecommendationPurchaseConversionLogSafe(request);

  for (const logId of request.recommendationLogIds) {
    trackedLogs.delete(logId);
  }
}

export function clearTrackedRecommendationLogs() {
  trackedLogs.clear();
}

registerAccountCacheClearListener(clearTrackedRecommendationLogs);
