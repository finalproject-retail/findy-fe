import type { StoreMapConfig } from "../../types";
import type {
  MapGridPoint,
  RecommendedMapItem,
  ResolvedGridMarker,
  ShoppingMapItem,
} from "../types";
import { gridCellCenterToPixel } from "./gridToPixel";

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
  assertShelfCell(config, item.gridX, item.gridY, label);
  return {
    id: item.id,
    name: item.name,
    center: gridCellCenterToPixel(item.gridX, item.gridY, cellPx),
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
