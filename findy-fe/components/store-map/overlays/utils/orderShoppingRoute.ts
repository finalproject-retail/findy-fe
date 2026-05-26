import type { StoreMapConfig } from "../../types";
import type { CurrentLocationMock, ShoppingMapItem } from "../types";
import {
  aislePathStepCount,
  buildWalkableAisleKeys,
  goalAisleForGridCell,
  nearestWalkableNode,
  type GridNode,
} from "./aisleGraph";

const MAX_EXACT_PERMUTE = 8;

type ItemRouteContext = {
  walkable: Set<string>;
  start: GridNode;
  goals: (GridNode | null)[];
  startDist: number[];
  itemDist: number[][];
};

function buildItemRouteContext(
  config: StoreMapConfig,
  location: CurrentLocationMock,
  items: ShoppingMapItem[]
): ItemRouteContext | null {
  const walkable = buildWalkableAisleKeys(config.cells);
  const start = nearestWalkableNode(
    location.gridX,
    location.gridY,
    walkable,
    config.cols,
    config.rows
  );
  if (!start) return null;

  const goals = items.map((item) =>
    goalAisleForGridCell(item.gridX, item.gridY, walkable, config.cols, config.rows)
  );

  const n = items.length;
  const startDist = goals.map((goal) =>
    goal == null ? Infinity : aislePathStepCount(start, goal, walkable)
  );

  const itemDist: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const gi = goals[i];
      const gj = goals[j];
      let steps = 0;
      if (gi == null || gj == null) {
        steps = Infinity;
      } else if (i === j || (gi.x === gj.x && gi.y === gj.y)) {
        steps = 0;
      } else {
        steps = aislePathStepCount(gi, gj, walkable);
      }
      itemDist[i][j] = steps;
      itemDist[j][i] = steps;
    }
  }

  return { walkable, start, goals, startDist, itemDist };
}

function openPathCost(order: number[], startDist: number[], itemDist: number[][]): number {
  if (order.length === 0) return 0;
  let cost = startDist[order[0]] ?? Infinity;
  for (let i = 1; i < order.length; i++) {
    cost += itemDist[order[i - 1]]?.[order[i]] ?? Infinity;
  }
  return cost;
}

/** n≤8: 전 순열, 그 이상: nearest-neighbor + 2-opt (통로 BFS 거리 기준) */
function solveMinimumVisitIndices(
  n: number,
  startDist: number[],
  itemDist: number[][]
): number[] {
  if (n === 0) return [];
  if (n === 1) return [0];

  if (n <= MAX_EXACT_PERMUTE) {
    const indices = Array.from({ length: n }, (_, i) => i);
    let bestOrder = indices;
    let bestCost = Infinity;

    const permute = (chosen: number[], remaining: number[]) => {
      if (remaining.length === 0) {
        const cost = openPathCost(chosen, startDist, itemDist);
        if (cost < bestCost) {
          bestCost = cost;
          bestOrder = chosen;
        }
        return;
      }
      for (let i = 0; i < remaining.length; i++) {
        const next = remaining[i];
        permute(
          [...chosen, next],
          [...remaining.slice(0, i), ...remaining.slice(i + 1)]
        );
      }
    };

    permute([], indices);
    return bestOrder;
  }

  const visited = new Set<number>();
  const order: number[] = [];
  let current = -1;

  for (let step = 0; step < n; step++) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (visited.has(i)) continue;
      const d = current < 0 ? startDist[i] : itemDist[current][i];
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) break;
    visited.add(best);
    order.push(best);
    current = best;
  }

  return twoOptOpenPath(order, startDist, itemDist);
}

function twoOptOpenPath(
  order: number[],
  startDist: number[],
  itemDist: number[][]
): number[] {
  let best = order;
  let bestCost = openPathCost(best, startDist, itemDist);
  let improved = true;

  while (improved) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        const cost = openPathCost(candidate, startDist, itemDist);
        if (cost < bestCost) {
          best = candidate;
          bestCost = cost;
          improved = true;
        }
      }
    }
  }

  return best;
}

/**
 * 현위치에서 출발해 모든 장바구니 상품을 한 번씩 방문하는 **최소 통로 동선** 순서.
 * 구간별 경로는 통로 격자 BFS 최단; 방문 순서는 BFS 거리 합이 최소가 되도록 계산.
 */
export function orderShoppingMinimumRoute(
  config: StoreMapConfig,
  location: CurrentLocationMock,
  items: ShoppingMapItem[]
): ShoppingMapItem[] {
  if (items.length <= 1) return [...items];

  const ctx = buildItemRouteContext(config, location, items);
  if (!ctx) return [...items];

  const indices = solveMinimumVisitIndices(
    items.length,
    ctx.startDist,
    ctx.itemDist
  );

  return indices.map((i) => items[i]);
}
