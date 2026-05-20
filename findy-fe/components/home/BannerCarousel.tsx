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

const BANNER_HEIGHT = 240;
const AUTO_PLAY_INTERVAL_MS = 5000;
const SLIDE_COUNT = 10;

const BANNER_SLIDES = Array.from({ length: SLIDE_COUNT }, (_, index) => ({
  id: String(index + 1),
  source: require("@/assets/images/findy-ad.png"),
}));

type BannerSlide = (typeof BANNER_SLIDES)[number];

export function BannerCarousel() {
  const { width: screenWidth } = useWindowDimensions();
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
      <View style={{ width: screenWidth, height: BANNER_HEIGHT }}>
        <Image
          source={item.source}
          style={{ width: "100%", height: BANNER_HEIGHT }}
          contentFit="cover"
        />
      </View>
    ),
    [screenWidth],
  );

  return (
    <View style={{ height: BANNER_HEIGHT, width: "100%" }}>
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
