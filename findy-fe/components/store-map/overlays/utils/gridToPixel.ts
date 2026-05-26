import type { MapGridPoint, MapPixelPoint } from "../types";

/** 격자 셀 중심 → 지도 픽셀 (cellPx 스케일) */
export function gridCellCenterToPixel(
  gridX: number,
  gridY: number,
  cellPx: number
): MapPixelPoint {
  return {
    x: (gridX + 0.5) * cellPx,
    y: (gridY + 0.5) * cellPx,
  };
}

export function gridPointToPixel(point: MapGridPoint, cellPx: number): MapPixelPoint {
  return gridCellCenterToPixel(point.gridX, point.gridY, cellPx);
}

/** 핀 SVG 하단 끝이 셀 중심에 오도록 좌상단 offset */
export function pinTopLeftFromCenter(
  center: MapPixelPoint,
  pinWidth: number,
  pinHeight: number
): MapPixelPoint {
  return {
    x: center.x - pinWidth / 2,
    y: center.y - pinHeight,
  };
}
