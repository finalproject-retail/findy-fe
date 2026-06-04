import type { Product } from "./types";

export function getSalePrice(product: Product): number {
  return product.couponPrice ?? product.price;
}

/** API·목데이터 공통 — 할인율·원가(취소선) 노출 여부 */
export function hasProductDiscount(product: Product): boolean {
  const salePrice = getSalePrice(product);
  const discountPercent = Math.round(product.discountPercent ?? 0);

  if (discountPercent <= 0) {
    return false;
  }

  const originalPrice = product.originalPrice;
  if (originalPrice != null) {
    return originalPrice > salePrice;
  }

  if (discountPercent >= 100) {
    return false;
  }

  const inferredOriginal = Math.round(
    salePrice / (1 - discountPercent / 100),
  );
  return inferredOriginal > salePrice;
}

export function getDisplayOriginalPrice(product: Product): number {
  const salePrice = getSalePrice(product);
  const originalPrice = product.originalPrice;

  if (originalPrice != null && originalPrice >= salePrice) {
    return originalPrice;
  }

  const discountPercent = Math.round(product.discountPercent ?? 0);
  if (discountPercent > 0 && discountPercent < 100) {
    return Math.round(salePrice / (1 - discountPercent / 100));
  }

  return salePrice;
}
