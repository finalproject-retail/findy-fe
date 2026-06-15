/** API isFirstLogin — boolean 또는 스펙상 String("true"/"false" 등) */
export function parseIsFirstLoginFlag(
  value: unknown,
  defaultWhenMissing: boolean,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (
      normalized === "true" ||
      normalized === "y" ||
      normalized === "yes" ||
      normalized === "1"
    ) {
      return true;
    }
    if (
      normalized === "false" ||
      normalized === "n" ||
      normalized === "no" ||
      normalized === "0"
    ) {
      return false;
    }
  }

  if (typeof value === "number") {
    if (value === 1) {
      return true;
    }
    if (value === 0) {
      return false;
    }
  }

  return defaultWhenMissing;
}

export function parseIsFirstLoginFromRecord(
  record: { isFirstLogin?: unknown; firstLogin?: unknown } | undefined,
  defaultWhenMissing: boolean,
): boolean {
  if (!record) {
    return defaultWhenMissing;
  }

  if (record.isFirstLogin != null) {
    return parseIsFirstLoginFlag(record.isFirstLogin, defaultWhenMissing);
  }

  if (record.firstLogin != null) {
    return parseIsFirstLoginFlag(record.firstLogin, defaultWhenMissing);
  }

  return defaultWhenMissing;
}
