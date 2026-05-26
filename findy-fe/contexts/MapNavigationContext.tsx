import { MAP_NAVIGATION_MOCK } from "@/components/store-map/overlays/mock/mapNavigationMock";
import { fetchCongestionSnapshotOnRefresh } from "@/components/store-map/overlays/mock/congestionSnapshots";
import type {
  ShoppingMapItem,
  StoreMapNavigationMock,
} from "@/components/store-map/overlays/types";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type MapNavigationContextValue = {
  navigationData: StoreMapNavigationMock;
  navigationRefreshKey: number;
  refreshNavigationOverlay: () => void;
  applyShoppingItems: (items: ShoppingMapItem[]) => void;
  updateShoppingItems: (items: ShoppingMapItem[]) => void;
  patchNavigationData: (patch: Partial<StoreMapNavigationMock>) => void;
};

const MapNavigationContext = createContext<MapNavigationContextValue | null>(
  null,
);

export function MapNavigationProvider({ children }: PropsWithChildren) {
  const [navigationData, setNavigationData] =
    useState<StoreMapNavigationMock>(MAP_NAVIGATION_MOCK);
  const [navigationRefreshKey, setNavigationRefreshKey] = useState(0);

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

  const updateShoppingItems = useCallback((items: ShoppingMapItem[]) => {
    applyShoppingItems(items);
  }, [applyShoppingItems]);

  const patchNavigationData = useCallback(
    (patch: Partial<StoreMapNavigationMock>) => {
      setNavigationData((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  return (
    <MapNavigationContext.Provider
      value={{
        navigationData,
        navigationRefreshKey,
        refreshNavigationOverlay,
        applyShoppingItems,
        updateShoppingItems,
        patchNavigationData,
      }}
    >
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
