import type { Coupon } from "@/components/coupon/types";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAvailableCoupons } from "@/lib/coupon/api/coupons";
import { useCallback, useState } from "react";

export function useAvailableCoupons() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      setCoupons([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAvailableCoupons();
      setCoupons(data);
    } catch (err) {
      setCoupons([]);
      setError(
        err instanceof Error ? err.message : "쿠폰 목록을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn]);

  return { coupons, loading, error, reload };
}
