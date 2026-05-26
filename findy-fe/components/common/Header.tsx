import BackIcon from "@/assets/icons/back-icon.svg";
import BellIcon from "@/assets/icons/bell-icon.svg";
import CartIcon from "@/assets/icons/cart-icon.svg";
import SearchIcon from "@/assets/icons/search-icon.svg";
import PinkLogo from "@/assets/images/pink-logo.svg";
import { pretendard } from "@/utils/pretendard";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export type HeaderRightIcon = "search" | "bell" | "cart";

const ICON_SIZE = 25;
const MAX_RIGHT_ICONS = 3;

export interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showBack?: boolean;
  rightIcons?: HeaderRightIcon[];
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onCartPress?: () => void;
}

export function Header({
  title,
  showLogo = false,
  showBack = false,
  rightIcons = [],
  onBackPress,
  onSearchPress,
  onBellPress,
  onCartPress,
}: HeaderProps) {
  const router = useRouter();
  const icons = rightIcons.slice(0, MAX_RIGHT_ICONS);

  const handleCartPress = () => {
    if (onCartPress) {
      onCartPress();
      return;
    }
    router.push("/cart");
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const renderRightIcon = (icon: HeaderRightIcon) => {
    switch (icon) {
      case "search":
        return (
          <Pressable
            key="search"
            onPress={onSearchPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="검색"
            className="items-center justify-center"
          >
            <SearchIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        );
      case "bell":
        return (
          <Pressable
            key="bell"
            onPress={onBellPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="알림"
            className="items-center justify-center"
          >
            <BellIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        );
      case "cart":
        return (
          <Pressable
            key="cart"
            onPress={handleCartPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="장바구니"
            className="items-center justify-center"
          >
            <CartIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        );
    }
  };

  return (
    <View className="h-header flex-row items-center bg-white px-screen">
      <View className="z-10 flex-1 flex-row items-center">
        {showLogo ? (
          <PinkLogo width={68} height={22} accessibilityLabel="Findy" />
        ) : showBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            className="items-center justify-center"
          >
            <BackIcon width={ICON_SIZE} height={ICON_SIZE} />
          </Pressable>
        ) : null}
      </View>

      {title ? (
        <View
          className="absolute inset-0 items-center justify-center px-24"
          pointerEvents="none"
        >
          <Text
            className="text-lg text-text-main text-center"
            style={pretendard(700)}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
      ) : null}

      <View className="z-10 flex-1 flex-row items-center justify-end gap-3">
        {icons.map(renderRightIcon)}
      </View>
    </View>
  );
}
