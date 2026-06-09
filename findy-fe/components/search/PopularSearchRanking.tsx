import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { usePopularSearchKeywords } from "@/hooks/usePopularSearchKeywords";
import { pretendard } from "@/utils/pretendard";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type PopularSearchRankingProps = {
  onSelect: (term: string) => void;
  showRecentSection: boolean;
};

function splitKeywordColumns(keywords: string[]) {
  return {
    leftColumn: keywords.slice(0, 5),
    rightColumn: keywords.slice(5, 10),
  };
}

export function PopularSearchRanking({
  onSelect,
  showRecentSection,
}: PopularSearchRankingProps) {
  const { keywords, loading, error } = usePopularSearchKeywords();
  const { leftColumn, rightColumn } = splitKeywordColumns(keywords);

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
          minHeight: 180,
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.main} />
        ) : error ? (
          <Text
            className="text-sm text-text-sub"
            style={{ ...pretendard(400), textAlign: "center" }}
          >
            {error}
          </Text>
        ) : keywords.length === 0 ? (
          <Text
            className="text-sm text-text-sub"
            style={{ ...pretendard(400), textAlign: "center" }}
          >
            인기 검색어가 없습니다.
          </Text>
        ) : (
          <View className="flex-row" style={{ gap: SPACING.xl }}>
            <View className="flex-1" style={{ gap: SPACING.lg }}>
              {leftColumn.map((term, index) => (
                <Pressable
                  key={`${term}-${index}`}
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
                  key={`${term}-${index + 5}`}
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
        )}
      </View>

      {!showRecentSection ? <View style={{ height: SPACING.xl }} /> : null}
    </View>
  );
}
