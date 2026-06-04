import type { Product } from "@/components/product";
import {
  getDisplayOriginalPrice,
  getSalePrice,
  hasProductDiscount,
} from "@/components/product/productPricing";

export const LOW_STOCK_THRESHOLD = 5;

export function getUnitPrice(product: Product) {
  return getSalePrice(product);
}

export function getOriginalPrice(product: Product) {
  if (!hasProductDiscount(product)) {
    return getUnitPrice(product);
  }
  return getDisplayOriginalPrice(product);
}

export { hasProductDiscount };

export function getStockCount(product: Product) {
  return product.stockCount ?? 0;
}

export function isLowStock(product: Product) {
  const stock = getStockCount(product);
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}
