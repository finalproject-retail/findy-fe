import { pretendard } from "@/utils/pretendard";
import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type HomeSectionProps = PropsWithChildren<{
  title: string;
}>;

export function HomeSection({ title, children }: HomeSectionProps) {
  return (
    <View className="gap-4">
      <Text className="text-2xl text-text-main" style={pretendard(700)}>
        {title}
      </Text>
      {children}
    </View>
  );
}
