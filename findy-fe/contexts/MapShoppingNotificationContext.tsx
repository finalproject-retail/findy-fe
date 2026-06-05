import { SHOPPING_NOTIFICATION_MIN_INTERVAL_MS } from "@/components/map/constants";
import type { MapShoppingNotification } from "@/components/map/notifications/types";
import type { Product } from "@/components/product";
import { useAuth } from "@/contexts/AuthContext";
import { useBeaconLocation } from "@/contexts/BeaconLocationContext";
import { useMapNavigation } from "@/contexts/MapNavigationContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import {
  clickNotification,
  fetchNotifications,
  fetchShoppingRecommendationNotification,
} from "@/lib/notifications/api";
import type { ShoppingRecommendationNotificationResult } from "@/lib/notifications/api";
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
  listLoading: boolean;
  listError: string | null;
  reloadNotifications: () => Promise<void>;
  /** 바코드 수령 등 이벤트 후 쇼핑 추천 알림 API 1회 시도 */
  notifyBarcodeScanPromoIfNeeded: (
    totalScanCount: number,
    lastPickedProduct: Product,
  ) => void;
  /** 쇼핑 중 주기적·진입 시 알림 조회 */
  pollShoppingRecommendationNotification: (
    sourceProductId?: string | null,
  ) => Promise<void>;
  handleNotificationPress: (
    notification: MapShoppingNotification,
  ) => Promise<string | null>;
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

function buildNotificationFromApi(
  result: ShoppingRecommendationNotificationResult,
  sourceProduct?: Product,
): MapShoppingNotification | null {
  if (
    !result.shouldShow ||
    result.notificationId == null ||
    !result.product
  ) {
    return null;
  }

  return {
    id: String(result.notificationId),
    notificationId: result.notificationId,
    createdAt: Date.now(),
    notificationType: result.notificationType,
    pickedProductId: sourceProduct?.id ?? "",
    pickedProductName: sourceProduct?.name ?? "",
    headline: result.title?.trim() || "추천 상품이에요",
    description: result.content?.trim() || result.product.name,
    relatedProduct: result.product,
  };
}

function resetMapShoppingNotifications(
  setNotifications: Dispatch<SetStateAction<MapShoppingNotification[]>>,
  setActiveToast: Dispatch<SetStateAction<MapShoppingNotification | null>>,
  toastQueueRef: MutableRefObject<MapShoppingNotification[]>,
  shownProductIdsRef: MutableRefObject<string[]>,
  lastPollAtRef: MutableRefObject<number>,
) {
  setNotifications([]);
  setActiveToast(null);
  toastQueueRef.current = [];
  shownProductIdsRef.current = [];
  lastPollAtRef.current = 0;
}

