import {
  CART_FOOTER_HEIGHT,
  CartEmptyState,
  CartFooter,
  CartItemRow,
  CartRecommendationSection,
  CartSelectAllRow,
  CartSoldOutItemRow,
  CartZoneItemRow,
} from "@/components/cart";
import { Header } from "@/components/common";
import { SafeView } from "@/components/layout";
import { COLORS, SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { getApiErrorMessage } from "@/lib/api";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { getShoppingList, removeCartItem } from "@/lib/shopping/api";
import { addZonesToShoppingList } from "@/lib/shopping/addZonesToShoppingList";
import { createShoppingListFromCart } from "@/lib/shopping/createShoppingListFromCart";
import {
  mapShoppingListApiToCategoryLineItems,
  mapShoppingListApiToLineItems,
  mapShoppingListLineItemsToMapItems,
} from "@/lib/shopping/mappers";
import type { ShoppingListApi } from "@/lib/shopping/types";
import { pretendard } from "@/utils/pretendard";
import { GRID_COLS } from "@/components/store-map/grid/layout";
import { type Href, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { startShoppingTrip } = useMapNavigation();
  const {
    availableItems,
    soldOutItems,
    zoneItems,
    removeFromCart,
    refreshCart,
    setQuantity,
    setZoneItems,
    toggleSelect,
    toggleSelectAll,
  } = useCart();

  const hasSoldOut = soldOutItems.length > 0;
  const hasZones = zoneItems.length > 0;
  const isEmpty =
    availableItems.length === 0 && soldOutItems.length === 0 && !hasZones;

  const handleAddZonePress = () => {
    router.push("/shopping-course/pick-zones?from=cart" as Href);
  };

  const handleRemoveZone = (categoryId: number) => {
    setZoneItems(zoneItems.filter((zone) => zone.categoryId !== categoryId));
  };

  const handleStartShoppingWithRoute = async () => {
    const selectedLines = availableItems.filter((item) => item.selected);
    const hasSelectedProducts = selectedLines.length > 0;
    const hasSelectedZones = zoneItems.length > 0;

    if (!hasSelectedProducts && !hasSelectedZones) {
      return;
    }

    try {
      let finalShoppingList: ShoppingListApi | null = null;

      if (hasSelectedProducts) {
        finalShoppingList = await createShoppingListFromCart(
          availableItems,
          selectedLines,
        );

        await Promise.all(
          selectedLines
            .filter((line) => line.cartItemId)
            .map((line) => removeCartItem(line.cartItemId!)),
        );
        await refreshCart();
      }

      if (hasSelectedZones) {
        const { shoppingList } = await addZonesToShoppingList(
          zoneItems,
          finalShoppingList,
        );
        finalShoppingList = shoppingList;
      }

      if (finalShoppingList == null) {
        finalShoppingList = await getShoppingList();
      }

      const allLineItems = mapShoppingListApiToLineItems(finalShoppingList);
      const mapItems = mapShoppingListLineItemsToMapItems(
        allLineItems,
        GRID_COLS,
      );
      const zoneLines = mapShoppingListApiToCategoryLineItems(finalShoppingList);

      startShoppingTrip(
        allLineItems,
        mapItems,
        finalShoppingList.shoppingListId,
        finalShoppingList.destinationGridIds ?? [],
        zoneLines,
      );

      if (hasSelectedZones) {
        setZoneItems([]);
      }

      router.push("/route-generating");
    } catch (error) {
      if (__DEV__) {
        console.error(error);
      }
      showToast(
        getApiErrorMessage(error) ||
          "쇼핑을 시작하지 못했어요. 다시 시도해 주세요.",
      );
    }
  };

  return (
    <SafeView>
      <Header title="장바구니" showBack />

      <View className="flex-1">
        {isEmpty ? (
          <View
            className="flex-1"
            style={{ paddingBottom: CART_FOOTER_HEIGHT }}
          >
            <CartEmptyState onAddZone={handleAddZonePress} />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: CART_FOOTER_HEIGHT,
            }}
          >
            {availableItems.length > 0 ? (
              <>
                <Text
                  className="px-screen text-lg text-text-main"
                  style={[pretendard(700), { paddingBottom: SPACING.xs }]}
                >
                  상품
                </Text>
                <CartSelectAllRow
                  items={availableItems}
                  onToggleAll={toggleSelectAll}
                />
                {availableItems.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    onToggleSelect={() => toggleSelect(item.productId)}
                    onRemove={() => removeFromCart(item.productId)}
                    onQuantityChange={(quantity) =>
                      setQuantity(item.productId, quantity)
                    }
                  />
                ))}
              </>
            ) : null}

            <View style={{ paddingTop: SPACING.lg }}>
              <View
                className="flex-row items-center justify-between px-screen"
                style={{ paddingBottom: SPACING.xs }}
              >
                <Text className="text-lg text-text-main" style={pretendard(700)}>
                  구역
                </Text>
                {hasZones ? (
                  <Pressable
                    onPress={handleAddZonePress}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="구역 수정"
                    style={{
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                    }}
                  >
                    <Text
                      className="text-md"
                      style={{ ...pretendard(600), color: COLORS.main }}
                    >
                      수정
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleAddZonePress}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="구역 추가"
                    style={{
                      paddingHorizontal: SPACING.sm,
                      paddingVertical: SPACING.xs,
                    }}
                  >
                    <Text
                      className="text-md"
                      style={{ ...pretendard(600), color: COLORS.main }}
                    >
                      추가
                    </Text>
                  </Pressable>
                )}
              </View>

              {hasZones ? (
                zoneItems.map((zone) => (
                  <CartZoneItemRow
                    key={zone.categoryId}
                    zone={zone}
                    onRemove={() => handleRemoveZone(zone.categoryId)}
                  />
                ))
              ) : (
                <Text
                  className="px-screen text-md text-text-sub2"
                  style={pretendard(400)}
                >
                  담은 구역이 없어요. 추가를 눌러 매장 구역을 골라보세요.
                </Text>
              )}
            </View>

            {hasSoldOut ? (
              <View style={{ paddingTop: SPACING.lg }}>
                <Text
                  className="px-screen text-lg text-text-main"
                  style={pretendard(700)}
                >
                  품절 상품
                </Text>
                {soldOutItems.map((item) => (
                  <CartSoldOutItemRow
                    key={item.productId}
                    item={item}
                    onRemove={() => removeFromCart(item.productId)}
                  />
                ))}
                <CartRecommendationSection />
              </View>
            ) : null}
          </ScrollView>
        )}

        <View className="absolute bottom-0 left-0 right-0">
          <CartFooter
            availableItems={availableItems}
            zoneCount={zoneItems.length}
            onCheckout={handleStartShoppingWithRoute}
          />
        </View>
      </View>
    </SafeView>
  );
}