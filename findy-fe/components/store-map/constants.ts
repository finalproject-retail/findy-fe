import { COLORS } from "@/constants/theme";

export const BASE_CELL_PX = 12;

/**
 * fit(100%) 대비 줌 비율 기준.
 * - 100%: 축소(존) 지도만
 * - 100~140%: 서서히 전환
 * - 140% 이상: 확대(매대) 지도
 */
export const ZOOM_ZONE_MAX = 1;
export const ZOOM_DETAIL_MIN = 1.4;

/** fit 대비 최대 확대 (100% × 3.2 ≈ 320%) */
export const ZOOM_MAX = 3.2;
export const ZOOM_STEP = 0.18;

export const SHELF_BLOCK_RADIUS = 2;
export const ZONE_BLOCK_RADIUS = 3;

export const ZONE_FILL_COLOR = "#E6E6E6";
export const ZONE_BORDER_COLOR = "#B8B8B8";
export const ZONE_TEXT_COLOR = "#4A4A4A";
/** 확대(매대) 지도 글씨·번호 — 존 텍스트보다 아주 조금 옅게 */
export const SHELF_TEXT_COLOR = "#5A5A5A";

/** 확대(매대) 지도도 축소(존) 지도와 동일 팔레트 */
export const SHELF_FILL_COLOR = ZONE_FILL_COLOR;
export const SHELF_BORDER_COLOR = ZONE_BORDER_COLOR;
export const MAP_FLOOR_COLOR = "#FFFFFF";

/** 확대(매대) 지도 텍스트 굵기 — 볼드 없음 */
export const SHELF_FONT_WEIGHT = "400" as const;

export const STORE_MAP_COLORS = {
  aisle: MAP_FLOOR_COLOR,
  floor: MAP_FLOOR_COLOR,
  shelf: SHELF_FILL_COLOR,
  shelfDivider: ZONE_BORDER_COLOR,
  zoneBorder: ZONE_BORDER_COLOR,
  zoneText: ZONE_TEXT_COLOR,
  shelfNumber: SHELF_TEXT_COLOR,
  shelfCategory: SHELF_TEXT_COLOR,
  service: ZONE_FILL_COLOR,
} as const;

export function getCategoryColor(_category?: string): string {
  return ZONE_FILL_COLOR;
}
