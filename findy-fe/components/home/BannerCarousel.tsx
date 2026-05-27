import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  type ListRenderItem,
  Text,
  View,
  type ViewToken,
  useWindowDimensions,
} from "react-native";

const BANNER_ASPECT_WIDTH = 4;
const BANNER_ASPECT_HEIGHT = 3;
const AUTO_PLAY_INTERVAL_MS = 5000;

const AD_BANNER_SOURCES = [
  require("@/assets/images/ad/ad-1.png"),
  require("@/assets/images/ad/ad-2.png"),
  require("@/assets/images/ad/ad-3.png"),
  require("@/assets/images/ad/ad-4.png"),
  require("@/assets/images/ad/ad-5.png"),
  require("@/assets/images/ad/ad-6.png"),
  require("@/assets/images/ad/ad-7.png"),
  require("@/assets/images/ad/ad-8.png"),
  require("@/assets/images/ad/ad-9.png"),
  require("@/assets/images/ad/ad-10.png"),
] as const;

const SLIDE_COUNT = AD_BANNER_SOURCES.length;

const BANNER_SLIDES = AD_BANNER_SOURCES.map((source, index) => ({
  id: String(index + 1),
  source,
}));

type BannerSlide = (typeof BANNER_SLIDES)[number];

export function BannerCarousel() {
  const { width: screenWidth } = useWindowDimensions();
  const bannerHeight =
    (screenWidth * BANNER_ASPECT_HEIGHT) / BANNER_ASPECT_WIDTH;
  const listRef = useRef<FlatList<BannerSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);

  const scrollToIndex = useCallback((index: number, animated = true) => {
    listRef.current?.scrollToIndex({ index, animated });
  }, []);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % SLIDE_COUNT;
      scrollToIndex(nextIndex);
      setCurrentIndex(nextIndex);
    }, AUTO_PLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [scrollToIndex]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const index = viewableItems[0]?.index;
      if (index != null) {
        setCurrentIndex(index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderItem: ListRenderItem<BannerSlide> = useCallback(
    ({ item }) => (
      <View style={{ width: screenWidth, height: bannerHeight }}>
        <Image
          source={item.source}
          style={{ width: "100%", height: bannerHeight }}
          contentFit="cover"
        />
      </View>
    ),
    [screenWidth, bannerHeight],
  );

  return (
    <View style={{ height: bannerHeight, width: "100%" }}>
      <FlatList
        ref={listRef}
        data={BANNER_SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          listRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text className="text-xs text-white" style={pretendard(500)}>
          {currentIndex + 1} / {SLIDE_COUNT}
        </Text>
      </View>
    </View>
  );
}
