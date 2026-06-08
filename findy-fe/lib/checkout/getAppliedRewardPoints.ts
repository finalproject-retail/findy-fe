import type { Coupon } from "@/components/coupon";
import { getUnitPrice } from "@/components/cart";
import type { CartLineItem } from "@/contexts/CartContext";
import { getCouponDiscountAmount } from "@/lib/coupon/couponDiscount";

export function getAppliedRewardPoints(params: {
  checkoutItems: CartLineItem[];
  selectedCoupon: Coupon | null;
  usedPoints: number;
  balance: number;
}) {
  const subtotal = params.checkoutItems.reduce(
    (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
    0,
  );
  const couponDiscount = params.selectedCoupon
    ? getCouponDiscountAmount(params.selectedCoupon, subtotal)
    : 0;
  const maxUsablePoints = Math.max(
    0,
    Math.min(params.balance, subtotal - couponDiscount),
  );

  return Math.min(params.usedPoints, maxUsablePoints);
}
