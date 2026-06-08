import { Header } from "@/components/common";
import {
  PeriodInquiry,
  getDefaultPeriodInquiryValue,
  type PeriodInquiryValue,
} from "@/components/common/PeriodInquiry";
import { SafeView } from "@/components/layout";
import {
  PointHistoryFilter,
  PointHistoryItem,
  PointSummaryCard,
  type PointHistoryFilterType,
} from "@/components/point";
import { COLORS, SPACING } from "@/constants/theme";
import { usePoints } from "@/contexts/PointsContext";
import { usePointHistories } from "@/hooks/usePointHistories";
import { pretendard } from "@/utils/pretendard";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function PointsScreen() {
  const { balance, refreshReward } = usePoints();
  const [period, setPeriod] = useState<PeriodInquiryValue>(
    getDefaultPeriodInquiryValue,
  );
  const [filter, setFilter] = useState<PointHistoryFilterType>("all");
  const { histories, loading, error, reload } = usePointHistories();
  const periodRef = useRef(period);
  periodRef.current = period;
  const filterRef = useRef(filter);
  filterRef.current = filter;
  const isInitialFocus = useRef(true);

  useEffect(() => {
    void reload(period, filter);
  }, [period, filter, reload]);

  useFocusEffect(
    useCallback(() => {
      void refreshReward();
      if (isInitialFocus.current) {
        isInitialFocus.current = false;
        return;
      }
      void reload(periodRef.current, filterRef.current);
    }, [refreshReward, reload]),
  );

  const handleRetry = () => {
    void reload(period, filter);
  };

  return (
    <SafeView>
      <Header title="포인트" showBack />
      {loading && histories.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.blueText} />
        </View>
      ) : error && histories.length === 0 ? (
        <View
          className="flex-1 items-center justify-center px-screen"
          style={{ gap: SPACING.md }}
        >
          <Text
            className="text-center text-md text-text-sub"
            style={pretendard(400)}
          >
            {error}
          </Text>
          <Pressable
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="다시 시도"
          >
            <Text className="text-md text-text-blue" style={pretendard(600)}>
              다시 시도
            </Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <PointSummaryCard balance={balance} expiringThisMonth={0} />
          <View style={{ paddingHorizontal: SPACING.screen, gap: SPACING.lg }}>
            <PeriodInquiry value={period} onChange={setPeriod} />
            <PointHistoryFilter value={filter} onChange={setFilter} />
            {loading ? (
              <View className="items-center py-lg">
                <ActivityIndicator size="small" color={COLORS.blueText} />
              </View>
            ) : null}
            {histories.length === 0 && !loading ? (
              <Text
                className="py-lg text-center text-md text-text-sub"
                style={pretendard(400)}
              >
                포인트 내역이 없습니다.
              </Text>
            ) : (
              histories.map((item) => (
                <PointHistoryItem key={item.id} item={item} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeView>
  );
}
