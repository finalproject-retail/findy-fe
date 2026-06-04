import type { StoreMapNavigationMock } from "../types";

/**
 * - 상품/추천: shelf 셀
 * - 현위치·비콘: aisle(통로) 셀만
 */
export const MAP_NAVIGATION_MOCK: StoreMapNavigationMock = {
  /** 출입구(좌하) 근처 · 1번 매대 앞 통로 */
  currentLocation: { gridX: 1, gridY: 16 },

  shoppingItems: [
    { id: "s1", name: "신라면", gridX: 2, gridY: 0, visitOrder: 1 },
    { id: "s2", name: "카스 맥주", gridX: 17, gridY: 17, visitOrder: 2 },
    { id: "s3", name: "우유", gridX: 20, gridY: 12, visitOrder: 3 },
  ],

  recommendedItems: [],

  beaconCongestion: [
    { gridX: 19, gridY: 6, level: "HIGH" },
    { gridX: 10, gridY: 11, level: "MEDIUM" },
  ],
};
