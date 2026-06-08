import { getEmartStoreMapConfig } from "@/components/store-map/data/emart-floor-plan";
import type { StoreMapConfig } from "@/components/store-map/types";
import { MINOR_TO_GRID_ID } from "@/constants/beacon";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStoreMapConfig } from "@/lib/map/api/fetchStoreMapConfig";
import {
  buildMinorToGridIdFromBeacons,
  buildStoreMapConfigFromApi,
} from "@/lib/map/buildStoreMapConfig";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

const DEFAULT_STORE_ID = 1;

type StoreMapConfigContextValue = {
  storeId: number;
  storeMapConfig: StoreMapConfig;
  minorToGridId: Record<string, number>;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

const StoreMapConfigContext = createContext<StoreMapConfigContextValue | null>(
  null,
);

export function StoreMapConfigProvider({ children }: PropsWithChildren) {
  const localFallback = useMemo(() => getEmartStoreMapConfig(), []);
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();

  const [storeMapConfig, setStoreMapConfig] =
    useState<StoreMapConfig>(localFallback);
  const [minorToGridId, setMinorToGridId] =
    useState<Record<string, number>>(MINOR_TO_GRID_ID);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (isAuthLoading || !isLoggedIn) {
      setError(null);
      setStoreMapConfig(localFallback);
      setMinorToGridId(MINOR_TO_GRID_ID);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const api = await fetchStoreMapConfig(DEFAULT_STORE_ID);
      setStoreMapConfig(buildStoreMapConfigFromApi(api, localFallback));
      setMinorToGridId(buildMinorToGridIdFromBeacons(api.beacons));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "매장 지도 설정을 불러오지 못했습니다.";
      setError(message);
      setStoreMapConfig(localFallback);
      setMinorToGridId(MINOR_TO_GRID_ID);
      if (__DEV__) {
        console.warn("[StoreMapConfig]", message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthLoading, isLoggedIn, localFallback]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      storeId: DEFAULT_STORE_ID,
      storeMapConfig,
      minorToGridId,
      isLoading,
      error,
      reload,
    }),
    [storeMapConfig, minorToGridId, isLoading, error, reload],
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
