import { Text, View } from "react-native";
import {
  BASE_CELL_PX,
  ENTRANCE_CATEGORY,
  ENTRANCE_LABEL_SCALE,
  SHELF_BLOCK_RADIUS,
  SHELF_FONT_WEIGHT,
  shelfLabelInset,
  shelfNumberFontSize,
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
  uniformSize,
  categoryFontScale = 1,
}: {
  category: string;
  shelfNumber?: string;
  stripWidth: number;
  stripHeight: number;
  cellPx: number;
  /** 섬 1~42: 글자 수와 무관하게 동일 크기 */
  uniformSize?: boolean;
  categoryFontScale?: number;
}) {
  const chars = Array.from(category);
  const numberSize = shelfNumber ? shelfNumberFontSize(cellPx) : 0;
  const numberBand = shelfNumber ? Math.max(numberSize + 4, cellPx * 0.9, 8) : 0;
  const textBand = Math.max(stripHeight - numberBand - 4, cellPx);
  const baseFontSize = uniformSize
    ? Math.max(5, Math.min(cellPx * 0.36, stripWidth * 0.88))
    : Math.max(
        4,
        Math.min(
          stripWidth * 0.88,
          (textBand / Math.max(chars.length, 1)) * 0.92,
          cellPx * 0.48
        )
      );
  const fontSize = baseFontSize * categoryFontScale;
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
            fontSize: numberSize,
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
    const categoryFontScale =
      unit.primary.category === ENTRANCE_CATEGORY ? ENTRANCE_LABEL_SCALE : 1;
    return (
      <VerticalShelfLabel
        category={unit.primary.category}
        shelfNumber={unit.primary.shelfNumber}
        stripWidth={stripWidth}
        stripHeight={stripHeight}
        cellPx={cellPx}
        categoryFontScale={categoryFontScale}
      />
    );
  }

  if (isHorizontalStrip && (isTopEdge || isBottomEdge)) {
    if (usesLeftNumberCenteredCategory(unit.primary)) {
      return (
        <LeftNumberCenteredCategoryLabel
          half={unit.primary}
          compact
          cellPx={cellPx}
          stripWidth={stripWidth}
          stripHeight={stripHeight}
        />
      );
    }
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

function parseShelfNumber(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function shelfNumberInRange(value: string | undefined, min: number, max: number): boolean {
  const n = parseShelfNumber(value);
  return n !== null && n >= min && n <= max;
}

/** 섬 매대 1~42: 카테고리·번호 모두 세로(한 글자씩), 동일 글자 크기 */
function usesIslandVerticalLabel(half: ShelfHalf): boolean {
  return shelfNumberInRange(half.shelfNumber, 1, 42);
}

/** 번호는 왼쪽 끝, 카테고리는 매대 오른쪽 끝 (49·50 행사) */
function LeftNumberRightCategoryLabel({
  half,
  cellPx,
  compact,
  stripWidth,
  stripHeight,
}: {
  half: ShelfHalf;
  cellPx: number;
  compact?: boolean;
  stripWidth?: number;
  stripHeight?: number;
}) {
  const numberSize = shelfNumberFontSize(cellPx);
  const categorySize = Math.max(compact ? cellPx * 0.36 : cellPx * 0.4, 6);
  const { numberLeft, categoryEdge, vertical } = shelfLabelInset(
    cellPx,
    stripWidth,
    stripHeight
  );

  return (
    <View style={{ flex: 1, justifyContent: "center", overflow: "hidden" }}>
      <Text
        style={{
          fontSize: categorySize,
          fontWeight: SHELF_FONT_WEIGHT,
          color: STORE_MAP_COLORS.shelfCategory,
          textAlign: "right",
          width: "100%",
          paddingRight: categoryEdge,
          paddingVertical: vertical,
        }}
        numberOfLines={1}
      >
        {half.category}
      </Text>
      {half.shelfNumber ? (
        <View
          style={{
            position: "absolute",
            left: numberLeft,
            top: vertical,
            bottom: vertical,
            justifyContent: "center",
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontSize: numberSize,
              fontWeight: SHELF_FONT_WEIGHT,
              color: STORE_MAP_COLORS.shelfNumber,
            }}
            numberOfLines={1}
          >
            {half.shelfNumber}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function usesLeftNumberRightCategory(half: ShelfHalf): boolean {
  return half.shelfNumber === "49" || half.shelfNumber === "50";
}

/** 번호는 왼쪽 끝, 카테고리는 매대 가로 전체 기준 가운데 (43~48, 51~54, 58~61) */
function LeftNumberCenteredCategoryLabel({
  half,
  cellPx,
  compact,
  stripWidth,
  stripHeight,
}: {
  half: ShelfHalf;
  cellPx: number;
  compact?: boolean;
  stripWidth?: number;
  stripHeight?: number;
}) {
  const numberSize = shelfNumberFontSize(cellPx);
  const categorySize = Math.max(compact ? cellPx * 0.36 : cellPx * 0.4, 6);
  const { numberLeft, vertical } = shelfLabelInset(cellPx, stripWidth, stripHeight);

  return (
    <View style={{ flex: 1, overflow: "hidden" }}>
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: vertical,
          bottom: vertical,
          justifyContent: "center",
          alignItems: "center",
        }}
        pointerEvents="none"
      >
        <Text
          style={{
            fontSize: categorySize,
            fontWeight: SHELF_FONT_WEIGHT,
            color: STORE_MAP_COLORS.shelfCategory,
            textAlign: "center",
            width: "100%",
          }}
          numberOfLines={1}
        >
          {half.category}
        </Text>
      </View>
      {half.shelfNumber ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingLeft: numberLeft,
            paddingVertical: vertical,
          }}
          pointerEvents="none"
        >
          <Text
            style={{
              fontSize: numberSize,
              fontWeight: SHELF_FONT_WEIGHT,
              color: STORE_MAP_COLORS.shelfNumber,
            }}
            numberOfLines={1}
          >
            {half.shelfNumber}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function usesLeftNumberCenteredCategory(half: ShelfHalf): boolean {
  if (usesLeftNumberRightCategory(half)) return false;
  return (
    shelfNumberInRange(half.shelfNumber, 43, 50) ||
    shelfNumberInRange(half.shelfNumber, 51, 54) ||
    shelfNumberInRange(half.shelfNumber, 58, 61)
  );
}

/** 우측 냉동·행사 (43~50, 49·50은 카테고리 오른쪽) */
function InlineNumberCategoryLabel({
  half,
  cellPx,
  compact,
  stripWidth,
  stripHeight,
}: {
  half: ShelfHalf;
  cellPx: number;
  compact?: boolean;
  stripWidth?: number;
  stripHeight?: number;
}) {
  if (usesLeftNumberRightCategory(half)) {
    return (
      <LeftNumberRightCategoryLabel
        half={half}
        cellPx={cellPx}
        compact={compact}
        stripWidth={stripWidth}
        stripHeight={stripHeight}
      />
    );
  }
  return (
    <LeftNumberCenteredCategoryLabel
      half={half}
      cellPx={cellPx}
      compact={compact}
      stripWidth={stripWidth}
      stripHeight={stripHeight}
    />
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
  stripWidth,
  stripHeight,
}: {
  half: ShelfHalf;
  compact?: boolean;
  cellPx: number;
  horizontal?: boolean;
  stripWidth?: number;
  stripHeight?: number;
}) {
  if (
    !horizontal &&
    stripWidth != null &&
    stripHeight != null &&
    usesIslandVerticalLabel(half)
  ) {
    return (
      <VerticalShelfLabel
        category={half.category}
        shelfNumber={half.shelfNumber}
        stripWidth={stripWidth}
        stripHeight={stripHeight}
        cellPx={cellPx}
        uniformSize
      />
    );
  }

  const categorySize = Math.max(
    compact ? cellPx * 0.34 : cellPx * 0.4,
    horizontal ? 6 : 7
  );
  const numberSize = shelfNumberFontSize(cellPx);

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
  const halfStripW =
    unit.split === "vertical" && unit.secondary ? renderW / 2 : renderW;
  const halfStripH =
    unit.split === "horizontal" && unit.secondary ? renderH / 2 : renderH;

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
          <InlineNumberCategoryLabel
            half={unit.primary}
            cellPx={cellPx}
            compact
            stripWidth={halfStripW}
            stripHeight={halfStripH}
          />
        ) : (
          <InnerHalfLabel
            half={unit.primary}
            compact={compact}
            cellPx={cellPx}
            stripWidth={halfStripW}
            stripHeight={halfStripH}
          />
        )
      ) : null}

      {!isEdgeShelf && unit.split === "vertical" && unit.secondary ? (
        <View style={{ flex: 1, flexDirection: "row", overflow: "hidden" }}>
          <InnerHalfLabel
            half={unit.primary}
            compact={compact}
            cellPx={cellPx}
            stripWidth={halfStripW}
            stripHeight={halfStripH}
          />
          {divider}
          <InnerHalfLabel
            half={unit.secondary}
            compact={compact}
            cellPx={cellPx}
            stripWidth={halfStripW}
            stripHeight={halfStripH}
          />
        </View>
      ) : null}

      {!isEdgeShelf && unit.split === "horizontal" && unit.secondary ? (
        <View style={{ flex: 1, flexDirection: "column", overflow: "hidden" }}>
          {isRightColumn ? (
            <>
              <InlineNumberCategoryLabel
                half={unit.primary}
                cellPx={cellPx}
                compact
                stripWidth={halfStripW}
                stripHeight={halfStripH}
              />
              {divider}
              <InlineNumberCategoryLabel
                half={unit.secondary}
                cellPx={cellPx}
                compact
                stripWidth={halfStripW}
                stripHeight={halfStripH}
              />
            </>
          ) : (
            <>
              <InnerHalfLabel
                half={unit.primary}
                compact
                cellPx={cellPx}
                stripWidth={halfStripW}
                stripHeight={halfStripH}
              />
              {divider}
              <InnerHalfLabel
                half={unit.secondary}
                compact
                cellPx={cellPx}
                stripWidth={halfStripW}
                stripHeight={halfStripH}
              />
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
