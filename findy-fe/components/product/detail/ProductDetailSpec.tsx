import { COLORS, SPACING } from "@/constants/theme";
import { pretendard } from "@/utils/pretendard";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Text,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
} from "react-native";
import type { Product, ProductSpec } from "../types";

const LABEL_WIDTH = 88;

type SpecRowProps = {
  label: string;
  value: string;
};

function SpecRow({ label, value }: SpecRowProps) {
  return (
    <View className="flex-row" style={{ gap: SPACING.sm }}>
      <Text
        className="text-md text-text-sub"
        style={{
          ...pretendard(400),
          width: LABEL_WIDTH,
        }}
      >
        {label}
      </Text>
      <Text className="flex-1 text-sm text-text-main" style={pretendard(400)}>
        {value}
      </Text>
    </View>
  );
}

type DetailSpecImageProps = {
  source: ImageSourcePropType;
  width: number;
};

function DetailSpecImage({ source, width }: DetailSpecImageProps) {
  const [height, setHeight] = useState(width * 0.75);

  return (
    <Image
      source={source}
      style={{ width, height }}
      contentFit="contain"
      onLoad={(event) => {
        const { width: imgW, height: imgH } = event.source;
        if (imgW > 0 && imgH > 0) {
          setHeight((width * imgH) / imgW);
        }
      }}
    />
  );
}

const DEFAULT_SPEC: ProductSpec = {
  packagingType: "상온 (종이포장)",
  salesUnit: "1박스",
  weightCapacity: "-",
  allergyInfo: "정보 없음",
};

type ProductDetailSpecProps = {
  product: Product;
};

export function ProductDetailSpec({ product }: ProductDetailSpecProps) {
  const { width: screenWidth } = useWindowDimensions();
  const spec = product.spec ?? DEFAULT_SPEC;
  const detailImages = product.detailImages ?? [product.image];
  const contentWidth = screenWidth - SPACING.screen * 2;

  return (
    <View
      style={{
        gap: SPACING.md,
        paddingTop: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
      }}
    >
      <Text className="text-xl text-text-main" style={pretendard(700)}>
        상품 정보
      </Text>

      <View style={{ gap: SPACING.sm }}>
        <SpecRow label="포장타입" value={spec.packagingType} />
        <SpecRow label="판매단위" value={spec.salesUnit} />
        <SpecRow label="중량/용량" value={spec.weightCapacity} />
        <View className="flex-row" style={{ gap: SPACING.sm }}>
          <Text
            className="text-md text-text-sub"
            style={{
              ...pretendard(400),
              width: LABEL_WIDTH,
            }}
          >
            알레르기 정보
          </Text>
          <View className="flex-1" style={{ gap: SPACING.xs }}>
            <Text className="text-md text-text-main" style={pretendard(400)}>
              {spec.allergyInfo}
            </Text>
            {spec.allergyNote ? (
              <Text className="text-md text-text-main" style={pretendard(400)}>
                {spec.allergyNote}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={{ gap: SPACING.sm }}>
        {detailImages.map((source, index) => (
          <DetailSpecImage
            key={`detail-${index}`}
            source={source}
            width={contentWidth}
          />
        ))}
      </View>
    </View>
  );
}
