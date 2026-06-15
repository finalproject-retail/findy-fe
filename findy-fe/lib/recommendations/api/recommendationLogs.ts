import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope } from "@/lib/map/types";
import { resolveRecommendationUserIdNumber } from "@/lib/recommendations/resolveRecommendationUserId";
import type {
  RecommendationClickLogApiData,
  RecommendationImpressionLogApiData,
  RecommendationPurchaseConversionLogApiData,
  RecommendationSubstituteSelectionLogApiData,
  SavePurchaseConversionLogRequest,
  SaveRecommendationClickLogRequest,
  SaveRecommendationImpressionLogRequest,
  SaveSubstituteSelectionLogRequest,
} from "@/lib/recommendations/types";
import { recommendationApiClient } from "./recommendationClient";

const LOGS_BASE = "/api/v1/recommendations/logs";

function unwrapRecommendationLog<T>(
  body: ApiEnvelope<T> | undefined,
  fallbackMessage: string,
): T {
  if (!body?.success || body.data == null) {
    throw new Error(body?.message ?? fallbackMessage);
  }
  return body.data;
}

function assertAuthenticatedForRecommendationLogs() {
  if (!getAccessToken()) {
    throw new Error("로그인이 필요합니다.");
  }
}

/** POST /api/v1/recommendations/logs — 추천 노출 로그 저장 */
export async function saveRecommendationImpressionLog(
  request: SaveRecommendationImpressionLogRequest,
): Promise<RecommendationImpressionLogApiData> {
  assertAuthenticatedForRecommendationLogs();

  const userId = request.userId ?? resolveRecommendationUserIdNumber();
  if (userId == null) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    const response = await recommendationApiClient.post<
      ApiEnvelope<RecommendationImpressionLogApiData>
    >(LOGS_BASE, {
      userId,
      productId: request.productId,
      sourceProductId: request.sourceProductId ?? undefined,
      storeId: request.storeId ?? undefined,
      recommendationType: request.recommendationType,
      displayLocation: request.displayLocation,
      recommendationRank: request.recommendationRank ?? undefined,
      score: request.score ?? undefined,
      reason: request.reason ?? undefined,
    });

    return unwrapRecommendationLog(
      response.data,
      "추천 노출 로그 저장에 실패했습니다.",
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "추천 노출 로그 저장에 실패했습니다."),
    );
  }
}

/** POST /api/v1/recommendations/logs/clicks */
export async function saveRecommendationClickLog(
  request: SaveRecommendationClickLogRequest,
): Promise<RecommendationClickLogApiData> {
  assertAuthenticatedForRecommendationLogs();

  try {
    const response = await recommendationApiClient.post<
      ApiEnvelope<RecommendationClickLogApiData>
    >(`${LOGS_BASE}/clicks`, request);

    return unwrapRecommendationLog(
      response.data,
      "추천 클릭 로그 저장에 실패했습니다.",
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "추천 클릭 로그 저장에 실패했습니다."),
    );
  }
}

/** POST /api/v1/recommendations/logs/substitute-selections */
export async function saveSubstituteSelectionLog(
  request: SaveSubstituteSelectionLogRequest,
): Promise<RecommendationSubstituteSelectionLogApiData> {
  assertAuthenticatedForRecommendationLogs();

  try {
    const response = await recommendationApiClient.post<
      ApiEnvelope<RecommendationSubstituteSelectionLogApiData>
    >(`${LOGS_BASE}/substitute-selections`, request);

    return unwrapRecommendationLog(
      response.data,
      "대체상품 선택 로그 저장에 실패했습니다.",
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "대체상품 선택 로그 저장에 실패했습니다."),
    );
  }
}

/** PATCH /api/v1/recommendations/logs/purchase-conversions */
export async function saveRecommendationPurchaseConversionLog(
  request: SavePurchaseConversionLogRequest,
): Promise<RecommendationPurchaseConversionLogApiData> {
  assertAuthenticatedForRecommendationLogs();

  try {
    const response = await recommendationApiClient.patch<
      ApiEnvelope<RecommendationPurchaseConversionLogApiData>
    >(`${LOGS_BASE}/purchase-conversions`, request);

    return unwrapRecommendationLog(
      response.data,
      "추천 구매 전환 로그 저장에 실패했습니다.",
    );
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "추천 구매 전환 로그 저장에 실패했습니다."),
    );
  }
}

export function saveRecommendationClickLogSafe(
  recommendationLogId: number,
): void {
  void saveRecommendationClickLog({ recommendationLogId }).catch((error) => {
    if (__DEV__) {
      console.warn(
        "[recommendations/logs/clicks]",
        error instanceof Error ? error.message : error,
      );
    }
  });
}

export function saveSubstituteSelectionLogSafe(
  request: SaveSubstituteSelectionLogRequest,
): void {
  void saveSubstituteSelectionLog(request).catch((error) => {
    if (__DEV__) {
      console.warn(
        "[recommendations/logs/substitute-selections]",
        error instanceof Error ? error.message : error,
      );
    }
  });
}

export function saveRecommendationPurchaseConversionLogSafe(
  request: SavePurchaseConversionLogRequest,
): void {
  void saveRecommendationPurchaseConversionLog(request).catch((error) => {
    if (__DEV__) {
      console.warn(
        "[recommendations/logs/purchase-conversions]",
        error instanceof Error ? error.message : error,
      );
    }
  });
}
