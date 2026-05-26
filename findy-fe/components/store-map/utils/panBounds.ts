import { MAP_PAN_BOTTOM_EXTRA_PX } from "../constants";

/** 지도가 뷰포트를 넘을 때 pan(left/top) 허용 범위 — scaledW/H는 실제 렌더 크기 */
export function getPanBounds(
  viewportW: number,
  viewportH: number,
  scaledW: number,
  scaledH: number
) {
  const overflowX = scaledW - viewportW;
  const overflowY = scaledH - viewportH;

  if (overflowX <= 0 && overflowY <= 0) {
    const cx = (viewportW - scaledW) / 2;
    const cy = (viewportH - scaledH) / 2;
    return { minX: cx, maxX: cx, minY: cy, maxY: cy };
  }

  const bottomPad = MAP_PAN_BOTTOM_EXTRA_PX;

  return {
    minX: overflowX > 0 ? -overflowX : (viewportW - scaledW) / 2,
    maxX: overflowX > 0 ? 0 : (viewportW - scaledW) / 2,
    minY: overflowY > 0 ? -overflowY - bottomPad : (viewportH - scaledH) / 2,
    maxY: overflowY > 0 ? 0 : (viewportH - scaledH) / 2,
  };
}

export function clampPan(
  panX: number,
  panY: number,
  viewportW: number,
  viewportH: number,
  scaledW: number,
  scaledH: number
) {
  const { minX, maxX, minY, maxY } = getPanBounds(
    viewportW,
    viewportH,
    scaledW,
    scaledH
  );
  return {
    x: Math.min(maxX, Math.max(minX, panX)),
    y: Math.min(maxY, Math.max(minY, panY)),
  };
}

export function getCenteredPan(
  viewportW: number,
  viewportH: number,
  scaledW: number,
  scaledH: number
) {
  return {
    x: (viewportW - scaledW) / 2,
    y: (viewportH - scaledH) / 2,
  };
}
