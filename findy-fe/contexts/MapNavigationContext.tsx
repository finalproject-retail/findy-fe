import {
  cartToShoppingMapItems,
  productToRecommendedMapItem,
  tripLineItemsToShoppingMapItems,
} from "@/components/cart/cartToShoppingMapItems";
import type { Product } from "@/components/product";
import type { CartLineItem } from "@/contexts/CartContext";
import { MAP_NAVIGATION_EMPTY } from "@/components/store-map/overlays/mock/mapNavigationEmpty";
import { fetchCongestionOnRefresh } from "@/components/store-map/overlays/fetchCongestionOnRefresh";
import type {
  NavigationRouteSnapshot,
  ShoppingMapItem,
  StoreMapNavigationMock,
} from "@/components/store-map/overlays/types";
import { resolveCatalogProductId } from "@/components/product/resolveCatalogProductId";
import { useAuth } from "@/contexts/AuthContext";
import { usePoints } from "@/contexts/PointsContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import { addProductToShoppingList } from "@/lib/shopping/addProductToShoppingList";
import { mapShoppingListApiToLineItems } from "@/lib/shopping/mappers";
import { rollBarcodePointReward } from "@/utils/barcodePointReward";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type MapNavigationContextValue = {
  navigationData: StoreMapNavigationMock;
  /** null이면 경로 미표시 — 쇼핑 시작·새로고침 시 갱신 */
  routeSnapshot: NavigationRouteSnapshot | null;
  navigationRefreshKey: number;
  tripLineItems: CartLineItem[];
  recommendedProductsById: Record<string, Product>;
  pickedQuantityByProductId: Record<string, number>;
  /** 쇼핑 시작 후 지도·검색에서 쇼핑리스트 담기 모드 */
  shoppingTripActive: boolean;
  hasActiveTrip: boolean;
  activeShoppingListId: number | null;
  refreshNavigationOverlay: () => void;
  applyShoppingItems: (items: ShoppingMapItem[]) => void;
  startShoppingTrip: (
    lineItems: CartLineItem[],
    mapItems: ShoppingMapItem[],
    shoppingListId?: number | null,
  ) => void;
  syncShoppingTrip: (
    lineItems: CartLineItem[],
    shoppingListId?: number | null,
  ) => void;
  endShoppingTrip: () => void;
  markProductPicked: (productId: string, amount?: number) => void;
  updateShoppingItems: (items: ShoppingMapItem[]) => void;
  patchNavigationData: (patch: Partial<StoreMapNavigationMock>) => void;
  addRecommendedMapItem: (product: Product) => void;
  removeTripItem: (productId: string) => void;
  setTripItemQuantity: (productId: string, quantity: number) => void;
  addProductToShoppingTrip: (product: Product, quantity?: number) => Promise<void>;
};

const MapNavigationContext = createContext<MapNavigationContextValue | null>(
  null,
);

function maxTripQuantity(product: Product) {
  const stock = product.stockCount ?? 99;
  return Math.max(stock, 1);
}

