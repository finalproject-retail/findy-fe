/**
 * 도면(빨간 격자) 기준 레이아웃 상수
 *
 * - 격자 1칸 = 5m × 5m
 * - 매대 '한 줄'(블록) = 가로 2칸 × 세로 4칸 = 8칸
 * - 매대 한쪽 면(34|35 중 34) = 가로 1칸 × 세로 4칸 = 4칸
 * - 통로 = 1칸
 */

/** 도면 전체: 가로 29칸 × 세로 18칸 (0-index: x 0~28, y 0~17) */
export const GRID_ROWS = 18;
export const GRID_COLS = 29;

/** 매대 블록(도면 회색 사각형 하나) */
export const SHELF_BLOCK_COLS = 2;
export const SHELF_BLOCK_ROWS = 4;

/** 매대 한쪽 면 = 4격자 (1×4) */
export const SHELF_FACE_COLS = 1;
export const SHELF_FACE_ROWS = 4;

export const AISLE_COLS = 1;
export const AISLE_ROWS = 1;

/** 행사 매대 = 격자 2칸 (2×1) */
export const EVENT_SHELF_COLS = 2;
export const EVENT_SHELF_ROWS = 1;

/** 좌측 견과 = 세로 8칸 */
export const NUTS_SHELF_ROWS = 8;
export const NUTS_SHELF_Y = 0;
/** 좌측 계산대 = 세로 7칸 (견과 바로 아래) */
export const CHECKOUT_SHELF_ROWS = 7;
export const CHECKOUT_SHELF_Y = NUTS_SHELF_Y + NUTS_SHELF_ROWS;

/** 좌측 출입구 = 세로 2칸, 번호 없음 */
export const ENTRANCE_SHELF_ROWS = 2;

/** 중앙 세로 매대 열 시작 x (각 블록 2칸 + 통로 1칸) */
export const ISLAND_START_COLS = [2, 5, 8, 11, 14, 17, 20] as const;

export const ISLAND_ROW_BANDS = [
  { key: "top", y: 2, rows: 4 },
  { key: "mid", y: 7, rows: 4 },
  { key: "bot", y: 12, rows: 4 },
] as const;

/** 매대 행 사이 통로 y */
export const ISLAND_ROW_AISLES = [6, 11] as const;

/** 하단 매대(12~15행)와 하단 벽(17행) 사이 통로 */
export const BOTTOM_PREP_AISLE_Y = [16] as const;

/** 하단 벽: 행사 7 · 가전 8 · 주류 8 (x=2부터 연속, 농산 x=25) */
export const BOTTOM_WALL_START_X = ISLAND_START_COLS[0];
export const BOTTOM_WALL_EVENT_COLS = 7;
export const BOTTOM_WALL_APPLIANCE_COLS = 8;
export const BOTTOM_WALL_LIQUOR_COLS = 8;
export const BOTTOM_WALL_APPLIANCE_X = BOTTOM_WALL_START_X + BOTTOM_WALL_EVENT_COLS;
export const BOTTOM_WALL_LIQUOR_X = BOTTOM_WALL_APPLIANCE_X + BOTTOM_WALL_APPLIANCE_COLS;

/** 중앙 매대·우측 냉동 열 y 범위 */
export const ISLAND_Y_MIN = ISLAND_ROW_BANDS[0].y;
export const ISLAND_Y_MAX =
  ISLAND_ROW_BANDS[ISLAND_ROW_BANDS.length - 1].y + SHELF_BLOCK_ROWS - 1;

export const RIGHT_BLOCK_X = 23;
export const RIGHT_BLOCK_COLS = 4;
export const RIGHT_BLOCK_ROWS = 2;

/** 행사 매대 시작 x (냉동 블록보다 오른쪽 1칸) */
export const EVENT_SHELF_X = RIGHT_BLOCK_X + 1;

/** 우측 가로 블록 y (블록 2행 + 통로 1행) */
export const RIGHT_BLOCK_Y = [2, 5, 8, 11, 14] as const;

export const TOP_WALL_Y = 0;

/** 상단 가장자리 매대 너비 (x=1부터 연속) */
export const TOP_WALL_START_X = 1;
export const TOP_WALL_RAMEN_COLS = 8;
export const TOP_WALL_BAKERY_COLS = 8;
export const TOP_WALL_DELI_COLS = 8;
export const TOP_WALL_COLD_COLS = 4;
/** 우측 냉장/축산 세로 4칸 — y=0은 상단 가로와 겹치지 않음 */
export const RIGHT_WALL_COLD_ROWS = 4;
export const RIGHT_WALL_COLD_START_Y = 1;
export const BOTTOM_WALL_Y = GRID_ROWS - 1;
/** 출입구 y — 하단 벽(17행)과 맞닿음 (16~17행) */
export const ENTRANCE_SHELF_Y = BOTTOM_WALL_Y - ENTRANCE_SHELF_ROWS + 1;
/** 우측 수산 8칸 — 냉장/축산 세로 바로 아래 */
export const RIGHT_WALL_SEAFOOD_ROWS = 8;
export const RIGHT_WALL_SEAFOOD_START_Y = RIGHT_WALL_COLD_START_Y + RIGHT_WALL_COLD_ROWS;
/** 우측 농산 세로 4칸 — 수산 바로 아래, y=17은 하단 가로와 겹치지 않음 */
export const RIGHT_WALL_PRODUCE_ROWS = 4;
export const RIGHT_WALL_PRODUCE_START_Y =
  RIGHT_WALL_SEAFOOD_START_Y + RIGHT_WALL_SEAFOOD_ROWS;
/** 하단 농산 가로 4칸 — 우하단 ㄴ자 (냉장/축산 상단과 동일 x) */
export const BOTTOM_WALL_PRODUCE_COLS = 4;
export const TOP_WALL_BAKERY_X = TOP_WALL_START_X + TOP_WALL_RAMEN_COLS;
export const TOP_WALL_DELI_X = TOP_WALL_BAKERY_X + TOP_WALL_BAKERY_COLS;
export const TOP_WALL_COLD_X = TOP_WALL_DELI_X + TOP_WALL_DELI_COLS;
export const BOTTOM_WALL_PRODUCE_X = TOP_WALL_COLD_X;
export const LEFT_WALL_X = 0;
export const RIGHT_WALL_X = GRID_COLS - 1;
