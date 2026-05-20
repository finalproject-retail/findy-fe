import type { ImageSourcePropType } from "react-native";

export type Product = {
  id: string;
  name: string;
  image: ImageSourcePropType;
  discountPercent: number;
  price: number;
};
