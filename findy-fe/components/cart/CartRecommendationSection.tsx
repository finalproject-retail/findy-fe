import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";

const CARD_GAP = 12;

type CartRecommendationSectionProps = {
  products?: Product[];
};

export function CartRecommendationSection({
  products = MOCK_PRODUCTS,
}: CartRecommendationSectionProps) {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP * 2) / 2.8;

  return (
    <View style={{ paddingTop: SPACING.lg, gap: SPACING.md }}>
      <View className="flex-row items-center justify-between px-screen">
        <Text className="text-lg text-text-main" style={pretendard(700)}>
          품절되어 아쉽다면
        </Text>
        <View className="rounded-xs bg-light-gray px-2 py-0.5">
          <Text className="text-xs text-text-sub" style={pretendard(400)}>
            광고
          </Text>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => `cart-reco-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          gap: CARD_GAP,
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/product/${item.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 상세 보기`}
            style={{ width: cardWidth }}
          >
            <Image
              source={item.image}
              style={{ width: cardWidth, height: cardWidth, borderRadius: 3 }}
              contentFit="cover"
            />
          </Pressable>
        )}
      />
    </View>
  );
}
