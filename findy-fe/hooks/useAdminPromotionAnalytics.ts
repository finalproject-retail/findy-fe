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

function roundPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 10) / 10;
}

function toPercentFromCounts(numerator: unknown, denominator: unknown) {
  const n = Number(numerator ?? 0);
  const d = Number(denominator ?? 0);

  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) {
    return 0;
  }

  return roundPercent((n / d) * 100);
}

function formatPercent(value: number) {
  return `${roundPercent(value)}%`;
}

function clampFunnelPercent(value: number, previous: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(value, previous));
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

        const impressionPercent = 100;

        // 대시보드 퍼널의 "선택"은 strict SELECTION이 아니라
        // 대체 상품에 반응한 CLICK + SELECTION 기준으로 표시
        const rawSelectionPercent = toPercentFromCounts(
          substitutePurchaseConversion.clickCount,
          substitutePurchaseConversion.impressionCount,
        );

        const selectionPercent = clampFunnelPercent(
          rawSelectionPercent,
          impressionPercent,
        );

        const rawPurchasePercent = toPercentFromCounts(
          substitutePurchaseConversion.purchaseCount,
          substitutePurchaseConversion.impressionCount,
        );

        const purchasePercent = clampFunnelPercent(
          rawPurchasePercent,
          selectionPercent,
        );

        setFunnel([
          { label: "1. 대체 상품 노출", percent: impressionPercent },
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