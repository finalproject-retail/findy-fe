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

/** 지도 진입 시 현위치 기준 확대 배율 (fit 대비) */
export const USER_LOCATION_FOCUS_ZOOM_FACTOR = 2.4;

/** 확대 시 하단(벽면) 매대까지 pan 여유 */
export const MAP_PAN_BOTTOM_EXTRA_PX = 96;
/** 확대 시 상단 pan 여유 (마커 말풍선) */
export const MAP_PAN_TOP_EXTRA_PX = 56;
/** 확대 시 좌우 pan 여유 — 가장자리 마커 말풍선이 잘리지 않도록 */
export const MAP_PAN_HORIZONTAL_EXTRA_PX = 120;
/** 바텀시트 가림 높이 대비 추가 pan 비율 */
export const MAP_PAN_INSET_BOTTOM_RATIO = 0.35;
export const MAP_PAN_INSET_TOP_RATIO = 0.12;

export const SHELF_BLOCK_RADIUS = 2;
export const ZONE_BLOCK_RADIUS = 3;

export const ZONE_FILL_COLOR = "#E6E6E6";
export const ZONE_BORDER_COLOR = "#B8B8B8";
export const ZONE_TEXT_COLOR = "#5C5C5C";
/** 확대(매대) 지도 글씨·번호 — 존 텍스트보다 아주 조금 옅게 */
export const SHELF_TEXT_COLOR = "#6B6B6B";

export const ENTRANCE_CATEGORY = "출입구";
/** 출입구 라벨만 살짝 작게 */
export const ENTRANCE_LABEL_SCALE = 0.88;

export const EVENT_SHELF_CATEGORY = "행사";
/** 행사 매대(49·50·61) 전용 배경 */
export const EVENT_SHELF_FILL_COLOR = "#FFECB3";

/** 확대(매대) 지도도 축소(존) 지도와 동일 팔레트 */
export const SHELF_FILL_COLOR = ZONE_FILL_COLOR;
export const SHELF_BORDER_COLOR = ZONE_BORDER_COLOR;
export const MAP_FLOOR_COLOR = "#FFFFFF";

/** 확대(매대) 지도 텍스트 굵기 — 기본 */
export const SHELF_FONT_WEIGHT = "400" as const;
/** 행사 매대(49·50·61) 카테고리·번호 */
export const SHELF_EVENT_FONT_WEIGHT = "700" as const;

/** 매대 번호 글자 크기 — 모든 레이아웃(섬·벽면·세로) 공통 */
export function shelfNumberFontSize(cellPx: number): number {
  return Math.max(cellPx * 0.48, 7);
}

/** 확대 지도 카테고리 글자 — 가장자리·가로 매대 공통(중간 크기) */
export function shelfCategoryFontSize(cellPx: number, maxWidth?: number): number {
  let size = Math.max(cellPx * 0.38, 7);
  if (maxWidth != null) {
    size = Math.min(size, maxWidth * 0.88);
  }
  return size;
}

/** 번호·카테고리 가장자리 여백 (좁은 우측 43~50 매대 포함, cellPx·칸 크기에 비례) */
export function shelfLabelInset(
  cellPx: number,
  stripWidth?: number,
  stripHeight?: number
): { numberLeft: number; categoryEdge: number; vertical: number } {
  const numberLeft = Math.max(
    Math.round(cellPx * 0.16),
    stripWidth != null ? Math.round(stripWidth * 0.1) : 0,
    4
  );
  const vertical = Math.max(
    Math.round(cellPx * 0.1),
    stripHeight != null ? Math.round(stripHeight * 0.12) : 0,
    2
  );
  return { numberLeft, categoryEdge: numberLeft, vertical };
}

export const STORE_MAP_COLORS = {
  aisle: MAP_FLOOR_COLOR,
  floor: MAP_FLOOR_COLOR,
  shelf: SHELF_FILL_COLOR,
  eventShelf: EVENT_SHELF_FILL_COLOR,
  shelfDivider: ZONE_BORDER_COLOR,
  zoneBorder: ZONE_BORDER_COLOR,
  zoneText: ZONE_TEXT_COLOR,
  shelfNumber: SHELF_TEXT_COLOR,
  shelfCategory: SHELF_TEXT_COLOR,
  service: ZONE_FILL_COLOR,
} as const;

export function getCategoryColor(category?: string): string {
  if (category === EVENT_SHELF_CATEGORY) {
    return EVENT_SHELF_FILL_COLOR;
  }
  return ZONE_FILL_COLOR;
}
