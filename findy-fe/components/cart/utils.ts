import type { Product } from "@/components/product";

export const LOW_STOCK_THRESHOLD = 5;

export function getUnitPrice(product: Product) {
  return product.couponPrice ?? product.price;
}

export function getOriginalPrice(product: Product) {
  const unitPrice = getUnitPrice(product);
  return (
    product.originalPrice ??
    Math.round(unitPrice / (1 - product.discountPercent / 100))
  );
}

export function getStockCount(product: Product) {
  return product.stockCount ?? 0;
}

export function isLowStock(product: Product) {
  const stock = getStockCount(product);
  return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}
