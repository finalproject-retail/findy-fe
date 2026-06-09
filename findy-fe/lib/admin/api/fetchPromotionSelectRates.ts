import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  FetchPromotionSelectRateParams,
  PromotionSelectRateApiData,
  PromotionSelectRateApiDto,
} from "@/lib/admin/api/types";

function unwrapSelectRates(
  data: PromotionSelectRateApiData | undefined,
): PromotionSelectRateApiDto[] {
  return (
    data?.promotionSelectRates ??
    data?.alternativeSelectRates ??
    data?.substituteSelectRates ??
    []
  );
}

async function fetchSelectRates(
  path: string,
  params: FetchPromotionSelectRateParams,
): Promise<PromotionSelectRateApiDto[]> {
  try {
    const response = await analyticsApiClient.get<
      ApiEnvelope<PromotionSelectRateApiData>
    >(path, { params });

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "분석 데이터를 불러오지 못했습니다.");
    }

    return unwrapSelectRates(body.data);
  } catch (error) {
    throw new Error(parseApiErrorMessage(error, "분석 데이터를 불러오지 못했습니다."));
  }
}

/** GET /api/v1/admin/analytics/promotions/select-rate */
export function fetchPromotionSelectRates(params: FetchPromotionSelectRateParams) {
  return fetchSelectRates(
    "/api/v1/admin/analytics/promotions/select-rate",
    params,
  );
}

/** GET /api/v1/admin/analytics/alternatives/select-rate — 품절 대응 퍼널 */
export function fetchAlternativeSelectRates(params: FetchPromotionSelectRateParams) {
  return fetchSelectRates(
    "/api/v1/admin/analytics/alternatives/select-rate",
    params,
  );
}

/** @deprecated fetchAlternativeSelectRates 사용 */
export function fetchSubstituteSelectRates(params: FetchPromotionSelectRateParams) {
  return fetchAlternativeSelectRates(params);
}
