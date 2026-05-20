import { TabBar } from "@/components/layout";
import { LAYOUT } from "@/constants/theme";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: "transparent" }} />
        ),
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "visible",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          height: LAYOUT.tabBarTotalHeight + insets.bottom,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="category" options={{ title: "카테고리" }} />
      <Tabs.Screen name="map" options={{ title: "매장 지도" }} />
      <Tabs.Screen name="coupon" options={{ title: "쿠폰" }} />
      <Tabs.Screen name="mypage" options={{ title: "마이페이지" }} />
    </Tabs>
  );
}
