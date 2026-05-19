import CategoryIcon from "@/assets/icons/category-icon.svg";
import CouponIcon from "@/assets/icons/coupon-icon.svg";
import HomeIcon from "@/assets/icons/home-icon.svg";
import MypageIcon from "@/assets/icons/mypage-icon.svg";
import { COLORS, LAYOUT } from "@/constants/theme";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICON_SIZE = 24;
const MAP_ICON_WIDTH = 43;
const MAP_ICON_HEIGHT = 54;

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
        className="h-tab-bar flex-1 items-center justify-center gap-1 pb-2 pt-1.5"
      >
        <View style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE }} />
        <Text className="font-pretendard text-xs font-medium text-main">
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
      className="h-tab-bar flex-1 items-center justify-center gap-1 pb-2 pt-1.5"
    >
      {Icon ? (
        <Icon
          width={TAB_ICON_SIZE}
          height={TAB_ICON_SIZE}
          color={isFocused ? TAB_ICON_COLOR.active : TAB_ICON_COLOR.inactive}
        />
      ) : null}
      <Text
        className={`font-pretendard text-xs ${
          isFocused
            ? "font-medium text-charcoal"
            : "font-regular text-text-sub2"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const mapRouteIndex = state.routes.findIndex((route) => route.name === "map");
  const mapRoute = mapRouteIndex >= 0 ? state.routes[mapRouteIndex] : null;
  const isMapFocused = state.index === mapRouteIndex;

  return (
    <View style={{ paddingBottom: insets.bottom, overflow: "visible" }}>
      <View
        className="relative w-full"
        style={{
          height: LAYOUT.tabBarTotalHeight,
          overflow: "visible",
          backgroundColor: COLORS.white,
        }}
      >
        <View
          className="absolute bottom-0 left-0 right-0 h-tab-bar flex-row border-t border-light-gray bg-white"
          style={{ overflow: "visible" }}
        >
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
