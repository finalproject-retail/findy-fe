import { Header } from "@/components/common";
import {
  CART_FOOTER_HEIGHT,
  CART_ZONE_FOOTER_HEIGHT,
  cartToShoppingMapItems,
  CartEmptyState,
  CartFooter,
  CartItemRow,
  CartRecommendationSection,
  CartSelectAllRow,
  CartSoldOutItemRow,
  CartTopTabs,
  CartZoneEmptyState,
  CartZoneFooter,
  CartZoneItemRow,
  zonesToShoppingMapItems,
  type CartTab,
} from "@/components/cart";
import { SafeView } from "@/components/layout";
import { SPACING } from "@/constants/theme";
import { useCart } from "@/contexts/CartContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { pretendard } from "@/utils/pretendard";
import { createShoppingListFromCart } from "@/lib/shopping/createShoppingListFromCart";
import { mapShoppingListApiToLineItems } from "@/lib/shopping/mappers";
import { parseApiErrorMessage } from "@/lib/api/parseApiErrorMessage";
import { useToast } from "@/contexts/ToastContext";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

function resolveCartTab(value: string | string[] | undefined): CartTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "zones" ? "zones" : "products";
}

export default function CartScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { startShoppingTrip } = useMapNavigation();
  const { showToast } = useToast();
  const {
    items: cartItems,
    availableItems,
    soldOutItems,
    zoneItems,
    removeFromCart,
    removeFromCartMany,
    setQuantity,
    toggleSelect,
    toggleSelectAll,
    removeZone,
  } = useCart();

  const [activeTab, setActiveTab] = useState<CartTab>(() =>
    resolveCartTab(params.tab),
  );

  useEffect(() => {
    setActiveTab(resolveCartTab(params.tab));
  }, [params.tab]);

  const productQuantity = useMemo(
    () =>
      availableItems.reduce((sum, item) => sum + item.quantity, 0) +
      soldOutItems.reduce((sum, item) => sum + item.quantity, 0),
    [availableItems, soldOutItems],
  );

  const hasSoldOut = soldOutItems.length > 0;
  const isProductsEmpty =
    availableItems.length === 0 && soldOutItems.length === 0;
  const isZonesEmpty = zoneItems.length === 0;

  const openPickZones = () => {
    router.push("/shopping-course/pick-zones" as Href);
  };

  const handleStartShoppingWithRoute = async () => {
    const selectedLines = availableItems.filter((item) => item.selected);
    if (selectedLines.length === 0) return;

    try {
      const shoppingList = await createShoppingListFromCart(
        cartItems,
        selectedLines,
      );
      const shoppingListLines = mapShoppingListApiToLineItems(shoppingList);
      const shoppingItems = cartToShoppingMapItems(shoppingListLines);

      startShoppingTrip(shoppingListLines, shoppingItems);
      router.push("/route-generating");
    } catch (error) {
      showToast(
        parseApiErrorMessage(error, "쇼핑을 시작하지 못했습니다."),
      );
      console.error(error);
    }
  };

  const handleStartZoneRoute = () => {
    if (zoneItems.length === 0) return;

    const mapItems = zonesToShoppingMapItems(zoneItems);
    startShoppingTrip([], mapItems);
    router.push("/route-generating");
  };

  const footerHeight =
    activeTab === "zones" ? CART_ZONE_FOOTER_HEIGHT : CART_FOOTER_HEIGHT;

  return (
    <SafeView>
      <Header title="장바구니" showBack />

      <CartTopTabs
        value={activeTab}
        onChange={setActiveTab}
        productCount={productQuantity}
        zoneCount={zoneItems.length}
      />

      <View className="flex-1">
        {activeTab === "products" ? (
          <>
            {isProductsEmpty ? (
              <View
                className="flex-1"
                style={{ paddingBottom: footerHeight }}
              >
                <CartEmptyState />
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: footerHeight,
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
          </>
        ) : (
          <>
            {isZonesEmpty ? (
              <CartZoneEmptyState onPickZones={openPickZones} />
            ) : (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingBottom: footerHeight,
                  }}
                >
                  {zoneItems.map((zone) => (
                    <CartZoneItemRow
                      key={zone.categoryId}
                      zone={zone}
                      onRemove={() => removeZone(zone.categoryId)}
                    />
                  ))}
                </ScrollView>
                <View className="absolute bottom-0 left-0 right-0">
                  <CartZoneFooter
                    zoneCount={zoneItems.length}
                    onPickZones={openPickZones}
                    onStartRoute={handleStartZoneRoute}
                  />
                </View>
              </>
            )}
          </>
        )}
      </View>
    </SafeView>
  );
}
