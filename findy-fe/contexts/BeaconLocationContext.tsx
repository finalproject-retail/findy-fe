import {
  BEACON_EMA_ALPHA,
  BEACON_PRESENCE_HEARTBEAT_MS,
  BEACON_REQUIRED_STREAK_DEFAULT,
} from "@/constants/beacon";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import { useStoreMapConfig } from "@/contexts/StoreMapConfigContext";
import { getAccessToken } from "@/lib/api/client";
import { sendBeaconGridChange } from "@/lib/beacon/api/beaconSignals";
import {
  destroyBleManager,
  startBleScan,
} from "@/lib/beacon/services/bleScanner";
import type { BeaconScan } from "@/lib/beacon/types";
import {
  evaluateZoneChange,
  shouldSendPresenceHeartbeat,
} from "@/lib/beacon/utils/beaconLogic";
import { createBeaconRssiFilter } from "@/lib/beacon/utils/beaconRssiFilter";
import {
  defaultScanCsvFilename,
  scansToCsv,
  type BeaconScanLogRow,
} from "@/lib/beacon/utils/scanCsv";
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
import { Share } from "react-native";
import { useMapNavigation } from "./MapNavigationContext";

const MAX_SCAN_LOG_ROWS = 10_000;

type BeaconLocationContextValue = {
  isScanning: boolean;
  currentGridId: number | null;
  lastError: string | null;
  scanLogCount: number;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  exportScanCsv: () => Promise<void>;
  clearScanLog: () => void;
};

const BeaconLocationContext = createContext<BeaconLocationContextValue | null>(
  null,
);

