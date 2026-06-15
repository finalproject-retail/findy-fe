import type { MapShoppingNotification } from "@/components/map/notifications/types";
import type { Product } from "@/components/product";
import { fetchProductDetail } from "@/lib/products/api/fetchProductDetail";

const productImageCache = new Map<string, Product["image"]>();

async function resolveProductImage(
  productId: string,
): Promise<Product["image"] | null> {
  const cached = productImageCache.get(productId);
  if (cached) {
    return cached;
  }

  try {
    const detail = await fetchProductDetail(productId);
    productImageCache.set(productId, detail.image);
    return detail.image;
  } catch {
    return null;
  }
}

function isCatalogProductId(productId: string) {
  return productId.length > 0 && !productId.startsWith("notification-");
}

export async function enrichNotificationsWithProductImages(
  notifications: MapShoppingNotification[],
): Promise<MapShoppingNotification[]> {
  const uniqueProductIds = [
    ...new Set(
      notifications
        .map((notification) => notification.relatedProduct.id)
        .filter(isCatalogProductId),
    ),
  ];

  await Promise.allSettled(
    uniqueProductIds.map((productId) => resolveProductImage(productId)),
  );

  return notifications.map((notification) => {
    const image = productImageCache.get(notification.relatedProduct.id);
    if (!image) {
      return notification;
    }

    return {
      ...notification,
      relatedProduct: {
        ...notification.relatedProduct,
        image,
      },
    };
  });
}

export async function enrichNotificationProduct(
  product: Product,
): Promise<Product> {
  if (!isCatalogProductId(product.id)) {
    return product;
  }

  const image = await resolveProductImage(product.id);
  return image ? { ...product, image } : product;
}
