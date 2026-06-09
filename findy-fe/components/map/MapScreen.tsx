import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { CONGESTION_REFRESH_INTERVAL_MS } from "@/constants/beacon";
import { SEARCH_ADD_MODE_SHOPPING_LIST } from "@/constants/searchAddMode";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useMapShoppingNotifications } from "@/contexts/MapShoppingNotificationContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapOverlayControls } from "./MapOverlayControls";
import { MapShoppingToast } from "./notifications/MapShoppingToast";
import { MapShoppingBottomSheet } from "./shopping-sheet";
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
    refreshBeaconCongestion,
    tripLineItems,
    recommendedProductsById,
    pickedQuantityByProductId,
  } = useMapNavigation();
  const { activeToast, dismissActiveToast, handleNotificationPress } =
    useMapShoppingNotifications();

  const { startTracking, stopTracking } = useBeaconLocation();

  const { storeMapConfig, storeId } = useStoreMapConfig();

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
  const [selectedMarkerProductId, setSelectedMarkerProductId] = useState<
    string | null
  >(null);
  const [showCongestion, setShowCongestion] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const mapContentBottomInset = Math.max(mapBottomInset, sheetVisibleHeight);

  const suppressMapTapDismissRef = useRef(false);

  const handleDismissMarkerCallout = useCallback(() => {
    setSelectedMarkerProductId(null);
  }, []);

  const handleMarkerPress = useCallback((productId: string) => {
    suppressMapTapDismissRef.current = true;
    setSelectedMarkerProductId((prev) =>
      prev === productId ? null : productId,
    );
    requestAnimationFrame(() => {
      suppressMapTapDismissRef.current = false;
    });
  }, []);

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
});
