import RecoMarkerIcon from "@/assets/icons/reco_marker.svg";
import { StyleSheet, View } from "react-native";
import { MAP_OVERLAY_RECO_HEIGHT, MAP_OVERLAY_RECO_WIDTH } from "../constants";
import type { ResolvedGridMarker } from "../types";
import { pinTopLeftFromCenter } from "../utils/gridToPixel";
import { scaledMarkerSize } from "../utils/overlayScale";

type RecommendationAdMarkerLayerProps = {
  markers: ResolvedGridMarker[];
  cellPx: number;
};

export function RecommendationAdMarkerLayer({ markers, cellPx }: RecommendationAdMarkerLayerProps) {
  const width = scaledMarkerSize(MAP_OVERLAY_RECO_WIDTH, cellPx);
  const height = scaledMarkerSize(MAP_OVERLAY_RECO_HEIGHT, cellPx);

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
            <RecoMarkerIcon width={width} height={height} />
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
