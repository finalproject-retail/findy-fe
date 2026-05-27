/** 검색 무한 스크롤 등에서 붙는 `-search-` 접미사 제거 */
export function resolveCatalogProductId(productId: string): string {
  const [base] = productId.split("-search-");
  return base ?? productId;
}
