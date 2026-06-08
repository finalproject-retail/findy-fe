import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import { parseAdminDate } from "@/lib/admin/dateRange";

/** AdminDateRange(YY.MM.DD) → API 쿼리용 YYYY-MM-DD */
export function formatAdminDateForApi(value: string): string {
  const date = parseAdminDate(value);
  if (!date) {
    return value;
  }

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** select-rate 스펙용 (현재 서버 500 — 레거시) */
export function toAdminAnalyticsQueryRange(range: AdminDateRange) {
  return {
    startDate: formatAdminDateForApi(range.start),
    endDate: formatAdminDateForApi(range.end),
  };
}

/** admin analytics API — fromDate / toDate */
export function toAdminAnalyticsPeriodQuery(range: AdminDateRange) {
  return {
    fromDate: formatAdminDateForApi(range.start),
    toDate: formatAdminDateForApi(range.end),
  };
}
