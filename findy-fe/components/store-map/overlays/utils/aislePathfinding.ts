import type { StoreMapConfig } from "../../types";
import type { CurrentLocationMock, ShoppingMapItem } from "../types";
import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import type { PathNavigationApi } from "@/lib/map/types";
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

function cellKey(x: number, y: number): string {
  return `${x},${y}`;
}

function isAdjacent(a: GridNode, b: GridNode): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function dedupeConsecutiveNodes(nodes: GridNode[]): GridNode[] {
  const result: GridNode[] = [];
  for (const node of nodes) {
    const last = result[result.length - 1];
    if (last && last.x === node.x && last.y === node.y) {
      continue;
    }
    result.push(node);
  }
  return result;
}

function pathGridIdsToNodes(
  pathGridIds: number[],
  cols: number,
): GridNode[] {
  return pathGridIds.map((gridId) => {
    const { gridX, gridY } = gridIdToGridPoint(gridId, cols);
    return { x: gridX, y: gridY };
  });
}

function goalAisleForItem(
  item: ShoppingMapItem,
  config: StoreMapConfig,
  walkable: Set<string>,
): GridNode | null {
  const { gridX, gridY } =
    item.gridId != null
      ? gridIdToGridPoint(item.gridId, config.cols)
      : { gridX: item.gridX, gridY: item.gridY };

  return goalAisleForGridCell(
    gridX,
    gridY,
    walkable,
    config.cols,
    config.rows,
  );
}

/** 통로 격자만 남기고, 비인접 구간은 BFS로만 연결 (대각선 직선 금지) */
export function sanitizeWalkablePath(
  nodes: GridNode[],
  walkable: Set<string>,
): GridNode[] {
  const walkableNodes = nodes.filter((node) =>
    walkable.has(cellKey(node.x, node.y)),
  );
  if (walkableNodes.length < 2) {
    return walkableNodes;
  }

  const result: GridNode[] = [walkableNodes[0]!];
  for (let i = 1; i < walkableNodes.length; i++) {
    const prev = result[result.length - 1]!;
    const next = walkableNodes[i]!;

    if (prev.x === next.x && prev.y === next.y) {
      continue;
    }

    if (isAdjacent(prev, next)) {
      result.push(next);
      continue;
    }

    const bridge = bfsPath(prev, next, walkable);
    if (bridge && bridge.length > 1) {
      result.push(...bridge.slice(1));
    }
  }

  return dedupeConsecutiveNodes(result);
}

function mergeLegNodes(
  merged: GridNode[],
  legNodes: GridNode[],
  walkable: Set<string>,
): GridNode[] {
  if (legNodes.length === 0) {
    return merged;
  }

  if (merged.length === 0) {
    return [...legNodes];
  }

  const combined = [...merged, ...legNodes];
  return sanitizeWalkablePath(combined, walkable);
}

export type RenderableNavigationPath = {
  nodes: GridNode[];
  legEndIndices: number[];
};

export function buildRenderableNavigationPath(
  pathNavigation: PathNavigationApi,
  config: StoreMapConfig,
): RenderableNavigationPath {
  const walkable = buildWalkableAisleKeys(config.cells);

  let merged: GridNode[] = [];
  const legEndIndices: number[] = [];

  for (const apiLeg of pathNavigation.legs) {
    const legNodes = pathGridIdsToNodes(apiLeg.pathGridIds, config.cols);
    merged = mergeLegNodes(merged, legNodes, walkable);
    legEndIndices.push(Math.max(0, merged.length - 1));
  }

  const nodes = sanitizeWalkablePath(merged, walkable);
  const normalizedLegEnds = legEndIndices.map((endIndex) => {
    const target = merged[Math.min(endIndex, merged.length - 1)];
    if (!target) {
      return nodes.length - 1;
    }
    const idx = nodes.findIndex(
      (node) => node.x === target.x && node.y === target.y,
    );
    return idx >= 0 ? idx : nodes.length - 1;
  });

  return { nodes, legEndIndices: normalizedLegEnds };
}

export function buildRenderablePathFromLocalLegs(
  legs: GridNode[][],
  config: StoreMapConfig,
): RenderableNavigationPath {
  const walkable = buildWalkableAisleKeys(config.cells);
  let merged: GridNode[] = [];
  const legEndIndices: number[] = [];

  for (const leg of legs) {
    merged = mergeLegNodes(merged, leg, walkable);
    legEndIndices.push(Math.max(0, merged.length - 1));
  }

  return {
    nodes: sanitizeWalkablePath(merged, walkable),
    legEndIndices,
  };
}

/** @deprecated buildRenderableNavigationPath 사용 */
export type ContinuousAislePath = {
  nodes: GridNode[];
  legEndIndices: number[];
};

export function buildContinuousAislePathFromNavigation(
  pathNavigation: PathNavigationApi,
  config: StoreMapConfig,
): ContinuousAislePath {
  const walkable = buildWalkableAisleKeys(config.cells);
  let merged: GridNode[] = [];
  const legEndIndices: number[] = [];

  for (const apiLeg of pathNavigation.legs) {
    const legNodes = pathGridIdsToNodes(apiLeg.pathGridIds, config.cols);
    merged = mergeLegNodes(merged, legNodes, walkable);
    legEndIndices.push(Math.max(0, merged.length - 1));
  }

  return {
    nodes: sanitizeWalkablePath(merged, walkable),
    legEndIndices,
  };
}

export function buildAisleLegsForShoppingItems(
  config: StoreMapConfig,
  location: CurrentLocationMock,
  items: ShoppingMapItem[],
): GridNode[][] {
  const walkable = buildWalkableAisleKeys(config.cells);
  const legs: GridNode[][] = [];

  let cursor = nearestWalkableNode(
    location.gridX,
    location.gridY,
    walkable,
    config.cols,
    config.rows,
  );
  if (!cursor) {
    return legs;
  }

  for (const item of items) {
    const goal = goalAisleForItem(item, config, walkable);
    if (!goal) {
      continue;
    }

    let leg: GridNode[];
    if (cursor.x === goal.x && cursor.y === goal.y) {
      leg = [cursor];
    } else {
      const path = bfsPath(cursor, goal, walkable);
      if (!path || path.length === 0) {
        continue;
      }
      leg = path;
    }

    if (leg.length >= 1) {
      legs.push(leg);
    }
    cursor = goal;
  }

  return legs;
}

export function mergeAisleLegsIntoContinuousPath(
  legs: GridNode[][],
  config: StoreMapConfig,
): ContinuousAislePath {
  const walkable = buildWalkableAisleKeys(config.cells);
  let merged: GridNode[] = [];
  const legEndIndices: number[] = [];

  for (const leg of legs) {
    merged = mergeLegNodes(merged, leg, walkable);
    legEndIndices.push(Math.max(0, merged.length - 1));
  }

  return {
    nodes: sanitizeWalkablePath(merged, walkable),
    legEndIndices,
  };
}
