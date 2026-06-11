import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import {
  CELL_REAL_SIZE_METERS,
  type StoreCellMapping,
  type StoreCellType,
  type StoreMapConfig,
} from "@/components/store-map/types";
import type { StoreMapConfigApi } from "@/lib/map/types";

function mapApiCellType(cellType: string): StoreCellType {
  switch (cellType) {
    case "AISLE":
    case "START":
      return "aisle";
    case "SHELF":
    case "COUNTER":
      return "shelf";
    default:
      return "shelf";
  }
}

export function buildCellsFromApiGrids(
  grids: StoreMapConfigApi["grids"],
): StoreCellMapping[] {
  return grids.map((grid) => ({
    x: grid.gridX,
    y: grid.gridY,
    type: mapApiCellType(grid.cellType),
    realMeters: {
      x: grid.gridX * CELL_REAL_SIZE_METERS,
      y: grid.gridY * CELL_REAL_SIZE_METERS,
    },
  }));
}

export function buildMinorToGridIdFromBeacons(
  beacons: StoreMapConfigApi["beacons"],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const beacon of beacons) {
    if (beacon.minor != null) {
      map[String(beacon.minor)] = beacon.gridId;
    }
  }
  return map;
}

/** API 격자(통로·위치) + 로컬 매대 UI(units/zones) 병합 */
export function buildStoreMapConfigFromApi(
  api: StoreMapConfigApi,
  localFallback: StoreMapConfig = getEmartStoreMapConfig(),
): StoreMapConfig {
  const { layout, map, grids } = api;
  return {
    rows: layout.gridRows,
    cols: layout.gridCols,
    cells: buildCellsFromApiGrids(grids),
    units: localFallback.units,
    zones: localFallback.zones,
    mapImageUrl: map.mapImageUrl,
  };
}

export function gridIdToGridPoint(
  gridId: number,
  gridCols: number,
): { gridX: number; gridY: number } {
  const index = gridId - 1;
  return {
    gridX: index % gridCols,
    gridY: Math.floor(index / gridCols),
  };
}
