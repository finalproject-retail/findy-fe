import type { Product } from "@/components/product/types";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";
import { useCallback, useEffect, useState } from "react";

export function useProductDetail(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId?.trim()) {
      setProduct(null);
      setError("상품 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchProductDetail(productId.trim());
      setProduct(data);
    } catch (err) {
      setProduct(null);
      setError(
        parseApiErrorMessage(err, "상품 정보를 불러오지 못했습니다."),
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { product, loading, error, reload: load };
}
