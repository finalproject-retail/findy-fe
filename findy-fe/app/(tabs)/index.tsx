import { Header } from "@/components/common";
import {
  BannerCarousel,
  FindyRecommendSection,
  HomeStoreFilter,
  NewProductsSection,
  OnboardingRecommendSection,
  PopularProductsSection,
} from "@/components/home";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import {
  DEFAULT_HOME_STORE_ID,
  HOME_STORE_OPTIONS,
} from "@/components/home/storeOptions";
import { LAYOUT, SPACING } from "@/constants/theme";
import { type Href, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTION_GAP = 50;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = LAYOUT.tabBarTotalHeight + insets.bottom;

  const [storeId, setStoreId] = useState(DEFAULT_HOME_STORE_ID);

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header
        showLogo
        rightIcons={["search", "bell", "cart"]}
        onSearchPress={() => router.push("/search" as Href)}
      />
      <ScrollView
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <HomeStoreFilter
          value={storeId}
          options={HOME_STORE_OPTIONS}
          onChange={setStoreId}
        />
        <BannerCarousel />

        <View
          className="px-screen"
          style={{
            marginTop: SPACING.lg,
            marginBottom: SPACING.xl,
            gap: SECTION_GAP,
          }}
        >
          <NewProductsSection storeId={storeId} />
          <PopularProductsSection storeId={storeId} />
          <OnboardingRecommendSection storeId={storeId} />
          <FindyRecommendSection storeId={storeId} />
        </View>
      </ScrollView>
    </SafeView>
  );
}
