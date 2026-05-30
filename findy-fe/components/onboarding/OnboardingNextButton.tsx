import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
} from "react-native";

type Props = Omit<PressableProps, "children"> & {
  label?: string;
  isLoading?: boolean;
};

export function OnboardingNextButton({
  label = "다음으로",
  isLoading = false,
  disabled,
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled) || isLoading;

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => ({
        opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
      })}
    >
      <View
        style={{
          width: "100%",
          minHeight: 52,
          borderRadius: RADIUS.full,
          backgroundColor: COLORS.text,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text
            style={{
              ...pretendard(600),
              fontSize: TYPOGRAPHY.size.lg,
              color: COLORS.white,
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
