import { pretendard } from "@/utils/pretendard";
import { Text, type TextProps } from "react-native";
import { isLowStock } from "./isOutOfStock";

type RemainingStockTextProps = {
  stockCount: number;
  size?: "sm" | "md";
  className?: string;
} & Pick<TextProps, "numberOfLines">;

export function RemainingStockText({
  stockCount,
  size = "md",
  className,
  numberOfLines,
}: RemainingStockTextProps) {
  const lowStock = isLowStock(stockCount);
  const sizeClass = size === "sm" ? "text-sm" : "text-md";
  const weight = size === "sm" ? 400 : 500;

  return (
    <Text
      className={[sizeClass, lowStock ? "text-text-red" : "text-text-blue", className]
        .filter(Boolean)
        .join(" ")}
      numberOfLines={numberOfLines}
      style={{
        ...pretendard(weight),
        textDecorationLine: "underline",
      }}
    >
      남은 재고 {stockCount}개
    </Text>
  );
}
