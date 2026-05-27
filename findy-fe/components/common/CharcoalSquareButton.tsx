import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { ReactNode } from "react";
import { Pressable, Text, View, type PressableProps, type ViewStyle } from "react-native";

/** 모달 등 — SquareButton(핑크 전용)과 분리 */
export type CharcoalSquareButtonProps = Omit<PressableProps, "children"> & {
  children: ReactNode;
};

const surfaceStyle: ViewStyle = {
  width: "100%",
  minHeight: 48,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: RADIUS.md,
  paddingVertical: SPACING.sm,
  paddingHorizontal: SPACING.lg,
  backgroundColor: COLORS.charcoal,
};

export function CharcoalSquareButton({
  children,
  disabled,
  className: _className,
  style,
  ...rest
}: CharcoalSquareButtonProps) {
  const isDisabled = Boolean(disabled);

  const label =
    typeof children === "string" || typeof children === "number" ? (
      <Text
        style={{
          ...pretendard(700),
          fontSize: TYPOGRAPHY.size.lg,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
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
      <View style={surfaceStyle}>{label}</View>
    </Pressable>
  );
}
