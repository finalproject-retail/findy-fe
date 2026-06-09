export function formatAverageStayDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  if (safeSeconds < 60) {
    return `${safeSeconds}초`;
  }

  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  if (remainder === 0) {
    return `${minutes}분`;
  }

  return `${minutes}분 ${remainder}초`;
}
