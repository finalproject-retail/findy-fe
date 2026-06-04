import type { Product } from "@/components/product/types";
import { SHOPPING_API_URL } from "@/constants/serviceApi";

/** API imageUrl 없을 때 — 홈·장바구니·상세 동일 */
export const DEFAULT_PRODUCT_PLACEHOLDER = require("@/assets/images/product/green-tea.png");

export function resolveProductImageSource(
  imageUrl?: string | null,
  thumbnailUrl?: string | null,
): Product["image"] {
  const raw = imageUrl ?? thumbnailUrl;
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return DEFAULT_PRODUCT_PLACEHOLDER;
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith("/")) {
    return { uri: `${SHOPPING_API_URL}${trimmed}` };
  }
  return { uri: trimmed };
}
