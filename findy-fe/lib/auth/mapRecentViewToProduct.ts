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

/** 장바구니(쇼핑 API)와 동일하게 `[브랜드] 상품명` 형식으로 통일 */
function buildDisplayName(dto: RecentViewApiDto): string {
  const name = dto.productName.trim();
  const brand = dto.brandName?.trim();
  if (!brand || name.includes(brand) || name.startsWith("[")) {
    return name;
  }
  return `[${brand}] ${name}`;
}

export function mapRecentViewToProduct(dto: RecentViewApiDto): Product | null {
  if (dto.productId == null || !dto.productName?.trim()) {
    return null;
  }

  const stockCount = resolveRecentViewStockCount(dto);

  return {
    id: String(dto.productId),
    name: buildDisplayName(dto),
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
