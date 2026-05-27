import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";

type MapShoppingSheetFooterButtonProps = Omit<
  PressableProps,
  "children" | "style"
> & {
  children: ReactNode;
  variant: "outline" | "primary";
};

/**
 * 지도 쇼핑 바텀시트 전용 — 배경은 Pressable이 아니라 내부 View에 (Android/Web 안정)
 */
export function MapShoppingSheetFooterButton({
  children,
  variant,
  disabled,
  ...rest
}: MapShoppingSheetFooterButtonProps) {
  const isDisabled = Boolean(disabled);
  const label =
    typeof children === "string" || typeof children === "number" ? (
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={[
          styles.label,
          variant === "outline" ? styles.labelOutline : styles.labelPrimary,
        ]}
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pressable,
        isDisabled && styles.pressableDisabled,
        pressed && !isDisabled ? styles.pressablePressed : null,
      ]}
    >
      <View
        style={[
          styles.surface,
          variant === "outline" ? styles.surfaceOutline : styles.surfacePrimary,
        ]}
      >
        {label}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: "stretch",
    width: "100%",
  },
  pressableDisabled: {
    opacity: 0.55,
  },
  pressablePressed: {
    opacity: 0.92,
  },
  surface: {
    minHeight: 48,
    width: "100%",
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  surfaceOutline: {
    backgroundColor: COLORS.white,
    borderWidth: BORDER.base,
    borderColor: COLORS.gray,
  },
  surfacePrimary: {
    backgroundColor: COLORS.main,
    borderWidth: 0,
  },
  label: {
    ...pretendard(700),
    textAlign: "center",
  },
  labelOutline: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.subText,
  },
  labelPrimary: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.white,
  },
});
