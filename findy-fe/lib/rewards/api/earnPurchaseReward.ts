import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import type { ApiEnvelope } from "@/lib/auth/types";
import type {
  EarnPurchaseRewardApiDto,
  EarnPurchaseRewardResult,
} from "@/lib/rewards/api/types";

export type EarnPurchaseRewardParams = {
  orderId: number;
  finalAmount: number;
};

function mapEarnPurchaseRewardFromApi(
  dto: EarnPurchaseRewardApiDto,
): EarnPurchaseRewardResult {
  return {
    orderId: dto.orderId,
    earnedReward: dto.earnedReward,
    rewardBalance: dto.rewardBalance,
    purchaseAmount: dto.purchaseAmount,
    grade: dto.grade,
    rewardRate: dto.rewardRate,
  };
}

/** POST /api/v1/users/me/rewards/orders — 구매 포인트 적립 */
export async function earnPurchaseReward(
  params: EarnPurchaseRewardParams,
): Promise<EarnPurchaseRewardResult> {
  try {
    const response = await authenticatedUserApiClient.post<
      ApiEnvelope<EarnPurchaseRewardApiDto>
    >(
      "/api/v1/users/me/rewards/orders",
      {
        orderId: params.orderId,
        finalAmount: params.finalAmount,
      },
      { headers: buildUserApiHeaders() },
    );

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "구매 포인트 적립에 실패했습니다.");
    }

    return mapEarnPurchaseRewardFromApi(body.data);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "구매 포인트 적립에 실패했습니다."),
    );
  }
}
