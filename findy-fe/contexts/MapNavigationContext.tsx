import {
  productToRecommendedMapItem,
} from "@/components/cart/cartToShoppingMapItems";
import type { Product } from "@/components/product";
import { resolveCatalogProductId } from "@/components/product/resolveCatalogProductId";
import { GRID_COLS } from "@/components/store-map/grid/layout";
import { toBeaconCongestionOverlayPoints } from "@/components/store-map/overlays/fetchCongestionOnRefresh";
import { CONGESTION_WINDOW_SECONDS } from "@/constants/beacon";
import { fetchGridCongestion } from "@/lib/map/api/fetchGridCongestion";
import { MAP_NAVIGATION_EMPTY } from "@/components/store-map/overlays/mock/mapNavigationEmpty";
import type {
  NavigationRouteSnapshot,
  ShoppingMapItem,
  StoreMapNavigationMock,
} from "@/components/store-map/overlays/types";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import type { CartLineItem } from "@/contexts/CartContext";
import { usePoints } from "@/contexts/PointsContext";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import { createShoppingPath } from "@/lib/map/api/fetchShoppingPath";
import {
  applyGridIdToShoppingItem,
  destinationGridIdsFromMapItems,
  orderShoppingItemsByDestinationGridIds,
  remainingTripLineItems,
  resolveTripDestinationGridIds,
} from "@/lib/map/pathUtils";
import type { PathNavigationApi } from "@/lib/map/types";
import { addProductToShoppingList } from "@/lib/shopping/addProductToShoppingList";
import { getShoppingList, removeShoppingListItem } from "@/lib/shopping/api";
import { buildTripShoppingMapItems } from "@/lib/shopping/buildTripShoppingMapItems";
import {
  mapShoppingListApiToCategoryLineItems,
  mapShoppingListApiToLineItems,
} from "@/lib/shopping/mappers";
import { findShoppingListItemByProductId } from "@/lib/shopping/resolveShoppingListItem";
import { isProductLineItem } from "@/lib/shopping/shoppingListItemUtils";
import type { TripZoneLineItem } from "@/lib/shopping/types";
import { runSerializedShoppingListQuantityChange } from "@/lib/shopping/serializeShoppingListQuantityChange";
import { applyShoppingListItemQuantity } from "@/lib/shopping/applyShoppingListItemQuantity";
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

type MapNavigationContextValue = {
  navigationData: StoreMapNavigationMock;
  /** null이면 경로 미표시 — 쇼핑 시작·새로고침 시 갱신 */
  routeSnapshot: NavigationRouteSnapshot | null;
  pathNavigation: PathNavigationApi | null;
  destinationGridIds: number[];
  navigationRefreshKey: number;
  tripLineItems: CartLineItem[];
  tripZoneItems: TripZoneLineItem[];
  recommendedProductsById: Record<string, Product>;
  pickedQuantityByProductId: Record<string, number>;
  /** 쇼핑 시작 후 지도·검색에서 쇼핑리스트 담기 모드 */
  shoppingTripActive: boolean;
  hasActiveTrip: boolean;
  activeShoppingListId: number | null;
  refreshNavigationOverlay: (
    storeId: number,
    gridCols?: number,
  ) => Promise<void>;
  refreshBeaconCongestion: (storeId: number) => Promise<void>;
  applyShoppingItems: (items: ShoppingMapItem[]) => void;
  startShoppingTrip: (
    lineItems: CartLineItem[],
    mapItems: ShoppingMapItem[],
    shoppingListId?: number | null,
    destinationGridIds?: number[],
    zoneItems?: TripZoneLineItem[],
  ) => void;
  /** map-service 경로 API 호출 — route-generating·새로고침에서 사용 */
  generateShoppingPath: (
    storeId: number,
    gridCols?: number,
  ) => Promise<boolean>;
  syncShoppingTrip: (
    lineItems: CartLineItem[],
    shoppingListId?: number | null,
    apiDestinationGridIds?: number[],
    zoneItems?: TripZoneLineItem[],
  ) => void;
  endShoppingTrip: () => void;
  markProductPicked: (productId: string, amount?: number) => void;
  updateShoppingItems: (items: ShoppingMapItem[]) => void;
  patchNavigationData: (patch: Partial<StoreMapNavigationMock>) => void;
  addRecommendedMapItem: (product: Product) => void;
  removeTripItem: (productId: string) => void;
  removeTripZoneItem: (categoryId: number) => Promise<void>;
  setTripItemQuantity: (lineItem: CartLineItem, delta: number) => Promise<void>;
  addProductToShoppingTrip: (product: Product, quantity?: number) => Promise<void>;
};

