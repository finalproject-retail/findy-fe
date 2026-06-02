import { Header } from "@/components/common";
import {
  CART_FOOTER_HEIGHT,
  cartToShoppingMapItems,
  CartEmptyState,
  CartFooter,
  CartItemRow,
  CartRecommendationSection,
  CartSelectAllRow,
  CartSoldOutItemRow,
} from "@/components/cart";
import { SafeView } from "@/components/layout";
import { SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";
import { pretendard } from "@/utils/pretendard";
import { createShoppingList, removeCartItem } from "@/lib/shopping/api";
import { mapShoppingListApiToLineItems } from "@/lib/shopping/mappers";

export default function CartScreen() {
  const router = useRouter();
  const { startShoppingTrip } = useMapNavigation();
  const {
    availableItems,
    soldOutItems,
    removeFromCart,
    refreshCart,
    setQuantity,
    toggleSelect,
    toggleSelectAll,
  } = useCart();

  const hasSoldOut = soldOutItems.length > 0;
  const isEmpty = availableItems.length === 0 && soldOutItems.length === 0;

  const handleStartShoppingWithRoute = async () => {
    const selectedLines = availableItems.filter((item) => item.selected);
    if (selectedLines.length === 0) return;

    try {
      const shoppingList = await createShoppingList();
      const shoppingListLines = mapShoppingListApiToLineItems(shoppingList);
      const shoppingItems = cartToShoppingMapItems(shoppingListLines);

      startShoppingTrip(shoppingListLines, shoppingItems);

      await Promise.all(
        selectedLines
          .filter((line) => line.cartItemId)
          .map((line) => removeCartItem(line.cartItemId!)),
      );
      await refreshCart();

      router.push("/route-generating");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeView>
      <Header title="장바구니" showBack />
      <View className="h-px bg-light-gray" />

      <View className="flex-1">
        {isEmpty ? (
          <View className="flex-1" style={{ paddingBottom: CART_FOOTER_HEIGHT }}>
            <CartEmptyState />
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
            onCheckout={handleStartShoppingWithRoute}
          />
        </View>
      </View>
    </SafeView>
  );
}
