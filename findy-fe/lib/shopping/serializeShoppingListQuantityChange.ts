const inFlightByProductId = new Map<string, Promise<unknown>>();

/** 같은 상품 수량 변경 요청이 겹치지 않도록 직렬화합니다. */
export async function runSerializedShoppingListQuantityChange<T>(
  productId: string | number,
  task: () => Promise<T>,
): Promise<T> {
  const key = String(productId);
  const previous = inFlightByProductId.get(key) ?? Promise.resolve();
  const current = previous
    .catch(() => undefined)
    .then(() => task());
  inFlightByProductId.set(key, current);

  try {
    return await current;
  } finally {
    if (inFlightByProductId.get(key) === current) {
      inFlightByProductId.delete(key);
    }
  }
}
