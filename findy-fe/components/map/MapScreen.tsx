import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { type Href, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
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
});
