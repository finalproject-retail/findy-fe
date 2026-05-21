import type { ShelfHalf, ShelfUnit, StoreMapConfig } from "../types";
import {
  blockToFaceRects,
  buildGridCellsFromShelfRects,
  faceRect,
} from "../grid/buildGridCells";
import {
  BOTTOM_WALL_APPLIANCE_COLS,
  BOTTOM_WALL_APPLIANCE_X,
  BOTTOM_WALL_EVENT_COLS,
  BOTTOM_WALL_LIQUOR_COLS,
  BOTTOM_WALL_LIQUOR_X,
  BOTTOM_WALL_PRODUCE_COLS,
  BOTTOM_WALL_PRODUCE_X,
  BOTTOM_WALL_START_X,
  BOTTOM_WALL_Y,
  GRID_COLS,
  GRID_ROWS,
  ISLAND_ROW_BANDS,
  ISLAND_START_COLS,
  CHECKOUT_SHELF_ROWS,
  CHECKOUT_SHELF_Y,
  NUTS_SHELF_ROWS,
  NUTS_SHELF_Y,
  ENTRANCE_SHELF_ROWS,
  ENTRANCE_SHELF_Y,
  EVENT_SHELF_COLS,
  EVENT_SHELF_ROWS,
  EVENT_SHELF_X,
  RIGHT_BLOCK_COLS,
  RIGHT_BLOCK_ROWS,
  RIGHT_BLOCK_X,
  RIGHT_WALL_COLD_ROWS,
  RIGHT_WALL_COLD_START_Y,
  RIGHT_WALL_PRODUCE_ROWS,
  RIGHT_WALL_PRODUCE_START_Y,
  RIGHT_WALL_SEAFOOD_ROWS,
  RIGHT_WALL_SEAFOOD_START_Y,
  RIGHT_WALL_X,
  SHELF_BLOCK_COLS,
  SHELF_BLOCK_ROWS,
  TOP_WALL_BAKERY_COLS,
  TOP_WALL_BAKERY_X,
  TOP_WALL_COLD_COLS,
  TOP_WALL_COLD_X,
  TOP_WALL_DELI_COLS,
  TOP_WALL_DELI_X,
  TOP_WALL_RAMEN_COLS,
  TOP_WALL_START_X,
  TOP_WALL_Y,
} from "../grid/layout";
import { computeCategoryZones } from "../utils/zoneCluster";

export { GRID_COLS as EMART_GRID_COLS, GRID_ROWS as EMART_GRID_ROWS };
export {
  SHELF_BLOCK_COLS,
  SHELF_BLOCK_ROWS,
  SHELF_FACE_COLS,
  SHELF_FACE_ROWS,
} from "../grid/layout";

type IslandBlockDef = {
  col: number;
  left: ShelfHalf;
  right: ShelfHalf;
};

/** 매대 번호 1부터 중복 없이 (하단→중단→상단→우측→외곽→견과) */
const SN = (n: number) => String(n);

const TOP_ISLAND_BLOCKS: IslandBlockDef[] = [
  { col: 2, left: { shelfNumber: SN(29), category: "과자" }, right: { shelfNumber: SN(30), category: "과자" } },
  { col: 5, left: { shelfNumber: SN(31), category: "과자" }, right: { shelfNumber: SN(32), category: "초콜릿" } },
  { col: 8, left: { shelfNumber: SN(33), category: "젤리" }, right: { shelfNumber: SN(34), category: "시리얼" } },
  { col: 11, left: { shelfNumber: SN(35), category: "시리얼" }, right: { shelfNumber: SN(36), category: "즉석밥" } },
  { col: 14, left: { shelfNumber: SN(37), category: "통조림" }, right: { shelfNumber: SN(38), category: "델리" } },
  { col: 17, left: { shelfNumber: SN(39), category: "델리" }, right: { shelfNumber: SN(40), category: "유제품" } },
  { col: 20, left: { shelfNumber: SN(41), category: "유제품" }, right: { shelfNumber: SN(42), category: "냉동식품" } },
];

