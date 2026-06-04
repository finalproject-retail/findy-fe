import { resolveCatalogProductId } from "@/components/product/resolveCatalogProductId";

/** API용 숫자 productId — 검색용 `-search-` 접미사·비숫자 id 제거 */
export function parseShoppingProductId(productId: string | number): number {
  if (typeof productId === "number") {
    if (!Number.isFinite(productId) || productId <= 0) {
      throw new Error("유효하지 않은 상품입니다.");
    }
    return productId;
  }

  const catalogId = resolveCatalogProductId(productId.trim());
  if (!/^\d+$/.test(catalogId)) {
    throw new Error("유효하지 않은 상품입니다.");
  }

  const parsed = Number(catalogId);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("유효하지 않은 상품입니다.");
  }

  return parsed;
}
