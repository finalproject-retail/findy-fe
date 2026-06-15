import type { GridCongestionLevelApi, PathNavigationApi } from "@/lib/map/types";

/** 격자 좌표 (col = gridX, row = gridY, 0-index) */
export type MapGridPoint = {
  gridX: number;
  gridY: number;
};

export type CurrentLocationMock = MapGridPoint;

/** 장바구니·구매 예정 — 격자 한 칸 중심 */
export type ShoppingMapItem = MapGridPoint & {
  id: string;
  name: string;
  visitOrder: number;
  /** map-service 경로 API 목적지 격자 */
  gridId?: number;
};

/** 추천(광고)·행사 — 지도에 항상 표시, 쇼핑 경로 계산에는 미포함 */
export type RecommendedMapItem = MapGridPoint & {
  id: string;
  name: string;
  gridId?: number;
};

export type BeaconCongestionLevel = "HIGH" | "MEDIUM";

export type BeaconCongestionPoint = MapGridPoint & {
  level: BeaconCongestionLevel;
};

export type StoreMapNavigationMock = {
  currentLocation: CurrentLocationMock;
  shoppingItems: ShoppingMapItem[];
  recommendedItems: RecommendedMapItem[];
  beaconCongestion: BeaconCongestionPoint[];
  /** map-service 매장 전체 혼잡도 */
  storeCongestionLevel?: GridCongestionLevelApi | null;
};

/** 새로고침 시점의 현위치·방문 목록 — 경로 선은 이 스냅샷으로만 계산 */
export type NavigationRouteSnapshot = {
  currentLocation: CurrentLocationMock;
  shoppingItems: ShoppingMapItem[];
  /** map-service 경로 API 응답 — 있으면 로컬 pathfinding 대신 사용 */
  pathNavigation?: PathNavigationApi | null;
};

export type MapMarkerSelectionKind = "shopping" | "recommended";

export type MapPixelPoint = {
  x: number;
  y: number;
};

export type NavigationPathSegment = {
  from: MapPixelPoint;
  to: MapPixelPoint;
  variant: "dashed" | "solid";
};

export type ResolvedGridMarker = {
  id: string;
  name: string;
  center: MapPixelPoint;
};
