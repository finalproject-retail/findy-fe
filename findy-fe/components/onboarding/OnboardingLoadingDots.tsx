import { COLORS } from "@/constants/theme";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const SIDE_DOT = 10;
const CENTER_DOT = 16;
const PULSE_UP = 1.4;
const PULSE_DOWN = 0.85;
const PULSE_MS = 420;
const STAGGER_MS = 180;

function Dot({
  delayMs,
  size,
}: {
  delayMs: number;
  size: number;
}) {
  const scale = useSharedValue(PULSE_DOWN);

  useEffect(() => {
    scale.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(PULSE_UP, {
            duration: PULSE_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(PULSE_DOWN, {
            duration: PULSE_MS,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [delayMs, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: COLORS.main,
        },
        animatedStyle,
      ]}
    />
  );
}

export function OnboardingLoadingDots() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        height: CENTER_DOT * PULSE_UP,
      }}
    >
      <Dot delayMs={0} size={SIDE_DOT} />
      <Dot delayMs={STAGGER_MS} size={CENTER_DOT} />
      <Dot delayMs={STAGGER_MS * 2} size={SIDE_DOT} />
    </View>
  );
}
