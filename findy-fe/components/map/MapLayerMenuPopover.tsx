import ToggleOffIcon from "@/assets/icons/toggle-off.svg";
import ToggleOnIcon from "@/assets/icons/toggle-on.svg";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

const TOGGLE_WIDTH = 34;
const TOGGLE_HEIGHT = 19;
const MENU_WIDTH = 142;

type MapLayerMenuPopoverProps = {
  showCongestion: boolean;
  showRoute: boolean;
  onToggleCongestion: () => void;
  onToggleRoute: () => void;
};

function LayerToggleRow({
  label,
  enabled,
  onToggle,
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={onToggle}
        hitSlop={6}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        accessibilityLabel={`${label} ${enabled ? "켜짐" : "꺼짐"}`}
      >
        {enabled ? (
          <ToggleOnIcon width={TOGGLE_WIDTH} height={TOGGLE_HEIGHT} />
        ) : (
          <ToggleOffIcon width={TOGGLE_WIDTH} height={TOGGLE_HEIGHT} />
        )}
      </Pressable>
    </View>
  );
}

export function MapLayerMenuPopover({
  showCongestion,
  showRoute,
  onToggleCongestion,
  onToggleRoute,
}: MapLayerMenuPopoverProps) {
  return (
    <View style={styles.card} accessibilityViewIsModal>
      <LayerToggleRow
        label="혼잡도"
        enabled={showCongestion}
        onToggle={onToggleCongestion}
      />
      <LayerToggleRow label="경로" enabled={showRoute} onToggle={onToggleRoute} />
    </View>
  );
}

export const MAP_LAYER_MENU_WIDTH = MENU_WIDTH;

const styles = StyleSheet.create({
  card: {
    width: MENU_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.sm,
    gap: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
      default: {
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 38,
  },
  label: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    lineHeight: 24,
  },
});
