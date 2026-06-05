import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOrders } from "@/lib/orders/api/orders";
import type { OrderSummaryApiDto } from "@/lib/orders/api/types";
import { periodToApiDateRange } from "@/lib/orders/periodToApiRange";
import { useCallback, useState } from "react";

const DEFAULT_PAGE_SIZE = 50;

export function usePurchaseHistoryOrders() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummaryApiDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (period: PeriodInquiryValue) => {
      if (authLoading) {
        return;
      }

      if (!isLoggedIn) {
        setOrders([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = periodToApiDateRange(period);
        const data = await fetchOrders({
          startDate,
          endDate,
          page: 0,
          size: DEFAULT_PAGE_SIZE,
        });
        setOrders(data);
      } catch (err) {
        setOrders([]);
        setError(
          err instanceof Error ? err.message : "구매 내역을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    },
    [authLoading, isLoggedIn],
  );

  return { orders, loading, error, reload };
}
