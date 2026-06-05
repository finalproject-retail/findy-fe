import { Header } from "@/components/common";
import { getUnitPrice } from "@/components/cart";
import { CouponCardContent } from "@/components/coupon";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useOrderCoupons } from "@/hooks/useOrderCoupons";
import { isCouponSelectable } from "@/lib/coupon/couponDiscount";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentCouponsScreen() {
  const router = useRouter();
  const { selectedCoupon, setSelectedCoupon, checkoutItems } = useCheckout();
  const { coupons, loading, error, reload } = useOrderCoupons();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
        0,
      ),
    [checkoutItems],
  );

  const selectableCoupons = useMemo(
    () => coupons.filter((coupon) => isCouponSelectable(coupon, subtotal)),
    [coupons, subtotal],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header title="쿠폰" showBack />
      <View style={{ height: 1, backgroundColor: COLORS.lightGray }} />

      {loading && coupons.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && coupons.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ gap: SPACING.md }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => void reload()}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : selectableCoupons.length === 0 ? (
        <View className="flex-1 items-center justify-center px-screen">
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            사용 가능한 쿠폰이 없습니다.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingVertical: SPACING.md,
            gap: SPACING.md,
          }}
        >
          {selectableCoupons.map((coupon) => {
            const selected = selectedCoupon?.id === coupon.id;
            return (
              <Pressable
                key={coupon.id}
                onPress={() => {
                  setSelectedCoupon(coupon);
                  router.back();
                }}
                style={{
                  borderWidth: BORDER.base,
                  borderColor: selected ? COLORS.main : COLORS.gray,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.white,
                  padding: SPACING.md,
                  gap: SPACING.sm,
                }}
              >
                <CouponCardContent coupon={coupon} showDiscountChevron={false} />
                {selected ? (
                  <Text
                    style={{
                      ...pretendard(600),
                      color: COLORS.main,
                      fontSize: 13,
                      textAlign: "right",
                    }}
                  >
                    선택됨
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
