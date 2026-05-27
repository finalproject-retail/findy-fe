import { Header } from "@/components/common";
import {
  PeriodInquiry,
  getDefaultPeriodInquiryValue,
  type PeriodInquiryValue,
} from "@/components/common/PeriodInquiry";
import { SafeView } from "@/components/layout";
import {
  MOCK_POINT_HISTORY,
  MOCK_POINT_SUMMARY,
  PointHistoryFilter,
  PointHistoryItem,
  PointSummaryCard,
  filterPointHistory,
  type PointHistoryFilterType,
} from "@/components/point";
import { SPACING } from "@/constants/theme";
import { usePoints } from "@/contexts/PointsContext";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

export default function PointsScreen() {
  const { balance } = usePoints();
  const [period, setPeriod] = useState<PeriodInquiryValue>(
    getDefaultPeriodInquiryValue,
  );
  const [filter, setFilter] = useState<PointHistoryFilterType>("all");

  const filteredHistory = useMemo(
    () => filterPointHistory(MOCK_POINT_HISTORY, filter, period),
    [filter, period],
  );

  return (
    <SafeView>
      <Header title="포인트" showBack />
      <ScrollView showsVerticalScrollIndicator={false}>
        <PointSummaryCard
          balance={balance}
          expiringThisMonth={MOCK_POINT_SUMMARY.expiringThisMonth}
        />

        <View
          className="bg-white px-screen"
          style={{
            paddingVertical: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          <PeriodInquiry value={period} onChange={setPeriod} />
          <PointHistoryFilter value={filter} onChange={setFilter} />

          <View>
            {filteredHistory.map((item) => (
              <PointHistoryItem key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeView>
  );
}
