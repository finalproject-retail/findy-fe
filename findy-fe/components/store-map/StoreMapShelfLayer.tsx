import { Text, View } from "react-native";
import {
  BASE_CELL_PX,
  SHELF_BLOCK_RADIUS,
  SHELF_FONT_WEIGHT,
  STORE_MAP_COLORS,
} from "./constants";
import {
  BOTTOM_WALL_Y,
  LEFT_WALL_X,
  RIGHT_BLOCK_X,
  RIGHT_WALL_X,
  TOP_WALL_Y,
} from "./grid/layout";
import type { ShelfHalf, ShelfUnit, StoreMapConfig } from "./types";

type Props = {
  config: StoreMapConfig;
  /** 확대 배율에 맞춘 격자 px (transform 대신 레이아웃 스케일 → 글씨 선명) */
  cellPx?: number;
  gapPx?: number;
};

/** 좌·우 세로 매대: 글자를 한 줄씩 쌓아 확대해도 세로 형태 유지 */
function VerticalShelfLabel({
  category,
  shelfNumber,
  stripWidth,
  stripHeight,
  cellPx,
}: {
  category: string;
  shelfNumber?: string;
  stripWidth: number;
  stripHeight: number;
  cellPx: number;
}) {
  const chars = Array.from(category);
  const numberBand = shelfNumber ? Math.max(cellPx * 1.1, 8) : 0;
  const textBand = Math.max(stripHeight - numberBand - 4, cellPx);
  const fontSize = Math.max(
    4,
    Math.min(stripWidth * 0.88, (textBand / Math.max(chars.length, 1)) * 0.92, cellPx * 0.48)
  );
  const lineHeight = fontSize * 1.05;

  return (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 2,
        }}
      >
        <View style={{ alignItems: "center", width: stripWidth }}>
          {chars.map((char, index) => (
            <Text
              key={`${char}-${index}`}
              style={{
                fontSize,
                lineHeight,
                fontWeight: SHELF_FONT_WEIGHT,
                color: STORE_MAP_COLORS.shelfCategory,
                textAlign: "center",
                width: stripWidth,
              }}
              numberOfLines={1}
            >
              {char}
            </Text>
          ))}
        </View>
      </View>
      {shelfNumber ? (
        <Text
          style={{
            fontSize: Math.max(fontSize * 0.95, 5),
            fontWeight: SHELF_FONT_WEIGHT,
            color: STORE_MAP_COLORS.shelfNumber,
            textAlign: "center",
            paddingBottom: 2,
          }}
          numberOfLines={1}
        >
          {shelfNumber}
        </Text>
      ) : null}
    </View>
  );
}

function EdgeShelfLabel({
  unit,
  stripWidth,
  stripHeight,
  cellPx,
}: {
  unit: ShelfUnit;
  stripWidth: number;
  stripHeight: number;
  cellPx: number;
}) {
  const isLeftEdge = unit.x === LEFT_WALL_X;
  const isRightEdge = unit.x === RIGHT_WALL_X;
  const isTopEdge = unit.y === TOP_WALL_Y;
  const isBottomEdge = unit.y === BOTTOM_WALL_Y;
  const isVerticalStrip = unit.width === 1 && unit.height > 1;
  const isHorizontalStrip = unit.height === 1 && unit.width > 1;

  if (isVerticalStrip && (isLeftEdge || isRightEdge)) {
    return (
      <VerticalShelfLabel
        category={unit.primary.category}
        shelfNumber={unit.primary.shelfNumber}
        stripWidth={stripWidth}
        stripHeight={stripHeight}
        cellPx={cellPx}
      />
    );
  }

  if (isHorizontalStrip && (isTopEdge || isBottomEdge)) {
    return (
      <InnerHalfLabel
        half={unit.primary}
        compact
        cellPx={cellPx}
        horizontal
      />
    );
  }

  return (
    <InnerHalfLabel half={unit.primary} compact cellPx={cellPx} horizontal />
  );
}

/** 우측 냉동·행사: "22 냉동식품" (번호 왼쪽, 글씨 오른쪽 한 줄) */
function InlineNumberCategoryLabel({
  half,
  cellPx,
  compact,
}: {
  half: ShelfHalf;
  cellPx: number;
  compact?: boolean;
}) {
  const numberSize = Math.max(cellPx * 0.48, 7);
  const categorySize = Math.max(compact ? cellPx * 0.36 : cellPx * 0.4, 6);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 3,
        gap: 4,
        overflow: "hidden",
      }}
    >
      {half.shelfNumber ? (
        <Text
          style={{
            fontSize: numberSize,
            fontWeight: SHELF_FONT_WEIGHT,
            color: STORE_MAP_COLORS.shelfNumber,
            minWidth: numberSize * 0.9,
          }}
          numberOfLines={1}
        >
          {half.shelfNumber}
        </Text>
      ) : null}
      <Text
        style={{
          flex: 1,
          fontSize: categorySize,
          fontWeight: SHELF_FONT_WEIGHT,
          color: STORE_MAP_COLORS.shelfCategory,
        }}
        numberOfLines={1}
      >
        {half.category}
      </Text>
    </View>
  );
}

