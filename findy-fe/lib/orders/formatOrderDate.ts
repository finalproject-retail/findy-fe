export function formatOrderDisplayDate(orderedAt: string): string {
  const date = new Date(orderedAt);
  if (!Number.isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  }

  const [year, month, day] = orderedAt.slice(0, 10).split("-");
  if (year && month && day) {
    return `${year}.${month}.${day}`;
  }

  return orderedAt;
}
