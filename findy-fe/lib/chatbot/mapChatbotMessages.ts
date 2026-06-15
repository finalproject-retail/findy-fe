import type { ChatMessage } from "@/lib/chatbot/types";
import type { ChatbotHistoryMessageApiDto } from "@/lib/chatbot/api/types";
import {
  hasChatbotProductRecommendation,
  mapChatbotShoppingProductRecommendation,
} from "@/lib/chatbot/mapChatbotShoppingContext";
import {
  hasChatbotRecipeRecommendation,
  mapChatbotMessageRecipeRecommendation,
} from "@/lib/chatbot/mapChatbotRecipeRecommendation";

function resolveHistorySender(
  item: ChatbotHistoryMessageApiDto,
): ChatMessage["sender"] {
  const raw = item.senderType ?? item.sender ?? item.role ?? "";
  const normalized = raw.trim().toUpperCase();
  if (normalized === "USER" || normalized === "HUMAN") {
    return "user";
  }
  return "bot";
}

function resolveHistoryMessageText(item: ChatbotHistoryMessageApiDto): string {
  const candidates = [item.message, item.content, item.text, item.answer];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return "";
}

function resolveHistoryBotText(
  item: ChatbotHistoryMessageApiDto,
  recipeRecommendation: ChatMessage["recipeRecommendation"],
  productRecommendation: ChatMessage["productRecommendation"],
): string {
  const direct = resolveHistoryMessageText(item);
  if (direct) {
    return direct;
  }
  if (hasChatbotRecipeRecommendation(recipeRecommendation)) {
    return `${recipeRecommendation.recipeName} 재료를 추천해 드렸어요.`;
  }
  if (hasChatbotProductRecommendation(productRecommendation)) {
    return productRecommendation.title;
  }
  return "";
}

export function mapChatbotHistoryMessages(
  messages: ChatbotHistoryMessageApiDto[],
  sessionId: number,
): ChatMessage[] {
  const mapped: ChatMessage[] = [];

  messages.forEach((item, index) => {
    const sender = resolveHistorySender(item);
    const recipeRecommendation =
      mapChatbotMessageRecipeRecommendation(item) ?? undefined;
    const productRecommendation =
      mapChatbotShoppingProductRecommendation(item) ?? undefined;
    const text =
      sender === "user"
        ? resolveHistoryMessageText(item)
        : resolveHistoryBotText(item, recipeRecommendation, productRecommendation);

    if (!text && !recipeRecommendation && !productRecommendation) {
      return;
    }

    mapped.push({
      id: `${sessionId}-${item.chatMessageId ?? item.createdAt}-${index}`,
      sender,
      text,
      recipeRecommendation: hasChatbotRecipeRecommendation(recipeRecommendation)
        ? recipeRecommendation
        : undefined,
      productRecommendation: hasChatbotProductRecommendation(productRecommendation)
        ? productRecommendation
        : undefined,
    });
  });

  return mapped;
}
