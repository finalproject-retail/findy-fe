import { findSubCategory } from "@/components/category/categoryCatalog";
import type { Product, ProductSpec } from "@/components/product/types";
import { resolveProductImageSource } from "@/lib/products/resolveProductImage";
import type { ProductApiDto } from "./types";

function resolveId(dto: ProductApiDto): string {
  const raw = dto.productId ?? dto.id;
  if (raw == null) {
    return "";
  }
  return String(raw);
}

function resolveImageSource(dto: ProductApiDto): Product["image"] {
  return resolveProductImageSource(
    dto.imageUrl ?? (typeof dto.image === "string" ? dto.image : null),
    dto.thumbnailUrl,
  );
}

/**
 * shopping-service(ProductResponse·상세)는 originalPrice만 판매가로 씀.
 * 추천 스냅샷의 salePrice·discountRate는 쇼핑과 불일치할 수 있어 UI에서는 제외.
 */
export function alignProductDtoWithShoppingPrice(
  dto: ProductApiDto,
): ProductApiDto {
  if (dto.originalPrice == null || dto.originalPrice <= 0) {
    return dto;
  }

  return {
    ...dto,
    salePrice: undefined,
    price: undefined,
    discountRate: undefined,
    discountPercent: undefined,
  };
}

/** 목록·상세·장바구니 — 실제 판매가 < 정가일 때만 할인 */
function resolveProductPrices(dto: ProductApiDto): {
  salePrice: number;
  originalPrice: number;
} {
  const originalPrice = dto.originalPrice ?? dto.price ?? 0;
  const candidateSale = dto.salePrice ?? dto.price;

  const hasPromotion =
    originalPrice > 0 &&
    candidateSale != null &&
    candidateSale > 0 &&
    candidateSale < originalPrice;

  if (hasPromotion) {
    return { salePrice: candidateSale, originalPrice };
  }

  if (originalPrice > 0) {
    return { salePrice: originalPrice, originalPrice };
  }

  const fallbackSale = candidateSale != null && candidateSale > 0 ? candidateSale : 0;
  return {
    salePrice: fallbackSale,
    originalPrice: Math.max(originalPrice, fallbackSale),
  };
}

function resolveDiscountPercent(salePrice: number, originalPrice: number) {
  if (salePrice >= originalPrice || originalPrice <= 0) {
    return 0;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function mapProductFromApi(dto: ProductApiDto): Product | null {
  const id = resolveId(dto);
  const name = dto.name ?? dto.productName;
  if (!id || !name) {
    return null;
  }

  const { salePrice, originalPrice } = resolveProductPrices(dto);
  const stockCount =
    dto.saleStatus === "OUT_OF_STOCK"
      ? 0
      : (dto.stockCount ?? dto.stockQuantity ?? dto.stock);

  return {
    id,
    name,
    image: resolveImageSource(dto),
    discountPercent: resolveDiscountPercent(salePrice, originalPrice),
    price: salePrice,
    originalPrice,
    couponPrice: salePrice,
    stockCount: stockCount ?? undefined,
    category: dto.category,
  };
}

export function mapProductsFromApi(dtos: ProductApiDto[]): Product[] {
  return dtos
    .map(mapProductFromApi)
    .filter((product): product is Product => product != null);
}

function resolveCategoryLabel(
  categoryId?: number,
  brandName?: string | null,
): string | undefined {
  if (categoryId != null) {
    const found = findSubCategory(categoryId);
    if (found) {
      return `${found.top.label} > ${found.middle.label} > ${found.sub.label}`;
    }
  }
  const brand = brandName?.trim();
  return brand || undefined;
}

function resolveDetailStockCount(dto: ProductApiDto): number | undefined {
  if (dto.saleStatus === "OUT_OF_STOCK") {
    return 0;
  }
  const raw = dto.stockCount ?? dto.stockQuantity ?? dto.stock;
  if (raw != null && Number.isFinite(raw)) {
    return Math.max(0, raw);
  }
  if (dto.saleStatus === "ON_SALE") {
    return undefined;
  }
  return undefined;
}

/** GET /api/v1/products/{productId} 응답 → 상품 상세 UI 모델 */
export function mapProductDetailFromApi(dto: ProductApiDto): Product | null {
  const base = mapProductFromApi(dto);
  if (!base) {
    return null;
  }

  const image = resolveImageSource(dto);
  const spec: ProductSpec = {
    packagingType: dto.packagingType?.trim() || "-",
    salesUnit: dto.salesUnit?.trim() || "-",
    weightCapacity: dto.volume?.trim() || "-",
    allergyInfo: dto.allergyInfo?.trim() || "정보 없음",
  };

  const { salePrice, originalPrice } = resolveProductPrices(dto);

  return {
    ...base,
    barcode: dto.barcode?.trim() || undefined,
    category:
      resolveCategoryLabel(dto.categoryId, dto.brandName) ?? base.category,
    originalPrice,
    couponPrice: salePrice,
    price: salePrice,
    discountPercent: resolveDiscountPercent(salePrice, originalPrice),
    stockCount: resolveDetailStockCount(dto),
    spec,
    detailImages: [image],
  };
}
