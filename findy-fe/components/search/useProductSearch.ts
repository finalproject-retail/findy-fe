import type { Product } from "@/components/product";
import {
  fetchProductSearch,
  PRODUCT_SEARCH_PAGE_SIZE,
} from "@/lib/products/api/fetchProductSearch";
import { useCallback, useEffect, useState } from "react";
import type { ProductSortType } from "./searchTypes";

type UseProductSearchOptions = {
  keyword: string;
  sort: ProductSortType;
};

export function useProductSearch({ keyword, sort }: UseProductSearchOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const trimmedKeyword = keyword.trim();

  useEffect(() => {
    let cancelled = false;

    async function loadFirstPage() {
      if (!trimmedKeyword) {
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
        const result = await fetchProductSearch({
          keyword: trimmedKeyword,
          sort,
          page: 0,
          size: PRODUCT_SEARCH_PAGE_SIZE,
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
          err instanceof Error ? err.message : "상품 검색에 실패했습니다.",
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
  }, [trimmedKeyword, sort]);

  const loadMore = useCallback(async () => {
    if (!trimmedKeyword || !hasMore || loadingMore || loading) {
      return;
    }

    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const result = await fetchProductSearch({
        keyword: trimmedKeyword,
        sort,
        page: nextPage,
        size: PRODUCT_SEARCH_PAGE_SIZE,
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
        err instanceof Error ? err.message : "상품 검색에 실패했습니다.",
      );
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loading, loadingMore, page, sort, trimmedKeyword]);

  return {
    products,
    loading,
    loadingMore,
    hasMore,
    error,
    loadMore,
  };
}
