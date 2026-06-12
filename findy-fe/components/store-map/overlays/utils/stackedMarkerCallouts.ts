import type { StoreMapConfig } from "../../types";
import type { RecommendedMapItem, ShoppingMapItem } from "../types";
import type { CartLineItem } from "@/contexts/CartContext";
import type { Product } from "@/components/product";
import { itemsShareShelfGrid } from "./resolveGridMarkers";

function orderSelectedFirst<T>(
  items: T[],
  selectedId: string,
  getId: (item: T) => string,
): T[] {
  return [
    ...items.filter((item) => getId(item) === selectedId),
    ...items.filter((item) => getId(item) !== selectedId),
  ];
}

export function findColocatedTripLines(
  config: StoreMapConfig,
  selectedProductId: string,
  tripLineItems: ReadonlyArray<CartLineItem>,
  shoppingMarkerItems: ReadonlyArray<ShoppingMapItem>,
): CartLineItem[] {
  const selectedMapItem = shoppingMarkerItems.find(
    (item) => item.id === selectedProductId,
  );
  if (!selectedMapItem) {
    const selectedLine = tripLineItems.find(
      (item) => item.productId === selectedProductId,
    );
    return selectedLine ? [selectedLine] : [];
  }

  const colocated = tripLineItems.filter((line) => {
    const mapItem = shoppingMarkerItems.find(
      (item) => item.id === line.productId,
    );
    if (!mapItem) {
      return line.productId === selectedProductId;
    }
    return itemsShareShelfGrid(config, selectedMapItem, mapItem);
  });

  return orderSelectedFirst(colocated, selectedProductId, (line) => line.productId);
}

export function findColocatedRecommendedProducts(
  config: StoreMapConfig,
  selectedProductId: string,
  recommendedItems: ReadonlyArray<RecommendedMapItem>,
  recommendedProductsById: Record<string, Product>,
): Product[] {
  const selectedMapItem = recommendedItems.find(
    (item) => item.id === selectedProductId,
  );
  if (!selectedMapItem) {
    const product = recommendedProductsById[selectedProductId];
    return product ? [product] : [];
  }

  const products = recommendedItems
    .filter((item) => itemsShareShelfGrid(config, selectedMapItem, item))
    .map((item) => recommendedProductsById[item.id])
    .filter((product): product is Product => product != null);

  return orderSelectedFirst(products, selectedProductId, (product) => product.id);
}
