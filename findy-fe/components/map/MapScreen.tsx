import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { type Href, useRouter, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapOverlayControls } from "./MapOverlayControls";
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
    navigationRefreshKey,
    refreshNavigationOverlay,
    tripLineItems,
    pickedQuantityByProductId,
  } = useMapNavigation();

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

  useFocusEffect(
    useCallback(() => {
      void startTracking().catch(() => {});
      return () => {
        stopTracking();
      };
    }, [startTracking, stopTracking]),
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

  const handleShoppingMarkerPress = useCallback((productId: string) => {
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
            fitWidth={mapLayout.width}
            fitHeight={mapLayout.height}
            contentBottomInset={mapContentBottomInset}
            navigationData={navigationData}
            navigationRefreshKey={navigationRefreshKey}
            pickedMarkerIds={pickedMarkerIds}
            selectedMarkerProductId={selectedMarkerProductId}
            tripLineItems={tripLineItems}
            onShoppingMarkerPress={handleShoppingMarkerPress}
            onMapTapDismiss={handleMapTapDismiss}
            onDismissMarkerCallout={handleDismissMarkerCallout}
            showCongestion={showCongestion}
            showRoute={showRoute}
          />
        ) : null}
        <MapOverlayControls
          onSearchPress={() => router.push("/search" as Href)}
          showCongestion={showCongestion}
          showRoute={showRoute}
          onToggleCongestion={() => setShowCongestion((v) => !v)}
          onToggleRoute={() => setShowRoute((v) => !v)}
          onRefreshPress={() => {
            handleDismissMarkerCallout();
            refreshNavigationOverlay();
          }}
        />
      </View>

      <GestureHandlerRootView style={styles.sheetHost} pointerEvents="box-none">
        <MapShoppingBottomSheet
          peekHeight={collapsedPeekHeight}
          collapsedBottomLift={collapsedBottomLift}
          onVisibleHeightChange={setSheetVisibleHeight}
          onDismissProductCallout={handleDismissMarkerCallout}
        />
      </GestureHandlerRootView>

      {__DEV__ ? (
        <View
          style={[
            styles.devBeaconHost,
            { bottom: mapContentBottomInset + insets.bottom + 8 },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.devBeaconPanel} pointerEvents="auto">
            <Text style={styles.devBeaconText}>
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
