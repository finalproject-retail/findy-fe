import { Header } from "@/components/common";
import { SquareButton } from "@/components/common/SquareButton";
import { getUnitPrice } from "@/components/cart";
import { MOCK_COUPONS } from "@/components/coupon";
import { formatPrice } from "@/components/product";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useCheckout } from "@/contexts/CheckoutContext";
import { usePoints } from "@/contexts/PointsContext";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const THUMB_SIZE = 64;
/** 접힘 상태에서 보여 줄 최대 줄 수 */
const ORDER_PREVIEW_MAX = 4;
/** 리스트 영역 최소 높이(약 4줄) */
const ORDER_ROW_ESTIMATE = THUMB_SIZE + SPACING.md * 2;
const ORDER_LIST_MIN_HEIGHT = ORDER_PREVIEW_MAX * ORDER_ROW_ESTIMATE;

/** 할인 혜택: 쿠폰·포인트 라벨 열 너비 (왼쪽 정렬) */
const BENEFIT_LABEL_WIDTH = 52;
/** 포인트 행 「모두 사용」 버튼 열 — 쿠폰 박스 너비를 포인트 입력과 맞춤 */
const BENEFIT_ACTION_MIN_WIDTH = 88;

const PAYMENT_FOOTER_BODY_HEIGHT = 72;

