import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  FetchAdminZoneVisitRatesParams,
  ZoneVisitRateData,
} from "@/lib/admin/api/types";

/** GET /api/v1/analytics/zones/visit-rates */
export async function fetchAdminZoneVisitRates(
  params: FetchAdminZoneVisitRatesParams,
): Promise<ZoneVisitRateData> {
  try {
    const response = await analyticsApiClient.get<ApiEnvelope<ZoneVisitRateData>>(
      "/api/v1/analytics/zones/visit-rates",
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          ...(params.storeId != null ? { storeId: params.storeId } : {}),
          ...(params.zoneId != null ? { zoneId: params.zoneId } : {}),
          ...(params.minStaySeconds != null
            ? { minStaySeconds: params.minStaySeconds }
            : {}),
          ...(params.includeMovement != null
            ? { includeMovement: params.includeMovement }
            : {}),
        },
      },
    );

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "구역별 방문율을 불러오지 못했습니다.");
    }

    return body.data;
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "구역별 방문율을 불러오지 못했습니다."),
    );
  }
}
