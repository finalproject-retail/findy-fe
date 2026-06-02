import type { Product, ProductSpec } from "@/components/product/types";
import { findSubCategory } from "@/components/category/categoryCatalog";
import { SHOPPING_API_URL } from "@/constants/serviceApi";
import type { ProductApiDto } from "./types";

const PLACEHOLDER_IMAGE = require("@/assets/images/product/green-tea.png");

function resolveId(dto: ProductApiDto): string {
  const raw = dto.productId ?? dto.id;
  if (raw == null) {
    return "";
  }
  return String(raw);
}

function resolveImageSource(dto: ProductApiDto): Product["image"] {
  const url = dto.imageUrl ?? dto.thumbnailUrl ?? dto.image;
  if (typeof url === "string" && url.trim().length > 0) {
    const trimmed = url.trim();
    if (trimmed.startsWith("/")) {
      return { uri: `${SHOPPING_API_URL}${trimmed}` };
    }
    return { uri: trimmed };
  }
  return PLACEHOLDER_IMAGE;
}

function resolveDiscountPercent(dto: ProductApiDto, price: number, originalPrice: number) {
  if (dto.discountPercent != null) {
    return Math.max(0, Math.round(dto.discountPercent));
  }
  if (dto.discountRate != null) {
    return Math.max(0, Math.round(dto.discountRate));
  }
  if (originalPrice > price && originalPrice > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return 0;
}

export function mapProductFromApi(dto: ProductApiDto): Product | null {
  const id = resolveId(dto);
  const name = dto.name ?? dto.productName;
  if (!id || !name) {
    return null;
  }

  const price = dto.salePrice ?? dto.price ?? 0;
  const originalPrice = dto.originalPrice ?? price;
  const stockCount =
    dto.saleStatus === "OUT_OF_STOCK"
      ? 0
      : dto.stockCount ?? dto.stockQuantity ?? dto.stock;

  return {
    id,
    name,
    image: resolveImageSource(dto),
    discountPercent: resolveDiscountPercent(dto, price, originalPrice),
    price,
    originalPrice,
    couponPrice: price,
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

  return {
    ...base,
    barcode: dto.barcode?.trim() || undefined,
    category: resolveCategoryLabel(dto.categoryId, dto.brandName) ?? base.category,
    originalPrice: dto.originalPrice ?? base.originalPrice,
    couponPrice: dto.salePrice ?? base.couponPrice,
    price: dto.salePrice ?? base.price,
    stockCount: resolveDetailStockCount(dto),
    spec,
    detailImages: [image],
  };
}
