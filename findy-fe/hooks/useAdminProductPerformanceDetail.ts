import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import type { AdminProductPerformance } from "@/lib/admin/adminProductPerformanceTypes";
import { fetchAdminProductPerformanceDetail } from "@/lib/admin/api/fetchAdminProductPerformance";
import { useCallback, useEffect, useState } from "react";

export function useAdminProductPerformanceDetail(
  productId: string,
  dateRange: AdminDateRange,
) {
  const [data, setData] = useState<AdminProductPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId) {
      setData(null);
      setError("상품 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextData = await fetchAdminProductPerformanceDetail(productId, dateRange);
      setData(nextData);
      if (!nextData) {
        setError("상품 정보를 찾을 수 없습니다.");
      }
    } catch (loadError) {
      setData(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "상품 상세 성과를 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.end, dateRange.start, productId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}
