import { FALLBACK_STORE_ID } from "@/components/home/storeOptions";
import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { StoreMapConfig } from "@/components/store-map/types";
import { MINOR_TO_GRID_ID } from "@/constants/beacon";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStoreMapConfig } from "@/lib/map/api/fetchStoreMapConfig";
import { fetchStores } from "@/lib/map/api/fetchStores";
import {
  buildMinorToGridIdFromBeacons,
  buildStoreMapConfigFromApi,
} from "@/lib/map/buildStoreMapConfig";
import {
  loadSelectedStoreId,
  saveSelectedStoreId,
} from "@/lib/map/selectedStoreStorage";
import type { StoreApi } from "@/lib/map/types";
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

export type StoreOption = StoreApi;

type StoreMapConfigContextValue = {
  stores: StoreOption[];
  storeId: number;
  selectedStore: StoreOption | null;
  setStoreId: (storeId: number) => Promise<void>;
  storeMapConfig: StoreMapConfig;
  minorToGridId: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const StoreMapConfigContext = createContext<StoreMapConfigContextValue | null>(
  null,
);

function resolveInitialStoreId(
  stores: StoreOption[],
  savedStoreId: number | null,
): number {
  if (stores.length === 0) {
    return FALLBACK_STORE_ID;
  }

  if (
    savedStoreId != null &&
    stores.some((store) => store.storeId === savedStoreId)
  ) {
    return savedStoreId;
  }

  return stores[0]!.storeId;
}

function storeFromMapConfig(api: Awaited<ReturnType<typeof fetchStoreMapConfig>>): StoreOption {
  return {
    storeId: api.store.storeId,
    storeName: api.store.storeName,
    address: api.store.address,
    status: api.store.status,
  };
}

export function StoreMapConfigProvider({ children }: PropsWithChildren) {
  const localFallback = useMemo(() => getEmartStoreMapConfig(), []);
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeId, setStoreIdState] = useState(FALLBACK_STORE_ID);
  const [storeMapConfig, setStoreMapConfig] =
    useState<StoreMapConfig>(localFallback);
  const [minorToGridId, setMinorToGridId] =
    useState<Record<string, number>>(MINOR_TO_GRID_ID);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const storeIdRef = useRef(storeId);

  useEffect(() => {
    storeIdRef.current = storeId;
  }, [storeId]);

  const applyLocalFallback = useCallback(() => {
    setStores([]);
    setStoreIdState(FALLBACK_STORE_ID);
    setStoreMapConfig(localFallback);
    setMinorToGridId(MINOR_TO_GRID_ID);
    setError(null);
  }, [localFallback]);

  const loadMapConfig = useCallback(
    async (targetStoreId: number) => {
      const api = await fetchStoreMapConfig(targetStoreId);
      setStoreMapConfig(buildStoreMapConfigFromApi(api, localFallback));
      setMinorToGridId(buildMinorToGridIdFromBeacons(api.beacons));
    },
    [localFallback],
  );

  const reload = useCallback(async () => {
    if (isAuthLoading || !isLoggedIn) {
      applyLocalFallback();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const savedStoreId = await loadSelectedStoreId();
      let fetchedStores: StoreOption[] = [];

      try {
        fetchedStores = await fetchStores();
      } catch (storesErr) {
        if (__DEV__) {
          console.warn(
            "[StoreMapConfig] stores",
            storesErr instanceof Error ? storesErr.message : storesErr,
          );
        }
      }

      const resolvedStoreId = resolveInitialStoreId(
        fetchedStores,
        savedStoreId,
      );
      setStoreIdState(resolvedStoreId);
      storeIdRef.current = resolvedStoreId;

      if (resolvedStoreId !== savedStoreId) {
        await saveSelectedStoreId(resolvedStoreId);
      }

      try {
        const mapConfigApi = await fetchStoreMapConfig(resolvedStoreId);
        setStoreMapConfig(buildStoreMapConfigFromApi(mapConfigApi, localFallback));
        setMinorToGridId(buildMinorToGridIdFromBeacons(mapConfigApi.beacons));

        if (fetchedStores.length === 0) {
          fetchedStores = [storeFromMapConfig(mapConfigApi)];
        }
      } catch (mapErr) {
        const message =
          mapErr instanceof Error
            ? mapErr.message
            : "매장 지도 설정을 불러오지 못했습니다.";
        setError(message);
        setStoreMapConfig(localFallback);
        setMinorToGridId(MINOR_TO_GRID_ID);
        if (__DEV__) {
          console.warn("[StoreMapConfig] map-config", message);
        }
      }

      setStores(fetchedStores);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "매장 정보를 불러오지 못했습니다.";
      setError(message);
      applyLocalFallback();
      if (__DEV__) {
        console.warn("[StoreMapConfig]", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyLocalFallback, isAuthLoading, isLoggedIn, loadMapConfig, localFallback]);

  const setStoreId = useCallback(
    async (nextStoreId: number) => {
      if (nextStoreId === storeIdRef.current) {
        return;
      }

      const previousStoreId = storeIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        setStoreIdState(nextStoreId);
        storeIdRef.current = nextStoreId;
        await saveSelectedStoreId(nextStoreId);
        await loadMapConfig(nextStoreId);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "매장 지도 설정을 불러오지 못했습니다.";
        setError(message);
        setStoreIdState(previousStoreId);
        storeIdRef.current = previousStoreId;
        void saveSelectedStoreId(previousStoreId);
        setStoreMapConfig(localFallback);
        setMinorToGridId(MINOR_TO_GRID_ID);
        if (__DEV__) {
          console.warn("[StoreMapConfig] setStoreId", message);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [loadMapConfig, localFallback],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const selectedStore = useMemo(
    () => stores.find((store) => store.storeId === storeId) ?? null,
    [stores, storeId],
  );

  const value = useMemo(
    () => ({
      stores,
      storeId,
      selectedStore,
      setStoreId,
      storeMapConfig,
      minorToGridId,
      isLoading,
      error,
      reload,
    }),
    [
      stores,
      storeId,
      selectedStore,
      setStoreId,
      storeMapConfig,
      minorToGridId,
      isLoading,
      error,
      reload,
    ],
  );

  return (
    <StoreMapConfigContext.Provider value={value}>
      {children}
    </StoreMapConfigContext.Provider>
  );
}

export function useStoreMapConfig() {
  const context = useContext(StoreMapConfigContext);
  if (!context) {
    throw new Error(
      "useStoreMapConfig must be used within StoreMapConfigProvider",
    );
  }
  return context;
}
