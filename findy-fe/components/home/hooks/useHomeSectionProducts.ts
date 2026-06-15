import {
  HOME_SECTION_LIMITS,
  SHOPPING_API_MAX_SECTION_SIZE,
} from "@/components/home/constants";
import {
  getInStockProducts,
  MOCK_POPULAR_PRODUCTS,
} from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import { filterInStockProducts } from "@/components/product/isOutOfStock";
import { useAuthReady } from "@/hooks/useAuthReady";
import {
  fetchFindyRecommendProducts,
  fetchNewProducts,
  fetchPopularProducts,
} from "@/lib/products/api/fetchHomeProducts";
import { fetchPersonalizedRecommendations } from "@/lib/recommendations/api/fetchPersonalizedRecommendations";
import { useEffect, useState } from "react";

export type HomeSectionProductKind =
  | "new"
  | "popular"
  | "personalized"
  | "findy";

type UseHomeSectionProductsOptions = {
  kind: HomeSectionProductKind;
  storeId: number;
  limit?: number;
};

function getMockFallback(kind: HomeSectionProductKind, limit: number): Product[] {
  switch (kind) {
    case "popular":
      return MOCK_POPULAR_PRODUCTS.slice(0, limit);
    case "new":
    case "personalized":
    case "findy":
    default:
      return getInStockProducts().slice(0, limit);
  }
}

async function fetchByKind(
  kind: HomeSectionProductKind,
  limit: number,
  storeId: number,
): Promise<Product[]> {
  switch (kind) {
    case "new":
      return fetchNewProducts(limit);
    case "popular":
      return fetchPopularProducts(limit);
    case "findy":
      return fetchFindyRecommendProducts(limit);
    case "personalized": {
      const result = await fetchPersonalizedRecommendations(limit, storeId);
      return result.products;
    }
  }
}

function defaultLimit(kind: HomeSectionProductKind): number {
  switch (kind) {
    case "new":
      return HOME_SECTION_LIMITS.newProducts;
    case "popular":
      return HOME_SECTION_LIMITS.popularProducts;
    case "personalized":
      return HOME_SECTION_LIMITS.onboardingRecommend;
    case "findy":
      return SHOPPING_API_MAX_SECTION_SIZE;
  }
}

export function useHomeSectionProducts({
  kind,
  storeId,
  limit,
}: UseHomeSectionProductsOptions) {
  const isAuthReady = useAuthReady();
  const resolvedLimit = limit ?? defaultLimit(kind);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!isAuthReady) {
      setProducts([]);
      setLoading(true);
      setUsingFallback(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setUsingFallback(false);

      try {
        const fetched = await fetchByKind(kind, resolvedLimit, storeId);
        if (cancelled) {
          return;
        }

        const inStock = filterInStockProducts(fetched);

        if (inStock.length === 0) {
          setProducts(getMockFallback(kind, resolvedLimit));
          setUsingFallback(true);
          return;
        }

        setProducts(inStock.slice(0, resolvedLimit));
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (__DEV__) {
          console.warn(
            `[home/${kind}] API 실패 → 목 데이터 사용`,
            error instanceof Error ? error.message : error,
          );
        }
        setProducts(getMockFallback(kind, resolvedLimit));
        setUsingFallback(true);
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
  }, [isAuthReady, kind, resolvedLimit, storeId]);

  return { products, loading, usingFallback };
}
