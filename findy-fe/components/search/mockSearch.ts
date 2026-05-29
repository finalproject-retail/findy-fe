import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";

export const POPULAR_SEARCH_TERMS = [
  "생차녹차",
  "사리곰탕",
  "텀블러",
  "황치즈",
  "핸드크림",
  "오레오",
  "생크림쫀득빵",
  "아메리카노",
  "쿠쿠다스 케이크",
  "하리보",
] as const;

/** 연관 검색어·자동완성용 키워드 */
export const SEARCH_SUGGESTION_KEYWORDS = [
  "생차녹차",
  "사리곰탕",
  "사리곰탕면",
  "사리곰탕컵",
  "농심사리곰탕면",
  "사리곰탕컵라면",
  "오레오",
  "오레오씬즈",
  "아메리카노",
  "카누",
  "녹차",
  "불닭볶음면",
  "사과",
  "우유",
  "두부",
  "마라탕",
] as const;

import type { ProductSortType } from "./searchTypes";

const POPULARITY_ORDER: Record<string, number> = {
  "green-tea": 1,
  snack: 2,
  noodle: 3,
  "ramen-cup": 4,
  beef: 5,
  apple: 6,
  coffee: 7,
  mara: 8,
  yogurt: 9,
  tofu: 10,
  "oat-milk": 11,
};

function normalizeSearchText(value: string) {
  return value.trim().toLowerCase().replace(/\s/g, "");
}

function productMatchesQuery(product: Product, query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return false;
  const normalizedName = normalizeSearchText(product.name);
  if (normalizedName.includes(normalizedQuery)) return true;

  const aliases: Record<string, string[]> = {
    사리곰탕: ["ramen-cup", "noodle", "mara"],
    오레오: ["snack"],
    생차녹차: ["green-tea"],
    아메리카노: ["coffee"],
    녹차: ["green-tea"],
    우유: ["yogurt", "oat-milk"],
    사과: ["apple"],
    소고기: ["beef"],
    불닭: ["noodle"],
    마라탕: ["mara"],
    두부: ["tofu"],
  };

  for (const [keyword, productIds] of Object.entries(aliases)) {
    if (
      normalizeSearchText(keyword).includes(normalizedQuery) ||
      normalizedQuery.includes(normalizeSearchText(keyword))
    ) {
      if (productIds.includes(product.id)) return true;
    }
  }

  return false;
}

function sortProducts(products: Product[], sort: ProductSortType) {
  const sorted = [...products];
  switch (sort) {
    case "discount":
      sorted.sort((a, b) => b.discountPercent - a.discountPercent);
      break;
    case "price_asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "popularity":
    default:
      sorted.sort(
        (a, b) =>
          (POPULARITY_ORDER[a.id] ?? 99) - (POPULARITY_ORDER[b.id] ?? 99),
      );
      break;
  }
  return sorted;
}

/** 무한 스크롤 데모용 — 동일 상품을 페이지마다 다른 id로 복제 */
function expandForInfiniteScroll(
  products: Product[],
  repeatCount: number,
): Product[] {
  const expanded: Product[] = [];
  for (let page = 0; page < repeatCount; page += 1) {
    products.forEach((product, index) => {
      expanded.push({
        ...product,
        id: `${product.id}-search-${page}-${index}`,
      });
    });
  }
  return expanded;
}

export function getRelatedSearchSuggestions(query: string, limit = 8) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  return SEARCH_SUGGESTION_KEYWORDS.filter((keyword) =>
    normalizeSearchText(keyword).includes(normalized),
  ).slice(0, limit);
}

export function searchProducts(query: string, sort: ProductSortType): Product[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const matched = MOCK_PRODUCTS.filter((product) =>
    productMatchesQuery(product, trimmed),
  );
  const sorted = sortProducts(matched, sort);

  if (sorted.length === 0) {
    return [];
  }

  return expandForInfiniteScroll(sorted, 6);
}

export const SEARCH_PAGE_SIZE = 5;

export function getSearchResultsSlice(
  products: Product[],
  page: number,
  pageSize = SEARCH_PAGE_SIZE,
) {
  const end = page * pageSize;
  return products.slice(0, end);
}
