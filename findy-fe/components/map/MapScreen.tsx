import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useState } from "react";
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
  const insets = useSafeAreaInsets();
  const { navigationData, navigationRefreshKey, refreshNavigationOverlay } =
    useMapNavigation();

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
