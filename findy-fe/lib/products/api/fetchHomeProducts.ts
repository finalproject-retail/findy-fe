import { SHOPPING_API_MAX_SECTION_SIZE } from "@/lib/products/constants";
import type { Product } from "@/components/product";
import type { ApiEnvelope } from "@/lib/map/types";
import { mapProductsFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto, ProductListApiData } from "@/lib/products/types";
import { shoppingApiClient } from "./productClient";

function clampSectionSize(size: number) {
  return Math.min(Math.max(1, size), SHOPPING_API_MAX_SECTION_SIZE);
}

/** 응답 data: ProductResponse[] (배열 직접) 또는 items/products 래핑 */
function unwrapProductList(data: ProductListApiData | undefined): ProductApiDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data;
  }
  return data.items ?? data.products ?? data.content ?? [];
}

async function fetchProductList(
  path: string,
  size: number,
): Promise<Product[]> {
  const response = await shoppingApiClient.get<ApiEnvelope<ProductListApiData>>(
    path,
    { params: { size: clampSectionSize(size) } },
  );

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message ?? "상품 목록을 불러오지 못했습니다.");
  }

  return mapProductsFromApi(unwrapProductList(body.data));
}

export function fetchNewProducts(size: number) {
  return fetchProductList("/api/v1/products/new", size);
}

export function fetchPopularProducts(size: number) {
  return fetchProductList("/api/v1/products/popular", size);
}

export function fetchFindyRecommendProducts(size: number) {
  return fetchProductList("/api/v1/products/findy-recommendations", size);
}
