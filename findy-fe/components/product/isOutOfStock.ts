import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export function isOutOfStock(product: Product) {
  return (product.stockCount ?? 0) <= 0;
}

export function isLowStock(stockCount: number) {
  return stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD;
}
