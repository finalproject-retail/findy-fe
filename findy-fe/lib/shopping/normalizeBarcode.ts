/** 스캐너·DB 바코드 비교용 — 공백 제거, 선행 0 통일 */
export function normalizeBarcode(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  const withoutLeadingZeros = trimmed.replace(/^0+/, "");
  return withoutLeadingZeros || "0";
}

export function barcodesMatch(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  const a = normalizeBarcode(left);
  const b = normalizeBarcode(right);
  return a.length > 0 && a === b;
}
