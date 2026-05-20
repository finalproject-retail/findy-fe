import { COLORS, RADIUS, SPACING } from "@/constants/theme";
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
      }}
    >
      <Text
        style={{
          ...pretendard(500),
          fontSize: 16,
          color: COLORS.white,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
    </View>
  );
}
