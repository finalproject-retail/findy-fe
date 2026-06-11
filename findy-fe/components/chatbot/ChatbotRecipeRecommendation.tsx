import {
  CHATBOT_PRODUCT_CARD_WIDTH,
  ChatbotRecommendProductCard,
} from "@/components/chatbot/ChatbotRecommendProductCard";
import { SPACING, TYPOGRAPHY } from "@/constants/theme";
import type { ChatbotRecipeRecommendation as ChatbotRecipeRecommendationModel } from "@/lib/chatbot/types";
import { pretendard } from "@/utils/pretendard";
import { FlatList, Text, View } from "react-native";

const CARD_GAP = 10;
/** 재료별로 최대 2개씩만 골라 한 줄로 노출 */
const MAX_PRODUCTS_PER_INGREDIENT = 2;

type ChatbotRecipeRecommendationProps = {
  recommendation: ChatbotRecipeRecommendationModel;
};

function pickRecipeProducts(
  ingredients: ChatbotRecipeRecommendationModel["ingredients"],
) {
  const seen = new Set<string>();
  const products: ChatbotRecipeRecommendationModel["ingredients"][number]["products"] =
    [];

  for (const ingredient of ingredients) {
    let pickedCount = 0;
    for (const product of ingredient.products) {
      if (pickedCount >= MAX_PRODUCTS_PER_INGREDIENT) {
        break;
      }
      if (seen.has(product.id)) {
        continue;
      }
      seen.add(product.id);
      products.push(product);
      pickedCount += 1;
    }
  }

  return products;
}

export function ChatbotRecipeRecommendation({
  recommendation,
}: ChatbotRecipeRecommendationProps) {
  const products = pickRecipeProducts(recommendation.ingredients);

  if (products.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: SPACING.sm, gap: SPACING.xs, maxWidth: "100%" }}>
      <Text
        className="text-text-main"
        style={{ ...pretendard(700), fontSize: TYPOGRAPHY.size.sm }}
      >
        {recommendation.recipeName} 재료 추천
      </Text>

      <FlatList
        data={products}
        keyExtractor={(item) => `recipe-product-${item.id}`}
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
