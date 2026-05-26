import type { BeaconScan } from "@/lib/beacon/types";
import * as Location from "expo-location";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, ScanCallbackType, ScanMode } from "react-native-ble-plx";
import { formatBleMac, isPhysicalMinewMac } from "@/lib/beacon/config/physicalBeacons";
import {
  describeBleAdvertisement,
  deviceMayBePhysicalBeacon,
  parseBlePlxDevice,
} from "@/lib/beacon/utils/ibeacon";

let manager: BleManager | null;

type BleDebugSnapshot = {
  id: string;
  matchKind: string;
  rssi: number | null;
  mfgHex: string | null;
  rawHex: string | null;
  has0215Raw?: boolean;
  has0215Mfg?: boolean;
  parsedMinor: number | null;
  parsed: boolean;
};

export type BleScanDebugInfo = {
  parsedCount: number;
  minewMacCount: number;
  physicalAdCount: number;
  otherPacketCount: number;
  lastPhysical: BleDebugSnapshot | null;
  sampleIds: string[];
};

function getManager() {
  if (!manager) {
    manager = new BleManager();
  }
  return manager;
}

async function requestAndroidBlePermissions() {
  if (Platform.OS !== "android") {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted" ? { ok: true as const } : { ok: false as const, reason: "location" as const };
  }

  if (Platform.Version >= 31) {
    const results = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const scan =
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const connect =
      results[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
      PermissionsAndroid.RESULTS.GRANTED;
    const location =
      results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
      PermissionsAndroid.RESULTS.GRANTED;

    if (!scan || !connect) {
      return { ok: false as const, reason: "bluetooth" as const };
    }
    if (!location) {
      return { ok: false as const, reason: "location" as const };
    }
    return { ok: true as const };
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    return { ok: false as const, reason: "location" as const };
  }
  return { ok: true as const };
}

function permissionErrorMessage(reason: "bluetooth" | "location") {
  if (reason === "bluetooth") {
    return (
      "블루투스(주변 기기) 권한이 필요합니다.\n" +
      "설정 → 앱 → findy → 권한 → 「주변 기기」 또는 「블루투스」 허용"
    );
  }
  return (
    "위치 권한이 필요합니다 (Android BLE 스캔).\n" +
    "설정 → 앱 → findy → 권한 → 「위치」 허용"
  );
}

function waitForPoweredOn(ble: BleManager) {
  return new Promise<void>((resolve, reject) => {
    const subscription = ble.onStateChange((state) => {
      if (state === "PoweredOn") {
        subscription.remove();
        resolve();
      } else if (state === "PoweredOff") {
        subscription.remove();
        reject(new Error("블루투스가 꺼져 있습니다. 설정에서 블루투스를 켜 주세요."));
      } else if (state === "Unauthorized") {
        subscription.remove();
        reject(
          new Error(
            "블루투스 사용 권한이 없습니다.\n" +
              "설정 → 앱 → findy → 권한에서 「주변 기기」「블루투스」「위치」를 허용한 뒤 앱을 다시 실행하세요.",
          ),
        );
      }
    }, true);
  });
}

async function ensureBluetoothReady(ble: BleManager) {
  const state = await ble.state();
  if (state === "PoweredOn") {
    return;
  }
  if (state === "PoweredOff" && Platform.OS === "android") {
    try {
      await ble.enable();
    } catch {
      // 사용자가 취소한 경우 waitForPoweredOn에서 안내
    }
  }
  await waitForPoweredOn(ble);
}

function shouldProcessDevice(device: { id: string; rawScanRecord?: string | null; manufacturerData?: string | null }) {
  if (isPhysicalMinewMac(device.id)) {
    return { kind: "mac" as const };
  }
  const ad = device.rawScanRecord || device.manufacturerData;
  if (!ad || ad.length < 28) {
    return null;
  }
  if (deviceMayBePhysicalBeacon(device)) {
    return { kind: "ibeacon" as const };
  }
  return null;
}

export async function startBleScan(
  onScan: (scan: BeaconScan) => void,
  onError?: (error: Error) => void,
  onDebug?: (info: BleScanDebugInfo) => void,
): Promise<() => void> {
  const perm = await requestAndroidBlePermissions();
  if (!perm.ok) {
    throw new Error(permissionErrorMessage(perm.reason));
  }

  if (Platform.OS === "android") {
    const servicesOn = await Location.hasServicesEnabledAsync();
    if (!servicesOn) {
      throw new Error("위치(GPS) 서비스를 켜 주세요. Android BLE 스캔에 필요합니다.");
    }
  }

  destroyBleManager();
  const ble = getManager();
  await ensureBluetoothReady(ble);

  let otherPacketCount = 0;
  let parsedCount = 0;
  let minewMacCount = 0;
  let physicalAdCount = 0;
  let lastDebugAt = 0;
  let lastPhysicalSnapshot: BleDebugSnapshot | null = null;
  const sampleIds: string[] = [];

  ble.startDeviceScan(
    null,
    {
      allowDuplicates: true,
      scanMode: ScanMode.LowLatency,
      callbackType: ScanCallbackType.AllMatches,
      legacyScan: false,
    },
    (error, device) => {
      if (error) {
        onError?.(error);
        return;
      }
      if (!device) {
        return;
      }

      const match = shouldProcessDevice(device);
      if (!match) {
        otherPacketCount += 1;
        if (sampleIds.length < 6) {
          const id = formatBleMac(device.id);
          if (!sampleIds.includes(id)) {
            sampleIds.push(id);
          }
        }
        const now = Date.now();
        if (onDebug && now - lastDebugAt > 3000) {
          lastDebugAt = now;
          onDebug({
            parsedCount,
            minewMacCount,
            physicalAdCount,
            otherPacketCount,
            lastPhysical: lastPhysicalSnapshot,
            sampleIds: [...sampleIds],
          });
        }
        return;
      }

      if (match.kind === "mac") {
        minewMacCount += 1;
      } else {
        physicalAdCount += 1;
      }

      const mac = formatBleMac(device.id);
      const ad = describeBleAdvertisement(device);
      const parsed = parseBlePlxDevice(device);

      lastPhysicalSnapshot = {
        id: mac,
        matchKind: match.kind,
        rssi: device.rssi ?? null,
        mfgHex: ad.mfgHex,
        rawHex: ad.rawHex,
        has0215Raw: ad.has0215Raw,
        has0215Mfg: ad.has0215Mfg,
        parsedMinor: parsed?.minor ?? ad.parsedMinor,
        parsed: Boolean(parsed),
      };

      if (parsed) {
        parsedCount += 1;
        onScan({
          ...parsed,
          mac: parsed.mac ?? mac,
        });
      }

      const now = Date.now();
      if (onDebug && now - lastDebugAt > 3000) {
        lastDebugAt = now;
        onDebug({
          parsedCount,
          minewMacCount,
          physicalAdCount,
          otherPacketCount,
          lastPhysical: lastPhysicalSnapshot,
          sampleIds: [...sampleIds],
        });
      }
    },
  );

  return () => {
    ble.stopDeviceScan();
  };
}

export function destroyBleManager() {
  if (manager) {
    manager.stopDeviceScan().catch(() => {});
    manager.destroy();
    manager = null;
  }
}
