import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Text, View } from "react-native";

type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.text,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.sm,
        zIndex: 1000,
      }}
    >
      <Text
        style={{
          ...pretendard(500),
          fontSize: TYPOGRAPHY.size.sm,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
