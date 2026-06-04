import type { Product } from "@/components/product/types";
import { SHOPPING_API_URL } from "@/constants/serviceApi";
import type { RecentViewApiDto } from "@/lib/auth/types";

const PLACEHOLDER_IMAGE = require("@/assets/images/product/green-tea.png");

function resolveThumbnailUrl(url: string | null | undefined): Product["image"] {
  if (!url?.trim()) {
    return PLACEHOLDER_IMAGE;
  }

  const trimmed = url.trim();
  if (trimmed.startsWith("/")) {
    return { uri: `${SHOPPING_API_URL}${trimmed}` };
  }
  return { uri: trimmed };
}

export function mapRecentViewToProduct(dto: RecentViewApiDto): Product | null {
  if (dto.productId == null || !dto.productName?.trim()) {
    return null;
  }

  return {
    id: String(dto.productId),
    name: dto.productName.trim(),
    price: dto.price ?? 0,
    discountPercent: 0,
    image: resolveThumbnailUrl(dto.thumbnailUrl),
    viewedAt: dto.viewedAt,
  };
}

export function mapRecentViewsToProducts(dtos: RecentViewApiDto[]): Product[] {
  return dtos
    .map(mapRecentViewToProduct)
    .filter((product): product is Product => product != null);
}
