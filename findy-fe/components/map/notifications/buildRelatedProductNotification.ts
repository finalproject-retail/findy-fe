import { getInStockProducts } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import type { MapShoppingNotification } from "./types";

function getShortProductName(name: string): string {
  const bracket = name.match(/\[([^\]]+)\]/);
  if (bracket?.[1]) {
    return bracket[1];
  }
  const stripped = name.replace(/\[.*?\]/g, "").trim();
  if (stripped.length <= 14) {
    return stripped || name;
  }
  return `${stripped.slice(0, 14)}…`;
}

export function getRelatedProductForNotification(
  pickedProductId: string,
  excludeProductIds: string[] = [],
): Product | null {
  const exclude = new Set([pickedProductId, ...excludeProductIds]);
  const candidates = getInStockProducts().filter((item) => !exclude.has(item.id));
  if (candidates.length === 0) {
    return null;
  }
  let hash = 0;
  for (let i = 0; i < pickedProductId.length; i += 1) {
    hash = (hash * 31 + pickedProductId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % candidates.length;
  return candidates[index] ?? null;
}

export function buildRelatedProductNotification(
  pickedProduct: Product,
  relatedProduct: Product,
): Omit<MapShoppingNotification, "id" | "createdAt"> {
  const shortPicked = getShortProductName(pickedProduct.name);
  const shortRelated = getShortProductName(relatedProduct.name);

  return {
    pickedProductId: pickedProduct.id,
    pickedProductName: pickedProduct.name,
    headline: `🎁 방금 담은 ${shortPicked}과 어울리는 상품이에요!`,
    description: `이번 주말 한정! 쟁여두면 든든한 [${shortRelated}] 지금 구매하면 ${relatedProduct.discountPercent}% 할인`,
    relatedProduct,
  };
}

export function buildPromoScanMilestoneNotification(
  relatedProduct: Product,
  totalScanCount: number,
  lastPickedProduct?: Product,
): Omit<MapShoppingNotification, "id" | "createdAt"> {
  const shortRelated = getShortProductName(relatedProduct.name);

  return {
    pickedProductId: lastPickedProduct?.id ?? "",
    pickedProductName: lastPickedProduct?.name ?? "",
    headline: `🎁 ${totalScanCount}개 수령 완료! 추천 상품이에요`,
    description: `이번 주말 한정! 쟁여두면 든든한 [${shortRelated}] 지금 구매하면 ${relatedProduct.discountPercent}% 할인`,
    relatedProduct,
  };
}
