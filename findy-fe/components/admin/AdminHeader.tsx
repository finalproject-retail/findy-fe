import CalendarIcon from "@/assets/icons/calendar.svg";
import { DatePickerModal } from "@/components/common/DatePicker";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import {
  adminDateToPickerValue,
  applyAdminDateChange,
} from "@/lib/admin/dateRange";
import type { AdminDateRange } from "@/lib/admin/mockDashboardData";
import { pretendard } from "@/utils/pretendard";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type AdminHeaderProps = {
  dateRange: AdminDateRange;
  onDateRangeChange: (range: AdminDateRange) => void;
  showTitle?: boolean;
};

function DateSegment({
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
      hitSlop={6}
    >
      <Text style={{ ...pretendard(600), fontSize: 14, color: ADMIN_COLORS.navy }}>
        {value}
      </Text>
    </Pressable>
  );
}

export function AdminHeader({
  dateRange,
  onDateRangeChange,
  showTitle = true,
}: AdminHeaderProps) {
  const [pickerTarget, setPickerTarget] = useState<"start" | "end" | null>(null);

  const handleSelectDate = (pickerValue: string) => {
    if (!pickerTarget) return;
    onDateRangeChange(applyAdminDateChange(dateRange, pickerTarget, pickerValue));
    setPickerTarget(null);
  };

  const pickerValue =
    pickerTarget === "start"
      ? adminDateToPickerValue(dateRange.start)
      : pickerTarget === "end"
        ? adminDateToPickerValue(dateRange.end)
        : undefined;

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8, gap: 16 }}>
      {showTitle ? (
        <Text
          style={{
            ...pretendard(700),
            fontSize: 22,
            color: ADMIN_COLORS.navy,
            textAlign: "center",
          }}
        >
          Findy Manager
        </Text>
      ) : null}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: ADMIN_COLORS.dateBarBg,
          borderRadius: 999,
          paddingVertical: 14,
          paddingHorizontal: 20,
          gap: 8,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
          <Text style={{ ...pretendard(500), fontSize: 14, color: ADMIN_COLORS.navyMuted }}>
            날짜 선택:{" "}
          </Text>
          <DateSegment
            label="시작 날짜 선택"
            value={dateRange.start}
            onPress={() => setPickerTarget("start")}
          />
          <Text style={{ ...pretendard(500), fontSize: 14, color: ADMIN_COLORS.navyMuted }}>
            {" "}
            -{" "}
          </Text>
          <DateSegment
            label="종료 날짜 선택"
            value={dateRange.end}
            onPress={() => setPickerTarget("end")}
          />
        </View>

        <Pressable
          onPress={() => setPickerTarget("end")}
          accessibilityRole="button"
          accessibilityLabel="종료 날짜 선택"
        >
          <CalendarIcon width={20} height={20} />
        </Pressable>
      </View>

      <DatePickerModal
        isVisible={pickerTarget != null}
        onClose={() => setPickerTarget(null)}
        onSelectDate={handleSelectDate}
        selectionMode="date"
        value={pickerValue}
      />
    </View>
  );
}
