/** 지도가 뷰포트를 넘을 때 pan(left/top) 허용 범위 */
export function getPanBounds(
  viewportW: number,
  viewportH: number,
  mapW: number,
  mapH: number,
  scale: number
) {
  const scaledW = mapW * scale;
  const scaledH = mapH * scale;
  return {
    minX: Math.min(0, viewportW - scaledW),
    maxX: Math.max(0, viewportW - scaledW),
    minY: Math.min(0, viewportH - scaledH),
    maxY: Math.max(0, viewportH - scaledH),
  };
}

export function clampPan(
  panX: number,
  panY: number,
  viewportW: number,
  viewportH: number,
  mapW: number,
  mapH: number,
  scale: number
) {
  const { minX, maxX, minY, maxY } = getPanBounds(
    viewportW,
    viewportH,
    mapW,
    mapH,
    scale
  );
  return {
    x: Math.min(maxX, Math.max(minX, panX)),
    y: Math.min(maxY, Math.max(minY, panY)),
  };
}

export function getCenteredPan(
  viewportW: number,
  viewportH: number,
  mapW: number,
  mapH: number,
  scale: number
) {
  const scaledW = mapW * scale;
  const scaledH = mapH * scale;
  return {
    x: (viewportW - scaledW) / 2,
    y: (viewportH - scaledH) / 2,
  };
}
