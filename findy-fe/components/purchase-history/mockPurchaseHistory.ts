import { getProductById } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import type { PeriodInquiryValue } from "@/components/common/PeriodInquiry";

export type PurchaseHistoryRecord = {
  id: string;
  purchasedAt: string;
  product: Product;
  quantity: number;
};

type PurchaseHistorySeed = {
  id: string;
  purchasedAt: string;
  productId: string;
  quantity: number;
};

const PURCHASE_HISTORY_SEEDS: PurchaseHistorySeed[] = [
  // 최근 (1개월 조회에 포함)
  { id: "ph-1", purchasedAt: "2026.05.18", productId: "ramen-cup", quantity: 1 },
  { id: "ph-2", purchasedAt: "2026.05.18", productId: "green-tea", quantity: 2 },
  { id: "ph-3", purchasedAt: "2026.05.05", productId: "noodle", quantity: 1 },
  { id: "ph-4", purchasedAt: "2026.05.05", productId: "oat-milk", quantity: 1 },
  { id: "ph-5", purchasedAt: "2026.05.05", productId: "beef", quantity: 1 },
  // 3개월 조회 시 포함
  { id: "ph-6", purchasedAt: "2026.04.12", productId: "apple", quantity: 3 },
  { id: "ph-7", purchasedAt: "2026.04.12", productId: "coffee", quantity: 1 },
  { id: "ph-8", purchasedAt: "2026.02.22", productId: "snack", quantity: 2 },
  { id: "ph-9", purchasedAt: "2026.02.22", productId: "tofu", quantity: 1 },
  // 6개월 조회 시에만 포함
  { id: "ph-10", purchasedAt: "2026.01.10", productId: "noodle", quantity: 2 },
  { id: "ph-11", purchasedAt: "2026.01.10", productId: "yogurt", quantity: 4 },
  { id: "ph-12", purchasedAt: "2025.12.05", productId: "beef", quantity: 1 },
  { id: "ph-13", purchasedAt: "2025.12.05", productId: "green-tea", quantity: 1 },
];

export const MOCK_PURCHASE_HISTORY: PurchaseHistoryRecord[] =
  PURCHASE_HISTORY_SEEDS.map((seed) => {
    const product = getProductById(seed.productId);
    if (!product) {
      throw new Error(`Unknown product id: ${seed.productId}`);
    }
    return {
      id: seed.id,
      purchasedAt: seed.purchasedAt,
      product,
      quantity: seed.quantity,
    };
  });

export type PurchaseHistoryDateGroup = {
  date: string;
  items: PurchaseHistoryRecord[];
};

function parseYearMonth(ym: string) {
  const [year, month] = ym.split(".").map(Number);
  return new Date(year, month - 1, 1);
}

function parsePurchaseDate(date: string) {
  const [year, month, day] = date.split(".").map(Number);
  return new Date(year, month - 1, day);
}

export function filterPurchaseHistory(
  records: PurchaseHistoryRecord[],
  query: string,
  period: PeriodInquiryValue,
): PurchaseHistoryRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  const rangeStart = parseYearMonth(period.startDate);
  const rangeEnd = parseYearMonth(period.endDate);
  rangeEnd.setMonth(rangeEnd.getMonth() + 1);
  rangeEnd.setDate(0);

  return records.filter((record) => {
    const purchasedAt = parsePurchaseDate(record.purchasedAt);
    if (purchasedAt < rangeStart || purchasedAt > rangeEnd) return false;
    if (!normalizedQuery) return true;
    return record.product.name.toLowerCase().includes(normalizedQuery);
  });
}

export function groupPurchaseHistoryByDate(
  records: PurchaseHistoryRecord[],
): PurchaseHistoryDateGroup[] {
  const map = new Map<string, PurchaseHistoryRecord[]>();

  for (const record of records) {
    const group = map.get(record.purchasedAt) ?? [];
    group.push(record);
    map.set(record.purchasedAt, group);
  }

  return [...map.entries()]
    .sort(([a], [b]) => parsePurchaseDate(b).getTime() - parsePurchaseDate(a).getTime())
    .map(([date, items]) => ({ date, items }));
}
