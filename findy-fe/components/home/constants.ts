export { SHOPPING_API_MAX_SECTION_SIZE } from "@/lib/products/constants";

/** 홈 화면 섹션별 상품 노출 개수 */
export const HOME_SECTION_LIMITS = {
  newProducts: 9,
  popularProducts: 5,
  onboardingRecommend: 9,
  findyRecommend: {
    initial: 6,
    loadMore: 6,
  },
} as const;
