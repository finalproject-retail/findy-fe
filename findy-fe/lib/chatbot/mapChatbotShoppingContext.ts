import type {
  ChatbotMessageResponseApiDto,
  ChatbotShoppingContextDto,
} from "@/lib/chatbot/api/types";
import { mapChatbotProductFromDto } from "@/lib/chatbot/mapChatbotProductFromDto";
import type { ChatbotProductRecommendation } from "@/lib/chatbot/types";

function resolveRecommendationTitle(keyword?: string | null) {
  const trimmed = keyword?.trim();
  return trimmed ? `${trimmed} 추천` : "추천 상품";
}

export function mapChatbotShoppingProductRecommendation(
  dto: Pick<ChatbotMessageResponseApiDto, "shoppingContext">,
): ChatbotProductRecommendation | null {
  const context = dto.shoppingContext as ChatbotShoppingContextDto | null | undefined;
  const items = context?.products ?? [];

  const products = items
    .map(mapChatbotProductFromDto)
    .filter((product): product is NonNullable<typeof product> => product != null);

  if (products.length === 0) {
    return null;
  }

  return {
    title: resolveRecommendationTitle(context?.keyword),
    keyword: context?.keyword?.trim() || undefined,
    products,
  };
}

export function hasChatbotProductRecommendation(
  recommendation: ChatbotProductRecommendation | null | undefined,
): recommendation is ChatbotProductRecommendation {
  return (recommendation?.products.length ?? 0) > 0;
}
