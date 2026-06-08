import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { SEARCH_ADD_MODE_SHOPPING_LIST } from "@/constants/searchAddMode";
import { type Href, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SHOPPING_NOTIFICATION_MIN_INTERVAL_MS } from "./constants";
import { MapOverlayControls } from "./MapOverlayControls";
import { MapShoppingToast } from "./notifications/MapShoppingToast";
import { MapShoppingBottomSheet } from "./shopping-sheet";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import {
  getSheetCollapsedBottomLift,
  getSheetCollapsedPeekHeight,
  getSheetMapBottomInset,
} from "./shopping-sheet/constants";

export function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const {
    navigationData,
    routeSnapshot,
    navigationRefreshKey,
    refreshNavigationOverlay,
    tripLineItems,
    recommendedProductsById,
    pickedQuantityByProductId,
    hasActiveTrip,
  } = useMapNavigation();
  const {
    activeToast,
    dismissActiveToast,
    pollShoppingRecommendationNotification,
    handleNotificationPress,
  } = useMapShoppingNotifications();

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
      void startTrackingRef.current().catch(() => {});
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
  const [selectedMarkerProductId, setSelectedMarkerProductId] = useState<
    string | null
  >(null);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const mapContentBottomInset = Math.max(mapBottomInset, sheetVisibleHeight);
  const showWebBlePanel = Platform.OS === "web";

  const suppressMapTapDismissRef = useRef(false);

  const handleDismissMarkerCallout = useCallback(() => {
    setSelectedMarkerProductId(null);
  }, []);

  const handleMarkerPress = useCallback((productId: string) => {
    suppressMapTapDismissRef.current = true;
    setSelectedMarkerProductId((prev) => (prev === productId ? null : productId));
    requestAnimationFrame(() => {
      suppressMapTapDismissRef.current = false;
    });
  }, []);

  const handleMapTapDismiss = useCallback(() => {
    if (suppressMapTapDismissRef.current) return;
    handleDismissMarkerCallout();
  }, [handleDismissMarkerCallout]);

  useEffect(() => {
    if (!hasActiveTrip) {
      return;
    }

    void pollShoppingRecommendationNotification();

    const intervalId = setInterval(() => {
      void pollShoppingRecommendationNotification();
    }, SHOPPING_NOTIFICATION_MIN_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [hasActiveTrip, pollShoppingRecommendationNotification]);

  const handleToastPress = useCallback(async () => {
    if (!activeToast) {
      return;
    }

    const productId = await handleNotificationPress(activeToast);
    dismissActiveToast();
    if (productId) {
      router.push(`/product/${productId}` as Href);
    }
  }, [
    activeToast,
    dismissActiveToast,
    handleNotificationPress,
    router,
  ]);

  const mapOverlayControlProps = {
    onSearchPress: () =>
      router.push({
        pathname: "/search",
        params: { addMode: SEARCH_ADD_MODE_SHOPPING_LIST },
      } as Href),
    onBellPress: () => router.push("/notifications" as Href),
    showCongestion,
    showRoute,
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
            selectedMarkerProductId={selectedMarkerProductId}
            tripLineItems={tripLineItems}
            recommendedProductsById={recommendedProductsById}
            onShoppingMarkerPress={handleMarkerPress}
            onRecommendedMarkerPress={handleMarkerPress}
            onMapTapDismiss={handleMapTapDismiss}
            onDismissMarkerCallout={handleDismissMarkerCallout}
            showCongestion={showCongestion}
            showRoute={showRoute}
          />
        ) : null}
      </View>

      <GestureHandlerRootView style={styles.sheetHost} pointerEvents="box-none">
        <MapShoppingBottomSheet
          peekHeight={collapsedPeekHeight}
          collapsedBottomLift={collapsedBottomLift}
          onVisibleHeightChange={setSheetVisibleHeight}
          onDismissProductCallout={handleDismissMarkerCallout}
        />
      </GestureHandlerRootView>

      <View style={styles.mapOverlayHost} pointerEvents="box-none">
        <MapOverlayControls {...mapOverlayControlProps} />
      </View>

      {showWebBlePanel ? (
        <View
          style={[
            styles.webBleHost,
            { bottom: mapContentBottomInset + insets.bottom + 8 },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.webBlePanel} pointerEvents="auto">
            <Text style={styles.webBleStatus}>
              BLE {isScanning ? "ON" : "OFF"} · grid {currentGridId ?? "-"}
              {lastError ? `\n${lastError}` : ""}
            </Text>
            <Pressable
              style={[
                styles.webBleButton,
                isScanning ? styles.webBleButtonStop : null,
              ]}
              onPress={() => {
                if (isScanning) {
                  stopTracking();
                  return;
                }
                void startTracking();
              }}
              hitSlop={8}
            >
              <Text style={styles.webBleButtonText}>
                {isScanning ? "BLE 중지" : "BLE 스캔 시작"}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {activeToast ? (
        <MapShoppingToast
          notification={activeToast}
          onDismiss={dismissActiveToast}
          onPress={() => void handleToastPress()}
        />
      ) : null}

      {__DEV__ && !showWebBlePanel ? (
        <View
          style={[
            styles.devBeaconHost,
            { bottom: mapContentBottomInset + insets.bottom + 8 },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.devBeaconPanel} pointerEvents="auto">
            <Text style={styles.devBeaconText}>
              map-config {isMapConfigLoading ? "…" : mapConfigError ? "ERR" : "OK"}
              {mapConfigError ? `\n${mapConfigError}` : ""}
              {"\n"}
              BLE {isScanning ? "ON" : "OFF"} · grid {currentGridId ?? "-"} · CSV{" "}
              {scanLogCount}건
              {lastError ? `\n${lastError}` : ""}
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
  webBleHost: {
    position: "absolute",
    left: 12,
    right: 12,
    zIndex: 950,
    elevation: 10,
    alignItems: "flex-start",
  },
  webBlePanel: {
    maxWidth: 360,
    padding: 10,
    gap: 8,
    backgroundColor: "rgba(20,20,20,0.82)",
    borderRadius: 8,
  },
  webBleStatus: {
    color: "#fff",
    fontSize: 12,
    lineHeight: 16,
  },
  webBleButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#15A06E",
    borderRadius: 6,
  },
  webBleButtonStop: {
    backgroundColor: "#D94A3A",
  },
  webBleButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
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
