import QuestionIcon from "@/assets/icons/question-icon.svg";
import SettingIcon from "@/assets/icons/setting-icon.svg";
import ShoppingBagIcon from "@/assets/icons/shopping-bag-icon.svg";
import { SPACING } from "@/constants/theme";
import { View } from "react-native";
import { MypageMenuRow } from "./MypageMenuRow";

type MypageMenuListProps = {
  onPurchaseHistoryPress?: () => void;
  onFaqPress?: () => void;
  onSettingsPress?: () => void;
};

export function MypageMenuList({
  onPurchaseHistoryPress,
  onFaqPress,
  onSettingsPress,
}: MypageMenuListProps) {
  return (
    <View style={{ gap: SPACING.xs }}>
      <MypageMenuRow
        icon={ShoppingBagIcon}
        title="구매 내역"
        subtitle="오프라인 구매 내역 모아보기"
        onPress={onPurchaseHistoryPress}
      />
      <MypageMenuRow
        icon={QuestionIcon}
        title="FAQ"
        subtitle="자주 묻는 질문"
        onPress={onFaqPress}
      />
      <MypageMenuRow
        icon={SettingIcon}
        title="설정"
        subtitle="회원 정보 수정, 알림 수신 동의, 위치 수신 동의 설정"
        onPress={onSettingsPress}
      />
    </View>
  );
}
