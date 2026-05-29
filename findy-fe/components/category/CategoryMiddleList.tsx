import { MypageNavigateArrow } from "@/components/mypage/MypageNavigateArrow";
import { SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { CategoryMiddle } from "./categoryCatalog";

type CategoryMiddleListProps = {
  middles: CategoryMiddle[];
  onPressMiddle: (middle: CategoryMiddle) => void;
  onPressSub: (middle: CategoryMiddle, categoryId: number) => void;
};

export function CategoryMiddleList({
  middles,
  onPressMiddle,
  onPressSub,
}: CategoryMiddleListProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: SPACING.md,
        paddingBottom: 150,
      }}
    >
      {middles.map((middle) => (
        <View key={middle.key} style={{ marginBottom: SPACING.lg }}>
          <Pressable
            onPress={() => onPressMiddle(middle)}
            accessibilityRole="button"
            accessibilityLabel={`${middle.label} 카테고리 보기`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: SPACING.screen,
              paddingVertical: SPACING.sm,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 18 }}>{middle.emoji}</Text>
              <Text className="text-xl text-text-main" style={pretendard(700)}>
                {middle.label}
              </Text>
            </View>
            <MypageNavigateArrow />
          </Pressable>

          {middle.subs.map((sub) => (
            <Pressable
              key={sub.categoryId}
              onPress={() => onPressSub(middle, sub.categoryId)}
              accessibilityRole="button"
              accessibilityLabel={sub.label}
              style={{
                paddingHorizontal: SPACING.screen,
                paddingVertical: 14,
              }}
            >
              <Text className="text-md text-text-main" style={pretendard(400)}>
                {sub.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
