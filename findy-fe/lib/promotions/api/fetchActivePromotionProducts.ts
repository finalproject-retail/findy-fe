import { getApiErrorMessage } from "@/lib/api";
import type { ApiEnvelope } from "@/lib/shopping/types";
import { shoppingApiClient } from "@/lib/products/api/productClient";
import type {
  PromotionProductApi,
  PromotionProductPageApi,
} from "@/lib/promotions/types";

const MAX_PAGE_SIZE = 100;

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data == null) {
    throw new Error(envelope.message ?? "요청에 실패했습니다.");
  }
  return envelope.data;
}

export async function fetchActivePromotionProductsPage(
  page = 0,
  size = MAX_PAGE_SIZE,
): Promise<PromotionProductPageApi> {
  try {
    const response = await shoppingApiClient.get<
      ApiEnvelope<PromotionProductPageApi>
    >("/api/v1/promotions/products/active", {
      params: { page, size },
    });
    return unwrap(response.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function fetchAllActivePromotionProducts(): Promise<
  PromotionProductApi[]
> {
  const items: PromotionProductApi[] = [];
  let page = 0;

  while (true) {
    const data = await fetchActivePromotionProductsPage(page, MAX_PAGE_SIZE);
    items.push(...(data.promotionProducts ?? []));
    if (!data.hasNext) {
      break;
    }
    page += 1;
  }

  return items;
}