export function BeaconLocationProvider({ children }: PropsWithChildren) {
  const { patchNavigationData } = useMapNavigation();
  const { storeId, minorToGridId, storeMapConfig } = useStoreMapConfig();
  const filterRef = useRef(createBeaconRssiFilter({ alpha: BEACON_EMA_ALPHA }));
  const zoneRef = useRef({
    lastSentGridId: null as number | null,
    lastSentAtMs: null as number | null,
    pendingGridId: null as number | null,
    streak: 0,
  });
  const stopScanRef = useRef<(() => void) | null>(null);
  const scanLogRef = useRef<BeaconScanLogRow[]>([]);
  const lastAppliedGridIdRef = useRef<number | null>(null);
  const minorToGridIdRef = useRef(minorToGridId);
  const storeIdRef = useRef(storeId);
  const gridColsRef = useRef(storeMapConfig.cols);

  useEffect(() => {
    minorToGridIdRef.current = minorToGridId;
  }, [minorToGridId]);

  useEffect(() => {
    storeIdRef.current = storeId;
  }, [storeId]);

  useEffect(() => {
    gridColsRef.current = storeMapConfig.cols;
  }, [storeMapConfig.cols]);

  const [isScanning, setIsScanning] = useState(false);
  const [currentGridId, setCurrentGridId] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [scanLogCount, setScanLogCount] = useState(0);

  const appendScanLog = useCallback(
    (scan: BeaconScan, userGridId: number | null) => {
      if (!__DEV__) {
        return;
      }
      scanLogRef.current.push({
        ...scan,
        nearestGridId: userGridId ?? "",
      });
      if (scanLogRef.current.length > MAX_SCAN_LOG_ROWS) {
        scanLogRef.current = scanLogRef.current.slice(-8000);
      }
      setScanLogCount(scanLogRef.current.length);
    },
    [],
  );

  const clearScanLog = useCallback(() => {
    scanLogRef.current = [];
    setScanLogCount(0);
  }, []);

  const exportScanCsv = useCallback(async () => {
    const rows = scanLogRef.current;
    if (!rows.length) {
      setLastError("CSV로보낼 스캔 기록이 없습니다.");
      return;
    }
    const csv = scansToCsv(rows);
    const filename = defaultScanCsvFilename();
    await Share.share({
      title: filename,
      message: csv,
    });
  }, []);

  const applyUserGrid = useCallback(
    (gridId: number | null) => {
      setCurrentGridId(gridId);
      if (gridId == null) {
        lastAppliedGridIdRef.current = null;
        return;
      }
      if (gridId === lastAppliedGridIdRef.current) {
        return;
      }
      lastAppliedGridIdRef.current = gridId;
      const { gridX, gridY } = gridIdToGridPoint(gridId, gridColsRef.current);
      patchNavigationData({
        currentLocation: { gridX, gridY },
      });
    },
    [patchNavigationData],
  );

  const processScan = useCallback(
    async (scan: BeaconScan) => {
      const minorMap = minorToGridIdRef.current;
      if (scan.minor != null && minorMap[String(scan.minor)] == null) {
        return;
      }

      filterRef.current.pruneStale();
      const userGridId = filterRef.current.ingest(scan, minorMap);

      appendScanLog(scan, userGridId);
      applyUserGrid(userGridId);
      if (userGridId == null) {
        return;
      }

      const zone = zoneRef.current;
      const { shouldSend: shouldSendZoneChange, streak: nextStreak } =
        evaluateZoneChange({
          lastSentGridId: zone.lastSentGridId,
          candidateGridId: userGridId,
          streak: zone.pendingGridId === userGridId ? zone.streak : 0,
          requiredStreak: BEACON_REQUIRED_STREAK_DEFAULT,
        });

      zone.pendingGridId = userGridId;
      zone.streak = nextStreak;

      const shouldSendHeartbeat =
        zone.lastSentGridId === userGridId &&
        shouldSendPresenceHeartbeat(
          zone.lastSentAtMs,
          Date.now(),
          BEACON_PRESENCE_HEARTBEAT_MS,
        );

      if ((!shouldSendZoneChange && !shouldSendHeartbeat) || !getAccessToken()) {
        return;
      }

      try {
        await sendBeaconGridChange(storeIdRef.current, scan, userGridId);
        zone.lastSentGridId = userGridId;
        zone.lastSentAtMs = Date.now();
        zone.pendingGridId = null;
        zone.streak = 0;
        setLastError(null);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "beacon-signals 전송 실패";
        setLastError(message);
        if (__DEV__) {
          console.warn("[BeaconLocation]", message);
        }
      }
    },
    [appendScanLog, applyUserGrid],
  );

  const stopTracking = useCallback(() => {
    stopScanRef.current?.();
    stopScanRef.current = null;
    destroyBleManager();
    setIsScanning(false);
  }, []);

  const startTracking = useCallback(async () => {
    if (stopScanRef.current) {
      return;
    }

    filterRef.current.reset();
    clearScanLog();
    lastAppliedGridIdRef.current = null;
     zoneRef.current = {
      lastSentGridId: null,
      lastSentAtMs: null,
      pendingGridId: null,
      streak: 0,
    };
    setLastError(null);

    try {
      stopScanRef.current = await startBleScan(
        (scan) => {
          void processScan(scan);
        },
        (err: Error) => {
          setLastError(err.message ?? "BLE 오류");
        },
      );
      setIsScanning(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "BLE 스캔 시작 실패";
      setLastError(message);
      throw error;
    }
  }, [clearScanLog, processScan]);

  const value = useMemo(
    () => ({
      isScanning,
      currentGridId,
      lastError,
      scanLogCount,
      startTracking,
      stopTracking,
      exportScanCsv,
      clearScanLog,
    }),
    [
      isScanning,
      currentGridId,
      lastError,
      scanLogCount,
      startTracking,
      stopTracking,
      exportScanCsv,
      clearScanLog,
    ],
  );

  return (
    <BeaconLocationContext.Provider value={value}>
      {children}
    </BeaconLocationContext.Provider>
  );
}

export function useBeaconLocation() {
  const context = useContext(BeaconLocationContext);
  if (!context) {
    throw new Error(
      "useBeaconLocation must be used within BeaconLocationProvider",
    );
  }
  return context;
}
