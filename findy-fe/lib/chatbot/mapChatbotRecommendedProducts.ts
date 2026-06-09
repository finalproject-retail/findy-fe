import type { Product } from "@/components/product/types";
import { mapProductsFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";
import type { ChatbotMessageResponseApiDto } from "@/lib/chatbot/api/types";

function isProductDtoArray(value: unknown): value is ProductApiDto[] {
  return Array.isArray(value) && value.length > 0;
}

function extractProductDtos(source: unknown): ProductApiDto[] {
  if (!source || typeof source !== "object") {
    return [];
  }

  const record = source as Record<string, unknown>;

  if (isProductDtoArray(record.recommendedProducts)) {
    return record.recommendedProducts;
  }
  if (isProductDtoArray(record.products)) {
    return record.products;
  }
  if (isProductDtoArray(record.items)) {
    return record.items;
  }

  const shoppingContext = record.shoppingContext;
  if (shoppingContext && typeof shoppingContext === "object") {
    return extractProductDtos(shoppingContext);
  }

  return [];
}

export function mapChatbotRecommendedProducts(
  dto: Pick<
    ChatbotMessageResponseApiDto,
    "recommendedProducts" | "products" | "shoppingContext"
  >,
): Product[] {
  const dtos =
    dto.recommendedProducts ??
    dto.products ??
    extractProductDtos(dto);

  return mapProductsFromApi(dtos);
}
