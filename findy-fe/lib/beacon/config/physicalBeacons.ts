/** 실물 Minew 4대 — C# / 비콘 매니저 수신값과 동일 */
export const PHYSICAL_IBEACON_UUID = 'e2c56db5-dffb-48d2-b060-d0f5a71096e0';

export const PHYSICAL_BEACON_MACS = [
  'C3:00:00:3F:45:26',
  'C3:00:00:3F:45:27',
  'C3:00:00:3F:45:16',
  'C3:00:00:3F:45:1A',
];

/** C# / 비콘 매니저에서 확인된 minor */
export const PHYSICAL_IBEACON_MINORS = [56337, 56338, 56321, 56325];

export function normalizeBleMac(mac: string | null | undefined) {
  return mac ? String(mac).trim().toUpperCase() : "";
}

/** ble-plx: "C3:00:00:3F:45:26" 또는 "C300003F4526" */
export function formatBleMac(deviceId: string | null | undefined) {
  const raw = normalizeBleMac(deviceId);
  if (!raw) {
    return "";
  }
  if (raw.includes(":")) {
    return raw;
  }
  if (/^[0-9A-F]{12}$/.test(raw)) {
    const pairs = raw.match(/.{1,2}/g);
    return pairs ? pairs.join(":") : raw;
  }
  return raw;
}

/** Android ble-plx device.id 가 MAC 형태일 때 실물 비콘 여부 */
export function isPhysicalMinewMac(deviceId: string | null | undefined) {
  const mac = formatBleMac(deviceId);
  if (!mac.includes(':')) {
    return false;
  }
  if (PHYSICAL_BEACON_MACS.includes(mac)) {
    return true;
  }
  return mac.startsWith('C3:00:00:3F');
}
