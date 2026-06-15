import { StoreMapView } from "@/components/store-map";
import type { MapMarkerSelectionKind } from "@/components/store-map/overlays/types";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { CONGESTION_REFRESH_INTERVAL_MS } from "@/constants/beacon";
import { SEARCH_ADD_MODE_SHOPPING_LIST } from "@/constants/searchAddMode";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapOverlayControls } from "./MapOverlayControls";
import { MapShoppingToast } from "./notifications/MapShoppingToast";
import { MapShoppingBottomSheet } from "./shopping-sheet";
import {
  getSheetCollapsedBottomLift,
  getSheetCollapsedPeekHeight,
  getSheetMapBottomInset,
} from "./shopping-sheet/constants";

const SHOW_MAP_DEV_PANEL = false;

export function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    navigationData,
    routeSnapshot,
    navigationRefreshKey,
    refreshNavigationOverlay,
    refreshBeaconCongestion,
    refreshPromotionMarkers,
    tripLineItems,
    tripZoneItems,
    recommendedProductsById,
    pickedQuantityByProductId,
    ensureRecommendedProduct,
  } = useMapNavigation();
  const { activeToast, dismissActiveToast, handleNotificationPress } =
    useMapShoppingNotifications();

  const {
    startTracking,
    stopTracking,
    currentGridId,
    lastError,
    isScanning,
    scanLogCount,
    exportScanCsv,
    clearScanLog,
  } = useBeaconLocation();

  const {
    storeMapConfig,
    storeId,
    isLoading: isMapConfigLoading,
    error: mapConfigError,
  } = useStoreMapConfig();

  const startTrackingRef = useRef(startTracking);
  const stopTrackingRef = useRef(stopTracking);

  startTrackingRef.current = startTracking;
  stopTrackingRef.current = stopTracking;

  // map-config 로드 등으로 startTracking 참조가 바뀌어도 BLE를 끄지 않도록 deps 비움
  useFocusEffect(
    useCallback(() => {
      void startTrackingRef.current().catch(() => { });
      return () => {
        stopTrackingRef.current();
      };
    }, []),
  );

  const pickedMarkerIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of tripLineItems) {
      const picked = pickedQuantityByProductId[item.productId] ?? 0;
      if (picked >= item.quantity) {
        ids.add(item.productId);
      }
    }
    return ids;
  }, [tripLineItems, pickedQuantityByProductId]);

  const collapsedPeekHeight = getSheetCollapsedPeekHeight(insets.bottom);
  const collapsedBottomLift = getSheetCollapsedBottomLift(insets.bottom);
  const mapBottomInset = getSheetMapBottomInset(insets.bottom);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });
  const [sheetVisibleHeight, setSheetVisibleHeight] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState<{
    productId: string;
    kind: MapMarkerSelectionKind;
  } | null>(null);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const mapContentBottomInset = Math.max(mapBottomInset, sheetVisibleHeight);

  const suppressMapTapDismissRef = useRef(false);

  const handleDismissMarkerCallout = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const markerPressBusyRef = useRef(false);

  const handleShoppingMarkerPress = useCallback((productId: string) => {
    if (markerPressBusyRef.current) {
      return;
    }
    markerPressBusyRef.current = true;
    suppressMapTapDismissRef.current = true;
    setSelectedMarker((prev) =>
      prev?.productId === productId && prev.kind === "shopping"
        ? null
        : { productId, kind: "shopping" },
    );
    requestAnimationFrame(() => {
      suppressMapTapDismissRef.current = false;
      markerPressBusyRef.current = false;
    });
  }, []);

  const handleRecommendedMarkerPress = useCallback(
    (productId: string) => {
      if (markerPressBusyRef.current) {
        return;
      }
      markerPressBusyRef.current = true;
      suppressMapTapDismissRef.current = true;
      setSelectedMarker((prev) => {
        if (prev?.productId === productId && prev.kind === "recommended") {
          return null;
        }
        void ensureRecommendedProduct(productId);
        return { productId, kind: "recommended" };
      });
      requestAnimationFrame(() => {
        suppressMapTapDismissRef.current = false;
        markerPressBusyRef.current = false;
      });
    },
    [ensureRecommendedProduct],
  );

  const handleMapTapDismiss = useCallback(() => {
    if (suppressMapTapDismissRef.current) return;
    handleDismissMarkerCallout();
  }, [handleDismissMarkerCallout]);

  const handleToastPress = useCallback(async () => {
    if (!activeToast) {
      return;
    }

    const productId = await handleNotificationPress(activeToast);
    dismissActiveToast();
    if (productId) {
      router.push(`/product/${productId}` as Href);
    }
  }, [activeToast, dismissActiveToast, handleNotificationPress, router]);

  useEffect(() => {
    void refreshPromotionMarkers(storeMapConfig.cols);
  }, [refreshPromotionMarkers, storeMapConfig.cols]);

  useEffect(() => {
    if (!showCongestion) {
      return;
    }

    void refreshBeaconCongestion(storeId);

    const intervalId = setInterval(() => {
      void refreshBeaconCongestion(storeId);
    }, CONGESTION_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [showCongestion, storeId, refreshBeaconCongestion]);

  const mapOverlayControlProps = {
    onSearchPress: () =>
      router.push({
        pathname: "/search",
        params: { addMode: SEARCH_ADD_MODE_SHOPPING_LIST },
      } as Href),
    onBellPress: () => router.push("/notifications" as Href),
    showCongestion,
    showRoute,
    storeCongestionLevel: navigationData.storeCongestionLevel,
    onToggleCongestion: () => setShowCongestion((v) => !v),
    onToggleRoute: () => setShowRoute((v) => !v),
    onRefreshPress: () => {
      handleDismissMarkerCallout();
      void refreshNavigationOverlay(storeId, storeMapConfig.cols);
    },
  };

  return (
    <View style={styles.root}>
      <View
        style={styles.mapArea}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width > 0 && height > 0) {
            setMapLayout({ width, height });
          }
        }}
      >
        {mapLayout.height > 0 ? (
          <StoreMapView
            storeMapConfig={storeMapConfig}
            fitWidth={mapLayout.width}
            fitHeight={mapLayout.height}
            contentBottomInset={mapContentBottomInset}
            navigationData={navigationData}
            routeSnapshot={routeSnapshot}
            navigationRefreshKey={navigationRefreshKey}
            pickedMarkerIds={pickedMarkerIds}
            pickedQuantityByProductId={pickedQuantityByProductId}
            selectedMarkerProductId={selectedMarker?.productId ?? null}
            selectedMarkerKind={selectedMarker?.kind ?? null}
            tripLineItems={tripLineItems}
            tripZoneItems={tripZoneItems}
            recommendedProductsById={recommendedProductsById}
            onShoppingMarkerPress={handleShoppingMarkerPress}
            onRecommendedMarkerPress={handleRecommendedMarkerPress}
            onMapTapDismiss={handleMapTapDismiss}
            onDismissMarkerCallout={handleDismissMarkerCallout}
            showCongestion={showCongestion}
            showRoute={showRoute}
          />
        ) : null}
      </View>

      <View style={styles.sheetHost} pointerEvents="box-none">
        <MapShoppingBottomSheet
          peekHeight={collapsedPeekHeight}
          collapsedBottomLift={collapsedBottomLift}
          onVisibleHeightChange={setSheetVisibleHeight}
          onDismissProductCallout={handleDismissMarkerCallout}
        />
      </View>

      <View style={styles.mapOverlayHost} pointerEvents="box-none">
        <MapOverlayControls {...mapOverlayControlProps} />
      </View>

      {activeToast ? (
        <MapShoppingToast
          notification={activeToast}
          onDismiss={dismissActiveToast}
          onPress={() => void handleToastPress()}
        />
      ) : null}

      {__DEV__ && SHOW_MAP_DEV_PANEL ? (
        <View
          style={[
            styles.devBeaconHost,
            { bottom: mapContentBottomInset + insets.bottom + 8 },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.devBeaconPanel} pointerEvents="auto">
            <Text style={styles.devBeaconText}>
              map-config{" "}
              {isMapConfigLoading ? "…" : mapConfigError ? "ERR" : "OK"}
              {mapConfigError ? `\n${mapConfigError}` : ""}
              {"\n"}
              BLE {isScanning ? "ON" : "OFF"} · grid {currentGridId ?? "-"} ·
              CSV {scanLogCount}건{lastError ? `\n${lastError}` : ""}
            </Text>
            <View style={styles.devBeaconActions}>
              <Pressable
                style={styles.devBeaconButton}
                onPress={() => void exportScanCsv()}
                hitSlop={8}
              >
                <Text style={styles.devBeaconButtonText}>CSV 공유</Text>
              </Pressable>
              <Pressable
                style={styles.devBeaconButton}
                onPress={clearScanLog}
                hitSlop={8}
              >
                <Text style={styles.devBeaconButtonText}>버퍼 비우기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MAP_FLOOR_COLOR,
  },
  mapArea: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflow: "hidden",
  },
  sheetHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  mapOverlayHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  devBeaconHost: {
    position: "absolute",
    left: 8,
    right: 8,
    zIndex: 1000,
    elevation: 12,
  },
  devBeaconPanel: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 10,
  },
  devBeaconText: {
    color: "#fff",
    fontSize: 11,
    marginBottom: 6,
  },
  devBeaconActions: {
    flexDirection: "row",
    gap: 8,
  },
  devBeaconButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
  },
  devBeaconButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
});
