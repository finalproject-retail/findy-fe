import {
  formatStoreCongestionLabel,
  storeCongestionAccentColor,
} from "@/components/map/storeCongestionDisplay";
import { COLORS } from "@/constants/theme";
import type { GridCongestionLevelApi } from "@/lib/map/types";
import { pretendard } from "@/utils/pretendard";
import { Platform, StyleSheet, Text, View } from "react-native";

type MapStoreCongestionBadgeProps = {
  level: GridCongestionLevelApi;
};

export function MapStoreCongestionBadge({ level }: MapStoreCongestionBadgeProps) {
  const accent = storeCongestionAccentColor(level);

  return (
    <View
      style={styles.badge}
      accessibilityRole="text"
      accessibilityLabel={`매장 혼잡도 ${formatStoreCongestionLabel(level)}`}
    >
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={[styles.label, { color: accent }]}>
        {formatStoreCongestionLabel(level)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    minWidth: 64,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: {
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      },
    }),
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    ...pretendard(600),
    fontSize: 14,
    lineHeight: 18,
  },
});
