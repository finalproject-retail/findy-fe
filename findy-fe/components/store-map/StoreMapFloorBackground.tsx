import { FLOOR_PLAN_REFERENCE } from "@/components/store-map/data/emart-floor-plan";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type Props = {
  width: number;
  height: number;
  mapImageUrl?: string | null;
};

export function StoreMapFloorBackground({ width, height, mapImageUrl }: Props) {
  const remote = mapImageUrl?.trim();

  return (
    <View style={[styles.host, { width, height }]} pointerEvents="none">
      {remote ? (
        <Image
          source={{ uri: remote }}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
          cachePolicy="memory-disk"
        />
      ) : (
        <Image
          source={FLOOR_PLAN_REFERENCE.image}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
        />
      )}
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
