import type { StoreMapConfig } from "../types";
import type { MapGridPoint } from "./types";

function getCell(config: StoreMapConfig, gridX: number, gridY: number) {
  return config.cells.find((c) => c.x === gridX && c.y === gridY);
}

export function isShelfCell(
  config: StoreMapConfig,
  gridX: number,
  gridY: number,
): boolean {
  return getCell(config, gridX, gridY)?.type === "shelf";
}

/** 통로·벽 좌표 → 가장 가까운 매대 격자 */
export function snapToNearestShelf(
  config: StoreMapConfig,
  gridX: number,
  gridY: number,
): MapGridPoint {
  if (isShelfCell(config, gridX, gridY)) {
    return { gridX, gridY };
  }

  const maxRadius = Math.max(config.cols, config.rows);
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
        const x = gridX + dx;
        const y = gridY + dy;
        if (isShelfCell(config, x, y)) {
          return { gridX: x, gridY: y };
        }
      }
    }
  }

  const firstShelf = config.cells.find((c) => c.type === "shelf");
  if (firstShelf) {
    return { gridX: firstShelf.x, gridY: firstShelf.y };
  }

  return { gridX, gridY };
}

function categoryKeywords(categoryHint: string): string[] {
  return categoryHint
    .split(/[·\s/]+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 2);
}

function cellMatchesCategory(cellCategory: string, keywords: string[]): boolean {
  return keywords.some(
    (keyword) =>
      cellCategory.includes(keyword) || keyword.includes(cellCategory),
  );
}

/** 카테고리 문자열과 맞는 매대 셀 목록 */
export function findShelfCellsForCategory(
  config: StoreMapConfig,
  categoryHint: string,
) {
  const keywords = categoryKeywords(categoryHint);
  if (keywords.length === 0) return [];

  return config.cells.filter(
    (cell) =>
      cell.type === "shelf" &&
      cell.category &&
      cellMatchesCategory(cell.category, keywords),
  );
}

/** 상품 카테고리 → 매대 한 칸 (동일 카테고리면 productId로 분산) */
export function resolveShelfGridForProduct(
  config: StoreMapConfig,
  productId: string,
  categoryHint: string | undefined,
  preferred?: MapGridPoint,
): MapGridPoint {
  if (preferred && isShelfCell(config, preferred.gridX, preferred.gridY)) {
    return preferred;
  }

  if (categoryHint) {
    const matches = findShelfCellsForCategory(config, categoryHint);
    if (matches.length > 0) {
      let hash = 0;
      for (let i = 0; i < productId.length; i++) {
        hash = (hash + productId.charCodeAt(i)) % matches.length;
      }
      const cell = matches[hash]!;
      return { gridX: cell.x, gridY: cell.y };
    }
  }

  if (preferred) {
    return snapToNearestShelf(config, preferred.gridX, preferred.gridY);
  }

  const firstShelf = config.cells.find((c) => c.type === "shelf");
  return firstShelf
    ? { gridX: firstShelf.x, gridY: firstShelf.y }
    : { gridX: 0, gridY: 0 };
}
