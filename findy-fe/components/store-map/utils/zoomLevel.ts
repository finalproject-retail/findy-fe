import {
  ZOOM_DETAIL_MIN,
  ZOOM_ZONE_MAX,
} from "../constants";

export type MapVisualLevel = "zone" | "detail" | "transition";

/** 절대 scale → fit 대비 배율 (100% = 1.0) */
export function getZoomRatio(scale: number, fitScale: number): number {
  if (fitScale <= 0) return 1;
  return scale / fitScale;
}

export function getVisualLevel(scale: number, fitScale: number): MapVisualLevel {
  const ratio = getZoomRatio(scale, fitScale);
  if (ratio <= ZOOM_ZONE_MAX) return "zone";
  if (ratio >= ZOOM_DETAIL_MIN) return "detail";
  return "transition";
}

/** 0 = 존 전용, 1 = 매대 전용 */
export function getDetailBlend(scale: number, fitScale: number): number {
  const ratio = getZoomRatio(scale, fitScale);
  if (ratio <= ZOOM_ZONE_MAX) return 0;
  if (ratio >= ZOOM_DETAIL_MIN) return 1;
  return (ratio - ZOOM_ZONE_MAX) / (ZOOM_DETAIL_MIN - ZOOM_ZONE_MAX);
}
