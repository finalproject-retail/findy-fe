import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import type { TripZoneLineItem } from "@/lib/shopping/types";
import { pretendard } from "@/utils/pretendard";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { MapPixelPoint } from "./types";

export const MAP_ZONE_CALLOUT_WIDTH = 220;
const EMOJI_SIZE = 28;
const CALLOUT_INSET = SPACING.sm;
const TAIL_HEIGHT = 7;
const TAIL_WIDTH = 12;
const GAP_ABOVE_PIN = 4;
const CALLOUT_HEIGHT = 72;

type MapZoneMarkerCalloutProps = {
  zone: TripZoneLineItem;
  anchor: MapPixelPoint;
  pinHeight: number;
};

export function getZoneCalloutTotalHeight() {
  return CALLOUT_HEIGHT + TAIL_HEIGHT + GAP_ABOVE_PIN;
}

export function MapZoneMarkerCallout({
  zone,
  anchor,
  pinHeight,
}: MapZoneMarkerCalloutProps) {
  const totalHeight = getZoneCalloutTotalHeight();
  const left = anchor.x - MAP_ZONE_CALLOUT_WIDTH / 2;
  const top = anchor.y - pinHeight - totalHeight;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.anchor,
        {
          left,
          top,
          width: MAP_ZONE_CALLOUT_WIDTH,
          height: totalHeight,
        },
      ]}
    >
      <View style={styles.card}>
        <Text style={styles.emoji}>{zone.emoji}</Text>
        <View style={styles.textCol}>
          <Text numberOfLines={1} style={styles.path}>
            {zone.path}
          </Text>
          <Text numberOfLines={2} style={styles.label}>
            {zone.label}
          </Text>
        </View>
      </View>
      <View style={styles.tail} />
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    alignItems: "center",
    zIndex: 20,
  },
  card: {
    width: "100%",
    height: CALLOUT_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: CALLOUT_INSET,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {
        boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
      },
    }),
  },
  emoji: {
    fontSize: EMOJI_SIZE,
    lineHeight: EMOJI_SIZE + 4,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  path: {
    ...pretendard(400),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.subText,
    lineHeight: 18,
  },
  label: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    lineHeight: 22,
  },
  tail: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: TAIL_WIDTH / 2,
    borderRightWidth: TAIL_WIDTH / 2,
    borderTopWidth: TAIL_HEIGHT,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.white,
  },
});
