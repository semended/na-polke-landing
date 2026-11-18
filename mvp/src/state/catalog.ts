import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { Product } from "../domain";
import { isProduct, readProduct, readShop, writeProduct } from "../storage";
import { delay, initialShop, loadShop } from "./shared";
import type { CatalogState, RootState, ThunkConfig } from "./shared";

const publicProducts = (inventory: Product[]) =>
  inventory.filter((product) => !product.archived);
export const selectPublicProducts = createSelector(
  (state: RootState) => state.inventory,
  publicProducts,
);

export const fetchProducts = createAsyncThunk<
  Product[],
  { mode?: string },
  ThunkConfig
>("catalog/fetch", async ({ mode }, { getState }) => {
  await delay(350);
  if (mode === "error")
    throw new Error("Не удалось загрузить товары. Попробуйте ещё раз.");
  return mode === "empty" ? [] : selectPublicProducts(getState());
});

type ProductEdit = { original?: Product; updated: Product };

export const saveProduct = createAsyncThunk<Product, ProductEdit, ThunkConfig>(
  "inventory/save",
  async ({ original, updated }, { dispatch, getState, rejectWithValue }) => {
    if (!isProduct(updated) || (original && original.id !== updated.id))
      return rejectWithValue("Проверьте название, цену и параметры товара.");
    if (!navigator.locks)
      return rejectWithValue(
        "Для сохранения товаров откройте HTTPS-версию сайта в современном браузере.",
      );
    try {
      // Serialize the comparison and write when two tabs save the same item at once.
      return await navigator.locks.request(
        "na-polke:product:" + updated.id,
        () => {
          if (getState().session !== "staff")
            return rejectWithValue("Изменять товары может только сотрудник.");
          if (
            JSON.stringify(readProduct(updated.id)) !== JSON.stringify(original)
          ) {
            dispatch(loadShop(readShop()));
            return rejectWithValue(
              "Карточка изменилась в другой вкладке. Нажмите «Отмена» и снова откройте товар, чтобы внести изменения в актуальную версию.",
            );
          }
          writeProduct(updated);
          return updated;
        },
      );
    } catch {
      return rejectWithValue(
        "Браузер не сохранил товар. Разрешите запись и повторите попытку.",
      );
    }
  },
);

function upsertProduct(inventory: Product[], product: Product) {
  const index = inventory.findIndex((item) => item.id === product.id);
  if (index === -1) inventory.push(product);
  else inventory[index] = product;
}

const inventorySlice = createSlice({
  name: "inventory",
  initialState: initialShop.inventory,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(saveProduct.fulfilled, (state, action) =>
        upsertProduct(state, action.payload),
      )
      .addCase(loadShop, (_, action) => action.payload.inventory),
});

const catalogSlice = createSlice({
  name: "catalog",
  initialState: { items: [], status: "idle", error: null } as CatalogState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        if (action.meta.arg.mode === "empty") state.demoEmpty = true;
        else delete state.demoEmpty;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Не удалось загрузить товары.";
      })
      .addCase(loadShop, (state, action) => {
        if (state.status === "succeeded" && !state.demoEmpty)
          state.items = publicProducts(action.payload.inventory);
      })
      .addCase(saveProduct.fulfilled, (state, action) => {
        if (state.status !== "succeeded" || state.demoEmpty) return;
        upsertProduct(state.items, action.payload);
        state.items = publicProducts(state.items);
      }),
});

export const catalogReducer = catalogSlice.reducer;
export const inventoryReducer = inventorySlice.reducer;
