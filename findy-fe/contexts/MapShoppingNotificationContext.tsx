import { BARCODE_SCANS_FOR_PROMO_NOTIFICATION } from "@/components/map/constants";
import {
  buildPromoScanMilestoneNotification,
  getRelatedProductForNotification,
} from "@/components/map/notifications/buildRelatedProductNotification";
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
  type Dispatch,
  type MutableRefObject,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

type MapShoppingNotificationContextValue = {
  notifications: MapShoppingNotification[];
  activeToast: MapShoppingNotification | null;
  /** 바코드 스캔 누적 수 기준 — 5회마다 프로모 알림 1회 */
  notifyBarcodeScanPromoIfNeeded: (
    totalScanCount: number,
    lastPickedProduct: Product,
  ) => void;
  dismissActiveToast: () => void;
};

const MapShoppingNotificationContext =
  createContext<MapShoppingNotificationContextValue | null>(null);

function enqueueToast(
  notification: MapShoppingNotification,
  setActiveToast: Dispatch<SetStateAction<MapShoppingNotification | null>>,
  toastQueueRef: MutableRefObject<MapShoppingNotification[]>,
) {
  setActiveToast((current) => {
    if (current) {
      toastQueueRef.current.push(notification);
      return current;
    }
    return notification;
  });
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
  const promoMilestoneRef = useRef(0);
  const shownPromoProductIdsRef = useRef<string[]>([]);
  const { hasActiveTrip, addRecommendedMapItem } = useMapNavigation();

  useEffect(() => {
    if (!hasActiveTrip) {
      promoMilestoneRef.current = 0;
      shownPromoProductIdsRef.current = [];
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

  const notifyBarcodeScanPromoIfNeeded = useCallback(
    (totalScanCount: number, lastPickedProduct: Product) => {
      const threshold = BARCODE_SCANS_FOR_PROMO_NOTIFICATION;
      const currentMilestone =
        Math.floor(totalScanCount / threshold) * threshold;

      if (currentMilestone < threshold) {
        return;
      }
      if (currentMilestone <= promoMilestoneRef.current) {
        return;
      }

      const relatedProduct = getRelatedProductForNotification(
        lastPickedProduct.id,
        shownPromoProductIdsRef.current,
      );
      if (!relatedProduct) {
        return;
      }

      promoMilestoneRef.current = currentMilestone;
      shownPromoProductIdsRef.current = [
        ...shownPromoProductIdsRef.current,
        relatedProduct.id,
      ];

      addRecommendedMapItem(relatedProduct);

      const notification: MapShoppingNotification = {
        id: `${Date.now()}-${relatedProduct.id}`,
        createdAt: Date.now(),
        ...buildPromoScanMilestoneNotification(
          relatedProduct,
          currentMilestone,
          lastPickedProduct,
        ),
      };

      setNotifications((prev) => [notification, ...prev]);
      enqueueToast(notification, setActiveToast, toastQueueRef);
    },
    [addRecommendedMapItem],
  );

  const value = useMemo(
    () => ({
      notifications,
      activeToast,
      notifyBarcodeScanPromoIfNeeded,
      dismissActiveToast,
    }),
    [
      notifications,
      activeToast,
      notifyBarcodeScanPromoIfNeeded,
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
