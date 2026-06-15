import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { StoreMapConfig } from "../types";
import { MAP_NAVIGATION_EMPTY } from "./mock/mapNavigationEmpty";
import { BeaconHeatmapLayer } from "./layers/BeaconHeatmapLayer";
import { NavigationPathLayer } from "./layers/NavigationPathLayer";
import { RecommendationAdMarkerLayer } from "./layers/RecommendationAdMarkerLayer";
import { ShoppingItemMarkerLayer } from "./layers/ShoppingItemMarkerLayer";
import { UserLocationMarker } from "./layers/UserLocationMarker";
import {
  MapGroupedProductMarkerCallout,
  shouldUseGroupedProductCallout,
} from "./MapGroupedProductMarkerCallout";
import { MapProductMarkerCallout } from "./MapProductMarkerCallout";
import { MapZoneMarkerCallout } from "./MapZoneMarkerCallout";
import type {
  MapMarkerSelectionKind,
  NavigationRouteSnapshot,
  ResolvedGridMarker,
  StoreMapNavigationMock,
} from "./types";
import type { CartLineItem } from "@/contexts/CartContext";
import type { Product } from "@/components/product";
import type { TripZoneLineItem } from "@/lib/shopping/types";
import { MAP_OVERLAY_MARKER_HEIGHT, MAP_OVERLAY_RECO_HEIGHT } from "./constants";
import { scaledMarkerSize } from "./utils/overlayScale";
import {
  buildAisleLegsForShoppingItems,
  buildRenderableNavigationPath,
  buildRenderablePathFromLocalLegs,
} from "./utils/aislePathfinding";
import { buildNavigationPathSegmentsFromNodes } from "./utils/buildNavigationPath";
import { orderShoppingMinimumRoute } from "./utils/orderShoppingRoute";
import { orderShoppingItemsByDestinationGridIds } from "@/lib/map/pathUtils";
import {
  assertAisleCell,
  isRoutingLegComplete,
  itemsShareGridCell,
  resolveRecommendedMarkers,
  resolveShoppingMarkers,
} from "./utils/resolveGridMarkers";
import {
  findColocatedRecommendedProducts,
  findColocatedTripLines,
} from "./utils/stackedMarkerCallouts";

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
  pickedQuantityByProductId?: Record<string, number>;
  selectedMarkerProductId?: string | null;
  selectedMarkerKind?: MapMarkerSelectionKind | null;
  tripLineItems?: CartLineItem[];
  tripZoneItems?: TripZoneLineItem[];
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
  data = MAP_NAVIGATION_EMPTY,
  routeSnapshot = null,
  navigationRefreshKey = 0,
  pickedMarkerIds,
  pickedQuantityByProductId = {},
  selectedMarkerProductId = null,
  selectedMarkerKind = null,
  tripLineItems = [],
  tripZoneItems = [],
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
    if (routeSnapshot.pathNavigation?.destinationGridIds.length) {
      return orderShoppingItemsByDestinationGridIds(
        routeSnapshot.shoppingItems,
        routeSnapshot.pathNavigation.destinationGridIds,
        config.cols,
      );
    }
    return orderShoppingMinimumRoute(
      config,
      routeSnapshot.currentLocation,
      routeSnapshot.shoppingItems,
    );
  }, [config, routeSnapshot]);

  const [activeLegIndex, setActiveLegIndex] = useState(0);

  const renderablePath = useMemo(() => {
    if (!routeSnapshot || routeOrder.length === 0) {
      return { nodes: [], legEndIndices: [] };
    }
    if (routeSnapshot.pathNavigation) {
      return buildRenderableNavigationPath(
        routeSnapshot.pathNavigation,
        config,
      );
    }
    const localLegs = buildAisleLegsForShoppingItems(
      config,
      routeSnapshot.currentLocation,
      routeOrder,
    );
    return buildRenderablePathFromLocalLegs(localLegs, config);
  }, [config, routeSnapshot, routeOrder]);

  const navigationLegCount = useMemo(() => {
    if (routeSnapshot?.pathNavigation?.legs.length) {
      return routeSnapshot.pathNavigation.legs.length;
    }
    return renderablePath.legEndIndices.length;
  }, [
    renderablePath.legEndIndices.length,
    routeSnapshot?.pathNavigation?.legs.length,
  ]);

  const maxLegIndex = Math.max(0, navigationLegCount - 1);

  useEffect(() => {
    setActiveLegIndex((prev) => Math.min(prev, maxLegIndex));
  }, [maxLegIndex]);

  useEffect(() => {
    setActiveLegIndex(0);
  }, [navigationRefreshKey]);

  useEffect(() => {
    if (activeLegIndex >= routeOrder.length) return;
    const target = routeOrder[activeLegIndex];
    if (
      isRoutingLegComplete(
        data.currentLocation,
        target,
        pickedQuantityByProductId,
      )
    ) {
      setActiveLegIndex((prev) => Math.min(prev + 1, maxLegIndex));
    }
  }, [
    activeLegIndex,
    data.currentLocation,
    maxLegIndex,
    pickedQuantityByProductId,
    routeOrder,
  ]);

  const advanceNavigationLeg = useCallback(() => {
    setActiveLegIndex((prev) => Math.min(prev + 1, maxLegIndex));
  }, [maxLegIndex]);

  const pathSegments = useMemo(() => {
    const isLegDashed = (legIndex: number) => {
      if (legIndex < activeLegIndex) {
        return true;
      }
      const target = routeOrder[legIndex];
      if (!target) {
        return false;
      }
      return (pickedQuantityByProductId[target.id] ?? 0) > 0;
    };

    return buildNavigationPathSegmentsFromNodes(
      renderablePath.nodes,
      cellPx,
      config,
      renderablePath.legEndIndices,
      isLegDashed,
    );
  }, [
    renderablePath,
    cellPx,
    config,
    activeLegIndex,
    routeOrder,
    pickedQuantityByProductId,
  ]);

  const shoppingMarkerItems = useMemo(() => {
    if (routeSnapshot?.shoppingItems.length) {
      return routeSnapshot.shoppingItems;
    }
    return data.shoppingItems;
  }, [data.shoppingItems, routeSnapshot?.shoppingItems]);

  const shoppingMarkers = useMemo(
    () => resolveShoppingMarkers(config, shoppingMarkerItems, cellPx),
    [cellPx, config, shoppingMarkerItems],
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

  const colocatedTripLines = useMemo(() => {
    if (
      selectedMarkerKind !== "shopping" ||
      !selectedMarkerProductId ||
      !selectedTripLine
    ) {
      return [];
    }
    return findColocatedTripLines(
      config,
      selectedMarkerProductId,
      tripLineItems,
      shoppingMarkerItems,
    );
  }, [
    config,
    selectedMarkerKind,
    selectedMarkerProductId,
    selectedTripLine,
    shoppingMarkerItems,
    tripLineItems,
  ]);

  const selectedTripZone = useMemo(() => {
    if (!selectedMarkerProductId?.startsWith("zone-")) {
      return undefined;
    }
    const categoryId = Number(selectedMarkerProductId.slice("zone-".length));
    if (!Number.isFinite(categoryId)) {
      return undefined;
    }
    return tripZoneItems.find((zone) => zone.categoryId === categoryId);
  }, [selectedMarkerProductId, tripZoneItems]);

  const selectedMarker = useMemo(
    () =>
      selectedMarkerProductId
        ? shoppingMarkers.find((marker) => marker.id === selectedMarkerProductId)
        : undefined,
    [selectedMarkerProductId, shoppingMarkers],
  );

  const recommendedMarkers = useMemo(
    () => resolveRecommendedMarkers(config, data.recommendedItems, cellPx),
    [cellPx, config, data.recommendedItems],
  );

  const isRecommendedSelection =
    selectedMarkerKind === "recommended" && selectedMarkerProductId != null;

  const selectedRecommendedMapItem = useMemo(
    () =>
      selectedMarkerProductId
        ? data.recommendedItems.find((item) => item.id === selectedMarkerProductId)
        : undefined,
    [data.recommendedItems, selectedMarkerProductId],
  );

  const selectedRecommendedMarker = useMemo(() => {
    if (!isRecommendedSelection || !selectedMarkerProductId || !selectedRecommendedMapItem) {
      return undefined;
    }

    const direct = recommendedMarkers.find(
      (marker) => marker.id === selectedMarkerProductId,
    );
    if (direct) {
      return direct;
    }

    return recommendedMarkers.find((marker) => {
      const markerItem = data.recommendedItems.find((item) => item.id === marker.id);
      return (
        markerItem != null &&
        itemsShareGridCell(selectedRecommendedMapItem, markerItem, config.cols)
      );
    });
  }, [
    config.cols,
    data.recommendedItems,
    isRecommendedSelection,
    recommendedMarkers,
    selectedMarkerProductId,
    selectedRecommendedMapItem,
  ]);

  const selectedRecommendedPinHeight = recoPinHeight;

  const colocatedRecommendedProducts = useMemo(() => {
    if (!isRecommendedSelection || !selectedMarkerProductId || !selectedRecommendedMapItem) {
      return [];
    }

    return findColocatedRecommendedProducts(
      config,
      selectedMarkerProductId,
      data.recommendedItems,
      recommendedProductsById,
    );
  }, [
    config,
    data.recommendedItems,
    isRecommendedSelection,
    recommendedProductsById,
    selectedMarkerProductId,
    selectedRecommendedMapItem,
  ]);

  const isShoppingMarkerSelected = useCallback(
    (marker: (typeof shoppingMarkers)[number]) => {
      if (!selectedMarkerProductId) {
        return false;
      }
      if (selectedMarkerProductId === marker.id) {
        return true;
      }
      const mapItem = shoppingMarkerItems.find((item) => item.id === marker.id);
      const selectedMapItem = shoppingMarkerItems.find(
        (item) => item.id === selectedMarkerProductId,
      );
      if (!mapItem || !selectedMapItem) {
        return false;
      }
      return itemsShareGridCell(selectedMapItem, mapItem, config.cols);
    },
    [config, selectedMarkerProductId, shoppingMarkerItems],
  );

  const isRecommendedMarkerSelected = useCallback(
    (marker: ResolvedGridMarker) => {
      if (!isRecommendedSelection || !selectedMarkerProductId) {
        return false;
      }
      if (selectedMarkerProductId === marker.id) {
        return true;
      }
      const mapItem = data.recommendedItems.find((item) => item.id === marker.id);
      const selectedMapItem = data.recommendedItems.find(
        (item) => item.id === selectedMarkerProductId,
      );
      if (!mapItem || !selectedMapItem) {
        return false;
      }
      return itemsShareGridCell(selectedMapItem, mapItem, config.cols);
    },
    [
      config,
      data.recommendedItems,
      isRecommendedSelection,
      selectedMarkerProductId,
    ],
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
      <ShoppingItemMarkerLayer
        markers={shoppingMarkers}
        cellPx={cellPx}
        pickedMarkerIds={pickedMarkerIds}
        isMarkerSelected={isShoppingMarkerSelected}
        onMarkerPress={onShoppingMarkerPress}
      />
      <RecommendationAdMarkerLayer
        markers={recommendedMarkers}
        cellPx={cellPx}
        isMarkerSelected={isRecommendedMarkerSelected}
        onMarkerPress={onRecommendedMarkerPress}
      />
      {selectedMarkerKind === "shopping" &&
      selectedMarker &&
      colocatedTripLines.length > 0
        ? shouldUseGroupedProductCallout(colocatedTripLines.length)
          ? (
              <MapGroupedProductMarkerCallout
                items={colocatedTripLines.map((line) => ({
                  key: line.productId,
                  product: line.product,
                  quantity: line.quantity,
                }))}
                anchor={selectedMarker.center}
                pinHeight={pinHeight}
              />
            )
          : (
              <MapProductMarkerCallout
                product={colocatedTripLines[0]!.product}
                quantity={colocatedTripLines[0]!.quantity}
                anchor={selectedMarker.center}
                pinHeight={pinHeight}
              />
            )
        : null}
      {selectedMarkerKind === "shopping" &&
      selectedTripZone &&
      selectedMarker &&
      !selectedTripLine ? (
        <MapZoneMarkerCallout
          zone={selectedTripZone}
          anchor={selectedMarker.center}
          pinHeight={pinHeight}
        />
      ) : null}
      {selectedRecommendedMarker && colocatedRecommendedProducts.length > 0
        ? shouldUseGroupedProductCallout(colocatedRecommendedProducts.length)
          ? (
              <MapGroupedProductMarkerCallout
                items={colocatedRecommendedProducts.map((product) => ({
                  key: product.id,
                  product,
                  quantity: 1,
                }))}
                anchor={selectedRecommendedMarker.center}
                pinHeight={selectedRecommendedPinHeight}
              />
            )
          : (
              <MapProductMarkerCallout
                product={colocatedRecommendedProducts[0]!}
                quantity={1}
                anchor={selectedRecommendedMarker.center}
                pinHeight={selectedRecommendedPinHeight}
              />
            )
        : null}
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
