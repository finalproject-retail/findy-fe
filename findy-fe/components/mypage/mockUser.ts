import { MOCK_PRODUCTS } from "@/components/home/mockProducts";
import type { Product } from "@/components/product";
import type { ImageSourcePropType } from "react-native";

export type MembershipGrade = "bronze" | "silver" | "gold" | "vip";

export type MypageUser = {
  name: string;
  email: string;
  grade: MembershipGrade;
  gradeLabel: string;
  gradeBenefitPrefix: string;
  gradeBenefitHighlight: string;
  gradeBenefitSuffix: string;
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
  gradeLabel: "GOLD",
  gradeBenefitPrefix: "포인트 ",
  gradeBenefitHighlight: "2% 적립",
  gradeBenefitSuffix: " · 쿠폰팩",
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
