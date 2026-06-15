import type { StoreMapConfig } from "../../types";
import type {
  MapGridPoint,
  RecommendedMapItem,
  ResolvedGridMarker,
  ShoppingMapItem,
} from "../types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import { gridPointToGridId } from "@/lib/map/pathUtils";
import { gridCellCenterToPixel } from "./gridToPixel";
import { snapToNearestShelf } from "../shelfGrid";

function getCellType(config: StoreMapConfig, gridX: number, gridY: number) {
  return config.cells.find((c) => c.x === gridX && c.y === gridY)?.type;
}

function assertCellType(
  config: StoreMapConfig,
  gridX: number,
  gridY: number,
  expected: "shelf" | "aisle",
  label: string
) {
  if (!__DEV__) return;
  const type = getCellType(config, gridX, gridY);
  if (type !== expected) {
    console.warn(
      `[StoreMapOverlays] ${label}: (${gridX},${gridY}) is "${type ?? "unknown"}", expected ${expected}`
    );
  }
}

function assertShelfCell(
  config: StoreMapConfig,
  gridX: number,
  gridY: number,
  label: string
) {
  assertCellType(config, gridX, gridY, "shelf", label);
}

export function assertAisleCell(
  config: StoreMapConfig,
  gridX: number,
  gridY: number,
  label: string
) {
  assertCellType(config, gridX, gridY, "aisle", label);
}

/** 격자 한 칸 좌표 — gridId 우선, snap 없음 */
export function resolveItemGridCell(
  item: MapGridPoint & { gridId?: number },
  gridCols: number,
): MapGridPoint {
  if (item.gridId != null) {
    return gridIdToGridPoint(item.gridId, gridCols);
  }
  return { gridX: item.gridX, gridY: item.gridY };
}

export function resolveItemShelfGrid(
  config: StoreMapConfig,
  item: MapGridPoint & { gridId?: number },
): MapGridPoint {
  const cell = resolveItemGridCell(item, config.cols);
  if (item.gridId != null) {
    return cell;
  }
  return snapToNearestShelf(config, cell.gridX, cell.gridY);
}

/** 격자 한 칸 동일 여부 — gridId 기준 (같은 줄·다른 칸이면 별도) */
export function itemGridCellKey(
  item: MapGridPoint & { gridId?: number },
  gridCols: number,
): string {
  const gridId =
    item.gridId ?? gridPointToGridId(item.gridX, item.gridY, gridCols);
  return `grid:${gridId}`;
}

export function itemsShareGridCell(
  a: MapGridPoint & { gridId?: number },
  b: MapGridPoint & { gridId?: number },
  gridCols: number,
): boolean {
  return itemGridCellKey(a, gridCols) === itemGridCellKey(b, gridCols);
}

/** @deprecated itemsShareGridCell(item, item, gridCols) 사용 */
export function itemsShareShelfGrid(
  config: StoreMapConfig,
  a: MapGridPoint & { gridId?: number },
  b: MapGridPoint & { gridId?: number },
): boolean {
  return itemsShareGridCell(a, b, config.cols);
}

function dedupeItemsByGridCell<
  T extends MapGridPoint & { id: string; name: string; gridId?: number },
>(items: T[], gridCols: number): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = itemGridCellKey(item, gridCols);
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }
  return [...seen.values()];
}

function toMarker<T extends MapGridPoint & { id: string; name: string; gridId?: number }>(
  config: StoreMapConfig,
  item: T,
  cellPx: number,
  label: string
): ResolvedGridMarker {
  const cell = resolveItemGridCell(item, config.cols);
  assertShelfCell(config, cell.gridX, cell.gridY, label);
  return {
    id: item.id,
    name: item.name,
    center: gridCellCenterToPixel(cell.gridX, cell.gridY, cellPx),
  };
}

export function resolveShoppingMarkers(
  config: StoreMapConfig,
  items: ShoppingMapItem[],
  cellPx: number
): ResolvedGridMarker[] {
  return dedupeItemsByGridCell(items, config.cols).map((item) =>
    toMarker(config, item, cellPx, `shopping:${item.id}`),
  );
}

export function resolveRecommendedMarkers(
  config: StoreMapConfig,
  items: RecommendedMapItem[],
  cellPx: number
): ResolvedGridMarker[] {
  return dedupeItemsByGridCell(items, config.cols).map((item) =>
    toMarker(config, item, cellPx, `reco:${item.id}`),
  );
}

export function locationMatchesShoppingStop(
  location: MapGridPoint,
  item: MapGridPoint
): boolean {
  return location.gridX === item.gridX && location.gridY === item.gridY;
}

/** 구역은 비콘 도착 시 leg 진행(지나온 구간 점선). 상품은 스캔 시 점선, 경로 재생성은 새로고침에서만 */
export function isRoutingLegComplete(
  location: MapGridPoint,
  target: MapGridPoint & { id: string },
  _pickedQuantityByProductId: Record<string, number>,
): boolean {
  if (!target.id.startsWith("zone-")) {
    return false;
  }

  return locationMatchesShoppingStop(location, target);
}
