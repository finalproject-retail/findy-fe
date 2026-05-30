import {
  cartToShoppingMapItems,
  tripLineItemsToShoppingMapItems,
} from "@/components/cart/cartToShoppingMapItems";
import type { Product } from "@/components/product";
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
  syncShoppingTrip: (lineItems: CartLineItem[]) => void;
  endShoppingTrip: () => void;
  markProductPicked: (productId: string, amount?: number) => void;
  updateShoppingItems: (items: ShoppingMapItem[]) => void;
  patchNavigationData: (patch: Partial<StoreMapNavigationMock>) => void;
  removeTripItem: (productId: string) => void;
  setTripItemQuantity: (productId: string, quantity: number) => void;
  addProductToShoppingTrip: (product: Product, quantity?: number) => void;
};

const MapNavigationContext = createContext<MapNavigationContextValue | null>(
  null,
);

function maxTripQuantity(product: Product) {
  const stock = product.stockCount ?? 99;
  return Math.max(stock, 1);
}

function mergeTripLineItems(
  prev: CartLineItem[],
  product: Product,
  quantity: number,
): CartLineItem[] {
  const maxQty = maxTripQuantity(product);
  const existing = prev.find((item) => item.productId === product.id);

  if (existing) {
    return prev.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            product,
            quantity: Math.min(item.quantity + quantity, maxQty),
            selected: true,
          }
        : item,
    );
  }

  return [
    ...prev,
    {
      productId: product.id,
      product,
      quantity: Math.min(Math.max(quantity, 1), maxQty),
      selected: true,
    },
  ];
}

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
      shoppingItems:
        tripLineItems.length > 0
          ? tripLineItemsToShoppingMapItems(tripLineItems)
          : prev.shoppingItems,
      beaconCongestion: fetchCongestionSnapshotOnRefresh(),
    }));
    setNavigationRefreshKey((key) => key + 1);
  }, [tripLineItems]);

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

  const syncShoppingTrip = useCallback((lineItems: CartLineItem[]) => {
    setTripLineItems(lineItems);

    const pickedQuantityMap = lineItems.reduce<Record<string, number>>(
      (acc, item) => {
        acc[item.productId] = item.scannedQuantity ?? 0;
        return acc;
      },
      {},
    );

    setPickedQuantityByProductId(pickedQuantityMap);

    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: tripLineItemsToShoppingMapItems(lineItems),
    }));

    setNavigationRefreshKey((key) => key + 1);
  }, []);

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
    setTripLineItems((prev) => {
      const next = prev.filter((item) => item.productId !== productId);
      setNavigationData((nav) => ({
        ...nav,
        shoppingItems: tripLineItemsToShoppingMapItems(next),
      }));
      setNavigationRefreshKey((key) => key + 1);
      return next;
    });
    setPickedQuantityByProductId((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
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

  const addProductToShoppingTrip = useCallback(
    (product: Product, quantity = 1) => {
      setTripLineItems((prev) => {
        const next = mergeTripLineItems(prev, product, quantity);
        const mapItems = tripLineItemsToShoppingMapItems(next);
        setNavigationData((nav) => ({ ...nav, shoppingItems: mapItems }));
        setNavigationRefreshKey((key) => key + 1);
        return next;
      });
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
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      removeTripItem,
      setTripItemQuantity,
      addProductToShoppingTrip,
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
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      removeTripItem,
      setTripItemQuantity,
      addProductToShoppingTrip,
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

/** 지도 쇼핑 중(장바구니 → 쇼핑 시작) 대체 상품 검색·담기 UI */
export function useIsShoppingListMode() {
  const context = useContext(MapNavigationContext);
  return context?.hasActiveTrip ?? false;
}

/** 바코드 스캔 연동용 — 상품 1개 픽 완료 처리 */
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
