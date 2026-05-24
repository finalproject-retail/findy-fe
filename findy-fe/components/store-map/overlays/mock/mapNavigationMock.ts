import type { StoreMapNavigationMock } from "../types";

/**
 * - 상품/추천: shelf 셀
 * - 현위치·비콘: aisle(통로) 셀만
 */
export const MAP_NAVIGATION_MOCK: StoreMapNavigationMock = {
  currentLocation: { gridX: 3, gridY: 6 },

  shoppingItems: [
    { id: "s1", name: "신라면", gridX: 8, gridY: 8, visitOrder: 1 },
    { id: "s2", name: "카스 맥주", gridX: 14, gridY: 9, visitOrder: 2 },
    { id: "s3", name: "우유", gridX: 24, gridY: 8, visitOrder: 3 },
  ],

  recommendedItems: [
    { id: "r1", name: "1+1 초코에몽 광고", gridX: 11, gridY: 8 },
    { id: "r2", name: "행사 할인 과자", gridX: 20, gridY: 13 },
  ],

  beaconCongestion: [
    { gridX: 19, gridY: 6, level: "HIGH" },
    { gridX: 10, gridY: 11, level: "MEDIUM" },
  ],
};
