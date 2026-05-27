import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import { resolveShelfGridForProduct } from "@/components/store-map/overlays/shelfGrid";
import type {
  MapGridPoint,
  ShoppingMapItem,
} from "@/components/store-map/overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";

/** 목 데이터 — 상품별 선호 매대 위치 */
const PRODUCT_GRID_PREFERENCES: Record<string, MapGridPoint> = {
  noodle: { gridX: 2, gridY: 0 },
  "ramen-cup": { gridX: 3, gridY: 0 },
  snack: { gridX: 2, gridY: 2 },
  "green-tea": { gridX: 17, gridY: 12 },
  coffee: { gridX: 18, gridY: 12 },
  beef: { gridX: 25, gridY: 1 },
  apple: { gridX: 25, gridY: 13 },
};

function getProductGridLocation(
  productId: string,
  category: string | undefined,
  fallbackIndex: number,
): MapGridPoint {
  const config = getEmartStoreMapConfig();
  const preferred = PRODUCT_GRID_PREFERENCES[productId];

  if (preferred) {
    return resolveShelfGridForProduct(config, productId, category, preferred);
  }

  if (category) {
    return resolveShelfGridForProduct(config, productId, category);
  }

  const fallbackIds = Object.keys(PRODUCT_GRID_PREFERENCES);
  const fallbackId = fallbackIds[fallbackIndex % fallbackIds.length] ?? productId;
  return resolveShelfGridForProduct(
    config,
    productId,
    undefined,
    PRODUCT_GRID_PREFERENCES[fallbackId],
  );
}

function isPurchasable(item: CartLineItem) {
  return (item.product.stockCount ?? 1) > 0;
}

/** 선택된 장바구니 상품 → 지도 쇼핑 마커 (상품당 1개) */
export function cartToShoppingMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  const selected = items.filter((item) => item.selected && isPurchasable(item));
  const seen = new Set<string>();
  const result: ShoppingMapItem[] = [];

  for (const item of selected) {
    if (seen.has(item.productId)) continue;
    seen.add(item.productId);

    const { gridX, gridY } = getProductGridLocation(
      item.productId,
      item.product.category,
      result.length,
    );

    result.push({
      id: item.productId,
      name: item.product.name,
      gridX,
      gridY,
      visitOrder: result.length + 1,
    });
  }

  return result;
}

/** 진행 중인 쇼핑 리스트(트립) → 지도 마커·경로 재탐색용 */
export function tripLineItemsToShoppingMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  return cartToShoppingMapItems(
    items.map((item) => ({ ...item, selected: true })),
  );
}
