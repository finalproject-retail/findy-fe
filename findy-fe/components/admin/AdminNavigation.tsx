import CategoryIcon from "@/assets/icons/category-icon.svg";
import HomeIcon from "@/assets/icons/home-icon.svg";
import { ADMIN_COLORS, ADMIN_LAYOUT } from "@/constants/adminTheme";
import { useAdminWideLayout } from "@/hooks/useAdminWideLayout";
import { pretendard } from "@/utils/pretendard";
import { usePathname, useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type AdminNavItem = {
  href: Href;
  label: string;
  match: (path: string) => boolean;
  Icon: typeof HomeIcon;
};

const NAV_ITEMS: AdminNavItem[] = [
  {
    href: "/(admin)" as Href,
    label: "홈",
    match: (path) =>
      !path.includes("/products") &&
      (path.endsWith("/(admin)") || path.endsWith("/(admin)/index") || path === "/"),
    Icon: HomeIcon,
  },
  {
    href: "/(admin)/products" as Href,
    label: "상품 별 성과",
    match: (path) => path.includes("/products"),
    Icon: CategoryIcon,
  },
];

function NavItem({
  item,
  active,
  layout,
  onPress,
}: {
  item: AdminNavItem;
  active: boolean;
  layout: "sidebar" | "tab";
  onPress: () => void;
}) {
  const color = active ? ADMIN_COLORS.navActive : ADMIN_COLORS.navInactive;

  if (layout === "sidebar") {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 10,
          backgroundColor: active ? "#EEF3FF" : "transparent",
        }}
      >
        <item.Icon width={22} height={22} color={color} />
        <Text style={{ ...pretendard(active ? 600 : 500), fontSize: 15, color }}>
          {item.label}
        </Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
      }}
    >
      <item.Icon width={24} height={24} color={color} />
      <Text style={{ ...pretendard(500), fontSize: 12, color }}>{item.label}</Text>
    </Pressable>
  );
}

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        width: ADMIN_LAYOUT.sidebarWidth,
        backgroundColor: ADMIN_COLORS.cardBg,
        borderRightWidth: 1,
        borderRightColor: ADMIN_COLORS.border,
        paddingTop: 28,
        paddingHorizontal: 12,
      }}
    >
      <Text
        style={{
          ...pretendard(700),
          fontSize: 18,
          color: ADMIN_COLORS.navy,
          paddingHorizontal: 8,
          marginBottom: 24,
        }}
      >
        Findy Manager
      </Text>
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.label}
          item={item}
          active={item.match(pathname)}
          layout="sidebar"
          onPress={() => router.push(item.href)}
        />
      ))}
    </View>
  );
}

export function AdminTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: ADMIN_COLORS.cardBg,
        borderTopWidth: 1,
        borderTopColor: ADMIN_COLORS.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.label}
          item={item}
          active={item.match(pathname)}
          layout="tab"
          onPress={() => router.push(item.href)}
        />
      ))}
    </View>
  );
}

export function AdminNavigation() {
  const isWide = useAdminWideLayout();
  return isWide ? <AdminSidebar /> : <AdminTabBar />;
}
