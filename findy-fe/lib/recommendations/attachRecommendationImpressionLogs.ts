import type { Product } from "@/components/product";
import { saveRecommendationImpressionLog } from "@/lib/recommendations/api/saveRecommendationImpressionLog";
import { resolveRecommendationUserIdNumber } from "@/lib/recommendations/resolveRecommendationUserId";
import { trackRecommendationImpressionLog } from "@/lib/recommendations/recommendationLogTracker";
import type { RecommendationType } from "@/lib/recommendations/types";
import { getAccessToken } from "@/lib/api/client";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";

type AttachRecommendationImpressionLogsParams = {
  products: Product[];
  sourceProductId?: string;
  recommendationType: RecommendationType;
  displayLocation: string;
  storeId?: number | null;
};

function parseProductId(value: string): number | null {
  try {
    return parseShoppingProductId(value);
  } catch {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
}

/** 노출 로그 API로 recommendationLogId를 받아 상품·트래커에 연결 */
export async function attachRecommendationImpressionLogs({
  products,
  sourceProductId,
  recommendationType,
  displayLocation,
  storeId,
}: AttachRecommendationImpressionLogsParams): Promise<Product[]> {
  if (!getAccessToken() || products.length === 0) {
    return products;
  }

  const userId = resolveRecommendationUserIdNumber();
  if (userId == null) {
    return products;
  }

  const results = await Promise.all(
    products.map(async (product, index) => {
      const productId = parseProductId(product.id);
      if (productId == null) {
        return product;
      }

      const recommendationRank = product.recommendationRank ?? index + 1;

      try {
        const impression = await saveRecommendationImpressionLog({
          userId,
          productId,
          sourceProductId,
          storeId,
          recommendationType,
          displayLocation,
          recommendationRank,
        });

        const enriched: Product = {
          ...product,
          recommendationLogId: impression.recommendationLogId,
          recommendationSourceProductId: sourceProductId,
          recommendationRank,
        };

        trackRecommendationImpressionLog({
          recommendationLogId: impression.recommendationLogId,
          productId: enriched.id,
          sourceProductId,
        });

        return enriched;
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[recommendations/logs]",
            error instanceof Error ? error.message : error,
          );
        }
        return product;
      }
    }),
  );

  return results;
}
