import SearchIcon from "@/assets/icons/search-icon.svg";
import { COLORS, RADIUS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { TextInput, View } from "react-native";

type PurchaseHistorySearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function PurchaseHistorySearchBar({
  value,
  onChangeText,
}: PurchaseHistorySearchBarProps) {
  return (
    <View
      className="flex-row items-center"
      style={{
        backgroundColor: COLORS.lightGray,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        gap: SPACING.sm,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="자주 산 상품 검색"
        placeholderTextColor={COLORS.subText}
        className="min-w-0 flex-1 text-md text-text-main"
        style={pretendard(400)}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <SearchIcon width={20} height={20} />
    </View>
  );
}
