import type { BeaconScan } from "@/lib/beacon/types";

export const DEFAULT_EMA_ALPHA = 0.25;

type BeaconEmaEntry = {
  ema: number;
  gridId: number;
  lastSeen: number;
};

export function beaconFilterKey(scan: BeaconScan) {
  if (scan.minor != null) {
    return `minor:${scan.minor}`;
  }
  if (scan.mac) {
    return `mac:${String(scan.mac).trim().toUpperCase()}`;
  }
  return null;
}

export function createBeaconRssiFilter({ alpha = DEFAULT_EMA_ALPHA } = {}) {
  const emaByKey = new Map<string, BeaconEmaEntry>();

  function reset() {
    emaByKey.clear();
  }

  function computeEma(rssi: number, previous: number | null) {
    if (Number.isNaN(rssi)) {
      return previous;
    }
    if (previous == null || Number.isNaN(previous)) {
      return rssi;
    }
    return alpha * rssi + (1 - alpha) * previous;
  }

  function getUserGrid(): number | null {
    let best: BeaconEmaEntry | null = null;
    for (const entry of emaByKey.values()) {
      if (best == null || entry.ema > best.ema) {
        best = entry;
      }
    }
    return best?.gridId ?? null;
  }

  function ingest(scan: BeaconScan, minorToGridMap: Record<string, number>) {
    const key = beaconFilterKey(scan);
    const rssi = scan.rssi;
    if (key == null || rssi == null) {
      return getUserGrid();
    }

    const gridRaw =
      scan.minor != null ? minorToGridMap[String(scan.minor)] : null;
    if (gridRaw == null) {
      return getUserGrid();
    }

    const gridId = Number(gridRaw);
    const prev = emaByKey.get(key);
    const ema = computeEma(rssi, prev?.ema ?? null);
    if (ema == null) {
      return getUserGrid();
    }

    emaByKey.set(key, {
      ema,
      gridId,
      lastSeen: Date.now(),
    });

    return getUserGrid();
  }

  function pruneStale(maxAgeMs = 5000) {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, entry] of emaByKey) {
      if (entry.lastSeen < cutoff) {
        emaByKey.delete(key);
      }
    }
  }

  return {
    ingest,
    getUserGrid,
    reset,
    pruneStale,
  };
}