const MIDDLE_ISLAND_BLOCKS: IslandBlockDef[] = [
  { col: 2, left: { shelfNumber: SN(15), category: "잡화" }, right: { shelfNumber: SN(16), category: "잡화" } },
  { col: 5, left: { shelfNumber: SN(17), category: "홈케어" }, right: { shelfNumber: SN(18), category: "홈케어" } },
  { col: 8, left: { shelfNumber: SN(19), category: "홈케어" }, right: { shelfNumber: SN(20), category: "홈케어" } },
  { col: 11, left: { shelfNumber: SN(21), category: "캠핑" }, right: { shelfNumber: SN(22), category: "캠핑" } },
  { col: 14, left: { shelfNumber: SN(23), category: "캠핑" }, right: { shelfNumber: SN(24), category: "차량용품" } },
  { col: 17, left: { shelfNumber: SN(25), category: "차량용품" }, right: { shelfNumber: SN(26), category: "음료" } },
  { col: 20, left: { shelfNumber: SN(27), category: "냉장식품" }, right: { shelfNumber: SN(28), category: "냉장식품" } },
];

const BOTTOM_ISLAND_BLOCKS: IslandBlockDef[] = [
  { col: 2, left: { shelfNumber: "1", category: "의류" }, right: { shelfNumber: "2", category: "의류" } },
  { col: 5, left: { shelfNumber: "3", category: "의류" }, right: { shelfNumber: "4", category: "주방/생활" } },
  { col: 8, left: { shelfNumber: "5", category: "주방/생활" }, right: { shelfNumber: "6", category: "가전" } },
  { col: 11, left: { shelfNumber: "7", category: "가전" }, right: { shelfNumber: "8", category: "가전" } },
  { col: 14, left: { shelfNumber: "9", category: "가전" }, right: { shelfNumber: "10", category: "가전" } },
  { col: 17, left: { shelfNumber: "11", category: "가전" }, right: { shelfNumber: "12", category: "음료" } },
  { col: 20, left: { shelfNumber: "13", category: "냉장식품" }, right: { shelfNumber: "14", category: "냉장식품" } },
];

type FaceRect = ReturnType<typeof faceRect>;

function addIslandBand(
  units: ShelfUnit[],
  faces: FaceRect[],
  bandKey: string,
  y: number,
  blocks: IslandBlockDef[]
) {
  blocks.forEach((block) => {
    const id = `${bandKey}-${block.left.shelfNumber}-${block.right.shelfNumber}`;
    units.push({
      id,
      x: block.col,
      y,
      width: SHELF_BLOCK_COLS,
      height: SHELF_BLOCK_ROWS,
      split: "vertical",
      primary: block.left,
      secondary: block.right,
      kind: "island",
    });
    faces.push(...blockToFaceRects(block.col, y, block.left, block.right, id));
  });
}

function addRightColumn(units: ShelfUnit[], faces: FaceRect[]) {
  const pairs: Array<{ id: string; y: number; top: ShelfHalf; bottom: ShelfHalf }> = [
    { id: "right-43-44", y: 3, top: { shelfNumber: SN(43), category: "냉동식품" }, bottom: { shelfNumber: SN(44), category: "냉동식품" } },
    { id: "right-45-46", y: 8, top: { shelfNumber: SN(45), category: "냉동식품" }, bottom: { shelfNumber: SN(46), category: "냉동식품" } },
    { id: "right-47-48", y: 13, top: { shelfNumber: SN(47), category: "냉동식품" }, bottom: { shelfNumber: SN(48), category: "냉동식품" } },
  ];

  pairs.forEach(({ id, y, top, bottom }) => {
    units.push({
      id,
      x: RIGHT_BLOCK_X,
      y,
      width: RIGHT_BLOCK_COLS,
      height: RIGHT_BLOCK_ROWS,
      split: "horizontal",
      primary: top,
      secondary: bottom,
      kind: "island",
    });
    faces.push({
      x: RIGHT_BLOCK_X,
      y,
      width: RIGHT_BLOCK_COLS,
      height: 1,
      shelfNumber: top.shelfNumber,
      category: top.category,
      faceId: `${id}-T`,
    });
    faces.push({
      x: RIGHT_BLOCK_X,
      y: y + 1,
      width: RIGHT_BLOCK_COLS,
      height: 1,
      shelfNumber: bottom.shelfNumber,
      category: bottom.category,
      faceId: `${id}-B`,
    });
  });

  const singles = [
    { id: "right-49", y: 6, half: { shelfNumber: SN(49), category: "행사" } },
    { id: "right-50", y: 11, half: { shelfNumber: SN(50), category: "행사" } },
  ];

  singles.forEach(({ id, y, half }) => {
    units.push({
      id,
      x: EVENT_SHELF_X,
      y,
      width: EVENT_SHELF_COLS,
      height: EVENT_SHELF_ROWS,
      split: "none",
      primary: half,
      kind: "island",
    });
    faces.push({
      x: EVENT_SHELF_X,
      y,
      width: EVENT_SHELF_COLS,
      height: EVENT_SHELF_ROWS,
      shelfNumber: half.shelfNumber,
      category: half.category,
      faceId: id,
    });
  });
}

