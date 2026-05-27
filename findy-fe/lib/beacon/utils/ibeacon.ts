// @ts-nocheck
import { Buffer } from "buffer";
import {
  formatBleMac,
  PHYSICAL_IBEACON_UUID,
} from "@/lib/beacon/config/physicalBeacons";
import { toKstIsoString } from "@/lib/beacon/utils/kstTime";

/** iBeacon 광고에 들어가는 UUID 바이트 (big-endian) */
const PHYSICAL_UUID_BYTES = new Uint8Array([
  0xe2, 0xc5, 0x6d, 0xb5, 0xdf, 0xfb, 0x48, 0xd2, 0xb0, 0x60, 0xd0, 0xf5, 0xa7,
  0x10, 0x96, 0xe0,
]);

export function bytesContainPhysicalBeaconUuid(bytes) {
  if (!bytes || bytes.length < 16) {
    return false;
  }
  for (let i = 0; i <= bytes.length - 16; i += 1) {
    let match = true;
    for (let j = 0; j < 16; j += 1) {
      if (bytes[i + j] !== PHYSICAL_UUID_BYTES[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return true;
    }
  }
  return false;
}

/** MAC 없이도 광고에 실물 UUID 가 있으면 true */
export function deviceMayBePhysicalBeacon(device) {
  if (!device) {
    return false;
  }
  const raw = decodeBase64Bytes(device.rawScanRecord);
  if (raw && bytesContainPhysicalBeaconUuid(raw)) {
    return true;
  }
  const mfg = decodeBase64Bytes(device.manufacturerData);
  return Boolean(mfg && bytesContainPhysicalBeaconUuid(mfg));
}

function readUuid(bytes, offset) {
  const hex = [];
  for (let i = 0; i < 16; i += 1) {
    hex.push(bytes[offset + i].toString(16).padStart(2, '0'));
  }
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-');
}

function parseIBeaconPayload(bytes, offset) {
  if (bytes.length < offset + 23) {
    return null;
  }
  if (bytes[offset] !== 0x02 || bytes[offset + 1] !== 0x15) {
    return null;
  }

  const uuid = readUuid(bytes, offset + 2);
  const major = (bytes[offset + 18] << 8) + bytes[offset + 19];
  const minor = (bytes[offset + 20] << 8) + bytes[offset + 21];
  const tx = bytes[offset + 22];

  return { uuid, major, minor, tx };
}

/**
 * Windows BeaconBleWindows/IBeaconParser.cs 와 동일
 * - CompanyId 0x004C 는 별도 필드
 * - data[0..1] == 0x02 0x15
 */
function parseAppleCompanyManufacturer(bytes) {
  if (!bytes || bytes.length < 25) {
    return null;
  }
  if (bytes[0] !== 0x4c || bytes[1] !== 0x00) {
    return null;
  }
  return parseIBeaconPayload(bytes, 2);
}

/** data만 0x02 0x15 로 시작 (CompanyId 제거된 페이로드) */
function parseIBeaconPayloadOnly(bytes) {
  if (!bytes || bytes.length < 23) {
    return null;
  }
  if (bytes[0] !== 0x02 || bytes[1] !== 0x15) {
    return null;
  }
  return parseIBeaconPayload(bytes, 0);
}

/** 바이트열 어디에든 iBeacon(0x02 0x15) 탐색 */
function findIBeaconInBytes(bytes) {
  if (!bytes || bytes.length < 23) {
    return null;
  }

  for (let i = 0; i <= bytes.length - 23; i += 1) {
    if (bytes[i] === 0x02 && bytes[i + 1] === 0x15) {
      const parsed = parseIBeaconPayload(bytes, i);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

export function parseManufacturerBytes(bytes) {
  if (!bytes || bytes.length < 23) {
    return null;
  }

  return (
    parseAppleCompanyManufacturer(bytes) ??
    parseIBeaconPayloadOnly(bytes) ??
    findIBeaconInBytes(bytes)
  );
}

function decodeBase64Bytes(base64) {
  if (!base64) {
    return null;
  }
  try {
    return Uint8Array.from(Buffer.from(base64, 'base64'));
  } catch {
    return null;
  }
}

export function parseManufacturerBase64(base64) {
  const bytes = decodeBase64Bytes(base64);
  if (!bytes) {
    return null;
  }
  return parseManufacturerBytes(bytes);
}

/** rawScanRecord 안의 모든 Manufacturer(0xFF) 블록 + 전체 바이트 스캔 */
export function parseRawScanRecordBase64(base64) {
  const bytes = decodeBase64Bytes(base64);
  if (!bytes || bytes.length < 4) {
    return null;
  }

  let offset = 0;
  while (offset < bytes.length) {
    const length = bytes[offset];
    if (length === 0) {
      break;
    }
    const type = bytes[offset + 1];
    const dataStart = offset + 2;
    const dataEnd = offset + 1 + length;
    if (dataEnd > bytes.length) {
      break;
    }

    if (type === 0xff) {
      const chunk = bytes.subarray(dataStart, dataEnd);
      const parsed = parseManufacturerBytes(chunk);
      if (parsed) {
        return parsed;
      }
    }

    offset = dataEnd;
  }

  return findAppleIBeaconPattern(bytes) ?? findIBeaconInBytes(bytes);
}

/** OEM raw: AD 구조와 무관하게 4c 00 02 15 패턴 검색 */
function findAppleIBeaconPattern(bytes) {
  if (!bytes || bytes.length < 25) {
    return null;
  }
  for (let i = 0; i <= bytes.length - 25; i += 1) {
    if (
      bytes[i] === 0x4c &&
      bytes[i + 1] === 0x00 &&
      bytes[i + 2] === 0x02 &&
      bytes[i + 3] === 0x15
    ) {
      const parsed = parseIBeaconPayload(bytes, i + 2);
      if (parsed) {
        return parsed;
      }
    }
  }
  return null;
}

/** Android: manufacturerData는 TLM 등 마지막 0xFF만 담는 경우 많음 → raw 우선 */
function extractIBeaconFromDevice(device) {
  if (!device) {
    return null;
  }

  if (device.rawScanRecord) {
    const fromRaw = parseRawScanRecordBase64(device.rawScanRecord);
    if (fromRaw) {
      return fromRaw;
    }
  }

  const fromMfg = parseManufacturerBase64(device.manufacturerData);
  if (fromMfg) {
    return fromMfg;
  }

  if (device.serviceData) {
    for (const value of Object.values(device.serviceData)) {
      const parsed = parseManufacturerBase64(value);
      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

export function describeBleAdvertisement(device) {
  const mfg = decodeBase64Bytes(device?.manufacturerData);
  const raw = decodeBase64Bytes(device?.rawScanRecord);
  const toHex = (arr, max = 24) =>
    arr
      ? [...arr.slice(0, max)]
          .map((b) => b.toString(16).padStart(2, '0'))
          .join(' ')
      : null;

  const peek = extractIBeaconFromDevice(device);

  return {
    id: device?.id ?? null,
    name: device?.localName ?? device?.name ?? null,
    mfgLen: mfg?.length ?? 0,
    mfgHex: toHex(mfg),
    rawLen: raw?.length ?? 0,
    rawHex: toHex(raw),
    has0215Mfg: mfg ? findIBeaconInBytes(mfg) != null : false,
    has0215Raw: raw ? findIBeaconInBytes(raw) != null : false,
    parsedMinor: peek?.minor ?? null,
    parsedUuid: peek?.uuid ?? null,
  };
}

export function parseBlePlxDevice(device) {
  const ibeacon = extractIBeaconFromDevice(device);
  if (!ibeacon) {
    return null;
  }

  const mac = formatBleMac(device.id) || null;

  return {
    timestampIso: toKstIsoString(),
    mac: mac || null,
    bluetoothAddressHex: mac ? mac.replace(/:/g, '') : null,
    rssi: device.rssi ?? null,
    uuid: ibeacon.uuid,
    major: ibeacon.major,
    minor: ibeacon.minor,
    tx: ibeacon.tx,
    localName: device.localName ?? device.name ?? null,
    uuidMatchesStore:
      ibeacon.uuid?.toLowerCase() === PHYSICAL_IBEACON_UUID.toLowerCase(),
  };
}

/** CSV/샘플 줄에서 minor → nearest_grid_id 매핑 추출 */
export function buildMinorMapFromScanLines(lines) {
  const map = {};
  for (const line of lines) {
    const scan = parseCsvScanLine(line);
    if (scan?.minor == null) {
      continue;
    }
    const gridId = scan.nearestGridId ?? scan.minor;
    map[String(scan.minor)] = gridId;
  }
  return map;
}

export function parseCsvScanLine(line) {
  const parts = line.trim().split(',');
  if (parts.length < 9) {
    return null;
  }

  return {
    timestampIso: parts[0],
    mac: parts[1],
    bluetoothAddressHex: parts[2],
    rssi: Number(parts[3]),
    uuid: parts[4],
    major: Number(parts[5]),
    minor: Number(parts[6]),
    tx: Number(parts[7]),
    nearestGridId: Number(parts[8]),
  };
}
