import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import {
  logRecentViewsError,
  logRecentViewsRequest,
} from "@/lib/auth/api/recentViewsDevLog";
import type { ApiEnvelope, RecentViewAddApiDto } from "@/lib/auth/types";

export async function addRecentView(productId: number | string): Promise<void> {
  const numericId =
    typeof productId === "number" ? productId : Number(productId.trim());

  if (!Number.isFinite(numericId)) {
    return;
  }

  logRecentViewsRequest("POST", { body: { productId: numericId } });

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
    logRecentViewsError("POST", error);
    throw new Error(
      parseApiErrorMessage(error, "최근 본 상품에 추가하지 못했습니다."),
    );
  }
}
