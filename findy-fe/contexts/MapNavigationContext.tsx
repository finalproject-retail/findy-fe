import {
  productToRecommendedMapItem,
} from "@/components/cart/cartToShoppingMapItems";
import type { Product } from "@/components/product";
import { resolveCatalogProductId } from "@/components/product/resolveCatalogProductId";
import { GRID_COLS } from "@/components/store-map/grid/layout";
import { toBeaconCongestionOverlayPoints } from "@/components/store-map/overlays/fetchCongestionOnRefresh";
import { CONGESTION_WINDOW_SECONDS } from "@/constants/beacon";
import { fetchGridCongestion } from "@/lib/map/api/fetchGridCongestion";
import { fetchStoreCongestion } from "@/lib/map/api/fetchStoreCongestion";
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
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import { getAccessToken } from "@/lib/api/client";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";
import { fetchAllActivePromotionProducts } from "@/lib/promotions/api/fetchActivePromotionProducts";
import { buildPromotionMapOverlay } from "@/lib/promotions/buildPromotionMapOverlay";
import {
  clearScanRecommendations,
  deserializeScanRecommendationProducts,
  loadScanRecommendations,
  mergeScanRecommendationItems,
  saveScanRecommendations,
} from "@/lib/map/scanRecommendationStorage";
import { createShoppingPath } from "@/lib/map/api/fetchShoppingPath";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import {
  applyGridIdToShoppingItem,
  destinationGridIdsFromMapItems,
  gridPointToGridId,
  remainingTripLineItems,
  resolveTripDestinationGridIds,
} from "@/lib/map/pathUtils";
import {
  mapShoppingListLineItemsToMapItems,
  tripZoneItemsFromLineItems,
} from "@/lib/shopping/mappers";
import type { PathNavigationApi } from "@/lib/map/types";
import { addProductToShoppingList } from "@/lib/shopping/addProductToShoppingList";
import { getShoppingList, removeShoppingListItem } from "@/lib/shopping/api";
import {
  mapShoppingListApiToCategoryLineItems,
  mapShoppingListApiToLineItems,
} from "@/lib/shopping/mappers";
import { findShoppingListItemByProductId } from "@/lib/shopping/resolveShoppingListItem";
import {
  isCategoryLineItem,
  isProductLineItem,
} from "@/lib/shopping/shoppingListItemUtils";
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
import { usePathname } from "expo-router";

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
  refreshPromotionMarkers: (gridCols?: number) => Promise<void>;
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
  addRecommendedMapItem: (product: Product) => Promise<Product>;
  ensureRecommendedProduct: (productId: string) => Promise<Product | null>;
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

function normalizeTripMapItems(
  items: ShoppingMapItem[],
  gridCols = GRID_COLS,
): ShoppingMapItem[] {
  return items.map((item) => applyGridIdToShoppingItem(item, gridCols));
}

