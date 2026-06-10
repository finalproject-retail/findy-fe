import type { NavigationPathSegment } from "../types";
import type { GridNode } from "./aisleGraph";
import { nodesToPixelPath } from "./aisleGraph";
import { sanitizeWalkablePath } from "./aislePathfinding";
import type { StoreMapConfig } from "../../types";
import { buildWalkableAisleKeys } from "./aisleGraph";

export function sortShoppingByVisitOrder<T extends { visitOrder: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => a.visitOrder - b.visitOrder);
}

function isAdjacent(a: GridNode, b: GridNode): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

/** 지나온 구간·바코드 스캔 완료 구간은 점선, 앞으로 갈 길은 실선 */
export function buildNavigationPathSegmentsFromAisleLegs(
  legs: GridNode[][],
  cellPx: number,
  isLegDashed: (legIndex: number) => boolean,
): NavigationPathSegment[] {
  const segments: NavigationPathSegment[] = [];

  legs.forEach((leg, legIndex) => {
    const variant = isLegDashed(legIndex) ? "dashed" : "solid";
    const pixels = nodesToPixelPath(leg, cellPx);

    for (let i = 0; i < pixels.length - 1; i++) {
      segments.push({
        from: pixels[i]!,
        to: pixels[i + 1]!,
        variant,
      });
    }
  });

  return segments;
}

/** 인접 통로 격자만 직선으로 연결 — 비인접 구간은 그리지 않음 */
export function buildNavigationPathSegmentsFromNodes(
  nodes: GridNode[],
  cellPx: number,
  config: StoreMapConfig,
  legEndIndices: number[],
  isLegDashed: (legIndex: number) => boolean,
): NavigationPathSegment[] {
  const walkable = buildWalkableAisleKeys(config.cells);
  const sanitized = sanitizeWalkablePath(nodes, walkable);
  if (sanitized.length < 2) {
    return [];
  }

  const segments: NavigationPathSegment[] = [];

  for (let i = 0; i < sanitized.length - 1; i++) {
    const fromNode = sanitized[i]!;
    const toNode = sanitized[i + 1]!;

    if (!isAdjacent(fromNode, toNode)) {
      continue;
    }

    let resolvedLegIndex = legEndIndices.length - 1;
    for (let leg = 0; leg < legEndIndices.length; leg++) {
      const segmentStart = leg === 0 ? 0 : legEndIndices[leg - 1]!;
      const segmentEnd = legEndIndices[leg]!;
      if (i >= segmentStart && i < segmentEnd) {
        resolvedLegIndex = leg;
        break;
      }
    }

    const pixels = nodesToPixelPath([fromNode, toNode], cellPx);
    segments.push({
      from: pixels[0]!,
      to: pixels[1]!,
      variant: isLegDashed(resolvedLegIndex) ? "dashed" : "solid",
    });
  }

  return segments;
}

/** @deprecated buildNavigationPathSegmentsFromNodes 사용 */
export function buildNavigationPathSegmentsFromContinuousPath(
  nodes: GridNode[],
  cellPx: number,
  legEndIndices: number[],
  isLegDashed: (legIndex: number) => boolean,
): NavigationPathSegment[] {
  const segments: NavigationPathSegment[] = [];
  const pixels = nodesToPixelPath(nodes, cellPx);

  for (let i = 0; i < pixels.length - 1; i++) {
    let resolvedLegIndex = legEndIndices.length - 1;
    for (let leg = 0; leg < legEndIndices.length; leg++) {
      const segmentStart = leg === 0 ? 0 : legEndIndices[leg - 1]!;
      const segmentEnd = legEndIndices[leg]!;
      if (i >= segmentStart && i < segmentEnd) {
        resolvedLegIndex = leg;
        break;
      }
    }
    segments.push({
      from: pixels[i]!,
      to: pixels[i + 1]!,
      variant: isLegDashed(resolvedLegIndex) ? "dashed" : "solid",
    });
  }

  return segments;
}
