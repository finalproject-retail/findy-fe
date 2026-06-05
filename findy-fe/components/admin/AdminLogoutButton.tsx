import LogoutIcon from "@/assets/icons/logout-icon.svg";
import { SettingsLogoutModal } from "@/components/settings/SettingsLogoutModal";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import { useAuth } from "@/contexts/AuthContext";
import { pretendard } from "@/utils/pretendard";
import { useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

type AdminLogoutButtonProps = {
  layout: "sidebar" | "tab";
};

const LOGOUT_COLOR = ADMIN_COLORS.negativeText;

export function AdminLogoutButton({ layout }: AdminLogoutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [visible, setVisible] = useState(false);

  const handleConfirm = async () => {
    setVisible(false);
    await signOut();
    router.replace("/(auth)/login" as Href);
  };

  if (layout === "sidebar") {
    return (
      <>
        <Pressable
          onPress={() => setVisible(true)}
          accessibilityRole="button"
          accessibilityLabel="로그아웃"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 14,
            paddingHorizontal: 20,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <LogoutIcon width={22} height={22} color={LOGOUT_COLOR} />
          <Text style={{ ...pretendard(500), fontSize: 15, color: LOGOUT_COLOR }}>
            로그아웃
          </Text>
        </Pressable>

        <SettingsLogoutModal
          visible={visible}
          onCancel={() => setVisible(false)}
          onConfirm={() => void handleConfirm()}
        />
      </>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="로그아웃"
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          paddingVertical: 10,
        }}
      >
        <LogoutIcon width={24} height={24} color={LOGOUT_COLOR} />
        <Text style={{ ...pretendard(500), fontSize: 12, color: LOGOUT_COLOR }}>
          로그아웃
        </Text>
      </Pressable>

      <SettingsLogoutModal
        visible={visible}
        onCancel={() => setVisible(false)}
        onConfirm={() => void handleConfirm()}
      />
    </>
  );
}
