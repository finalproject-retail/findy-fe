export type BeaconScan = {
  timestampIso?: string;
  mac?: string | null;
  bluetoothAddressHex?: string | null;
  rssi?: number | null;
  uuid?: string;
  major?: number;
  minor?: number;
  tx?: number;
  nearestGridId?: number | string;
  localName?: string | null;
};