function buildTripMapItemsFromLineItems(
  lineItems: CartLineItem[],
  gridCols = GRID_COLS,
): ShoppingMapItem[] {
  return normalizeTripMapItems(
    mapShoppingListLineItemsToMapItems(lineItems, gridCols),
    gridCols,
  );
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
  const pathname = usePathname();
  const shouldRestoreActiveShoppingTrip =
    pathname === "/map" || pathname === "/route-generating";
  const { clearPendingBarcodeRewards } = usePoints();
  const [navigationData, setNavigationData] =
    useState<StoreMapNavigationMock>(MAP_NAVIGATION_EMPTY);
  const [routeSnapshot, setRouteSnapshot] =
    useState<NavigationRouteSnapshot | null>(null);
  const [pathNavigation, setPathNavigation] =
    useState<PathNavigationApi | null>(null);
  const [destinationGridIds, setDestinationGridIds] = useState<number[]>([]);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);
  const [tripListItems, setTripListItems] = useState<CartLineItem[]>([]);
  const [tripLineItems, setTripLineItems] = useState<CartLineItem[]>([]);
  const [tripZoneItems, setTripZoneItems] = useState<TripZoneLineItem[]>([]);
  const [recommendedProductsById, setRecommendedProductsById] = useState<
    Record<string, Product>
  >({});
  const recommendedProductsByIdRef = useRef(recommendedProductsById);
  recommendedProductsByIdRef.current = recommendedProductsById;
  const [pickedQuantityByProductId, setPickedQuantityByProductId] = useState<
    Record<string, number>
  >({});
  const [shoppingTripActive, setShoppingTripActive] = useState(false);
  const [activeShoppingListId, setActiveShoppingListId] = useState<
    number | null
  >(null);
  const activeShoppingListIdRef = useRef(activeShoppingListId);
  activeShoppingListIdRef.current = activeShoppingListId;
  const restoredScanListIdRef = useRef<number | null>(null);
  const scanRecommendationsHydratedRef = useRef(false);
  const tripListItemsRef = useRef(tripListItems);
  tripListItemsRef.current = tripListItems;
  const tripLineItemsRef = useRef(tripLineItems);
  tripLineItemsRef.current = tripLineItems;
  const tripZoneItemsRef = useRef(tripZoneItems);
  tripZoneItemsRef.current = tripZoneItems;

  const applyTripListState = useCallback((lineItems: CartLineItem[]) => {
    setTripListItems(lineItems);
    setTripLineItems(productTripLineItems(lineItems));
    setTripZoneItems(tripZoneItemsFromLineItems(lineItems));
  }, []);
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

      const routeLocation =
        path != null
          ? gridIdToGridPoint(path.currentGridId, gridCols)
          : null;

      setPathNavigation(path);
      setNavigationData((prev) => {
        const snapshotLocation = routeLocation ?? prev.currentLocation;
        setRouteSnapshot(
          buildRouteSnapshot(snapshotLocation, normalizedItems, path),
        );
        return {
          ...prev,
          currentLocation: snapshotLocation,
          shoppingItems: normalizedItems,
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
      const listLineItems =
        options?.lineItems ?? tripListItemsRef.current;
      const pickedMap =
        options?.pickedQuantityByProductId ?? pickedQuantityByProductId;

      const remainingProducts = remainingTripLineItems(
        productTripLineItems(listLineItems),
        pickedMap,
      );
      const allMapItems = buildTripMapItemsFromLineItems(
        listLineItems,
        gridCols,
      );

      const apiDestinationGridIds =
        options?.apiDestinationGridIds ??
        (destinationGridIds.length > 0 ? destinationGridIds : undefined);

      const gridIdsToRequest = resolveTripDestinationGridIds(
        remainingProducts,
        options?.zoneItems ?? tripZoneItems,
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
        const { gridX, gridY } = navigationData.currentLocation;
        const path = await createShoppingPath(storeId, gridIdsToRequest, {
          currentGridId: gridPointToGridId(gridX, gridY, gridCols),
        });
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
      navigationData.currentLocation,
      navigationData.shoppingItems,
      pickedQuantityByProductId,
      tripLineItems,
      tripZoneItems,
    ],
  );

  generateShoppingPathRef.current = generateShoppingPath;

  const restoreActiveShoppingTrip = useCallback(async () => {
    if (tripListItemsRef.current.length > 0) {
      return;
    }

    try {
      const shoppingList = await getShoppingList();
      if (shoppingList.items.length === 0) {
        return;
      }
      if (tripListItemsRef.current.length > 0) {
        return;
      }

      const lineItems = mapShoppingListApiToLineItems(shoppingList);
      const zoneItems = mapShoppingListApiToCategoryLineItems(shoppingList);
      const productLines = productTripLineItems(lineItems);
      const pickedQuantityMap = productLines.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.productId] = item.scannedQuantity ?? 0;
          return acc;
        },
        {},
      );

      setShoppingTripActive(true);
      setActiveShoppingListId(shoppingList.shoppingListId);
      applyTripListState(lineItems);
      setPickedQuantityByProductId(pickedQuantityMap);
      setDestinationGridIds(shoppingList.destinationGridIds ?? []);
      setNavigationData((prev) => ({
        ...prev,
        shoppingItems: buildTripMapItemsFromLineItems(lineItems),
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
    const windowSeconds = CONGESTION_WINDOW_SECONDS;

    try {
      const [gridData, storeData] = await Promise.all([
        fetchGridCongestion(storeId, { windowSeconds }),
        fetchStoreCongestion(storeId, { windowSeconds }),
      ]);
      const beaconCongestion = toBeaconCongestionOverlayPoints(gridData.points);
      setNavigationData((prev) => ({
        ...prev,
        beaconCongestion,
        storeCongestionLevel: storeData.level,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "혼잡도 API 호출 실패";
      setNavigationData((prev) => ({
        ...prev,
        beaconCongestion: [],
        storeCongestionLevel: null,
      }));
      if (__DEV__) {
        console.warn("Failed to refresh congestion overlay", message);
      }
    }
  }, []);

  const refreshPromotionMarkers = useCallback(async (gridCols = GRID_COLS) => {
    if (!isLoggedIn) {
      return;
    }

    try {
      const promotions = await fetchAllActivePromotionProducts();
      const overlay = await buildPromotionMapOverlay(promotions, gridCols);

      setNavigationData((prev) => {
        const promoIds = new Set(overlay.items.map((item) => item.id));
        const notificationItems = prev.recommendedItems.filter(
          (item) => !promoIds.has(item.id),
        );

        return {
          ...prev,
          recommendedItems: [...overlay.items, ...notificationItems],
        };
      });
      setRecommendedProductsById((prev) => ({
        ...overlay.productsById,
        ...prev,
      }));
    } catch (error) {
      if (__DEV__) {
        const message =
          error instanceof Error ? error.message : "프로모션 마커 API 호출 실패";
        console.warn("Failed to refresh promotion markers", message);
      }
    }
  }, [isLoggedIn]);

  const restoreScanRecommendationMarkers = useCallback(async () => {
    const userId = getUserIdFromAccessToken(getAccessToken());
    const shoppingListId = activeShoppingListIdRef.current;
    if (!userId || shoppingListId == null) {
      return;
    }

    const persisted = await loadScanRecommendations(
      userId,
      storeId,
      shoppingListId,
    );
    if (!persisted || persisted.items.length === 0) {
      return;
    }

    setNavigationData((prev) => ({
      ...prev,
      recommendedItems: mergeScanRecommendationItems(
        prev.recommendedItems,
        persisted.items,
      ),
    }));
    setRecommendedProductsById((prev) => ({
      ...prev,
      ...deserializeScanRecommendationProducts(persisted.productsById),
    }));
  }, [storeId]);

  const refreshNavigationOverlay = useCallback(
    async (storeId: number, gridCols = GRID_COLS) => {
      await Promise.all([
        refreshBeaconCongestion(storeId),
        refreshPromotionMarkers(gridCols),
      ]);
      await generateShoppingPath(storeId, gridCols);
    },
    [generateShoppingPath, refreshBeaconCongestion, refreshPromotionMarkers],
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
      applyTripListState(lineItems);
      setPickedQuantityByProductId({});
      setPathNavigation(null);
      const resolvedDestinationGridIds =
        nextDestinationGridIds != null && nextDestinationGridIds.length > 0
          ? nextDestinationGridIds
          : destinationGridIdsFromMapItems(mapItems, GRID_COLS);
      setDestinationGridIds(resolvedDestinationGridIds);
      const normalizedMapItems = normalizeTripMapItems(mapItems);
      setNavigationData((prev) => {
        setRouteSnapshot(
          buildRouteSnapshot(prev.currentLocation, normalizedMapItems, null),
        );
        return {
          ...prev,
          shoppingItems: normalizedMapItems,
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

      applyTripListState(lineItems);

      const productLines = productTripLineItems(lineItems);
      const pickedQuantityMap = productLines.reduce<Record<string, number>>(
        (acc, item) => {
          acc[item.productId] = item.scannedQuantity ?? 0;
          return acc;
        },
        {},
      );

      setPickedQuantityByProductId(pickedQuantityMap);
      setDestinationGridIds(
        apiDestinationGridIds ??
          resolveTripDestinationGridIds(
            remainingTripLineItems(productLines, pickedQuantityMap),
            tripZoneItemsFromLineItems(lineItems),
            GRID_COLS,
            apiDestinationGridIds,
          ),
      );

      const mapItems = buildTripMapItemsFromLineItems(lineItems);

      setNavigationData((prev) => ({
        ...prev,
        shoppingItems: mapItems,
      }));
      setRouteSnapshot((prev) =>
        prev
          ? {
              ...prev,
              shoppingItems: mapItems.map((item) => ({ ...item })),
            }
          : null,
      );
    },
    [],
  );

  const endShoppingTrip = useCallback(() => {
    const userId = getUserIdFromAccessToken(getAccessToken());
    if (userId) {
      void clearScanRecommendations(userId);
    }
    restoredScanListIdRef.current = null;
    scanRecommendationsHydratedRef.current = false;
    setShoppingTripActive(false);
    setActiveShoppingListId(null);
    setTripListItems([]);
    setTripLineItems([]);
    setTripZoneItems([]);
    setPickedQuantityByProductId({});
    setRouteSnapshot(null);
    setPathNavigation(null);
    setDestinationGridIds([]);
    setNavigationData((prev) => ({
      ...prev,
      shoppingItems: [],
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
    if (
      isLoading ||
      !isLoggedIn ||
      isStoreMapLoading ||
      !shouldRestoreActiveShoppingTrip
    ) {
      return;
    }

    void restoreActiveShoppingTrip();
  }, [
    isLoading,
    isLoggedIn,
    isStoreMapLoading,
    storeId,
    shouldRestoreActiveShoppingTrip,
    restoreActiveShoppingTrip,
  ]);

  useEffect(() => {
    if (!isLoggedIn || isLoading || activeShoppingListId == null) {
      return;
    }
    if (restoredScanListIdRef.current === activeShoppingListId) {
      scanRecommendationsHydratedRef.current = true;
      return;
    }

    scanRecommendationsHydratedRef.current = false;
    void restoreScanRecommendationMarkers().then(() => {
      restoredScanListIdRef.current = activeShoppingListId;
      scanRecommendationsHydratedRef.current = true;
    });
  }, [
    activeShoppingListId,
    isLoading,
    isLoggedIn,
    restoreScanRecommendationMarkers,
  ]);

  useEffect(() => {
    if (!isLoggedIn || activeShoppingListId == null) {
      return;
    }
    if (!scanRecommendationsHydratedRef.current) {
      return;
    }

    const userId = getUserIdFromAccessToken(getAccessToken());
    if (!userId) {
      return;
    }

    const scanItems = navigationData.recommendedItems.filter(
      (item) => item.source !== "promotion",
    );

    if (scanItems.length === 0) {
      void clearScanRecommendations(userId);
      return;
    }

    const productsById: Record<string, Product> = {};
    for (const item of scanItems) {
      const product = recommendedProductsById[item.id];
      if (product) {
        productsById[item.id] = product;
      }
    }

    void saveScanRecommendations(userId, {
      storeId,
      shoppingListId: activeShoppingListId,
      items: scanItems,
      productsById,
    });
  }, [
    activeShoppingListId,
    isLoggedIn,
    navigationData.recommendedItems,
    recommendedProductsById,
    storeId,
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
    setTripListItems((prev) => {
      const nextList = prev.filter((item) => item.productId !== productId);
      setTripLineItems(productTripLineItems(nextList));
      setTripZoneItems(tripZoneItemsFromLineItems(nextList));
      setPickedQuantityByProductId((pickedPrev) => {
        const nextPicked = { ...pickedPrev };
        delete nextPicked[productId];

        setDestinationGridIds(
          resolveTripDestinationGridIds(
            remainingTripLineItems(productTripLineItems(nextList), nextPicked),
            tripZoneItemsFromLineItems(nextList),
            GRID_COLS,
          ),
        );
        setNavigationData((nav) => ({
          ...nav,
          shoppingItems: buildTripMapItemsFromLineItems(nextList),
        }));

        return nextPicked;
      });
      return nextList;
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
      const nextList = tripListItemsRef.current.filter(
        (item) =>
          !(
            isCategoryLineItem(item) &&
            item.category?.categoryId === categoryId
          ),
      );
      applyTripListState(nextList);
      setNavigationData((nav) => ({
        ...nav,
        shoppingItems: buildTripMapItemsFromLineItems(nextList),
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

          const previousListItems = tripListItemsRef.current;
          const optimisticList = previousListItems.map((item) =>
            item.productId === syncedItem.productId
              ? { ...syncedItem, quantity: nextQty }
              : item,
          );

          applyTripListState(optimisticList);
          setNavigationData((prev) => ({
            ...prev,
            shoppingItems: buildTripMapItemsFromLineItems(optimisticList),
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
            applyTripListState(previousListItems);
            setNavigationData((prev) => ({
              ...prev,
              shoppingItems: buildTripMapItemsFromLineItems(previousListItems),
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

  const addRecommendedMapItem = useCallback(async (product: Product) => {
    let resolved = product;
    if (resolved.gridId == null) {
      try {
        resolved = await fetchProductDetail(resolved.id);
      } catch (error) {
        if (__DEV__) {
          const message =
            error instanceof Error
              ? error.message
              : "추천 상품 위치 조회 실패";
          console.warn("Failed to resolve recommended product gridId", message);
        }
      }
    }

    const item = productToRecommendedMapItem(resolved, 0, "scan");
    setNavigationData((prev) => {
      const index = prev.recommendedItems.findIndex(
        (existing) => existing.id === item.id,
      );
      if (index >= 0) {
        const existing = prev.recommendedItems[index]!;
        const nextItem = { ...item, source: "scan" as const };
        if (
          existing.gridId === nextItem.gridId &&
          existing.gridX === nextItem.gridX &&
          existing.gridY === nextItem.gridY &&
          existing.source === nextItem.source
        ) {
          return prev;
        }
        const next = [...prev.recommendedItems];
        next[index] = nextItem;
        return { ...prev, recommendedItems: next };
      }
      return {
        ...prev,
        recommendedItems: [...prev.recommendedItems, item],
      };
    });
    setRecommendedProductsById((prev) => ({
      ...prev,
      [resolved.id]: { ...prev[resolved.id], ...resolved },
    }));
    return resolved;
  }, []);

  const ensureRecommendedProduct = useCallback(async (productId: string) => {
    const cached = recommendedProductsByIdRef.current[productId];
    if (cached) {
      return cached;
    }

    try {
      const product = await fetchProductDetail(productId);
      const item = productToRecommendedMapItem(product, 0, "scan");
      setRecommendedProductsById((prev) => ({ ...prev, [product.id]: product }));
      setNavigationData((prev) => {
        if (prev.recommendedItems.some((existing) => existing.id === item.id)) {
          return prev;
        }
        return {
          ...prev,
          recommendedItems: [...prev.recommendedItems, item],
        };
      });
      return product;
    } catch (error) {
      if (__DEV__) {
        const message =
          error instanceof Error ? error.message : "추천 상품 정보 로드 실패";
        console.warn("Failed to load recommended product for callout", message);
      }
      return null;
    }
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
      refreshPromotionMarkers,
      generateShoppingPath,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
      ensureRecommendedProduct,
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
      refreshPromotionMarkers,
      generateShoppingPath,
      applyShoppingItems,
      startShoppingTrip,
      syncShoppingTrip,
      endShoppingTrip,
      markProductPicked,
      updateShoppingItems,
      patchNavigationData,
      addRecommendedMapItem,
      ensureRecommendedProduct,
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
