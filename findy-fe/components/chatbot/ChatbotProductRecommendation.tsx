import {
  CHATBOT_PRODUCT_CARD_WIDTH,
  ChatbotRecommendProductCard,
} from "@/components/chatbot/ChatbotRecommendProductCard";
import { SPACING, TYPOGRAPHY } from "@/constants/theme";
import type { ChatbotProductRecommendation as ChatbotProductRecommendationModel } from "@/lib/chatbot/types";
import { pretendard } from "@/utils/pretendard";
import { FlatList, Text, View } from "react-native";

const CARD_GAP = 10;

type ChatbotProductRecommendationProps = {
  recommendation: ChatbotProductRecommendationModel;
};

export function ChatbotProductRecommendation({
  recommendation,
}: ChatbotProductRecommendationProps) {
  if (recommendation.products.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: SPACING.sm, gap: SPACING.xs, maxWidth: "100%" }}>
      <Text
        className="text-text-main"
        style={{ ...pretendard(700), fontSize: TYPOGRAPHY.size.sm }}
      >
        {recommendation.title}
      </Text>

      <FlatList
        data={recommendation.products}
        keyExtractor={(item) => `chatbot-product-${item.id}`}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={CHATBOT_PRODUCT_CARD_WIDTH + CARD_GAP}
        contentContainerStyle={{ gap: CARD_GAP, paddingRight: SPACING.sm }}
        renderItem={({ item }) => <ChatbotRecommendProductCard product={item} />}
      />
    </View>
  );
}
