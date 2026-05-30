import { COLORS } from "@/constants/theme";
import { View } from "react-native";

type Props = {
  /** 0 ~ 1 */
  progress: number;
};

export function OnboardingProgressBar({ progress }: Props) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      className="h-[6px] w-full overflow-hidden rounded-full"
      style={{ backgroundColor: COLORS.sub }}
    >
      <View
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          backgroundColor: COLORS.main,
        }}
      />
    </View>
  );
}
