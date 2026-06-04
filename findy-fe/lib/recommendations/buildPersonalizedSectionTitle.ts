/** 홈 맞춤 추천 섹션 제목 — 온보딩 쇼핑 스타일 설문 + 이름 */
export function buildPersonalizedSectionTitle(
  name: string,
  primaryShoppingStyleLabel: string | null,
): string {
  const trimmedName = name.trim() || "회원";
  const style = primaryShoppingStyleLabel?.trim();

  if (style) {
    return `🔎 ${style}인 ${trimmedName}님을 위해 골라왔어요`;
  }

  return `🔎 ${trimmedName}님을 위해 골라왔어요`;
}
