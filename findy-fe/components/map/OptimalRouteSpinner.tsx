import { COLORS } from "@/constants/theme";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DOT_COUNT = 8;
const SPINNER_SIZE = 56;
const ORBIT_RADIUS = 22;
const ROTATION_MS = 1100;

/** 크기·투명도로 회전감을 주는 8개 핑크 점 */
const DOT_SCALES = [1, 0.82, 0.68, 0.58, 0.52, 0.58, 0.68, 0.82];
const DOT_OPACITIES = [1, 0.88, 0.72, 0.58, 0.48, 0.58, 0.72, 0.88];
const BASE_DOT = 10;

export function OptimalRouteSpinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: ROTATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View
      style={{
        width: SPINNER_SIZE,
        height: SPINNER_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View style={[{ width: SPINNER_SIZE, height: SPINNER_SIZE }, spinStyle]}>
        {Array.from({ length: DOT_COUNT }, (_, index) => {
          const angle = (index / DOT_COUNT) * Math.PI * 2 - Math.PI / 2;
          const size = BASE_DOT * DOT_SCALES[index]!;
          const left = SPINNER_SIZE / 2 + Math.cos(angle) * ORBIT_RADIUS - size / 2;
          const top = SPINNER_SIZE / 2 + Math.sin(angle) * ORBIT_RADIUS - size / 2;

          return (
            <View
              key={index}
              style={{
                position: "absolute",
                left,
                top,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: COLORS.main,
                opacity: DOT_OPACITIES[index],
              }}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}
