type BluetoothLeScanOptions = {
  acceptAllAdvertisements?: boolean;
  keepRepeatedDevices?: boolean;
};

type BluetoothLeScan = {
  active: boolean;
  stop: () => void;
};

type BluetoothAdvertisingEvent = Event & {
  device: {
    id?: string;
    name?: string;
  };
  name?: string;
  rssi?: number;
  txPower?: number;
  manufacturerData?: Map<number, DataView>;
};

interface Bluetooth extends EventTarget {
  requestLEScan?: (options?: BluetoothLeScanOptions) => Promise<BluetoothLeScan>;
  addEventListener(
    type: "advertisementreceived",
    listener: (event: BluetoothAdvertisingEvent) => void,
  ): void;
  removeEventListener(
    type: "advertisementreceived",
    listener: (event: BluetoothAdvertisingEvent) => void,
  ): void;
}

interface Navigator {
  bluetooth?: Bluetooth;
}
