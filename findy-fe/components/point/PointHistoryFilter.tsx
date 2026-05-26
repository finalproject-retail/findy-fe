import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import type { PointHistoryFilterType } from "./mockPointHistory";

const ARROW_ICON_WIDTH = 13;
const ARROW_ICON_HEIGHT = 17;
/** flex-row 안에서 회전해도 레이아웃 박스가 흔들리지 않도록 고정 */
const ARROW_SLOT_SIZE = 17;

const FILTER_OPTIONS: { key: PointHistoryFilterType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "earned", label: "적립" },
  { key: "used_expired", label: "사용 · 소멸" },
];

type PointHistoryFilterProps = {
  value: PointHistoryFilterType;
  onChange: (value: PointHistoryFilterType) => void;
};

export function PointHistoryFilter({
  value,
  onChange,
}: PointHistoryFilterProps) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    FILTER_OPTIONS.find((option) => option.key === value)?.label ?? "전체";

  return (
    <View className="items-end">
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel="포인트 내역 필터"
        className="flex-row items-center"
        style={{ gap: SPACING.xs, backgroundColor: COLORS.white }}
      >
        <Text className="text-lg text-text-main" style={pretendard(500)}>
          {selectedLabel}
        </Text>
        <View
          style={{
            width: ARROW_SLOT_SIZE,
            height: ARROW_SLOT_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              transform: [{ scaleY: open ? -1 : 1 }],
            }}
          >
            <DownArrowIcon
              width={ARROW_ICON_WIDTH}
              height={ARROW_ICON_HEIGHT}
            />
          </View>
        </View>
      </Pressable>

      {open ? (
        <View
          style={{
            position: "absolute",
            top: 28,
            right: 0,
            minWidth: 120,
            borderWidth: BORDER.base,
            borderColor: COLORS.lightGray,
            borderRadius: RADIUS.xs,
            backgroundColor: COLORS.white,
            paddingVertical: SPACING.xs,
            zIndex: 10,
            elevation: 4,
            shadowColor: COLORS.text,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {FILTER_OPTIONS.map((option) => {
            const selected = option.key === value;
            return (
              <Pressable
                key={option.key}
                onPress={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
                style={{
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                }}
              >
                <Text
                  className="text-lg text-left"
                  style={{
                    ...pretendard(500),
                    color: selected ? COLORS.main : COLORS.text,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
