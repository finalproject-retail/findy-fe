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

/** API 경로 첫 칸이 지도 현재 위치와 다를 때 출발 구간을 현위치에 맞춤 */
export function adjustPathLegsToStartFromLocation(
  config: StoreMapConfig,
  location: CurrentLocationMock,
  legs: GridNode[][],
): GridNode[][] {
  if (legs.length === 0) {
    return legs;
  }

  const walkable = buildWalkableAisleKeys(config.cells);
  const start = nearestWalkableNode(
    location.gridX,
    location.gridY,
    walkable,
    config.cols,
    config.rows,
  );
  if (!start) {
    return legs;
  }

  const firstLeg = legs[0];
  const firstNode = firstLeg[0];
  if (firstNode.x === start.x && firstNode.y === start.y) {
    return legs;
  }

  const connector = bfsPath(start, firstNode, walkable);
  if (!connector || connector.length < 2) {
    return [{ ...firstLeg, 0: start }, ...legs.slice(1)];
  }

  return [[...connector.slice(0, -1), ...firstLeg], ...legs.slice(1)];
}
