import type { Product } from "@/components/product";
import { filterInStockProducts } from "@/components/product/isOutOfStock";
import { DEFAULT_API_STORE_ID } from "@/components/home/storeOptions";
import type { ApiEnvelope } from "@/lib/map/types";
import {
  alignProductDtoWithShoppingPrice,
  mapProductsFromApi,
} from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";
import { resolveRecommendationUserId } from "@/lib/recommendations/resolveRecommendationUserId";
import type { ProductRecommendationApiDto } from "@/lib/recommendations/types";
import { parseShoppingProductId } from "@/lib/shopping/parseShoppingProductId";
import { isAxiosError } from "axios";
import { recommendationApiClient } from "./recommendationClient";

const DEFAULT_SIZE = 9;

type ProductRecommendationListApiData = {
  recommendations?: ProductRecommendationApiDto[];
  products?: ProductRecommendationApiDto[];
};

function unwrapRecommendationItems(
  data: ProductRecommendationListApiData | undefined,
): ProductRecommendationApiDto[] {
  return data?.recommendations ?? data?.products ?? [];
}

function mapRecommendationDtoToProductDto(
  dto: ProductRecommendationApiDto,
): ProductApiDto {
  const salePrice = dto.salePrice ?? dto.originalPrice ?? 0;

  return {
    productId: dto.productId,
    productName: dto.productName,
    brandName: dto.brandName,
    imageUrl: dto.imageUrl,
    originalPrice: dto.originalPrice ?? salePrice,
    salePrice,
    stockStatus: dto.stockStatus,
  };
}

function resolveRecommendationProductId(productId: string): number | null {
  try {
    return parseShoppingProductId(productId);
  } catch {
    return null;
  }
}

function isRecommendationNotFound(error: unknown): boolean {
  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return true;
    }
    const data = error.response?.data as { code?: string } | undefined;
    return data?.code === "RECOMMENDATION_001";
  }
  return false;
}

function mapRecommendationProducts(
  items: ProductRecommendationApiDto[],
  sourceProductId: string,
): Product[] {
  const mapped = mapProductsFromApi(
    items.map(mapRecommendationDtoToProductDto).map(alignProductDtoWithShoppingPrice),
  ).filter((product): product is Product => product != null);

  return filterInStockProducts(mapped).filter(
    (product) => product.id !== sourceProductId,
  );
}

async function fetchRecommendationList(
  path: string,
  params: Record<string, string | number>,
  sourceProductId: string,
): Promise<Product[]> {
  try {
    const response = await recommendationApiClient.get<
      ApiEnvelope<ProductRecommendationListApiData>
    >(path, { params });

    const body = response.data;
    if (!body?.success) {
      if (body?.code === "RECOMMENDATION_001") {
        return [];
      }
      throw new Error(body?.message ?? "상품 추천을 불러오지 못했습니다.");
    }

    return mapRecommendationProducts(
      unwrapRecommendationItems(body.data),
      sourceProductId,
    );
  } catch (error) {
    if (isRecommendationNotFound(error)) {
      return [];
    }
    throw error;
  }
}

/** GET /api/v1/recommendations/products/{productId}/related */
export async function fetchRelatedProductRecommendations(
  productId: string,
  size: number = DEFAULT_SIZE,
): Promise<Product[]> {
  const apiProductId = resolveRecommendationProductId(productId);
  if (apiProductId == null) {
    return [];
  }

  return fetchRecommendationList(
    `/api/v1/recommendations/products/${apiProductId}/related`,
    {
      userId: resolveRecommendationUserId(),
      size,
    },
    String(apiProductId),
  );
}

/** GET /api/v1/recommendations/products/{productId}/substitutes */
export async function fetchSubstituteProductRecommendations(
  productId: string,
  storeId: number = DEFAULT_API_STORE_ID,
  size: number = DEFAULT_SIZE,
): Promise<Product[]> {
  const apiProductId = resolveRecommendationProductId(productId);
  if (apiProductId == null) {
    return [];
  }

  return fetchRecommendationList(
    `/api/v1/recommendations/products/${apiProductId}/substitutes`,
    {
      userId: resolveRecommendationUserId(),
      storeId,
      size,
    },
    String(apiProductId),
  );
}
