import { ONBOARDING_SHOPPING_STYLE_OPTIONS } from "@/constants/onboarding";

/** 저장된 shoppingStyleId → 온보딩 칩 라벨 (예: 1 → "1인 가구") */
export function labelForShoppingStyleId(styleId: number): string | null {
  const option = ONBOARDING_SHOPPING_STYLE_OPTIONS.find((item) =>
    item.valueIds.includes(styleId),
  );
  return option?.label ?? null;
}

/**
 * 온보딩 쇼핑 스타일 설문에서 고른 항목 중 섹션 제목용 대표 라벨.
 * 여러 개 선택 시 온보딩 화면 칩 순서 기준 첫 매칭.
 */
export function resolvePrimaryShoppingStyleLabel(
  shoppingStyleIds: number[],
): string | null {
  if (shoppingStyleIds.length === 0) {
    return null;
  }

  const selected = new Set(shoppingStyleIds);

  for (const option of ONBOARDING_SHOPPING_STYLE_OPTIONS) {
    if (option.valueIds.some((id) => selected.has(id))) {
      return option.label;
    }
  }

  return labelForShoppingStyleId(shoppingStyleIds[0]!);
}
