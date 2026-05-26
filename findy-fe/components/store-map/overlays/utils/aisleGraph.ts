import type { StoreCellMapping } from "../../types";
import type { MapPixelPoint } from "../types";
import { gridCellCenterToPixel } from "./gridToPixel";

export type GridNode = { x: number; y: number };

const NEIGHBORS: GridNode[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function buildWalkableAisleKeys(cells: StoreCellMapping[]): Set<string> {
  const keys = new Set<string>();
  for (const cell of cells) {
    if (cell.type === "aisle") {
      keys.add(cellKey(cell.x, cell.y));
    }
  }
  return keys;
}

function manhattan(a: GridNode, b: GridNode): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function nearestWalkableNode(
  gridX: number,
  gridY: number,
  walkable: Set<string>,
  cols: number,
  rows: number
): GridNode | null {
  const startKey = cellKey(gridX, gridY);
  if (walkable.has(startKey)) {
    return { x: gridX, y: gridY };
  }

  const visited = new Set<string>([startKey]);
  const queue: GridNode[] = [{ x: gridX, y: gridY }];

  while (queue.length > 0) {
    const node = queue.shift()!;
    for (const d of NEIGHBORS) {
      const nx = node.x + d.x;
      const ny = node.y + d.y;
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
      const key = cellKey(nx, ny);
      if (visited.has(key)) continue;
      visited.add(key);
      if (walkable.has(key)) {
        return { x: nx, y: ny };
      }
      queue.push({ x: nx, y: ny });
    }
  }

  return null;
}

export function bfsPath(
  from: GridNode,
  to: GridNode,
  walkable: Set<string>
): GridNode[] | null {
  if (!walkable.has(cellKey(from.x, from.y)) || !walkable.has(cellKey(to.x, to.y))) {
    return null;
  }

  const goalKey = cellKey(to.x, to.y);
  const queue: GridNode[] = [from];
  const cameFrom = new Map<string, string | null>();
  cameFrom.set(cellKey(from.x, from.y), null);

  while (queue.length > 0) {
    const node = queue.shift()!;
    const key = cellKey(node.x, node.y);
    if (key === goalKey) {
      const path: GridNode[] = [];
      let cur: string | null = key;
      while (cur != null) {
        const [sx, sy] = cur.split(",").map(Number);
        path.push({ x: sx, y: sy });
        cur = cameFrom.get(cur) ?? null;
      }
      path.reverse();
      return path;
    }

    for (const d of NEIGHBORS) {
      const nx = node.x + d.x;
      const ny = node.y + d.y;
      const nKey = cellKey(nx, ny);
      if (!walkable.has(nKey) || cameFrom.has(nKey)) continue;
      cameFrom.set(nKey, key);
      queue.push({ x: nx, y: ny });
    }
  }

  return null;
}

export function aislePathStepCount(
  from: GridNode,
  to: GridNode,
  walkable: Set<string>
): number {
  if (from.x === to.x && from.y === to.y) return 0;
  const path = bfsPath(from, to, walkable);
  if (!path) return Infinity;
  return path.length - 1;
}

function pickClosestAisle(from: GridNode, candidates: GridNode[]): GridNode | null {
  if (candidates.length === 0) return null;
  let best = candidates[0];
  let bestDist = manhattan(from, best);
  for (let i = 1; i < candidates.length; i++) {
    const dist = manhattan(from, candidates[i]);
    if (dist < bestDist) {
      best = candidates[i];
      bestDist = dist;
    }
  }
  return best;
}

export function goalAisleForGridCell(
  gridX: number,
  gridY: number,
  walkable: Set<string>,
  cols: number,
  rows: number
): GridNode | null {
  const direct = cellKey(gridX, gridY);
  if (walkable.has(direct)) {
    return { x: gridX, y: gridY };
  }

  const candidates: GridNode[] = [];
  for (const d of NEIGHBORS) {
    const nx = gridX + d.x;
    const ny = gridY + d.y;
    const key = cellKey(nx, ny);
    if (walkable.has(key)) {
      candidates.push({ x: nx, y: ny });
    }
  }
  if (candidates.length > 0) {
    return pickClosestAisle({ x: gridX, y: gridY }, candidates);
  }

  return nearestWalkableNode(gridX, gridY, walkable, cols, rows);
}

export function nodesToPixelPath(nodes: GridNode[], cellPx: number): MapPixelPoint[] {
  return nodes.map((n) => gridCellCenterToPixel(n.x, n.y, cellPx));
}
