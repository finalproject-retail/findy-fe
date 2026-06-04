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

/** 목록 API(ProductResponse)는 originalPrice만 오는 경우가 있어 장바구니 매핑과 동일 규칙 적용 */
function resolveProductPrices(dto: ProductApiDto): {
  salePrice: number;
  originalPrice: number;
} {
  const originalPrice = dto.originalPrice ?? dto.salePrice ?? dto.price ?? 0;
  const salePrice =
    dto.salePrice ?? dto.price ?? (originalPrice > 0 ? originalPrice : 0);

  return {
    salePrice: salePrice > 0 ? salePrice : originalPrice,
    originalPrice: Math.max(
      originalPrice,
      salePrice > 0 ? salePrice : originalPrice,
    ),
  };
}

function resolveDiscountPercent(
  dto: ProductApiDto,
  salePrice: number,
  originalPrice: number,
) {
  if (salePrice >= originalPrice || originalPrice <= 0) {
    return 0;
  }

  if (dto.discountPercent != null) {
    return Math.max(0, Math.round(dto.discountPercent));
  }
  if (dto.discountRate != null) {
    const rate = Number(dto.discountRate);
    if (Number.isFinite(rate)) {
      return Math.max(0, Math.round(rate));
    }
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
    discountPercent: resolveDiscountPercent(dto, salePrice, originalPrice),
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
    discountPercent: resolveDiscountPercent(dto, salePrice, originalPrice),
    stockCount: resolveDetailStockCount(dto),
    spec,
    detailImages: [image],
  };
}
