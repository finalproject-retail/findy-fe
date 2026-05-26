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
};

/** 추천(광고) — 경로 제외, 격자 한 칸 중심 */
export type RecommendedMapItem = MapGridPoint & {
  id: string;
  name: string;
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
};

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
