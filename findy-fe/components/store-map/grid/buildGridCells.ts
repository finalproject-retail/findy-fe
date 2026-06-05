import { CELL_REAL_SIZE_METERS, type StoreCellMapping, type StoreCellType } from "../types";
import {
  AISLE_COLS,
  BOTTOM_WALL_Y,
  GRID_COLS,
  GRID_ROWS,
  BOTTOM_PREP_AISLE_Y,
  ISLAND_ROW_AISLES,
  ISLAND_START_COLS,
  ISLAND_Y_MAX,
  ISLAND_Y_MIN,
  LEFT_WALL_X,
  RIGHT_BLOCK_X,
  RIGHT_WALL_X,
  SHELF_BLOCK_COLS,
  SHELF_FACE_COLS,
  SHELF_FACE_ROWS,
  TOP_WALL_Y,
} from "./layout";

function toRealMeters(x: number, y: number) {
  return { x: x * CELL_REAL_SIZE_METERS, y: y * CELL_REAL_SIZE_METERS };
}

function isAisleCell(x: number, y: number): boolean {
  if (x === LEFT_WALL_X + 1 && y > 0 && y < BOTTOM_WALL_Y) return true;

  for (const aisleY of ISLAND_ROW_AISLES) {
    if (y === aisleY) return true;
  }

  for (const prepY of BOTTOM_PREP_AISLE_Y) {
    if (y === prepY && x > LEFT_WALL_X && x < RIGHT_WALL_X) return true;
  }

  if (x === RIGHT_BLOCK_X - AISLE_COLS && y >= ISLAND_Y_MIN && y <= ISLAND_Y_MAX) {
    return true;
  }

  for (let i = 0; i < ISLAND_START_COLS.length - 1; i++) {
    const aisleX = ISLAND_START_COLS[i] + SHELF_BLOCK_COLS;
    if (x === aisleX && y >= ISLAND_Y_MIN && y <= ISLAND_Y_MAX) return true;
  }

  if (y === BOTTOM_WALL_Y - 1 && x > 0 && x < RIGHT_WALL_X) return true;

  return false;
}

function resolveCellType(x: number, y: number, shelfCells: Map<string, StoreCellMapping>): StoreCellType {
  if (shelfCells.has(`${x},${y}`)) return "shelf";
  if (y === TOP_WALL_Y || y === BOTTOM_WALL_Y || x === LEFT_WALL_X || x === RIGHT_WALL_X) {
    return "wall";
  }
  if (isAisleCell(x, y)) return "aisle";
  return "aisle";
}

export function buildGridCellsFromShelfRects(
  shelfRects: {
    x: number;
    y: number;
    width: number;
    height: number;
    shelfNumber?: string;
    category?: string;
    faceId: string;
  }[]
): StoreCellMapping[] {
  const shelfMap = new Map<string, StoreCellMapping>();

  for (const rect of shelfRects) {
    for (let dy = 0; dy < rect.height; dy++) {
      for (let dx = 0; dx < rect.width; dx++) {
        const x = rect.x + dx;
        const y = rect.y + dy;
        shelfMap.set(`${x},${y}`, {
          x,
          y,
          type: "shelf",
          shelfNumber: rect.shelfNumber,
          category: rect.category,
          shelfFaceId: rect.faceId,
          realMeters: toRealMeters(x, y),
        });
      }
    }
  }

  const cells: StoreCellMapping[] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    for (let x = 0; x < GRID_COLS; x++) {
      const existing = shelfMap.get(`${x},${y}`);
      cells.push(
        existing ?? {
          x,
          y,
          type: resolveCellType(x, y, shelfMap),
          realMeters: toRealMeters(x, y),
        }
      );
    }
  }

  return cells;
}

export function faceRect(
  col: number,
  row: number,
  shelfNumber: string | undefined,
  category: string,
  faceId: string
) {
  return {
    x: col,
    y: row,
    width: SHELF_FACE_COLS,
    height: SHELF_FACE_ROWS,
    shelfNumber,
    category,
    faceId,
  };
}

export function blockToFaceRects(
  col: number,
  row: number,
  left: { shelfNumber?: string; category: string },
  right: { shelfNumber?: string; category: string },
  blockId: string
) {
  return [
    faceRect(col, row, left.shelfNumber, left.category, `${blockId}-L`),
    faceRect(col + 1, row, right.shelfNumber, right.category, `${blockId}-R`),
  ];
}
