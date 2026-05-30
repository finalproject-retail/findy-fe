import type { Product } from "@/components/product";
import type { ProductSortType } from "@/components/search/searchTypes";
import type { ApiEnvelope } from "@/lib/map/types";
import { mapSearchSortParams } from "@/lib/products/api/mapSearchSortParams";
import { mapProductsFromApi } from "@/lib/products/mapProductFromApi";
import type { ProductApiDto } from "@/lib/products/types";
import { shoppingApiClient } from "./productClient";

export const PRODUCT_SEARCH_PAGE_SIZE = 20;

export type ProductSearchResult = {
  products: Product[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

type ProductSearchApiData = {
  products?: ProductApiDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  first?: boolean;
  last?: boolean;
};

export type FetchProductSearchParams = {
  keyword: string;
  sort?: ProductSortType;
  page?: number;
  size?: number;
};

export async function fetchProductSearch({
  keyword,
  sort = "popularity",
  page = 0,
  size = PRODUCT_SEARCH_PAGE_SIZE,
}: FetchProductSearchParams): Promise<ProductSearchResult> {
  const trimmed = keyword.trim();
  if (!trimmed) {
    return {
      products: [],
      page: 0,
      size,
      totalElements: 0,
      totalPages: 0,
      first: true,
      last: true,
    };
  }

  const { sortBy, direction } = mapSearchSortParams(sort);

  const response = await shoppingApiClient.get<ApiEnvelope<ProductSearchApiData>>(
    "/api/v1/products",
    {
      params: {
        keyword: trimmed,
        page,
        size,
        ...(sortBy ? { sortBy, direction } : {}),
      },
    },
  );

  const body = response.data;
  if (!body?.success) {
    throw new Error(body?.message ?? "상품 검색에 실패했습니다.");
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
