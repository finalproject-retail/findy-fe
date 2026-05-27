import BackIcon from "@/assets/icons/back-icon.svg";
import CartIcon from "@/assets/icons/cart-icon.svg";
import DeleteIcon from "@/assets/icons/delete-icon.svg";
import SearchIcon from "@/assets/icons/search-icon.svg";
import {
  BORDER,
  COLORS,
  LAYOUT,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextStyle,
} from "react-native";

const ICON_SIZE = 25;
const CLEAR_ICON_SIZE = 16;
const INPUT_LINE_HEIGHT = 22;

function getSearchInputStyle(): TextStyle {
  const base: TextStyle = {
    width: "100%",
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.text,
    padding: 0,
    margin: 0,
    ...pretendard(400),
  };

  if (Platform.OS === "web") {
    return {
      ...base,
      flex: 1,
      lineHeight: INPUT_LINE_HEIGHT,
    };
  }

  if (Platform.OS === "android") {
    return {
      ...base,
      height: LAYOUT.headerHeight,
      textAlignVertical: "center",
      includeFontPadding: false,
    };
  }

  // iOS: lineHeight·NativeWind className 없이 — wrapper + 소폭 padding으로 optical center
  return {
    ...base,
    height: 20,
    paddingTop: 2,
    paddingBottom: 0,
  };
}

type SearchScreenHeaderProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showCart?: boolean;
  /** 검색 메인 화면에서만 입력 지우기 아이콘 표시 */
  showClearButton?: boolean;
};

export function SearchScreenHeader({
  value,
  onChangeText,
  onSubmit,
  onClear,
  placeholder = "사고싶은 상품을 검색해 보세요.",
  autoFocus = false,
  showCart = false,
  showClearButton = false,
}: SearchScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <View className="bg-white px-screen">
      <View
        className="h-header flex-row items-center"
        style={{ gap: SPACING.sm }}
      >
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로 가기"
        >
          <BackIcon width={ICON_SIZE} height={ICON_SIZE} />
        </Pressable>

        <View
          className="min-w-0 flex-1 flex-row items-center"
          style={{ gap: SPACING.xs, height: LAYOUT.headerHeight }}
        >
          <View
            style={{
              flex: 1,
              height: LAYOUT.headerHeight,
              justifyContent: "center",
            }}
          >
            <TextInput
              value={value}
              onChangeText={onChangeText}
              onSubmitEditing={onSubmit}
              placeholder={placeholder}
              placeholderTextColor={COLORS.subText}
              style={getSearchInputStyle()}
              returnKeyType="search"
              autoFocus={autoFocus}
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
          </View>
          {showClearButton && value.length > 0 ? (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="검색어 지우기"
            >
              <DeleteIcon width={CLEAR_ICON_SIZE} height={CLEAR_ICON_SIZE} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={onSubmit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="검색"
          >
            <SearchIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        </View>

        {showCart ? (
          <Pressable
            onPress={() => router.push("/cart")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="장바구니"
          >
            <CartIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        ) : null}
      </View>
      <View
        style={{
          borderBottomWidth: BORDER.thin,
          borderBottomColor: COLORS.lightGray,
        }}
      />
    </View>
  );
}
