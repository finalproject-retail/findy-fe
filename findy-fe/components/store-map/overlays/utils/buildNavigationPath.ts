import { gridIdToGridPoint } from "@/lib/map/buildStoreMapConfig";
import type { PathNavigationApi } from "@/lib/map/types";
import type { NavigationPathSegment } from "../types";
import type { GridNode } from "./aisleGraph";
import { nodesToPixelPath } from "./aisleGraph";

export function gridIdsToGridNodes(
  gridIds: number[],
  gridCols: number,
): GridNode[] {
  return gridIds.map((gridId) => {
    const { gridX, gridY } = gridIdToGridPoint(gridId, gridCols);
    return { x: gridX, y: gridY };
  });
}

/** map-service 경로 응답을 지도 좌표 leg 배열로 변환 (재계산 없음) */
export function pathLegsFromNavigation(
  pathNavigation: PathNavigationApi,
  gridCols: number,
): GridNode[][] {
  if (pathNavigation.legs.length > 0) {
    return pathNavigation.legs.map((leg) =>
      gridIdsToGridNodes(leg.pathGridIds, gridCols),
    );
  }

  if (pathNavigation.fullPathGridIds.length > 0) {
    return [gridIdsToGridNodes(pathNavigation.fullPathGridIds, gridCols)];
  }

  return [];
}

export function sortShoppingByVisitOrder<T extends { visitOrder: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => a.visitOrder - b.visitOrder);
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
        from: pixels[i],
        to: pixels[i + 1],
        variant,
      });
    }
  });

  return segments;
}
