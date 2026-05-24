import { MAP_NAVIGATION_MOCK } from "@/components/store-map/overlays/mock/mapNavigationMock";
import { fetchCongestionSnapshotOnRefresh } from "@/components/store-map/overlays/mock/congestionSnapshots";
import type {
  ShoppingMapItem,
  StoreMapNavigationMock,
} from "@/components/store-map/overlays/types";
import { useCallback, useState } from "react";

/**
 * 지도 오버레이 목 데이터 + 새로고침
 * - 경로: shoppingItems / currentLocation 변경 시 재계산 (StoreMapOverlays)
 * - 혼잡도: 새로고침 버튼 시점 스냅샷으로 교체
 */
export function useMapNavigationData(
  initial: StoreMapNavigationMock = MAP_NAVIGATION_MOCK
) {
  const [navigationData, setNavigationData] = useState(initial);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);

  const refreshNavigationOverlay = useCallback(() => {
    setNavigationData((prev) => ({
      ...prev,
      beaconCongestion: fetchCongestionSnapshotOnRefresh(),
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, []);

  const updateShoppingItems = useCallback((items: ShoppingMapItem[]) => {
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: items,
    }));
  }, []);

  const patchNavigationData = useCallback(
    (patch: Partial<StoreMapNavigationMock>) => {
      setNavigationData((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  return {
    navigationData,
    navigationRefreshKey,
    refreshNavigationOverlay,
    updateShoppingItems,
    patchNavigationData,
    setNavigationData,
  };
}
