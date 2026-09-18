import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";

export interface CartItem {
  id: string;
  slug: string | null;
  name: string;
  brand: string | null;
  catalogNumber: string | null;
  packSize: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = "evolve.cart";
const API_URL =
  (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore write failures
  }
}

function mapApiItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.id,
    slug: item.slug ?? null,
    name: item.name,
    brand: item.brand ?? null,
    catalogNumber: item.catalogNumber ?? null,
    packSize: item.packSize ?? null,
    price: Number(item.price) || 0,
    currency: item.currency || "INR",
    imageUrl: item.imageUrl ?? null,
    quantity: item.quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const itemsRef = useRef<CartItem[]>([]);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  itemsRef.current = items;

  // Guest localStorage persist
  useEffect(() => {
    if (!ready || authLoading || user) return;
    saveGuestCart(items);
  }, [items, ready, authLoading, user]);

  // Hydrate / sync when auth changes
  useEffect(() => {
    if (authLoading) return;

    const userId = user?.id ?? null;
    const prevUserId = prevUserIdRef.current;
    let cancelled = false;

    async function sync() {
      // Initial load
      if (prevUserId === undefined) {
        if (userId) {
          const guest = loadGuestCart();
          if (guest.length > 0) {
            await fetch(`${API_URL}/cart/merge`, {
              method: "POST",
              headers: authHeaders(),
              body: JSON.stringify({
                items: guest.map((i) => ({ productId: i.id, quantity: i.quantity })),
              }),
            }).catch(() => null);
            saveGuestCart([]);
          }

          const res = await fetch(`${API_URL}/cart`, { headers: authHeaders() }).catch(() => null);
          if (!cancelled && res?.ok) {
            const cart = await res.json();
            setItems(mapApiItems(cart.items ?? []));
          } else if (!cancelled) {
            setItems([]);
          }
        } else if (!cancelled) {
          setItems(loadGuestCart());
        }

        prevUserIdRef.current = userId;
        if (!cancelled) setReady(true);
        return;
      }

      if (prevUserId === userId) return;

      // Guest → signed in: merge guest into backend cart
      if (userId && !prevUserId) {
        const guest = itemsRef.current;
        if (guest.length > 0) {
          await fetch(`${API_URL}/cart/merge`, {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({
              items: guest.map((i) => ({ productId: i.id, quantity: i.quantity })),
            }),
          }).catch(() => null);
          saveGuestCart([]);
        }

        const res = await fetch(`${API_URL}/cart`, { headers: authHeaders() }).catch(() => null);
        if (!cancelled && res?.ok) {
          const cart = await res.json();
          setItems(mapApiItems(cart.items ?? []));
        }
      }
      // Signed in → signed out
      else if (!userId && prevUserId) {
        if (!cancelled) setItems(loadGuestCart());
      }
      // Account switch
      else if (userId && prevUserId) {
        const res = await fetch(`${API_URL}/cart`, { headers: authHeaders() }).catch(() => null);
        if (!cancelled && res?.ok) {
          const cart = await res.json();
          setItems(mapApiItems(cart.items ?? []));
        } else if (!cancelled) {
          setItems([]);
        }
      }

      prevUserIdRef.current = userId;
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
          );
        }
        return [...prev, { ...item, quantity }];
      });

      if (!user) return;

      void (async () => {
        const res = await fetch(`${API_URL}/cart/items`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ productId: item.id, quantity }),
        }).catch(() => null);

        if (res?.ok) {
          const cart = await res.json();
          setItems(mapApiItems(cart.items ?? []));
        }
      })();
    },
    [user],
  );

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));

      if (!user) return;

      void (async () => {
        const res = await fetch(`${API_URL}/cart/items/${id}`, {
          method: "DELETE",
          headers: authHeaders(),
        }).catch(() => null);

        if (res?.ok) {
          const cart = await res.json();
          setItems(mapApiItems(cart.items ?? []));
        }
      })();
    },
    [user],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
      );

      if (!user) return;

      void (async () => {
        const res = await fetch(`${API_URL}/cart/items/${id}`, {
          method: "PATCH",
          headers: authHeaders(),
          body: JSON.stringify({ quantity }),
        }).catch(() => null);

        if (res?.ok) {
          const cart = await res.json();
          setItems(mapApiItems(cart.items ?? []));
        }
      })();
    },
    [user],
  );

  const clearCart = useCallback(() => {
    setItems([]);

    if (!user) {
      saveGuestCart([]);
      return;
    }

    void fetch(`${API_URL}/cart`, {
      method: "DELETE",
      headers: authHeaders(),
    }).catch(() => null);
  }, [user]);

  const { itemCount, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.itemCount += i.quantity;
        acc.subtotal += i.price * i.quantity;
        return acc;
      },
      { itemCount: 0, subtotal: 0 },
    );
  }, [items]);

  const value = useMemo(
    () => ({ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }),
    [items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
