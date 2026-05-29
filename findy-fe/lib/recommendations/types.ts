import type { ProductApiDto } from "@/lib/products/types";

/** GET /api/v1/recommendations/personalized 응답 data */
export type PersonalizedRecommendationsApiData = {
  userId?: number;
  baseType?: string;
  preferredCategories?: string[];
  shoppingStyles?: string[];
  recommendations?: ProductApiDto[];
};
