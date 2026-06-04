import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import type { ApiEnvelope, RecentViewAddApiDto } from "@/lib/auth/types";

export async function addRecentView(productId: number | string): Promise<void> {
  const numericId =
    typeof productId === "number" ? productId : Number(productId.trim());

  if (!Number.isFinite(numericId)) {
    return;
  }

  try {
    const response = await authenticatedUserApiClient.post<
      ApiEnvelope<RecentViewAddApiDto>
    >(
      "/api/v1/users/me/recent-views",
      { productId: numericId },
      { headers: buildUserApiHeaders() },
    );

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "최근 본 상품에 추가하지 못했습니다.");
    }
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "최근 본 상품에 추가하지 못했습니다."),
    );
  }
}
