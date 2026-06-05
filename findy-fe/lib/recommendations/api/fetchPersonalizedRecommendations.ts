import type { Product } from "@/components/product";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import { getAccessToken } from "@/lib/api/client";
import type { ApiEnvelope } from "@/lib/map/types";
import {
  alignProductDtoWithShoppingPrice,
  mapProductsFromApi,
} from "@/lib/products/mapProductFromApi";
import type { PersonalizedRecommendationsApiData } from "@/lib/recommendations/types";
import { recommendationApiClient } from "./recommendationClient";

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
): Promise<PersonalizedRecommendationsResult> {
  const response = await recommendationApiClient.get<
    ApiEnvelope<PersonalizedRecommendationsApiData>
  >("/api/v1/recommendations/personalized", {
    params: {
      userId: resolvePersonalizedUserId(),
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
