import DownArrowIcon from "@/assets/icons/down-arrow-icon.svg";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

const ARROW_ICON_WIDTH = 13;
const ARROW_ICON_HEIGHT = 17;
const ARROW_SLOT_SIZE = 17;

export type DropdownFilterOption<T extends string> = {
  key: T;
  label: string;
};

type DropdownFilterProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: DropdownFilterOption<T>[];
  accessibilityLabel?: string;
  align?: "start" | "end";
};

export function DropdownFilter<T extends string>({
  value,
  onChange,
  options,
  accessibilityLabel = "필터",
  align = "end",
}: DropdownFilterProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedLabel =
    options.find((option) => option.key === value)?.label ?? options[0]?.label;

  return (
    <View
      style={{
        alignItems: align === "end" ? "flex-end" : "flex-start",
        overflow: "visible",
        zIndex: open ? 1000 : 1,
      }}
    >
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="flex-row items-center"
        style={{ gap: SPACING.xs, backgroundColor: COLORS.white }}
      >
        <Text className="text-md text-text-main" style={pretendard(500)}>
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
          <View style={{ transform: [{ scaleY: open ? -1 : 1 }] }}>
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
            ...(align === "end" ? { right: 0 } : { left: 0 }),
            minWidth: 120,
            borderWidth: BORDER.base,
            borderColor: COLORS.lightGray,
            borderRadius: RADIUS.xs,
            backgroundColor: COLORS.white,
            paddingVertical: SPACING.xs,
            zIndex: 1001,
            elevation: 12,
            shadowColor: COLORS.text,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          {options.map((option) => {
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
                  className="text-md text-left"
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
