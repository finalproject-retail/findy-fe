import type { Coupon } from "@/components/coupon";
import type { CartLineItem } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type CheckoutContextValue = {
  checkoutItems: CartLineItem[];
  selectedCoupon: Coupon | null;
  usedPoints: number;
  hasCheckoutItems: boolean;
  setCheckoutFromTrip: (
    tripLineItems: CartLineItem[],
    pickedQuantityByProductId: Record<string, number>,
  ) => void;
  clearCheckout: () => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;
  setUsedPoints: (points: number) => void;
};

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: PropsWithChildren) {
  const { isLoggedIn, isLoading } = useAuth();
  const [checkoutItems, setCheckoutItems] = useState<CartLineItem[]>([]);
  const [selectedCoupon, setSelectedCouponState] = useState<Coupon | null>(null);
  const [usedPoints, setUsedPointsState] = useState(0);

  const setCheckoutFromTrip = useCallback(
    (
      tripLineItems: CartLineItem[],
      pickedQuantityByProductId: Record<string, number>,
    ) => {
      const nextItems = tripLineItems
        .map((line) => {
          const pickedQty = pickedQuantityByProductId[line.productId] ?? 0;
          const quantity = Math.min(Math.max(pickedQty, 0), line.quantity);
          return quantity > 0 ? { ...line, quantity } : null;
        })
        .filter((line): line is CartLineItem => line != null);

      setCheckoutItems(nextItems);
      setSelectedCouponState(null);
      setUsedPoints(0);
    },
    [],
  );

  const clearCheckout = useCallback(() => {
    setCheckoutItems([]);
    setSelectedCouponState(null);
    setUsedPointsState(0);
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(clearCheckout),
    [clearCheckout],
  );

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      return;
    }
    clearCheckout();
  }, [clearCheckout, isLoading, isLoggedIn]);

  const setSelectedCoupon = useCallback((coupon: Coupon | null) => {
    setSelectedCouponState(coupon);
  }, []);

  const setUsedPoints = useCallback((points: number) => {
    const normalized = Number.isFinite(points)
      ? Math.max(0, Math.floor(points))
      : 0;
    setUsedPointsState(normalized);
  }, []);

  const value = useMemo(
    () => ({
      checkoutItems,
      selectedCoupon,
      usedPoints,
      hasCheckoutItems: checkoutItems.length > 0,
      setCheckoutFromTrip,
      clearCheckout,
      setSelectedCoupon,
      setUsedPoints,
    }),
    [
      checkoutItems,
      selectedCoupon,
      usedPoints,
      setCheckoutFromTrip,
      clearCheckout,
      setSelectedCoupon,
      setUsedPoints,
    ],
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider");
  }
  return context;
}
