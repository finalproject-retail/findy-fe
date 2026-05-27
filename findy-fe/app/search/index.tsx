import { SafeView } from "@/components/layout";
import {
  getRelatedSearchSuggestions,
  PopularSearchRanking,
  RecentSearchSection,
  SearchScreenHeader,
  SearchSuggestionsList,
} from "@/components/search";
import { SPACING } from "@/constants/theme";
import { useRecentSearch } from "@/contexts/RecentSearchContext";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";

export default function SearchScreen() {
  const router = useRouter();
  const { recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearch();
  const [query, setQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery("");
      };
    }, []),
  );

  const suggestions = useMemo(
    () => getRelatedSearchSuggestions(query),
    [query],
  );
  const showSuggestions = query.trim().length > 0 && suggestions.length > 0;
  const showRecent = recentSearches.length > 0 && !showSuggestions;

  const navigateToResults = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    Keyboard.dismiss();
    addRecentSearch(trimmed);
    router.push({
      pathname: "/search/results",
      params: { q: trimmed },
    });
  };

  const handleSubmit = () => {
    navigateToResults(query);
  };

  return (
    <SafeView>
      <SearchScreenHeader
        value={query}
        onChangeText={setQuery}
        onSubmit={handleSubmit}
        onClear={() => setQuery("")}
        showClearButton
        autoFocus
      />

      <View className="flex-1">
        {showSuggestions ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <SearchSuggestionsList
              query={query}
              suggestions={suggestions}
              onSelect={navigateToResults}
            />
          </View>
        ) : null}

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: SPACING.screen,
            paddingTop: SPACING.lg,
            paddingBottom: SPACING.xl,
            gap: SPACING.xl,
          }}
        >
        {showRecent ? (
          <RecentSearchSection
            terms={recentSearches}
            onSelect={navigateToResults}
            onClearAll={clearRecentSearches}
          />
        ) : null}

        <PopularSearchRanking
          onSelect={navigateToResults}
          showRecentSection={showRecent}
        />
        </ScrollView>
      </View>
    </SafeView>
  );
}
