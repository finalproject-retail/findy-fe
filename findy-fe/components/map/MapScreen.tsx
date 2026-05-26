import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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
  const insets = useSafeAreaInsets();
  const { navigationData, navigationRefreshKey, refreshNavigationOverlay } =
    useMapNavigation();
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

  const collapsedPeekHeight = getSheetCollapsedPeekHeight(insets.bottom);
  const collapsedBottomLift = getSheetCollapsedBottomLift(insets.bottom);
  const mapBottomInset = getSheetMapBottomInset(insets.bottom);
  const [mapLayout, setMapLayout] = useState({ width: 0, height: 0 });
  const [sheetVisibleHeight, setSheetVisibleHeight] = useState(0);
  const mapContentBottomInset = Math.max(mapBottomInset, sheetVisibleHeight);

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
          />
        ) : null}
        <MapOverlayControls onRefreshPress={refreshNavigationOverlay} />
      </View>

      <GestureHandlerRootView style={styles.sheetHost} pointerEvents="box-none">
        <MapShoppingBottomSheet
          peekHeight={collapsedPeekHeight}
          collapsedBottomLift={collapsedBottomLift}
          onVisibleHeightChange={setSheetVisibleHeight}
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
