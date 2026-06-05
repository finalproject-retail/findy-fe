import { COLORS, RADIUS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const MIN_QUANTITY = 1;
const STEPPER_WIDTH = 120;
const STEPPER_HEIGHT = 32;
const STEPPER_WIDTH_COMPACT = 96;
const STEPPER_HEIGHT_COMPACT = 30;
const BUTTON_WIDTH = 34;
const BUTTON_WIDTH_COMPACT = 28;
const STEPPER_SYMBOL_SIZE = 22;
const STEPPER_SYMBOL_SIZE_COMPACT = 18;

type CartQuantityStepperProps = {
  quantity: number;
  maxQuantity: number;
  /** 스캔 수 등 — 이보다 적게는 줄일 수 없음 (기본 1) */
  minQuantity?: number;
  onDecrease: () => void;
  onIncrease: () => void;
  /** 지도 바텀시트 등 좁은 영역 */
  compact?: boolean;
};

export function CartQuantityStepper({
  quantity,
  maxQuantity,
  minQuantity = MIN_QUANTITY,
  onDecrease,
  onIncrease,
  compact = false,
}: CartQuantityStepperProps) {
  const canDecrease = quantity > minQuantity;
  const canIncrease = quantity < maxQuantity;
  const width = compact ? STEPPER_WIDTH_COMPACT : STEPPER_WIDTH;
  const height = compact ? STEPPER_HEIGHT_COMPACT : STEPPER_HEIGHT;
  const buttonWidth = compact ? BUTTON_WIDTH_COMPACT : BUTTON_WIDTH;
  const symbolSize = compact ? STEPPER_SYMBOL_SIZE_COMPACT : STEPPER_SYMBOL_SIZE;

  return (
    <View
      className="flex-row items-center"
      style={{
        width,
        height,
        borderWidth: 1,
        borderColor: COLORS.gray,
        borderRadius: RADIUS.md,
      }}
    >
      <Pressable
        onPress={onDecrease}
        disabled={!canDecrease}
        accessibilityRole="button"
        accessibilityLabel="수량 줄이기"
        className="h-full items-center justify-center"
        style={{
          width: buttonWidth,
          opacity: canDecrease ? 1 : 0.35,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: symbolSize,
            color: COLORS.subText,
            lineHeight: symbolSize,
          }}
        >
          −
        </Text>
      </Pressable>

      <Text
        className="flex-1 text-center"
        style={{
          ...pretendard(700),
          fontSize: compact ? 15 : 18,
          color: COLORS.charcoal,
        }}
      >
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrease}
        disabled={!canIncrease}
        accessibilityRole="button"
        accessibilityLabel="수량 늘리기"
        className="h-full items-center justify-center"
        style={{
          width: buttonWidth,
          opacity: canIncrease ? 1 : 0.35,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: symbolSize,
            color: COLORS.subText,
            lineHeight: symbolSize,
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
