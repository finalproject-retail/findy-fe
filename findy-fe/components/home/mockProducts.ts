import type { Product } from "@/components/product";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "green-tea",
    name: "[웅진] 생차 녹차 (500mL X 6개)",
    image: require("@/assets/images/product/green-tea.png"),
    discountPercent: 57,
    price: 5130,
    category: "음료 · 커피/차",
    originalPrice: 11900,
    couponPrice: 5130,
    stockCount: 42,
    availableCoupons: [
      { id: "green-tea-15", discountPercent: 15, downloaded: false },
      { id: "green-tea-10", discountPercent: 10, downloaded: false },
    ],
  },
  {
    id: "beef",
    name: "국내산 소고기 채끝 스테이크 250g",
    image: require("@/assets/images/product/beef.png"),
    discountPercent: 27,
    price: 21300,
    category: "축산 · 소고기",
    originalPrice: 29200,
    couponPrice: 21300,
    stockCount: 18,
    availableCoupons: [
      { id: "beef-15", discountPercent: 15, downloaded: true },
    ],
  },
  {
    id: "noodle",
    name: "삼양식품 불닭볶음면 105g, 16개",
    image: require("@/assets/images/product/noodle.png"),
    discountPercent: 17,
    price: 18430,
    category: "면/통조림 · 라면",
    originalPrice: 22200,
    couponPrice: 18430,
    stockCount: 30,
    availableCoupons: [
      { id: "noodle-15", discountPercent: 15, downloaded: true },
      { id: "noodle-5", discountPercent: 5, downloaded: true },
    ],
    spec: {
      packagingType: "상온 (종이포장)",
      salesUnit: "1박스",
      weightCapacity: "61g x 6개입",
      allergyInfo: "-밀, 대두, 우유, 계란, 쇠고기 함유",
      allergyNote:
        "*메밀, 땅콩, 고등어, 게, 돼지고기, 토마토, 새우, 호두, 닭고기, 오징어, 잣, 조개류(굴, 전복, 홍합 포함)를 사용한 제품과 같은 시설에서 제조하고 있습니다.",
    },
    detailImages: [
      require("@/assets/images/product/noodle.png"),
      require("@/assets/images/product/noodle.png"),
      require("@/assets/images/product/noodle.png"),
    ],
  },
  {
    id: "apple",
    name: "맛있는 문경 사과 1.5kg",
    image: require("@/assets/images/product/apple.png"),
    discountPercent: 57,
    price: 12900,
    category: "농산 · 과일",
    originalPrice: 29900,
    couponPrice: 12900,
    stockCount: 25,
    availableCoupons: [
      { id: "apple-20", discountPercent: 20, downloaded: true },
      { id: "apple-10", discountPercent: 10, downloaded: false },
    ],
  },
  {
    id: "snack",
    name: "오레오 씬즈 티라미수 84g x 6개",
    image: require("@/assets/images/product/snack.png"),
    discountPercent: 35,
    price: 1980,
    category: "스낵/캔디 · 과자",
    originalPrice: 3050,
    couponPrice: 1980,
    stockCount: 56,
    availableCoupons: [
      { id: "snack-15", discountPercent: 15, downloaded: false },
    ],
  },
  {
    id: "coffee",
    name: "카누 미니 디카페인 30T",
    image: require("@/assets/images/product/coffee.png"),
    discountPercent: 10,
    price: 10000,
    category: "음료 · 커피/차",
    originalPrice: 11100,
    couponPrice: 10000,
    stockCount: 12,
    availableCoupons: [
      { id: "coffee-10", discountPercent: 10, downloaded: false },
      { id: "coffee-5", discountPercent: 5, downloaded: true },
    ],
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
