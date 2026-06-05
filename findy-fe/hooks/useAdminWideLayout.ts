import { ADMIN_LAYOUT } from "@/constants/adminTheme";
import { useWindowDimensions } from "react-native";

export function useAdminWideLayout() {
  const { width } = useWindowDimensions();
  return width >= ADMIN_LAYOUT.wideBreakpoint;
}
