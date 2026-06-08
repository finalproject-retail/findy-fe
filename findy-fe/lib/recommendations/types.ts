import type { ProductApiDto } from "@/lib/products/types";

/** 연관·대체 상품 추천 항목 */
export type ProductRecommendationApiDto = {
  productId: number;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  stockStatus?: string | null;
  reason?: string | null;
};

/** GET /api/v1/recommendations/personalized 응답 data */
export type PersonalizedRecommendationsApiData = {
  userId?: number;
  baseType?: string;
  preferredCategories?: string[];
  shoppingStyles?: string[];
  recommendations?: ProductApiDto[];
};
