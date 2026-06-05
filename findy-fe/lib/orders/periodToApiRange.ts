import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";

function parseYearMonth(ym: string) {
  const [year, month] = ym.split(".").map(Number);
  return new Date(year, month - 1, 1);
}

function formatApiDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function periodToApiDateRange(period: PeriodInquiryValue) {
  const start = parseYearMonth(period.startDate);
  const endMonthStart = parseYearMonth(period.endDate);
  const end = new Date(
    endMonthStart.getFullYear(),
    endMonthStart.getMonth() + 1,
    0,
  );

  return {
    startDate: formatApiDate(start),
    endDate: formatApiDate(end),
  };
}
