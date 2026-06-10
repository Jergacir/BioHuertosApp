"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { buildWhatsAppUrl, formatCurrency } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;             // publicacion_cosecha.id
  titulo: string;
  nombrePlanta: string;
  biohuerto: string;      // nombre del biohuerto
  telefono: string | null;
  precioPorKg: number;
  imagenUrl: string | null;
  cantidad: number;       // kg
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "cantidad">, kg?: number) => void;
  removeItem: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  clearCart: () => void;
  buildWhatsAppMessage: () => string | null;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "bioned_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        // Validate that items have the expected shape before loading
        const valid = parsed.filter(
          (i) =>
            typeof i.id === "string" &&
            typeof i.titulo === "string" &&
            typeof i.precioPorKg === "number" &&
            typeof i.cantidad === "number"
        );
        setItems(valid);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "cantidad">, kg = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, cantidad: i.cantidad + kg } : i
          );
        }
        return [...prev, { ...item, cantidad: kg }];
      });
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateCantidad = useCallback((id: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const subtotal = items.reduce((acc, i) => acc + i.precioPorKg * i.cantidad, 0);

  // Agrupa por teléfono del productor y genera un mensaje por productor
  const buildWhatsAppMessage = useCallback((): string | null => {
    if (items.length === 0) return null;

    // Si hay un solo productor, mensaje directo
    const conTelefono = items.filter((i) => i.telefono);
    if (conTelefono.length === 0) return null;

    // Tomamos el teléfono del primer ítem (en el carrito real podrías agrupar)
    const telefono = conTelefono[0].telefono!;
    const lineas = items
      .map((i) => `• ${i.titulo} — ${i.cantidad} kg → ${formatCurrency(i.precioPorKg * i.cantidad)}`)
      .join("\n");

    return buildWhatsAppUrl(
      telefono,
      `Hola! Quiero hacer el siguiente pedido en BioNed:\n\n${lineas}\n\nTotal estimado: ${formatCurrency(subtotal)}\n\n¿Podemos coordinar la entrega?`
    );
  }, [items, subtotal]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateCantidad,
        clearCart,
        buildWhatsAppMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
