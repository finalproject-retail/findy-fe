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
  sessionId: number;
  answer: string;
  shoppingContext?: ChatbotShoppingContextDto | null;
  recipeRecommendation?: ChatbotRecipeRecommendationDto | null;
  ragContext?: Record<string, unknown> | null;
  status?: string;
  failureType?: string | null;
};

export type ChatbotSessionApiDto = {
  sessionId: number;
  title: string;
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type ChatbotSessionsApiData = {
  sessions: ChatbotSessionApiDto[];
};

export type ChatbotHistoryMessageApiDto = {
  senderType: string;
  message: string;
  intent?: string | null;
  createdAt: string;
};

export type ChatbotSessionMessagesApiData = {
  sessionId: number;
  messages: ChatbotHistoryMessageApiDto[];
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
