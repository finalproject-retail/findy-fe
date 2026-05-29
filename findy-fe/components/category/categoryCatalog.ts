/** shopping-service ProductCategoryCatalog 와 동일한 경로·ID */

export type CategorySub = {
  categoryId: number;
  label: string;
};

export type CategoryMiddle = {
  key: string;
  label: string;
  emoji: string;
  subs: CategorySub[];
};

export type CategoryTop = {
  key: string;
  label: string;
  middles: CategoryMiddle[];
};

const RAW_CATEGORIES: { categoryId: number; path: string }[] = [
  { categoryId: 1, path: "신선 식품 > 농산 > 과일" },
  { categoryId: 2, path: "신선 식품 > 농산 > 채소/샐러드" },
  { categoryId: 3, path: "신선 식품 > 농산 > 견과류" },
  { categoryId: 4, path: "신선 식품 > 축산 > 소고기" },
  { categoryId: 5, path: "신선 식품 > 축산 > 돼지고기" },
  { categoryId: 6, path: "신선 식품 > 축산 > 닭고기" },
  { categoryId: 7, path: "신선 식품 > 수산 > 회/초밥" },
  { categoryId: 8, path: "신선 식품 > 수산 > 수산물" },
  { categoryId: 9, path: "신선 식품 > 수산 > 건어물" },
  { categoryId: 10, path: "신선 식품 > 유제품/냉장 > 우유/요거트" },
  { categoryId: 11, path: "신선 식품 > 유제품/냉장 > 치즈/버터" },
  { categoryId: 12, path: "신선 식품 > 유제품/냉장 > 햄/소시지" },
  { categoryId: 13, path: "신선 식품 > 유제품/냉장 > 밀키트" },
  { categoryId: 14, path: "가공/냉동 식품 > 냉동 > 만두/피자" },
  { categoryId: 15, path: "가공/냉동 식품 > 냉동 > 간편식" },
  { categoryId: 16, path: "가공/냉동 식품 > 냉동 > 냉동 과일/디저트" },
  { categoryId: 17, path: "가공/냉동 식품 > 면/통조림 > 라면" },
  { categoryId: 18, path: "가공/냉동 식품 > 면/통조림 > 즉석밥" },
  { categoryId: 19, path: "가공/냉동 식품 > 면/통조림 > 통조림" },
  { categoryId: 20, path: "가공/냉동 식품 > 스낵/캔디 > 과자" },
  { categoryId: 21, path: "가공/냉동 식품 > 스낵/캔디 > 초콜릿/젤리" },
  { categoryId: 22, path: "가공/냉동 식품 > 스낵/캔디 > 시리얼" },
  { categoryId: 23, path: "베이커리/델리 > 베이커리 > 빵/베이글" },
  { categoryId: 24, path: "베이커리/델리 > 베이커리 > 케이크" },
  { categoryId: 25, path: "베이커리/델리 > 베이커리 > 쿠키" },
  { categoryId: 26, path: "베이커리/델리 > 델리 > 치킨" },
  { categoryId: 27, path: "베이커리/델리 > 델리 > 꼬치류" },
  { categoryId: 28, path: "베이커리/델리 > 델리 > 일품요리" },
  { categoryId: 29, path: "음료/주류 > 음료 > 생수/탄산수" },
  { categoryId: 30, path: "음료/주류 > 음료 > 탄산음료" },
  { categoryId: 31, path: "음료/주류 > 음료 > 커피/차" },
  { categoryId: 32, path: "음료/주류 > 주류 > 와인/양주" },
  { categoryId: 33, path: "음료/주류 > 주류 > 맥주" },
  { categoryId: 34, path: "음료/주류 > 주류 > 전통주" },
  { categoryId: 35, path: "라이프 스타일 > 주방/생활 > 세제/섬유유연제" },
  { categoryId: 36, path: "라이프 스타일 > 주방/생활 > 일회용품" },
  { categoryId: 37, path: "라이프 스타일 > 주방/생활 > 주방용품" },
  { categoryId: 38, path: "라이프 스타일 > 가전/IT > 대형 가전" },
  { categoryId: 39, path: "라이프 스타일 > 가전/IT > 디지털 기기" },
  { categoryId: 40, path: "라이프 스타일 > 가전/IT > 소형 전자제품" },
  { categoryId: 41, path: "라이프 스타일 > 의류/잡화 > 의류" },
  { categoryId: 42, path: "라이프 스타일 > 의류/잡화 > 디지털 기기" },
  { categoryId: 43, path: "라이프 스타일 > 의류/잡화 > 신발/가방" },
  { categoryId: 44, path: "라이프 스타일 > 홈케어/캠핑 > 가구/침구" },
  { categoryId: 45, path: "라이프 스타일 > 홈케어/캠핑 > 캠핑/아웃도어 용품" },
  { categoryId: 46, path: "라이프 스타일 > 홈케어/캠핑 > 차량 용품" },
];

const MIDDLE_EMOJI: Record<string, string> = {
  농산: "🥗",
  축산: "🥩",
  수산: "🦀",
  "유제품/냉장": "🧀",
  냉동: "🥟",
  "면/통조림": "🍜",
  "스낵/캔디": "🍫",
  베이커리: "🍞",
  델리: "🍱",
  음료: "🍹",
  주류: "🍺",
  "주방/생활": "🫧",
  "가전/IT": "🖥️",
  "의류/잡화": "👕",
  "홈케어/캠핑": "🏕️",
};

function slugify(value: string) {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/\//g, "-")
    .replace(/[^a-zA-Z0-9가-힣-]/g, "");
}

function buildCategoryTree(): CategoryTop[] {
  const topMap = new Map<string, CategoryTop>();

  for (const entry of RAW_CATEGORIES) {
    const [topLabel, middleLabel, subLabel] = entry.path
      .split(">")
      .map((part) => part.trim());
    if (!topLabel || !middleLabel || !subLabel) {
      continue;
    }

    const topKey = slugify(topLabel);
    let top = topMap.get(topKey);
    if (!top) {
      top = { key: topKey, label: topLabel, middles: [] };
      topMap.set(topKey, top);
    }

    const middleKey = `${topKey}__${slugify(middleLabel)}`;
    let middle = top.middles.find((item) => item.key === middleKey);
    if (!middle) {
      middle = {
        key: middleKey,
        label: middleLabel,
        emoji: MIDDLE_EMOJI[middleLabel] ?? "📦",
        subs: [],
      };
      top.middles.push(middle);
    }

    middle.subs.push({
      categoryId: entry.categoryId,
      label: subLabel,
    });
  }

  return Array.from(topMap.values());
}

export const CATEGORY_TREE = buildCategoryTree();

export function findMiddleByKey(middleKey: string): CategoryMiddle | undefined {
  for (const top of CATEGORY_TREE) {
    const middle = top.middles.find((item) => item.key === middleKey);
    if (middle) {
      return middle;
    }
  }
  return undefined;
}

export function findSubCategory(categoryId: number): {
  top: CategoryTop;
  middle: CategoryMiddle;
  sub: CategorySub;
} | null {
  for (const top of CATEGORY_TREE) {
    for (const middle of top.middles) {
      const sub = middle.subs.find((item) => item.categoryId === categoryId);
      if (sub) {
        return { top, middle, sub };
      }
    }
  }
  return null;
}

export function resolveCategoryIdParam(
  value: string | string[] | undefined,
): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}
