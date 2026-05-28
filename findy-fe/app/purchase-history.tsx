import {
  getDefaultPeriodInquiryValue,
  Header,
  PeriodInquiry,
  type PeriodInquiryValue,
} from "@/components/common";
import { SafeView } from "@/components/layout";
import {
  PurchaseHistoryDateSection,
  PurchaseHistorySearchBar,
  filterPurchaseHistory,
  groupPurchaseHistoryByDate,
} from "@/components/purchase-history";
import { usePurchaseHistory } from "@/contexts/PurchaseHistoryContext";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

export default function PurchaseHistoryScreen() {
  const { records } = usePurchaseHistory();
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<PeriodInquiryValue>(
    getDefaultPeriodInquiryValue,
  );

  const dateGroups = useMemo(() => {
    const filtered = filterPurchaseHistory(records, query, period);
    return groupPurchaseHistoryByDate(filtered);
  }, [query, period, records]);

  return (
    <SafeView>
      <Header title="구매 내역" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: SPACING.screen,
          paddingBottom: SPACING.xl,
        }}
      >
        <View style={{ gap: SPACING.md, paddingVertical: SPACING.lg }}>
          <PurchaseHistorySearchBar value={query} onChangeText={setQuery} />
          <PeriodInquiry value={period} onChange={setPeriod} />
        </View>

        {dateGroups.length === 0 ? (
          <Text
            className="text-center text-md text-text-sub"
            style={{ ...pretendard(400), paddingTop: SPACING.xl }}
          >
            구매 내역이 없습니다.
          </Text>
        ) : (
          dateGroups.map((group) => (
            <PurchaseHistoryDateSection key={group.date} group={group} />
          ))
        )}
      </ScrollView>
    </SafeView>
  );
}
