import type { CartZoneItem } from "@/components/category";
import { addCategoryShoppingListItem } from "@/lib/shopping/api";
import { cancelActiveShoppingListIfExists } from "@/lib/shopping/cancelActiveShoppingListIfExists";
import { mapShoppingListApiToCategoryLineItems } from "@/lib/shopping/mappers";
import type { ShoppingListApi, TripZoneLineItem } from "@/lib/shopping/types";

type AddZonesToShoppingListResult = {
  shoppingList: ShoppingListApi | null;
  zoneLines: TripZoneLineItem[];
};

/** 선택한 구역을 쇼핑리스트에 반영합니다. 상품 쇼핑리스트가 없으면 로컬 구역만 사용합니다. */
export async function addZonesToShoppingList(
  zones: CartZoneItem[],
  existingShoppingList?: ShoppingListApi | null,
): Promise<AddZonesToShoppingListResult> {
  if (zones.length === 0) {
    throw new Error("쇼핑리스트에 담을 구역이 없습니다.");
  }

  if (existingShoppingList == null) {
    // 백엔드 createShoppingList는 checked 장바구니 상품이 필수라 구역만으로는 생성 불가
    await cancelActiveShoppingListIfExists();
    return {
      shoppingList: null,
      zoneLines: zones.map((zone) => ({ ...zone })),
    };
  }

  let shoppingList = existingShoppingList;
  for (const zone of zones) {
    shoppingList = await addCategoryShoppingListItem(
      zone.categoryId,
      zone.label,
    );
  }

  return {
    shoppingList,
    zoneLines: mapShoppingListApiToCategoryLineItems(shoppingList),
  };
}
