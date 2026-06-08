import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import type { ApiEnvelope } from "@/lib/auth/types";
import type { UseRewardApiDto, UseRewardResult } from "@/lib/rewards/api/types";

export type UseRewardForOrderParams = {
  orderId: number;
  usedAmount: number;
};

function mapUseRewardFromApi(dto: UseRewardApiDto): UseRewardResult {
  return {
    orderId: dto.orderId,
    usedReward: dto.usedReward,
    rewardBalance: dto.rewardBalance,
  };
}

/** POST /api/v1/users/me/rewards/use — 주문 결제 시 포인트 사용 */
export async function useRewardForOrder(
  params: UseRewardForOrderParams,
): Promise<UseRewardResult> {
  try {
    const response = await authenticatedUserApiClient.post<
      ApiEnvelope<UseRewardApiDto>
    >(
      "/api/v1/users/me/rewards/use",
      {
        orderId: params.orderId,
        usedAmount: params.usedAmount,
      },
      { headers: buildUserApiHeaders() },
    );

    const body = response.data;
    if (!body?.success || !body.data) {
      throw new Error(body?.message ?? "포인트 사용에 실패했습니다.");
    }

    return mapUseRewardFromApi(body.data);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "포인트 사용에 실패했습니다."),
    );
  }
}
