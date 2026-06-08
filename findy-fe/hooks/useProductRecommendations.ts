import type { Product } from "@/components/product";
import { DEFAULT_API_STORE_ID } from "@/components/home/storeOptions";
import {
  fetchRelatedProductRecommendations,
  fetchSubstituteProductRecommendations,
} from "@/lib/recommendations/api/fetchProductRecommendations";
import { useEffect, useState } from "react";

export type ProductRecommendationVariant = "related" | "substitute";

type UseProductRecommendationsOptions = {
  productId: string;
  variant?: ProductRecommendationVariant;
  storeId?: number;
  size?: number;
  enabled?: boolean;
};

export function useProductRecommendations({
  productId,
  variant = "related",
  storeId = DEFAULT_API_STORE_ID,
  size = 9,
  enabled = true,
}: UseProductRecommendationsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled || !productId.trim()) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const fetched =
          variant === "substitute"
            ? await fetchSubstituteProductRecommendations(
                productId,
                storeId,
                size,
              )
            : await fetchRelatedProductRecommendations(productId, size);

        if (!cancelled) {
          setProducts(fetched);
        }
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
        }
        if (__DEV__) {
          console.warn(
            `[product-recommend/${variant}]`,
            error instanceof Error ? error.message : error,
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, productId, size, storeId, variant]);

  return { products, loading };
}
