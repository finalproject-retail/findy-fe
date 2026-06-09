import {
  fetchAlternativeSelectRates,
  fetchPromotionSelectRates,
} from "@/lib/admin/api/fetchPromotionSelectRates";
import { toAdminAnalyticsQueryRange } from "@/lib/admin/formatAdminApiDate";
import {
  mapPromotionSelectRatesToProducts,
  mapSubstituteSelectRatesToFunnel,
} from "@/lib/admin/mapSelectRateAnalytics";
import type {
  AdminDateRange,
  AdminFunnelStep,
  AdminPromoProduct,
} from "@/lib/admin/mockDashboardData";
import { useAuthReady } from "@/hooks/useAuthReady";
import { useEffect, useState } from "react";

const EMPTY_FUNNEL: AdminFunnelStep[] = [
  { label: "1. 대체 상품 노출", percent: 100 },
  { label: "2. 대체 상품 선택", percent: 0 },
  { label: "3. 대체 상품 구매", percent: 0 },
];

export function useAdminPromotionAnalytics(dateRange: AdminDateRange) {
  const isAuthReady = useAuthReady();
  const [funnel, setFunnel] = useState<AdminFunnelStep[]>(EMPTY_FUNNEL);
  const [finalConversionRate, setFinalConversionRate] = useState("0%");
  const [promoProducts, setPromoProducts] = useState<AdminPromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    let cancelled = false;
    const query = toAdminAnalyticsQueryRange(dateRange);

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [alternativeSelectRates, promotionSelectRates] = await Promise.all([
          fetchAlternativeSelectRates(query),
          fetchPromotionSelectRates(query),
        ]);

        if (cancelled) {
          return;
        }

        const funnelData = mapSubstituteSelectRatesToFunnel(alternativeSelectRates);
        setFunnel(funnelData.steps);
        setFinalConversionRate(funnelData.finalConversionRate);
        setPromoProducts(mapPromotionSelectRatesToProducts(promotionSelectRates));
      } catch (err) {
        if (cancelled) {
          return;
        }
        setFunnel(EMPTY_FUNNEL);
        setFinalConversionRate("0%");
        setPromoProducts([]);
        setError(
          err instanceof Error
            ? err.message
            : "분석 데이터를 불러오지 못했습니다.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [dateRange.end, dateRange.start, isAuthReady]);

  return {
    funnel,
    finalConversionRate,
    promoProducts,
    loading,
    error,
  };
}
