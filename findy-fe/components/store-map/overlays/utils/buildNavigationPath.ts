import type { NavigationPathSegment } from "../types";
import type { GridNode } from "./aisleGraph";
import { nodesToPixelPath } from "./aisleGraph";

export function sortShoppingByVisitOrder<T extends { visitOrder: number }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => a.visitOrder - b.visitOrder);
}

export function buildNavigationPathSegmentsFromAisleLegs(
  legs: GridNode[][],
  cellPx: number,
  activeLegIndex: number
): NavigationPathSegment[] {
  const segments: NavigationPathSegment[] = [];

  legs.forEach((leg, legIndex) => {
    const pixels = nodesToPixelPath(leg, cellPx);
    const isActive = legIndex === activeLegIndex;

    for (let i = 0; i < pixels.length - 1; i++) {
      segments.push({
        from: pixels[i],
        to: pixels[i + 1],
        variant: isActive ? "dashed" : "solid",
      });
    }
  });

  return segments;
}
