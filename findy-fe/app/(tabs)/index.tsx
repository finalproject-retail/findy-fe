import { Header } from "@/components/common";
import {
  BannerCarousel,
  FindyRecommendSection,
  NewProductsSection,
  OnboardingRecommendSection,
  PopularProductsSection,
} from "@/components/home";
import { SafeView, TAB_SCREEN_EDGES } from "@/components/layout";
import { LAYOUT, SPACING } from "@/constants/theme";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTION_GAP = 50;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = LAYOUT.tabBarTotalHeight + insets.bottom;

  return (
    <SafeView edges={TAB_SCREEN_EDGES}>
      <Header showLogo rightIcons={["search", "bell", "cart"]} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      >
        <BannerCarousel />

        <View
          className="px-screen"
          style={{ marginTop: SPACING.lg, gap: SECTION_GAP }}
        >
          <NewProductsSection />
          <PopularProductsSection />
          <OnboardingRecommendSection />
          <FindyRecommendSection />
        </View>
      </ScrollView>
    </SafeView>
  );
}
