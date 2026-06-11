import type { PointHistoryFilterType } from "@/components/point/mockPointHistory";
import type { PointHistoryItem } from "@/components/point/mockPointHistory";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import type { ApiEnvelope } from "@/lib/auth/types";
import type {
  RewardHistoriesApiData,
  RewardHistoriesResult,
} from "@/lib/rewards/api/types";
import { mapRewardHistoryFromApi } from "@/lib/rewards/mapRewardHistoryFromApi";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export type FetchRewardHistoriesParams = {
  fromDate?: string;
  toDate?: string;
  filter?: PointHistoryFilterType;
  limit?: number;
};

export type FetchRewardHistoriesResult = {
  histories: PointHistoryItem[];
  count: number;
};

function normalizeLimit(limit?: number) {
  if (!Number.isFinite(limit) || !limit) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);
}

function mapRewardHistoriesResult(
  data: RewardHistoriesResult,
): FetchRewardHistoriesResult {
  // 변동 포인트 0인 내역(예: 0P 적립)은 표시하지 않음
  const histories = data.histories
    .map(mapRewardHistoryFromApi)
    .filter((item) => item.amount !== 0);

  return {
    histories,
    count: histories.length,
  };
}

/** GET /api/v1/users/me/rewards — 포인트 내역 조회 */
export async function fetchRewardHistories(
  params: FetchRewardHistoriesParams = {},
): Promise<FetchRewardHistoriesResult> {
  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<RewardHistoriesApiData>
    >("/api/v1/users/me/rewards", {
      params: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        filter: params.filter ?? "all",
        limit: normalizeLimit(params.limit),
      },
      headers: buildUserApiHeaders(),
    });

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "포인트 내역을 불러오지 못했습니다.");
    }

    return mapRewardHistoriesResult({
      histories: body.data.histories ?? [],
      count: body.data.count ?? 0,
    });
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "포인트 내역을 불러오지 못했습니다."),
    );
  }
}
