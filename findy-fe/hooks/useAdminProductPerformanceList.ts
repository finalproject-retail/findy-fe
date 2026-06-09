import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import {
  ADMIN_PRODUCT_LIST_PAGE_SIZE,
  fetchAdminProductPerformanceListPage,
  type AdminProductPerformanceMap,
} from "@/lib/admin/api/fetchAdminProductPerformance";
import { useAuthReady } from "@/hooks/useAuthReady";
import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminProductPerformanceList(dateRange: AdminDateRange) {
  const isAuthReady = useAuthReady();
  const [products, setProducts] = useState<AdminProductPerformance[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [performanceWarning, setPerformanceWarning] = useState<string | null>(null);
  const performanceMapRef = useRef<AdminProductPerformanceMap | null>(null);

  const loadFirstPage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPerformanceWarning(null);
    performanceMapRef.current = null;

    try {
      const result = await fetchAdminProductPerformanceListPage(
        dateRange,
        0,
        ADMIN_PRODUCT_LIST_PAGE_SIZE,
      );

      if (result.performanceMap) {
        performanceMapRef.current = result.performanceMap;
      }

      if (result.performanceUnavailable) {
        setPerformanceWarning(
          "성과 데이터(조회수·전환율)를 불러오지 못했습니다. 상품 목록만 표시됩니다.",
        );
      }

      setProducts(result.products);
      setPage(0);
      setHasMore(result.hasMore);
    } catch (loadError) {
      setProducts([]);
      setHasMore(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.end, dateRange.start]);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }
    void loadFirstPage();
  }, [isAuthReady, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await fetchAdminProductPerformanceListPage(
        dateRange,
        nextPage,
        ADMIN_PRODUCT_LIST_PAGE_SIZE,
        { performanceMap: performanceMapRef.current ?? undefined },
      );

      if (result.performanceMap) {
        performanceMapRef.current = result.performanceMap;
      }

      setProducts((current) => [...current, ...result.products]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 목록을 더 불러오지 못했습니다.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [dateRange.end, dateRange.start, hasMore, isLoading, isLoadingMore, page]);

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
