import type { Product } from "@/components/product/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { RecentViewApiDto } from "@/lib/auth/types";
import { resolveStockCountFromApiFields } from "@/lib/products/resolveProductStock";

function resolveRecentViewStockCount(dto: RecentViewApiDto): number | undefined {
  return resolveStockCountFromApiFields({
    saleStatus: dto.saleStatus,
    stockStatus: dto.stockStatus,
    stockCount: dto.stockCount,
  });
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
