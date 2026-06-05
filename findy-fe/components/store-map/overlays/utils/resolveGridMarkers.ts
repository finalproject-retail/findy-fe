import type { StoreMapConfig } from "../../types";
import type {
  MapGridPoint,
  RecommendedMapItem,
  ResolvedGridMarker,
  ShoppingMapItem,
} from "../types";
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

function toMarker<T extends MapGridPoint & { id: string; name: string }>(
  config: StoreMapConfig,
  item: T,
  cellPx: number,
  label: string
): ResolvedGridMarker {
  const shelf = snapToNearestShelf(config, item.gridX, item.gridY);
  assertShelfCell(config, shelf.gridX, shelf.gridY, label);
  return {
    id: item.id,
    name: item.name,
    center: gridCellCenterToPixel(shelf.gridX, shelf.gridY, cellPx),
  };
}

export function resolveShoppingMarkers(
  config: StoreMapConfig,
  items: ShoppingMapItem[],
  cellPx: number
): ResolvedGridMarker[] {
  return items.map((item) => toMarker(config, item, cellPx, `shopping:${item.id}`));
}

export function resolveRecommendedMarkers(
  config: StoreMapConfig,
  items: RecommendedMapItem[],
  cellPx: number
): ResolvedGridMarker[] {
  return items.map((item) => toMarker(config, item, cellPx, `reco:${item.id}`));
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
