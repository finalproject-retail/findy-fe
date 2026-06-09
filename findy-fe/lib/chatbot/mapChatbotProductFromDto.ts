import type { Product } from "@/components/product/types";
import { mapProductFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";

export type ChatbotProductDtoLike = {
  productId: number;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  discountRate?: number | null;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  stockText?: string | null;
};

export function normalizeChatbotProductName(
  productName: string,
  brandName?: string | null,
): string {
  const cleaned = productName.trim().replace(/^시드_/, "");
  const brand = brandName?.trim();
  if (!brand || cleaned.startsWith("[")) {
    return cleaned;
  }
  return `[${brand}] ${cleaned}`;
}

export function mapChatbotProductFromDto(
  dto: ChatbotProductDtoLike,
): Product | null {
  const payload: ProductApiDto = {
    productId: dto.productId,
    productName: normalizeChatbotProductName(dto.productName, dto.brandName),
    brandName: dto.brandName ?? undefined,
    imageUrl: dto.imageUrl ?? undefined,
    categoryId: dto.categoryId ?? undefined,
    category: dto.categoryName ?? undefined,
    originalPrice: dto.originalPrice ?? undefined,
    salePrice: dto.salePrice ?? undefined,
    discountRate: dto.discountRate ?? undefined,
    stockQuantity: dto.stockQuantity ?? undefined,
    stockStatus: dto.stockStatus ?? undefined,
    stockBadgeText: dto.stockText ?? undefined,
  };

  return mapProductFromApi(payload);
}
