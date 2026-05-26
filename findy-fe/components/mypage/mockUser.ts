import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import { COLORS } from "@/constants/theme";
import type { ImageSourcePropType } from "react-native";

export type MembershipGrade = "bronze" | "silver" | "gold" | "vip";

export type GradeConfig = {
  label: string;
  highlightColor: string;
  benefitPrefix: string;
  benefitHighlight: string;
  benefitSuffix: string;
};

export const GRADE_CONFIG: Record<MembershipGrade, GradeConfig> = {
  bronze: {
    label: "BRONZE",
    highlightColor: "#A2572C",
    benefitPrefix: "포인트 ",
    benefitHighlight: "0.5% 적립",
    benefitSuffix: " · 웰컴쿠폰",
  },
  silver: {
    label: "SILVER",
    highlightColor: "#9C9C9C",
    benefitPrefix: "포인트 ",
    benefitHighlight: "1% 적립",
    benefitSuffix: " · 쿠폰팩",
  },
  gold: {
    label: "GOLD",
    highlightColor: "#F7B231",
    benefitPrefix: "포인트 ",
    benefitHighlight: "1.5% 적립",
    benefitSuffix: " · 쿠폰팩",
  },
  vip: {
    label: "VIP",
    highlightColor: COLORS.main,
    benefitPrefix: "포인트 ",
    benefitHighlight: "2% 적립",
    benefitSuffix: " · 쿠폰팩",
  },
};

export function getGradeConfig(grade: MembershipGrade): GradeConfig {
  return GRADE_CONFIG[grade];
}

export type MypageUser = {
  name: string;
  email: string;
  grade: MembershipGrade;
  points: number;
  recentlyViewedProductIds: string[];
};

export const GRADE_IMAGES: Record<MembershipGrade, ImageSourcePropType> = {
  bronze: require("@/assets/images/grade/bronze.png"),
  silver: require("@/assets/images/grade/silver.png"),
  gold: require("@/assets/images/grade/gold.png"),
  vip: require("@/assets/images/grade/vip.png"),
};

export const MOCK_MYPAGE_USER: MypageUser = {
  name: "김핀디",
  email: "xxxxxxxxx@gmail.com",
  grade: "gold",
  points: 2154,
  recentlyViewedProductIds: ["noodle", "green-tea", "snack", "apple"],
};

export function getRecentlyViewedProducts(ids: string[]): Product[] {
  return ids
    .map((id) => MOCK_PRODUCTS.find((product) => product.id === id))
    .filter((product): product is Product => product != null);
}

export function formatPoints(points: number) {
  return `${points.toLocaleString("ko-KR")}P`;
}
