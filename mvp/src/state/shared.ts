import { createAction } from "@reduxjs/toolkit";
import type { Cart, Checkout, Order, Product, Session } from "../domain";
import { readInitialShop, readTab } from "../storage";

export const initialShop = readInitialShop();
export const initialTab = readTab(initialShop.inventory);
export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
export const loadShop = createAction<typeof initialShop>("shop/loaded");
export const switchSession = createAction<Session>("session/switched");

export interface CatalogState {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  demoEmpty?: boolean;
}

export interface OrdersState {
  items: Order[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  confirmation: string | null;
  requestId?: string;
}

export interface RootState {
  inventory: Product[];
  session: Session;
  cart: Cart;
  catalog: CatalogState;
  orders: OrdersState;
  draft: Checkout;
}

export type ThunkConfig = { state: RootState; rejectValue: string };

export function tabState(state: RootState) {
  return {
    cart: state.cart,
    draft: state.draft,
    session: state.session,
    confirmation: state.orders.confirmation,
  };
}
