import type { CartZoneItem } from "@/components/category";
import type { Product } from "@/components/product";
import { useAuth } from "@/contexts/AuthContext";
import { getAccessToken } from "@/lib/api/client";
import { registerAccountCacheClearListener } from "@/lib/auth/clearAccountCache";
import { getUserIdFromAccessToken } from "@/lib/auth/getUserIdFromToken";
import {
  addCartItem,
  changeCartItemChecked,
  changeCartItemQuantity,
  getCart,
  removeCartItem,
} from "@/lib/shopping/api";
import {
  clearCartZoneItems,
  loadCartZoneItems,
  saveCartZoneItems,
} from "@/lib/shopping/cartZoneStorage";
import {
  mapCartApiToLineItems,
  mergeCartApiIntoLineItems,
} from "@/lib/shopping/mappers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

export type ShoppingLineItemType = "PRODUCT" | "CATEGORY";

export type CartLineItem = {
  itemType?: ShoppingLineItemType;
  productId: string;
  product: Product;
  quantity: number;
  selected: boolean;
  cartItemId?: string;
  shoppingListItemId?: string;
  scannedQuantity?: number;
  scanStatus?: string;
  checked?: boolean;
  category?: {
    categoryId: number;
    categoryName: string;
    gridId?: number | null;
  };
};

export type CartContextValue = {
  items: CartLineItem[];
  availableItems: CartLineItem[];
  soldOutItems: CartLineItem[];
  zoneItems: CartZoneItem[];
  cartBadgeCount: number;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  removeFromCartMany: (productIds: string[]) => void;
  refreshCart: () => Promise<void>;
  setZoneItems: (items: CartZoneItem[]) => void;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleSelect: (productId: string) => Promise<void>;
  toggleSelectAll: () => Promise<void>;
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
  const { isLoggedIn, isLoading } = useAuth();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [zoneItems, setZoneItemsState] = useState<CartZoneItem[]>([]);
  const zoneUserIdRef = useRef<string | null>(null);

  const persistZoneItems = useCallback(
    async (nextItems: CartZoneItem[], userId = zoneUserIdRef.current) => {
      setZoneItemsState(nextItems);
      if (userId) {
        await saveCartZoneItems(userId, nextItems);
      }
    },
    [],
  );

  const resetCartState = useCallback(() => {
    setItems([]);
    setZoneItemsState([]);
    const userId = zoneUserIdRef.current;
    zoneUserIdRef.current = null;
    if (userId) {
      void clearCartZoneItems(userId);
    }
  }, []);

  useEffect(
    () => registerAccountCacheClearListener(resetCartState),
    [resetCartState],
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isLoggedIn) {
      resetCartState();
      return;
    }

    const userId = getUserIdFromAccessToken(getAccessToken());
    zoneUserIdRef.current = userId;

    void (async () => {
      const [cart, storedZones] = await Promise.all([
        getCart(),
        userId ? loadCartZoneItems(userId) : Promise.resolve([]),
      ]);

      setItems(mapCartApiToLineItems(cart));
      setZoneItemsState(storedZones);
    })().catch(() => {
      resetCartState();
    });
  }, [isLoading, isLoggedIn, resetCartState]);

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

  const applyCartResponse = useCallback(
    (cart: Awaited<ReturnType<typeof getCart>>) => {
      setItems((prev) =>
        prev.length === 0
          ? mapCartApiToLineItems(cart)
          : mergeCartApiIntoLineItems(prev, cart),
      );
    },
    [],
  );

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const cart = await addCartItem(product.id, quantity);
    applyCartResponse(cart);
  }, [applyCartResponse]);

  const removeFromCart = useCallback(async (productId: string) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId) return;

    const cart = await removeCartItem(target.cartItemId);
    applyCartResponse(cart);
  }, [applyCartResponse, items]);

  const removeFromCartMany = useCallback((productIds: string[]) => {
    if (productIds.length === 0) return;
    const idSet = new Set(productIds);
    setItems((prev) => prev.filter((item) => !idSet.has(item.productId)));
  }, []);

  const refreshCart = useCallback(async () => {
    const cart = await getCart();
    applyCartResponse(cart);
  }, [applyCartResponse]);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId) return;

    const maxQty = maxQuantityFor(target.product);
    const nextQty = Math.min(Math.max(quantity, 1), maxQty);

    const cart = await changeCartItemQuantity(target.cartItemId, nextQty);
    applyCartResponse(cart);
  }, [applyCartResponse, items]);

  const toggleSelect = useCallback(async (productId: string) => {
    const target = items.find((item) => item.productId === productId);
    if (!target?.cartItemId || !isAvailable(target.product)) return;

    const cart = await changeCartItemChecked(target.cartItemId, !target.selected);
    applyCartResponse(cart);
  }, [applyCartResponse, items]);

  const toggleSelectAll = useCallback(async () => {
    const selectable = items.filter(
      (item) => isAvailable(item.product) && item.cartItemId,
    );
    if (selectable.length === 0) return;

    const allSelected = selectable.every((item) => item.selected);
    const nextChecked = !allSelected;

    try {
      let latestCart = null;
      for (const item of selectable) {
        if (item.selected === nextChecked) continue;
        latestCart = await changeCartItemChecked(item.cartItemId!, nextChecked);
      }

      if (latestCart) {
        applyCartResponse(latestCart);
        return;
      }

      const cart = await getCart();
      applyCartResponse(cart);
    } catch (error) {
      console.error(error);
      const cart = await getCart();
      applyCartResponse(cart);
    }
  }, [applyCartResponse, items]);

  const value = useMemo(
    () => ({
      items,
      availableItems,
      soldOutItems,
      zoneItems,
      cartBadgeCount: availableItems.length + zoneItems.length,
      addToCart,
      removeFromCart,
      removeFromCartMany,
      refreshCart,
      setZoneItems: persistZoneItems,
      setQuantity,
      toggleSelect,
      toggleSelectAll,
    }),
    [
      items,
      availableItems,
      soldOutItems,
      zoneItems,
      addToCart,
      removeFromCart,
      removeFromCartMany,
      refreshCart,
      persistZoneItems,
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
  return context as CartContextValue;
}
