import type { CartZoneItem } from "@/components/category";
import { addCategoryShoppingListItem } from "@/lib/shopping/api";
import { mapShoppingListApiToCategoryLineItems } from "@/lib/shopping/mappers";
import type { ShoppingListApi, TripZoneLineItem } from "@/lib/shopping/types";

type AddZonesToShoppingListResult = {
  shoppingList: ShoppingListApi;
  zoneLines: TripZoneLineItem[];
};

/** 선택한 구역을 백엔드 쇼핑리스트 카테고리 항목으로 저장합니다. */
export async function addZonesToShoppingList(
  zones: CartZoneItem[],
  existingShoppingList?: ShoppingListApi | null,
): Promise<AddZonesToShoppingListResult> {
  if (zones.length === 0) {
    throw new Error("쇼핑리스트에 담을 구역이 없습니다.");
  }

  let shoppingList = existingShoppingList ?? null;

  for (const zone of zones) {
    shoppingList = await addCategoryShoppingListItem({
      categoryId: zone.categoryId,
      categoryName: zone.label,
      quantity: 1,
    });
  }

  if (shoppingList == null) {
    throw new Error("쇼핑리스트를 생성하지 못했습니다.");
  }

  return {
    shoppingList,
    zoneLines: mapShoppingListApiToCategoryLineItems(shoppingList),
  };
}