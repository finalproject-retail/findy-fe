import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import { resolveShelfGridForProduct } from "@/components/store-map/overlays/shelfGrid";
import type {
  MapGridPoint,
  RecommendedMapItem,
  RecommendedMapItemSource,
  ShoppingMapItem,
} from "@/components/store-map/overlays/types";
import type { CartLineItem } from "@/contexts/CartContext";
import type { Product } from "@/components/product";
import { categoryLineItemsToMapItems } from "@/lib/shopping/mappers";
import {
  isCategoryLineItem,
  isProductLineItem,
} from "@/lib/shopping/shoppingListItemUtils";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";

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
  gridId?: number | null,
): MapGridPoint & { gridId?: number } {
  const config = getEmartStoreMapConfig();

  if (gridId != null) {
    const { gridX, gridY } = gridIdToGridPoint(gridId, config.cols);
    return { gridX, gridY, gridId };
  }

  const preferred = PRODUCT_GRID_PREFERENCES[productId];

  if (preferred) {
    return resolveShelfGridForProduct(config, productId, category, preferred);
  }

  if (category) {
    return resolveShelfGridForProduct(config, productId, category);
  }

  if (__DEV__) {
    console.warn(
      `[cartToShoppingMapItems] gridId 없음 — 마커 위치 부정확: productId=${productId}`,
    );
  }

  return { gridX: 1, gridY: 16 };
}

function isPurchasable(item: CartLineItem) {
  return (item.product.stockCount ?? 1) > 0;
}

/** 추천(광고) 마커 — 알림과 동일 상품을 지도에 표시 */
export function productToRecommendedMapItem(
  product: Product,
  fallbackIndex = 0,
  source: RecommendedMapItemSource = "scan",
): RecommendedMapItem {
  const { gridX, gridY } = getProductGridLocation(
    product.id,
    product.category,
    fallbackIndex,
    product.gridId,
  );

  return {
    id: product.id,
    name: product.name,
    gridX,
    gridY,
    source,
    ...(product.gridId != null ? { gridId: product.gridId } : {}),
  };
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

    const location = getProductGridLocation(
      item.productId,
      item.product.category,
      result.length,
      item.product.gridId,
    );

    result.push({
      id: item.productId,
      name: item.product.name,
      ...location,
      visitOrder: result.length + 1,
    });
  }

  return result;
}

/** 진행 중인 쇼핑 리스트(트립) → 지도 마커·경로 재탐색용 */
export function tripLineItemsToShoppingMapItems(
  items: CartLineItem[],
): ShoppingMapItem[] {
  const productItems = cartToShoppingMapItems(
    items
      .filter(isProductLineItem)
      .map((item) => ({ ...item, selected: true })),
  );
  const categoryItems = categoryLineItemsToMapItems(
    items.filter(isCategoryLineItem),
  );

  return [...productItems, ...categoryItems].map((item, index) => ({
    ...item,
    visitOrder: index + 1,
  }));
}
