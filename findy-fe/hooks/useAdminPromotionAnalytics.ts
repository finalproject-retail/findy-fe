import { fetchRecommendationPurchaseConversionAnalytics } from "@/lib/admin/api/fetchAdminRecommendationAnalytics";
import { toAdminAnalyticsPeriodQuery } from "@/lib/admin/formatAdminApiDate";
import {
  mapPromotionConversionToProducts,
  mapSubstituteConversionToFunnel,
} from "@/lib/admin/mapAdminRecommendationAnalytics";
import type {
  AdminDateRange,
  AdminFunnelStep,
  AdminPromoProduct,
} from "@/lib/admin/mockDashboardData";
import { useEffect, useState } from "react";

const EMPTY_FUNNEL: AdminFunnelStep[] = [
  { label: "1. 대체 상품 노출", percent: 100 },
  { label: "2. 대체 상품 선택", percent: 0 },
  { label: "3. 대체 상품 구매", percent: 0 },
];

const SUBSTITUTE_TYPE = "SUBSTITUTE";
const PROMOTION_TYPE = "AI_PERSONALIZED_PROMOTION";

export function useAdminPromotionAnalytics(dateRange: AdminDateRange) {
  const [funnel, setFunnel] = useState<AdminFunnelStep[]>(EMPTY_FUNNEL);
  const [finalConversionRate, setFinalConversionRate] = useState("0%");
  const [promoProducts, setPromoProducts] = useState<AdminPromoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const periodQuery = toAdminAnalyticsPeriodQuery(dateRange);

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [substituteConversion, promotionConversion] = await Promise.all([
          fetchRecommendationPurchaseConversionAnalytics({
            ...periodQuery,
            recommendationType: SUBSTITUTE_TYPE,
          }),
          fetchRecommendationPurchaseConversionAnalytics({
            ...periodQuery,
            recommendationType: PROMOTION_TYPE,
            limit: 20,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const funnelData = mapSubstituteConversionToFunnel(substituteConversion);
        setFunnel(funnelData.steps);
        setFinalConversionRate(funnelData.finalConversionRate);
        setPromoProducts(mapPromotionConversionToProducts(promotionConversion));
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
  }, [dateRange.end, dateRange.start]);

  return {
    funnel,
    finalConversionRate,
    promoProducts,
    loading,
    error,
  };
}
