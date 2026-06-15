import type { Product } from "@/components/product";
import type { RecommendedMapItem } from "@/components/store-map/overlays/types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";
import { applyPromotionPricingToProduct } from "@/lib/promotions/applyPromotionPricing";
import type { PromotionProductApi } from "@/lib/promotions/types";

function promotionToRecommendedMapItem(
  promotion: PromotionProductApi,
  productName: string,
  gridCols: number,
): RecommendedMapItem {
  const { gridX, gridY } = gridIdToGridPoint(promotion.gridId, gridCols);

  return {
    id: String(promotion.productId),
    name: productName,
    gridX,
    gridY,
    gridId: promotion.gridId,
    source: "promotion",
  };
}

export type PromotionMapOverlay = {
  items: RecommendedMapItem[];
  productsById: Record<string, Product>;
};

export async function buildPromotionMapOverlay(
  promotions: PromotionProductApi[],
  gridCols: number,
): Promise<PromotionMapOverlay> {
  const promotionByProductId = new Map<number, PromotionProductApi>();

  for (const promotion of promotions) {
    if (promotion.productId == null || promotion.gridId == null) {
      continue;
    }
    if (!promotionByProductId.has(promotion.productId)) {
      promotionByProductId.set(promotion.productId, promotion);
    }
  }

  const results = await Promise.allSettled(
    [...promotionByProductId.entries()].map(async ([productId, promotion]) => {
      const product = await fetchProductDetail(String(productId));
      return {
        item: promotionToRecommendedMapItem(promotion, product.name, gridCols),
        product: applyPromotionPricingToProduct(product, promotion),
      };
    }),
  );

  const items: RecommendedMapItem[] = [];
  const productsById: Record<string, Product> = {};

  for (const result of results) {
    if (result.status !== "fulfilled") {
      if (__DEV__) {
        console.warn(
          "[buildPromotionMapOverlay] product load failed",
          result.reason,
        );
      }
      continue;
    }

    items.push(result.value.item);
    productsById[result.value.product.id] = result.value.product;
  }

  return { items, productsById };
}
