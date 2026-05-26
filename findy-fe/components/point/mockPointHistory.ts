import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";

export type PointHistoryType = "earned" | "expired" | "used";

export type PointHistoryFilterType = "all" | "earned" | "used_expired";

export type PointHistoryItem = {
  id: string;
  type: PointHistoryType;
  date: string;
  title: string;
  subtitle: string;
  amount: number;
};

export const MOCK_POINT_SUMMARY = {
  balance: 2154,
  expiringThisMonth: 0,
};

export const MOCK_POINT_HISTORY: PointHistoryItem[] = [
  {
    id: "1",
    type: "earned",
    date: "2026.04.10",
    title: "구매 포인트 지급",
    subtitle: "사용기한: 2026.05.09",
    amount: 2000,
  },
  {
    id: "2",
    type: "expired",
    date: "2026.03.01",
    title: "포인트 소멸",
    subtitle: "구매 포인트 지급 소멸",
    amount: -1500,
  },
  {
    id: "3",
    type: "earned",
    date: "2026.02.15",
    title: "이벤트 포인트 지급",
    subtitle: "사용기한: 2026.08.14",
    amount: 1500,
  },
  {
    id: "4",
    type: "used",
    date: "2026.01.20",
    title: "포인트 사용",
    subtitle: "상품 구매 결제",
    amount: -500,
  },
  {
    id: "5",
    type: "earned",
    date: "2025.12.05",
    title: "구매 포인트 지급",
    subtitle: "사용기한: 2026.06.04",
    amount: 2000,
  },
];

function parseYearMonth(ym: string) {
  const [year, month] = ym.split(".").map(Number);
  return new Date(year, month - 1, 1);
}

function parseItemDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

export function filterPointHistory(
  items: PointHistoryItem[],
  filter: PointHistoryFilterType,
  period: PeriodInquiryValue,
): PointHistoryItem[] {
  const rangeStart = parseYearMonth(period.startDate);
  const rangeEnd = parseYearMonth(period.endDate);
  rangeEnd.setMonth(rangeEnd.getMonth() + 1);
  rangeEnd.setDate(0);

  return items.filter((item) => {
    const itemDate = parseItemDate(item.date);
    if (itemDate < rangeStart || itemDate > rangeEnd) return false;

    if (filter === "earned") return item.type === "earned";
    if (filter === "used_expired") {
      return item.type === "used" || item.type === "expired";
    }
    return true;
  });
}
