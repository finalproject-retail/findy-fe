import type { Product } from "./types";

export const LOW_STOCK_THRESHOLD = 5;

export function isOutOfStock(product: Product) {
  const count = product.stockCount;
  if (count == null) {
    return false;
  }
  return count <= 0;
}

export function isLowStock(stockCount: number) {
  return stockCount > 0 && stockCount <= LOW_STOCK_THRESHOLD;
}
