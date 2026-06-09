import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { shoppingApiClient } from "@/lib/products/api/productClient";

export type PopularKeywordDto = {
  rank: number;
  keyword: string;
  score?: number;
};

type PopularKeywordsApiData = {
  keywords?: PopularKeywordDto[];
  popularKeywords?: PopularKeywordDto[];
};

const DEFAULT_TRENDING_LIMIT = 10;

function unwrapPopularKeywords(data: PopularKeywordsApiData | undefined) {
  return data?.keywords ?? data?.popularKeywords ?? [];
}

/** GET /api/v1/search-keywords/trending */
export async function fetchPopularKeywords(
  limit = DEFAULT_TRENDING_LIMIT,
): Promise<string[]> {
  try {
    const response = await shoppingApiClient.get<
      ApiEnvelope<PopularKeywordsApiData>
    >("/api/v1/search-keywords/trending", {
      params: { limit },
    });

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "인기 검색어를 불러오지 못했습니다.");
    }

    return unwrapPopularKeywords(body.data)
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((item) => item.keyword.trim())
      .filter((keyword) => keyword.length > 0);
  } catch (error) {
    throw new Error(
      parseApiErrorMessage(error, "인기 검색어를 불러오지 못했습니다."),
    );
  }
}
