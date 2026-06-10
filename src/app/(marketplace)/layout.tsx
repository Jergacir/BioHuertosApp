import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
