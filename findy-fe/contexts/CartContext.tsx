import type { Product } from "@/components/product";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  addCartItem,
  changeCartItemChecked,
  changeCartItemQuantity,
  getCart,
  removeCartItem,
} from "@/lib/shopping/api";
import { mapCartApiToLineItems } from "@/lib/shopping/mappers";
import { useEffect } from "react";

export type CartLineItem = {
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
  cartItemId?: string;
  shoppingListItemId?: string;
  scannedQuantity?: number;
  scanStatus?: string;
};

type CartContextValue = {
  items: CartLineItem[];
  availableItems: CartLineItem[];
  soldOutItems: CartLineItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  removeFromCartMany: (productIds: string[]) => void;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleSelect: (productId: string) => Promise<void>;
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

  useEffect(() => {
    getCart()
      .then((cart) => {
        setItems(mapCartApiToLineItems(cart));
      })
      .catch(console.error);
  }, []);

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

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const cart = await addCartItem(product.id, quantity);
    setItems(mapCartApiToLineItems(cart));
  }, []);

  const removeFromCart = useCallback(async (productId: string) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId) return;

    const cart = await removeCartItem(target.cartItemId);
    setItems(mapCartApiToLineItems(cart));
  }, [items]);

  const removeFromCartMany = useCallback((productIds: string[]) => {
    if (productIds.length === 0) return;
    const idSet = new Set(productIds);
    setItems((prev) => prev.filter((item) => !idSet.has(item.productId)));
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId) return;

    const maxQty = maxQuantityFor(target.product);
    const nextQty = Math.min(Math.max(quantity, 1), maxQty);

    const cart = await changeCartItemQuantity(target.cartItemId, nextQty);
    setItems(mapCartApiToLineItems(cart));
  }, [items]);

  const toggleSelect = useCallback(async (productId: string) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId || !isAvailable(target.product)) return;

    const cart = await changeCartItemChecked(target.cartItemId, !target.selected);
    setItems(mapCartApiToLineItems(cart));
  }, [items]);

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
