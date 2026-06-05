import { useAuth } from "@/contexts/AuthContext";
import { fetchOrderDetail } from "@/lib/orders/api/orders";
import type { OrderDetailApiDto } from "@/lib/orders/api/types";
import { useCallback, useState } from "react";

export function useOrderDetail(orderId: number | null) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<OrderDetailApiDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (authLoading || orderId == null) {
      return;
    }

    if (!isLoggedIn) {
      setOrder(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchOrderDetail(orderId);
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(
        err instanceof Error
          ? err.message
          : "구매 내역 상세를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn, orderId]);

  return { order, loading, error, reload };
}
