import {
  fetchAlternativeSelectRateSummary,
  fetchPromotionSelectRates,
  fetchRecommendationPurchaseConversionAnalytics,
} from "@/lib/admin/api/fetchPromotionSelectRates";
import { toAdminAnalyticsQueryRange } from "@/lib/admin/formatAdminApiDate";
import { mapPromotionSelectRatesToProducts } from "@/lib/admin/mapSelectRateAnalytics";
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

function toPercent(value: unknown) {
  const n = Number(value ?? 0);

  if (!Number.isFinite(n)) {
    return 0;
  }

  if (n > 0 && n <= 1) {
    return Math.round(n * 1000) / 10;
  }

  return Math.round(n * 10) / 10;
}

function formatPercent(value: number) {
  return `${toPercent(value)}%`;
}

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
        const [
          alternativeSelectRateSummary,
          substitutePurchaseConversion,
          promotionSelectRates,
        ] = await Promise.all([
          fetchAlternativeSelectRateSummary({
            ...query,
            limit: 20,
          }),
          fetchRecommendationPurchaseConversionAnalytics({
            ...query,
            recommendationType: "SUBSTITUTE",
            limit: 20,
          }),
          fetchPromotionSelectRates({
            ...query,
            limit: 20,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const selectionPercent = toPercent(
          alternativeSelectRateSummary.selectionRate ??
            alternativeSelectRateSummary.selectRate,
        );

        const purchasePercent = toPercent(
          substitutePurchaseConversion.purchaseConversionRate ??
            alternativeSelectRateSummary.conversionRate,
        );

        setFunnel([
          { label: "1. 대체 상품 노출", percent: 100 },
          { label: "2. 대체 상품 선택", percent: selectionPercent },
          { label: "3. 대체 상품 구매", percent: purchasePercent },
        ]);

        setFinalConversionRate(formatPercent(purchasePercent));
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