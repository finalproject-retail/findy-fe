import { BORDER, COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, ScrollView, Text, View } from "react-native";

type RecentSearchSectionProps = {
  terms: string[];
  onSelect: (term: string) => void;
  onClearAll: () => void;
};

export function RecentSearchSection({
  terms,
  onSelect,
  onClearAll,
}: RecentSearchSectionProps) {
  if (terms.length === 0) return null;

  return (
    <View style={{ gap: SPACING.md }}>
      <View className="flex-row items-center justify-between">
        <Text className="text-md text-text-main" style={pretendard(700)}>
          최근 검색어
        </Text>
        <Pressable
          onPress={onClearAll}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="최근 검색어 삭제"
        >
          <Text className="text-xs text-text-sub" style={pretendard(400)}>
            최근 검색어 삭제
          </Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: SPACING.sm }}
      >
        {terms.map((term) => (
          <Pressable
            key={term}
            onPress={() => onSelect(term)}
            accessibilityRole="button"
            accessibilityLabel={`${term} 검색`}
            style={{
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
              borderRadius: 999,
              borderWidth: BORDER.base,
              borderColor: COLORS.text,
              backgroundColor: COLORS.white,
            }}
          >
            <Text className="text-sm text-text-main" style={pretendard(400)}>
              {term}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
