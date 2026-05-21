import type { Product } from "@/components/product";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "green-tea",
    name: "[웅진] 생차 녹차 (500mL X 6개)",
    image: require("@/assets/images/product/green-tea.png"),
    discountPercent: 57,
    price: 5130,
  },
  {
    id: "beef",
    name: "국내산 소고기 채끝 스테이크 250g",
    image: require("@/assets/images/product/beef.png"),
    discountPercent: 27,
    price: 21300,
  },
  {
    id: "noodle",
    name: "삼양식품 불닭볶음면 105g, 16개",
    image: require("@/assets/images/product/noodle.png"),
    discountPercent: 17,
    price: 18430,
  },
  {
    id: "apple",
    name: "맛있는 문경 사과 1.5kg",
    image: require("@/assets/images/product/apple.png"),
    discountPercent: 57,
    price: 12900,
  },
  {
    id: "snack",
    name: "오레오 씬즈 티라미수 84g x 6개",
    image: require("@/assets/images/product/snack.png"),
    discountPercent: 35,
    price: 1980,
  },
  {
    id: "coffee",
    name: "카누 미니 디카페인 30T",
    image: require("@/assets/images/product/coffee.png"),
    discountPercent: 10,
    price: 10000,
  },
];

/** 실시간 인기 상품 노출 순서 */
export const MOCK_POPULAR_PRODUCTS: Product[] = [
  MOCK_PRODUCTS[3]!, // apple
  MOCK_PRODUCTS[0]!, // green-tea
  MOCK_PRODUCTS[1]!, // beef
  MOCK_PRODUCTS[2]!, // noodle
  MOCK_PRODUCTS[4]!, // snack
];
