import { SafeView } from "@/components/layout";
import { Text, View } from "react-native";

export default function CouponScreen() {
  return (
    <SafeView>
      <View className="flex-1 items-center justify-center">
        <Text className="font-pretendard text-lg text-text-sub">쿠폰</Text>
      </View>
    </SafeView>
  );
}
