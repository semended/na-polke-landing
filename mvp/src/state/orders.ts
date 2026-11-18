import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import {
  canBuy,
  cartTotal,
  normalizePhone,
  validateCheckout,
  type Order,
  type Checkout,
} from "../domain";
import { emptyDraft, readShop, writeOrder, writeTab } from "../storage";
import {
  delay,
  initialShop,
  initialTab,
  loadShop,
  switchSession,
  tabState,
} from "./shared";
import type { OrdersState, RootState, ThunkConfig } from "./shared";

export const submitOrder = createAsyncThunk<Order, Checkout, ThunkConfig>(
  "orders/submit",
  async (input, { getState, dispatch, rejectWithValue, requestId }) => {
    const before = getState();
    if (Object.keys(validateCheckout(input)).length)
      return rejectWithValue("Проверьте контактные данные.");
    if (!Object.keys(before.cart).length)
      return rejectWithValue("В корзине пока нет товаров.");
    await delay(450);
    const state = getState();
    if (state.orders.requestId !== requestId || before.cart !== state.cart) {
      return rejectWithValue(
        "Корзина изменилась. Проверьте товары и повторите оформление.",
      );
    }

    // Another tab may have updated the shop before its storage event reached this tab.
    let shop: ReturnType<typeof readShop>;
    try {
      shop = readShop();
    } catch {
      return rejectWithValue(
        "Не удалось проверить каталог. Разрешите чтение данных и повторите оформление.",
      );
    }
    dispatch(loadShop(shop));
    const items: Order["items"] = [];
    for (const [id, quantity] of Object.entries(state.cart)) {
      const product = shop.inventory.find((item) => item.id === id);
      const previousPrice = before.inventory.find(
        (item) => item.id === id,
      )?.price;
      if (!product || !canBuy(product) || product.price !== previousPrice) {
        return rejectWithValue(
          "Цена или наличие изменились. Проверьте корзину перед повторной отправкой.",
        );
      }
      items.push({ product, quantity });
    }
    const total = cartTotal(state.cart, shop.inventory);
    if (!Number.isSafeInteger(total))
      return rejectWithValue(
        "Сумма заказа слишком велика. Уменьшите количество товаров.",
      );
    const order: Order = {
      id: "IMP-" + crypto.randomUUID().slice(0, 13).toUpperCase(),
      createdAt: new Date().toISOString(),
      owner: state.session,
      customer: {
        name: input.name.trim(),
        phone: normalizePhone(input.phone),
        comment: input.comment.trim(),
      },
      items,
      total,
    };
    try {
      // Verify the tab can persist its receipt before committing the shared order.
      writeTab({
        session: state.session,
        cart: {},
        draft: emptyDraft,
        confirmation: order.id,
      });
      try {
        writeOrder(order);
      } catch (error) {
        writeTab(tabState(state));
        throw error;
      }
      return order;
    } catch {
      return rejectWithValue(
        "Не удалось сохранить заказ в браузере. Разрешите запись или освободите место и повторите попытку. Корзина сохранена на странице.",
      );
    }
  },
  { condition: (_, { getState }) => getState().orders.status !== "loading" },
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: initialShop.orders,
    confirmation: initialTab.confirmation,
    status: "idle",
    error: null,
  } as OrdersState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(loadShop, (state, action) => {
        state.items = action.payload.orders;
      })
      .addCase(switchSession, (state) => {
        state.confirmation = null;
        state.status = "idle";
        state.error = null;
        delete state.requestId;
      })
      .addCase(submitOrder.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = "idle";
        state.confirmation = action.payload.id;
        delete state.requestId;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = action.payload || "Не удалось сохранить заказ.";
        delete state.requestId;
      }),
});

export const selectVisibleOrders = createSelector(
  (state: RootState) => state.orders.items,
  (state: RootState) => state.session,
  (orders, session) => {
    if (session === "staff") return orders;
    if (session === "guest") return [];
    return orders.filter((order) => order.owner === session);
  },
);

export function selectAccessibleOrder(state: RootState, id?: string) {
  if (state.session === "guest" && id === state.orders.confirmation) {
    return state.orders.items.find(
      (order) => order.id === id && order.owner === "guest",
    );
  }
  return selectVisibleOrders(state).find((order) => order.id === id);
}

export const ordersReducer = ordersSlice.reducer;
