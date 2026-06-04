import type { Product } from "@/components/product/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { RecentViewApiDto } from "@/lib/auth/types";

function resolveRecentViewStockCount(dto: RecentViewApiDto): number | undefined {
  if (dto.saleStatus === "OUT_OF_STOCK" || dto.stockStatus === "OUT_OF_STOCK") {
    return 0;
  }
  if (dto.stockCount != null && Number.isFinite(dto.stockCount)) {
    return Math.max(0, Math.round(dto.stockCount));
  }
  return undefined;
}

export function mapRecentViewToProduct(dto: RecentViewApiDto): Product | null {
  if (dto.productId == null || !dto.productName?.trim()) {
    return null;
  }

  const stockCount = resolveRecentViewStockCount(dto);

  return {
    id: String(dto.productId),
    name: dto.productName.trim(),
    price: dto.price ?? 0,
    discountPercent: 0,
    image: resolveProductImageSource(null, dto.thumbnailUrl),
    stockCount,
    viewedAt: dto.viewedAt,
  };
}

export function mapRecentViewsToProducts(dtos: RecentViewApiDto[]): Product[] {
  return dtos
    .map(mapRecentViewToProduct)
    .filter((product): product is Product => product != null);
}
