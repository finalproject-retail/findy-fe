import { COLORS } from "@/constants/theme";
import { useMemo } from "react";
import { View } from "react-native";

const BAR_COUNT = 16;
const MIN_BAR_HEIGHT = 4;
const MAX_BAR_HEIGHT = 22;

type VoiceWaveformProps = {
  volume: number;
  active: boolean;
};

function normalizeVolume(value: number) {
  return Math.min(1, Math.max(0, (value + 2) / 12));
}

export function VoiceWaveform({ volume, active }: VoiceWaveformProps) {
  const level = active ? normalizeVolume(volume) : 0;

  const barHeights = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const centerWeight = 1 - Math.abs(index - (BAR_COUNT - 1) / 2) / (BAR_COUNT / 2);
      const wave = 0.35 + centerWeight * 0.65;
      const height =
        MIN_BAR_HEIGHT + level * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * wave;
      return Math.max(MIN_BAR_HEIGHT, height);
    });
  }, [level]);

  return (
    <View
      className="flex-row items-center justify-center"
      style={{ gap: 3, height: MAX_BAR_HEIGHT }}
      accessibilityLabel="음성 입력 중"
    >
      {barHeights.map((height, index) => (
        <View
          key={index}
          style={{
            width: 3,
            height,
            borderRadius: 2,
            backgroundColor: active ? COLORS.main : COLORS.gray,
            opacity: active ? 0.35 + level * 0.65 : 0.35,
          }}
        />
      ))}
    </View>
  );
}
