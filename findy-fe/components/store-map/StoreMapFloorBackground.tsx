import { FLOOR_PLAN_REFERENCE } from "@/components/store-map/data/emart-floor-plan";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = {
  width: number;
  height: number;
  mapImageUrl?: string | null;
  showImage?: boolean;
};

export function StoreMapFloorBackground({
  width,
  height,
  mapImageUrl,
  showImage = false,
}: Props) {
  const remote = mapImageUrl?.trim();

  return (
    <View style={[styles.host, { width, height }]} pointerEvents="none">
      {showImage && remote ? (
        <Image
          source={{ uri: remote }}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
          cachePolicy="memory-disk"
        />
      ) : showImage ? (
        <Image
          source={FLOOR_PLAN_REFERENCE.image}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    top: 0,
    overflow: "hidden",
  },
});
