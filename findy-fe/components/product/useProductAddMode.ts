import { useIsShoppingListMode } from "@/contexts/MapNavigationContext";
import { isShoppingListAddModeParam } from "@/constants/searchAddMode";
import { useLocalSearchParams } from "expo-router";

/** 장바구니 vs 쇼핑리스트 담기 (지도 검색·쇼핑 시작 중) */
export function useProductAddMode(forceShoppingListMode?: boolean): boolean {
  const { addMode } = useLocalSearchParams<{ addMode?: string | string[] }>();
  const shoppingTripActive = useIsShoppingListMode();

  if (forceShoppingListMode === true) {
    return true;
  }

  return shoppingTripActive || isShoppingListAddModeParam(addMode);
}
