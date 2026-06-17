import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  FetchPromotionSelectRateParams,
  PromotionSelectRateApiData,
  PromotionSelectRateApiDto,
  RecommendationPurchaseConversionData,
} from "@/lib/admin/api/types";

type SelectRateParams = FetchPromotionSelectRateParams & {
  limit?: number;
};

type PurchaseConversionParams = FetchPromotionSelectRateParams & {
  recommendationType: string;
  limit?: number;
};

function unwrapSelectRates(
  data: PromotionSelectRateApiData | undefined,
): PromotionSelectRateApiDto[] {
  return (
    data?.promotionSelectRates ??
    data?.alternativeSelectRates ??
    data?.substituteSelectRates ??
    data?.products ??
    []
  );
}

function withCompatibleDateParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const startDate = params.startDate ?? params.fromDate;
  const endDate = params.endDate ?? params.toDate;

  return {
    ...params,
    ...(startDate != null
      ? {
          startDate,
          fromDate: startDate,
        }
      : {}),
    ...(endDate != null
      ? {
          endDate,
          toDate: endDate,
        }
      : {}),
  };
}

async function fetchAnalyticsData<T>(
  path: string,
  params: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await analyticsApiClient.get<ApiEnvelope<T>>(path, {
      params: withCompatibleDateParams(params),
    });

    const body = response.data;

    if (!body?.success || body.data == null) {
      throw new Error(body?.message ?? "분석 데이터를 불러오지 못했습니다.");
    }

    return body.data;
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "분석 데이터를 불러오지 못했습니다."),
    );
  }
}

async function fetchSelectRateData(
  path: string,
  params: SelectRateParams,
): Promise<PromotionSelectRateApiData> {
  return fetchAnalyticsData<PromotionSelectRateApiData>(
    path,
    params as unknown as Record<string, unknown>,
  );
}

async function fetchSelectRates(
  path: string,
  params: SelectRateParams,
): Promise<PromotionSelectRateApiDto[]> {
  const data = await fetchSelectRateData(path, params);
  return unwrapSelectRates(data);
}

/** GET /api/v1/analytics/promotions/select-rate */
export function fetchPromotionSelectRates(params: SelectRateParams) {
  return fetchSelectRates("/api/v1/analytics/promotions/select-rate", params);
}

/** GET /api/v1/analytics/alternatives/select-rate — 품절 대응 퍼널 상품 목록 */
export function fetchAlternativeSelectRates(params: SelectRateParams) {
  return fetchSelectRates("/api/v1/analytics/alternatives/select-rate", params);
}

/** GET /api/v1/analytics/alternatives/select-rate — 품절 대응 퍼널 요약 */
export function fetchAlternativeSelectRateSummary(params: SelectRateParams) {
  return fetchSelectRateData(
    "/api/v1/analytics/alternatives/select-rate",
    params,
  );
}

/**
 * @deprecated
 * 추천 구매 전환 분석은 "@/lib/admin/api/fetchAdminRecommendationAnalytics"의
 * fetchRecommendationPurchaseConversionAnalytics 사용 권장.
 *
 * 기존 import 깨짐 방지용으로 유지.
 */
export function fetchRecommendationPurchaseConversionAnalytics(
  params: PurchaseConversionParams,
) {
  return fetchAnalyticsData<RecommendationPurchaseConversionData>(
    "/api/v1/analytics/purchase-conversion",
    {
      startDate: params.startDate,
      endDate: params.endDate,
      fromDate: params.startDate,
      toDate: params.endDate,
      recommendationType: params.recommendationType,
      limit: params.limit,
      ...(params.productId != null ? { productId: params.productId } : {}),
      ...(params.sourceProductId != null
        ? { sourceProductId: params.sourceProductId }
        : {}),
      ...(params.promotionId != null ? { promotionId: params.promotionId } : {}),
    },
  );
}

/** @deprecated fetchAlternativeSelectRates 사용 */
export function fetchSubstituteSelectRates(params: SelectRateParams) {
  return fetchAlternativeSelectRates(params);
}