function isRightColumnShelf(unit: ShelfUnit): boolean {
  return (
    unit.kind === "island" &&
    unit.x >= RIGHT_BLOCK_X &&
    (unit.split === "horizontal" ||
      (unit.split === "none" && unit.primary.category === "행사"))
  );
}

/** 안쪽 매대: 카테고리 위, 번호 아래 */
function InnerHalfLabel({
  half,
  compact,
  cellPx,
  horizontal,
}: {
  half: ShelfHalf;
  compact?: boolean;
  cellPx: number;
  horizontal?: boolean;
}) {
  const categorySize = Math.max(
    compact ? cellPx * 0.34 : cellPx * 0.4,
    horizontal ? 6 : 7
  );
  const numberSize = Math.max(cellPx * 0.44, 7);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 2,
        paddingVertical: 2,
        overflow: "hidden",
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-start", width: "100%" }}>
        <Text
          style={{
            fontSize: categorySize,
            fontWeight: SHELF_FONT_WEIGHT,
            color: STORE_MAP_COLORS.shelfCategory,
            textAlign: "center",
            width: "100%",
            lineHeight: categorySize * 1.1,
          }}
          numberOfLines={compact ? 2 : 3}
        >
          {half.category}
        </Text>
      </View>
      {half.shelfNumber ? (
        <Text
          style={{
            fontSize: numberSize,
            fontWeight: SHELF_FONT_WEIGHT,
            color: STORE_MAP_COLORS.shelfNumber,
            textAlign: "center",
            width: "100%",
          }}
          numberOfLines={1}
        >
          {half.shelfNumber}
        </Text>
      ) : null}
    </View>
  );
}

function ShelfUnitView({
  unit,
  cellPx,
  gapPx = 0,
}: {
  unit: ShelfUnit;
  cellPx: number;
  gapPx?: number;
}) {
  const inset = gapPx / 2;
  const w = unit.width * cellPx - gapPx;
  const h = unit.height * cellPx - gapPx;
  const compact = unit.height <= 2 && unit.width <= 4;
  const isPerimeter = unit.kind === "perimeter";
  const isService = unit.kind === "service";
  const isEdgeShelf = isPerimeter || isService;
  const isRightColumn = isRightColumnShelf(unit);
  const bg = isService ? STORE_MAP_COLORS.service : STORE_MAP_COLORS.shelf;
  const radius = Math.max(1, SHELF_BLOCK_RADIUS * (cellPx / BASE_CELL_PX));

  const divider = (
    <View
      style={{
        backgroundColor: STORE_MAP_COLORS.shelfDivider,
        ...(unit.split === "vertical"
          ? { width: 0.5, height: "70%" as const, alignSelf: "center" }
          : { height: 0.5, width: "70%" as const, alignSelf: "center" }),
      }}
    />
  );

  const renderW = Math.max(w, cellPx * 0.35);
  const renderH = Math.max(h, cellPx * 0.35);

  return (
    <View
      style={{
        position: "absolute",
        left: unit.x * cellPx + inset,
        top: unit.y * cellPx + inset,
        width: renderW,
        height: renderH,
        backgroundColor: bg,
        borderRadius: radius,
        overflow: "hidden",
        zIndex: isEdgeShelf ? 5 : 1,
      }}
    >
      {isEdgeShelf ? (
        <EdgeShelfLabel
          unit={unit}
          stripWidth={renderW}
          stripHeight={renderH}
          cellPx={cellPx}
        />
      ) : null}

      {!isEdgeShelf && unit.split === "none" ? (
        isRightColumn ? (
          <InlineNumberCategoryLabel half={unit.primary} cellPx={cellPx} compact />
        ) : (
          <InnerHalfLabel half={unit.primary} compact={compact} cellPx={cellPx} />
        )
      ) : null}

      {!isEdgeShelf && unit.split === "vertical" && unit.secondary ? (
        <View style={{ flex: 1, flexDirection: "row", overflow: "hidden" }}>
          <InnerHalfLabel half={unit.primary} compact={compact} cellPx={cellPx} />
          {divider}
          <InnerHalfLabel half={unit.secondary} compact={compact} cellPx={cellPx} />
        </View>
      ) : null}

      {!isEdgeShelf && unit.split === "horizontal" && unit.secondary ? (
        <View style={{ flex: 1, flexDirection: "column", overflow: "hidden" }}>
          {isRightColumn ? (
            <>
              <InlineNumberCategoryLabel half={unit.primary} cellPx={cellPx} compact />
              {divider}
              <InlineNumberCategoryLabel half={unit.secondary} cellPx={cellPx} compact />
            </>
          ) : (
            <>
              <InnerHalfLabel half={unit.primary} compact cellPx={cellPx} />
              {divider}
              <InnerHalfLabel half={unit.secondary} compact cellPx={cellPx} />
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

export function StoreMapShelfLayer({
  config,
  cellPx = BASE_CELL_PX,
  gapPx = 0,
}: Props) {
  const mapWidth = config.cols * cellPx;
  const mapHeight = config.rows * cellPx;

  return (
    <View
      style={{
        width: mapWidth,
        height: mapHeight,
        backgroundColor: STORE_MAP_COLORS.floor,
      }}
      pointerEvents="none"
    >
      {config.units.map((unit) => (
        <ShelfUnitView key={unit.id} unit={unit} cellPx={cellPx} gapPx={gapPx} />
      ))}
    </View>
  );
}
