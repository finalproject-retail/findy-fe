import BigLogo from "@/assets/icons/big-logo.svg";
import { CharcoalSquareButton } from "@/components/common";
import { COLORS, SPACING } from "@/constants/theme";
import { useCheckout } from "@/contexts/CheckoutContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { usePoints } from "@/contexts/PointsContext";
import { useToast } from "@/contexts/ToastContext";
import { earnPurchaseReward } from "@/lib/rewards/api/earnPurchaseReward";
import { useRewardForOrder } from "@/lib/rewards/api/useRewardForOrder";
import { pretendard } from "@/utils/pretendard";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const LOGO_WIDTH = 107;
const LOGO_HEIGHT = 134;

export default function PaymentCompleteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { checkoutItems, lastCreatedOrder, clearCheckout } = useCheckout();
  const { endShoppingTrip } = useMapNavigation();
  const { commitPendingBarcodeRewards, refreshReward, syncReward } = usePoints();
  const { showToast } = useToast();
  const purchaseRecordedRef = useRef(false);

  useEffect(() => {
    if (checkoutItems.length === 0) {
      router.replace("/(tabs)");
      return;
    }

    if (purchaseRecordedRef.current) return;
    purchaseRecordedRef.current = true;

    void (async () => {
      if (lastCreatedOrder) {
        try {
          if (lastCreatedOrder.usedRewardAmount >= 1) {
            const useResult = await useRewardForOrder({
              orderId: lastCreatedOrder.orderId,
              usedAmount: lastCreatedOrder.usedRewardAmount,
            });
            syncReward(useResult.rewardBalance);
          }

          const earnFinalAmount = Math.max(
            0,
            lastCreatedOrder.finalAmount - lastCreatedOrder.usedRewardAmount,
          );
          const reward = await earnPurchaseReward({
            orderId: lastCreatedOrder.orderId,
            finalAmount: earnFinalAmount,
          });
          syncReward(reward.rewardBalance);
        } catch (error) {
          if (__DEV__) {
            console.warn("[payment-complete] reward flow", error);
          }
          showToast(
            error instanceof Error
              ? error.message
              : "포인트 처리에 실패했습니다.",
          );
          await refreshReward();
        }
      }

      await commitPendingBarcodeRewards();
      endShoppingTrip();
    })();
  }, [
    checkoutItems,
    commitPendingBarcodeRewards,
    endShoppingTrip,
    lastCreatedOrder,
    refreshReward,
    router,
    showToast,
    syncReward,
  ]);

  const handleConfirm = () => {
    clearCheckout();
    router.replace("/(tabs)");
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />

      <View style={styles.content}>
        <View style={styles.centerBlock}>
          <BigLogo
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            accessibilityLabel="Findy"
          />

          <View style={styles.messageBlock}>
            <Text style={styles.messageLine}>결제가 완료되었습니다👏</Text>
            <Text style={styles.messageLine}>감사합니다</Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        <CharcoalSquareButton
          onPress={handleConfirm}
          accessibilityLabel="확인"
        >
          확인
        </CharcoalSquareButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    marginBottom: SPACING.xl,
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
  footer: {
    flexShrink: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
  },
});
