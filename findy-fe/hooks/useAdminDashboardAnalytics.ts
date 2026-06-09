import { DEFAULT_API_STORE_ID } from "@/components/home/storeOptions";
import { fetchAdminAnalyticsSummary } from "@/lib/admin/api/fetchAdminAnalyticsSummary";
import { fetchAdminZoneVisitRates } from "@/lib/admin/api/fetchAdminZoneVisitRates";
import { toAdminAnalyticsQueryRange } from "@/lib/admin/formatAdminApiDate";
import {
  getPlaceholderAdminStats,
  mapAnalyticsSummaryToStats,
  mapZoneVisitRatesToMatrix,
} from "@/lib/admin/mapAdminDashboardAnalytics";
import type {
  AdminDateRange,
  AdminStatCard,
  AdminZoneMatrix,
} from "@/lib/admin/mockDashboardData";
import { useEffect, useState } from "react";

const PLACEHOLDER_STATS = getPlaceholderAdminStats();
const EMPTY_ZONES: AdminZoneMatrix = mapZoneVisitRatesToMatrix({ gridVisitRates: [] });

export function useAdminDashboardAnalytics(dateRange: AdminDateRange) {
  const [stats, setStats] = useState<AdminStatCard[]>(PLACEHOLDER_STATS);
  const [zones, setZones] = useState<AdminZoneMatrix>(EMPTY_ZONES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = {
      ...toAdminAnalyticsQueryRange(dateRange),
      storeId: DEFAULT_API_STORE_ID,
    };

    async function load() {
      setLoading(true);
      setError(null);
      setStats(getPlaceholderAdminStats());

      try {
        const [summaryResult, zoneResult] = await Promise.allSettled([
          fetchAdminAnalyticsSummary(query),
          fetchAdminZoneVisitRates(query),
        ]);

        if (cancelled) {
          return;
        }

        const errors: string[] = [];

        if (summaryResult.status === "fulfilled") {
          setStats(mapAnalyticsSummaryToStats(summaryResult.value));
        } else {
          setStats(getPlaceholderAdminStats());
          errors.push(
            summaryResult.reason instanceof Error
              ? summaryResult.reason.message
              : "운영 지표 요약을 불러오지 못했습니다.",
          );
        }

        if (zoneResult.status === "fulfilled") {
          setZones(mapZoneVisitRatesToMatrix(zoneResult.value));
        } else {
          setZones(EMPTY_ZONES);
          errors.push(
            zoneResult.reason instanceof Error
              ? zoneResult.reason.message
              : "구역별 방문율을 불러오지 못했습니다.",
          );
        }

        if (errors.length > 0) {
          setError(errors.join("\n"));
        }
      } catch (err) {
        if (cancelled) {
          return;
        }
        setStats(getPlaceholderAdminStats());
        setZones(EMPTY_ZONES);
        setError(
          err instanceof Error
            ? err.message
            : "대시보드 데이터를 불러오지 못했습니다.",
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
    stats,
    zones,
    loading,
    error,
  };
}
