import { useAuthReady } from "@/hooks/useAuthReady";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import {
  ADMIN_PRODUCT_LIST_PAGE_SIZE,
  fetchAdminProductPerformanceListPage,
  type AdminProductPerformanceMap,
} from "@/lib/admin/api/fetchAdminProductPerformance";
import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import { useCallback, useEffect, useRef, useState } from "react";

type AdminProductPerformanceListFilters = {
  keyword?: string;
  categoryIds?: number[];
};

function parseCategoryIds(categoryIdsKey: string) {
  if (!categoryIdsKey) {
    return undefined;
  }

  const categoryIds = categoryIdsKey
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  return categoryIds.length > 0 ? categoryIds : undefined;
}

export function useAdminProductPerformanceList(
  dateRange: AdminDateRange,
  filters: AdminProductPerformanceListFilters = {},
) {
  const isAuthReady = useAuthReady();

  const keyword = filters.keyword?.trim() ?? "";
  const categoryIdsKey = filters.categoryIds?.join(",") ?? "";
  const requestKey = `${dateRange.start}|${dateRange.end}|${keyword}|${categoryIdsKey}`;

  const latestRequestKeyRef = useRef(requestKey);
  latestRequestKeyRef.current = requestKey;

  const [products, setProducts] = useState<AdminProductPerformance[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(
    null,
  );

  const performanceMapRef = useRef<AdminProductPerformanceMap | null>(null);

  const loadFirstPage = useCallback(async () => {
    const currentRequestKey = latestRequestKeyRef.current;

    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setPerformanceWarning(null);
    setProducts([]);
    setPage(0);
    setHasMore(true);
    performanceMapRef.current = null;

    try {
      const result = await fetchAdminProductPerformanceListPage(
        dateRange,
        0,
        ADMIN_PRODUCT_LIST_PAGE_SIZE,
        {
          keyword: keyword || undefined,
          categoryIds: parseCategoryIds(categoryIdsKey),
        },
      );

      if (latestRequestKeyRef.current !== currentRequestKey) {
        return;
      }

      if (result.performanceMap) {
        performanceMapRef.current = result.performanceMap;
      }

      if (result.performanceUnavailable) {
        setPerformanceWarning(
          "성과 데이터(조회수·전환율)를 불러오지 못했습니다. 상품 목록만 표시됩니다.",
        );
      }

      setProducts(result.products);
      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (loadError) {
      if (latestRequestKeyRef.current !== currentRequestKey) {
        return;
      }

      setProducts([]);
      setHasMore(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 목록을 불러오지 못했습니다.",
      );
    } finally {
      if (latestRequestKeyRef.current === currentRequestKey) {
        setIsLoading(false);
      }
    }
  }, [categoryIdsKey, dateRange, keyword]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    void loadFirstPage();
  }, [isAuthReady, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) {
      return;
    }

    const currentRequestKey = latestRequestKeyRef.current;
    const nextPage = page + 1;

    setIsLoadingMore(true);
    setError(null);

    try {
      const result = await fetchAdminProductPerformanceListPage(
        dateRange,
        nextPage,
        ADMIN_PRODUCT_LIST_PAGE_SIZE,
        {
          keyword: keyword || undefined,
          categoryIds: parseCategoryIds(categoryIdsKey),
          performanceMap: performanceMapRef.current ?? undefined,
        },
      );

      if (latestRequestKeyRef.current !== currentRequestKey) {
        return;
      }

      if (result.performanceMap) {
        performanceMapRef.current = result.performanceMap;
      }

      setProducts((current) => {
        const seenProductIds = new Set(current.map((item) => item.productId));
        const merged = [...current];

        for (const product of result.products) {
          if (!seenProductIds.has(product.productId)) {
            merged.push(product);
            seenProductIds.add(product.productId);
          }
        }

        return merged;
      });

      setPage(result.page);
      setHasMore(result.hasMore);
    } catch (loadError) {
      if (latestRequestKeyRef.current !== currentRequestKey) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 목록을 더 불러오지 못했습니다.",
      );
    } finally {
      if (latestRequestKeyRef.current === currentRequestKey) {
        setIsLoadingMore(false);
      }
    }
  }, [
    categoryIdsKey,
    dateRange,
    hasMore,
    isLoading,
    isLoadingMore,
    keyword,
    page,
  ]);

  return {
    products,
    isLoading,
    isLoadingMore,
    error,
    performanceWarning,
    hasMore,
    loadMore,
    reload: loadFirstPage,
  };
}