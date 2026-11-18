import {
  combineReducers,
  configureStore,
  createSlice,
  type Middleware,
  type PayloadAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  canBuy,
  cartTotal,
  type Cart,
  type Checkout,
  type Session,
} from "./domain";
import { emptyDraft, isShopKey, readShop, writeTab } from "./storage";
import { catalogReducer, inventoryReducer } from "./state/catalog";
import { ordersReducer, submitOrder } from "./state/orders";
import {
  initialTab,
  loadShop,
  switchSession,
  tabState,
  type RootState,
} from "./state/shared";

export {
  catalogReducer,
  fetchProducts,
  saveProduct,
  selectPublicProducts,
} from "./state/catalog";
export {
  selectAccessibleOrder,
  selectVisibleOrders,
  submitOrder,
} from "./state/orders";
export { switchSession, type RootState } from "./state/shared";

const cartSlice = createSlice({
  name: "cart",
  initialState: initialTab.cart,
  reducers: {
    addItem(state, { payload: id }: PayloadAction<string>) {
      state[id] = Math.min(99, (state[id] ?? 0) + 1);
    },
    decreaseItem(state, { payload: id }: PayloadAction<string>) {
      if (state[id] > 1) state[id]--;
      else delete state[id];
    },
    removeItem(state, { payload: id }: PayloadAction<string>) {
      delete state[id];
    },
  },
  extraReducers: (builder) =>
    builder
      .addCase(switchSession, () => ({}))
      .addCase(submitOrder.fulfilled, () => ({})),
});

export const { addItem, decreaseItem, removeItem } = cartSlice.actions;

const draftSlice = createSlice({
  name: "draft",
  initialState: initialTab.draft,
  reducers: {
    updateDraft: (_, action: PayloadAction<Checkout>) => action.payload,
  },
  extraReducers: (builder) =>
    builder
      .addCase(submitOrder.fulfilled, () => emptyDraft)
      .addCase(switchSession, () => emptyDraft),
});

export const { updateDraft } = draftSlice.actions;
export const cartReducer = cartSlice.reducer;

const reducers = combineReducers({
  cart: cartReducer,
  catalog: catalogReducer,
  orders: ordersReducer,
  draft: draftSlice.reducer,
  inventory: inventoryReducer,
  session: (state: Session = initialTab.session, action: UnknownAction) =>
    switchSession.match(action) ? action.payload : state,
});

const rootReducer = (
  state: RootState | undefined,
  action: UnknownAction,
): RootState => {
  if (state && switchSession.match(action) && action.payload === state.session)
    return state;
  if (state && addItem.match(action)) {
    const product = state.inventory.find((item) => item.id === action.payload);
    if (!product || !canBuy(product)) return state;
  }
  return reducers(state, action);
};

const persistTab: Middleware<object, RootState> =
  (api) => (next) => (action) => {
    const before = api.getState();
    const result = next(action);
    const after = api.getState();
    if (
      !submitOrder.fulfilled.match(action) &&
      (before.cart !== after.cart ||
        before.draft !== after.draft ||
        before.session !== after.session)
    ) {
      try {
        writeTab(tabState(after));
      } catch {
        window.dispatchEvent(new Event("storage-unavailable"));
      }
    }
    return result;
  };

export const store = configureStore({
  reducer: rootReducer,
  middleware: (defaults) => defaults().concat(persistTab),
});
window.addEventListener("storage", (event) => {
  if (event.storageArea !== window.localStorage || !isShopKey(event.key))
    return;
  try {
    store.dispatch(loadShop(readShop()));
  } catch {
    window.dispatchEvent(new Event("storage-unavailable"));
  }
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const selectCount = (state: RootState) =>
  Object.values(state.cart).reduce((sum, count) => sum + count, 0);
export const selectTotal = (state: RootState) =>
  cartTotal(state.cart, state.inventory);

export const selectHasUnavailableItem = (state: RootState) =>
  state.inventory.some((product) => state.cart[product.id] && !canBuy(product));
