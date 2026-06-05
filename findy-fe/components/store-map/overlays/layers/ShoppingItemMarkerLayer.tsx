import MarkerGreyIcon from "@/assets/icons/marker-grey.svg";
import MarkerIcon from "@/assets/icons/marker.svg";
import { Pressable, StyleSheet } from "react-native";
import { MAP_OVERLAY_MARKER_HEIGHT, MAP_OVERLAY_MARKER_WIDTH } from "../constants";
import type { ResolvedGridMarker } from "../types";
import { pinTopLeftFromCenter } from "../utils/gridToPixel";
import { scaledMarkerSize } from "../utils/overlayScale";

type ShoppingItemMarkerLayerProps = {
  markers: ResolvedGridMarker[];
  cellPx: number;
  /** 바코드 수령 완료(전량 픽)된 상품 id */
  pickedMarkerIds?: ReadonlySet<string>;
  selectedMarkerId?: string | null;
  onMarkerPress?: (markerId: string) => void;
};

export function ShoppingItemMarkerLayer({
  markers,
  cellPx,
  pickedMarkerIds,
  selectedMarkerId,
  onMarkerPress,
}: ShoppingItemMarkerLayerProps) {
  const width = scaledMarkerSize(MAP_OVERLAY_MARKER_WIDTH, cellPx);
  const height = scaledMarkerSize(MAP_OVERLAY_MARKER_HEIGHT, cellPx);

  return (
    <>
      {markers.map((marker) => {
        const { x, y } = pinTopLeftFromCenter(marker.center, width, height);
        const isPicked = pickedMarkerIds?.has(marker.id) ?? false;
        const isSelected = selectedMarkerId === marker.id;
        const PinIcon = isPicked ? MarkerGreyIcon : MarkerIcon;

        return (
          <Pressable
            key={marker.id}
            onPress={() => onMarkerPress?.(marker.id)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`${marker.name} 위치`}
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.pinWrap,
              { left: x, top: y, width, height, zIndex: isSelected ? 12 : 10 },
            ]}
          >
            <PinIcon width={width} height={height} />
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
