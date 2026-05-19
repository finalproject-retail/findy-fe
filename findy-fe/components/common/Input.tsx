import { forwardRef } from "react";
import {
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { BORDER, COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";

export type InputProps = TextInputProps & {
  /** 검증 실패 시 입력 하단에 표시되는 메시지 */
  error?: string;
};

const wrapStyle: ViewStyle = {
  width: "100%",
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  {
    error,
    className: _className,
    style,
    placeholderTextColor,
    editable = true,
    ...rest
  },
  ref,
) {
  const hasError = Boolean(error);

  const fieldStyle: TextStyle = {
    width: "100%",
    borderWidth: BORDER.thin,
    borderColor: hasError ? COLORS.redText : COLORS.gray,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screen,
    paddingVertical: SPACING.md,
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.regular,
    color: COLORS.text,
    opacity: editable ? 1 : 0.55,
  };

  const errorTextStyle: TextStyle = {
    marginTop: SPACING.xs,
    fontFamily: TYPOGRAPHY.family,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.regular,
    color: COLORS.redText,
  };

  return (
    <View style={wrapStyle}>
      <TextInput
        ref={ref}
        {...rest}
        editable={editable}
        placeholderTextColor={placeholderTextColor ?? COLORS.subText2}
        style={[fieldStyle, style]}
      />
      {hasError ? <Text style={errorTextStyle}>{error}</Text> : null}
    </View>
  );
});