export default function PaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const { balance, pendingBarcodeRewardPoints } = usePoints();
  const {
    checkoutItems,
    selectedCoupon,
    usedPoints,
    setUsedPoints,
  } = useCheckout();

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
        0,
      ),
    [checkoutItems],
  );

  const couponDiscount = useMemo(() => {
    if (!selectedCoupon) return 0;
    if (subtotal < selectedCoupon.minPurchaseAmount) return 0;
    return Math.min(selectedCoupon.discountAmount, subtotal);
  }, [selectedCoupon, subtotal]);
  const eligibleCouponCount = useMemo(
    () =>
      MOCK_COUPONS.filter((coupon) => subtotal >= coupon.minPurchaseAmount)
        .length,
    [subtotal],
  );

  const maxUsablePoints = useMemo(
    () => Math.max(0, Math.min(balance, subtotal - couponDiscount)),
    [balance, couponDiscount, subtotal],
  );
  const appliedPoints = Math.min(usedPoints, maxUsablePoints);
  const totalPayment = Math.max(0, subtotal - couponDiscount - appliedPoints);

  const goldMemberEarnPoints = useMemo(
    () => Math.floor(subtotal * 0.015),
    [subtotal],
  );
  const barcodeEarnPoints = pendingBarcodeRewardPoints;
  const totalEarnPoints = goldMemberEarnPoints + barcodeEarnPoints;

  const orderHasMore = checkoutItems.length > ORDER_PREVIEW_MAX;
  const displayedOrderItems = useMemo(() => {
    if (!orderHasMore || itemsExpanded) return checkoutItems;
    return checkoutItems.slice(0, ORDER_PREVIEW_MAX);
  }, [checkoutItems, orderHasMore, itemsExpanded]);

  useEffect(() => {
    if (checkoutItems.length <= ORDER_PREVIEW_MAX) {
      setItemsExpanded(false);
    }
  }, [checkoutItems.length]);

  const handlePointInput = (value: string) => {
    const numeric = Number(value.replace(/[^0-9]/g, ""));
    setUsedPoints(Number.isFinite(numeric) ? numeric : 0);
  };

  const handleApplyAllPoints = () => {
    setUsedPoints(maxUsablePoints);
  };

  const handleCreateQr = () => {
    if (checkoutItems.length === 0) return;
    router.push("/payment-qr");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Header title="결제" showBack />
      <View style={styles.divider} />

      <View style={styles.contentWrap}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                PAYMENT_FOOTER_BODY_HEIGHT + insets.bottom + SPACING.lg,
            },
          ]}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              주문 상품 총 <Text style={styles.highlight}>{checkoutItems.length}</Text>개
            </Text>
            <View
              style={[styles.itemsWrap, { minHeight: ORDER_LIST_MIN_HEIGHT }]}
            >
              {displayedOrderItems.map((line, index) => (
                <View
                  key={line.productId}
                  style={[
                    styles.itemRow,
                    index === displayedOrderItems.length - 1 &&
                      !orderHasMore &&
                      styles.itemRowLast,
                  ]}
                >
                  <Image
                    source={line.product.image}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                  <View style={styles.itemInfo}>
                    <Text
                      style={styles.itemName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {line.product.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.discountText}>
                        {line.product.discountPercent}%
                      </Text>
                      <Text style={styles.priceText}>
                        {formatPrice(getUnitPrice(line.product))}
                      </Text>
                      <Text style={styles.quantityText}>{line.quantity}개</Text>
                    </View>
                  </View>
                </View>
              ))}
              {orderHasMore ? (
                <Pressable
                  style={styles.itemsMoreRow}
                  onPress={() => setItemsExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    itemsExpanded ? "주문 상품 접기" : "주문 상품 더보기"
                  }
                >
                  <Text style={styles.itemsMoreText}>
                    {itemsExpanded ? "접기" : "더보기"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>할인 혜택</Text>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitLabel}>쿠폰</Text>
              <View style={styles.benefitContent}>
                <Pressable
                  style={styles.benefitFieldFull}
                  onPress={() => router.push("/payment-coupons")}
                >
                  <Text
                    style={
                      selectedCoupon
                        ? styles.selectValueActive
                        : styles.selectValue
                    }
                    numberOfLines={1}
                  >
                    {selectedCoupon
                      ? `${selectedCoupon.discountAmount.toLocaleString("ko-KR")}원 할인`
                      : `사용 가능 ${eligibleCouponCount}장`}
                  </Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.benefitLabel}>포인트</Text>
              <View style={styles.benefitContent}>
                <View style={[styles.benefitField, styles.benefitFieldPoint]}>
                  <TextInput
                    value={
                      appliedPoints > 0
                        ? appliedPoints.toLocaleString("ko-KR")
                        : ""
                    }
                    onChangeText={handlePointInput}
                    placeholder="0"
                    keyboardType="number-pad"
                    style={styles.pointInput}
                  />
                  <Text style={styles.pointUnit}>원</Text>
                </View>
                <Pressable
                  style={styles.allPointButton}
                  onPress={handleApplyAllPoints}
                >
                  <Text style={styles.allPointText}>모두 사용</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.balanceText}>
              보유 포인트 : {balance.toLocaleString("ko-KR")}원
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.totalHeader}>
              <Text style={styles.sectionTitle}>최종 결제 금액</Text>
              <Text style={styles.totalPaymentText}>{formatPrice(totalPayment)}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>총 상품금액</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>쿠폰 할인</Text>
                <Text style={couponDiscount > 0 ? styles.negative : styles.summaryValue}>
                  {couponDiscount > 0 ? `-${formatPrice(couponDiscount)}` : "0원"}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>포인트 할인</Text>
                <Text style={appliedPoints > 0 ? styles.negative : styles.summaryValue}>
                  {appliedPoints > 0 ? `-${formatPrice(appliedPoints)}` : "0원"}
                </Text>
              </View>
            </View>
            <View style={styles.earningCard}>
              <View style={styles.earningTop}>
                <Text style={styles.earningTitle}>적립 예정 포인트</Text>
                <Text style={styles.earningAmount}>
                  + {totalEarnPoints.toLocaleString("ko-KR")} P
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>골드 회원 적립 포인트 (1.5%)</Text>
                <Text style={styles.earningDetailValue}>
                  + {goldMemberEarnPoints.toLocaleString("ko-KR")} P
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>랜덤 바코드 포인트</Text>
                <Text style={styles.earningDetailValue}>
                  + {barcodeEarnPoints.toLocaleString("ko-KR")} P
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + SPACING.sm },
          ]}
        >
          <SquareButton
            disabled={checkoutItems.length === 0}
            onPress={handleCreateQr}
            accessibilityLabel="결제 QR 생성"
          >
            결제 QR 생성
          </SquareButton>
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
  contentWrap: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.lg,
    gap: SPACING.xl,
  },
  section: {
    gap: SPACING.md,
  },
  sectionTitle: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.text,
  },
  highlight: {
    color: COLORS.main,
  },
  itemsWrap: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  itemName: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  discountText: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.redText,
  },
  priceText: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text,
  },
  quantityText: {
    ...pretendard(400),
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.subText,
    marginLeft: SPACING.xs,
  },
  itemsMoreRow: {
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsMoreText: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.subText,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  benefitLabel: {
    width: BENEFIT_LABEL_WIDTH,
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
  },
  benefitContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  benefitFieldFull: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    justifyContent: "center",
  },
  benefitField: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  benefitFieldPoint: {
    justifyContent: "space-between",
  },
  selectValue: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.subText,
    textAlign: "right",
  },
  selectValueActive: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.main,
    textAlign: "right",
  },
  pointInput: {
    flex: 1,
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    textAlign: "right",
    padding: 0,
  },
  pointUnit: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
    marginLeft: 4,
  },
  allPointButton: {
    minWidth: BENEFIT_ACTION_MIN_WIDTH,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  allPointText: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
  },
  balanceText: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.subText,
    textAlign: "right",
  },
  totalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalPaymentText: {
    ...pretendard(700),
    fontSize: 24,
    color: COLORS.main,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    ...pretendard(400),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.subText,
  },
  summaryValue: {
    ...pretendard(500),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
  },
  negative: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.main,
  },
  earningCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  earningTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  earningTitle: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
  },
  earningAmount: {
    ...pretendard(700),
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text,
  },
  earningDetailValue: {
    ...pretendard(600),
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.md,
    zIndex: 10,
    elevation: 10,
  },
});