function buildRouteSnapshot(
  currentLocation: StoreMapNavigationMock["currentLocation"],
  shoppingItems: ShoppingMapItem[],
): NavigationRouteSnapshot {
  return {
    currentLocation: { ...currentLocation },
    shoppingItems: shoppingItems.map((item) => ({ ...item })),
  };
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
  const { isLoggedIn, isLoading } = useAuth();
  const { clearPendingBarcodeRewards } = usePoints();
  const [navigationData, setNavigationData] =
    useState<StoreMapNavigationMock>(MAP_NAVIGATION_EMPTY);
  const [routeSnapshot, setRouteSnapshot] =
    useState<NavigationRouteSnapshot | null>(null);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);
  const [tripLineItems, setTripLineItems] = useState<CartLineItem[]>([]);
  const [recommendedProductsById, setRecommendedProductsById] = useState<
    Record<string, Product>
  >({});
  const [pickedQuantityByProductId, setPickedQuantityByProductId] = useState<
    Record<string, number>
  >({});
  const [shoppingTripActive, setShoppingTripActive] = useState(false);
  const [activeShoppingListId, setActiveShoppingListId] = useState<number | null>(
    null,
  );
  const hasActiveTrip =
    tripLineItems.length > 0 || navigationData.shoppingItems.length > 0;

  const refreshNavigationOverlay = useCallback(() => {
    setNavigationData((prev) => {
      const shoppingItems =
        tripLineItems.length > 0
          ? tripLineItemsToShoppingMapItems(tripLineItems)
          : prev.shoppingItems.length > 0
            ? prev.shoppingItems
            : [];

      setRouteSnapshot(buildRouteSnapshot(prev.currentLocation, shoppingItems));

      return {
        ...prev,
        shoppingItems,
        beaconCongestion: fetchCongestionOnRefresh(),
      };
    });
    setNavigationRefreshKey((key) => key + 1);
  }, [tripLineItems]);

  const applyShoppingItems = useCallback((items: ShoppingMapItem[]) => {
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: items,
    }));
  }, []);

  const startShoppingTrip = useCallback(
    (
      lineItems: CartLineItem[],
      mapItems: ShoppingMapItem[],
      shoppingListId?: number | null,
    ) => {
      clearPendingBarcodeRewards();
      setShoppingTripActive(true);
      setActiveShoppingListId(shoppingListId ?? null);
      setTripLineItems(lineItems);
      setPickedQuantityByProductId({});
      setRecommendedProductsById({});
      setNavigationData((prev) => {
        setRouteSnapshot(buildRouteSnapshot(prev.currentLocation, mapItems));
        return {
          ...prev,
          shoppingItems: mapItems,
          recommendedItems: [],
        };
      });
      setNavigationRefreshKey((key) => key + 1);
    },
    [clearPendingBarcodeRewards],
  );

  const syncShoppingTrip = useCallback(
    (lineItems: CartLineItem[], shoppingListId?: number | null) => {
    if (shoppingListId != null) {
      setActiveShoppingListId(shoppingListId);
    }
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
  },
  []);

  const endShoppingTrip = useCallback(() => {
    setShoppingTripActive(false);
    setActiveShoppingListId(null);
    setTripLineItems([]);
    setPickedQuantityByProductId({});
    setRecommendedProductsById({});
    setRouteSnapshot(null);
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: [],
      recommendedItems: [],
    }));
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(endShoppingTrip),
    [endShoppingTrip],
  );

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      return;
    }
    endShoppingTrip();
  }, [endShoppingTrip, isLoading, isLoggedIn]);

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

  const addRecommendedMapItem = useCallback((product: Product) => {
    const item = productToRecommendedMapItem(product);
    setNavigationData((prev) => {
      if (prev.recommendedItems.some((existing) => existing.id === item.id)) {
        return prev;
      }
      return {
        ...prev,
        recommendedItems: [...prev.recommendedItems, item],
      };
    });
    setRecommendedProductsById((prev) => {
      if (prev[product.id]) {
        return prev;
      }
      return { ...prev, [product.id]: product };
    });
  }, []);

  const addProductToShoppingTrip = useCallback(
    async (product: Product, quantity = 1) => {
      setShoppingTripActive(true);
      const catalogId = resolveCatalogProductId(product.id);
      const shoppingList = await addProductToShoppingList(catalogId, quantity);
      syncShoppingTrip(
        mapShoppingListApiToLineItems(shoppingList),
        shoppingList.shoppingListId,
      );
    },
    [syncShoppingTrip],
  );

  const value = useMemo(
    () => ({
      navigationData,
      routeSnapshot,
      navigationRefreshKey,
      tripLineItems,
      recommendedProductsById,
      pickedQuantityByProductId,
      shoppingTripActive,
      hasActiveTrip,
      activeShoppingListId,
      refreshNavigationOverlay,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
      removeTripItem,
      setTripItemQuantity,
      addProductToShoppingTrip,
    }),
    [
      navigationData,
      routeSnapshot,
      navigationRefreshKey,
      tripLineItems,
      recommendedProductsById,
      pickedQuantityByProductId,
      shoppingTripActive,
      hasActiveTrip,
      activeShoppingListId,
      refreshNavigationOverlay,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
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
  return context?.shoppingTripActive ?? false;
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
