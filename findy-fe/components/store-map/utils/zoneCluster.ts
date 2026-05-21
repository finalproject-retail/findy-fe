import type { CategoryZone, ShelfUnit } from "../types";

export function getUnitZoneCategory(unit: ShelfUnit): string | null {
  if (unit.kind !== "island") return null;
  if (!unit.secondary) return unit.primary.category;
  if (unit.primary.category === unit.secondary.category) {
    return unit.primary.category;
  }
  return null;
}

/** 격자 bbox가 맞닿거나 1칸 통로만 떨어진 경우 (margin 확장 없음) */
function unitsAreNeighbors(a: ShelfUnit, b: ShelfUnit): boolean {
  const gapX = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width));
  const gapY = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height));
  return gapX <= 1 && gapY <= 1;
}

function unitToZone(unit: ShelfUnit, id: string): CategoryZone {
  return {
    id,
    category: unit.primary.category,
    x: unit.x,
    y: unit.y,
    width: unit.width,
    height: unit.height,
    unitCount: 1,
  };
}

/** 중앙 매대만 동일 카테고리끼리 병합. 외곽 벽은 구간별 단독 존. */
export function computeCategoryZones(units: ShelfUnit[]): CategoryZone[] {
  const islandUnits = units.filter((u) => u.kind === "island");
  const mergeable = islandUnits
    .map((unit) => ({ unit, category: getUnitZoneCategory(unit) }))
    .filter((e): e is { unit: ShelfUnit; category: string } => e.category !== null);

  const visited = new Set<string>();
  const zones: CategoryZone[] = [];
  let zoneIndex = 0;

  for (const { unit: start, category } of mergeable) {
    if (visited.has(start.id)) continue;

    const members: ShelfUnit[] = [];
    const queue = [start];
    visited.add(start.id);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      members.push(curr);

      for (const other of mergeable) {
        if (visited.has(other.unit.id)) continue;
        if (other.category !== category) continue;
        if (!unitsAreNeighbors(curr, other.unit)) continue;
        visited.add(other.unit.id);
        queue.push(other.unit);
      }
    }

    const x0 = Math.min(...members.map((m) => m.x));
    const y0 = Math.min(...members.map((m) => m.y));
    const x1 = Math.max(...members.map((m) => m.x + m.width));
    const y1 = Math.max(...members.map((m) => m.y + m.height));

    zones.push({
      id: `zone-${zoneIndex++}`,
      category,
      x: x0,
      y: y0,
      width: x1 - x0,
      height: y1 - y0,
      unitCount: members.length,
    });
  }

  for (const unit of units) {
    if (unit.kind !== "perimeter" && unit.kind !== "service") continue;
    zones.push(unitToZone(unit, `zone-edge-${unit.id}`));
  }

  return zones;
}
