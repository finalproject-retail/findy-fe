import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import { resolveShelfGridForProduct } from "@/components/store-map/overlays/utils/shelfGrid";
import type { MapGridPoint } from "@/components/store-map/overlays/types";

/** 목 데이터 — 상품별 선호 매대 위치 (없으면 카테고리로 자동 매칭) */
const PRODUCT_GRID_PREFERENCES: Record<string, MapGridPoint> = {
  noodle: { gridX: 2, gridY: 0 },
  "ramen-cup": { gridX: 3, gridY: 0 },
  snack: { gridX: 2, gridY: 2 },
  "green-tea": { gridX: 17, gridY: 12 },
  coffee: { gridX: 18, gridY: 12 },
  beef: { gridX: 25, gridY: 1 },
  apple: { gridX: 25, gridY: 13 },
};

export function getProductGridLocation(
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
