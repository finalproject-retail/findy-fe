import type { Product } from "@/components/product/types";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";
import type {
  ChatbotProductRecommendation,
  ChatbotRecipeRecommendation,
  ChatMessage,
} from "@/lib/chatbot/types";

/**
 * 챗봇 서비스가 내려주는 상품 스냅샷의 imageUrl은 시드 데이터라서
 * 쇼핑 서비스의 실제 상품 이미지와 다를 수 있음 → 카탈로그 이미지로 교체.
 */
const catalogImageCache = new Map<string, Product["image"]>();

async function resolveCatalogImage(
  productId: string,
): Promise<Product["image"] | null> {
  const cached = catalogImageCache.get(productId);
  if (cached) {
    return cached;
  }

  try {
    const detail = await fetchProductDetail(productId);
    catalogImageCache.set(productId, detail.image);
    return detail.image;
  } catch {
    return null;
  }
}

async function enrichProducts(products: Product[]): Promise<Product[]> {
  return Promise.all(
    products.map(async (product) => {
      const image = await resolveCatalogImage(product.id);
      return image ? { ...product, image } : product;
    }),
  );
}

export async function enrichChatbotProductRecommendation(
  recommendation: ChatbotProductRecommendation | undefined,
): Promise<ChatbotProductRecommendation | undefined> {
  if (!recommendation) {
    return undefined;
  }
  return {
    ...recommendation,
    products: await enrichProducts(recommendation.products),
  };
}

export async function enrichChatbotRecipeRecommendation(
  recommendation: ChatbotRecipeRecommendation | undefined,
): Promise<ChatbotRecipeRecommendation | undefined> {
  if (!recommendation) {
    return undefined;
  }
  const ingredients = await Promise.all(
    recommendation.ingredients.map(async (ingredient) => ({
      ...ingredient,
      products: await enrichProducts(ingredient.products),
    })),
  );
  return { ...recommendation, ingredients };
}

export async function enrichChatMessagesWithCatalogImages(
  messages: ChatMessage[],
): Promise<ChatMessage[]> {
  return Promise.all(
    messages.map(async (message) => {
      if (!message.productRecommendation && !message.recipeRecommendation) {
        return message;
      }

      const [productRecommendation, recipeRecommendation] = await Promise.all([
        enrichChatbotProductRecommendation(message.productRecommendation),
        enrichChatbotRecipeRecommendation(message.recipeRecommendation),
      ]);

      return { ...message, productRecommendation, recipeRecommendation };
    }),
  );
}
