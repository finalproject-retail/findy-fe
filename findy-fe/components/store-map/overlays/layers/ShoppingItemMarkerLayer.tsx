import MarkerIcon from "@/assets/icons/marker.svg";
import { StyleSheet, View } from "react-native";
import { MAP_OVERLAY_MARKER_HEIGHT, MAP_OVERLAY_MARKER_WIDTH } from "../constants";
import type { ResolvedGridMarker } from "../types";
import { pinTopLeftFromCenter } from "../utils/gridToPixel";
import { scaledMarkerSize } from "../utils/overlayScale";

type ShoppingItemMarkerLayerProps = {
  markers: ResolvedGridMarker[];
  cellPx: number;
};

export function ShoppingItemMarkerLayer({ markers, cellPx }: ShoppingItemMarkerLayerProps) {
  const width = scaledMarkerSize(MAP_OVERLAY_MARKER_WIDTH, cellPx);
  const height = scaledMarkerSize(MAP_OVERLAY_MARKER_HEIGHT, cellPx);

  return (
    <>
      {markers.map((marker) => {
        const { x, y } = pinTopLeftFromCenter(marker.center, width, height);

        return (
          <View
            key={marker.id}
            pointerEvents="none"
            style={[styles.pinWrap, { left: x, top: y, width, height }]}
            accessibilityLabel={marker.name}
          >
            <MarkerIcon width={width} height={height} />
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    position: "absolute",
  },
});
