import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";
import type {
  PointHistoryFilterType,
  PointHistoryItem,
} from "@/components/point/mockPointHistory";
import { useAuth } from "@/contexts/AuthContext";
import { periodToApiDateRange } from "@/lib/orders/periodToApiRange";
import { fetchRewardHistories } from "@/lib/rewards/api/fetchRewardHistories";
import { useCallback, useState } from "react";

export function usePointHistories() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [histories, setHistories] = useState<PointHistoryItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (period: PeriodInquiryValue, filter: PointHistoryFilterType) => {
      if (authLoading) {
        return;
      }

      if (!isLoggedIn) {
        setHistories([]);
        setCount(0);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = periodToApiDateRange(period);
        const data = await fetchRewardHistories({
          fromDate: startDate,
          toDate: endDate,
          filter,
        });
        setHistories(data.histories);
        setCount(data.count);
      } catch (err) {
        setHistories([]);
        setCount(0);
        setError(
          err instanceof Error
            ? err.message
            : "포인트 내역을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    },
    [authLoading, isLoggedIn],
  );

  return { histories, count, loading, error, reload };
}
