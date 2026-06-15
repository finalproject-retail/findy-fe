import { Header } from "@/components/common";
import { PaymentQrPlaceholder } from "@/components/payment/PaymentQrPlaceholder";
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, BORDER } from "@/constants/theme";
import { useCheckout } from "@/contexts/CheckoutContext";
import { usePoints } from "@/contexts/PointsContext";
import { useToast } from "@/contexts/ToastContext";
import { getAppliedRewardPoints } from "@/lib/checkout/getAppliedRewardPoints";
import { getApiErrorMessage } from "@/lib/api";
import { pretendard } from "@/utils/pretendard";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { createOrder } from "@/lib/shopping/api";
import { reportPurchaseConversionForOrder } from "@/lib/recommendations/recommendationLogTracker";

const QR_SIZE = 176;

type PaymentCancelButtonProps = {
  onPress: () => void;
};

/** Android/iOS — 배경·테두리는 Pressable이 아닌 내부 View에 */
function PaymentCancelButton({ onPress }: PaymentCancelButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="결제 취소"
      style={({ pressed }) => [
        styles.cancelPressable,
        pressed ? styles.cancelPressablePressed : null,
      ]}
    >
      <View style={styles.cancelSurface}>
        <Text style={styles.cancelButtonText}>결제 취소</Text>
      </View>
    </Pressable>
  );
}

export default function PaymentQrScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { checkoutItems, selectedCoupon, usedPoints, setLastCreatedOrder } =
    useCheckout();
  const { balance } = usePoints();
  const { showToast } = useToast();

  const appliedRewardPoints = useMemo(
    () =>
      getAppliedRewardPoints({
        checkoutItems,
        selectedCoupon,
        usedPoints,
        balance,
      }),
    [balance, checkoutItems, selectedCoupon, usedPoints],
  );

  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.replace("/payment");
    }
  }, [checkoutItems.length, router]);

  const handleCancel = () => {
    router.back();
  };

  const handleMockQrScan = async () => {
    try {
      const order = await createOrder(selectedCoupon?.userCouponId ?? undefined);
      reportPurchaseConversionForOrder(
        order.orderId,
        checkoutItems.map((item) => item.productId),
      );
      setLastCreatedOrder({
        orderId: order.orderId,
        finalAmount: order.finalAmount,
        usedRewardAmount: appliedRewardPoints,
      });
      router.replace("/payment-complete");
    } catch (error) {
      const message =
        getApiErrorMessage(error) ||
        "주문 생성에 실패했습니다. 바코드 스캔 후 다시 시도해 주세요.";
      showToast(message);
      if (__DEV__) {
        console.warn("[payment-qr] createOrder", error);
      }
    }
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />

      <Header title="결제" />
      <View style={styles.divider} />

      <View style={styles.body}>
        <View style={styles.content}>
          <View style={styles.centerBlock}>
            <View style={styles.messageBlock}>
              <Text style={styles.messageLine}>계산대에</Text>
              <Text style={styles.messageLine}>QR을 인식해주세요.</Text>
            </View>

            <Pressable
              onPress={handleMockQrScan}
              accessibilityRole="button"
              accessibilityLabel="QR 인식 (개발용)"
              style={({ pressed }) => [
                styles.qrCard,
                pressed ? styles.qrCardPressed : null,
              ]}
            >
              <PaymentQrPlaceholder size={QR_SIZE} />
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + SPACING.sm },
          ]}
        >
          <PaymentCancelButton onPress={handleCancel} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  body: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.screen,
  },
  centerBlock: {
    alignItems: "center",
    gap: SPACING.lg,
    marginBottom: SPACING.xl + SPACING.lg,
  },
  messageBlock: {
    alignItems: "center",
    gap: 2,
  },
  messageLine: {
    ...pretendard(700),
    fontSize: 21,
    lineHeight: 28,
    color: COLORS.text,
    textAlign: "center",
  },
  qrCard: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderWidth: BORDER.base,
    borderColor: COLORS.lightGray,
  },
  qrCardPressed: {
    opacity: 0.92,
  },
  footer: {
    flexShrink: 0,
    backgroundColor: "#F7F7F7",
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
  },
  cancelPressable: {
    alignSelf: "stretch",
    width: "100%",
  },
  cancelPressablePressed: {
    opacity: 0.92,
  },
  cancelSurface: {
    width: "100%",
    minHeight: 52,
    borderRadius: RADIUS.md,
    borderWidth: BORDER.base,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelButtonText: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    lineHeight: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    textAlign: "center",
    includeFontPadding: false,
  },
});
