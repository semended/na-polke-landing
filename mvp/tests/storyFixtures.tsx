import { configureStore } from "@reduxjs/toolkit";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { products } from "../src/products";
import type { RootState } from "../src/store";

export function ShopFixture({
  children,
  overrides,
}: PropsWithChildren<{ overrides?: Partial<RootState> }>) {
  const state: RootState = {
    inventory: products,
    cart: {},
    draft: { name: "", phone: "", comment: "" },
    session: "guest",
    catalog: { items: [], status: "idle", error: null },
    orders: { items: [], status: "idle", error: null, confirmation: null },
    ...overrides,
  };
  const store = configureStore({ reducer: () => state });
  return <Provider store={store}>{children}</Provider>;
}
