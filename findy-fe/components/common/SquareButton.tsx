import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";

export type SquareButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  isLoading?: boolean;
};

const baseSurfaceStyle: ViewStyle = {
  width: "100%",
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.lg,
};

export function SquareButton({
  children,
  isLoading = false,
  disabled,
  className: _className,
  style,
  ...rest
}: SquareButtonProps) {
  const isDisabled = Boolean(disabled) || isLoading;
  const backgroundColor = isDisabled ? COLORS.gray : COLORS.main;

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      disabled={isDisabled}
      className="w-full"
      style={(state) => {
        const resolved = typeof style === "function" ? style(state) : style;
        return [
          resolved,
          state.pressed && !isDisabled ? { opacity: 0.92 } : null,
        ];
      }}
    >
      <View
        className="w-full min-h-[48px] flex-row items-center justify-center rounded-md px-lg py-sm"
        style={[baseSurfaceStyle, { backgroundColor }]}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : typeof children === "string" || typeof children === "number" ? (
          <Text
            style={{
              ...pretendard(700),
              fontSize: TYPOGRAPHY.size.lg,
              lineHeight: TYPOGRAPHY.size.lg,
              color: COLORS.white,
              textAlign: "center",
              includeFontPadding: false,
              textAlignVertical: "center",
              paddingTop: 0,
              paddingBottom: 0,
              transform: [{ translateY: Platform.OS === "ios" ? -1 : 0 }],
            }}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
}
