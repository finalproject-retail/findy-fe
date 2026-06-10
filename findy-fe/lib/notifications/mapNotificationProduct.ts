import type { Product } from "@/components/product";
import { alignProductDtoWithShoppingPrice } from "@/lib/products/mapProductFromApi";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { NotificationProductApiDto } from "@/lib/notifications/types";

function readPrice(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) {
    return 0;
  }
  return Math.max(0, value);
}

export function mapNotificationProductToProduct(
  dto: NotificationProductApiDto | null | undefined,
  fallbackProductId?: number | string | null,
): Product | null {
  const rawId = dto?.productId ?? fallbackProductId;
  if (rawId == null) {
    return null;
  }

  const id = String(rawId);
  const rawName = dto?.productName?.trim();
  const brand = dto?.brandName?.trim();
  const name = rawName
    ? !brand || rawName.includes(brand) || rawName.startsWith("[")
      ? rawName
      : `[${brand}] ${rawName}`
    : brand
      ? `[${brand}] 상품`
      : "추천 상품";

  const aligned = alignProductDtoWithShoppingPrice({
    productId: id,
    productName: name,
    brandName: dto?.brandName,
    imageUrl: dto?.imageUrl,
    originalPrice: readPrice(dto?.originalPrice),
    salePrice: dto?.salePrice != null ? readPrice(dto.salePrice) : undefined,
    discountRate:
      dto?.discountRate != null ? Number(dto.discountRate) : undefined,
  });

  const originalPrice = aligned.originalPrice ?? readPrice(dto?.originalPrice);
  const salePrice = aligned.salePrice ?? originalPrice;
  const hasDiscount = originalPrice > 0 && salePrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  return {
    id,
    name,
    image: resolveProductImageSource(dto?.imageUrl),
    discountPercent,
    price: salePrice,
    originalPrice,
    couponPrice: salePrice,
  };
}
