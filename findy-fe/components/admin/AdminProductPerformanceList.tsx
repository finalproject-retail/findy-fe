import RightArrowIcon from "@/assets/icons/right-arrow-icon.svg";
import SearchIcon from "@/assets/icons/search-icon.svg";
import { ADMIN_COLORS } from "@/constants/adminTheme";
import {
  ADMIN_PRODUCT_CATEGORY_FILTERS,
  formatAdminMetricNumber,
  type AdminProductCategoryFilter,
  type AdminProductPerformance,
} from "@/lib/admin/mockProductPerformanceData";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type AdminProductPerformanceListProps = {
  products: AdminProductPerformance[];
  stretch?: boolean;
};

const MOBILE_THUMB_SIZE = 64;
const TABLE_THUMB_SIZE = 36;

function CategoryFilterTabs({
  value,
  onChange,
  stretch = false,
}: {
  value: AdminProductCategoryFilter;
  onChange: (next: AdminProductCategoryFilter) => void;
  stretch?: boolean;
}) {
  const tabs = ADMIN_PRODUCT_CATEGORY_FILTERS.map((filter) => {
    const active = value === filter.key;

    return (
      <Pressable
        key={filter.key}
        onPress={() => onChange(filter.key)}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        style={{
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: active ? ADMIN_COLORS.navActive : ADMIN_COLORS.border,
          backgroundColor: active ? ADMIN_COLORS.navActive : ADMIN_COLORS.cardBg,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            ...pretendard(active ? 600 : 500),
            fontSize: 13,
            lineHeight: 18,
            textAlign: "center",
            color: active ? "#FFFFFF" : ADMIN_COLORS.navy,
            includeFontPadding: false,
          }}
        >
          {filter.label}
        </Text>
      </Pressable>
    );
  });

  if (stretch) {
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          paddingVertical: 2,
        }}
      >
        {tabs}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 2,
      }}
    >
      {tabs}
    </ScrollView>
  );
}

function ProductSearchBar({
  value,
  onChangeText,
  stretch = false,
}: {
  value: string;
  onChangeText: (text: string) => void;
  stretch?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: stretch ? ADMIN_COLORS.cardBg : ADMIN_COLORS.dateBarBg,
        borderRadius: 999,
        borderWidth: stretch ? 1 : 0,
        borderColor: ADMIN_COLORS.border,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === "web" ? 12 : 14,
      }}
    >
      <SearchIcon width={18} height={18} color={ADMIN_COLORS.navyMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="상품명 또는 ID로 검색"
        placeholderTextColor={ADMIN_COLORS.navyMuted}
        style={{
          flex: 1,
          minWidth: 0,
          padding: 0,
          margin: 0,
          fontSize: 14,
          color: ADMIN_COLORS.navy,
          ...pretendard(400),
        }}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

function ProductThumbnail({
  image,
  size,
}: {
  image: AdminProductPerformance["image"];
  size: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: ADMIN_COLORS.statCardBg,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={image}
        style={{ width: size, height: size }}
        contentFit="contain"
      />
    </View>
  );
}

function ProductIdentity({
  product,
  imageSize,
}: {
  product: AdminProductPerformance;
  imageSize: number;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
      <ProductThumbnail image={product.image} size={imageSize} />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text
          numberOfLines={1}
          style={{ ...pretendard(600), fontSize: 14, color: ADMIN_COLORS.navy }}
        >
          {product.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ ...pretendard(400), fontSize: 12, color: ADMIN_COLORS.navyMuted }}
        >
          (상품 ID: {product.productId})
        </Text>
      </View>
    </View>
  );
}

function ProductPerformanceMobileRow({
  product,
  isLast,
  onPress,
}: {
  product: AdminProductPerformance;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: ADMIN_COLORS.border,
      }}
    >
      <ProductThumbnail image={product.image} size={MOBILE_THUMB_SIZE} />

      <View style={{ flex: 1, minWidth: 0, gap: 6, paddingRight: 4 }}>
        <Text
          numberOfLines={1}
          style={{ ...pretendard(600), fontSize: 14, lineHeight: 20, color: ADMIN_COLORS.navy }}
        >
          {product.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ ...pretendard(400), fontSize: 11, lineHeight: 16, color: ADMIN_COLORS.navyMuted }}
        >
          (상품 ID: {product.productId})
        </Text>
        <Text
          numberOfLines={1}
          style={{ ...pretendard(500), fontSize: 12, lineHeight: 17, color: ADMIN_COLORS.navyLight }}
        >
          조회수: {formatAdminMetricNumber(product.views)} | 구매 전환율: {product.conversionRate}%
        </Text>
      </View>

      <View style={{ flexShrink: 0, paddingLeft: 2 }}>
        <RightArrowIcon width={8} height={16} color="#C5CEDB" />
      </View>
    </Pressable>
  );
}

