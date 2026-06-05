import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";
import { useAuth } from "@/contexts/AuthContext";
import { fetchOrders } from "@/lib/orders/api/orders";
import type {
  OrderDetailApiDto,
  OrderSummaryApiDto,
} from "@/lib/orders/api/types";
import { fetchOrderDetailsBatch } from "@/lib/orders/fetchOrderDetailsBatch";
import { enrichOrderSummaryFromDetail } from "@/lib/orders/mapOrderFromApi";
import { periodToApiDateRange } from "@/lib/orders/periodToApiRange";
import { useCallback, useState } from "react";

const DEFAULT_PAGE_SIZE = 50;

export function usePurchaseHistoryOrders() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummaryApiDto[]>([]);
  const [orderDetails, setOrderDetails] = useState<
    Map<number, OrderDetailApiDto>
  >(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(
    async (period: PeriodInquiryValue) => {
      if (authLoading) {
        return;
      }

      if (!isLoggedIn) {
        setOrders([]);
        setOrderDetails(new Map());
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

        if (data.length === 0) {
          setOrderDetails(new Map());
          return;
        }

        const details = await fetchOrderDetailsBatch(
          data.map((order) => order.orderId),
        );
        setOrderDetails(details);
        setOrders(
          data.map((order) => {
            const detail = details.get(order.orderId);
            return detail
              ? enrichOrderSummaryFromDetail(order, detail)
              : order;
          }),
        );
      } catch (err) {
        setOrders([]);
        setOrderDetails(new Map());
        setError(
          err instanceof Error ? err.message : "구매 내역을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    },
    [authLoading, isLoggedIn],
  );

  return { orders, orderDetails, loading, error, reload };
}
