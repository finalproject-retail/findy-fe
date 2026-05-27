import type { CartLineItem } from "@/contexts/CartContext";
import { MAP_NAVIGATION_EMPTY } from "@/components/store-map/overlays/mock/mapNavigationEmpty";
import { fetchCongestionSnapshotOnRefresh } from "@/components/store-map/overlays/mock/congestionSnapshots";
import type {
  ShoppingMapItem,
  StoreMapNavigationMock,
} from "@/components/store-map/overlays/types";
import { usePoints } from "@/contexts/PointsContext";
import { rollBarcodePointReward } from "@/utils/barcodePointReward";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type MapNavigationContextValue = {
  navigationData: StoreMapNavigationMock;
  navigationRefreshKey: number;
  tripLineItems: CartLineItem[];
  pickedQuantityByProductId: Record<string, number>;
  hasActiveTrip: boolean;
  refreshNavigationOverlay: () => void;
  applyShoppingItems: (items: ShoppingMapItem[]) => void;
  startShoppingTrip: (
    lineItems: CartLineItem[],
    mapItems: ShoppingMapItem[],
  ) => void;
  endShoppingTrip: () => void;
  markProductPicked: (productId: string, amount?: number) => void;
  updateShoppingItems: (items: ShoppingMapItem[]) => void;
  patchNavigationData: (patch: Partial<StoreMapNavigationMock>) => void;
  removeTripItem: (productId: string) => void;
  setTripItemQuantity: (productId: string, quantity: number) => void;
};

const MapNavigationContext = createContext<MapNavigationContextValue | null>(
  null,
);

export function MapNavigationProvider({ children }: PropsWithChildren) {
  const { clearPendingBarcodeRewards } = usePoints();
  const [navigationData, setNavigationData] =
    useState<StoreMapNavigationMock>(MAP_NAVIGATION_EMPTY);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);
  const [tripLineItems, setTripLineItems] = useState<CartLineItem[]>([]);
  const [pickedQuantityByProductId, setPickedQuantityByProductId] = useState<
    Record<string, number>
  >({});
  const hasActiveTrip = tripLineItems.length > 0;

  const refreshNavigationOverlay = useCallback(() => {
    setNavigationData((prev) => ({
      ...prev,
      beaconCongestion: fetchCongestionSnapshotOnRefresh(),
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, []);

  const applyShoppingItems = useCallback((items: ShoppingMapItem[]) => {
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: items,
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, []);

  const startShoppingTrip = useCallback(
    (lineItems: CartLineItem[], mapItems: ShoppingMapItem[]) => {
      clearPendingBarcodeRewards();
      setTripLineItems(lineItems);
      setPickedQuantityByProductId({});
      setNavigationData((prev) => ({
        ...prev,
        shoppingItems: mapItems,
      }));
      setNavigationRefreshKey((key) => key + 1);
    },
    [clearPendingBarcodeRewards],
  );

  const endShoppingTrip = useCallback(() => {
    setTripLineItems([]);
    setPickedQuantityByProductId({});
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: [],
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, []);

  const markProductPicked = useCallback(
    (productId: string, amount = 1) => {
      setPickedQuantityByProductId((prev) => {
        const line = tripLineItems.find((item) => item.productId === productId);
        const maxQty = line?.quantity ?? amount;
        const current = prev[productId] ?? 0;
        const next = Math.min(current + amount, maxQty);
        if (next === current) return prev;
        return { ...prev, [productId]: next };
      });
    },
    [tripLineItems],
  );

  const removeTripItem = useCallback((productId: string) => {
    setTripLineItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
    setPickedQuantityByProductId((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: prev.shoppingItems.filter((item) => item.id !== productId),
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, []);

  const setTripItemQuantity = useCallback((productId: string, quantity: number) => {
    setTripLineItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const stock = item.product.stockCount ?? 99;
        const nextQty = Math.min(Math.max(quantity, 1), Math.max(stock, 1));
        return { ...item, quantity: nextQty };
      }),
    );
    setPickedQuantityByProductId((prev) => {
      const current = prev[productId] ?? 0;
      const capped = Math.min(current, quantity);
      if (capped === current) return prev;
      return { ...prev, [productId]: capped };
    });
  }, []);

  const updateShoppingItems = useCallback((items: ShoppingMapItem[]) => {
    applyShoppingItems(items);
  }, [applyShoppingItems]);

  const patchNavigationData = useCallback(
    (patch: Partial<StoreMapNavigationMock>) => {
      setNavigationData((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      navigationData,
      navigationRefreshKey,
      tripLineItems,
      pickedQuantityByProductId,
      hasActiveTrip,
      refreshNavigationOverlay,
      applyShoppingItems,
      startShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      removeTripItem,
      setTripItemQuantity,
    }),
    [
      navigationData,
      navigationRefreshKey,
      tripLineItems,
      pickedQuantityByProductId,
      hasActiveTrip,
      refreshNavigationOverlay,
      applyShoppingItems,
      startShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      removeTripItem,
      setTripItemQuantity,
    ],
  );

  return (
    <MapNavigationContext.Provider value={value}>
      {children}
    </MapNavigationContext.Provider>
  );
}

export function useMapNavigation() {
  const context = useContext(MapNavigationContext);
  if (!context) {
    throw new Error("useMapNavigation must be used within MapNavigationProvider");
  }
  return context;
}

/** 바코드 스캔 연동용 — 상품 픽 + 랜덤 포인트 당첨(10%) */
export function useMapBarcodePick() {
  const { markProductPicked, tripLineItems, pickedQuantityByProductId } =
    useMapNavigation();
  const { addPendingBarcodeReward } = usePoints();

  const getPickedQuantity = (productId: string) =>
    pickedQuantityByProductId[productId] ?? 0;

  const isFullyPicked = (productId: string) => {
    const line = tripLineItems.find((item) => item.productId === productId);
    if (!line) return false;
    return getPickedQuantity(productId) >= line.quantity;
  };

  const pickProductFromBarcode = useCallback(
    (productId: string, amount?: number) => {
      markProductPicked(productId, amount);
      const rewardPoints = rollBarcodePointReward();
      if (rewardPoints !== null) {
        addPendingBarcodeReward(rewardPoints);
      }
      return rewardPoints;
    },
    [addPendingBarcodeReward, markProductPicked],
  );

  return {
    markProductPicked,
    pickProductFromBarcode,
    getPickedQuantity,
    isFullyPicked,
  };
}
