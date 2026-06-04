import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { authenticatedUserApiClient } from "@/lib/auth/api/authenticatedUserApiClient";
import { buildUserApiHeaders } from "@/lib/auth/api/userApiHeaders";
import {
  logRecentViewsError,
  logRecentViewsRequest,
} from "@/lib/auth/api/recentViewsDevLog";
import { mapRecentViewsToProducts } from "@/lib/auth/mapRecentViewToProduct";
import { extractRecentViewsList } from "@/lib/auth/normalizeRecentViewDto";
import type { ApiEnvelope } from "@/lib/auth/types";
import type { Product } from "@/components/product/types";

export async function fetchRecentViews(): Promise<Product[]> {
  logRecentViewsRequest("GET");

  try {
    const response = await authenticatedUserApiClient.get<
      ApiEnvelope<unknown>
    >("/api/v1/users/me/recent-views", {
      headers: buildUserApiHeaders(),
    });

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "최근 본 상품을 불러오지 못했습니다.");
    }

    return mapRecentViewsToProducts(extractRecentViewsList(body.data));
  } catch (error) {
    logRecentViewsError("GET", error);
    throw new Error(
      parseApiErrorMessage(error, "최근 본 상품을 불러오지 못했습니다."),
    );
  }
}
