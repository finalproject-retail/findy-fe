import {
  buildRelatedProductNotification,
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
  type PropsWithChildren,
} from "react";

type MapShoppingNotificationContextValue = {
  notifications: MapShoppingNotification[];
  activeToast: MapShoppingNotification | null;
  showRelatedProductNotification: (pickedProduct: Product) => void;
  dismissActiveToast: () => void;
};

const MapShoppingNotificationContext =
  createContext<MapShoppingNotificationContextValue | null>(null);

export function MapShoppingNotificationProvider({
  children,
}: PropsWithChildren) {
  const [notifications, setNotifications] = useState<MapShoppingNotification[]>(
    [],
  );
  const [activeToast, setActiveToast] =
    useState<MapShoppingNotification | null>(null);
  const toastQueueRef = useRef<MapShoppingNotification[]>([]);
  const shownRelatedByPickedRef = useRef<Record<string, string[]>>({});
  const { hasActiveTrip, addRecommendedMapItem } = useMapNavigation();

  useEffect(() => {
    if (!hasActiveTrip) {
      shownRelatedByPickedRef.current = {};
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

  const showRelatedProductNotification = useCallback(
    (pickedProduct: Product) => {
      const alreadyShown = shownRelatedByPickedRef.current[pickedProduct.id] ?? [];
      const relatedProduct = getRelatedProductForNotification(
        pickedProduct.id,
        alreadyShown,
      );
      if (!relatedProduct) {
        return;
      }

      shownRelatedByPickedRef.current[pickedProduct.id] = [
        ...alreadyShown,
        relatedProduct.id,
      ];

      addRecommendedMapItem(relatedProduct);

      const notification: MapShoppingNotification = {
        id: `${Date.now()}-${relatedProduct.id}`,
        createdAt: Date.now(),
        ...buildRelatedProductNotification(pickedProduct, relatedProduct),
      };

      setNotifications((prev) => [notification, ...prev]);

      setActiveToast((current) => {
        if (current) {
          toastQueueRef.current.push(notification);
          return current;
        }
        return notification;
      });
    },
    [addRecommendedMapItem],
  );

  const value = useMemo(
    () => ({
      notifications,
      activeToast,
      showRelatedProductNotification,
      dismissActiveToast,
    }),
    [
      notifications,
      activeToast,
      showRelatedProductNotification,
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
