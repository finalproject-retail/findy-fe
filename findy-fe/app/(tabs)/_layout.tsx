import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#111111", // 활성화된 탭 색상
        tabBarInactiveTintColor: "#9E9E9E", // 비활성화된 탭 색상
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false, // 상단 헤더 숨김 (이미 HomeScreen에서 SafeAreaView 사용 중)
      }}
    >
      <Tabs.Screen
        name="index" // app/(tabs)/index.tsx 와 매칭
        options={{
          title: "홈",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search" // (선택) app/(tabs)/search.tsx 가 있을 경우
        options={{
          title: "검색",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "search" : "search-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile" // (선택) app/(tabs)/profile.tsx 가 있을 경우
        options={{
          title: "마이",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
