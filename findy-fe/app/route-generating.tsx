import { OptimalRouteSpinner } from "@/components/map/OptimalRouteSpinner";
import { SafeView } from "@/components/layout";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

const ROUTE_GENERATION_MS = 1800;

export default function RouteGeneratingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)/map");
    }, ROUTE_GENERATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-screen">
        <OptimalRouteSpinner />
        <Text
          className="mt-xl text-xl text-text-main text-center"
          style={pretendard(700)}
        >
          최적 경로 생성중...
        </Text>
      </View>
    </SafeView>
  );
}
