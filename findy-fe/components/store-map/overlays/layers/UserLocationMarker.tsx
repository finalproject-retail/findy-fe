import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import {
  MAP_USER_DOT_SIZE_BASE,
  MAP_USER_LOCATION_COLOR,
  MAP_USER_PING_COLOR,
  MAP_USER_PING_SIZE_BASE,
} from "../constants";
import type { CurrentLocationMock } from "../types";
import { gridCellCenterToPixel } from "../utils/gridToPixel";
import { scaledUserLocationSize } from "../utils/overlayScale";

const MAP_USER_PING_SCALE_MAX = 1.45;

type UserLocationMarkerProps = {
  location: CurrentLocationMock;
  cellPx: number;
};

function NativePingRing({ size }: { size: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(MAP_USER_PING_SCALE_MAX, {
          duration: 1100,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, { duration: 0 })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1100, easing: Easing.out(Easing.ease) }),
        withTiming(0.5, { duration: 0 })
      ),
      -1,
      false
    );
  }, [opacity, scale]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.pingRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        ringStyle,
      ]}
    />
  );
}

export function UserLocationMarker({ location, cellPx }: UserLocationMarkerProps) {
  const center = gridCellCenterToPixel(location.gridX, location.gridY, cellPx);
  const dotSize = scaledUserLocationSize(MAP_USER_DOT_SIZE_BASE, cellPx);
  const pingSize = scaledUserLocationSize(MAP_USER_PING_SIZE_BASE, cellPx);
  const host = pingSize;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.wrap,
        {
          left: center.x - host / 2,
          top: center.y - host / 2,
          width: host,
          height: host,
        },
      ]}
      accessibilityLabel="현재 위치"
    >
      {Platform.OS === "web" ? (
        <View
          className="absolute rounded-full animate-ping"
          style={[
            styles.webPing,
            {
              width: pingSize,
              height: pingSize,
              borderRadius: pingSize / 2,
              backgroundColor: MAP_USER_PING_COLOR,
            },
          ]}
        />
      ) : (
        <NativePingRing size={pingSize} />
      )}
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  webPing: {
    position: "absolute",
    alignSelf: "center",
  },
  pingRing: {
    position: "absolute",
    backgroundColor: MAP_USER_PING_COLOR,
    borderWidth: 1,
    borderColor: MAP_USER_LOCATION_COLOR,
  },
  dot: {
    backgroundColor: MAP_USER_LOCATION_COLOR,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
