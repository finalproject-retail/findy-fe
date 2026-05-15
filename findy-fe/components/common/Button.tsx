import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type ViewStyle,
} from "react-native";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";

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
      style={(state) => {
        const resolved =
          typeof style === "function" ? style(state) : style;
        return [
          basePressableStyle,
          isDisabled ? { opacity: 0.6 } : null,
          resolved,
          state.pressed && !isDisabled ? { opacity: 0.92 } : null,
        ];
      }}
    >
      {busy ? (
        <ActivityIndicator color={COLORS.white} />
      ) : typeof children === "string" || typeof children === "number" ? (
        <Text
          style={{
            fontFamily: TYPOGRAPHY.family,
            fontSize: TYPOGRAPHY.size.lg,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.white,
            textAlign: "center",
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