const MapNavigationContext = createContext<MapNavigationContextValue | null>(
  null,
);

type GenerateShoppingPathOptions = {
  lineItems?: CartLineItem[];
  zoneItems?: TripZoneLineItem[];
  pickedQuantityByProductId?: Record<string, number>;
  apiDestinationGridIds?: number[];
};

function productTripLineItems(lineItems: CartLineItem[]): CartLineItem[] {
  return lineItems.filter(isProductLineItem);
}

function resolveTripMapItems(
  lineItems: CartLineItem[],
  zoneItems: TripZoneLineItem[],
  fallbackItems: ShoppingMapItem[],
): ShoppingMapItem[] {
  const productLines = productTripLineItems(lineItems);
  if (productLines.length === 0 && zoneItems.length === 0) {
    return fallbackItems;
  }
  return buildTripShoppingMapItems(productLines, zoneItems);
}

function maxTripQuantity(product: Product) {
  const stock = product.stockCount ?? 99;
  return Math.max(stock, 1);
}

function buildRouteSnapshot(
  currentLocation: StoreMapNavigationMock["currentLocation"],
  shoppingItems: ShoppingMapItem[],
  pathNavigation?: PathNavigationApi | null,
): NavigationRouteSnapshot {
  return {
    currentLocation: { ...currentLocation },
    shoppingItems: shoppingItems.map((item) => ({ ...item })),
    pathNavigation: pathNavigation ?? null,
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
  const { storeId, isLoading: isStoreMapLoading } = useStoreMapConfig();
  const { clearPendingBarcodeRewards } = usePoints();
  const [navigationData, setNavigationData] =
    useState<StoreMapNavigationMock>(MAP_NAVIGATION_EMPTY);
  const [routeSnapshot, setRouteSnapshot] =
    useState<NavigationRouteSnapshot | null>(null);
  const [pathNavigation, setPathNavigation] =
    useState<PathNavigationApi | null>(null);
  const [destinationGridIds, setDestinationGridIds] = useState<number[]>([]);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);
  const [tripLineItems, setTripLineItems] = useState<CartLineItem[]>([]);
  const [tripZoneItems, setTripZoneItems] = useState<TripZoneLineItem[]>([]);
  const [recommendedProductsById, setRecommendedProductsById] = useState<
    Record<string, Product>
  >({});
  const [pickedQuantityByProductId, setPickedQuantityByProductId] = useState<
    Record<string, number>
  >({});
  const [shoppingTripActive, setShoppingTripActive] = useState(false);
  const [activeShoppingListId, setActiveShoppingListId] = useState<
    number | null
  >(null);
  const tripLineItemsRef = useRef(tripLineItems);
  tripLineItemsRef.current = tripLineItems;
  const tripZoneItemsRef = useRef(tripZoneItems);
  tripZoneItemsRef.current = tripZoneItems;
  const generateShoppingPathRef = useRef<
    (
      storeId: number,
      gridCols?: number,
      options?: GenerateShoppingPathOptions,
    ) => Promise<boolean>
  >(() => Promise.resolve(false));

  const hasActiveTrip =
    tripLineItems.length > 0 ||
    tripZoneItems.length > 0 ||
    navigationData.shoppingItems.length > 0;

  const applyRouteFromPath = useCallback(
    (
      mapItems: ShoppingMapItem[],
      path: PathNavigationApi | null,
      gridCols = GRID_COLS,
    ) => {
      const normalizedItems = mapItems.map((item) =>
        applyGridIdToShoppingItem(item, gridCols),
      );
      const orderedItems = path
        ? orderShoppingItemsByDestinationGridIds(
            normalizedItems,
            path.destinationGridIds,
            gridCols,
          )
        : normalizedItems;

      setPathNavigation(path);
      setNavigationData((prev) => {
        setRouteSnapshot(
          buildRouteSnapshot(prev.currentLocation, orderedItems, path),
        );
        return {
          ...prev,
          shoppingItems: orderedItems,
        };
      });
      setNavigationRefreshKey((key) => key + 1);
    },
    [],
  );

  const generateShoppingPath = useCallback(
    async (
      storeId: number,
      gridCols = GRID_COLS,
      options?: GenerateShoppingPathOptions,
    ) => {
      const lineItems = productTripLineItems(
        options?.lineItems ?? tripLineItems,
      );
      const zoneItems = options?.zoneItems ?? tripZoneItems;
      const pickedMap =
        options?.pickedQuantityByProductId ?? pickedQuantityByProductId;

      const remainingProducts = remainingTripLineItems(lineItems, pickedMap);
      const allMapItems = resolveTripMapItems(
        lineItems,
        zoneItems,
        navigationData.shoppingItems,
      );

      const apiDestinationGridIds =
        options?.apiDestinationGridIds ??
        (destinationGridIds.length > 0 ? destinationGridIds : undefined);

      const gridIdsToRequest = resolveTripDestinationGridIds(
        remainingProducts,
        zoneItems,
        gridCols,
        apiDestinationGridIds,
      );

      setDestinationGridIds(gridIdsToRequest);

      if (gridIdsToRequest.length === 0) {
        if (__DEV__) {
          console.warn(
            "[MapNavigation] 남은 destinationGridIds 없음 — 경로 미표시",
          );
        }
        applyRouteFromPath(allMapItems, null, gridCols);
        return false;
      }

      try {
        const path = await createShoppingPath(storeId, gridIdsToRequest);
        applyRouteFromPath(allMapItems, path, gridCols);
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "경로 API 호출 실패";
        if (__DEV__) {
          console.warn("[MapNavigation] path API failed:", message);
        }
        applyRouteFromPath(allMapItems, null, gridCols);
        return false;
      }
    },
    [
      applyRouteFromPath,
      destinationGridIds,
      navigationData.shoppingItems,
      pickedQuantityByProductId,
      tripLineItems,
      tripZoneItems,
    ],
  );

  generateShoppingPathRef.current = generateShoppingPath;

  const restoreActiveShoppingTrip = useCallback(async () => {
    if (
      tripLineItemsRef.current.length > 0 ||
      tripZoneItemsRef.current.length > 0
    ) {
      return;
    }

    try {
      const shoppingList = await getShoppingList();
      if (shoppingList.items.length === 0) {
        return;
      }
      if (
        tripLineItemsRef.current.length > 0 ||
        tripZoneItemsRef.current.length > 0
      ) {
        return;
      }

      const lineItems = productTripLineItems(
        mapShoppingListApiToLineItems(shoppingList),
      );
      const zoneItems = mapShoppingListApiToCategoryLineItems(shoppingList);
      const pickedQuantityMap = lineItems.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.productId] = item.scannedQuantity ?? 0;
          return acc;
        },
        {},
      );

      setShoppingTripActive(true);
      setActiveShoppingListId(shoppingList.shoppingListId);
      setTripLineItems(lineItems);
      setTripZoneItems(zoneItems);
      setPickedQuantityByProductId(pickedQuantityMap);
      setDestinationGridIds(
        resolveTripDestinationGridIds(
          remainingTripLineItems(lineItems, pickedQuantityMap),
          zoneItems,
          GRID_COLS,
          shoppingList.destinationGridIds,
        ),
      );
      setNavigationData((prev) => ({
        ...prev,
        shoppingItems: buildTripShoppingMapItems(lineItems, zoneItems),
      }));

      await generateShoppingPathRef.current(storeId, GRID_COLS, {
        lineItems,
        zoneItems,
        pickedQuantityByProductId: pickedQuantityMap,
        apiDestinationGridIds: shoppingList.destinationGridIds,
      });
    } catch {
      // 활성 쇼핑리스트 없음
    }
  }, [storeId]);

  const refreshBeaconCongestion = useCallback(async (storeId: number) => {
    try {
      const data = await fetchGridCongestion(storeId, {
        windowSeconds: CONGESTION_WINDOW_SECONDS,
      });
      const beaconCongestion = toBeaconCongestionOverlayPoints(data.points);
      setNavigationData((prev) => ({
        ...prev,
        beaconCongestion,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "혼잡도 API 호출 실패";
      setNavigationData((prev) => ({
        ...prev,
        beaconCongestion: [],
      }));
      if (__DEV__) {
        console.warn("Failed to refresh congestion overlay", message);
      }
    }
  }, []);

  const refreshNavigationOverlay = useCallback(
    async (storeId: number, gridCols = GRID_COLS) => {
      await refreshBeaconCongestion(storeId);
      await generateShoppingPath(storeId, gridCols);
    },
    [generateShoppingPath, refreshBeaconCongestion],
  );

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
      nextDestinationGridIds?: number[],
      zoneItems: TripZoneLineItem[] = [],
    ) => {
      clearPendingBarcodeRewards();
      setShoppingTripActive(true);
      setActiveShoppingListId(shoppingListId ?? null);
      setTripLineItems(productTripLineItems(lineItems));
      setTripZoneItems(zoneItems);
      setPickedQuantityByProductId({});
      setRecommendedProductsById({});
      setPathNavigation(null);
      const resolvedDestinationGridIds =
        nextDestinationGridIds != null && nextDestinationGridIds.length > 0
          ? nextDestinationGridIds
          : destinationGridIdsFromMapItems(mapItems, GRID_COLS);
      setDestinationGridIds(resolvedDestinationGridIds);
      setNavigationData((prev) => {
        setRouteSnapshot(
          buildRouteSnapshot(prev.currentLocation, mapItems, null),
        );
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
    (
      lineItems: CartLineItem[],
      shoppingListId?: number | null,
      apiDestinationGridIds?: number[],
      zoneItems?: TripZoneLineItem[],
    ) => {
      if (shoppingListId != null) {
        setActiveShoppingListId(shoppingListId);
      }

      const nextZoneItems = zoneItems ?? tripZoneItemsRef.current;
      const productLines = productTripLineItems(lineItems);
      setTripLineItems(productLines);
      setTripZoneItems(nextZoneItems);

      const pickedQuantityMap = productLines.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.productId] = item.scannedQuantity ?? 0;
          return acc;
        },
        {},
      );

      setPickedQuantityByProductId(pickedQuantityMap);
      setDestinationGridIds(
        resolveTripDestinationGridIds(
          remainingTripLineItems(productLines, pickedQuantityMap),
          nextZoneItems,
          GRID_COLS,
          apiDestinationGridIds,
        ),
      );

      setNavigationData((prev) => ({
        ...prev,
        shoppingItems: buildTripShoppingMapItems(productLines, nextZoneItems),
      }));
    },
    [],
  );

  const endShoppingTrip = useCallback(() => {
    setShoppingTripActive(false);
    setActiveShoppingListId(null);
    setTripLineItems([]);
    setTripZoneItems([]);
    setPickedQuantityByProductId({});
    setRecommendedProductsById({});
    setRouteSnapshot(null);
    setPathNavigation(null);
    setDestinationGridIds([]);
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

  useEffect(() => {
    if (isLoading || !isLoggedIn || isStoreMapLoading) {
      return;
    }
    void restoreActiveShoppingTrip();
  }, [
    isLoading,
    isLoggedIn,
    isStoreMapLoading,
    storeId,
    restoreActiveShoppingTrip,
  ]);

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
      setPickedQuantityByProductId((pickedPrev) => {
        const nextPicked = { ...pickedPrev };
        delete nextPicked[productId];

        setDestinationGridIds(
          resolveTripDestinationGridIds(
            remainingTripLineItems(next, nextPicked),
            tripZoneItemsRef.current,
            GRID_COLS,
          ),
        );
        setNavigationData((nav) => ({
          ...nav,
          shoppingItems: buildTripShoppingMapItems(next, tripZoneItemsRef.current),
        }));

        return nextPicked;
      });
      return next;
    });
  }, []);

  const removeTripZoneItem = useCallback(async (categoryId: number) => {
    const target = tripZoneItemsRef.current.find(
      (zone) => zone.categoryId === categoryId,
    );
    if (!target) {
      return;
    }

    const applyLocalRemoval = () => {
      const nextZones = tripZoneItemsRef.current.filter(
        (zone) => zone.categoryId !== categoryId,
      );
      setTripZoneItems(nextZones);
      setNavigationData((nav) => ({
        ...nav,
        shoppingItems: buildTripShoppingMapItems(
          tripLineItemsRef.current,
          nextZones,
        ),
      }));
    };

    if (target.shoppingListItemId) {
      const shoppingList = await removeShoppingListItem(target.shoppingListItemId);
      syncShoppingTrip(
        mapShoppingListApiToLineItems(shoppingList),
        shoppingList.shoppingListId,
        shoppingList.destinationGridIds,
        mapShoppingListApiToCategoryLineItems(shoppingList),
      );
      return;
    }

    applyLocalRemoval();
  }, [syncShoppingTrip]);

  const setTripItemQuantity = useCallback(
    async (lineItem: CartLineItem, delta: number) => {
      if (delta === 0) {
        return;
      }

      return runSerializedShoppingListQuantityChange(
        lineItem.productId,
        async () => {
          const { shoppingList, item: serverItem } =
            await findShoppingListItemByProductId(lineItem.productId);
          const syncedLineItems = mapShoppingListApiToLineItems(shoppingList);
          const syncedItem =
            syncedLineItems.find(
              (item) => item.productId === lineItem.productId,
            ) ?? lineItem;

          const serverScannedQty = serverItem.scannedQuantity ?? 0;
          const currentQuantity = serverItem.quantity;
          const nextQty = currentQuantity + delta;

          if (nextQty < serverScannedQty) {
            throw new Error(
              `바코드로 스캔한 ${serverScannedQty}개보다 적게는 줄일 수 없어요.`,
            );
          }

          if (nextQty < 0) {
            throw new Error("수량은 0개 이상이어야 해요.");
          }

          if (nextQty === currentQuantity) {
            setTripLineItems((prev) =>
              prev.map((item) =>
                item.productId === syncedItem.productId ? syncedItem : item,
              ),
            );
            return;
          }

          const previousLineItems = tripLineItemsRef.current;
          const optimisticItems = previousLineItems.map((item) =>
            item.productId === syncedItem.productId
              ? { ...syncedItem, quantity: nextQty }
              : item,
          );

          setTripLineItems(optimisticItems);
          setNavigationData((prev) => ({
            ...prev,
            shoppingItems: buildTripShoppingMapItems(
              optimisticItems,
              tripZoneItemsRef.current,
            ),
          }));

          try {
            const updatedList = await applyShoppingListItemQuantity(
              {
                shoppingListItemId: serverItem.shoppingListItemId,
                productId: syncedItem.productId,
                currentQuantity,
                scannedQuantity: serverScannedQty,
              },
              nextQty,
            );
            syncShoppingTrip(
              mapShoppingListApiToLineItems(updatedList),
              updatedList.shoppingListId,
              updatedList.destinationGridIds,
              mapShoppingListApiToCategoryLineItems(updatedList),
            );
          } catch (error) {
            setTripLineItems(previousLineItems);
            setNavigationData((prev) => ({
              ...prev,
              shoppingItems: buildTripShoppingMapItems(
                previousLineItems,
                tripZoneItemsRef.current,
              ),
            }));
            console.error("쇼핑리스트 수량 변경 실패:", error);
            throw error;
          }
        },
      );
    },
    [syncShoppingTrip],
  );

  const updateShoppingItems = useCallback(
    (items: ShoppingMapItem[]) => {
      applyShoppingItems(items);
    },
    [applyShoppingItems],
  );

  const patchNavigationData = useCallback(
    (patch: Partial<StoreMapNavigationMock>) => {
      setNavigationData((prev) => {
        const nextLocation = patch.currentLocation;
        if (
          nextLocation &&
          prev.currentLocation.gridX === nextLocation.gridX &&
          prev.currentLocation.gridY === nextLocation.gridY &&
          Object.keys(patch).length === 1
        ) {
          return prev;
        }
        return { ...prev, ...patch };
      });
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
        shoppingList.destinationGridIds,
        mapShoppingListApiToCategoryLineItems(shoppingList),
      );
    },
    [syncShoppingTrip],
  );

  const value = useMemo(
    () => ({
      navigationData,
      routeSnapshot,
      pathNavigation,
      destinationGridIds,
      navigationRefreshKey,
      tripLineItems,
      tripZoneItems,
      recommendedProductsById,
      pickedQuantityByProductId,
      shoppingTripActive,
      hasActiveTrip,
      activeShoppingListId,
      refreshNavigationOverlay,
      refreshBeaconCongestion,
      generateShoppingPath,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
      removeTripItem,
      removeTripZoneItem,
      setTripItemQuantity,
      addProductToShoppingTrip,
    }),
    [
      navigationData,
      routeSnapshot,
      pathNavigation,
      destinationGridIds,
      navigationRefreshKey,
      tripLineItems,
      tripZoneItems,
      recommendedProductsById,
      pickedQuantityByProductId,
      shoppingTripActive,
      hasActiveTrip,
      activeShoppingListId,
      refreshNavigationOverlay,
      refreshBeaconCongestion,
      generateShoppingPath,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
      removeTripItem,
      removeTripZoneItem,
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
    throw new Error(
      "useMapNavigation must be used within MapNavigationProvider",
    );
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
      return null;
    },
    [markProductPicked],
  );

  return {
    markProductPicked,
    pickProductFromBarcode,
    getPickedQuantity,
    isFullyPicked,
  };
}
