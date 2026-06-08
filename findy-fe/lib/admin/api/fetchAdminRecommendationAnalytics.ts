import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  FetchAdminRecommendationAnalyticsParams,
  RecommendationClickRateData,
  RecommendationPurchaseConversionData,
} from "@/lib/admin/api/types";

const DEFAULT_LIMIT = 20;

async function fetchAnalytics<T>(
  path: string,
  params: FetchAdminRecommendationAnalyticsParams,
): Promise<T> {
  try {
    const response = await analyticsApiClient.get<ApiEnvelope<T>>(path, {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        recommendationType: params.recommendationType,
        limit: params.limit ?? DEFAULT_LIMIT,
        ...(params.productId != null ? { productId: params.productId } : {}),
      },
    });

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "분석 데이터를 불러오지 못했습니다.");
    }

    return body.data;
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "분석 데이터를 불러오지 못했습니다."));
  }
}

/** GET /api/v1/admin/analytics/recommendations/click-rate */
export function fetchRecommendationClickRateAnalytics(
  params: FetchAdminRecommendationAnalyticsParams,
) {
  return fetchAnalytics<RecommendationClickRateData>(
    "/api/v1/admin/analytics/recommendations/click-rate",
    params,
  );
}

/** GET /api/v1/admin/analytics/recommendations/purchase-conversion */
export function fetchRecommendationPurchaseConversionAnalytics(
  params: FetchAdminRecommendationAnalyticsParams,
) {
  return fetchAnalytics<RecommendationPurchaseConversionData>(
    "/api/v1/admin/analytics/recommendations/purchase-conversion",
    params,
  );
}
