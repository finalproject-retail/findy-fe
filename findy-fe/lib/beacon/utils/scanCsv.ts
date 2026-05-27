import type { BeaconScan } from "@/lib/beacon/types";
import { toKstIsoString } from "@/lib/beacon/utils/kstTime";

export const SCAN_CSV_HEADER =
  "timestamp_iso,mac,bluetooth_address_hex,rssi,uuid,major,minor,tx,nearest_grid_id";

export type BeaconScanLogRow = BeaconScan & {
  nearestGridId: number | string;
};

export function formatBluetoothAddressHex(macOrHex?: string | null) {
  if (!macOrHex) {
    return "";
  }
  const raw = String(macOrHex).trim();
  if (raw.toLowerCase().startsWith("0x")) {
    return raw;
  }
  const hex = raw.replace(/:/g, "").toUpperCase();
  return hex ? `0x${hex}` : "";
}

export function scanToCsvLine(scan: BeaconScanLogRow) {
  const ts = scan.timestampIso ?? toKstIsoString();
  const mac = scan.mac ?? "";
  const addr = scan.bluetoothAddressHex
    ? formatBluetoothAddressHex(scan.bluetoothAddressHex)
    : formatBluetoothAddressHex(mac);
  const grid =
    scan.nearestGridId === "" || scan.nearestGridId == null
      ? ""
      : String(scan.nearestGridId);

  return [
    ts,
    mac,
    addr,
    scan.rssi ?? "",
    scan.uuid ?? "",
    scan.major ?? "",
    scan.minor ?? "",
    scan.tx ?? "",
    grid,
  ].join(",");
}

export function scansToCsv(scans: BeaconScanLogRow[]) {
  const lines = [SCAN_CSV_HEADER, ...scans.map(scanToCsvLine)];
  return `${lines.join("\n")}\n`;
}

export function defaultScanCsvFilename() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `beacon_scans_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.csv`;
}
