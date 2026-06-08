import type { Product } from "@/components/product";
import { DEFAULT_API_STORE_ID } from "@/components/home/storeOptions";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope } from "@/lib/map/types";
import {
  alignProductDtoWithShoppingPrice,
  mapProductsFromApi,
} from "@/lib/products/mapProductFromApi";
import { filterInStockProducts } from "@/components/product/isOutOfStock";
import { enrichProductsWithShoppingStock } from "@/lib/products/enrichProductsWithShoppingStock";
import { SHOPPING_API_MAX_SECTION_SIZE } from "@/lib/products/constants";
import type { PersonalizedRecommendationsApiData } from "@/lib/recommendations/types";
import { recommendationApiClient } from "./recommendationClient";

const HOME_STOCK_OVERFETCH_RATIO = 3;

export type PersonalizedRecommendationsResult = {
  products: Product[];
  shoppingStyles: string[];
  preferredCategories: string[];
  baseType?: string;
};

function resolvePersonalizedUserId(): string {
  const fromToken = getUserIdFromAccessToken(getAccessToken());
  if (fromToken) {
    return fromToken;
  }
  const fromEnv = process.env.EXPO_PUBLIC_DEV_USER_ID?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return "1";
}

export async function fetchPersonalizedRecommendations(
  size: number,
  storeId: number = DEFAULT_API_STORE_ID,
): Promise<PersonalizedRecommendationsResult> {
  const response = await recommendationApiClient.get<
    ApiEnvelope<PersonalizedRecommendationsApiData>
  >("/api/v1/recommendations/personalized", {
    params: {
      userId: resolvePersonalizedUserId(),
      storeId,
      size,
    },
  });

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message ?? "맞춤 추천을 불러오지 못했습니다.");
  }

  const data = body.data;
  const items = (data?.recommendations ?? []).map(
    alignProductDtoWithShoppingPrice,
  );

  return {
    products: mapProductsFromApi(items),
    shoppingStyles: data?.shoppingStyles ?? [],
    preferredCategories: data?.preferredCategories ?? [],
    baseType: data?.baseType,
  };
}

/** 홈 온보딩 추천 — 추천 API에 재고가 없어 쇼핑 API로 실시간 재고 반영 후 품절 제외 */
export async function fetchPersonalizedRecommendationsInStock(
  size: number,
  storeId: number = DEFAULT_API_STORE_ID,
): Promise<PersonalizedRecommendationsResult> {
  const fetchSize = Math.min(
    Math.max(size, size * HOME_STOCK_OVERFETCH_RATIO),
    SHOPPING_API_MAX_SECTION_SIZE,
  );

  const result = await fetchPersonalizedRecommendations(fetchSize, storeId);
  const enriched = await enrichProductsWithShoppingStock(result.products);
  const inStock = filterInStockProducts(enriched).slice(0, size);

  return {
    ...result,
    products: inStock,
  };
}
