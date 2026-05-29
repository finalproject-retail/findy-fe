import type { ProductSortType } from "@/components/search/searchTypes";
import type { Product } from "@/components/product";
import {
  CATEGORY_PRODUCTS_PAGE_SIZE,
  fetchProductsByCategory,
} from "@/lib/products/api/fetchProductsByCategory";
import { useCallback, useEffect, useState } from "react";

type UseCategoryProductsOptions = {
  categoryId: number | null;
  sort: ProductSortType;
};

export function useCategoryProducts({
  categoryId,
  sort,
}: UseCategoryProductsOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      if (categoryId == null) {
        setProducts([]);
        setPage(0);
        setHasMore(false);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await fetchProductsByCategory({
          categoryId,
          sort,
          page: 0,
          size: CATEGORY_PRODUCTS_PAGE_SIZE,
        });

        if (cancelled) {
          return;
        }

        setProducts(result.products);
        setPage(result.page);
        setHasMore(!result.last);
      } catch (err) {
        if (cancelled) {
          return;
        }
        setProducts([]);
        setHasMore(false);
        setError(
          err instanceof Error
            ? err.message
            : "카테고리 상품을 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [categoryId, sort]);

  const loadMore = useCallback(async () => {
    if (categoryId == null || !hasMore || loadingMore || loading) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const result = await fetchProductsByCategory({
        categoryId,
        sort,
        page: nextPage,
        size: CATEGORY_PRODUCTS_PAGE_SIZE,
      });

      setProducts((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const product of result.products) {
          if (!seen.has(product.id)) {
            merged.push(product);
            seen.add(product.id);
          }
        }
        return merged;
      });
      setPage(result.page);
      setHasMore(!result.last);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "카테고리 상품을 불러오지 못했습니다.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [categoryId, hasMore, loading, loadingMore, page, sort]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  };
}
