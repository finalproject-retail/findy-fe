import type { StoreMapConfig } from "../../types";
import type { CurrentLocationMock, ShoppingMapItem } from "../types";
import {
  bfsPath,
  buildWalkableAisleKeys,
  goalAisleForGridCell,
  nearestWalkableNode,
  type GridNode,
} from "./aisleGraph";

export type { GridNode } from "./aisleGraph";
export {
  aislePathStepCount,
  bfsPath,
  buildWalkableAisleKeys,
  goalAisleForGridCell,
  nearestWalkableNode,
  nodesToPixelPath,
} from "./aisleGraph";

/**
 * 현위치 → 최소 통로 동선 순으로 각 상품 통로 — 구간별 BFS 최단
 */
export function splitRouteAtShoppingGoals(
  config: StoreMapConfig,
  location: CurrentLocationMock,
  items: ShoppingMapItem[]
): GridNode[][] {
  const walkable = buildWalkableAisleKeys(config.cells);
  const legs: GridNode[][] = [];

  let cursor = nearestWalkableNode(
    location.gridX,
    location.gridY,
    walkable,
    config.cols,
    config.rows
  );
  if (!cursor) {
    return legs;
  }

  for (const item of items) {
    const goal = goalAisleForGridCell(
      item.gridX,
      item.gridY,
      walkable,
      config.cols,
      config.rows
    );
    if (!goal) continue;

    const leg = bfsPath(cursor, goal, walkable);
    if (!leg || leg.length < 2) continue;

    legs.push(leg);
    cursor = goal;
  }

  return legs;
}
