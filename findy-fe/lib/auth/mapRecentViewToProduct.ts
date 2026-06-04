import type { Product } from "@/components/product/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { RecentViewApiDto } from "@/lib/auth/types";

export function mapRecentViewToProduct(dto: RecentViewApiDto): Product | null {
  if (dto.productId == null || !dto.productName?.trim()) {
    return null;
  }

  return {
    id: String(dto.productId),
    name: dto.productName.trim(),
    price: dto.price ?? 0,
    discountPercent: 0,
    image: resolveProductImageSource(null, dto.thumbnailUrl),
    viewedAt: dto.viewedAt,
  };
}

export function mapRecentViewsToProducts(dtos: RecentViewApiDto[]): Product[] {
  return dtos
    .map(mapRecentViewToProduct)
    .filter((product): product is Product => product != null);
}
