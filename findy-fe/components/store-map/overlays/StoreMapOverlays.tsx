import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { StoreMapConfig } from "../types";
import { MAP_NAVIGATION_MOCK } from "./mock/mapNavigationMock";
import { BeaconHeatmapLayer } from "./layers/BeaconHeatmapLayer";
import { NavigationPathLayer } from "./layers/NavigationPathLayer";
import { RecommendationAdMarkerLayer } from "./layers/RecommendationAdMarkerLayer";
import { ShoppingItemMarkerLayer } from "./layers/ShoppingItemMarkerLayer";
import { UserLocationMarker } from "./layers/UserLocationMarker";
import { MapProductMarkerCallout } from "./MapProductMarkerCallout";
import type {
  NavigationRouteSnapshot,
  StoreMapNavigationMock,
} from "./types";
import type { CartLineItem } from "@/contexts/CartContext";
import type { Product } from "@/components/product";
import { MAP_OVERLAY_MARKER_HEIGHT, MAP_OVERLAY_RECO_HEIGHT } from "./constants";
import { scaledMarkerSize } from "./utils/overlayScale";
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
  /** 새로고침 시에만 채워짐 — null이면 경로 미표시 */
  routeSnapshot?: NavigationRouteSnapshot | null;
  /** 새로고침 시 경로 진행(leg) 0으로 리셋 */
  navigationRefreshKey?: number;
  /** 바코드 수령 완료된 쇼핑 마커 id (상품 id) */
  pickedMarkerIds?: ReadonlySet<string>;
  selectedMarkerProductId?: string | null;
  tripLineItems?: CartLineItem[];
  recommendedProductsById?: Record<string, Product>;
  onShoppingMarkerPress?: (productId: string) => void;
  onRecommendedMarkerPress?: (productId: string) => void;
  showCongestion?: boolean;
  showRoute?: boolean;
};

export function StoreMapOverlays({
  config,
  cellPx,
  mapWidth,
  mapHeight,
  data = MAP_NAVIGATION_MOCK,
  routeSnapshot = null,
  navigationRefreshKey = 0,
  pickedMarkerIds,
  selectedMarkerProductId = null,
  tripLineItems = [],
  recommendedProductsById = {},
  onShoppingMarkerPress,
  onRecommendedMarkerPress,
  showCongestion = true,
  showRoute = true,
}: StoreMapOverlaysProps) {
  const routeOrder = useMemo(() => {
    if (!routeSnapshot || routeSnapshot.shoppingItems.length === 0) {
      return [];
    }
    return orderShoppingMinimumRoute(
      config,
      routeSnapshot.currentLocation,
      routeSnapshot.shoppingItems,
    );
  }, [config, routeSnapshot]);

  const aisleLegs = useMemo(() => {
    if (!routeSnapshot || routeOrder.length === 0) {
      return [];
    }
    return splitRouteAtShoppingGoals(
      config,
      routeSnapshot.currentLocation,
      routeOrder,
    );
  }, [config, routeSnapshot, routeOrder]);

  const [activeLegIndex, setActiveLegIndex] = useState(0);

  const maxLegIndex = Math.max(0, aisleLegs.length - 1);

  useEffect(() => {
    setActiveLegIndex((prev) => Math.min(prev, maxLegIndex));
  }, [maxLegIndex]);

  useEffect(() => {
    setActiveLegIndex(0);
  }, [navigationRefreshKey]);

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

  const pinHeight = scaledMarkerSize(MAP_OVERLAY_MARKER_HEIGHT, cellPx);
  const recoPinHeight = scaledMarkerSize(MAP_OVERLAY_RECO_HEIGHT, cellPx);

  const selectedTripLine = useMemo(
    () =>
      selectedMarkerProductId
        ? tripLineItems.find((item) => item.productId === selectedMarkerProductId)
        : undefined,
    [selectedMarkerProductId, tripLineItems],
  );

  const selectedMarker = useMemo(
    () =>
      selectedMarkerProductId
        ? shoppingMarkers.find((marker) => marker.id === selectedMarkerProductId)
        : undefined,
    [selectedMarkerProductId, shoppingMarkers],
  );

  const recommendedMarkers = useMemo(
    () => resolveRecommendedMarkers(config, data.recommendedItems, cellPx),
    [cellPx, config, data.recommendedItems]
  );

  const selectedRecommendedProduct = useMemo(() => {
    if (!selectedMarkerProductId || selectedTripLine) {
      return undefined;
    }
    return recommendedProductsById[selectedMarkerProductId];
  }, [recommendedProductsById, selectedMarkerProductId, selectedTripLine]);

  const selectedRecommendedMarker = useMemo(
    () =>
      selectedRecommendedProduct
        ? recommendedMarkers.find(
            (marker) => marker.id === selectedRecommendedProduct.id,
          )
        : undefined,
    [recommendedMarkers, selectedRecommendedProduct],
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
      {showCongestion ? (
        <BeaconHeatmapLayer
          beacons={data.beaconCongestion}
          cellPx={cellPx}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
        />
      ) : null}
      {showRoute && routeSnapshot ? (
        <NavigationPathLayer
          segments={pathSegments}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          cellPx={cellPx}
        />
      ) : null}
      <RecommendationAdMarkerLayer
        markers={recommendedMarkers}
        cellPx={cellPx}
        selectedMarkerId={selectedMarkerProductId}
        onMarkerPress={onRecommendedMarkerPress}
      />
      <ShoppingItemMarkerLayer
        markers={shoppingMarkers}
        cellPx={cellPx}
        pickedMarkerIds={pickedMarkerIds}
        selectedMarkerId={selectedMarkerProductId}
        onMarkerPress={onShoppingMarkerPress}
      />
      {selectedTripLine && selectedMarker ? (
        <MapProductMarkerCallout
          product={selectedTripLine.product}
          quantity={selectedTripLine.quantity}
          anchor={selectedMarker.center}
          pinHeight={pinHeight}
        />
      ) : null}
      {selectedRecommendedProduct && selectedRecommendedMarker ? (
        <MapProductMarkerCallout
          product={selectedRecommendedProduct}
          quantity={1}
          anchor={selectedRecommendedMarker.center}
          pinHeight={recoPinHeight}
        />
      ) : null}
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
