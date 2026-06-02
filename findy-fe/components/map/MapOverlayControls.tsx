import BackIcon from "@/assets/icons/back-icon.svg";
import MapBellIcon from "@/assets/icons/map_bell.svg";
import MapMenuIcon from "@/assets/icons/map_menu.svg";
import MapSearchIcon from "@/assets/icons/map_search.svg";
import { MapLayerMenuPopover } from "@/components/map/MapLayerMenuPopover";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import {
  MAP_FLOATING_ICON_SIZE,
  MAP_OVERLAY_ACTION_GAP,
  MAP_OVERLAY_TOP_INSET,
  MAP_REFRESH_PILL_PADDING_H,
  MAP_REFRESH_PILL_PADDING_V,
} from "./constants";

const FLOATING_SHADOW: ViewStyle = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

type MapOverlayControlsProps = {
  onRefreshPress?: () => void;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onBackPress?: () => void;
  showCongestion: boolean;
  showRoute: boolean;
  onToggleCongestion: () => void;
  onToggleRoute: () => void;
};

function FloatingIconButton({
  onPress,
  accessibilityLabel,
  children,
}: {
  onPress?: () => void;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          width: MAP_FLOATING_ICON_SIZE,
          height: MAP_FLOATING_ICON_SIZE,
          borderRadius: MAP_FLOATING_ICON_SIZE / 2,
          backgroundColor: COLORS.white,
          alignItems: "center",
          justifyContent: "center",
        },
        FLOATING_SHADOW,
      ]}
    >
      {children}
    </Pressable>
  );
}

/** 지도 위에 떠 있는 뒤로가기·새로고침·검색/알림/메뉴 (헤더 아님) */
export function MapOverlayControls({
  onRefreshPress,
  onSearchPress,
  onBellPress,
  onBackPress,
  showCongestion,
  showRoute,
  onToggleCongestion,
  onToggleRoute,
}: MapOverlayControlsProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const menuPopoverTop =
    MAP_OVERLAY_TOP_INSET +
    MAP_FLOATING_ICON_SIZE * 3 +
    MAP_OVERLAY_ACTION_GAP * 2 +
    6;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.navigate("/(tabs)");
  };

  const handleBellPress = () => {
    if (onBellPress) {
      onBellPress();
      return;
    }
    router.push("/notifications");
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {menuOpen ? (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="메뉴 닫기"
        />
      ) : null}

      {menuOpen ? (
        <View
          pointerEvents="box-none"
          style={[styles.menuPopoverHost, { top: menuPopoverTop }]}
        >
          <MapLayerMenuPopover
            showCongestion={showCongestion}
            showRoute={showRoute}
            onToggleCongestion={onToggleCongestion}
            onToggleRoute={onToggleRoute}
          />
        </View>
      ) : null}

      <View
        pointerEvents="box-none"
        className="flex-row items-start"
        style={{
          paddingHorizontal: SPACING.screen,
          paddingTop: MAP_OVERLAY_TOP_INSET,
          overflow: "visible",
        }}
      >
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
          className="h-[37px] w-[37px] items-center justify-center"
        >
          <BackIcon width={25} height={25} />
        </Pressable>

        <View
          className="flex-1 items-center justify-start px-2"
          pointerEvents="box-none"
          style={{ overflow: "visible" }}
        >
          <Pressable
            onPress={onRefreshPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="경로 및 혼잡도 재탐색"
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: MAP_REFRESH_PILL_PADDING_H,
                paddingVertical: MAP_REFRESH_PILL_PADDING_V,
                borderRadius: 24,
                backgroundColor: COLORS.white,
              },
              FLOATING_SHADOW,
            ]}
          >
            <Ionicons name="refresh" size={20} color={COLORS.blueText} />
            <Text
              className="text-sm text-charcoal"
              style={[
                pretendard(500),
                { lineHeight: 20 },
                Platform.OS === "android" && { includeFontPadding: false },
              ]}
            >
              새로고침
            </Text>
          </Pressable>
        </View>

        <View
          pointerEvents="box-none"
          style={{ gap: MAP_OVERLAY_ACTION_GAP, width: MAP_FLOATING_ICON_SIZE }}
        >
          <FloatingIconButton onPress={onSearchPress} accessibilityLabel="검색">
            <MapSearchIcon width={MAP_FLOATING_ICON_SIZE} height={MAP_FLOATING_ICON_SIZE} />
          </FloatingIconButton>
          <FloatingIconButton onPress={handleBellPress} accessibilityLabel="알림">
            <MapBellIcon width={MAP_FLOATING_ICON_SIZE} height={MAP_FLOATING_ICON_SIZE} />
          </FloatingIconButton>
          <FloatingIconButton
            onPress={() => setMenuOpen((open) => !open)}
            accessibilityLabel="지도 레이어 메뉴"
          >
            <MapMenuIcon width={MAP_FLOATING_ICON_SIZE} height={MAP_FLOATING_ICON_SIZE} />
          </FloatingIconButton>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
  },
  menuPopoverHost: {
    position: "absolute",
    right: SPACING.screen,
    zIndex: 50,
  },
});
