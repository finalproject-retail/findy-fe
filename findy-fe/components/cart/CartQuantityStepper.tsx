import { COLORS, RADIUS } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

const MIN_QUANTITY = 1;
const STEPPER_WIDTH = 120;
const STEPPER_HEIGHT = 32;
const BUTTON_WIDTH = 34;
const STEPPER_SYMBOL_SIZE = 22;

type CartQuantityStepperProps = {
  quantity: number;
  maxQuantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

export function CartQuantityStepper({
  quantity,
  maxQuantity,
  onDecrease,
  onIncrease,
}: CartQuantityStepperProps) {
  const canDecrease = quantity > MIN_QUANTITY;
  const canIncrease = quantity < maxQuantity;

  return (
    <View
      className="flex-row items-center"
      style={{
        width: STEPPER_WIDTH,
        height: STEPPER_HEIGHT,
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
          width: BUTTON_WIDTH,
          opacity: canDecrease ? 1 : 0.35,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: STEPPER_SYMBOL_SIZE,
            color: COLORS.subText,
            lineHeight: STEPPER_SYMBOL_SIZE,
          }}
        >
          −
        </Text>
      </Pressable>

      <Text
        className="flex-1 text-center text-lg"
        style={{
          ...pretendard(700),
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
          width: BUTTON_WIDTH,
          opacity: canIncrease ? 1 : 0.35,
        }}
      >
        <Text
          style={{
            ...pretendard(500),
            fontSize: STEPPER_SYMBOL_SIZE,
            color: COLORS.subText,
            lineHeight: STEPPER_SYMBOL_SIZE,
          }}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
}
