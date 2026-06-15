import type { CartZoneItem } from "@/components/category";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";

type ZoneWithGrid = Pick<CartZoneItem, "categoryId" | "label" | "gridId">;

/** 쇼핑리스트 API category.gridId 기준 구역 마커 */
export function zonesToShoppingMapItems(zones: ZoneWithGrid[]): ShoppingMapItem[] {
  const config = getEmartStoreMapConfig();

  return zones.map((zone, index) => {
    const gridId = zone.gridId;
    if (gridId == null) {
      if (__DEV__) {
        console.warn(
          `[zonesToShoppingMapItems] category.gridId 없음 — zone-${zone.categoryId} (${zone.label})`,
        );
      }
      return {
        id: `zone-${zone.categoryId}`,
        name: zone.label,
        gridX: 1,
        gridY: 16,
        visitOrder: index + 1,
      };
    }

    const { gridX, gridY } = gridIdToGridPoint(gridId, config.cols);
    return {
      id: `zone-${zone.categoryId}`,
      name: zone.label,
      gridX,
      gridY,
      gridId,
      visitOrder: index + 1,
    };
  });
}
