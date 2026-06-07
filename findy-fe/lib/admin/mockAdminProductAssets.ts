import type { ImageSourcePropType } from "react-native";

export const MOCK_ADMIN_PRODUCT_NAMES = [
  "[농심] 사리곰탕 소컵 6입",
  "[오뚜기] 진라면 순한맛 5입",
  "[삼양] 불닭볶음면 4입",
  "[CJ] 햇반 210g 12입",
  "[서울] 우유 1L",
  "[동원] 참치캔 4입",
  "[롯데] 제크 80g",
  "[해태] 허니버터칩",
  "[농심] 신라면 5입",
  "[오뚜기] 스낵면 5입",
  "[풀무원] 두부 300g",
  "[매일] 바른목장 요구르트",
  "[롯데] 가나 초콜릿",
  "[농심] 너구리 5입",
  "[삼립] 호빵 4입",
  "[CJ] 비비고 만두",
  "[동원] 양반김 10봉",
  "[오리온] 초코파이 12입",
  "[롯데] 칸cho 72g",
  "[빙그레] 바나나맛우유",
  "[파리바게뜨] 소금빵 4입",
  "[CU] 불고기김밥",
  "[코카콜라] 제로 1.5L",
  "[하이네켄] 생맥주 500ml",
  "[다이소] 주방세제 1L",
] as const;

const MOCK_ADMIN_PRODUCT_IMAGES: ImageSourcePropType[] = [
  require("@/assets/images/product/noodle2.png"),
  require("@/assets/images/product/noodle.png"),
  require("@/assets/images/product/noodle.png"),
  require("@/assets/images/product/mara.png"),
  require("@/assets/images/product/milk2.png"),
  require("@/assets/images/product/beef.png"),
  require("@/assets/images/product/snack.png"),
  require("@/assets/images/product/snack.png"),
  require("@/assets/images/product/noodle.png"),
  require("@/assets/images/product/noodle.png"),
  require("@/assets/images/product/tofu.png"),
  require("@/assets/images/product/milk.png"),
  require("@/assets/images/product/snack.png"),
  require("@/assets/images/product/noodle.png"),
  require("@/assets/images/product/mara.png"),
  require("@/assets/images/product/mara.png"),
  require("@/assets/images/product/beef.png"),
  require("@/assets/images/product/snack.png"),
  require("@/assets/images/product/snack.png"),
  require("@/assets/images/product/milk.png"),
  require("@/assets/images/product/apple.png"),
  require("@/assets/images/product/mara.png"),
  require("@/assets/images/product/green-tea.png"),
  require("@/assets/images/product/green-tea.png"),
  require("@/assets/images/product/coffee.png"),
];

export function getAdminProductName(index: number) {
  return MOCK_ADMIN_PRODUCT_NAMES[index % MOCK_ADMIN_PRODUCT_NAMES.length]!;
}

export function getAdminProductImage(index: number): ImageSourcePropType {
  return MOCK_ADMIN_PRODUCT_IMAGES[index % MOCK_ADMIN_PRODUCT_IMAGES.length]!;
}
