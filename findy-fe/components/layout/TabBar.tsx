import CategoryIcon from "@/assets/icons/category-icon.svg";
import CouponIcon from "@/assets/icons/coupon-icon.svg";
import HomeIcon from "@/assets/icons/home-icon.svg";
import MypageIcon from "@/assets/icons/mypage-icon.svg";
import { COLORS, LAYOUT } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image, Pressable, Text, View } from "react-native";

const TAB_ICON_SIZE = 24;
const MAP_ICON_WIDTH = 40;
const MAP_ICON_HEIGHT = 51;

const TAB_ICON_COLOR = {
  active: COLORS.charcoal,
  inactive: COLORS.subText2,
} as const;

type TabRouteName = "index" | "category" | "map" | "coupon" | "mypage";

const TAB_CONFIG: Record<
  TabRouteName,
  { label: string; Icon?: typeof HomeIcon; isCenter?: boolean }
> = {
  index: { label: "홈", Icon: HomeIcon },
  category: { label: "카테고리", Icon: CategoryIcon },
  map: { label: "매장 지도", isCenter: true },
  coupon: { label: "쿠폰", Icon: CouponIcon },
  mypage: { label: "마이페이지", Icon: MypageIcon },
};

function TabBarItem({
  label,
  Icon,
  isFocused,
  isCenter,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  label: string;
  Icon?: typeof HomeIcon;
  isFocused: boolean;
  isCenter?: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel: string;
}) {
  if (isCenter) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        className="h-tab-bar flex-1 items-center justify-center gap-1 pb-1 pt-1.5"
      >
        <View style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE }} />
        <Text className="text-xs text-main" style={pretendard(500)}>
          {label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      className="h-tab-bar flex-1 items-center justify-center gap-1 pb-1 pt-1.5"
    >
      {Icon ? (
        <Icon
          width={TAB_ICON_SIZE}
          height={TAB_ICON_SIZE}
          color={isFocused ? TAB_ICON_COLOR.active : TAB_ICON_COLOR.inactive}
        />
      ) : null}
      <Text
        className={`text-xs ${isFocused ? "text-charcoal" : "text-text-sub2"}`}
        style={pretendard(isFocused ? 500 : 400)}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({
  state,
  navigation,
  descriptors,
  insets,
}: BottomTabBarProps) {
  const bottomInset = insets.bottom;
  const mapRouteIndex = state.routes.findIndex((route) => route.name === "map");
  const mapRoute = mapRouteIndex >= 0 ? state.routes[mapRouteIndex] : null;
  const isMapFocused = state.index === mapRouteIndex;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: bottomInset,
        overflow: "visible",
        backgroundColor: COLORS.white,
      }}
    >
      {/* 탭 UI는 홈 인디케이터 위 — 아래 inset 영역은 투명 */}
      <View
        style={{
          position: "absolute",
          bottom: bottomInset,
          left: 0,
          right: 0,
          height: LAYOUT.tabBarTotalHeight,
          overflow: "visible",
        }}
      >
        <View className="absolute bottom-0 left-0 right-0 h-tab-bar flex-row border-t border-light-gray bg-white">
          {state.routes.map((route, index) => {
            const config = TAB_CONFIG[route.name as TabRouteName];
            if (!config) {
              return <View key={route.key} className="flex-1" />;
            }

            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : config.label;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            return (
              <TabBarItem
                key={route.key}
                label={label}
                Icon={config.Icon}
                isFocused={isFocused}
                isCenter={config.isCenter}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={
                  options.tabBarAccessibilityLabel ?? String(label)
                }
              />
            );
          })}
        </View>

        {mapRoute ? (
          <Pressable
            accessibilityRole="button"
            accessibilityState={isMapFocused ? { selected: true } : {}}
            accessibilityLabel="매장 지도"
            onPress={() => {
              const event = navigation.emit({
                type: "tabPress",
                target: mapRoute.key,
                canPreventDefault: true,
              });
              if (!isMapFocused && !event.defaultPrevented) {
                navigation.navigate(mapRoute.name, mapRoute.params);
              }
            }}
            onLongPress={() => {
              navigation.emit({
                type: "tabLongPress",
                target: mapRoute.key,
              });
            }}
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              marginLeft: -MAP_ICON_WIDTH / 2,
              zIndex: 10,
              overflow: "visible",
            }}
          >
            <Image
              source={require("@/assets/icons/map-icon.png")}
              style={{
                width: MAP_ICON_WIDTH,
                height: MAP_ICON_HEIGHT,
              }}
              resizeMode="contain"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
