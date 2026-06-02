import type { ProductSortType } from "@/components/search/searchTypes";
import type { Product } from "@/components/product";
import type { ApiEnvelope } from "@/lib/map/types";
import { mapSearchSortParams } from "@/lib/products/api/mapSearchSortParams";
import { mapProductsFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";
import { shoppingApiClient } from "./productClient";

export const CATEGORY_PRODUCTS_PAGE_SIZE = 20;

type ProductPageApiData = {
  products?: ProductApiDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
};

export type CategoryProductsResult = {
  products: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type FetchProductsByCategoryParams = {
  categoryId: number;
  sort?: ProductSortType;
  page?: number;
  size?: number;
};

export async function fetchProductsByCategory({
  categoryId,
  sort = "popularity",
  page = 0,
  size = CATEGORY_PRODUCTS_PAGE_SIZE,
}: FetchProductsByCategoryParams): Promise<CategoryProductsResult> {
  const { sortBy, direction } = mapSearchSortParams(sort);

  const response = await shoppingApiClient.get<ApiEnvelope<ProductPageApiData>>(
    "/api/v1/products",
    {
      params: {
        categoryId,
        page,
        size,
        ...(sortBy ? { sortBy, direction } : {}),
      },
    },
  );

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message ?? "카테고리 상품을 불러오지 못했습니다.");
  }

  const data = body.data;
  const products = mapProductsFromApi(data?.products ?? []);

  return {
    products,
    page: data?.page ?? page,
    size: data?.size ?? size,
    totalElements: data?.totalElements ?? products.length,
    totalPages: data?.totalPages ?? (products.length > 0 ? 1 : 0),
    first: data?.first ?? page === 0,
    last: data?.last ?? true,
  };
}
