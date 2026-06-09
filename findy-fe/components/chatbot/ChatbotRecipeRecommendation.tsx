import {
  CHATBOT_PRODUCT_CARD_WIDTH,
  ChatbotRecommendProductCard,
} from "@/components/chatbot/ChatbotRecommendProductCard";
import { SPACING, TYPOGRAPHY } from "@/constants/theme";
import type { ChatbotRecipeRecommendation as ChatbotRecipeRecommendationModel } from "@/lib/chatbot/types";
import { pretendard } from "@/utils/pretendard";
import { FlatList, Text, View } from "react-native";

const CARD_GAP = 10;

type ChatbotRecipeRecommendationProps = {
  recommendation: ChatbotRecipeRecommendationModel;
};

function IngredientProductCarousel({
  ingredientName,
  quantityText,
  products,
}: {
  ingredientName: string;
  quantityText: string;
  products: ChatbotRecipeRecommendationModel["ingredients"][number]["products"];
}) {
  return (
    <View style={{ gap: SPACING.xs }}>
      <View style={{ gap: 2 }}>
        <Text
          className="text-text-main"
          style={{ ...pretendard(600), fontSize: TYPOGRAPHY.size.sm }}
        >
          {ingredientName}
        </Text>
        {quantityText ? (
          <Text
            className="text-text-sub"
            style={{ ...pretendard(400), fontSize: TYPOGRAPHY.size.xs }}
          >
            {quantityText}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => `${ingredientName}-${item.id}`}
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

export function ChatbotRecipeRecommendation({
  recommendation,
}: ChatbotRecipeRecommendationProps) {
  if (recommendation.ingredients.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: SPACING.sm, gap: SPACING.md, maxWidth: "100%" }}>
      <Text
        className="text-text-main"
        style={{ ...pretendard(700), fontSize: TYPOGRAPHY.size.sm }}
      >
        {recommendation.recipeName} 재료 추천
      </Text>

      {recommendation.ingredients.map((ingredient) => (
        <IngredientProductCarousel
          key={ingredient.ingredientName}
          ingredientName={ingredient.ingredientName}
          quantityText={ingredient.quantityText}
          products={ingredient.products}
        />
      ))}
    </View>
  );
}
