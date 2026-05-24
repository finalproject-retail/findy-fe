import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { StoreMapConfig } from "../types";
import { MAP_NAVIGATION_MOCK } from "./mock/mapNavigationMock";
import { BeaconHeatmapLayer } from "./layers/BeaconHeatmapLayer";
import { NavigationPathLayer } from "./layers/NavigationPathLayer";
import { RecommendationAdMarkerLayer } from "./layers/RecommendationAdMarkerLayer";
import { ShoppingItemMarkerLayer } from "./layers/ShoppingItemMarkerLayer";
import { UserLocationMarker } from "./layers/UserLocationMarker";
import type { StoreMapNavigationMock } from "./types";
import { splitRouteAtShoppingGoals } from "./utils/aislePathfinding";
import { buildNavigationPathSegmentsFromAisleLegs } from "./utils/buildNavigationPath";
import { orderShoppingMinimumRoute } from "./utils/orderShoppingRoute";
import {
  assertAisleCell,
  locationMatchesShoppingStop,
  resolveRecommendedMarkers,
  resolveShoppingMarkers,
} from "./utils/resolveGridMarkers";

type StoreMapOverlaysProps = {
  config: StoreMapConfig;
  cellPx: number;
  mapWidth: number;
  mapHeight: number;
  data?: StoreMapNavigationMock;
  /** 새로고침·살 상품 목록 변경 시 0으로 리셋 → 경로 재탐색 */
  navigationRefreshKey?: number;
};

export function StoreMapOverlays({
  config,
  cellPx,
  mapWidth,
  mapHeight,
  data = MAP_NAVIGATION_MOCK,
  navigationRefreshKey = 0,
}: StoreMapOverlaysProps) {
  const routeOrder = useMemo(
    () =>
      orderShoppingMinimumRoute(
        config,
        data.currentLocation,
        data.shoppingItems
      ),
    [config, data.currentLocation, data.shoppingItems]
  );

  const aisleLegs = useMemo(
    () => splitRouteAtShoppingGoals(config, data.currentLocation, routeOrder),
    [config, data.currentLocation, routeOrder]
  );

  const [activeLegIndex, setActiveLegIndex] = useState(0);

  const maxLegIndex = Math.max(0, aisleLegs.length - 1);

  useEffect(() => {
    setActiveLegIndex((prev) => Math.min(prev, maxLegIndex));
  }, [maxLegIndex]);

  useEffect(() => {
    setActiveLegIndex(0);
  }, [navigationRefreshKey, data.shoppingItems, data.currentLocation]);

  useEffect(() => {
    if (activeLegIndex >= routeOrder.length) return;
    const target = routeOrder[activeLegIndex];
    if (locationMatchesShoppingStop(data.currentLocation, target)) {
      setActiveLegIndex((prev) => Math.min(prev + 1, maxLegIndex));
    }
  }, [activeLegIndex, data.currentLocation, maxLegIndex, routeOrder]);

  const advanceNavigationLeg = useCallback(() => {
    setActiveLegIndex((prev) => Math.min(prev + 1, maxLegIndex));
  }, [maxLegIndex]);

  const pathSegments = useMemo(
    () => buildNavigationPathSegmentsFromAisleLegs(aisleLegs, cellPx, activeLegIndex),
    [aisleLegs, cellPx, activeLegIndex]
  );

  const shoppingMarkers = useMemo(
    () => resolveShoppingMarkers(config, data.shoppingItems, cellPx),
    [cellPx, config, data.shoppingItems]
  );

  const recommendedMarkers = useMemo(
    () => resolveRecommendedMarkers(config, data.recommendedItems, cellPx),
    [cellPx, config, data.recommendedItems]
  );

  useEffect(() => {
    if (!__DEV__) return;
    for (const b of data.beaconCongestion) {
      assertAisleCell(config, b.gridX, b.gridY, `beacon:${b.level}`);
    }
  }, [config, data.beaconCongestion]);

  return (
    <View
      style={[styles.root, { width: mapWidth, height: mapHeight }]}
      pointerEvents="box-none"
    >
      <BeaconHeatmapLayer
        beacons={data.beaconCongestion}
        cellPx={cellPx}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
      />
      <NavigationPathLayer
        segments={pathSegments}
        mapWidth={mapWidth}
        mapHeight={mapHeight}
        cellPx={cellPx}
      />
      <ShoppingItemMarkerLayer markers={shoppingMarkers} cellPx={cellPx} />
      <RecommendationAdMarkerLayer markers={recommendedMarkers} cellPx={cellPx} />
      <UserLocationMarker location={data.currentLocation} cellPx={cellPx} />

      {__DEV__ && activeLegIndex < maxLegIndex ? (
        <Pressable
          onPress={advanceNavigationLeg}
          style={styles.devAdvance}
          accessibilityLabel="다음 상품 도착 시뮬레이션"
          hitSlop={8}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "visible",
  },
  devAdvance: {
    position: "absolute",
    right: 4,
    bottom: 4,
    width: 28,
    height: 28,
    opacity: 0.02,
  },
});
