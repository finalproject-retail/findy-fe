export type OnboardingChipOption = {
  id: string;
  label: string;
  valueIds: number[];
};

/** 온보딩 2단계 — 주로 찾는 상품 카테고리 */
export const ONBOARDING_CATEGORY_OPTIONS: OnboardingChipOption[] = [
  { id: "veg-fruit", label: "채소/과일", valueIds: [1, 2] },
  { id: "meat-seafood", label: "정육/수산", valueIds: [4, 5, 6, 7, 8, 9] },
  { id: "meal-kit", label: "밀키트/간편식", valueIds: [13, 15] },
  { id: "snacks", label: "과자/간식", valueIds: [20, 21] },
  { id: "dairy", label: "유제품", valueIds: [10, 11] },
  { id: "alcohol", label: "주류", valueIds: [32, 33, 34] },
  { id: "household", label: "생활용품", valueIds: [35, 36, 37] },
  { id: "pet", label: "반려동물 용품", valueIds: [45] },
  { id: "frozen", label: "냉장/냉동", valueIds: [14, 15, 16] },
  { id: "kids", label: "어린이", valueIds: [22, 23] },
];

/** 온보딩 3단계 — 쇼핑 스타일 (user-service seed 기준) */
export const ONBOARDING_SHOPPING_STYLE_OPTIONS: OnboardingChipOption[] = [
  { id: "single", label: "1인 가구", valueIds: [1] },
  { id: "fresh", label: "신선도 중시", valueIds: [2] },
  { id: "vegan", label: "비건", valueIds: [3] },
  { id: "family", label: "다가구", valueIds: [4] },
  { id: "value", label: "가성비", valueIds: [5] },
  { id: "fast", label: "빠른 쇼핑", valueIds: [6] },
  { id: "group", label: "단체 행사", valueIds: [7] },
  { id: "organic", label: "건강/유기농", valueIds: [8] },
];

export const ONBOARDING_LOADING_DURATION_MS = 2500;
