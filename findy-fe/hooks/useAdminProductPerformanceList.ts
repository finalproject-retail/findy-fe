import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import { fetchAdminProductPerformanceList } from "@/lib/admin/api/fetchAdminProductPerformance";
import { useCallback, useEffect, useState } from "react";

export function useAdminProductPerformanceList(dateRange: AdminDateRange) {
  const [products, setProducts] = useState<AdminProductPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextProducts = await fetchAdminProductPerformanceList(dateRange);
      setProducts(nextProducts);
    } catch (loadError) {
      setProducts([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 성과 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.end, dateRange.start]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, isLoading, error, reload: load };
}
