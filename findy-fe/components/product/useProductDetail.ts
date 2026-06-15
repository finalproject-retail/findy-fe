import type { Product } from "@/components/product/types";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { addRecentView } from "@/lib/auth/api/addRecentView";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";
import { fetchApplicablePromotions } from "@/lib/promotions/api/fetchApplicablePromotions";
import { applyBestApplicablePromotion } from "@/lib/promotions/applyPromotionPricing";
import { useCallback, useEffect, useRef, useState } from "react";

export function useProductDetail(productId: string | undefined) {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recordedRecentViewRef = useRef<string | null>(null);

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
      const [data, applicablePromotions] = await Promise.all([
        fetchProductDetail(productId.trim()),
        fetchApplicablePromotions(productId.trim()).catch(() => []),
      ]);
      setProduct(applyBestApplicablePromotion(data, applicablePromotions));
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

  useEffect(() => {
    recordedRecentViewRef.current = null;
  }, [productId]);

  useEffect(() => {
    if (authLoading || !isLoggedIn || !product?.id) {
      return;
    }
    if (recordedRecentViewRef.current === product.id) {
      return;
    }

    recordedRecentViewRef.current = product.id;
    void addRecentView(product.id).catch(() => {
      recordedRecentViewRef.current = null;
    });
  }, [authLoading, isLoggedIn, product?.id]);

  return { product, loading, error, reload: load };
}
