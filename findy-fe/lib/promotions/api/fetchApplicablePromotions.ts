import { getApiErrorMessage } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/shopping/types";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import type { ApplicablePromotionApi } from "@/lib/promotions/types";

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "요청에 실패했습니다.");
  }
  return envelope.data;
}

export async function fetchApplicablePromotions(
  productId: string | number,
): Promise<ApplicablePromotionApi[]> {
  try {
    const response = await shoppingApiClient.get<
      ApiEnvelope<ApplicablePromotionApi[]>
    >(`/api/v1/promotions/products/${productId}/applicable`);
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}
