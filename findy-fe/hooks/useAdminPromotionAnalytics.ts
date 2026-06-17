import {
  fetchAlternativeSelectRateSummary,
  fetchPromotionSelectRates,
} from "@/lib/admin/api/fetchPromotionSelectRates";
import {
  fetchRecommendationClickRateAnalytics,
  fetchRecommendationPurchaseConversionAnalytics,
} from "@/lib/admin/api/fetchAdminRecommendationAnalytics";
import { toAdminAnalyticsQueryRange } from "@/lib/admin/formatAdminApiDate";
import { mapPromotionAnalyticsToProducts } from "@/lib/admin/mapSelectRateAnalytics";
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

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function toFiniteNumber(value: unknown): number {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getNumberFromRoot(source: unknown, keys: string[]): number {
  const record = toRecord(source);

  if (!record) {
    return 0;
  }

  for (const key of keys) {
    const value = toFiniteNumber(record[key]);

    if (value > 0) {
      return value;
    }
  }

  return 0;
}

function getNumberFromProducts(source: unknown, keys: string[]): number {
  const record = toRecord(source);
  const products = record?.products;

  if (!Array.isArray(products)) {
    return 0;
  }

  return products.reduce((sum, product) => {
    const productRecord = toRecord(product);

    if (!productRecord) {
      return sum;
    }

    for (const key of keys) {
      const value = toFiniteNumber(productRecord[key]);

      if (value > 0) {
        return sum + value;
      }
    }

    return sum;
  }, 0);
}

function getMetricTotal(source: unknown, keys: string[]): number {
  const rootValue = getNumberFromRoot(source, keys);

  if (rootValue > 0) {
    return rootValue;
  }

  return getNumberFromProducts(source, keys);
}

function buildSubstituteFunnelCounts(
  purchaseConversionData: unknown,
  alternativeSelectRateSummary: unknown,
) {
  const alternativeImpressionCount = getMetricTotal(
    alternativeSelectRateSummary,
    ["impressionCount"],
  );

  const alternativeSelectionCount = getMetricTotal(
    alternativeSelectRateSummary,
    ["selectedCount", "selectionCount", "clickCount"],
  );

  const alternativePurchaseCount = getMetricTotal(
    alternativeSelectRateSummary,
    ["purchaseCount"],
  );

  const purchaseConversionImpressionCount = getMetricTotal(
    purchaseConversionData,
    ["impressionCount"],
  );

  const purchaseConversionSelectionCount = getMetricTotal(
    purchaseConversionData,
    ["clickCount", "selectedCount", "selectionCount"],
  );

  const purchaseConversionPurchaseCount = getMetricTotal(
    purchaseConversionData,
    ["purchaseCount"],
  );

  return {
    // 품절 대응 퍼널의 기준은 alternatives/select-rate 요약을 우선 사용
    impressionCount:
      alternativeImpressionCount > 0
        ? alternativeImpressionCount
        : purchaseConversionImpressionCount,

    selectionCount:
      alternativeSelectionCount > 0
        ? alternativeSelectionCount
        : purchaseConversionSelectionCount,

    // 구매 수는 purchase-conversion API를 우선 사용
    purchaseCount:
      purchaseConversionPurchaseCount > 0
        ? purchaseConversionPurchaseCount
        : alternativePurchaseCount,
  };
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

    // 백엔드 컨트롤러는 startDate/endDate를 받음.
    // 일부 fetch 유틸 호환을 위해 fromDate/toDate도 같이 전달.
    const recommendationQuery = {
      startDate: query.startDate,
      endDate: query.endDate,
      fromDate: query.startDate,
      toDate: query.endDate,
    };

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [
          alternativeSelectRateSummary,
          promotionSelectRates,
          substitutePurchaseConversion,
          promotionClickRate,
          promotionPurchaseConversion,
        ] = await Promise.all([
          fetchAlternativeSelectRateSummary({
            ...query,
            limit: 20,
          }),
          fetchPromotionSelectRates({
            ...query,
            limit: 20,
          }),
          fetchRecommendationPurchaseConversionAnalytics({
            ...recommendationQuery,
            recommendationType: "SUBSTITUTE",
            limit: 20,
          }),
          fetchRecommendationClickRateAnalytics({
            ...recommendationQuery,
            recommendationType: "PROMOTION",
            limit: 20,
          }),
          fetchRecommendationPurchaseConversionAnalytics({
            ...recommendationQuery,
            recommendationType: "PROMOTION",
            limit: 20,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const { impressionCount, selectionCount, purchaseCount } =
          buildSubstituteFunnelCounts(
            substitutePurchaseConversion,
            alternativeSelectRateSummary,
          );

        const impressionPercent = 100;

        const selectionPercent = clampFunnelPercent(
          toPercentFromCounts(selectionCount, impressionCount),
          impressionPercent,
        );

        const purchasePercent = clampFunnelPercent(
          toPercentFromCounts(purchaseCount, impressionCount),
          selectionPercent,
        );

        setFunnel([
          { label: "1. 대체 상품 노출", percent: impressionPercent },
          { label: "2. 대체 상품 선택", percent: selectionPercent },
          { label: "3. 대체 상품 구매", percent: purchasePercent },
        ]);

        setFinalConversionRate(formatPercent(purchasePercent));

        setPromoProducts(
          mapPromotionAnalyticsToProducts({
            promotionSelectRates,
            clickRateData: promotionClickRate,
            purchaseConversionData: promotionPurchaseConversion,
          }),
        );
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