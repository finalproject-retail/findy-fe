import { MAP_NAVIGATION_MOCK } from "./mapNavigationMock";
import type { StoreMapNavigationMock } from "../types";

/** 홈에서 지도만 열었을 때 — 쇼핑 경로·마커 없음 */
export const MAP_NAVIGATION_EMPTY: StoreMapNavigationMock = {
  ...MAP_NAVIGATION_MOCK,
  shoppingItems: [],
  recommendedItems: [],
};
