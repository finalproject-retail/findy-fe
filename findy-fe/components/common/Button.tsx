import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";

export type ButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
  isLoading?: boolean;
};

const basePressableStyle: ViewStyle = {
  width: "100%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.main,
  borderRadius: RADIUS.full,
  paddingVertical: SPACING.lg,
  paddingHorizontal: SPACING.lg,
  minHeight: 52,
};

export function Button({
  children,
  isLoading = false,
  disabled,
  className: _className,
  style,
  ...rest
}: ButtonProps) {
  const busy = isLoading;
  const isDisabled = Boolean(disabled) || busy;

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy }}
      disabled={isDisabled}
      className="w-full"
      style={(state) => {
        const resolved =
          typeof style === "function" ? style(state) : style;
        return [
          resolved,
          state.pressed && !isDisabled ? { opacity: 0.92 } : null,
        ];
      }}
    >
      <View
        className="w-full min-h-[52px] flex-row items-center justify-center rounded-full bg-main px-lg py-lg"
        style={[
          basePressableStyle,
          isDisabled ? { opacity: 0.6 } : null,
        ]}
      >
        {busy ? (
          <ActivityIndicator color={COLORS.white} />
        ) : typeof children === "string" || typeof children === "number" ? (
          <Text
            style={{
              ...pretendard(600),
              fontSize: TYPOGRAPHY.size.lg,
              color: COLORS.white,
              textAlign: "center",
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
