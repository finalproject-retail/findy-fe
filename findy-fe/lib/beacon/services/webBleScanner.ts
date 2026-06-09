import { PHYSICAL_IBEACON_UUID } from "@/lib/beacon/config/physicalBeacons";
import type { BeaconScan } from "@/lib/beacon/types";
import { parseManufacturerBytes } from "@/lib/beacon/utils/ibeacon";
import { toKstIsoString } from "@/lib/beacon/utils/kstTime";

const APPLE_COMPANY_ID = 0x004c;

function bytesFromDataView(view: DataView): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

function parseWebBluetoothAdvertisement(
  event: BluetoothAdvertisingEvent,
): BeaconScan | null {
  const manufacturerData = event.manufacturerData;
  if (!manufacturerData?.size) {
    return null;
  }

  const appleData = manufacturerData.get(APPLE_COMPANY_ID);
  const entries = appleData
    ? [[APPLE_COMPANY_ID, appleData] as const]
    : [...manufacturerData.entries()];

  for (const [companyId, view] of entries) {
    const bytes = bytesFromDataView(view);
    const parsed =
      parseManufacturerBytes(bytes) ??
      parseManufacturerBytes(
        new Uint8Array([companyId & 0xff, (companyId >> 8) & 0xff, ...bytes]),
      );

    if (!parsed) {
      continue;
    }

    if (parsed.uuid?.toLowerCase() !== PHYSICAL_IBEACON_UUID.toLowerCase()) {
      continue;
    }

    return {
      timestampIso: toKstIsoString(),
      mac: event.device?.id ?? null,
      bluetoothAddressHex: event.device?.id ?? null,
      rssi: event.rssi ?? null,
      uuid: parsed.uuid,
      major: parsed.major,
      minor: parsed.minor,
      tx: parsed.tx,
      localName: event.name ?? event.device?.name ?? null,
    };
  }

  return null;
}

export async function startWebBleScan(
  onScan: (scan: BeaconScan) => void,
  onError?: (error: Error) => void,
): Promise<() => void> {
  if (typeof navigator === "undefined" || !navigator.bluetooth?.requestLEScan) {
    throw new Error(
      "Web Bluetooth LE scanning is not supported. Use Android Chrome with Web Bluetooth enabled.",
    );
  }

  const onAdvertisement = (event: BluetoothAdvertisingEvent) => {
    try {
      const scan = parseWebBluetoothAdvertisement(event);
      if (scan) {
        onScan(scan);
      }
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to parse Web Bluetooth advertisement."),
      );
    }
  };

  navigator.bluetooth.addEventListener(
    "advertisementreceived",
    onAdvertisement,
  );

  let scan: BluetoothLeScan;
  try {
    scan = await navigator.bluetooth.requestLEScan({
      acceptAllAdvertisements: true,
      keepRepeatedDevices: true,
    });
  } catch (error) {
    navigator.bluetooth.removeEventListener(
      "advertisementreceived",
      onAdvertisement,
    );
    throw error;
  }

  return () => {
    navigator.bluetooth?.removeEventListener(
      "advertisementreceived",
      onAdvertisement,
    );
    if (scan.active) {
      scan.stop();
    }
  };
}
