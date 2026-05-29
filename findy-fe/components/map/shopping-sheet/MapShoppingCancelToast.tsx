import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { StyleSheet, Text, View } from "react-native";

type MapShoppingCancelToastProps = {
  message: string;
};

export function MapShoppingCancelToast({ message }: MapShoppingCancelToastProps) {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.pill}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    maxWidth: "100%",
  },
  pill: {
    maxWidth: "100%",
    backgroundColor: COLORS.text,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  text: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.white,
    textAlign: "center",
  },
});
