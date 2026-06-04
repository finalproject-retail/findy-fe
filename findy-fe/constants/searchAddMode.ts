/** 지도 → 상품 검색 시 라우트에 붙이는 담기 모드 */
export const SEARCH_ADD_MODE_SHOPPING_LIST = "shopping-list";

export function isShoppingListAddModeParam(
  addMode: string | string[] | undefined,
): boolean {
  if (Array.isArray(addMode)) {
    return addMode.includes(SEARCH_ADD_MODE_SHOPPING_LIST);
  }
  return addMode === SEARCH_ADD_MODE_SHOPPING_LIST;
}
