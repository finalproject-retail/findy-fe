import type { Product } from "@/components/product";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type CartLineItem = {
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
};

type CartContextValue = {
  items: CartLineItem[];
  availableItems: CartLineItem[];
  soldOutItems: CartLineItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  removeFromCartMany: (productIds: string[]) => void;
  setQuantity: (productId: string, quantity: number) => void;
  toggleSelect: (productId: string) => void;
  toggleSelectAll: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isAvailable(product: Product) {
  return (product.stockCount ?? 1) > 0;
}

function maxQuantityFor(product: Product) {
  const stock = product.stockCount ?? 99;
  return Math.max(stock, 1);
}

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartLineItem[]>([]);

  const { availableItems, soldOutItems } = useMemo(() => {
    const available: CartLineItem[] = [];
    const soldOut: CartLineItem[] = [];
    for (const item of items) {
      if (isAvailable(item.product)) {
        available.push(item);
      } else {
        soldOut.push({ ...item, selected: false });
      }
    }
    return { availableItems: available, soldOutItems: soldOut };
  }, [items]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      const maxQty = maxQuantityFor(product);

      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                product,
                quantity: Math.min(item.quantity + quantity, maxQty),
                selected: isAvailable(product) ? item.selected : false,
              }
            : item,
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity: Math.min(Math.max(quantity, 1), maxQty),
          selected: isAvailable(product),
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const removeFromCartMany = useCallback((productIds: string[]) => {
    if (productIds.length === 0) return;
    const idSet = new Set(productIds);
    setItems((prev) => prev.filter((item) => !idSet.has(item.productId)));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) return item;
        const maxQty = maxQuantityFor(item.product);
        const nextQty = Math.min(Math.max(quantity, 1), maxQty);
        return { ...item, quantity: nextQty };
      }),
    );
  }, []);

  const toggleSelect = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId && isAvailable(item.product)
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    setItems((prev) => {
      const selectable = prev.filter((item) => isAvailable(item.product));
      if (selectable.length === 0) return prev;

      const allSelected = selectable.every((item) => item.selected);
      return prev.map((item) =>
        isAvailable(item.product)
          ? { ...item, selected: !allSelected }
          : item,
      );
    });
  }, []);

  const value = useMemo(
    () => ({
      items,
      availableItems,
      soldOutItems,
      addToCart,
      removeFromCart,
      removeFromCartMany,
      setQuantity,
      toggleSelect,
      toggleSelectAll,
    }),
    [
      items,
      availableItems,
      soldOutItems,
      addToCart,
      removeFromCart,
      removeFromCartMany,
      setQuantity,
      toggleSelect,
      toggleSelectAll,
    ],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
