import { apiClient } from "@/lib/api/client";
import { parseAdminDate } from "@/lib/admin/dateRange";
import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import type { AdminAnalyticsApiEnvelope } from "@/lib/admin/api/types";

export function unwrapAdminAnalytics<T>(
  envelope: AdminAnalyticsApiEnvelope<T> | undefined,
  fallbackMessage: string,
): T {
  if (!envelope?.success || envelope.data == null) {
    throw new Error(envelope?.message ?? fallbackMessage);
  }
  return envelope.data;
}

export function adminDateRangeToApiParams(range: AdminDateRange) {
  const start = parseAdminDate(range.start);
  const end = parseAdminDate(range.end);

  if (!start || !end) {
    throw new Error("조회 기간이 올바르지 않습니다.");
  }

  const format = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromDate = format(start);
  const toDate = format(end);

  return fromDate <= toDate
    ? { fromDate, toDate }
    : { fromDate: toDate, toDate: fromDate };
}

export function parseAdminRate(value: number | string | null | undefined) {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatAdminPeriodLabel(period: { fromDate: string; toDate: string }) {
  const toShort = (iso: string) => {
    const [year, month, day] = iso.split("-");
    if (!year || !month || !day) return iso;
    return `${year.slice(-2)}.${month}.${day}`;
  };

  return `${toShort(period.fromDate)} ~ ${toShort(period.toDate)}`;
}

export const adminAnalyticsClient = apiClient;
