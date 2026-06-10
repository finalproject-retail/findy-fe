import type { CartZoneItem } from "@/components/category";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { CategoryZone } from "@/components/store-map/types";
import type { ShoppingMapItem } from "@/components/store-map/overlays/types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";

function zoneCenter(zone: CategoryZone) {
  return {
    gridX: Math.floor(zone.x + zone.width / 2),
    gridY: Math.floor(zone.y + zone.height / 2),
  };
}

function findMapZone(zone: CartZoneItem): CategoryZone | null {
  const config = getEmartStoreMapConfig();
  const needles = [
    zone.label,
    zone.middleLabel,
    zone.label.split("/")[0]?.trim() ?? "",
  ].filter(Boolean);

  for (const mapZone of config.zones) {
    for (const needle of needles) {
      if (
        mapZone.category.includes(needle) ||
        needle.includes(mapZone.category)
      ) {
        return mapZone;
      }
    }
  }

  return config.zones[0] ?? null;
}

type ZoneMapInput = CartZoneItem & { gridId?: number | null };

/** 담은 소분류 구역 → 지도 방문 지점 */
export function zonesToShoppingMapItems(zones: ZoneMapInput[]): ShoppingMapItem[] {
  const config = getEmartStoreMapConfig();

  return zones.map((zone, index) => {
    if (zone.gridId != null) {
      const { gridX, gridY } = gridIdToGridPoint(zone.gridId, config.cols);
      return {
        id: `zone-${zone.categoryId}`,
        name: zone.label,
        gridX,
        gridY,
        gridId: zone.gridId,
        visitOrder: index + 1,
      };
    }

    const mapZone = findMapZone(zone);
    const { gridX, gridY } = mapZone
      ? zoneCenter(mapZone)
      : { gridX: 14, gridY: 10 };

    return {
      id: `zone-${zone.categoryId}`,
      name: zone.label,
      gridX,
      gridY,
      visitOrder: index + 1,
    };
  });
}
