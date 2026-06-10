import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export function isOutOfStock(product: Product) {
  const count = product.stockCount;
  if (count == null) {
    // API에 재고 미포함(다른 매장·미등록 재고) → 담기 불가
    return true;
  }
  return count <= 0;
}

/** 홈·추천 등 — 품절 상품 제외 */
export function filterInStockProducts(products: Product[]): Product[] {
  return products.filter((product) => !isOutOfStock(product));
}

export function isLowStock(stockCount: number) {
  return stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD;
}
