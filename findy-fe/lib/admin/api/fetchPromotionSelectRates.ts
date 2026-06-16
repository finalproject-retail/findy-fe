import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  FetchPromotionSelectRateParams,
  PromotionSelectRateApiData,
  PromotionSelectRateApiDto,
} from "@/lib/admin/api/types";

type SelectRateParams = FetchPromotionSelectRateParams & {
  limit?: number;
};

type PurchaseConversionParams = FetchPromotionSelectRateParams & {
  recommendationType: string;
  limit?: number;
};

export type RecommendationPurchaseConversionData = {
  period?: {
    fromDate?: string;
    toDate?: string;
  };
  recommendationType?: string | null;
  productId?: number | null;
  impressionCount?: number;
  clickCount?: number;
  purchaseCount?: number;
  purchaseConversionRate?: number;
  clickToPurchaseRate?: number;
  dailyTrends?: unknown[];
  products?: unknown[];
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

async function fetchAnalyticsData<T>(
  path: string,
  params: Record<string, unknown>,
): Promise<T> {
  try {
    const response = await analyticsApiClient.get<ApiEnvelope<T>>(path, {
      params,
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
  return fetchAnalyticsData<PromotionSelectRateApiData>(path, params);
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
  return fetchSelectRates(
    "/api/v1/analytics/promotions/select-rate",
    params,
  );
}

/** GET /api/v1/analytics/alternatives/select-rate — 품절 대응 퍼널 상품 목록 */
export function fetchAlternativeSelectRates(params: SelectRateParams) {
  return fetchSelectRates(
    "/api/v1/analytics/alternatives/select-rate",
    params,
  );
}

/** GET /api/v1/analytics/alternatives/select-rate — 품절 대응 퍼널 요약 */
export function fetchAlternativeSelectRateSummary(params: SelectRateParams) {
  return fetchSelectRateData(
    "/api/v1/analytics/alternatives/select-rate",
    params,
  );
}

/** GET /api/v1/analytics/purchase-conversion */
export function fetchRecommendationPurchaseConversionAnalytics(
  params: PurchaseConversionParams,
) {
  return fetchAnalyticsData<RecommendationPurchaseConversionData>(
    "/api/v1/analytics/purchase-conversion",
    params,
  );
}

/** @deprecated fetchAlternativeSelectRates 사용 */
export function fetchSubstituteSelectRates(params: SelectRateParams) {
  return fetchAlternativeSelectRates(params);
}