export function MapShoppingNotificationProvider({
  children,
}: PropsWithChildren) {
  const { isLoggedIn, isLoading } = useAuth();
  const { storeId } = useStoreMapConfig();
  const { currentGridId } = useBeaconLocation();
  const {
    hasActiveTrip,
    tripLineItems,
    activeShoppingListId,
    addRecommendedMapItem,
  } = useMapNavigation();

  const [notifications, setNotifications] = useState<MapShoppingNotification[]>(
    [],
  );
  const [activeToast, setActiveToast] =
    useState<MapShoppingNotification | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const toastQueueRef = useRef<MapShoppingNotification[]>([]);
  const shownProductIdsRef = useRef<string[]>([]);
  const lastPollAtRef = useRef(0);
  const pollInFlightRef = useRef(false);

  const resetNotifications = useCallback(() => {
    resetMapShoppingNotifications(
      setNotifications,
      setActiveToast,
      toastQueueRef,
      shownProductIdsRef,
      lastPollAtRef,
    );
    setListError(null);
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(resetNotifications),
    [resetNotifications],
  );

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      return;
    }
    resetNotifications();
  }, [isLoading, isLoggedIn, resetNotifications]);

  useEffect(() => {
    if (!hasActiveTrip) {
      toastQueueRef.current = [];
      setActiveToast(null);
      shownProductIdsRef.current = [];
      lastPollAtRef.current = 0;
    }
  }, [hasActiveTrip]);

  const buildExcludeProductIds = useCallback(() => {
    const ids = new Set<string>();
    for (const item of tripLineItems) {
      ids.add(item.productId);
    }
    for (const id of shownProductIdsRef.current) {
      ids.add(id);
    }
    return [...ids];
  }, [tripLineItems]);

  const applyShoppingNotificationResult = useCallback(
    (
      result: ShoppingRecommendationNotificationResult,
      sourceProduct?: Product,
    ) => {
      const notification = buildNotificationFromApi(result, sourceProduct);
      if (!notification) {
        return;
      }

      shownProductIdsRef.current = [
        ...shownProductIdsRef.current,
        notification.relatedProduct.id,
      ];
      addRecommendedMapItem(notification.relatedProduct);
      setNotifications((prev) => {
        const exists = prev.some(
          (item) => item.notificationId === notification.notificationId,
        );
        if (exists) {
          return prev;
        }
        return [notification, ...prev];
      });
      enqueueToast(notification, setActiveToast, toastQueueRef);
    },
    [addRecommendedMapItem],
  );

  const pollShoppingRecommendationNotification = useCallback(
    async (sourceProductId?: string | null) => {
      if (!isLoggedIn || !hasActiveTrip) {
        return;
      }

      const now = Date.now();
      if (
        pollInFlightRef.current ||
        now - lastPollAtRef.current < SHOPPING_NOTIFICATION_MIN_INTERVAL_MS
      ) {
        return;
      }

      pollInFlightRef.current = true;
      lastPollAtRef.current = now;

      try {
        const result = await fetchShoppingRecommendationNotification({
          storeId,
          shoppingListId: activeShoppingListId,
          sourceProductId,
          currentGridId,
          excludeProductIds: buildExcludeProductIds(),
        });

        const sourceProduct = sourceProductId
          ? tripLineItems.find((item) => item.productId === sourceProductId)
              ?.product
          : undefined;

        applyShoppingNotificationResult(result, sourceProduct);
      } finally {
        pollInFlightRef.current = false;
      }
    },
    [
      activeShoppingListId,
      applyShoppingNotificationResult,
      buildExcludeProductIds,
      currentGridId,
      hasActiveTrip,
      isLoggedIn,
      storeId,
      tripLineItems,
    ],
  );

  const dismissActiveToast = useCallback(() => {
    setActiveToast(null);
    const next = toastQueueRef.current.shift();
    if (next) {
      setActiveToast(next);
    }
  }, []);

  const reloadNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setListError(null);
      return;
    }

    setListLoading(true);
    setListError(null);
    try {
      const items = await fetchNotifications({ size: 20 });
      setNotifications(items);
    } catch (error) {
      setNotifications([]);
      setListError(
        error instanceof Error ? error.message : "알림 목록을 불러오지 못했습니다.",
      );
    } finally {
      setListLoading(false);
    }
  }, [isLoggedIn]);

  const handleNotificationPress = useCallback(
    async (notification: MapShoppingNotification) => {
      try {
        const result = await clickNotification(notification.notificationId);
        setNotifications((prev) =>
          prev.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, isRead: true }
              : item,
          ),
        );

        const productId =
          result.productId != null
            ? String(result.productId)
            : notification.relatedProduct.id;
        return productId;
      } catch (error) {
        if (__DEV__) {
          console.warn("[notifications/click]", error);
        }
        await reloadNotifications();
        return null;
      }
    },
    [reloadNotifications],
  );

  const notifyBarcodeScanPromoIfNeeded = useCallback(
    (_totalScanCount: number, lastPickedProduct: Product) => {
      void pollShoppingRecommendationNotification(lastPickedProduct.id);
    },
    [pollShoppingRecommendationNotification],
  );

  const value = useMemo(
    () => ({
      notifications,
      activeToast,
      listLoading,
      listError,
      reloadNotifications,
      notifyBarcodeScanPromoIfNeeded,
      pollShoppingRecommendationNotification,
      handleNotificationPress,
      dismissActiveToast,
    }),
    [
      notifications,
      activeToast,
      listLoading,
      listError,
      reloadNotifications,
      notifyBarcodeScanPromoIfNeeded,
      pollShoppingRecommendationNotification,
      handleNotificationPress,
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
