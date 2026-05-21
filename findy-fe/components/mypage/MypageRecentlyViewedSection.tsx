import type { Product } from "@/components/product";
import { RecommendedProductCard } from "@/components/product/detail/RecommendedProductCard";
import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

const CARD_GAP = 12;

type MypageRecentlyViewedSectionProps = {
  products: Product[];
  onSeeAllPress?: () => void;
};

export function MypageRecentlyViewedSection({
  products,
  onSeeAllPress,
}: MypageRecentlyViewedSectionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = (screenWidth - SPACING.screen * 2 - CARD_GAP) / 2.7;

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: SPACING.md }}>
      <Pressable
        onPress={onSeeAllPress}
        accessibilityRole="button"
        accessibilityLabel="최근 본 상품 전체 보기"
        className="flex-row items-center justify-between"
      >
        <Text className="text-2xl text-text-main" style={pretendard(700)}>
          최근 본 상품
        </Text>
        <Text
          style={{
            ...pretendard(400),
            fontSize: 18,
            color: COLORS.subText2,
          }}
        >
          &gt;
        </Text>
      </Pressable>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: CARD_GAP }}
        renderItem={({ item }) => (
          <RecommendedProductCard product={item} width={cardWidth} />
        )}
      />
    </View>
  );
}
