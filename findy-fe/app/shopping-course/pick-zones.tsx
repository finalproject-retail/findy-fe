import { Header } from "@/components/common";
import {
  CATEGORY_TREE,
  buildCartZoneItem,
  CategorySidebar,
} from "@/components/category";
import { SafeView } from "@/components/layout";
import {
  ZonePickFooter,
  ZONE_PICK_FOOTER_HEIGHT,
  ZonePickSubList,
} from "@/components/shopping-course";
import type { CartLineItem } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { addZonesToShoppingList } from "@/lib/shopping/addZonesToShoppingList";
import {
  mapShoppingListApiToCategoryLineItems,
  mapShoppingListApiToLineItems,
  mapShoppingListLineItemsToMapItems,
} from "@/lib/shopping/mappers";
import { useToast } from "@/contexts/ToastContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import type { CartZoneItem } from "@/components/category";

const CART_CATEGORY_ID_PATTERN = /^카테고리 (\d+)$/;

function categoryIdsFromLineItems(items: CartLineItem[]): number[] {
  const ids = new Set<number>();
  for (const item of items) {
    const category = item.product.category;
    if (!category) continue;

    const match = category.match(CART_CATEGORY_ID_PATTERN);
    if (match) {
      ids.add(Number(match[1]));
      continue;
    }

    for (const top of CATEGORY_TREE) {
      for (const middle of top.middles) {
        for (const sub of middle.subs) {
          if (category.endsWith(sub.label)) {
            ids.add(sub.categoryId);
          }
        }
      }
    }
  }
  return Array.from(ids);
}

export default function PickZonesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();
  const fromCart = params.from === "cart";
  const { showToast } = useToast();
  const { availableItems, zoneItems, setZoneItems } = useCart();
  const { startShoppingTrip } = useMapNavigation();

  const cartZoneCategoryIds = useMemo(
    () => categoryIdsFromLineItems(availableItems),
    [availableItems],
  );

  const [activeTopKey, setActiveTopKey] = useState(CATEGORY_TREE[0]?.key ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set());
  const hasSeededSelection = useRef(false);

  useEffect(() => {
    if (hasSeededSelection.current) {
      return;
    }

    if (fromCart && zoneItems.length > 0) {
      setSelectedIds(
        new Set(zoneItems.map((zone: CartZoneItem) => zone.categoryId)),
      );
      hasSeededSelection.current = true;
      return;
    }

    if (cartZoneCategoryIds.length === 0) {
      return;
    }

    setSelectedIds(new Set(cartZoneCategoryIds));
    hasSeededSelection.current = true;
  }, [fromCart, zoneItems, cartZoneCategoryIds]);

  const activeTop = useMemo(
    () => CATEGORY_TREE.find((top) => top.key === activeTopKey) ?? CATEGORY_TREE[0],
    [activeTopKey],
  );

  const handleToggle = (categoryId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
        return next;
      }
      next.add(categoryId);
      return next;
    });
  };

  const handleConfirm = () => {
    const zones = Array.from(selectedIds)
      .map((id) => buildCartZoneItem(id))
      .filter((zone): zone is NonNullable<typeof zone> => zone != null);

    if (fromCart) {
      setZoneItems(zones);
      showToast(
        zones.length > 0
          ? `${zones.length}개 구역을 담았어요`
          : "선택한 구역을 비웠어요",
      );
      router.back();
      return;
    }

    if (zones.length === 0) {
      return;
    }

    void (async () => {
      try {
        const { shoppingList, zoneLines } = await addZonesToShoppingList(
          zones,
          null,
        );
        const allLineItems = mapShoppingListApiToLineItems(shoppingList);
        const mapItems = mapShoppingListLineItemsToMapItems(allLineItems);
        const tripZoneLines =
          mapShoppingListApiToCategoryLineItems(shoppingList);
        startShoppingTrip(
          allLineItems,
          mapItems,
          shoppingList.shoppingListId,
          shoppingList.destinationGridIds ?? [],
          tripZoneLines,
        );
        showToast(`${zones.length}개 구역을 담았어요`);
        router.push("/route-generating");
      } catch (error) {
        console.error(error);
        showToast("구역을 담지 못했어요. 다시 시도해 주세요.");
      }
    })();
  };

  return (
    <SafeView>
      <Header title="구역 고르기" showBack />
      <View className="h-px bg-light-gray" />

      <View className="flex-1 flex-row">
        <CategorySidebar
          tops={CATEGORY_TREE}
          activeTopKey={activeTop?.key ?? ""}
          onSelect={setActiveTopKey}
        />
        <View className="flex-1 bg-white">
          {activeTop ? (
            <ZonePickSubList
              middles={activeTop.middles}
              selectedIds={selectedIds}
              onToggle={handleToggle}
              bottomInset={ZONE_PICK_FOOTER_HEIGHT + 24}
            />
          ) : null}
        </View>
      </View>

      <ZonePickFooter
        selectedCount={selectedIds.size}
        onConfirm={handleConfirm}
      />
    </SafeView>
  );
}
