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
import { MAX_SHOPPING_ZONES } from "@/constants/shoppingCourse";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import type { CartZoneItem } from "@/components/category";

export default function PickZonesScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { zoneItems, setZoneItems } = useCart();

  const [activeTopKey, setActiveTopKey] = useState(CATEGORY_TREE[0]?.key ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => new Set(zoneItems.map((zone: CartZoneItem) => zone.categoryId)),
  );

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
      if (next.size >= MAX_SHOPPING_ZONES) {
        showToast(`구역은 최대 ${MAX_SHOPPING_ZONES}개까지 담을 수 있어요`);
        return prev;
      }
      next.add(categoryId);
      return next;
    });
  };

  const handleConfirm = () => {
    const zones = Array.from(selectedIds)
      .map((id) => buildCartZoneItem(id))
      .filter((zone): zone is NonNullable<typeof zone> => zone != null);

    setZoneItems(zones);
    showToast(`${zones.length}개 구역을 담았어요`);

    router.replace({
      pathname: "/cart",
      params: { tab: "zones" },
    } as Href);
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
