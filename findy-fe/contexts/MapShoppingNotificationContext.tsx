import {
  buildRelatedProductNotification,
  getRelatedProductForNotification,
} from "@/components/map/notifications/buildRelatedProductNotification";
import { getInStockProducts } from "@/components/home/mockProducts";
import { BARCODE_SCANS_FOR_PROMO_NOTIFICATION } from "@/components/map/constants";
import type { MapShoppingNotification } from "@/components/map/notifications/types";
import type { Product } from "@/components/product";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

type MapShoppingNotificationContextValue = {
  notifications: MapShoppingNotification[];
  activeToast: MapShoppingNotification | null;
  /**
   * 쇼핑리스트 바코드 스캔 반영 후 호출.
   * 트립 전체 스캔 수량 합이 5 이상이면 프로모 알림 1회.
   */
  maybeShowPromoNotification: (
    pickedProduct: Product,
    totalScannedUnits: number,
  ) => void;
  dismissActiveToast: () => void;
};

const MapShoppingNotificationContext =
  createContext<MapShoppingNotificationContextValue | null>(null);

function resolveRelatedProduct(pickedProductId: string): Product | null {
  return (
    getRelatedProductForNotification(pickedProductId) ??
    getInStockProducts()[0] ??
    null
  );
}

export function MapShoppingNotificationProvider({
  children,
}: PropsWithChildren) {
  const [notifications, setNotifications] = useState<MapShoppingNotification[]>(
    [],
  );
  const [activeToast, setActiveToast] =
    useState<MapShoppingNotification | null>(null);
  const toastQueueRef = useRef<MapShoppingNotification[]>([]);
  const promoShownRef = useRef(false);
  const { hasActiveTrip } = useMapNavigation();

  useEffect(() => {
    if (!hasActiveTrip) {
      promoShownRef.current = false;
      toastQueueRef.current = [];
      setActiveToast(null);
    }
  }, [hasActiveTrip]);

  const dismissActiveToast = useCallback(() => {
    setActiveToast(null);
    const next = toastQueueRef.current.shift();
    if (next) {
      setActiveToast(next);
    }
  }, []);

  const enqueueNotification = useCallback(
    (notification: MapShoppingNotification) => {
      setNotifications((prev) => [notification, ...prev]);
      setActiveToast((current) => {
        if (current) {
          toastQueueRef.current.push(notification);
          return current;
        }
        return notification;
      });
    },
    [],
  );

  const maybeShowPromoNotification = useCallback(
    (pickedProduct: Product, totalScannedUnits: number) => {
      if (totalScannedUnits < BARCODE_SCANS_FOR_PROMO_NOTIFICATION) {
        return;
      }
      if (promoShownRef.current) {
        return;
      }

      const relatedProduct = resolveRelatedProduct(pickedProduct.id);
      if (!relatedProduct) {
        return;
      }

      promoShownRef.current = true;

      enqueueNotification({
        id: `${Date.now()}-${relatedProduct.id}`,
        createdAt: Date.now(),
        ...buildRelatedProductNotification(pickedProduct, relatedProduct),
      });
    },
    [enqueueNotification],
  );

  const value = useMemo(
    () => ({
      notifications,
      activeToast,
      maybeShowPromoNotification,
      dismissActiveToast,
    }),
    [
      notifications,
      activeToast,
      maybeShowPromoNotification,
      dismissActiveToast,
    ],
  );

  return (
    <MapShoppingNotificationContext.Provider value={value}>
      {children}
    </MapShoppingNotificationContext.Provider>
  );
}

export function useMapShoppingNotifications() {
  const context = useContext(MapShoppingNotificationContext);
  if (!context) {
    throw new Error(
      "useMapShoppingNotifications must be used within MapShoppingNotificationProvider",
    );
  }
  return context;
}

/** 트립 라인 기준 스캔 수량 합 */
export function sumTripScannedUnits(
  lines: { scannedQuantity?: number }[],
): number {
  return lines.reduce((sum, line) => sum + (line.scannedQuantity ?? 0), 0);
}