const TABLE_HEADERS = ["상품명", "조회수", "구매 전환율"] as const;

function tableColumnStyle(header: (typeof TABLE_HEADERS)[number], stretch: boolean) {
  if (stretch) {
    switch (header) {
      case "상품명":
        return { flex: 3 };
      case "조회수":
      case "구매 전환율":
        return { flex: 1 };
    }
  }

  return {
    width: header === "상품명" ? 280 : 120,
  };
}

function ProductPerformanceTableHeader({ stretch }: { stretch: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: ADMIN_COLORS.statCardBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ADMIN_COLORS.border,
      }}
    >
      {TABLE_HEADERS.map((header) => (
        <Text
          key={header}
          style={{
            ...tableColumnStyle(header, stretch),
            ...pretendard(600),
            fontSize: 12,
            color: ADMIN_COLORS.navyMuted,
            textAlign: header === "상품명" ? "left" : "center",
          }}
        >
          {header}
        </Text>
      ))}
    </View>
  );
}

function ProductPerformanceTableRow({
  product,
  stretch,
  onPress,
}: {
  product: AdminProductPerformance;
  stretch: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ADMIN_COLORS.border,
        minHeight: 72,
      }}
    >
      <View style={{ ...tableColumnStyle("상품명", stretch) }}>
        <ProductIdentity product={product} imageSize={TABLE_THUMB_SIZE} />
      </View>

      <Text
        style={{
          ...tableColumnStyle("조회수", stretch),
          textAlign: "center",
          ...pretendard(700),
          fontSize: 14,
          color: ADMIN_COLORS.navy,
        }}
      >
        {formatAdminMetricNumber(product.views)}
      </Text>

      <Text
        style={{
          ...tableColumnStyle("구매 전환율", stretch),
          textAlign: "center",
          ...pretendard(700),
          fontSize: 14,
          color: ADMIN_COLORS.navy,
        }}
      >
        {product.conversionRate}%
      </Text>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View style={{ paddingVertical: 48, alignItems: "center" }}>
      <Text style={{ ...pretendard(500), fontSize: 14, color: ADMIN_COLORS.navyMuted }}>
        검색 결과가 없습니다.
      </Text>
    </View>
  );
}

export function AdminProductPerformanceList({
  products,
  stretch = false,
}: AdminProductPerformanceListProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AdminProductCategoryFilter>("fresh");

  const openProductDetail = (productId: string) => {
    router.push({
      pathname: "/(admin)/products/[id]",
      params: { id: productId },
    } as Href);
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      if (!matchesCategory) return false;
      if (!normalizedQuery) return true;

      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.productId.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, query, category]);

  return (
    <View style={{ gap: stretch ? 16 : 20 }}>
      <Text
        style={{
          ...pretendard(700),
          fontSize: stretch ? 22 : 20,
          color: ADMIN_COLORS.navy,
          textAlign: stretch ? "left" : "center",
        }}
      >
        상품 목록
      </Text>

      <ProductSearchBar value={query} onChangeText={setQuery} stretch={stretch} />
      <CategoryFilterTabs value={category} onChange={setCategory} stretch={stretch} />

      {stretch ? (
        <View
          style={{
            backgroundColor: ADMIN_COLORS.cardBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: ADMIN_COLORS.border,
            overflow: "hidden",
          }}
        >
          <ProductPerformanceTableHeader stretch />
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductPerformanceTableRow
                key={product.productId}
                product={product}
                stretch
                onPress={() => openProductDetail(product.productId)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </View>
      ) : (
        <View style={{ backgroundColor: ADMIN_COLORS.cardBg }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductPerformanceMobileRow
                key={product.productId}
                product={product}
                isLast={index === filteredProducts.length - 1}
                onPress={() => openProductDetail(product.productId)}
              />
            ))
          ) : (
            <EmptyState />
          )}
        </View>
      )}
    </View>
  );
}