function addWallStrip(
  faces: FaceRect[],
  x: number,
  y: number,
  w: number,
  h: number,
  half: ShelfHalf,
  faceId: string
) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      faces.push({
        x: x + dx,
        y: y + dy,
        width: 1,
        height: 1,
        shelfNumber: half.shelfNumber,
        category: half.category,
        faceId: `${faceId}-${dx}-${dy}`,
      });
    }
  }
}

function addPerimeterStrip(
  units: ShelfUnit[],
  faces: FaceRect[],
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  half: ShelfHalf,
  faceId: string
) {
  units.push({
    id,
    x,
    y,
    width: w,
    height: h,
    split: "none",
    primary: half,
    kind: "perimeter",
  });
  addWallStrip(faces, x, y, w, h, half, faceId);
}

function addPerimeterAndService(units: ShelfUnit[], faces: FaceRect[]) {
  addPerimeterStrip(
    units,
    faces,
    "w-top-56",
    TOP_WALL_START_X,
    TOP_WALL_Y,
    TOP_WALL_RAMEN_COLS,
    1,
    { shelfNumber: SN(51), category: "라면" },
    "w-top-56"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-top-55",
    TOP_WALL_BAKERY_X,
    TOP_WALL_Y,
    TOP_WALL_BAKERY_COLS,
    1,
    { shelfNumber: SN(52), category: "베이커리" },
    "w-top-55"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-top-54",
    TOP_WALL_DELI_X,
    TOP_WALL_Y,
    TOP_WALL_DELI_COLS,
    1,
    { shelfNumber: SN(53), category: "델리" },
    "w-top-54"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-top-cold",
    TOP_WALL_COLD_X,
    TOP_WALL_Y,
    TOP_WALL_COLD_COLS,
    1,
    { shelfNumber: SN(54), category: "냉장/축산" },
    "w-top-cold"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-r-53",
    RIGHT_WALL_X,
    RIGHT_WALL_COLD_START_Y,
    1,
    RIGHT_WALL_COLD_ROWS,
    { shelfNumber: SN(55), category: "냉장/축산" },
    "w-r-53"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-r-52",
    RIGHT_WALL_X,
    RIGHT_WALL_SEAFOOD_START_Y,
    1,
    RIGHT_WALL_SEAFOOD_ROWS,
    { shelfNumber: SN(56), category: "수산" },
    "w-r-52"
  );
  addPerimeterStrip(
    units,
    faces,
    "w-r-51",
    RIGHT_WALL_X,
    RIGHT_WALL_PRODUCE_START_Y,
    1,
    RIGHT_WALL_PRODUCE_ROWS,
    { shelfNumber: SN(57), category: "농산" },
    "w-r-51"
  );

  /** 하단(왼→오): 행사 61 · 가전 60 · 주류 59 */
  const bottomWallStrips: Array<{
    id: string;
    x: number;
    w: number;
    half: ShelfHalf;
  }> = [
    { id: "w-bot-event", x: BOTTOM_WALL_START_X, w: BOTTOM_WALL_EVENT_COLS, half: { shelfNumber: SN(61), category: "행사" } },
    { id: "w-bot-appliance", x: BOTTOM_WALL_APPLIANCE_X, w: BOTTOM_WALL_APPLIANCE_COLS, half: { shelfNumber: SN(60), category: "가전" } },
    { id: "w-bot-liquor", x: BOTTOM_WALL_LIQUOR_X, w: BOTTOM_WALL_LIQUOR_COLS, half: { shelfNumber: SN(59), category: "주류" } },
  ];

  for (const strip of bottomWallStrips) {
    addPerimeterStrip(units, faces, strip.id, strip.x, BOTTOM_WALL_Y, strip.w, 1, strip.half, strip.id);
  }
  addPerimeterStrip(
    units,
    faces,
    "w-bot-51",
    BOTTOM_WALL_PRODUCE_X,
    BOTTOM_WALL_Y,
    BOTTOM_WALL_PRODUCE_COLS,
    1,
    { shelfNumber: SN(58), category: "농산" },
    "w-bot-51"
  );

  units.push({
    id: "service-nuts",
    x: 0,
    y: NUTS_SHELF_Y,
    width: 1,
    height: NUTS_SHELF_ROWS,
    split: "none",
    primary: { shelfNumber: SN(62), category: "견과" },
    kind: "service",
  });
  addWallStrip(faces, 0, NUTS_SHELF_Y, 1, NUTS_SHELF_ROWS, { shelfNumber: SN(62), category: "견과" }, "svc-nuts");

  units.push({
    id: "service-checkout",
    x: 0,
    y: CHECKOUT_SHELF_Y,
    width: 1,
    height: CHECKOUT_SHELF_ROWS,
    split: "none",
    primary: { category: "계산대" },
    kind: "service",
  });
  addWallStrip(faces, 0, CHECKOUT_SHELF_Y, 1, CHECKOUT_SHELF_ROWS, { category: "계산대" }, "svc-checkout");

  units.push({
    id: "service-entrance",
    x: 0,
    y: ENTRANCE_SHELF_Y,
    width: 1,
    height: ENTRANCE_SHELF_ROWS,
    split: "none",
    primary: { category: "출입구" },
    kind: "service",
  });
  addWallStrip(faces, 0, ENTRANCE_SHELF_Y, 1, ENTRANCE_SHELF_ROWS, { category: "출입구" }, "svc-entrance");
}

