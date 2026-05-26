import CalendarIcon from "@/assets/icons/calendar.svg";
import OptionsIcon from "@/assets/icons/options-icon.svg";
import { DatePickerModal } from "@/components/common/DatePicker";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export type PeriodPreset = 1 | 3 | 6 | "custom";

export type PeriodInquiryValue = {
  preset: PeriodPreset;
  startDate: string;
  endDate: string;
  showCustomRange: boolean;
};

type PeriodInquiryProps = {
  value: PeriodInquiryValue;
  onChange: (value: PeriodInquiryValue) => void;
};

const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_PADDING_HORIZONTAL = 15;

const PRESET_OPTIONS: { key: PeriodPreset; label: string; months?: number }[] =
  [
    { key: 1, label: "1개월", months: 1 },
    { key: 3, label: "3개월", months: 3 },
    { key: 6, label: "6개월", months: 6 },
    { key: "custom", label: "조회" },
  ];

function formatYearMonth(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}.${month}`;
}

function subtractMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() - months);
  return next;
}

export function getDefaultPeriodInquiryValue(): PeriodInquiryValue {
  const end = new Date();
  const start = subtractMonths(end, 1);
  return {
    preset: 1,
    startDate: formatYearMonth(start),
    endDate: formatYearMonth(end),
    showCustomRange: false,
  };
}

function DateRangeField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="min-w-0 flex-1 flex-row items-center justify-between"
      style={{
        borderWidth: BORDER.base,
        borderColor: COLORS.gray,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
      }}
    >
      <Text className="text-md text-text-main" style={pretendard(500)}>
        {value}
      </Text>
      <CalendarIcon width={18} height={18} />
    </Pressable>
  );
}

export function PeriodInquiry({ value, onChange }: PeriodInquiryProps) {
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(
    null,
  );

  const selectPreset = (preset: PeriodPreset, months?: number) => {
    if (preset === "custom") {
      onChange({
        ...value,
        preset: "custom",
        showCustomRange: !value.showCustomRange,
      });
      return;
    }

    const end = new Date();
    const start = subtractMonths(end, months ?? 1);
    onChange({
      preset,
      startDate: formatYearMonth(start),
      endDate: formatYearMonth(end),
      showCustomRange: false,
    });
  };

  const handleSelectDate = (dateString: string) => {
    if (!pickerTarget) return;
    const next =
      pickerTarget === "start"
        ? { ...value, startDate: dateString }
        : { ...value, endDate: dateString };
    onChange(next);
    setPickerTarget(null);
  };

  return (
    <View style={{ gap: SPACING.md }}>
      <View
        className="flex-row flex-wrap items-center self-start"
        style={{ gap: SPACING.sm }}
      >
        {PRESET_OPTIONS.map((option) => {
          const isCustomButton = option.key === "custom";
          const selected = isCustomButton
            ? value.preset === "custom"
            : value.preset === option.key && !value.showCustomRange;

          return (
            <Pressable
              key={String(option.key)}
              onPress={() => selectPreset(option.key, option.months)}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              className="flex-row items-center justify-center"
              style={{
                paddingVertical: BUTTON_PADDING_VERTICAL,
                paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
                borderRadius: RADIUS.full,
                backgroundColor: selected ? COLORS.text : COLORS.lightGray,
                gap: isCustomButton ? 4 : 0,
              }}
            >
              {isCustomButton ? <OptionsIcon width={14} height={14} /> : null}
              <Text
                className="text-sm"
                style={{
                  ...pretendard(500),
                  color: selected ? COLORS.white : COLORS.subText,
                }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {value.showCustomRange ? (
        <View className="flex-row items-center" style={{ gap: SPACING.sm }}>
          <DateRangeField
            label="시작 날짜"
            value={value.startDate}
            onPress={() => setPickerTarget("start")}
          />
          <Text className="text-md text-text-sub2" style={pretendard(500)}>
            —
          </Text>
          <DateRangeField
            label="종료 날짜"
            value={value.endDate}
            onPress={() => setPickerTarget("end")}
          />
        </View>
      ) : null}

      <DatePickerModal
        isVisible={pickerTarget != null}
        onClose={() => setPickerTarget(null)}
        onSelectDate={handleSelectDate}
        selectionMode="yearMonth"
        value={
          pickerTarget === "start"
            ? value.startDate
            : pickerTarget === "end"
              ? value.endDate
              : undefined
        }
      />
    </View>
  );
}
