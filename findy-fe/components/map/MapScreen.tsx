import { StoreMapView } from "@/components/store-map";
import { MAP_FLOOR_COLOR } from "@/components/store-map/constants";
import { LAYOUT } from "@/constants/theme";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapOverlayControls } from "./MapOverlayControls";
import { useMapNavigationData } from "./useMapNavigationData";

export function MapScreen() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    navigationData,
    navigationRefreshKey,
    refreshNavigationOverlay,
  } = useMapNavigationData();

  const tabBarInset = LAYOUT.tabBarTotalHeight + insets.bottom;
  const mapFitWidth = windowWidth;
  const mapFitHeight = Math.max(1, windowHeight - tabBarInset);

  return (
    <View className="flex-1" style={{ backgroundColor: MAP_FLOOR_COLOR }}>
      <View style={styles.mapLayer}>
        <StoreMapView
          fitWidth={mapFitWidth}
          fitHeight={mapFitHeight}
          contentBottomInset={tabBarInset}
          navigationData={navigationData}
          navigationRefreshKey={navigationRefreshKey}
        />
      </View>

      <MapOverlayControls onRefreshPress={refreshNavigationOverlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  mapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