function buildMap(): StoreMapConfig {
  const units: ShelfUnit[] = [];
  const faces: FaceRect[] = [];

  addIslandBand(units, faces, "top", ISLAND_ROW_BANDS[0].y, TOP_ISLAND_BLOCKS);
  addIslandBand(units, faces, "mid", ISLAND_ROW_BANDS[1].y, MIDDLE_ISLAND_BLOCKS);
  addIslandBand(units, faces, "bot", ISLAND_ROW_BANDS[2].y, BOTTOM_ISLAND_BLOCKS);
  addRightColumn(units, faces);
  addPerimeterAndService(units, faces);

  const cells = buildGridCellsFromShelfRects(faces);
  const zones = computeCategoryZones(units);
  appendMixedUnitZones(units, zones);

  return {
    rows: GRID_ROWS,
    cols: GRID_COLS,
    cells,
    units,
    zones,
  };
}

function appendMixedUnitZones(
  units: ShelfUnit[],
  zones: ReturnType<typeof computeCategoryZones>
) {
  for (const unit of units) {
    if (unit.kind !== "island") continue;
    if (!unit.secondary) continue;
    if (unit.primary.category === unit.secondary.category) continue;

    zones.push({
      id: `zone-single-${unit.id}`,
      category: `${unit.primary.category}\n${unit.secondary.category}`,
      x: unit.x,
      y: unit.y,
      width: unit.width,
      height: unit.height,
      unitCount: 1,
    });
  }
}

const MAP_LAYOUT_VERSION = 24;

let cachedLayoutVersion = 0;
let cachedConfig: StoreMapConfig | null = null;

export function getEmartStoreMapConfig(): StoreMapConfig {
  if (cachedConfig && cachedLayoutVersion === MAP_LAYOUT_VERSION) {
    return cachedConfig;
  }
  cachedConfig = buildMap();
  cachedLayoutVersion = MAP_LAYOUT_VERSION;
  return cachedConfig;
}

export const FLOOR_PLAN_REFERENCE = {
  image: require("@/assets/images/store/emart-floor-plan.png"),
} as const;
