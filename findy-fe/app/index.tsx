import { COLORS } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";

/** 초기 진입 — 비로그인은 로그인, 로그인 상태는 홈(tabs) */
export default function Index() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={COLORS.blueText} />
      </View>
    );
  }

  return (
    <Redirect href={(isLoggedIn ? "/(tabs)" : "/(auth)/login") as Href} />
  );
}
