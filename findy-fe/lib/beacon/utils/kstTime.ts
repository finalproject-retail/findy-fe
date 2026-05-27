/** 대한민국 표준시(Asia/Seoul, UTC+9, 서머타임 없음) ISO-8601 문자열 */
export function toKstIsoString(date: Date = new Date()): string {
  const ms = date.getTime();
  const d = new Date(ms + 9 * 60 * 60 * 1000);
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  const y = d.getUTCFullYear();
  const mo = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const h = d.getUTCHours();
  const mi = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  const f = d.getUTCMilliseconds();
  return `${y}-${pad(mo)}-${pad(day)}T${pad(h)}:${pad(mi)}:${pad(s)}.${pad(f, 3)}+09:00`;
}
