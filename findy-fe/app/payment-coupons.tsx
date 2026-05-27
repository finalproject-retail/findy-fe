import { Header } from "@/components/common";
import { CouponCardContent, MOCK_COUPONS } from "@/components/coupon";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { useCheckout } from "@/contexts/CheckoutContext";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentCouponsScreen() {
  const router = useRouter();
  const { selectedCoupon, setSelectedCoupon } = useCheckout();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <Header title="쿠폰" showBack />
      <View style={{ height: 1, backgroundColor: COLORS.lightGray }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingVertical: SPACING.md,
          gap: SPACING.md,
        }}
      >
        {MOCK_COUPONS.map((coupon) => {
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
    </SafeAreaView>
  );
}
