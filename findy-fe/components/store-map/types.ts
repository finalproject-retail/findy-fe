/** 실제 매장 격자 1칸 = 5m × 5m (내부 좌표·경로용) */
export const CELL_REAL_SIZE_METERS = 5;

export type StoreCellType = "wall" | "aisle" | "shelf";

export type GridPosition = {
  x: number;
  y: number;
};

export type RealPositionMeters = {
  x: number;
  y: number;
};

/** Data-flat: 격자 1칸 = 5m×5m. 매대 면 = 1×4칸 */
export type StoreCellMapping = {
  x: number;
  y: number;
  type: StoreCellType;
  shelfNumber?: string;
  category?: string;
  shelfFaceId?: string;
  realMeters: RealPositionMeters;
};

/** 매대 블록 한쪽 면 (도면의 반쪽) */
export type ShelfHalf = {
  shelfNumber?: string;
  category: string;
};

export type ShelfUnitSplit = "vertical" | "horizontal" | "none";

/** 화면 렌더 단위 = 2×4 격자 매대 블록 (도면 회색 사각형) */
export type ShelfUnit = {
  id: string;
  /** 격자 col */
  x: number;
  /** 격자 row */
  y: number;
  /** 격자 너비 (기본 2) */
  width: number;
  /** 격자 높이 (기본 4) */
  height: number;
  split: ShelfUnitSplit;
  primary: ShelfHalf;
  secondary?: ShelfHalf;
  kind: "island" | "perimeter" | "service";
};

/** 줌 아웃 시 병합된 카테고리 구역 */
export type CategoryZone = {
  id: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unitCount: number;
};

export type StoreMapConfig = {
  rows: number;
  cols: number;
  /** 5m×5m 격자 flat (전체) */
  cells: StoreCellMapping[];
  units: ShelfUnit[];
  zones: CategoryZone[];
};
