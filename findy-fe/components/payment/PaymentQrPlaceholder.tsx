import { COLORS } from "@/constants/theme";
import { useMemo } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

const MODULES = 21;
const DEFAULT_SIZE = 176;

function isInFinderZone(row: number, col: number, size: number) {
  const inTopLeft = row < 8 && col < 8;
  const inTopRight = row < 8 && col >= size - 8;
  const inBottomLeft = row >= size - 8 && col < 8;
  return inTopLeft || inTopRight || inBottomLeft;
}

function drawFinder(grid: boolean[][], startRow: number, startCol: number) {
  for (let row = 0; row < 7; row += 1) {
    for (let col = 0; col < 7; col += 1) {
      const border = row === 0 || row === 6 || col === 0 || col === 6;
      const inner = row >= 2 && row <= 4 && col >= 2 && col <= 4;
      grid[startRow + row][startCol + col] = border || inner;
    }
  }
}

function buildMockQrGrid() {
  const grid = Array.from({ length: MODULES }, () =>
    Array<boolean>(MODULES).fill(false),
  );

  drawFinder(grid, 0, 0);
  drawFinder(grid, 0, MODULES - 7);
  drawFinder(grid, MODULES - 7, 0);

  for (let row = 0; row < MODULES; row += 1) {
    for (let col = 0; col < MODULES; col += 1) {
      if (grid[row][col] || isInFinderZone(row, col, MODULES)) continue;
      grid[row][col] = (row * 11 + col * 17 + (row ^ col)) % 5 !== 0;
    }
  }

  return grid;
}

type PaymentQrPlaceholderProps = {
  size?: number;
};

export function PaymentQrPlaceholder({ size = DEFAULT_SIZE }: PaymentQrPlaceholderProps) {
  const grid = useMemo(() => buildMockQrGrid(), []);
  const cell = size / MODULES;

  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS.white,
      }}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, rowIndex) =>
          row.map((filled, colIndex) =>
            filled ? (
              <Rect
                key={`${rowIndex}-${colIndex}`}
                x={colIndex * cell}
                y={rowIndex * cell}
                width={cell}
                height={cell}
                fill={COLORS.text}
              />
            ) : null,
          ),
        )}
      </Svg>
    </View>
  );
}
