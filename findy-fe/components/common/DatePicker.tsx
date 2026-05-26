import {
  WHEEL_PICKER_HEIGHT,
  WheelPicker,
} from "@/components/common/WheelPicker";
import { BORDER, COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type DatePickerSelectionMode = "date" | "yearMonth";

interface DatePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void;
  /** YYYY.MM.DD 또는 YYYY.MM — 없으면 오늘 날짜 기준 */
  value?: string;
  /** yearMonth: 월 선택 시 YYYY.MM 반환 후 닫힘 */
  selectionMode?: DatePickerSelectionMode;
}

type PickerDateParts = {
  year: number;
  month: number;
  day: number | null;
};

function clampYear(year: number) {
  return Math.min(Math.max(year, MIN_YEAR), MAX_YEAR);
}

function getTodayParts(): PickerDateParts {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function parsePickerValue(
  value: string | undefined,
  selectionMode: DatePickerSelectionMode,
): PickerDateParts {
  const fallback = getTodayParts();
  if (!value?.trim()) return fallback;

  const segments = value.trim().split(".");
  const [yearRaw, monthRaw, dayRaw] = segments.map((part) => Number(part));
  if (
    segments.length < 2 ||
    Number.isNaN(yearRaw) ||
    Number.isNaN(monthRaw) ||
    monthRaw < 1 ||
    monthRaw > 12
  ) {
    return fallback;
  }

  const day =
    selectionMode === "date" &&
    segments.length >= 3 &&
    !Number.isNaN(dayRaw) &&
    dayRaw >= 1
      ? dayRaw
      : fallback.day;

  return {
    year: clampYear(yearRaw),
    month: monthRaw,
    day,
  };
}

const MIN_YEAR = 1920;
const MAX_YEAR = new Date().getFullYear();
const SHEET_OFFSET = 400;

/** 일 달력 최대 6주 × (셀 40 + mb-2 8) — 세 모달 본문 공통 높이 */
const DAY_ROW_HEIGHT = 48;
const DAY_GRID_MAX_ROWS = 6;
const SHEET_BODY_HEIGHT = DAY_ROW_HEIGHT * DAY_GRID_MAX_ROWS;

const sheetStyles = StyleSheet.create({
  sheet: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.md,
    borderTopRightRadius: RADIUS.md,
  },
  sheetInner: {
    paddingHorizontal: SPACING.screen,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(199, 199, 199, 0.3)",
    alignSelf: "center",
    marginBottom: 16,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  sheetAnimated: {
    width: "100%",
    backgroundColor: COLORS.white,
  },
  monthCell: {
    width: "30%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: BORDER.base,
    borderRadius: RADIUS.md,
  },
  dayDot: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
});

function DatePickerSheet({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={sheetStyles.sheet}>
      <View
        style={[
          sheetStyles.sheetInner,
          { paddingBottom: Math.max(insets.bottom, SPACING.lg) },
        ]}
      >
        <View style={sheetStyles.handle} />
        {children}
      </View>
    </View>
  );
}

function SheetHeader({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row justify-between items-center mb-4 min-h-[44px]">
      {children}
    </View>
  );
}

function SheetBody({
  children,
  centerContent = false,
}: {
  children: React.ReactNode;
  centerContent?: boolean;
}) {
  return (
    <View
      style={{ height: SHEET_BODY_HEIGHT }}
      className={centerContent ? "justify-center items-center" : undefined}
    >
      {children}
    </View>
  );
}

export function DatePickerModal({
  isVisible,
  onClose,
  onSelectDate,
  value,
  selectionMode = "date",
}: DatePickerModalProps) {
  const today = getTodayParts();
  const [currentYear, setCurrentYear] = useState(today.year);
  const [currentMonth, setCurrentMonth] = useState(today.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.day);
  const [viewMode, setViewMode] = useState<"month" | "day">("month");
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(today.year);
  const pickerYearRef = useRef(today.year);

  const translateY = useSharedValue(SHEET_OFFSET);

  const years = useMemo(
    () =>
      Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MAX_YEAR - i),
    [],
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    pickerYearRef.current = pickerYear;
  }, [pickerYear]);

  useEffect(() => {
    if (isVisible) {
      const parts = parsePickerValue(value, selectionMode);
      setCurrentYear(parts.year);
      setCurrentMonth(parts.month);
      setSelectedDay(parts.day);
      setPickerYear(parts.year);
      pickerYearRef.current = parts.year;
      setShowYearPicker(false);
      setViewMode(
        selectionMode === "date" && parts.day != null ? "day" : "month",
      );

      translateY.value = withTiming(0, {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      translateY.value = SHEET_OFFSET;
      setShowYearPicker(false);
      setViewMode("month");
    }
  }, [isVisible, value, selectionMode, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    backgroundColor: COLORS.white,
  }));

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleMonthSelect = (month: number) => {
    if (selectionMode === "yearMonth") {
      const formattedMonth = String(month).padStart(2, "0");
      onSelectDate(`${currentYear}.${formattedMonth}`);
      onClose();
      return;
    }
    setCurrentMonth(month);
    setViewMode("day");
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    const formattedMonth = String(currentMonth).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");

    onSelectDate(`${currentYear}.${formattedMonth}.${formattedDay}`);
    onClose();
  };

  const openYearPicker = () => {
    if (viewMode === "day") return;
    pickerYearRef.current = currentYear;
    setPickerYear(currentYear);
    setShowYearPicker(true);
  };

  const formatYearLabel = useCallback((year: number) => `${year}년`, []);

  const handlePickerYearChanging = useCallback((year: number) => {
    pickerYearRef.current = year;
    setPickerYear(year);
  }, []);

  const handlePickerYearChange = useCallback((year: number) => {
    pickerYearRef.current = year;
    setPickerYear(year);
  }, []);

  const confirmYearPicker = () => {
    const year = pickerYearRef.current;
    setCurrentYear(year);
    setPickerYear(year);
    setShowYearPicker(false);
  };

  const handleHeaderBack = () => {
    if (viewMode === "day") {
      setViewMode("month");
      return;
    }
    setCurrentYear((prev) => Math.max(prev - 1, MIN_YEAR));
  };

  const handleHeaderForward = () => {
    if (viewMode === "day") {
      setViewMode("month");
      return;
    }
    setCurrentYear((prev) => Math.min(prev + 1, MAX_YEAR));
  };

  const handleBackdropPress = () => {
    setShowYearPicker(false);
    onClose();
  };

  const handleRequestClose = () => {
    if (showYearPicker) {
      setShowYearPicker(false);
      return;
    }
    onClose();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
  const emptySpaces = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleRequestClose}
    >
      <View style={sheetStyles.modalRoot}>
        <Pressable
          style={sheetStyles.backdrop}
          onPress={handleBackdropPress}
          accessibilityRole="button"
        />

        <Animated.View style={[sheetStyles.sheetAnimated, sheetAnimatedStyle]}>
          <DatePickerSheet>
            <SheetHeader>
              <Pressable onPress={handleHeaderBack} className="p-2">
                <Text
                  className="text-md text-text-sub2"
                  style={pretendard(500)}
                >
                  〈
                </Text>
              </Pressable>

              <Pressable onPress={openYearPicker} disabled={viewMode === "day"}>
                <Text
                  className="text-xl text-text-main"
                  style={pretendard(700)}
                >
                  {viewMode === "month"
                    ? `${currentYear}년`
                    : `${currentYear}년 ${currentMonth}월`}
                </Text>
              </Pressable>

              <Pressable onPress={handleHeaderForward} className="p-2">
                <Text
                  className="text-lg text-text-sub2"
                  style={pretendard(500)}
                >
                  〉
                </Text>
              </Pressable>
            </SheetHeader>

            <SheetBody>
              {viewMode === "month" && (
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {months.map((month) => {
                    const isSelected = currentMonth === month;
                    return (
                      <Pressable
                        key={month}
                        onPress={() => handleMonthSelect(month)}
                        style={[
                          sheetStyles.monthCell,
                          {
                            backgroundColor: isSelected
                              ? COLORS.charcoal
                              : COLORS.white,
                            borderColor: isSelected
                              ? COLORS.charcoal
                              : COLORS.gray,
                          },
                        ]}
                      >
                        <Text
                          className="text-lg"
                          style={{
                            ...pretendard(isSelected ? 700 : 500),
                            color: isSelected ? COLORS.white : COLORS.text,
                          }}
                        >
                          {month}월
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              {viewMode === "day" && (
                <View className="flex-row flex-wrap justify-start">
                  {emptySpaces.map((_, index) => (
                    <View
                      key={`empty-${index}`}
                      className="w-[14.28%] h-[40px] mb-2"
                    />
                  ))}

                  {daysArray.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <Pressable
                        key={day}
                        onPress={() => handleDaySelect(day)}
                        className="w-[14.28%] h-[40px] justify-center items-center mb-2"
                      >
                        <View
                          style={[
                            sheetStyles.dayDot,
                            {
                              backgroundColor: isSelected
                                ? COLORS.main
                                : "transparent",
                            },
                          ]}
                        >
                          <Text
                            className="text-sm"
                            style={{
                              ...pretendard(isSelected ? 700 : 400),
                              color: isSelected ? COLORS.white : COLORS.text,
                            }}
                          >
                            {day}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </SheetBody>
          </DatePickerSheet>
        </Animated.View>

        {showYearPicker && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              width: "100%",
              zIndex: 10,
            }}
          >
            <DatePickerSheet>
              <SheetHeader>
                <Pressable
                  onPress={() => setShowYearPicker(false)}
                  className="py-1 px-2"
                >
                  <Text
                    className="text-md text-text-sub2"
                    style={pretendard(400)}
                  >
                    취소
                  </Text>
                </Pressable>
                <Text
                  className="text-xl text-text-main"
                  style={pretendard(700)}
                >
                  {pickerYear}년
                </Text>
                <Pressable onPress={confirmYearPicker} className="py-1 px-2">
                  <Text className="text-md text-main" style={pretendard(700)}>
                    완료
                  </Text>
                </Pressable>
              </SheetHeader>

              <SheetBody centerContent>
                <View style={{ height: WHEEL_PICKER_HEIGHT }}>
                  <WheelPicker
                    key={`year-wheel-${currentYear}`}
                    data={years}
                    value={pickerYear}
                    onChange={handlePickerYearChange}
                    onChanging={handlePickerYearChanging}
                    formatLabel={formatYearLabel}
                  />
                </View>
              </SheetBody>
            </DatePickerSheet>
          </View>
        )}
      </View>
    </Modal>
  );
}
