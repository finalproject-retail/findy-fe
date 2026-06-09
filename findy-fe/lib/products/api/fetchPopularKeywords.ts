import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import type { ApiEnvelope } from "@/lib/map/types";
import { shoppingApiClient } from "@/lib/products/api/productClient";

export type PopularKeywordDto = {
  rank: number;
  keyword: string;
};

type PopularKeywordsApiData = {
  popularKeywords?: PopularKeywordDto[];
};

/** GET /api/v1/products/keywords */
export async function fetchPopularKeywords(): Promise<string[]> {
  try {
    const response = await shoppingApiClient.get<
      ApiEnvelope<PopularKeywordsApiData>
    >("/api/v1/products/keywords");

    const body = response.data;
    if (!body?.success) {
      throw new Error(body?.message ?? "인기 검색어를 불러오지 못했습니다.");
    }

    return (body.data?.popularKeywords ?? [])
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
