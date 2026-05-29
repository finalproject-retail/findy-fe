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
import { LAYOUT, SPACING } from "@/constants/theme";
import { type Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SECTION_GAP = 50;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollBottomPadding = LAYOUT.tabBarTotalHeight + insets.bottom;

  const storeOptions = useMemo(
    () => [
      { id: "findy-cheongnyangni", label: "FINDY 청량리점" },
      { id: "findy-wolgye", label: "FINDY 월계점" },
      { id: "findy-gangnam", label: "FINDY 강남점" },
      { id: "findy-gasan", label: "FINDY 가산점" },
      { id: "findy-dongdaipgu", label: "FINDY 동대입구점" },
    ],
    [],
  );
  const [storeId, setStoreId] = useState(storeOptions[0]!.id);

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
        <HomeStoreFilter value={storeId} options={storeOptions} onChange={setStoreId} />
        <BannerCarousel />

        <View
          className="px-screen"
          style={{
            marginTop: SPACING.lg,
            marginBottom: SPACING.xl,
            gap: SECTION_GAP,
          }}
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
