import type { Product } from "@/components/product";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRecentViews } from "@/lib/auth/api/fetchRecentViews";
import { useCallback, useState } from "react";

export function useRecentViews() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (authLoading) {
      return;
    }

    if (!isLoggedIn) {
      setProducts([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecentViews();
      setProducts(data);
    } catch (err) {
      setProducts([]);
      setError(
        err instanceof Error
          ? err.message
          : "최근 본 상품을 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, isLoggedIn]);

  return { products, loading, error, reload };
}
