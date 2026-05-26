import { BASE_CELL_PX } from "../../constants";

/** 살 상품·추천 마커 — 축소 지도에서 cellPx에 비례해 작게 */
export function markerOverlayScale(cellPx: number): number {
  const normalized = cellPx / BASE_CELL_PX;

  if (normalized <= 1) {
    return Math.max(0.5, Math.min(normalized * 0.62, 0.58));
  }

  return Math.max(0.9, 1 / normalized);
}

/** 현위치 — 축소: 보이게 유지, 확대: 줌에 맞춰 키움 */
export function userLocationScale(cellPx: number): number {
  const normalized = cellPx / BASE_CELL_PX;

  if (normalized <= 1) {
    return Math.max(1, Math.min(1 / normalized, 1.12));
  }

  return Math.min(1.34, Math.max(1.14, 0.94 + (normalized - 1) * 0.24));
}

export function overlayVisualScale(cellPx: number): number {
  return markerOverlayScale(cellPx);
}

export function scaledMarkerSize(base: number, cellPx: number): number {
  return Math.round(base * markerOverlayScale(cellPx));
}

export function scaledUserLocationSize(base: number, cellPx: number): number {
  return Math.round(base * userLocationScale(cellPx));
}

/** 경로선 두께 */
export function scaledPathStroke(base: number, cellPx: number): number {
  return Math.round(base * markerOverlayScale(cellPx));
}

/** 혼잡도 원 — 축소 지도에서 cellPx에 비례해 축소 */
export function beaconHeatDiameter(
  basePx: number,
  cellPx: number
): number {
  const normalized = cellPx / BASE_CELL_PX;

  if (normalized >= 1) {
    return Math.round(basePx * 0.82);
  }

  return Math.round(basePx * Math.max(0.36, normalized * 0.75));
}
