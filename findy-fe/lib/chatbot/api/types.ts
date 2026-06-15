import type {
  ChatbotProductRecommendation,
  ChatbotRecipeRecommendation,
} from "@/lib/chatbot/types";

export type ChatbotApiEnvelope<T> = {
  success?: boolean;
  code?: string;
  status?: string;
  message?: string;
  data?: T;
};

export type ChatbotRecipeRecommendedProductDto = {
  productId: number;
  productName: string;
  brandName?: string | null;
  imageUrl?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  discountRate?: number | null;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  stockText?: string | null;
  selected?: boolean;
  substituteEndpoint?: string | null;
};

export type ChatbotRecipeIngredientDto = {
  ingredientName: string;
  quantityText?: string | null;
  recommendedProducts?: ChatbotRecipeRecommendedProductDto[];
};

export type ChatbotRecipeRecommendationDto = {
  recipeName?: string | null;
  storeId?: number | null;
  ingredients?: ChatbotRecipeIngredientDto[];
};

export type ChatbotShoppingContextProductDto = {
  productId: number;
  brandName?: string | null;
  productName: string;
  categoryId?: number | null;
  categoryName?: string | null;
  imageUrl?: string | null;
  originalPrice?: number | null;
  salePrice?: number | null;
  discountRate?: number | null;
  saleStatus?: string | null;
  stockQuantity?: number | null;
  stockStatus?: string | null;
  stockText?: string | null;
};

export type ChatbotShoppingContextDto = {
  storeId?: number | null;
  keyword?: string | null;
  intent?: string | null;
  products?: ChatbotShoppingContextProductDto[];
};

export type ChatbotMessageResponseApiDto = {
  sessionId?: number;
  chatSessionId?: number;
  answer: string;
  shoppingContext?: ChatbotShoppingContextDto | null;
  recipeRecommendation?: ChatbotRecipeRecommendationDto | null;
  ragContext?: Record<string, unknown> | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotSessionApiDto = {
  sessionId?: number;
  chatSessionId?: number;
  /** 일부 API 응답은 id 필드만 내려줌 */
  id?: number;
  title?: string;
  lastMessage?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type NormalizedChatbotSessionApiDto = ChatbotSessionApiDto & {
  sessionId: number;
};

export type ChatbotSessionsApiData = {
  sessions: ChatbotSessionApiDto[];
};

export type ChatbotHistoryMessageApiDto = {
  chatMessageId?: number;
  senderType?: string;
  sender?: string;
  role?: string;
  message?: string;
  content?: string;
  text?: string;
  answer?: string;
  intent?: string | null;
  createdAt: string;
  recipeRecommendation?: ChatbotRecipeRecommendationDto | null;
  shoppingContext?: ChatbotShoppingContextDto | null;
};

export type ChatbotSessionMessagesApiData = {
  sessionId?: number;
  chatSessionId?: number;
  id?: number;
  messages?: ChatbotHistoryMessageApiDto[];
  chatMessages?: ChatbotHistoryMessageApiDto[];
};

export type ChatbotSttApiData = {
  text: string;
};

export type ChatbotVoiceMessageApiData = {
  transcribedText: string;
  chatbotResponse?: ChatbotMessageResponseApiDto;
  sessionId?: number;
  answer?: string;
  shoppingContext?: ChatbotShoppingContextDto | null;
  recipeRecommendation?: ChatbotRecipeRecommendationDto | null;
  ragContext?: Record<string, unknown> | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotMessageResult = {
  sessionId: number;
  answer: string;
  recipeRecommendation?: ChatbotRecipeRecommendation | null;
  productRecommendation?: ChatbotProductRecommendation | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotVoiceMessageResult = {
  sessionId: number;
  transcribedText: string;
  answer: string;
  recipeRecommendation?: ChatbotRecipeRecommendation | null;
  productRecommendation?: ChatbotProductRecommendation | null;
  status?: string;
  failureType?: string | null;
};
