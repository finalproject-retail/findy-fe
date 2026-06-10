import type { BeaconScan } from "@/lib/beacon/types";
import { toKstIsoString } from "@/lib/beacon/utils/kstTime";

export function pickStrongestScan(scans: BeaconScan[]) {
  if (!scans.length) {
    return null;
  }
  return scans.reduce((best, current) =>
    (current.rssi ?? -999) > (best.rssi ?? -999) ? current : best,
  );
}

export function resolveGridId(
  scan: BeaconScan,
  minorToGridMap: Record<string, number>,
  fallbackUseMinorAsGrid = false,
) {
  if (scan.nearestGridId != null) {
    return Number(scan.nearestGridId);
  }
  if (scan.minor != null && minorToGridMap[String(scan.minor)] != null) {
    return Number(minorToGridMap[String(scan.minor)]);
  }
  if (fallbackUseMinorAsGrid && scan.minor != null) {
    return Number(scan.minor);
  }
  return null;
}

export function evaluateZoneChange({
  lastSentGridId,
  candidateGridId,
  streak,
  requiredStreak,
}: {
  lastSentGridId: number | null;
  candidateGridId: number | null;
  streak: number;
  requiredStreak: number;
}) {
  if (candidateGridId == null) {
    return { shouldSend: false, streak: 0 };
  }

  if (lastSentGridId === candidateGridId) {
    return { shouldSend: false, streak: 0 };
  }

  const nextStreak = streak + 1;
  if (nextStreak < requiredStreak) {
    return { shouldSend: false, streak: nextStreak };
  }

  return { shouldSend: true, streak: 0 };
}

export function shouldSendPresenceHeartbeat(
  lastSentAtMs: number | null,
  nowMs: number,
  intervalMs: number,
): boolean {
  if (lastSentAtMs == null || intervalMs <= 0) {
    return false;
  }
  return nowMs - lastSentAtMs >= intervalMs;
}

export function buildPayload(
  storeId: number | string,
  scan: BeaconScan,
  nearestGridId: number,
) {
  return {
    storeId: Number(storeId),
    nearestGridId: Number(nearestGridId),
    timestampIso: scan.timestampIso || toKstIsoString(),
    uuid: scan.uuid,
    major: scan.major ?? null,
    minor: scan.minor ?? null,
    rssi: scan.rssi ?? null,
    mac: scan.mac ?? null,
    bluetoothAddressHex: scan.bluetoothAddressHex ?? null,
    tx: scan.tx ?? null,
  };
}
