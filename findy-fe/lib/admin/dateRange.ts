import type { AdminDateRange } from "@/lib/admin/mockDashboardData";

/** AdminDateRange — YY.MM.DD */
export function parseAdminDate(value: string): Date | null {
  const parts = value.trim().split(".");
  if (parts.length !== 3) return null;

  const [yy, mm, dd] = parts.map((part) => Number(part));
  if ([yy, mm, dd].some((n) => Number.isNaN(n))) return null;

  const year = yy < 100 ? 2000 + yy : yy;
  const date = new Date(year, mm - 1, dd);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }

  return date;
}

export function formatAdminDate(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}.${mm}.${dd}`;
}

/** DatePickerModal — YYYY.MM.DD */
export function adminDateToPickerValue(value: string): string {
  const date = parseAdminDate(value);
  if (!date) return value;

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export function pickerValueToAdminDate(value: string): string {
  const parts = value.trim().split(".");
  if (parts.length !== 3) return value;

  const [yyyy, mm, dd] = parts;
  if ([yyyy, mm, dd].some((part) => !part)) return value;

  return `${yyyy.slice(-2)}.${mm.padStart(2, "0")}.${dd.padStart(2, "0")}`;
}

export function compareAdminDates(a: string, b: string): number {
  const dateA = parseAdminDate(a);
  const dateB = parseAdminDate(b);
  if (!dateA || !dateB) return 0;
  return dateA.getTime() - dateB.getTime();
}

export function normalizeAdminDateRange(range: AdminDateRange): AdminDateRange {
  if (compareAdminDates(range.start, range.end) <= 0) {
    return range;
  }

  return { start: range.end, end: range.start };
}

export function applyAdminDateChange(
  range: AdminDateRange,
  target: "start" | "end",
  pickerValue: string,
): AdminDateRange {
  const nextValue = pickerValueToAdminDate(pickerValue);
  const next: AdminDateRange = {
    ...range,
    [target === "start" ? "start" : "end"]: nextValue,
  };

  if (compareAdminDates(next.start, next.end) > 0) {
    if (target === "start") {
      return { start: next.start, end: next.start };
    }
    return { start: next.end, end: next.end };
  }

  return next;
}
