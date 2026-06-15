import RecoMarkerIcon from "@/assets/icons/reco_marker.svg";
import { StyleSheet } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { MAP_OVERLAY_RECO_HEIGHT, MAP_OVERLAY_RECO_WIDTH } from "../constants";
import type { ResolvedGridMarker } from "../types";
import { pinTopLeftFromCenter } from "../utils/gridToPixel";
import { scaledMarkerSize } from "../utils/overlayScale";

type RecommendationAdMarkerLayerProps = {
  markers: ResolvedGridMarker[];
  cellPx: number;
  isMarkerSelected?: (marker: ResolvedGridMarker) => boolean;
  onMarkerPress?: (markerId: string) => void;
};

export function RecommendationAdMarkerLayer({
  markers,
  cellPx,
  isMarkerSelected,
  onMarkerPress,
}: RecommendationAdMarkerLayerProps) {
  const width = scaledMarkerSize(MAP_OVERLAY_RECO_WIDTH, cellPx);
  const height = scaledMarkerSize(MAP_OVERLAY_RECO_HEIGHT, cellPx);

  return (
    <>
      {markers.map((marker) => {
        const { x, y } = pinTopLeftFromCenter(marker.center, width, height);
        const isSelected = isMarkerSelected?.(marker) ?? false;

        return (
          <Pressable
            key={marker.id}
            onPress={() => onMarkerPress?.(marker.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${marker.name} 추천 위치`}
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.pinWrap,
              { left: x, top: y, width, height, zIndex: isSelected ? 12 : 11 },
            ]}
          >
            <RecoMarkerIcon width={width} height={height} />
          </Pressable>
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
