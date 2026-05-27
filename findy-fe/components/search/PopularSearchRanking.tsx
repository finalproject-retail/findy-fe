import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";
import { POPULAR_SEARCH_TERMS } from "./mockSearch";

type PopularSearchRankingProps = {
  onSelect: (term: string) => void;
  showRecentSection: boolean;
};

export function PopularSearchRanking({
  onSelect,
  showRecentSection,
}: PopularSearchRankingProps) {
  const leftColumn = POPULAR_SEARCH_TERMS.slice(0, 5);
  const rightColumn = POPULAR_SEARCH_TERMS.slice(5);

  return (
    <View style={{ gap: SPACING.md }}>
      <Text className="text-md text-text-main" style={pretendard(700)}>
        <Text className="text-main" style={pretendard(700)}>
          Findy
        </Text>{" "}
        인기 검색어 10위
      </Text>

      <View
        style={{
          backgroundColor: COLORS.lightGray,
          borderRadius: RADIUS.md,
          padding: SPACING.lg,
        }}
      >
        <View className="flex-row" style={{ gap: SPACING.xl }}>
          <View className="flex-1" style={{ gap: SPACING.lg }}>
            {leftColumn.map((term, index) => (
              <Pressable
                key={term}
                onPress={() => onSelect(term)}
                accessibilityRole="button"
                accessibilityLabel={`${index + 1}위 ${term}`}
              >
                <Text
                  className="text-md text-text-main"
                  style={pretendard(400)}
                >
                  {index + 1}. {term}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-1" style={{ gap: SPACING.lg }}>
            {rightColumn.map((term, index) => (
              <Pressable
                key={term}
                onPress={() => onSelect(term)}
                accessibilityRole="button"
                accessibilityLabel={`${index + 6}위 ${term}`}
              >
                <Text
                  className="text-md text-text-main"
                  style={pretendard(400)}
                >
                  {index + 6}. {term}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {!showRecentSection ? <View style={{ height: SPACING.xl }} /> : null}
    </View>
  );
}
