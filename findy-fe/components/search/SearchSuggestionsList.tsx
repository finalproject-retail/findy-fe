import SearchIcon from "@/assets/icons/search-icon.svg";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, Text, View } from "react-native";

type SearchSuggestionsListProps = {
  query: string;
  suggestions: string[];
  onSelect: (term: string) => void;
};

function highlightParts(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [{ text, highlight: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index < 0) {
    return [{ text, highlight: false }];
  }

  return [
    { text: text.slice(0, index), highlight: false },
    { text: text.slice(index, index + trimmed.length), highlight: true },
    { text: text.slice(index + trimmed.length), highlight: false },
  ].filter((part) => part.text.length > 0);
}

export function SearchSuggestionsList({
  query,
  suggestions,
  onSelect,
}: SearchSuggestionsListProps) {
  if (suggestions.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: RADIUS.lg,
        borderBottomRightRadius: RADIUS.lg,
        paddingBottom: SPACING.sm,
        shadowColor: COLORS.text,
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      {suggestions.map((suggestion) => (
        <Pressable
          key={suggestion}
          onPress={() => onSelect(suggestion)}
          accessibilityRole="button"
          accessibilityLabel={`${suggestion} 검색`}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: SPACING.md,
            paddingHorizontal: SPACING.screen,
            paddingVertical: SPACING.md,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: COLORS.lightGray,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SearchIcon width={14} height={14} />
          </View>
          <Text className="text-md text-text-main" style={pretendard(400)}>
            {highlightParts(suggestion, query).map((part, index) => (
              <Text
                key={`${suggestion}-${index}`}
                style={pretendard(part.highlight ? 700 : 400)}
              >
                {part.text}
              </Text>
            ))}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
