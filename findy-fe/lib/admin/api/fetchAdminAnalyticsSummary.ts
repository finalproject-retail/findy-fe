import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { analyticsApiClient } from "@/lib/admin/api/analyticsClient";
import type {
  AnalyticsSummaryData,
  FetchAdminDashboardAnalyticsParams,
} from "@/lib/admin/api/types";

/** GET /api/v1/admin/analytics/performance-summary */
export async function fetchAdminAnalyticsSummary(
  params: FetchAdminDashboardAnalyticsParams,
): Promise<AnalyticsSummaryData> {
  try {
    const response = await analyticsApiClient.get<ApiEnvelope<AnalyticsSummaryData>>(
      "/api/v1/admin/analytics/performance-summary",
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          ...(params.storeId != null ? { storeId: params.storeId } : {}),
        },
      },
    );

    const body = response.data;
    if (!body?.success || !body.data?.summary) {
      throw new Error(body?.message ?? "운영 지표 요약을 불러오지 못했습니다.");
    }

    return body.data;
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "운영 지표 요약을 불러오지 못했습니다."),
    );
  }
}
