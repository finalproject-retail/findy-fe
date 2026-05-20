import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  View,
  type ListRenderItemInfo,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

export const WHEEL_ITEM_HEIGHT = 44;
export const WHEEL_VISIBLE_ROWS = 5;
export const WHEEL_PICKER_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;

type WheelPickerProps<T extends number> = {
  data: T[];
  value: T;
  onChange: (value: T) => void;
  formatLabel?: (item: T) => string;
};

function WheelPickerItem({
  index,
  label,
  scrollY,
  pickerHeight,
  paddingVertical,
}: {
  index: number;
  label: string;
  scrollY: SharedValue<number>;
  pickerHeight: number;
  paddingVertical: number;
}) {
  const animatedRowStyle = useAnimatedStyle(() => {
    const itemCenterY =
      paddingVertical + index * WHEEL_ITEM_HEIGHT + WHEEL_ITEM_HEIGHT / 2;
    const viewportCenterY = scrollY.value + pickerHeight / 2;
    const distance = itemCenterY - viewportCenterY;
    const absDistance = Math.abs(distance);

    const opacity = interpolate(
      absDistance,
      [0, WHEEL_ITEM_HEIGHT, WHEEL_ITEM_HEIGHT * 2.4],
      [1, 0.45, 0.2],
      Extrapolation.CLAMP,
    );
    const rotateX = interpolate(
      absDistance,
      [0, WHEEL_ITEM_HEIGHT * 2.4],
      [0, 42],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { rotateX: `${distance < 0 ? rotateX : -rotateX}deg` },
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const itemCenterY =
      paddingVertical + index * WHEEL_ITEM_HEIGHT + WHEEL_ITEM_HEIGHT / 2;
    const viewportCenterY = scrollY.value + pickerHeight / 2;
    const absDistance = Math.abs(itemCenterY - viewportCenterY);

    const fontSize = interpolate(
      absDistance,
      [0, WHEEL_ITEM_HEIGHT, WHEEL_ITEM_HEIGHT * 2],
      [22, 17, 14],
      Extrapolation.CLAMP,
    );

    return {
      fontSize,
      fontWeight: absDistance < WHEEL_ITEM_HEIGHT * 0.35 ? "700" : "400",
    };
  });

  return (
    <Animated.View
      style={[
        { height: WHEEL_ITEM_HEIGHT, justifyContent: "center", alignItems: "center" },
        animatedRowStyle,
      ]}
    >
      <Animated.Text style={[{ color: "#000000", fontFamily: "Pretendard" }, animatedTextStyle]}>
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

export function WheelPicker<T extends number>({
  data,
  value,
  onChange,
  formatLabel = (item) => String(item),
}: WheelPickerProps<T>) {
  const pickerHeight = WHEEL_PICKER_HEIGHT;
  const paddingVertical = (pickerHeight - WHEEL_ITEM_HEIGHT) / 2;
  const listRef = useRef<FlatList<T>>(null);
  const scrollY = useSharedValue(0);
  const lastIndexRef = useRef(-1);
  const onChangeRef = useRef(onChange);
  const dataRef = useRef(data);

  onChangeRef.current = onChange;
  dataRef.current = data;

  const getScrollOffset = useCallback((index: number) => index * WHEEL_ITEM_HEIGHT, []);

  const emitIndex = useCallback((index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, dataRef.current.length - 1));
    if (clampedIndex === lastIndexRef.current) return;

    const next = dataRef.current[clampedIndex];
    if (next === undefined) return;

    lastIndexRef.current = clampedIndex;
    onChangeRef.current(next);
  }, []);

  const scrollToIndex = useCallback(
    (index: number, animated: boolean) => {
      const clampedIndex = Math.max(0, Math.min(index, dataRef.current.length - 1));
      const offset = getScrollOffset(clampedIndex);
      scrollY.value = offset;
      lastIndexRef.current = clampedIndex;
      listRef.current?.scrollToOffset({ offset, animated });
    },
    [getScrollOffset, scrollY],
  );

  useEffect(() => {
    const index = data.indexOf(value);
    if (index < 0) return;

    lastIndexRef.current = index;
    requestAnimationFrame(() => scrollToIndex(index, false));
  }, [data, scrollToIndex]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      const index = Math.round(event.contentOffset.y / WHEEL_ITEM_HEIGHT);
      runOnJS(emitIndex)(index);
    },
  });

  const snapToNearest = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / WHEEL_ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, dataRef.current.length - 1));
      const snappedOffset = getScrollOffset(clampedIndex);

      scrollY.value = snappedOffset;
      if (Math.abs(offsetY - snappedOffset) > 1) {
        listRef.current?.scrollToOffset({ offset: snappedOffset, animated: true });
      }

      emitIndex(clampedIndex);
    },
    [emitIndex, getScrollOffset, scrollY],
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<T>) => (
      <WheelPickerItem
        index={index}
        label={formatLabel(item)}
        scrollY={scrollY}
        pickerHeight={pickerHeight}
        paddingVertical={paddingVertical}
      />
    ),
    [formatLabel, paddingVertical, pickerHeight, scrollY],
  );

  return (
    <View style={{ height: pickerHeight }} className="relative overflow-hidden">
      <View
        pointerEvents="none"
        className="absolute left-0 right-0 z-10 rounded-lg bg-light-gray/60"
        style={{
          top: paddingVertical,
          height: WHEEL_ITEM_HEIGHT,
        }}
      />

      <Animated.FlatList
        ref={listRef}
        data={data}
        keyExtractor={(item) => String(item)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={snapToNearest}
        onScrollEndDrag={snapToNearest}
        getItemLayout={(_, index) => ({
          length: WHEEL_ITEM_HEIGHT,
          offset: paddingVertical + WHEEL_ITEM_HEIGHT * index,
          index,
        })}
        contentContainerStyle={{ paddingVertical }}
        initialNumToRender={16}
        maxToRenderPerBatch={24}
        windowSize={9}
      />

      <LinearGradient
        pointerEvents="none"
        colors={["#FFFFFF", "rgba(255,255,255,0)"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: paddingVertical + 8,
          zIndex: 20,
        }}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0)", "#FFFFFF"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: paddingVertical + 8,
          zIndex: 20,
        }}
      />
    </View>
  );
}
