import { OptimalRouteSpinner } from "@/components/map/OptimalRouteSpinner";
import { SafeView } from "@/components/layout";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";

const ROUTE_GENERATION_MS = 1200;

export default function RouteGeneratingScreen() {
  const router = useRouter();
  const { generateShoppingPath } = useMapNavigation();
  const { storeId, storeMapConfig } = useStoreMapConfig();
  const generateShoppingPathRef = useRef(generateShoppingPath);
  generateShoppingPathRef.current = generateShoppingPath;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const minDelay = new Promise<void>((resolve) => {
        setTimeout(resolve, ROUTE_GENERATION_MS);
      });

      await Promise.all([
        generateShoppingPathRef.current(storeId, storeMapConfig.cols),
        minDelay,
      ]);

      if (!cancelled) {
        router.replace("/(tabs)/map");
      }
    })();

    return () => {
      cancelled = true;
    };
    // 경로 API 성공 시 context state 변경으로 generateShoppingPath 참조가 바뀌면
    // effect가 재실행되며 cancelled=true가 되어 화면 전환이 막히므로 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, storeId, storeMapConfig.cols]);

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
