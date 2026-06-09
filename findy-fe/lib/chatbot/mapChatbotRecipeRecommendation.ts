import type {
  ChatbotMessageResponseApiDto,
  ChatbotRecipeIngredientDto,
  ChatbotRecipeRecommendedProductDto,
  ChatbotRecipeRecommendationDto,
} from "@/lib/chatbot/api/types";
import { mapChatbotProductFromDto } from "@/lib/chatbot/mapChatbotProductFromDto";
import type {
  ChatbotIngredientRecommendation,
  ChatbotRecipeRecommendation,
} from "@/lib/chatbot/types";

function sortRecipeProducts(
  products: ChatbotRecipeRecommendedProductDto[],
): ChatbotRecipeRecommendedProductDto[] {
  return products.slice().sort((a, b) => {
    const selectedDiff = Number(Boolean(b.selected)) - Number(Boolean(a.selected));
    if (selectedDiff !== 0) {
      return selectedDiff;
    }
    return 0;
  });
}

function mapIngredient(
  dto: ChatbotRecipeIngredientDto,
): ChatbotIngredientRecommendation | null {
  const ingredientName = dto.ingredientName?.trim();
  if (!ingredientName) {
    return null;
  }

  const products = sortRecipeProducts(dto.recommendedProducts ?? [])
    .map(mapChatbotProductFromDto)
    .filter((product): product is NonNullable<typeof product> => product != null);

  if (products.length === 0) {
    return null;
  }

  return {
    ingredientName,
    quantityText: dto.quantityText?.trim() ?? "",
    products,
  };
}

export function mapChatbotRecipeRecommendation(
  dto: ChatbotRecipeRecommendationDto | null | undefined,
): ChatbotRecipeRecommendation | null {
  if (!dto) {
    return null;
  }

  const ingredients = (dto.ingredients ?? [])
    .map(mapIngredient)
    .filter((item): item is ChatbotIngredientRecommendation => item != null);

  if (ingredients.length === 0) {
    return null;
  }

  return {
    recipeName: dto.recipeName?.trim() || "추천 재료",
    storeId: dto.storeId ?? undefined,
    ingredients,
  };
}

export function mapChatbotMessageRecipeRecommendation(
  dto: Pick<ChatbotMessageResponseApiDto, "recipeRecommendation">,
): ChatbotRecipeRecommendation | null {
  return mapChatbotRecipeRecommendation(dto.recipeRecommendation);
}

export function hasChatbotRecipeRecommendation(
  recommendation: ChatbotRecipeRecommendation | null | undefined,
): recommendation is ChatbotRecipeRecommendation {
  return (recommendation?.ingredients.length ?? 0) > 0;
}
