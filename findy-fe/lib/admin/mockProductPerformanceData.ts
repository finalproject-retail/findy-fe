import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import {
  getAdminProductImage,
  getAdminProductName,
} from "@/lib/admin/mockAdminProductAssets";
import type { ImageSourcePropType } from "react-native";

export type AdminProductCategoryFilter =
  | "all"
  | "fresh"
  | "processed"
  | "bakery"
  | "beverage"
  | "lifestyle";

export const ADMIN_PRODUCT_CATEGORY_FILTERS: {
  key: AdminProductCategoryFilter;
  label: string;
}[] = [
  { key: "all", label: "전체" },
  { key: "fresh", label: "신선" },
  { key: "processed", label: "가공/냉동" },
  { key: "bakery", label: "베이커리/델리" },
  { key: "beverage", label: "음료/주류" },
  { key: "lifestyle", label: "라이프" },
];

export type AdminProductPerformance = {
  productId: string;
  name: string;
  category: Exclude<AdminProductCategoryFilter, "all">;
  views: number;
  conversionRate: number;
  image: ImageSourcePropType;
};

const MOCK_CATEGORIES: Exclude<AdminProductCategoryFilter, "all">[] = [
  "processed",
  "processed",
  "processed",
  "processed",
  "fresh",
  "processed",
  "processed",
  "processed",
  "processed",
  "processed",
  "fresh",
  "fresh",
  "processed",
  "processed",
  "bakery",
  "processed",
  "processed",
  "processed",
  "processed",
  "beverage",
  "bakery",
  "bakery",
  "beverage",
  "beverage",
  "lifestyle",
];

function buildMockProducts(count = 25): AdminProductPerformance[] {
  return Array.from({ length: count }, (_, index) => {
    const rank = index + 1;
    const views = 1432 - index * 47 + (index % 3) * 18;
    const conversionRate = Number((13.2 - index * 0.35 + (index % 4) * 0.4).toFixed(1));

    return {
      productId: `fdsdf-${String(rank).padStart(3, "0")}`,
      name: getAdminProductName(index),
      category: MOCK_CATEGORIES[index % MOCK_CATEGORIES.length]!,
      views: Math.max(views, 120),
      conversionRate: Math.max(conversionRate, 2.1),
      image: getAdminProductImage(index),
    };
  });
}

/** API 연동 전 목업 데이터 */
export function getAdminProductPerformanceMock(
  _range: AdminDateRange,
): AdminProductPerformance[] {
  return buildMockProducts(25);
}

export function filterAdminProductPerformance(
  products: AdminProductPerformance[],
  query: string,
  category: AdminProductCategoryFilter,
): AdminProductPerformance[] {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.productId.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function formatAdminMetricNumber(value: number) {
  return value.toLocaleString("ko-KR");
}
